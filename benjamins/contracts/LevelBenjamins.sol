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
contract LevelBenjamins is Ownable, ERC20, Pausable, ReentrancyGuard {
    
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

  uint256  neededBNJIperLevel;                // amount of BNJI needed per discount level
  uint16[] holdingTimes;                      // holding times in days
  uint16[] discounts;                         // discounts in percent
  
  // mapping of user to timestamp, relating to when levels can be decreased again
  mapping (address => uint256) minHoldingtimeUntil;

  // 0 - 3 levels
  mapping (address => uint256) usersAccountLevel;

  // event for withdrawGains function
  // availableIn6dec shows how many USDC were available to withdraw, in 6 decimals format
  // amountUSDCin6dec shows how many USDC were withdrawn, in 6 decimals format
  event ProfitTaken(uint256 availableUSDCIn6dec, uint256 withdrawnUSDCin6dec);

  // event for deposits into the lending pool
  event LendingPoolDeposit (uint256 amountUSDCin6dec, address sender);

  // event for withdrawals from the lending pool
  event LendingPoolWithdrawal (uint256 amountUSDCBeforeFeein6dec, address receiver);

  // event for increasing account level
  event DiscountLevelIncreased(address owner, uint256 blockHeightNow,  uint256 newDiscountLevel, uint256 minimumHoldingUntil); 
 
  // event for decreasing account level
  event DiscountLevelDecreased(address owner, uint256 blockHeightNow,  uint256 newDiscountLevel);

  // event for exchanging USDC and BNJI
  event Exchanged(
    bool isMint,
    address fromAddress,
    address toAddress,
    uint256 inTokens,
    uint256 beforeFeeUSDCin6dec,
    uint256 feeUSDCin6dec
  );

  // event for updating these addresses: feeReceiver, polygonUSDC, polygonAMUSDC
  event AddressUpdate(address newAddress, string typeOfUpdate); 

  // event for updating the amounts of blocks mined on Polygon network per day
  event BlocksPerDayUpdate(uint256 newAmountOfBlocksPerDay);

  // event for updating the inverse slope of the bonding curve
  event CurveFactorUpdate(uint256 newCurveFactor);
  
  // event for updating the contract's approval to Aave's USDC lending pool
  event LendingPoolApprovalUpdate(uint256 amountToApproveIn6dec);

  // event for updating the table of necessary BNJI amounts per account level
  event NeededBNJIperLevelUpdate(uint256 neededBNJIperLevel);

  // event for updating the table of necessary holding periods for the respective account level
  event HoldingTimesUpdate(uint16[] newHoldingTimes);

  // event for updating the table of discounts for the respective account level
  event DiscountsUpdate(uint16[] newDiscounts);
 
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

  // Redundant reserveInUSDCin6dec protection vs. user withdraws.
  modifier wontBreakTheBank(uint256 amountBNJItoBurn) {        
    // calculating the USDC value of the BNJI tokens to burn, and rounding them to full cents
    uint256 beforeFeesNotRoundedIn6dec = quoteUSDC(amountBNJItoBurn, false);        
    uint256 beforeFeesRoundedDownIn6dec = beforeFeesNotRoundedIn6dec - (beforeFeesNotRoundedIn6dec % USDCcentsScaleFactor);
    // if the USDC reserve counter shows less than what is needed, check the existing amUSDC balance of the contract
    if(reserveInUSDCin6dec < beforeFeesRoundedDownIn6dec) {
      uint256 fundsOnTabIn6dec = polygonAMUSDC.balanceOf(address(this));
      // if there are enough amUSDC available, set the tracker to allow the transfer 
      if (fundsOnTabIn6dec >= beforeFeesRoundedDownIn6dec ) {
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

    // setting holdingTimes and discounts 
    holdingTimes = [0, 30, 90, 300];        // holding times in days, relating to discount level (level 1 needs 30 days holding, etc.)
    discounts =    [0, 10, 25,  50];        // discounts in percent, relating to discount level (level 1 gets 10% discounts, etc.)
    
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

  function getUsersDiscountLevel(address _userToCheck) public view returns (uint256 discountLevel) {
    return usersAccountLevel[_userToCheck];
  }

  function lockedBalanceOf(address _userToCheck) public view returns (uint256 lockedBNJIofUser) {
    return (getUsersDiscountLevel(_userToCheck)*1000);
  }

  function getDiscountPercentageTimes10k(address _userToCheck) public view returns (uint256 discountInPercentTimes10k) {
    uint256 usersDiscountLevel = getUsersDiscountLevel(_userToCheck);
    return discounts[usersDiscountLevel] * baseFeeTimes10k;
  }  

  function getUsersUnlockTimestamp(address _userToCheck) public view returns (uint256 usersUnlockTimestamp) {
    return minHoldingtimeUntil[_userToCheck];
  }

  function howManyBlocksUntilUnlock (address _userToCheck) public view returns(uint256 timeLeftInBlocks) {
    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;

    uint256 willUnlockAtThisBlockheight = getUsersUnlockTimestamp(_userToCheck);
   
    int256 amountOfBlocksStillLocked = int256(willUnlockAtThisBlockheight) - int256(blockHeightNow);

    if (amountOfBlocksStillLocked < 0) {
      return 0;
    } else {
      return uint256(amountOfBlocksStillLocked);
    }

  }

  
  function increaseDiscountLevels (uint256 _amountOfLevelsToIncrease) public whenAvailable hasTheBenjamins(_amountOfLevelsToIncrease * 1000) {
    
    uint256 endAmountOfLevels = getUsersDiscountLevel(msg.sender) + _amountOfLevelsToIncrease;

    require(0 < _amountOfLevelsToIncrease && endAmountOfLevels <=3, "You can increase the discount level up to level 3.");
    
    uint256   amountOfBNJItoLock = (_amountOfLevelsToIncrease * 1000);   // Todo: approval must be done in front end before

    // transferring BNJI from msg.sender to this contract
    transfer(address(this), amountOfBNJItoLock);  // TODO: check if caller is correct, should be msg.sender, might need transferFrom
    
    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;    

    uint256 amountOfTimeToLock = holdingTimes[endAmountOfLevels] * blocksPerDay;

    uint256 discountShouldBeActiveUntil = blockHeightNow + amountOfTimeToLock;    

    minHoldingtimeUntil[msg.sender] = discountShouldBeActiveUntil;
    
    usersAccountLevel[msg.sender] = endAmountOfLevels;    

    // emitting event with all related useful details
    emit DiscountLevelIncreased (msg.sender, blockHeightNow, endAmountOfLevels, discountShouldBeActiveUntil);  
  }  


  function decreaseDiscountLevels (uint256 _amountOfLevelsToDecrease) public whenAvailable {

    uint256 usersDiscountLevelNow = getUsersDiscountLevel(msg.sender);

    uint256 endAmountOfLevels = usersDiscountLevelNow - _amountOfLevelsToDecrease;

    require(_amountOfLevelsToDecrease <= usersDiscountLevelNow && endAmountOfLevels >=0, "You can lower the discount level until 0.");

    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;  

    // timestamp must be smaller than now (i.e. enough time has passed)
    require(getUsersUnlockTimestamp(msg.sender) <= blockHeightNow, "Discounts are still active, levels cannot be decreased.");

    usersAccountLevel[msg.sender] = endAmountOfLevels;    

    uint256 amountOfBNJIunlocked = _amountOfLevelsToDecrease * 1000;

    // this contract approves msg.sender to use transferFrom and pull in amountOfBNJIunlocked BNJI
    _approve(address(this), msg.sender, amountOfBNJIunlocked);    

    // this contract pushes msg.sender amountOfBNJIunlocked to msg.sender
    transferFrom(address(this), msg.sender, amountOfBNJIunlocked);    

    emit DiscountLevelDecreased(msg.sender, blockHeightNow, endAmountOfLevels);  
    
  }





  // Modified ERC20 transfer()   
  function transfer(address recipient, uint256 amountBNJI)
    public
    override
    nonReentrant
    whenAvailable    
  returns(bool) {  
    // transferring BNJI
    _transfer(_msgSender(), recipient, amountBNJI);
    
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
    // baseFeeTimes10k is brought into full percent format by dividing by 10000, then applied as percent by dividing by 100
    uint256 feeNotRoundedIn6dec = (beforeFeeInUSDCin6dec * baseFeeTimes10k) / 1000000;
    // rounding down to full cents
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

    emit Exchanged(isMint, msg.sender, _forWhom, _amountBNJI, beforeFeeInUSDCin6dec, feeRoundedDownIn6dec);
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

      // lending pool is queried to pull in the approved USDC (in 6 decimals format)
      polygonLendingPool.deposit(address(polygonUSDC), _beforeFeeInUSDCin6dec, address(this), 0);
      emit LendingPoolDeposit(_beforeFeeInUSDCin6dec, _payer);
    } else {
      // on burning, fee is substracted from return
      uint256 _afterFeeUSDCin6dec = _beforeFeeInUSDCin6dec - _feeRoundedDownIn6dec;
            
      // lending pool is queried to push USDC (in 6 decimals format) including fee back to this contract
      polygonLendingPool.withdraw(address(polygonUSDC), _beforeFeeInUSDCin6dec, address(this));
      emit LendingPoolWithdrawal(_beforeFeeInUSDCin6dec, _payee);

      // pushing fee from this contract to feeReceiver address
      polygonUSDC.transfer(feeReceiver, _feeRoundedDownIn6dec);

      // pushing USDC from this contract to user (_payee)
      polygonUSDC.transfer(_payee, _afterFeeUSDCin6dec);
    }
  }    

  function checkGains() public view onlyOwner returns (uint256 availableNowIn6dec) {
    uint256 availableIn6dec = polygonAMUSDC.balanceOf(address(this)) - reserveInUSDCin6dec;
    return availableIn6dec;
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

  // Returns the inverse slope of the bonding curve
  function getCurveFactor () public view returns (uint256 curveFactorNow) {
    return curveFactor;
  }

  function getneededBNJIperLevel() public view returns (uint256 neededBNJIperLevelNow) {
    return neededBNJIperLevel;           
  }

  function getHoldingTimes() public view returns (uint16[] memory holdingTimesNow) {
    return holdingTimes;           
  }

  function getDiscounts() public view returns (uint16[] memory discountsNow) {
    return discounts;           
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

  // Update the inverse slope of the bonding curve
  function updateCurveFactor (uint256 newCurveFactor) public onlyOwner {
    curveFactor = newCurveFactor;
    emit CurveFactorUpdate(curveFactor);
  }

  // Update approval from this contract to Aave's USDC lending pool.
  function updateApproveLendingPool (uint256 amountToApproveIn6dec) public onlyOwner {
    polygonUSDC.approve(address(polygonLendingPool), amountToApproveIn6dec);
    emit LendingPoolApprovalUpdate(amountToApproveIn6dec);
  }
  
  // Update token amount required per account level
  function updateNeededBNJIperLevel (uint256 newNeededBNJIperLevel) public onlyOwner {
    neededBNJIperLevel = newNeededBNJIperLevel;
    emit NeededBNJIperLevelUpdate(neededBNJIperLevel);
  }

  // Update timeout times required by account levels
  function updateHoldingTimes (uint16[] memory newHoldingTimes) public onlyOwner {
    holdingTimes = newHoldingTimes;
    emit HoldingTimesUpdate(holdingTimes);
  }

  // Update fee discounts for account levels
  function updateDiscounts (uint16[] memory newDiscounts) public onlyOwner {
    discounts = newDiscounts;
    emit DiscountsUpdate(discounts);
  }     

}