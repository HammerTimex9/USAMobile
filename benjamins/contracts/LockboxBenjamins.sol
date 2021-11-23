// SPDX-License-Identifier: NONE
pragma solidity ^0.8.0;  // TODO: put in fixed version for deployment

// importing interface for Aave's lending pool
import "./ILendingPool.sol";
// importing openZeppelin's SafeMath library
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// importing openZeppelin's ERC20 contract
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// importing openZeppelin's Pausable contract
import "@openzeppelin/contracts/security/Pausable.sol";
// importing openZeppelin's Ownable contract
import "@openzeppelin/contracts/access/Ownable.sol";
// importing openZeppelin's ReentrancyGuard contract
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// importing openzeppelin interface for ERC20 tokens
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

// BNJI Utility Token.
// Price is set via bonding curve vs. USDC.
// All USDC is deposited in a singular lending pool (nominaly at AAVE).
// 100% USDC is maintained against burning. (see variable reserveInUSDCin6dec, in 6 decimals format)
// Collected fees and interest are withdrawable to the owner to a set recipient address.
// Fee discounts are calculated based on BNJI balance.
// Reentrancy is protected against via OpenZeppelin's ReentrancyGuard
contract LockboxBenjamins is Ownable, ERC20, Pausable, ReentrancyGuard {
    
  ILendingPool public polygonLendingPool;     // Aave lending pool on Polygon
  IERC20 public polygonUSDC;                  // USDC crypto currency on Polygon
  IERC20 public polygonAMUSDC;                // Aave's amUSDC crypto currency on Polygon

  address public feeReceiver;                 // beneficiary address for collected fees

  uint256 public reserveInUSDCin6dec;         // end user USDC on deposit
  uint256 USDCscaleFactor =      1000000;     // 6 decimals scale of USDC crypto currency
  uint256 USDCcentsScaleFactor =   10000;     // 4 decimals scale of USDC crypto currency cents
  uint256 public blocksPerDay =        2;     // amount of blocks minted per day on polygon mainnet // TODO: change to 43200, value now is for testing
  uint8   private _decimals;                  // storing BNJI decimals, set to 0 in constructor
     
  uint256 public curveFactor =   8000000;     // Inverse slope of the bonding curve.
  uint16  public baseFeeTimes10k = 10000;     // percent * 10,000 as an integer (for ex. 1% baseFee expressed as 10000)



  struct lockbox {
    uint256 lockboxID;
    uint256 createdTimestamp;
    uint256 amountOfBNJIlocked; 
    uint256 lockupTimeInBlocks;   
    uint256 boxDiscountScore;
    address ownerOfLockbox;
    string testMessage; // TODO: take out, only for testing
  }

  // counter going forward, giving each lockbox an unique identifier
  uint256 lockboxIDcounter;  // TODO: probably improve, use OZ counter mechanism

  // amount of lockboxes for each
  mapping (address => uint8) amountOfLockboxesForUser;
  
  // double mapping, user to position to lockbox
  mapping ( address => mapping (uint256 => lockbox) ) usersLockboxes;

  // amount of users total BNJI in lockboxes 
  mapping (address => uint256) usersBNJIinLockboxes; // todo: discuss if we should have this

  // global mapping of all lockboxIDs to their position (key) in their owner's mapping // todo: discuss if we should create this as a double mapping, just for readability (lockboxID to user to position)
  mapping (uint256 => uint8) positionInUsersMapping;

  // each user's discount score
  mapping (address => uint256) discountScore;

  // event for withdrawGains function
  // availableIn6dec shows how many USDC were available to withdraw, in 6 decimals format
  // amountUSDCin6dec shows how many USDC were withdrawn, in 6 decimals format
  event ProfitTaken(uint256 availableIn6dec, uint256 amountUSDCin6dec);

  // event for deposits into the lending pool
  event LendingPoolDeposit (uint256 amountUSDCin6dec, address payer);

  // event for withdrawals from the lending pool
  event LendingPoolWithdrawal (uint256 amountUSDCBeforeFeein6dec, address payee);

  // event for updating these addresses: feeReceiver, polygonUSDC, polygonAMUSDC
  event AddressUpdate(address newAddress, string typeOfUpdate); 

  // event for updating the amounts of blocks mined on Polygon network per day
  event BlocksPerDayUpdate(uint256 newAmountOfBlocksPerDay);

  // event for updating the contract's approval to Aave's USDC lending pool
  event LendingPoolApprovalUpdate(uint256 amountToApproveIn6dec);

  // event for creating a lockbox
  event LockboxCreated(uint256 lockboxID, address owner, uint256 createdTimestamp, uint256 lockedBNJI, uint256 lockupTimeInBlocks, uint256 boxDiscountScore, string testingMessage); // TODO: take out message
  
  // event for unlocking and destroying a lockbox 
  event LockboxDestroyed(uint256 lockboxID, address owner, uint256 destroyedTimestamp, uint256 unlockedBNJI, uint256 lockupTimeInBlocks, uint256 boxDiscountScore); // TODO: fix order of arguments, also in emit of course

  // event for exchanging USDC and BNJI // TODO:include mint or burn bool or type string 
  event Exchanged(
    address fromAddress,
    address toAddress,
    uint256 inTokens,
    uint256 beforeFeeUSDCin6dec,
    uint256 feeUSDCin6dec
  );

  // owner overrides paused.
  modifier whenAvailable() {        
    require(!paused() || (msg.sender == owner()), "Benjamins is paused.");
    _;
  }

  // checking that account has sufficient funds
  modifier hasTheBenjamins(uint256 want2Spend) {
    require(balanceOf(msg.sender) >= want2Spend, "Insufficient Benjamins.");
    _;
  }

  // Redundant reserveInUSDCin6dec protection vs. user withdraws. TODO: clean up
  modifier wontBreakTheBank(uint256 amountBNJItoBurn) {        
    // calculating the USDC value of the BNJI tokens to burn, and rounding them to full cents
    uint256 beforeFeesNotRoundedIn6dec = quoteUSDC(amountBNJItoBurn, false);        
    uint256 beforeFeesRoundedDownIn6dec = beforeFeesNotRoundedIn6dec - (beforeFeesNotRoundedIn6dec % USDCcentsScaleFactor);
    // if the USDC reserve counter shows less than what is needed, check the existing amUSDC balance of the contract
    if(reserveInUSDCin6dec < beforeFeesRoundedDownIn6dec) {
      uint256 fundsOnTab = polygonAMUSDC.balanceOf(address(this));
      // if there are enough amUSDC available, set the tracker to allow the transfer 
      if (fundsOnTab >= beforeFeesRoundedDownIn6dec ) {
        reserveInUSDCin6dec = beforeFeesRoundedDownIn6dec;                
      }
    }
    // if there are not enough amUSDC, throw an error 
    require(reserveInUSDCin6dec >= beforeFeesRoundedDownIn6dec, "BNJ: wontBreakTheBank threw");
    _;
  }

  constructor() ERC20("Benjamins", "BNJI") {
    // Manage Benjamins
    _decimals = 0;                          // Benjamins have 0 decimals, only full tokens exist.
    reserveInUSDCin6dec = 0;                // upon contract creation, the reserve in USDC is 0

    // setting addresses for feeReceiver, USDC-, amUSDC- and Aave lending pool contracts
    feeReceiver = 0xE51c8401fe1E70f78BBD3AC660692597D33dbaFF;
    polygonUSDC = IERC20(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
    polygonAMUSDC = IERC20(0x1a13F4Ca1d028320A707D99520AbFefca3998b7F);
    polygonLendingPool = ILendingPool(0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf);
    
    // calling OpenZeppelin's (pausable) pause function for initial preparations after deployment
    pause();
  }
  
  // pausing funcionality from OpenZeppelin's Pausable
  function pause() public onlyOwner {
    _pause();
  }

  // unpausing funcionality from OpenZeppelin's Pausable
  function unpause() public onlyOwner {
    _unpause();
  }

  // Overriding OpenZeppelin's ERC20 function
  function decimals() public view override returns (uint8) {
    return _decimals;
  }

  function getLBpositionInUsersMapping(uint256 _lockboxID) public view returns(uint8 posOfLBinUsersMapping) {
    return positionInUsersMapping[_lockboxID];
  }

  function lockedBalanceOf (address _userToCheck) public view returns(uint256 lockedBNJIofUser) {
    return usersBNJIinLockboxes[_userToCheck];
  }

  function getLockboxIDcounter() public view returns(uint256){
    return lockboxIDcounter;
  }

  function getUsersDiscountScore (address _userToCheck) public view returns(uint256 usersDiscountScore){
    return discountScore[_userToCheck];
  }

  function getBoxDiscountScore (uint256 _lockboxID, address _owner) public view returns(uint256 discountScoreInBox) {
    
    uint8 positionToLookUp = positionInUsersMapping[_lockboxID];

    lockbox memory foundBox = usersLockboxes[_owner][positionToLookUp];

    // lockboxID inside the lockbox must be equal to _lockboxID
    require (foundBox.lockboxID == _lockboxID, "This is not the lockbox you're looking for. You can check getUsersLockboxIDs");

    return foundBox.boxDiscountScore;
  }
    
  function getAmountOfUsersLockboxes(address _userToCheck) public view returns (uint8 amountOfBoxesForUser) {
    return amountOfLockboxesForUser[_userToCheck];
  }

  function getUsersLockboxIDs(address _userToCheck)  public view returns (uint256[] memory lockboxIDsOfUser) {

    require(_userToCheck != address(0), 'Query for the zero address');

    uint256 lockboxAmount = getAmountOfUsersLockboxes(_userToCheck);

    if (lockboxAmount == 0) {
      // Return an empty array
      return new uint256[](0);
    }

    uint256[] memory resultArray = new uint256[](lockboxAmount);

    uint256 counter;

    // resultArray is 0 based
    for (counter = 0; counter < lockboxAmount; counter++) {

      // usersLockboxes is a mapping, not an array, and not 0 based, but starting with position 1
      lockbox memory foundBox = usersLockboxes[_userToCheck][counter+1];

      // empty entries will be returned as lockboxID 0
      resultArray[counter] = foundBox.lockboxID;
    }

    return resultArray;
  }  
  
  function howManyBlocksUntilUnlockForBox (uint256 _lockboxID, address _owner) public view returns(uint256 timeLeftForBoxInBlocks) {
    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;

    uint8 positionToLookUp = positionInUsersMapping[_lockboxID];

    lockbox memory foundBox = usersLockboxes[_owner][positionToLookUp];

    // lockboxID inside the lockbox must be equal to _lockboxID
    require (foundBox.lockboxID == _lockboxID, "This is not the lockbox you're looking for. You can check getUsersLockboxIDs");

    uint256 willUnlockAtThisBlockheight = foundBox.createdTimestamp + foundBox.lockupTimeInBlocks;     

    int256 amountOfBlocksStillLocked = int256(willUnlockAtThisBlockheight) - int256(blockHeightNow);

    if (amountOfBlocksStillLocked < 0 ) {
      return 0;
    } else {
      return uint256(amountOfBlocksStillLocked);
    }

  }

  // todo: take out testingmessage   
  function createLockbox (uint256 _amountOfBNJItoLock, string memory testingMessage, uint256 _lockupTimeInBlocks) public whenAvailable hasTheBenjamins(_amountOfBNJItoLock) {
   
    require(amountOfLockboxesForUser[msg.sender] < 12, "Only up to 12 lockboxes per user at the same time.");

    require(_lockupTimeInBlocks >= 10 && (_lockupTimeInBlocks <= 365 * blocksPerDay) , "Mimimum lockup time is 10 blocks, maximum is 365 days.");
    
    // transferring BNJI from msg.sender to this contract
    transfer(address(this), _amountOfBNJItoLock);                       // TODO: check if caller is correct, should be msg.sender, might need transferFrom
    
    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;

    // increasing global lockboxIDcounter
    lockboxIDcounter +=1;

    // updated lockboxIDcounter is saved as lockboxID into lockbox
    uint256 newLockboxID = lockboxIDcounter;  

    // calculating and saving this lockebox's generatedDiscountScore into lockbox
    uint256 generatedDiscountScore = _amountOfBNJItoLock * _lockupTimeInBlocks;

    // creating new lockbox
    lockbox memory newLockbox = lockbox ({  
      lockboxID:          uint256(newLockboxID),            // unique identifier
      createdTimestamp:   uint256(blockHeightNow),          // timestamp of creation
      amountOfBNJIlocked: uint256(_amountOfBNJItoLock),     // amount of BNJI that were locked in
      lockupTimeInBlocks: uint256 (_lockupTimeInBlocks),    // amount of blocks that the lockbox will be locked for
      boxDiscountScore:   uint256(generatedDiscountScore),  // discountScore that is generated by this box, as long as it's unopened
      ownerOfLockbox:     address(msg.sender),              // msg.sender is owner of lockbox
      testMessage:        string(testingMessage)            // just for testing, to see if keeping track works as intended
    });   
    
    // increasing user's counter of lockboxes
    amountOfLockboxesForUser[msg.sender] += 1;

    // using the updated counter as position (key) in users mapping of lockboxes
    uint8 position = amountOfLockboxesForUser[msg.sender];

    // saving new lockbox to usersLockboxes under their address and the fitting position
    usersLockboxes[msg.sender][position] = newLockbox; 

    // saving the position to global mapping of lockboxIDs
    positionInUsersMapping[newLockboxID] = position;

    // increasing counter of user's locked BNJI
    usersBNJIinLockboxes[msg.sender] += _amountOfBNJItoLock;

    // adding this lockebox's generatedDiscountScore to user's discountScore   
    discountScore[msg.sender] += generatedDiscountScore;

    // emitting event with all related useful details
    emit LockboxCreated (newLockboxID, msg.sender, blockHeightNow, _amountOfBNJItoLock, _lockupTimeInBlocks, generatedDiscountScore, testingMessage);  
  }

  function showLockboxByIDforUser (address _userToCheck, uint256 _lockboxIDtoFind) 
    public 
    view 
  returns (
    uint256 foundLockboxID,
    uint256 foundCreatedTimestamp,
    uint256 foundAmountOfBNJIlocked,
    uint256 foundLockupTimeInBlocks,
    uint256 foundBoxDiscountScore,
    address foundOwnerOfLockbox,
    string memory foundTestingMessage
    )
  {

    uint8 positionToLookUp = positionInUsersMapping[_lockboxIDtoFind];

    lockbox memory foundBox = usersLockboxes[_userToCheck][positionToLookUp];

    console.log(positionToLookUp, 'positionToLookUp in owners mapping, queried positionInUsersMapping[_lockboxIDtoFind],  showLockboxByIDforUser');
    
    console.log(foundBox.lockboxID, 'lockboxID,  showLockboxByIDforUser');
    
    //console.log(foundBox.createdTimestamp, 'createdTimestamp,  showLockboxByIDforUser');
    //console.log(foundBox.amountOfBNJIlocked, 'amountOfBNJIlocked,  showLockboxByIDforUser');
    /*console.log(foundBox.lockupTimeInBlocks, 'lockupTimeInBlocks,  showLockboxByIDforUser');
    console.log(foundBox.boxDiscountScore, 'boxDiscountScore,  showLockboxByIDforUser');    
    console.log(foundBox.ownerOfLockbox, 'ownerOfLockbox,  showLockboxByIDforUser');
    console.log(foundBox.testMessage, 'testMessage,  showLockboxByIDforUser');
    */
    return(
      foundBox.lockboxID,
      foundBox.createdTimestamp,
      foundBox.amountOfBNJIlocked,
      foundBox.lockupTimeInBlocks,
      foundBox.boxDiscountScore,
      foundBox.ownerOfLockbox,
      foundBox.testMessage
    );
  }
  

  function openAndDestroyLockbox(uint256 _lockboxIDtoDestroy) public whenAvailable {

    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;    

    uint8 positionToRefill = positionInUsersMapping[_lockboxIDtoDestroy];
    lockbox memory _lockboxtoDestroy = usersLockboxes[msg.sender][positionToRefill];

    uint256 lockupTimeInBlocks = _lockboxtoDestroy.lockupTimeInBlocks;
  
    // lockboxID inside the lockbox must be equal to _lockboxIDtoDestroy
    require (_lockboxtoDestroy.lockboxID == _lockboxIDtoDestroy, "This is not the lockbox you're looking for. You can check getUsersLockboxIDs");
        
    // redundant security: msg.sender must be owner of lockbox
    require (_lockboxtoDestroy.ownerOfLockbox == msg.sender, 'This is not your lockbox.');

    // at least 10 blocks must have passed since lockbox was created
    require((_lockboxtoDestroy.createdTimestamp + lockupTimeInBlocks) <= blockHeightNow, 'This lockbox cannot be opened yet. You can check howManyBlocksUntilUnlockForBox.');   // TODO: add function that shows how long the box is still locked for

    // as this lockbox gets destroyed, the discountScore it was generating is substracted again from user's discountScore
    uint256 discountScoreToSubtract = _lockboxtoDestroy.boxDiscountScore;
    discountScore[msg.sender] -= discountScoreToSubtract;

    uint256 amountOfBNJIunlocked = _lockboxtoDestroy.amountOfBNJIlocked;
    
    uint8 lastLockboxPositionOfUser = getAmountOfUsersLockboxes(msg.sender);    

    uint8 positionOfLockboxToDestroy = positionToRefill;

    // When the lockbox to destroy is the already in the user's mapping's last position, the swap operation is unnecessary
    if (positionOfLockboxToDestroy != lastLockboxPositionOfUser) {

      lockbox memory lockboxToMove = usersLockboxes[msg.sender][lastLockboxPositionOfUser];

      usersLockboxes[msg.sender][positionToRefill] = lockboxToMove;       // Move the last lockbox to the slot of the to-destroy lockbox
      positionInUsersMapping[lockboxToMove.lockboxID] = positionToRefill;  // Update the moved lockbox's position
    }
    
    delete positionInUsersMapping[_lockboxIDtoDestroy];
    delete usersLockboxes[msg.sender][lastLockboxPositionOfUser];

    // decreasing user's counter of lockboxes
    amountOfLockboxesForUser[msg.sender] -= 1;

    // decreasing counter of user's locked BNJI
    usersBNJIinLockboxes[msg.sender] -= amountOfBNJIunlocked;

    // this contract approves msg.sender to use transferFrom and pull in amountOfBNJIunlocked BNJI
    _approve(address(this), msg.sender, amountOfBNJIunlocked);    

    // checking allowance for BNJI // TODO: take out
    uint256 fromThisContractToCallerBNJIAllowance = allowance(address(this), msg.sender);
    console.log(fromThisContractToCallerBNJIAllowance, 'this many BNJI are allowed by this contract to user' );      

    // this contract pushes msg.sender amountOfBNJIunlocked to msg.sender
    transferFrom(address(this), msg.sender, amountOfBNJIunlocked);

    // rechecking allowance for BNJI // TODO: take out
    uint256 fromThisContractToCallerBNJIAllowanceNow = allowance(address(this), msg.sender);
    console.log(fromThisContractToCallerBNJIAllowanceNow, 'this many BNJI are allowed by this contract to user after transferFrom' );

    emit LockboxDestroyed(_lockboxIDtoDestroy, msg.sender, blockHeightNow, amountOfBNJIunlocked, lockupTimeInBlocks, discountScoreToSubtract);   
    
  }






  


  // Modified ERC20 transfer()   
  function transfer(address recipient, uint256 amount)
    public
    override
    nonReentrant
    whenAvailable    
  returns(bool) {  
    // transferring BNJI
    _transfer(_msgSender(), recipient, amount);
    
    return true;
  }

  // modified ERC20 transferFrom()   
  function transferFrom(address sender, address recipient, uint256 amountBNJI)
    public
    override
    nonReentrant
    whenAvailable    
  returns (bool) {    
    // checking if allowance for BNJI is enough
    uint256 currentBNJIAllowance = allowance(sender, _msgSender());
    require(currentBNJIAllowance >= amountBNJI, "Benjamins: transfer amount exceeds allowance");
    // transferring BNJI
    _transfer (sender, recipient, amountBNJI);

    // decreasing BNJI allowance by transferred amount
    _approve(sender, _msgSender(), currentBNJIAllowance - amountBNJI);   
   
    return true;
  }

  // Buy BNJI with USDC.
  function mint(uint256 _amount) public {
    mintTo(_amount, msg.sender);
  }

  // Buy BNJI with USDC for another address.
  function mintTo(uint256 _amount, address _toWhom) public whenAvailable {   
    // minting to user
    changeSupply(_toWhom, _amount, true);
  }

  // Sell BNJI for USDC.
  function burn(uint256 _amount) public {
    burnTo(_amount, msg.sender);
  }

  // Sell your BNJI and send USDC to another address.
  function burnTo(uint256 _amount, address _toWhom)
    public
    whenAvailable
    hasTheBenjamins(_amount)
    wontBreakTheBank(_amount)   
  {
    changeSupply(_toWhom, _amount, false);
  }

  // Quote USDC for mint or burn
  // based on BNJI in circulation and amount to mint/burn
  function quoteUSDC(uint256 _amount, bool isMint) public view whenAvailable returns (uint256) {

    uint256 supply = totalSupply();                     // total supply of BNJI
    uint256 supply2 = supply*supply;                    // Supply squared
    uint256 supplyAfterTx;                              // post-mint supply, see below
    uint256 supplyAfterTx2;                             // post-mint supply squared, see below
    uint256 squareDiff;                                 // difference in supply, before and after, see below

    // this calculation is for minting BNJI
    if (isMint==true){                                  
      supplyAfterTx = supply + _amount;               
      supplyAfterTx2 = supplyAfterTx*supplyAfterTx;   
      squareDiff = supplyAfterTx2 - supply2;
    } 
        
    // this calculation is for burning BNJI
    else {                                              
      supplyAfterTx = supply - _amount;               
      supplyAfterTx2 = supplyAfterTx*supplyAfterTx;
      squareDiff = supply2 - supplyAfterTx2;
    }

    // bringing difference into 6 decimals format for USDC
    uint256 scaledSquareDiff = squareDiff * USDCscaleFactor;       

    // finishing bonding curve calculation 
    uint256 amountInUSDCin6dec = scaledSquareDiff / curveFactor;    

    // rounding down to USDC cents
    uint256 endAmountUSDCin6dec = amountInUSDCin6dec - (amountInUSDCin6dec % USDCcentsScaleFactor); 

    // the amount of BNJI to be moved must be at least currently valued at $5 of USDC
    require (endAmountUSDCin6dec >= 5000000, "BNJ, quoteUSDC: Minimum BNJI value to move is $5 USDC" );

    // returning USDC value of BNJI before fees
    return endAmountUSDCin6dec;                         
  }
    
  // Execute mint or burn
  function changeSupply(address _forWhom, uint256 _amountBNJI, bool isMint) internal nonReentrant whenAvailable {
    uint256 beforeFeeInUSDCin6dec;
    // Calculate change in tokens and value of difference
    if (isMint == true) {
      beforeFeeInUSDCin6dec = quoteUSDC(_amountBNJI, true);
    } else {
      beforeFeeInUSDCin6dec = quoteUSDC(_amountBNJI, false);
    }
    uint256 feeNotRoundedIn6dec = (beforeFeeInUSDCin6dec * baseFeeTimes10k)/ USDCscaleFactor;
    uint256 feeRoundedDownIn6dec = feeNotRoundedIn6dec - (feeNotRoundedIn6dec % USDCcentsScaleFactor);
    // Execute exchange
    if (isMint == true) {
      // moving funds for minting
      moveUSDC(msg.sender, _forWhom, beforeFeeInUSDCin6dec, feeRoundedDownIn6dec, true);
      // minting
      _mint(_forWhom, _amountBNJI);
      // update reserve
      reserveInUSDCin6dec += beforeFeeInUSDCin6dec;
    } else {
      // burning
      _burn(msg.sender, _amountBNJI);
      // moving funds for burning
      moveUSDC(msg.sender, _forWhom, beforeFeeInUSDCin6dec, feeRoundedDownIn6dec, false);
      // update reserve            
      reserveInUSDCin6dec -= beforeFeeInUSDCin6dec;
    }

    emit Exchanged(msg.sender, _forWhom, _amountBNJI, beforeFeeInUSDCin6dec, feeRoundedDownIn6dec);
  }

  // Move USDC for a supply change.  Note: sign of amount is the mint/burn direction.
  function moveUSDC(
    address _payer,
    address _payee,
    uint256 _beforeFeeInUSDCin6dec,
    uint256 _feeRoundedDownIn6dec,
    bool isMint // negative when burning, does not include fee. positive when minting, includes fee.
  ) internal whenAvailable {
    if (isMint == true) {
      // on minting, fee is added to price
      uint256 _afterFeeUSDCin6dec = _beforeFeeInUSDCin6dec + _feeRoundedDownIn6dec;

      // pull USDC from user (_payer), push to this contract
      polygonUSDC.transferFrom(_payer, address(this), _afterFeeUSDCin6dec);

      // pushing fee from this contract to feeReceiver address
      polygonUSDC.transfer(feeReceiver, _feeRoundedDownIn6dec);

      // this contract gives the Aave lending pool allowance to pull in the amount without fee from this contract
      polygonUSDC.approve(address(polygonLendingPool), _beforeFeeInUSDCin6dec);

      // lending pool is queried to pull in the approved USDC (in 6 decimals unit)
      polygonLendingPool.deposit(address(polygonUSDC), _beforeFeeInUSDCin6dec, address(this), 0);
      emit LendingPoolDeposit(_beforeFeeInUSDCin6dec, _payer);
    } else {
      // on burning, fee is substracted from return
      uint256 _afterFeeUSDCin6dec = _beforeFeeInUSDCin6dec - _feeRoundedDownIn6dec;
            
      // lending pool is queried to push USDC (in 6 decimals unit) including fee back to this contract
      polygonLendingPool.withdraw(address(polygonUSDC), _beforeFeeInUSDCin6dec, address(this));
      emit LendingPoolWithdrawal(_beforeFeeInUSDCin6dec, _payee);

      // pushing fee from this contract to feeReceiver address
      polygonUSDC.transfer(feeReceiver, _feeRoundedDownIn6dec);

      // pushing USDC from this contract to user (_payee)
      polygonUSDC.transfer(_payee, _afterFeeUSDCin6dec);
    }
  }    

  // TODO: test and look at in depth
  // Withdraw available fees and interest gains from lending pool to receiver address.
  function withdrawGains(uint256 _amountIn6dec) public onlyOwner {
    uint256 availableIn6dec = polygonAMUSDC.balanceOf(address(this)) - reserveInUSDCin6dec;
    require(availableIn6dec > _amountIn6dec, "Insufficient funds.");
    polygonAMUSDC.transfer(feeReceiver, _amountIn6dec);
    emit ProfitTaken(availableIn6dec, _amountIn6dec);
  }

  // Returns the reserveInUSDCin6dec tracker, which logs the amount of USDC (in 6 decimals format),
  // to be 100% backed against burning tokens at all times
  function getReserveIn6dec() public view returns (uint256 reserveInUSDCin6decNow) {
    return reserveInUSDCin6dec;
  }
    
  function getFeeReceiver() public view returns (address feeReceiverNow) {
    return feeReceiver;           
  } 

  function getPolygonUSDC() public view returns (address addressNow) {
    return address(polygonUSDC);           
  }

  function getPolygonAMUSDC() public view returns (address addressNow) {
    return address(polygonAMUSDC);           
  }

  function getBlocksPerDay() public view returns (uint256 amountOfBlocksPerDayNow) {
    return blocksPerDay;           
  }
      
  // function for owner to withdraw MATIC that were sent directly to contract by mistake
  function cleanMATICtips() public onlyOwner {
    address payable receiver = payable(msg.sender);
    uint256 accumulatedMatic = address(this).balance;
    (bool success, ) = receiver.call{value: accumulatedMatic}("");
    require(success, "Transfer failed.");
  }
    
  // function for owner to withdraw ERC20 tokens that were sent directly to contract by mistake
  function cleanERC20Tips(address erc20ContractAddress) public onlyOwner {
    require(erc20ContractAddress != 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, 'ERC20 cannot be USDC.');     // ERC20 cannot be USDC
    require(erc20ContractAddress != 0x1a13F4Ca1d028320A707D99520AbFefca3998b7F, 'ERC20 cannot be amUSDC.');   // ERC20 cannot be amUSDC
    require(erc20ContractAddress != address(this), 'ERC20 cannot be BNJI.');                                  // ERC20 cannot be BNJI

    IERC20 erc20contract = IERC20(erc20ContractAddress);                // Instance of ERC20 token at erc20ContractAddress    
    uint256 accumulatedTokens = erc20contract.balanceOf(address(this)); // Querying balance of this token, owned by this contract    
    erc20contract.transfer(msg.sender, accumulatedTokens);              // Sending it to calling owner
  }




  // Fallback receives all incoming funds of any type.
  receive() external payable {
    // blind accumulate all other payment types and tokens.
  }

  /*  // TODO: talk to Aave, find out if they transfer funds to new lending pool or what
        // they want us to do in such a case, (maybe just simplify this function to set newAddress)
    
        // event for updating Aave's lendingPool address
        event LendingPoolUpdated(address account);  

        // NOTE: used to update in case a better Aave lendingpool comes out
        // Updating the lending pool and transfering all the deposited funds from it to the new one
        function updatePolygonLendingPool(address newAddress) public onlyOwner {
            // withdrawing all USDC from old lending pool address to BNJI contract
            polygonLendingPool.withdraw(address(polygonUSDC), type(uint).max, address(this));
            //emit LendingPoolWithdrawal (uint256 amount); // TODO: ideally find and emit the exact amount withdrawn

            // setting new lending pool address and emitting event
            polygonLendingPool = ILendingPool(newAddress);
            emit LendingPoolUpdated(newAddress);

            // getting USDC balance of BNJI contract, approving and depositing it to new lending pool
            uint256 bnjiContractUSDCBal = polygonUSDC.balanceOf(address(this));
            polygonUSDC.approve(address(polygonLendingPool), bnjiContractUSDCBal);
            polygonLendingPool.deposit(address(polygonUSDC), bnjiContractUSDCBal, address(this), 0);
            // emitting related event
            emit LendingPoolDeposit(bnjiContractUSDCBal, address(this));
        }
  */

  // Update the feeReceiver address.
  function updateFeeReceiver(address newFeeReceiver) public onlyOwner {
    feeReceiver = newFeeReceiver;     
    emit AddressUpdate(newFeeReceiver, "feeReceiver");           
  }  

  // Update the USDC token address on Polygon.
  function updatePolygonUSDC(address newAddress) public onlyOwner {
    polygonUSDC = IERC20(newAddress);
    emit AddressUpdate(newAddress, "polygonUSDC");
  }  

  // Update the amUSDC token address on Polygon.
  function updatePolygonAMUSDC(address newAddress) public onlyOwner {
    polygonAMUSDC = IERC20(newAddress);
    emit AddressUpdate(newAddress, "polygonAMUSDC");
  }

  // Update amount of blocks mined per day on Polygon
  function updateBlocksPerDay (uint256 newAmountOfBlocksPerDay) public onlyOwner {
    blocksPerDay = newAmountOfBlocksPerDay;
    emit BlocksPerDayUpdate(newAmountOfBlocksPerDay);
  }

  // Update approval from this contract to Aave's USDC lending pool.
  function updateApproveLendingPool (uint256 amountToApproveIn6dec) public onlyOwner {
    polygonUSDC.approve(address(polygonLendingPool), amountToApproveIn6dec);
    emit LendingPoolApprovalUpdate(amountToApproveIn6dec);
  }

}