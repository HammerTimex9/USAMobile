// SPDX-License-Identifier: NONE
pragma solidity ^0.8.0;  // TODO: put in fixed version for deployment xxxx

// importing interface for Aave's lending pool
import "./ILendingPool.sol";
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

// BNJI Utility Token.
// Price is set via bonding curve vs. USDC.
// All USDC is deposited in a singular lending pool at AAVE.
// 100% USDC is maintained against burning. (see variable reserveInUSDCin6dec, in 6 decimals format)
// Collected fees and interest are withdrawable by the owner to a set recipient address.
// Users can upgrade their account level, by locking BNJI.
// Reentrancy is protected against via OpenZeppelin's ReentrancyGuard
contract Benjamins is Ownable, ERC20, Pausable, ReentrancyGuard {
    
  ILendingPool public polygonLendingPool;       // Aave lending pool on Polygon
  IERC20 public polygonUSDC;                    // USDC crypto currency on Polygon
  IERC20 public polygonAMUSDC;                  // Aave's amUSDC crypto currency on Polygon
  address public feeReceiver;                   // beneficiary address for collected fees

  uint8   private _decimals;                    // storing BNJI decimals, set to 0 in constructor
  uint256 private USDCscaleFactor =    1000000; // 6 decimals scale of USDC crypto currency
  uint256 private USDCcentsScaleFactor = 10000; // 4 decimals scale of USDC crypto currency cents
  uint256 public blocksPerDay;                  // amount of blocks minted per day on polygon mainnet // TODO: change to 43200, value now is for testing xxxx
  uint256 public curveFactor;                   // inverse slope of the bonding curve
  uint256 public baseFeeTimes10k;               // percent * 10,000 as an integer (for ex. 1% baseFee expressed as 10000)
  uint256 public reserveInUSDCin6dec;           // end user USDC on deposit
  uint256 public neededBNJIperLevel;            // amount of BNJI needed per account level
  uint256 public holdingTime;                   // holding time in days (see constructor)
  
  // mapping of user to timestamp, relating to when levels can be decreased again
  mapping (address => uint256) public minHoldingtimeUntil; 

  // mapping of user to their account level
  mapping (address => uint256) public usersAccountLevel; 

  // event for withdrawGains function
  // availableIn6dec shows how many USDC were available to withdraw, in 6 decimals format
  // amountUSDCin6dec shows how many USDC were withdrawn, in 6 decimals format
  event ProfitTaken(uint256 availableUSDCIn6dec, uint256 withdrawnUSDCin6dec);

  // event for deposits into the lending pool
  event LendingPoolDeposit (uint256 amountUSDCin6dec, address sender);

  // event for withdrawals from the lending pool
  event LendingPoolWithdrawal (uint256 amountUSDCBeforeFeein6dec, address receiver);

  // event for increasing account level
  event AccountLevelIncreased(address owner, uint256 blockHeightNow, uint256 amountOfBNJIlocked,  uint256 newAccountLevel, uint256 minimumHoldingUntil); 
 
  // event for decreasing account level
  event AccountLevelDecreased(address owner, uint256 blockHeightNow, uint256 amountOfBNJIunlocked, uint256 newAccountLevel);

  // event for exchanging USDC and BNJI
  event Exchanged(
    bool isMint,
    address fromAddress,
    address toAddress,
    uint256 inTokens,
    uint256 beforeFeeCalcInUSDCin6dec,
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

  // event for updating Aave's lendingPool address
  event LendingPoolUpdated(address lendingPoolAddressNow);    

  // event for updating necessary holding period
  event HoldingTimeUpdate(uint256 newHoldingTime);
  
  // event for updating the baseFeeTimes10k variable
  event BaseFeeUpdate(uint256 newbaseFeeTimes10k); 
 
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

  // redundant reserveInUSDCin6dec protection vs. withdraws.
  modifier wontBreakTheBank(uint256 amountBNJItoBurn) {        
    // calculating the USDC value of the BNJI tokens to burn, and rounding them to full cents
    uint256 beforeFeesNotRoundedIn6dec = quoteUSDC(amountBNJItoBurn, false);        
    uint256 beforeFeesRoundedDownIn6dec = beforeFeesNotRoundedIn6dec - (beforeFeesNotRoundedIn6dec % USDCcentsScaleFactor);
    // if the USDC reserve counter shows less than what is needed, check the existing amUSDC balance of the contract
    if(reserveInUSDCin6dec < beforeFeesRoundedDownIn6dec) {
      uint256 fundsOnTabIn6dec = polygonAMUSDC.balanceOf(address(this));
      // if there are enough amUSDC available, the tracker is set to allow the transfer 
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

    // setting blocksPerDay, curveFactor and baseFeeTimes10k 
    blocksPerDay =        2; // xxxx TODO:  switch to correct amount of blocksPerDay
    curveFactor =   8000000;       
    baseFeeTimes10k = 10000;    

    // setting neededBNJIperLevel and holdingTime 
    neededBNJIperLevel = 5;                 // necessary amount of BNJI to lock per level
    holdingTime = 30 * blocksPerDay;        // holding times in blocks format, days * blocksPerDay     
    
    // calling OpenZeppelin's (pausable) pause function for initial preparations after deployment
    pause();
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

  // Sell your BNJI and send USDC returns to another address.
  function burnTo(uint256 _amount, address _toWhom)
    public
    whenAvailable
    hasTheBenjamins(_amount)
    wontBreakTheBank(_amount)   
  {
    changeSupply(_toWhom, _amount, false);
  }

  // Execute mint or burn
  function changeSupply(address _forWhom, uint256 _amountBNJI, bool isMint) internal nonReentrant whenAvailable {
    uint256 beforeFeeCalcInUSDCin6dec;
    // Calculate change in tokens and value of difference
    if (isMint == true) {
      beforeFeeCalcInUSDCin6dec = quoteUSDC(_amountBNJI, true);
    } else {
      beforeFeeCalcInUSDCin6dec = quoteUSDC(_amountBNJI, false);
    }
    // baseFeeTimes10k is brought into full percent format by dividing by 10000, then applied as percent by dividing by 100
    uint256 feeNotRoundedIn6dec = (beforeFeeCalcInUSDCin6dec * baseFeeTimes10k) / 1000000;
    // rounding down to full cents
    uint256 feeRoundedDownIn6dec = feeNotRoundedIn6dec - (feeNotRoundedIn6dec % USDCcentsScaleFactor);
    // Execute exchange
    if (isMint == true) {
      // moving funds for minting
      moveUSDC(msg.sender, _forWhom, beforeFeeCalcInUSDCin6dec, feeRoundedDownIn6dec, true);
      // minting
      _mint(_forWhom, _amountBNJI);
      // update reserve
      reserveInUSDCin6dec += beforeFeeCalcInUSDCin6dec;
    } else {
      // burning
      _burn(msg.sender, _amountBNJI);
      // moving funds for burning
      moveUSDC(msg.sender, _forWhom, beforeFeeCalcInUSDCin6dec, feeRoundedDownIn6dec, false);
      // update reserve            
      reserveInUSDCin6dec -= beforeFeeCalcInUSDCin6dec;
    }
    
    emit Exchanged(isMint, msg.sender, _forWhom, _amountBNJI, beforeFeeCalcInUSDCin6dec, feeRoundedDownIn6dec);
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
  
  // Move USDC for a supply change.
  function moveUSDC(
    address _payer,
    address _payee,
    uint256 _beforeFeeCalcInUSDCin6dec,
    uint256 _feeRoundedDownIn6dec,
    bool isMint
  ) internal whenAvailable {
    if (isMint == true) {
      // on minting, fee is added to price
      uint256 _afterFeeUSDCin6dec = _beforeFeeCalcInUSDCin6dec + _feeRoundedDownIn6dec;

      // pull USDC from user (_payer), push to this contract
      polygonUSDC.transferFrom(_payer, address(this), _afterFeeUSDCin6dec);

      // pushing fee from this contract to feeReceiver address
      polygonUSDC.transfer(feeReceiver, _feeRoundedDownIn6dec);

      // this contract gives the Aave lending pool allowance to pull in the amount without fee from this contract
      polygonUSDC.approve(address(polygonLendingPool), _beforeFeeCalcInUSDCin6dec);

      // lending pool is queried to pull in the approved USDC (in 6 decimals format)
      polygonLendingPool.deposit(address(polygonUSDC), _beforeFeeCalcInUSDCin6dec, address(this), 0);
      emit LendingPoolDeposit(_beforeFeeCalcInUSDCin6dec, _payer);
    } else {
      // on burning, fee is substracted from return
      uint256 _afterFeeUSDCin6dec = _beforeFeeCalcInUSDCin6dec - _feeRoundedDownIn6dec;
            
      // lending pool is queried to push USDC (in 6 decimals format) including fee back to this contract
      polygonLendingPool.withdraw(address(polygonUSDC), _beforeFeeCalcInUSDCin6dec, address(this));      

      // pushing fee from this contract to feeReceiver address
      polygonUSDC.transfer(feeReceiver, _feeRoundedDownIn6dec);

      // pushing USDC from this contract to user (_payee)
      polygonUSDC.transfer(_payee, _afterFeeUSDCin6dec);

      emit LendingPoolWithdrawal(_beforeFeeCalcInUSDCin6dec, _payee);
    }
  }       

  // users can increase their own account level by locking up BNJI
  function increaseAccountLevels (uint256 _amountOfLevelsToIncrease) public whenAvailable hasTheBenjamins(_amountOfLevelsToIncrease * neededBNJIperLevel) {
    
    uint256 endAmountOfLevels = getUsersAccountLevel(msg.sender) + _amountOfLevelsToIncrease;

    // _amountOfLevelsToIncrease must be larger than 0
    require(0 < _amountOfLevelsToIncrease, "Can't increase level by 0 or less.");
    
    // calculating how many BNJI need to get locked up for the desired increase in account level
    uint256 amountOfBNJItoLock = (_amountOfLevelsToIncrease * neededBNJIperLevel);

    // transferring BNJI from msg.sender to this contract
    transfer(address(this), amountOfBNJItoLock);
    
    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;    

    // updating for how long the BNJI need to get locked up (depends on new account level), then storing that    
    uint256 unlockTimestamp = blockHeightNow + holdingTime;    
    minHoldingtimeUntil[msg.sender] = unlockTimestamp;
    
    // storing new account level for user
    usersAccountLevel[msg.sender] = endAmountOfLevels;    

    // emitting event with all related useful details
    emit AccountLevelIncreased (msg.sender, blockHeightNow, amountOfBNJItoLock, endAmountOfLevels, unlockTimestamp);  
  }  

  // users can decrease their own account level by unlocking up BNJI (after the necessary time has passed)
  function decreaseAccountLevels (uint256 _amountOfLevelsToDecrease) public whenAvailable {

    uint256 usersAccountLevelNow = getUsersAccountLevel(msg.sender);
    uint256 endAmountOfLevels = usersAccountLevelNow - _amountOfLevelsToDecrease;

    // input must make sense, i.e. can't decrease level by 0, nor below 0
    require(_amountOfLevelsToDecrease > 0 && _amountOfLevelsToDecrease <= usersAccountLevelNow && endAmountOfLevels >=0, "You can lower the account level down to level 0");

    // this is now, expressed in blockheight
    uint256 blockHeightNow = block.number;  

    // unlock timestamp must be smaller than blockheight now (i.e. the necessary time must have passed)
    require(getUsersUnlockTimestamp(msg.sender) <= blockHeightNow, "Minimum holding time has not passed yet, levels can't be decreased now. You can check howManyBlocksUntilUnlock");

    // storing new account level for user
    usersAccountLevel[msg.sender] = endAmountOfLevels;    

    // calculating how many BNJI get unlocked
    uint256 amountOfBNJIunlocked = _amountOfLevelsToDecrease * neededBNJIperLevel;

    // this contract approves msg.sender to use transferFrom and pull in amountOfBNJIunlocked BNJI
    _approve(address(this), msg.sender, amountOfBNJIunlocked);    

    // this contract pushes msg.sender amountOfBNJIunlocked to msg.sender
    transferFrom(address(this), msg.sender, amountOfBNJIunlocked);    

    // emitting event with all related useful details
    emit AccountLevelDecreased(msg.sender, blockHeightNow, amountOfBNJIunlocked, endAmountOfLevels);      
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

  // Overriding OpenZeppelin's ERC20 function, returns decimals, hardcoded to 0, only full BNJI, no fractions
  function decimals() public view override whenAvailable returns (uint8) {
    return _decimals;
  }

  // Returns users account level
  function getUsersAccountLevel(address _userToCheck) public view whenAvailable returns (uint256 accountLevel) {
    return usersAccountLevel[_userToCheck];
  }

  // Returns how many BNJI the user has locked up
  function lockedBalanceOf(address _userToCheck) public view whenAvailable returns (uint256 lockedBNJIofUser) {
    return (getUsersAccountLevel(_userToCheck) * neededBNJIperLevel);
  } 

  // Returns timestamp that must be reached before queried user can unlock their locked BNJI
  // Increasing account level WILL update this (user going from level 1 to 2 will need to wait full amount of unlock time 
  // of level 2, starting when getting lvl 2)
  // Decreasing account level will NOT update this (user going from level 2 to 1 will not need to wait, can unlock whenever,
  // if they are not increasing account level again, in which case timestamp WILL get updated again as described above)
  function getUsersUnlockTimestamp(address _userToCheck) public view whenAvailable returns (uint256 usersUnlockTimestamp) {
    return minHoldingtimeUntil[_userToCheck];
  }

  // Returns amount of time has to pass until user can unlock their locked tokens (format is blocks, check blocks per day)
  function howManyBlocksUntilUnlock (address _userToCheck) public view whenAvailable returns(uint256 timeLeftInBlocks) {
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

  // Returns the reserveInUSDCin6dec tracker, which logs the amount of USDC (in 6 decimals format),
  // to be 100% backed against burning tokens at all times
  function getReserveIn6dec() public view whenAvailable returns (uint256 reserveInUSDCin6decNow) {
    return reserveInUSDCin6dec;
  }

  // Returns address of contract's fee receiver account 
  function getFeeReceiver() public view whenAvailable returns (address feeReceiverNow) {
    return feeReceiver;           
  } 

  // Returns address of USDC contract on Polygon blockchain
  function getPolygonUSDC() public view whenAvailable returns (address addressNow) {
    return address(polygonUSDC);           
  }

  // Returns address of AMUSDC contract on Polygon blockchain
  function getPolygonAMUSDC() public view whenAvailable returns (address addressNow) {
    return address(polygonAMUSDC);           
  }

  // Returns address of used USDC lending pool by Aave, on Polygon blockchain
  function getPolygonLendingPool() public view whenAvailable returns (address addressNow) {
    return address(polygonLendingPool);           
  }
 
  // Returns amount of blocks minted per day on Polygon blockchain
  function getBlocksPerDay() public view whenAvailable returns (uint256 amountOfBlocksPerDayNow) {
    return blocksPerDay;           
  }

  // Returns the inverse slope of the bonding curve
  function getCurveFactor() public view whenAvailable returns (uint256 curveFactorNow) {
    return curveFactor;
  }

  // Returns amount of BNJI needed to get locked up per account level
  function getneededBNJIperLevel() public view whenAvailable returns (uint256 amountNeededBNJIperLevel) {
    return neededBNJIperLevel;
  }

  // Returns minimum holding time after getting account levels (format is blocks)
  function getHoldingTime() public view whenAvailable returns (uint256 holdingTimeNow) {
    return holdingTime;
  }

  // Returns baseFee, format is percent multiplied by 10,000
  function getBaseFeeTimes10k() public view whenAvailable returns (uint256 baseFeeTimes10kNow){
    return baseFeeTimes10k;
  }
  
  // pausing funcionality from OpenZeppelin's Pausable
  function pause() public onlyOwner {
    _pause();
  }

  // unpausing funcionality from OpenZeppelin's Pausable
  function unpause() public onlyOwner {
    _unpause();
  }
  
  // returns amount of generated lending pool interest that can get withdrawn
  function checkGains() public view onlyOwner returns (uint256 availableNowIn6dec) {

    uint256 amUSDCbalOfContractIn6dec = polygonAMUSDC.balanceOf(address(this));

    // calculating with $100 extra as a redundant mathmatical buffer, this amount will never be withdrawable
    uint256 bufferIn6dec = 100*USDCscaleFactor; //TODO: decide and put in correct value xxxx
    
    if (amUSDCbalOfContractIn6dec > bufferIn6dec) {
      uint256 amUSDCbalBufferedIn6dec = amUSDCbalOfContractIn6dec - bufferIn6dec;          

      if (amUSDCbalBufferedIn6dec > reserveInUSDCin6dec) {
        uint256 availableIn6dec = amUSDCbalBufferedIn6dec - reserveInUSDCin6dec;    
        return availableIn6dec;
      } 
      else {
        return 0;
      }
    } 
    else {
      return 0;
    }        
  }
  
  // Withdraw available fees and interest gains from lending pool to receiver address.
  function withdrawGains(uint256 _amountIn6dec) public onlyOwner {
    uint256 availableIn6dec = checkGains();

    require(availableIn6dec > _amountIn6dec, "Insufficient funds.");
    polygonAMUSDC.transfer(feeReceiver, _amountIn6dec); 
    emit ProfitTaken(availableIn6dec, _amountIn6dec);
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

  // Update Aave's lending pool address on Polygon
  function updatePolygonLendingPoolAddress (address newAddress) public onlyOwner {
    // setting new lending pool address and emitting event
    polygonLendingPool = ILendingPool(newAddress);
    emit LendingPoolUpdated(newAddress);
  }        
 
  // Update the feeReceiver address
  function updateFeeReceiver(address newFeeReceiver) public onlyOwner {
    feeReceiver = newFeeReceiver;     
    emit AddressUpdate(newFeeReceiver, "feeReceiver");           
  }  

  // Update the USDC token address on Polygon
  function updatePolygonUSDC(address newAddress) public onlyOwner {
    polygonUSDC = IERC20(newAddress);
    emit AddressUpdate(newAddress, "polygonUSDC");
  }  

  // Update the amUSDC token address on Polygon
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

  // Update timeout times required by account levels
  function updateHoldingTime (uint256 newHoldingTime) public onlyOwner {
    holdingTime = newHoldingTime;
    emit HoldingTimeUpdate(holdingTime);
  }

  // Update baseFee, format is percent multiplied by 10,000
  function updateBaseFee(uint256 _newbaseFeeTimes10k) public onlyOwner {
    baseFeeTimes10k = _newbaseFeeTimes10k;
    emit BaseFeeUpdate(_newbaseFeeTimes10k);
  }

  // Receives all incoming Matic, sent directly (there is no need to send Matic in this way though)
  receive() external payable {    
  }
}