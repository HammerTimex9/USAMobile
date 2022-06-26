const { expect } = require("chai");
const { ethers } = require("hardhat");
const { fixture } = deployments;

// Customized helpers

let tokensShouldExistNowGlobalV;
let mintPriceTotalInUSDCshouldBeNowGlobalV; 
let mintFeeInUSDCshouldBeNowGlobalV; 
let mintAllowanceInUSDCCentsshouldBeNowGlobalV;
let burnReturnWOfeeInUSDCshouldBeNowGlobalV;
let burnFeeInUSDCshouldBeNowGlobalV;
let transferFeeshouldBeNowInUSDCcentsGlobalV;

let tokensExistQueriedGlobalV;
let mintPriceTotalInUSDCWasPaidNowGlobalV;
let mintFeeInUSDCWasPaidNowGlobalV;
let mintAllowanceInUSDCCentsWasNowGlobalV;
let burnReturnWOfeeInUSDCWasPaidNowGlobalV;
let burnFeeInUSDCWasPaidNowGlobalV;
let transferFeeWasPaidNowInUSDCcentsGlobalV;

let protocolUSDCbalWithoutInterestInCentsGlobalV = 0;

let testUserAddressesArray = [];
let totalUSDCcentsEntriesArr = [];
let liquidCentsArray = [];

const scale6dec = 1000000;

let baseFeeTimes10k;
let blocksPerDay;
let curveFactor;
let neededBNJIperLevel;
let holdingTime;

let benjaminsContract;

// 6 decimals
let polygonUSDC;
const polygonUSDCaddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// 6 decimals
let polygonAMUSDC;
const polygonAMUSDCAddress = '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F';

let polygonWMATIC;
const polygonWMATICaddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

let polygonQuickswapRouter;
const polygonQuickswapRouterAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';

let polygonLendingPool;
let polygonLendingPoolAddress; 

let testUser_1_Signer;

let user1LevelDataArray = [];
let user2LevelDataArray = [];
let user3LevelDataArray = [];
let user4LevelDataArray = [];

// querrying and saving account levels for userToCheck to an array for later confirmation
async function addUserAccDataPoints(userToCheck){
 
  const accountLevelNow = await getAccountLevel(userToCheck);
    
  if (userToCheck == testUser_1){
    user1LevelDataArray.push(accountLevelNow);    
  } else if (userToCheck == testUser_2) {
    user2LevelDataArray.push(accountLevelNow);    
  } else if (userToCheck == testUser_3){
    user3LevelDataArray.push(accountLevelNow);    
  } else if (userToCheck == testUser_4) {
    user4LevelDataArray.push(accountLevelNow);    
  } 
}

// confirms account level as recorded via addUserAccDataPoints function
function confirmUserDataPoints(userToCheck, expectedAccountLevelsArray) {
  if  (userToCheck == testUser_1){
    for (let index = 0; index < user1LevelDataArray.length; index++) {    
      expect(user1LevelDataArray[index]).to.equal(expectedAccountLevelsArray[index]);       
    }
  } else if (userToCheck == testUser_2) {
    for (let index = 0; index < user2LevelDataArray.length; index++) {
      expect(user2LevelDataArray[index]).to.equal(expectedAccountLevelsArray[index]);      
    }
  } else if (userToCheck == testUser_3) {
    for (let index = 0; index < user2LevelDataArray.length; index++) {
      expect(user3LevelDataArray[index]).to.equal(expectedAccountLevelsArray[index]);      
    }
  } else if (userToCheck == testUser_4) {
    for (let index = 0; index < user2LevelDataArray.length; index++) {
      expect(user4LevelDataArray[index]).to.equal(expectedAccountLevelsArray[index]);      
    }
  }
  else {
    console.log("usertocheck was not found ---------------------------------------------------------------------");
  }

  // resetting for next test
  user1LevelDataArray = [];  
  user2LevelDataArray = [];  
}

async function getContractsHoldingTimeAndConfirmIt(daysToConfirm) {  
  minHoldingTimeInBlocks = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getHoldingTime());  
  expect(minHoldingTimeInBlocks).to.equal(daysToConfirm * blocksPerDay);   
}

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

// simulate the passing of blocks
async function mintBlocks (amountOfBlocksToMint) {
  for (let i = 0; i < amountOfBlocksToMint; i++) {
    await ethers.provider.send("evm_mine");
  }
}

async function passTime(loopsToRun) {
  for (let index = 0; index < loopsToRun; index++) {
    await mintBlocks(10000);
    waitFor(2000);        
  }
}

async function getBlockheightNow() {
  const blockHeightNow = await ethers.provider.getBlockNumber();
  return blockHeightNow;
}

async function balUSDC(userToQuery) {
  return (await balUSDCinCents(userToQuery) /100);
}

async function balAMUSDC(userToQuery) {
  return (await balAMUSDCinCents(userToQuery) /100);
}

async function balUSDCinCents(userToQuery) {
  return dividefrom6decToUSDCcents(bigNumberToNumber(await polygonUSDC.balanceOf(userToQuery)));
}

async function balAMUSDCinCents(userToQuery) {
  return dividefrom6decToUSDCcents(bigNumberToNumber(await polygonAMUSDC.balanceOf(userToQuery)));
}

async function balUSDCin6decBN(userToQuery) {
  return await polygonUSDC.balanceOf(userToQuery);
}

async function balBNJI(userToQuery) {
  return bigNumberToNumber (await benjaminsContract.balanceOf(userToQuery));
}

async function getMATICbalance(adress) {    
  const balanceInWEI = await ethers.provider.getBalance(adress); 
  const balanceInMATIC = Number(balanceInWEI / (10**18) );        
  return balanceInMATIC;
}

// converting BN big numbers to normal numbers
function bigNumberToNumber(bignumber) {
  let convertedNumber = Number ((ethers.utils.formatUnits(bignumber, 0)).toString());  
  return Number (convertedNumber);
}

// converting from 6dec to USDC cents
function dividefrom6decToUSDCcents (largeNumber) {
  const numberInUSDC = Number( largeNumber / (10**4) );      
  return numberInUSDC;    
}

// converting from USDC to 6dec
function multiplyFromUSDCto6dec (smallNumber) {
  const numberInUSDC = Number( smallNumber * (10**6) );      
  return numberInUSDC;    
}

// converting from USDC cents to 6dec 
function multiplyFromUSDCcentsTo6dec (smallNumber) {
  const numberInUSDC = Number( smallNumber * (10**4) );      
  return numberInUSDC;    
}

// converting cents to USDC
function fromCentsToUSDC (numberInCents) {
  const numberInUSDC = numberInCents /100;      
  return numberInUSDC;    
}

function getRoundedFee(principalInUSDCcents){    
  const feeModifier = baseFeeTimes10k;
  const feeStarterInCents = ((principalInUSDCcents * feeModifier ) / 1000000);   
  const feeInCentsRoundedDown = feeStarterInCents - (feeStarterInCents % 1);
  return feeInCentsRoundedDown  
}

async function depositAdditionalUSDC(amountUSDCin6dec) {
  await polygonUSDC.connect(deployerSigner).approve(polygonLendingPoolAddress, amountUSDCin6dec);  
  await polygonLendingPool.connect(deployerSigner).deposit(polygonUSDCaddress, amountUSDCin6dec, benjaminsContract.address, 0);       
}

// checking balances and adding them up
async function checkTestAddresses(amountUSDC, amountMatic, amountBNJI, expectBool){
  let totalUSDCcentsInTestAccs = 0;

  for (let index = 0; index < testUserAddressesArray.length; index++) {
    const testUserAddress = testUserAddressesArray[index];  
    const testAccUSDCcentsbal = await balUSDCinCents(testUserAddress);
    const testAccMATICbal = await getMATICbalance(testUserAddress);
    const testAccBNJIbal = await balBNJI(testUserAddress);

    // if arg 'expectBool' was sent in as true, verify preparation did work as expected
    if (expectBool == true){       
      expect(testAccUSDCcentsbal).to.equal(amountUSDC*100);
      expect(testAccMATICbal).to.equal(amountMatic);
      expect(testAccBNJIbal).to.equal(amountBNJI);
    }  
    // add each account's amount of USDCcents onto the counter
    totalUSDCcentsInTestAccs += testAccUSDCcentsbal;    
  }
  let nowUSDCcentsInAllTestAccs = totalUSDCcentsInTestAccs;
  // keep log of all USDCcents found in testaccounts, save each reound of queries to totalUSDCcentsEntriesArr
  totalUSDCcentsEntriesArr.push(totalUSDCcentsInTestAccs);   
 
  return nowUSDCcentsInAllTestAccs;
}


async function countAllCents() {
  const centsInAllTestUsers = await checkTestAddresses();
  const feeReceiverCents = await balUSDCinCents(feeReceiver); 
  const withdrawReceiverCents = await balUSDCinCents( withdrawReceiver); 
  const deployerCents = await balUSDCinCents(deployer);
  const protocolCents = protocolUSDCbalWithoutInterestInCentsGlobalV;    


  const allLiquidCents = centsInAllTestUsers + feeReceiverCents + withdrawReceiverCents + protocolCents + deployerCents;  

  liquidCentsArray.push(allLiquidCents);  

  //console.log(`These are the entries each time all liquid USDCcents were counted: `, liquidCentsArray); 

  // verifying that amount of counted cents is always the same
  // starts at second array entry and compares all entries to the one before
  for (let index = 1; index < liquidCentsArray.length; index++) {
    expect(liquidCentsArray[index]).to.equal(liquidCentsArray[index-1]);    
  };

  return allLiquidCents;

}

async function testTransfer(amountBNJItoTransfer, callingAccAddress, receivingAddress, isTransferFrom, fromSenderAddress){
   
  // allowing benjaminsContract to handle USDC for ${callingAcc}   
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
     
  if (isTransferFrom == false) {   
    // calling transfer function on benjaminscontract     
    await benjaminsContract.connect(callingAccSigner).transfer(receivingAddress, amountBNJItoTransfer);
  } else {
    
    // BNJI owner gives necessary USDC approval for fee to benjaminsContract
    const fromSenderSigner = await ethers.provider.getSigner(fromSenderAddress);   
    
    // BNJI owner allows callingAccAddress to handle amountBNJItoTransfer BNJI 
    await benjaminsContract.connect(fromSenderSigner).approve(callingAccAddress, amountBNJItoTransfer);  
    
    // now transferFrom can be carried out by callingAccAddress on behalf of fromSenderAddress
    benjaminsContract.connect(callingAccSigner).transferFrom(fromSenderAddress, receivingAddress, amountBNJItoTransfer);
  }

}

async function testMinting(amountToMint, callingAccAddress, receivingAddress) {

  const callingAccUSDCBalanceBeforeMintInCents = await balUSDCinCents(callingAccAddress);  
  const feeReceiverUSDCBalanceBeforeMintInCents = await balUSDCinCents(feeReceiver);  
  
  const totalSupplyBeforeMint = bigNumberToNumber(await benjaminsContract.totalSupply());
  const reserveBeforeMintIn6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());

  // allowing benjaminsContract to handle USDC for ${callingAcc}   
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
  
  const restAllowanceToBNJIcontractIn6dec = await polygonUSDC.allowance(callingAccAddress, benjaminsContract.address);
  expect(await restAllowanceToBNJIcontractIn6dec).to.equal(0);
  
  const amountToApproveIn6dec = await calcMintApprovalAndPrep(amountToMint);  

  await polygonUSDC.connect(callingAccSigner).approve(benjaminsContract.address, amountToApproveIn6dec); 
  
  const givenAllowanceToBNJIcontractIn6dec = await polygonUSDC.allowance(callingAccAddress, benjaminsContract.address); 
  expect(Number (amountToApproveIn6dec)).to.equal(Number (givenAllowanceToBNJIcontractIn6dec));
    
  await benjaminsContract.connect(callingAccSigner).mintTo(amountToMint, receivingAddress);  

  const totalSupplyAfterMint = bigNumberToNumber(await benjaminsContract.totalSupply()); 
  const reserveAfterMintIn6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());  

  const callingAccUSDCBalanceAfterMintInCents = await balUSDCinCents(callingAccAddress);   
  const feeReceiverUSDCBalanceAfterMintInCents = await balUSDCinCents(feeReceiver); 
 
  const callingAccMintPricePaidInCents = callingAccUSDCBalanceBeforeMintInCents - callingAccUSDCBalanceAfterMintInCents;
 
  const feeReceiverUSDCdiffMintInCents = feeReceiverUSDCBalanceAfterMintInCents - feeReceiverUSDCBalanceBeforeMintInCents;  
  
  const mintPriceWithoutFeeIn6dec = multiplyFromUSDCcentsTo6dec(callingAccMintPricePaidInCents) - multiplyFromUSDCto6dec(mintFeeInUSDCshouldBeNowGlobalV);
  
  expect(totalSupplyAfterMint).to.equal(totalSupplyBeforeMint + amountToMint);

  // reserve in protocol is expected to be increased by the mint price without the fees,
  // since protocol only receives the amount before fees
  expect(reserveAfterMintIn6dec).to.equal(reserveBeforeMintIn6dec + mintPriceWithoutFeeIn6dec);
  
  // since amUSDC amounts change due to interest accrued, transfer amount WITHOUT fees are saved globally for comparison
  // here, transfer amount refers to USDC cents amounts of funds received by the protocol, from the user
  const againstInterestDistortionInCents = callingAccMintPricePaidInCents - feeReceiverUSDCdiffMintInCents;
  protocolUSDCbalWithoutInterestInCentsGlobalV += againstInterestDistortionInCents;  

  mintPriceTotalInUSDCWasPaidNowGlobalV = fromCentsToUSDC(callingAccMintPricePaidInCents);
  mintFeeInUSDCWasPaidNowGlobalV = feeReceiverUSDCdiffMintInCents/100;
  tokensExistQueriedGlobalV = totalSupplyAfterMint;
  mintAllowanceInUSDCCentsWasNowGlobalV = dividefrom6decToUSDCcents(givenAllowanceToBNJIcontractIn6dec);
  
  confirmMint();
};

async function testBurning(amountToBurn, callingAccAddress, receivingAddress, isEndburn) { 

  const receivingAddressUSDCBalanceBeforeBurnInCents = await balUSDCinCents(receivingAddress); 
  const feeReceiverUSDCBalanceBeforeBurnInCents = await balUSDCinCents(feeReceiver); 

  const totalSupplyBeforeBurn = bigNumberToNumber(await benjaminsContract.totalSupply());
  const reserveBeforeBurnIn6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);

  await calcBurnVariables(amountToBurn, false);

  // descr: function burnTo(uint256 _amount, address _toWhom)
  await benjaminsContract.connect(callingAccSigner).burnTo(amountToBurn, receivingAddress);    

  const totalSupplyAfterBurn = bigNumberToNumber( await benjaminsContract.totalSupply() ); 
  const reserveAfterBurnIn6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());

  const receivingAccUSDCBalanceAfterBurnInCents = await balUSDCinCents(receivingAddress);      
  const feeReceiverUSDCBalanceAfterBurnInCents = await balUSDCinCents(feeReceiver); 
  
  const receivingAccBurnReturnReceivedInCents = receivingAccUSDCBalanceAfterBurnInCents - receivingAddressUSDCBalanceBeforeBurnInCents;  
  const feeReceiverUSDCdiffBurnInCents = feeReceiverUSDCBalanceAfterBurnInCents - feeReceiverUSDCBalanceBeforeBurnInCents; 
    
  const burnReturnAfterFeeIn6dec = multiplyFromUSDCcentsTo6dec(receivingAccBurnReturnReceivedInCents + feeReceiverUSDCdiffBurnInCents);  

  expect(totalSupplyAfterBurn).to.equal(totalSupplyBeforeBurn - amountToBurn);
  
  if (isEndburn == true) {
    // if all tokens are burnt, at the end reserveAfterBurnIn6dec should equal 0
    expect(reserveAfterBurnIn6dec).to.equal(0);    
  } else {
    // reserve in protocol is expected to be decreased by the burn return including the fees, 
    // since both are paid by the protocol, then split between user and feeReceiver
    expect(reserveAfterBurnIn6dec).to.equal(reserveBeforeBurnIn6dec - burnReturnAfterFeeIn6dec);    
  }

  // since amUSDC amounts change due to interest accrued, transfer amount WITHOUT fees are saved globally for comparison
  // here, transfer amount refers to USDC cents amounts of funds paid out by the protocol, to the user, plus fees, paid by protocol to feeReceiver
  const againstInterestDistortionInCents = receivingAccBurnReturnReceivedInCents + feeReceiverUSDCdiffBurnInCents;
  protocolUSDCbalWithoutInterestInCentsGlobalV -= againstInterestDistortionInCents;

  burnReturnWOfeeInUSDCWasPaidNowGlobalV = fromCentsToUSDC(receivingAccBurnReturnReceivedInCents);
  burnFeeInUSDCWasPaidNowGlobalV = feeReceiverUSDCdiffBurnInCents/100;
  tokensExistQueriedGlobalV = totalSupplyAfterBurn;

  confirmBurn();
};

function resetTrackers(){
  tokensShouldExistNowGlobalV = 0;
  mintPriceTotalInUSDCshouldBeNowGlobalV = 0; 
  mintFeeInUSDCshouldBeNowGlobalV = 0; 
  mintAllowanceInUSDCCentsshouldBeNowGlobalV = 0;
  burnReturnWOfeeInUSDCshouldBeNowGlobalV = 0;
  burnFeeInUSDCshouldBeNowGlobalV = 0;
  transferFeeshouldBeNowInUSDCcentsGlobalV = 0;

  tokensExistQueriedGlobalV = 0;
  mintPriceTotalInUSDCWasPaidNowGlobalV = 0;
  mintFeeInUSDCWasPaidNowGlobalV = 0;
  mintAllowanceInUSDCCentsWasNowGlobalV = 0;
  burnReturnWOfeeInUSDCWasPaidNowGlobalV = 0;
  burnFeeInUSDCWasPaidNowGlobalV = 0;
  transferFeeWasPaidNowInUSDCcentsGlobalV = 0;

  user1LevelDataArray = [];  
  user2LevelDataArray = [];
} 

function confirmMint(){  
  
  expect(tokensShouldExistNowGlobalV).to.equal( Number (tokensExistQueriedGlobalV));
  expect(mintPriceTotalInUSDCshouldBeNowGlobalV).to.equal(Number (mintPriceTotalInUSDCWasPaidNowGlobalV));
  expect(mintFeeInUSDCshouldBeNowGlobalV).to.equal(Number (mintFeeInUSDCWasPaidNowGlobalV));
  expect(mintAllowanceInUSDCCentsshouldBeNowGlobalV).to.equal(Number (mintAllowanceInUSDCCentsWasNowGlobalV));
};

function confirmBurn(){  
  
  expect(tokensShouldExistNowGlobalV).to.equal(Number(tokensExistQueriedGlobalV));
  expect(burnReturnWOfeeInUSDCshouldBeNowGlobalV).to.equal(Number(burnReturnWOfeeInUSDCWasPaidNowGlobalV));
  expect(burnFeeInUSDCshouldBeNowGlobalV).to.equal(Number(burnFeeInUSDCWasPaidNowGlobalV));
};

async function calcMintApprovalAndPrep(amountToMint) {  
  
  const amountOfTokensBeforeMint = bigNumberToNumber(await benjaminsContract.totalSupply());
  const amountOfTokensAfterMint = Number (amountOfTokensBeforeMint) + Number (amountToMint);
 
  // starting with minting costs, then rounding down to cents
  const mintingCostinUSDC = ((amountOfTokensAfterMint * amountOfTokensAfterMint) - (amountOfTokensBeforeMint * amountOfTokensBeforeMint)) / curveFactor;
  const mintingCostInCents = mintingCostinUSDC * 100;
  const mintingCostRoundedDownInCents = mintingCostInCents - (mintingCostInCents % 1);

  const mintFeeInCentsRoundedDown = getRoundedFee(mintingCostRoundedDownInCents);   

  // results, toPayTotalInUSDC can be displayed to user
  const toPayTotalInCents = mintingCostRoundedDownInCents + mintFeeInCentsRoundedDown;
  const toPayTotalInUSDC = toPayTotalInCents / 100;
  const toPayTotalIn6dec = toPayTotalInCents * 10000;    

  tokensShouldExistNowGlobalV = amountOfTokensAfterMint;
  mintPriceTotalInUSDCshouldBeNowGlobalV = toPayTotalInUSDC;
  mintFeeInUSDCshouldBeNowGlobalV = mintFeeInCentsRoundedDown/100;
  mintAllowanceInUSDCCentsshouldBeNowGlobalV = toPayTotalInCents;   

  return toPayTotalIn6dec;
}

async function calcBurnVariables(amountToBurn, isTransfer) {

  const amountOfTokensBeforeBurn = bigNumberToNumber(await benjaminsContract.totalSupply());  
  const amountOfTokensAfterBurn = amountOfTokensBeforeBurn - amountToBurn;

  const burnReturnInUSDC = ( (amountOfTokensBeforeBurn * amountOfTokensBeforeBurn) - (amountOfTokensAfterBurn * amountOfTokensAfterBurn) ) / curveFactor;
  const burnReturnInCents = burnReturnInUSDC * 100;
  const burnReturnRoundedDownInCents = burnReturnInCents - (burnReturnInCents % 1);  
  
  const burnFeeInCentsRoundedDown = getRoundedFee(burnReturnRoundedDownInCents); 

  const toReceiveTotalInCents = burnReturnRoundedDownInCents - burnFeeInCentsRoundedDown;
  const toReceiveTotalInUSDC = toReceiveTotalInCents / 100;
   
  if (isTransfer==false){
    tokensShouldExistNowGlobalV = amountOfTokensAfterBurn;
    burnReturnWOfeeInUSDCshouldBeNowGlobalV = toReceiveTotalInUSDC;
    burnFeeInUSDCshouldBeNowGlobalV = burnFeeInCentsRoundedDown/100;
  } else {
    transferFeeshouldBeNowInUSDCcentsGlobalV = burnFeeInCentsRoundedDown;
    return burnFeeInCentsRoundedDown;
  }  
}

async function testIncreaseLevel(callingAccAddress, amountOfLevelsToGet, expectedStartingLevel) {

  // temp
  const blockheightbefore = await getBlockheightNow();
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
  const costInBNJI = (amountOfLevelsToGet*neededBNJIperLevel);

  const beforeLevelIncrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const beforeLevelIncrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address);  
  
  const beforeLevelIncrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress);  

  const beforeLevelIncrease_UsersLockedBNJI = await lockedBalanceOf(callingAccAddress);
  const beforeLevelIncrease_UsersAccountLevel = await getAccountLevel(callingAccAddress);   

  const beforeLevelIncrease_AccountLevelExpected = beforeLevelIncrease_UsersLockedBNJI / neededBNJIperLevel;
  
  await benjaminsContract.connect(callingAccSigner).increaseAccountLevels(amountOfLevelsToGet);
  
  const blockheightNow = await getBlockheightNow();
  
  const afterLevelIncrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const afterLevelIncrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address); 

  const afterLevelIncrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const afterLevelIncrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress); 

  const afterLevelIncrease_UsersLockedBNJI = await lockedBalanceOf(callingAccAddress);
  const afterLevelIncrease_UsersAccountLevel = await getAccountLevel(callingAccAddress);  
  
  const afterLevelIncrease_LockedBNJIExpected = afterLevelIncrease_UsersAccountLevel * neededBNJIperLevel;

  // updated unlock timestamp and amount of blocks to wait should now be updated
  const afterLevelIncrease_AmountOfBlocksToWaitExpected = holdingTime;
  const afterLevelIncrease_UnlockTimestampExpected = blockheightNow + afterLevelIncrease_AmountOfBlocksToWaitExpected;
  
  // user's accountLevel at the start should be equal to expected, sent in value
  expect(beforeLevelIncrease_UsersAccountLevel).to.equal(expectedStartingLevel); 
  // user's accountLevel at the start should be equal to calculated value (using beforeLevelIncrease_UsersLockedBNJI)
  expect(expectedStartingLevel).to.equal(beforeLevelIncrease_AccountLevelExpected);  
  
  // user's unlocked BNJI balance after level increase should be equal to before, minus the costInBNJI that were locked 
  expect(afterLevelIncrease_BNJIbal_User).to.equal(beforeLevelIncrease_BNJIbal_User - costInBNJI);   
  // the same amount should now be added to the benjaminsContract's balance of unlocked BNJI
  expect(afterLevelIncrease_BNJIbal_Contract).to.equal(beforeLevelIncrease_BNJIbal_Contract + costInBNJI);  
  
  // unlock timestamp should be updated (increased) when increasing level
  expect(afterLevelIncrease_UsersUnlockTimestamp).to.be.greaterThan(beforeLevelIncrease_UsersUnlockTimestamp);
  
  // unlock timestamp and amount of blocks to wait should now be calculated relating to new account level
  expect(afterLevelIncrease_AmountOfBlocksToWait).to.equal(afterLevelIncrease_AmountOfBlocksToWaitExpected);  
  expect(afterLevelIncrease_UsersUnlockTimestamp).to.equal(afterLevelIncrease_UnlockTimestampExpected);  
  
  // user's balance of locked BNJI after level increase should be equal to calculated value (see above)  
  expect(afterLevelIncrease_UsersLockedBNJI).to.equal(afterLevelIncrease_LockedBNJIExpected);  
  // user's balance of locked BNJI after level increase should be equal to before, plus the costInBNJI that were locked 
  expect(afterLevelIncrease_UsersLockedBNJI).to.equal(beforeLevelIncrease_UsersLockedBNJI + costInBNJI); 

  // user's account level after level increase should be equal to before, plus the amountOfLevelsToGet
  expect(afterLevelIncrease_UsersAccountLevel).to.equal(beforeLevelIncrease_UsersAccountLevel + amountOfLevelsToGet);    

}  

async function howLongUntilUnlock(userToCheck) {
  return (bigNumberToNumber (await benjaminsContract.howManyBlocksUntilUnlock(userToCheck)));
}


async function getUnlockTimestamp(userToCheck) {
  return (bigNumberToNumber (await benjaminsContract.getUsersUnlockTimestamp(userToCheck)));
}

async function lockedBalanceOf(userToCheck) {
  return (bigNumberToNumber (await benjaminsContract.lockedBalanceOf(userToCheck)));
}

async function getAccountLevel(userToCheck){
  const usersAccountLevel = bigNumberToNumber (await benjaminsContract.getUsersAccountLevel(userToCheck));
  return usersAccountLevel;
}




async function testDecreaseLevel(callingAccAddress, amountOfLevelsToDecrease, expectedStartingLevel) {
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
  const returnInBNJI = (amountOfLevelsToDecrease*neededBNJIperLevel);

  const beforeLevelDecrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const beforeLevelDecrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address);
  
  const beforeLevelDecrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const beforeLevelDecrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress);  

  const beforeLevelDecrease_UsersLockedBNJI = await lockedBalanceOf(callingAccAddress);
  const beforeLevelDecrease_UsersAccountLevel = await getAccountLevel(callingAccAddress); 

  const beforeLevelDecrease_AccountLevelExpected = beforeLevelDecrease_UsersLockedBNJI / neededBNJIperLevel;
  
  await benjaminsContract.connect(callingAccSigner).decreaseAccountLevels(amountOfLevelsToDecrease);
  


  const afterLevelDecrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const afterLevelDecrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address); 

  const afterLevelDecrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const afterLevelDecrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress); 

  const afterLevelDecrease_UsersLockedBNJI = await lockedBalanceOf(callingAccAddress);
  const afterLevelDecrease_UsersAccountLevel = await getAccountLevel(callingAccAddress);  
 
  const afterLevelDecrease_LockedBNJIExpected = afterLevelDecrease_UsersAccountLevel * neededBNJIperLevel;
  
  
  // user's accountLevel at the start should be equal to expected, sent in value
  expect(beforeLevelDecrease_UsersAccountLevel).to.equal(expectedStartingLevel); 
  // user's accountLevel at the start should be equal to calculated value (using beforeLevelDecrease_UsersLockedBNJI)
  expect(expectedStartingLevel).to.equal(beforeLevelDecrease_AccountLevelExpected);  
 
  // benjaminsContract's unlocked BNJI balance after level decrease should be equal to before, minus the returnInBNJI that were unlocked 
  expect(afterLevelDecrease_BNJIbal_Contract).to.equal(beforeLevelDecrease_BNJIbal_Contract - returnInBNJI);  

  // the same amount should now be added to the user's balance of unlocked BNJI 
  expect(afterLevelDecrease_BNJIbal_User).to.equal(beforeLevelDecrease_BNJIbal_User + returnInBNJI);     
  
  // unlock timestamp and amount of blocks to wait should NOT be updated by using decrease level functionality 
  expect(afterLevelDecrease_UsersUnlockTimestamp).to.equal(beforeLevelDecrease_UsersUnlockTimestamp);
  expect(afterLevelDecrease_AmountOfBlocksToWait).to.equal(beforeLevelDecrease_AmountOfBlocksToWait);

  // amount of blocks to wait should be zero, before and after the level decrease
  expect(beforeLevelDecrease_AmountOfBlocksToWait).to.equal(0);
  expect(afterLevelDecrease_AmountOfBlocksToWait).to.equal(0);
   
  // user's balance of locked BNJI after level decrease should be equal to calculated value (see above)  
  expect(afterLevelDecrease_UsersLockedBNJI).to.equal(afterLevelDecrease_LockedBNJIExpected);  
  // user's balance of locked BNJI after level decrease should be equal to before, minus the returnInBNJI that were unlocked 
  expect(afterLevelDecrease_UsersLockedBNJI).to.equal(beforeLevelDecrease_UsersLockedBNJI - returnInBNJI); 

  // user's account level after level decrease should be equal to before, minus the amountOfLevelsToDecrease
  expect(afterLevelDecrease_UsersAccountLevel).to.equal(beforeLevelDecrease_UsersAccountLevel - amountOfLevelsToDecrease);  
}











describe("Testing Benjamins", function () {

  // setting instances of contracts
  beforeEach(async function() {   

    ({ deployer, feeReceiver, withdrawReceiver, testUser_1, testUser_2, testUser_3, testUser_4, testUser_5 } = await getNamedAccounts());

    // xxxx temp
    //console.log('feeReceiver', feeReceiver);
    //console.log('withdrawReceiver', withdrawReceiver);
    
    testUserAddressesArray = [];
    totalUSDCcentsEntriesArr = [];
    liquidCentsArray = [];
    protocolUSDCbalWithoutInterestInCentsGlobalV = 0;

    deployerSigner = await ethers.provider.getSigner(deployer);   
    testUser_1_Signer = await ethers.provider.getSigner(testUser_1);     

    testUserAddressesArray.push(testUser_1);
    testUserAddressesArray.push(testUser_2);
    testUserAddressesArray.push(testUser_3);
    testUserAddressesArray.push(testUser_4);
    testUserAddressesArray.push(testUser_5);    
    
    // Deploy contract
    await fixture(["Benjamins"]);
    benjaminsContract = await ethers.getContract("Benjamins");      

    // Get amount of blocksPerDay into this testing suite
    blocksPerDay = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getBlocksPerDay());

    // Get baseFeeTimes10k into this testing suite
    baseFeeTimes10k = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getBaseFeeTimes10k());

    // Get curveFactor into this testing suite
    curveFactor = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getCurveFactor());

    // Get neededBNJIperLevel into this testing suite
    neededBNJIperLevel = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getneededBNJIperLevel());

    // Get polygonLendingPoolAddress into this testing suite
    polygonLendingPoolAddress = await benjaminsContract.connect(deployerSigner).getPolygonLendingPool();
      
    holdingTime = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getHoldingTime());  


    polygonUSDC = new ethers.Contract(
      polygonUSDCaddress,
      [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
        'function balanceOf(address account) external view returns (uint256)',
        'function transfer(address recipient, uint256 amount) external returns (bool)',
      ], 
      deployerSigner
    );

    polygonAMUSDC = new ethers.Contract(
      polygonAMUSDCAddress,
      [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
        'function balanceOf(address account) external view returns (uint256)',
        'function transfer(address recipient, uint256 amount) external returns (bool)',
      ], 
      deployerSigner
    );   
   
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x986a2fCa9eDa0e06fBf7839B89BfC006eE2a23Dd"],
    });

    const whaleSigner = await ethers.getSigner("0x986a2fCa9eDa0e06fBf7839B89BfC006eE2a23Dd");

    polygonUSDCWhaleSignedIn = new ethers.Contract(
      polygonUSDCaddress,
      [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
        'function balanceOf(address account) external view returns (uint256)',
        'function transfer(address recipient, uint256 amount) external returns (bool)',
      ], 
      whaleSigner
    );    

    whaleSignerAddress = whaleSigner.address;   
      
    await whaleSigner.sendTransaction({
      to: deployer,
      value: ethers.utils.parseEther("5201000") // 5,201,000 MATIC
    })

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: ["0x986a2fCa9eDa0e06fBf7839B89BfC006eE2a23Dd"],
    });    
 
    polygonWMATIC = new ethers.Contract(
      polygonWMATICaddress,
      [
        'function approve(address guy, uint wad) public returns (bool)',
        'function transfer(address dst, uint wad) public returns (bool)',
        'function balanceOf(address account) external view returns (uint256)',
        'function deposit() public payable',            
      ], 
      deployerSigner
    );
    
    await polygonWMATIC.connect(deployerSigner).deposit( {value: ethers.utils.parseEther("5200000")} );
  
    polygonQuickswapRouter = new ethers.Contract(
      polygonQuickswapRouterAddress,
      [
       'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',      
       'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)', 
       'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
       'function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut)',
       'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',       
      ], 
      deployerSigner
    );     

    await polygonWMATIC.connect(deployerSigner).approve( polygonQuickswapRouterAddress, ethers.utils.parseEther("82000000000") );

    const amountToReceiveUSDCIn6dec = 4210000 * (10**6)
    const amountInMaxInWEI = ethers.utils.parseEther("6000000");   
    await polygonQuickswapRouter.connect(deployerSigner).swapTokensForExactTokens( amountToReceiveUSDCIn6dec, amountInMaxInWEI , [polygonWMATICaddress, polygonUSDCaddress], deployer, 1665102928);  
                 
    resetTrackers();
    
    // First setup mint for 100k USDC
    await testMinting(890000, deployer, deployer);    

    await benjaminsContract.connect(deployerSigner).unpause(); 
        
    for (let index = 0; index < testUserAddressesArray.length; index++) {
      const testingUser = testUserAddressesArray[index];      

      await deployerSigner.sendTransaction({
        to: testingUser,
        value: ethers.utils.parseEther("10") // 10 MATIC
      })
      
      await polygonUSDC.connect(deployerSigner).transfer(testingUser, (10000*scale6dec) );
             
    } 

    polygonLendingPool = new ethers.Contract(
      polygonLendingPoolAddress,
      [
        'function getUserAccountData(address user) external view returns ( uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
        'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode ) external'
      ], 
      deployerSigner
    );  

    await countAllCents();    
    
  })     
  






  

  it("Test 01. Confirming preparation setup", async function () {  
    
    // confirming that every test user has 10,000 USDC, 10 MATIC and 0 BNJI at start
    await checkTestAddresses(10000,10,0, true);
    
    // confirming queried variables
    expect(blocksPerDay).to.equal(2);
    expect(baseFeeTimes10k).to.equal(10000);
    expect(curveFactor).to.equal(8000000);
    expect(neededBNJIperLevel).to.equal(5);
    expect(polygonLendingPoolAddress).to.equal('0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf'); 
    expect(await countAllCents()).to.equal(421000000);   
    expect(await benjaminsContract.decimals()).to.equal(bigNumberToNumber(0));   
    expect(await benjaminsContract.name()).to.equal('Benjamins');   
    expect(await benjaminsContract.symbol()).to.equal('BNJI');   

  });
    
  it("Test 02. testUser_1 should mint 10 BNJI for themself", async function () {  
    await countAllCents();         
    await testMinting(40, testUser_1, testUser_1);      
    expect(await balBNJI(testUser_1)).to.equal(40);    
    await countAllCents();    
  });
  
  it("Test 03. testUser_1 should mint 10 BNJI for themself, then do the same again in the next block", async function () { 
    
    await countAllCents(); 
    await addUserAccDataPoints(testUser_1);  

    // minting 40 BNJI to caller
    await testMinting(40, testUser_1, testUser_1);    
    await addUserAccDataPoints(testUser_1);

    // minting 40 BNJI to caller
    await testMinting( 40, testUser_1, testUser_1);     
    await addUserAccDataPoints(testUser_1);    
    expect(await balBNJI(testUser_1)).to.equal(80);
    
    const expectedUser1Levels = [0,0,0];   
      
    confirmUserDataPoints(testUser_1, expectedUser1Levels);

    await countAllCents(); 
  });
      
  it("Test 04. Owner can pause and unpause contract", async function () {

   // BenjaminsContract is unpaused in the beginning
   expect(await benjaminsContract.paused()).to.equal(false);

   // Owner can pause contract
   await benjaminsContract.connect(deployerSigner).pause();

   // BenjaminsContract is now paused
   expect(await benjaminsContract.paused()).to.equal(true);
   
   // Owner can unpause contract
   await benjaminsContract.connect(deployerSigner).unpause();

   // BenjaminsContract is now unpaused again
   expect(await benjaminsContract.paused()).to.equal(false);
  });
  
  it("Test 05. User can call mint and burn functions directly", async function () {

    await countAllCents(); 

    expect(await balBNJI(testUser_1)).to.equal(0); 

    const amountToApproveIn6dec = await calcMintApprovalAndPrep(4000); 
    await polygonUSDC.connect(testUser_1_Signer).approve(benjaminsContract.address, amountToApproveIn6dec);   

    const willGetDepositedIn6dec = multiplyFromUSDCto6dec(mintPriceTotalInUSDCshouldBeNowGlobalV) - multiplyFromUSDCto6dec(mintFeeInUSDCshouldBeNowGlobalV);
     
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(testUser_1_Signer).mint(4000))
    .to.emit(benjaminsContract, 'LendingPoolDeposit')
    .withArgs(willGetDepositedIn6dec, testUser_1);  

    expect(await balBNJI(testUser_1)).to.equal(4000); 

    await calcBurnVariables(4000, false);

    const willGetWithdrawnIn6dec = multiplyFromUSDCto6dec(burnReturnWOfeeInUSDCshouldBeNowGlobalV) + multiplyFromUSDCto6dec(burnFeeInUSDCshouldBeNowGlobalV);

    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(testUser_1_Signer).burn(4000))
    .to.emit(benjaminsContract, 'LendingPoolWithdrawal')
    .withArgs(willGetWithdrawnIn6dec, testUser_1); 
    
    expect(await balBNJI(testUser_1)).to.equal(0); 

  });

  it("Test 06. Transactions that need approvals revert, when calling without approvals, as expected", async function () {

    await countAllCents(); 

    expect(await balBNJI(testUser_3)).to.equal(0); 
    expect(await balBNJI(testUser_4)).to.equal(0); 

    const testUser_3_Signer = await ethers.provider.getSigner(testUser_3);
    const testUser_4_Signer = await ethers.provider.getSigner(testUser_4);

    // should REVERT, calling without approval at USDC contract
    await expect(benjaminsContract.connect(testUser_3_Signer).mint(1000)).to.be.revertedWith(
      "ERC20: transfer amount exceeds allowance"
    );   

    // should REVERT, calling without approval at USDC contract
    await expect(benjaminsContract.connect(testUser_3_Signer).mintTo(1000, testUser_4)).to.be.revertedWith(
      "ERC20: transfer amount exceeds allowance"
    );
    
    expect(await balBNJI(testUser_3)).to.equal(0); 
    expect(await balBNJI(testUser_4)).to.equal(0);     
      
    // Preparation, minting with approval
    const amountToApproveIn6dec_User3 = await calcMintApprovalAndPrep(1000); 
    await polygonUSDC.connect(testUser_3_Signer).approve(benjaminsContract.address, amountToApproveIn6dec_User3);    
    await benjaminsContract.connect(testUser_3_Signer).mint(1000);  

    expect(await balBNJI(testUser_3)).to.equal(1000); 
    expect(await balBNJI(testUser_4)).to.equal(0);

    // testUser_4 tries to use transferFrom to get 1000 BNJI from testUser_3
    // should REVERT, calling without approval at BNJI contract
    await expect( benjaminsContract.connect(testUser_4_Signer).transferFrom(testUser_3, testUser_4, 1000) ).to.be.revertedWith(
      "Benjamins: transfer amount exceeds allowance"
    );
     
    expect(await balBNJI(testUser_3)).to.equal(1000); 
    expect(await balBNJI(testUser_4)).to.equal(0);
    
    // testUser_3 owner allows testUser_4 to handle/take 1000 BNJI 
    await benjaminsContract.connect(testUser_3_Signer).approve(testUser_4, 1000);  
    
    // now transferFrom can be carried out by testUser_4 on behalf of testUser_3
    await benjaminsContract.connect(testUser_4_Signer).transferFrom(testUser_3, testUser_4, 1000)

    expect(await balBNJI(testUser_3)).to.equal(0); 
    expect(await balBNJI(testUser_4)).to.equal(1000);
  });

  
  it("Test 07. testUser_1 mints 1100 tokens, burns in next block, no need for waiting time", async function () {   
    
    await countAllCents(); 

    expect(await balBNJI(testUser_1)).to.equal(0); 
    expect(await balUSDC(testUser_1)).to.equal(10000); 

    //minting 1100 BNJI to caller
    await testMinting(1100, testUser_1, testUser_1);    
    
    const costInUSDC1 = mintAllowanceInUSDCCentsshouldBeNowGlobalV/100;
    expect(await balBNJI(testUser_1)).to.equal(1100); 
    expect(await balUSDC(testUser_1)).to.equal(9752.66);   
              
    // burning 1100 BNJI directly in the next block
    await testBurning(1100, testUser_1, testUser_1, false);

    const returnInUSDC1 = burnReturnWOfeeInUSDCshouldBeNowGlobalV;
    expect(await balBNJI(testUser_1)).to.equal(0);
    expect(await balUSDC(testUser_1)).to.equal(9995.12); 

    await countAllCents();     
  });    
  
  it("Test 08. Should REVERT: testUser_1 tries to burn more tokens than they have", async function () {   
    
    await countAllCents(); 

    // minting 40 BNJI to caller
    await testMinting(40, testUser_1, testUser_1);    
    
    expect(await balBNJI(testUser_1)).to.equal(40);    

    // should REVERT, burning more BNJI than user has
    await expect(testBurning(43, testUser_1, testUser_1, false)).to.be.revertedWith(
      "Insufficient Benjamins."
    );

    expect(await balBNJI(testUser_1)).to.equal(40);

    await countAllCents(); 
  }); 

  it("Test 09. Token price should go up, following the bonding curve", async function () {  

    await countAllCents(); 

    // minting 2000 BNJI to caller
    await testMinting(2000, testUser_1, testUser_1);
   
    expect(await balBNJI(testUser_1)).to.equal(2000);        
    const balanceUSDCbefore1stBN = await balUSDCin6decBN(testUser_1); 

    // minting 40 BNJI to caller
    await testMinting(40, testUser_1, testUser_1);    
    
    const costInCents1 = mintAllowanceInUSDCCentsshouldBeNowGlobalV;   
    expect(await balBNJI(testUser_1)).to.equal(2040); 

    const balanceUSDCafter1stBN = await balUSDCin6decBN(testUser_1);
    const firstPriceFor40InCents = dividefrom6decToUSDCcents(balanceUSDCbefore1stBN-balanceUSDCafter1stBN);  
    
    // minting 1000 BNJI to caller
    await testMinting(1000, testUser_1, testUser_1);   
    
    expect(await balBNJI(testUser_1)).to.equal(3040);
   
    const balanceUSDCbefore2ndBN = await balUSDCin6decBN(testUser_1);

    // minting 40 BNJI to caller
    await testMinting(40, testUser_1, testUser_1);    
    const costInCents2 = mintAllowanceInUSDCCentsshouldBeNowGlobalV;

    expect(await balBNJI(testUser_1)).to.equal(3080);
    const balanceUSDCafter2ndBN = await balUSDCin6decBN(testUser_1);
    const secondPriceFor40InCents = dividefrom6decToUSDCcents(balanceUSDCbefore2ndBN-balanceUSDCafter2ndBN);

    expect(firstPriceFor40InCents).to.equal(costInCents1);
    expect(secondPriceFor40InCents).to.equal(costInCents2); 

    await countAllCents(); 
  });  
  

  
  it("Test 10. account levels are not triggered by minting", async function () {   

    // Preparation mint
    await testMinting(200000, deployer, deployer);   

    await countAllCents(); 
    await addUserAccDataPoints(testUser_1);  

    // minting 20 BNJI to caller"
    await testMinting(20, testUser_1, testUser_1);  
    expect(await balBNJI(testUser_1)).to.equal(20); 
    await addUserAccDataPoints(testUser_1);

    // minting 1040 BNJI to caller
    await testMinting(1040, testUser_1, testUser_1); 
    expect(await balBNJI(testUser_1)).to.equal(1060); 
    await addUserAccDataPoints(testUser_1);
    
    // minting 1500 BNJI to caller
    await testMinting(1500, testUser_1, testUser_1);    
    expect(await balBNJI(testUser_1)).to.equal(2560);
    await addUserAccDataPoints(testUser_1); 

    const expectedUser1Levels = [0,0,0,0,0,0];            
    confirmUserDataPoints(testUser_1, expectedUser1Levels);    
    
    await countAllCents(); 
  });  

  
  
  it("Test 11. It is possible to mint tokens to another account", async function () {   

    await countAllCents();

    expect(await balBNJI(testUser_1)).to.equal(0);  
    expect(await balBNJI(testUser_2)).to.equal(0);    

    await addUserAccDataPoints(testUser_1); 
    await addUserAccDataPoints(testUser_2); 

    // minting 120 BNJI from user 1 to user 2
    await testMinting(120, testUser_1, testUser_2);    
    
    expect(await balBNJI(testUser_1)).to.equal(0); 
    expect(await balBNJI(testUser_2)).to.equal(120);       
    
    await addUserAccDataPoints(testUser_1); 
    await addUserAccDataPoints(testUser_2); 

    const expectedUser1Levels = [0,0];          
    confirmUserDataPoints(testUser_1, expectedUser1Levels);   

    const expectedUser2Levels = [0,0];           
    confirmUserDataPoints(testUser_2, expectedUser2Levels);

    await countAllCents();
  });  
  
  it("Test 12. It is possible to burn tokens and reward the USDC to another account", async function () {   

    await countAllCents();

    expect(await balBNJI(testUser_1)).to.equal(0);  
    expect(await balBNJI(testUser_2)).to.equal(0);         

    // minting 120 BNJI by testUser_1 for testUser_1
    await testMinting(120, testUser_1, testUser_1);    
    
    const costInUSDC1 = mintAllowanceInUSDCCentsshouldBeNowGlobalV/100; 
    expect(await balBNJI(testUser_1)).to.equal(120); 
    expect(await balBNJI(testUser_2)).to.equal(0);
    
    const user_1_USDCbalBefore = await balUSDC(testUser_1);
    const user_2_USDCbalBefore = await balUSDC(testUser_2);

    // burning 50 BNJI by testUser_1 return goes to testUser_2
    await testBurning(50, testUser_1, testUser_2, false);    
    
    const returnInUSDC1 = burnReturnWOfeeInUSDCshouldBeNowGlobalV;
    expect(await balBNJI(testUser_1)).to.equal(70); 
    expect(await balBNJI(testUser_2)).to.equal(0);  

    const user_1_USDCbalAfter = await balUSDC(testUser_1);
    const user_2_USDCbalAfter = await balUSDC(testUser_2);      
        
    expect(user_1_USDCbalBefore).to.equal(10000-costInUSDC1);    
    expect(user_2_USDCbalBefore).to.equal(10000);

    expect(user_1_USDCbalAfter).to.equal(user_1_USDCbalBefore);   
    expect(user_2_USDCbalAfter).to.equal(user_2_USDCbalBefore + returnInUSDC1);    

    await countAllCents();
      
  }); 
  
  
  it("Test 13. It is possible to transfer tokens", async function () {   

    await countAllCents();  

    expect(await balBNJI(testUser_1)).to.equal(0);  
    expect(await balBNJI(testUser_2)).to.equal(0);    

    await addUserAccDataPoints(testUser_1);
    await addUserAccDataPoints(testUser_2);     

    // minting 120 BNJI to caller
    await testMinting(120, testUser_1, testUser_1);    
    
    expect(await balBNJI(testUser_1)).to.equal(120); 
    await addUserAccDataPoints(testUser_1);     

    // testUser_1 calls transfer to send 40 BNJI from themselves to testUser_2
    await testTransfer(40, testUser_1, testUser_2, false, 0);
    
    expect(await balBNJI(testUser_1)).to.equal(80);    
    expect(await balBNJI(testUser_2)).to.equal(40);     
        
    await addUserAccDataPoints(testUser_1); 
    await addUserAccDataPoints(testUser_2); 
    
    const expectedUser1Levels = [0,0,0];          
    confirmUserDataPoints(testUser_1, expectedUser1Levels);   

    const expectedUser2Levels = [0,0];       
    confirmUserDataPoints(testUser_2, expectedUser2Levels);

    await countAllCents();
  });  
  
  it("Test 14. It is possible to use transferFrom on tokens", async function () {
 
    await countAllCents();

    // Preparation mint
    await testMinting(200000, deployer, deployer); 

    expect(await balBNJI(testUser_1)).to.equal(0);  
    expect(await balBNJI(testUser_2)).to.equal(0);    

    await addUserAccDataPoints(testUser_1);
    await addUserAccDataPoints(testUser_2);     

    // minting 120 BNJI to caller
    await testMinting(120, testUser_1, testUser_1); 
    
    expect(await balBNJI(testUser_1)).to.equal(120); 
    await addUserAccDataPoints(testUser_1); 

    // testUser_3 calls transferFrom to send 30 BNJI from testUser_1 to testUser_2
    await testTransfer(30, testUser_3, testUser_2, true, testUser_1);
    
    expect(await balBNJI(testUser_1)).to.equal(90);    
    expect(await balBNJI(testUser_2)).to.equal(30);     
        
    await addUserAccDataPoints(testUser_1); 
    await addUserAccDataPoints(testUser_2); 
    
    const expectedUser1Levels = [0,0,0];          
    confirmUserDataPoints(testUser_1, expectedUser1Levels);   

    const expectedUser2Levels = [0,0];    
    confirmUserDataPoints(testUser_2, expectedUser2Levels);

    await countAllCents();
  });  
  
  it("Test 15. There is no holding period on transfering BNJI that are not locked", async function () {   

    await countAllCents();

    await addUserAccDataPoints(testUser_1); 
    await addUserAccDataPoints(testUser_2); 

    // minting 60 BNJI to caller
    await testMinting(60, testUser_1, testUser_1);    
    
    expect(await balBNJI(testUser_1)).to.equal(60);
    expect(await balBNJI(testUser_2)).to.equal(0);
    
    await addUserAccDataPoints(testUser_1);    

    await testTransfer(30, testUser_1, testUser_2, false, 0); 

    expect(await balBNJI(testUser_1)).to.equal(30);
    expect(await balBNJI(testUser_2)).to.equal(30);

    await addUserAccDataPoints(testUser_1); 
    await addUserAccDataPoints(testUser_2);
    
    const expectedUser1Levels = [0,0,0];       
    confirmUserDataPoints(testUser_1, expectedUser1Levels); 

    const expectedUser2Levels = [0];
    confirmUserDataPoints(testUser_2, expectedUser2Levels); 

    await countAllCents();
  });  
  
  it("Test 16. Minting, burning, upgrading and downgrading accounts emit events as expected", async function () {   

    // minting 1000 BNJI to caller     
    const amountToApproveIn6dec_forMint = await calcMintApprovalAndPrep(1000);   
    await polygonUSDC.connect(testUser_1_Signer).approve(benjaminsContract.address, amountToApproveIn6dec_forMint); 
           
    const beforeFeeCalcInUSDCin6decMint = multiplyFromUSDCto6dec(mintPriceTotalInUSDCshouldBeNowGlobalV) - multiplyFromUSDCto6dec(mintFeeInUSDCshouldBeNowGlobalV);
    const feeInUSDCin6decMint = multiplyFromUSDCto6dec(mintFeeInUSDCshouldBeNowGlobalV);

    await expect( benjaminsContract.connect(testUser_1_Signer).mint(1000))
    .to.emit(benjaminsContract, 'Exchanged')
    .withArgs(true, testUser_1, testUser_1, 1000, beforeFeeCalcInUSDCin6decMint, feeInUSDCin6decMint);  
    
    // upgrading to account level 1 and confirming event was emitted as expected
    const blockBeforeIncrease = await getBlockheightNow();   
    const lockupTimestampExpected = (blockBeforeIncrease+1) + holdingTime;
    await expect( benjaminsContract.connect(testUser_1_Signer).increaseAccountLevels(1))
    .to.emit(benjaminsContract, 'AccountLevelIncreased')
    .withArgs(testUser_1, (blockBeforeIncrease+1), 5, 1, lockupTimestampExpected);  

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // downgrading to account level 0 and confirming event was emitted as expected
    const blockBeforeDecrease = await getBlockheightNow();   
    await expect( benjaminsContract.connect(testUser_1_Signer).decreaseAccountLevels(1))
    .to.emit(benjaminsContract, 'AccountLevelDecreased')
    .withArgs(testUser_1, (blockBeforeDecrease+1), 5, 0);
        
    await calcBurnVariables(1000, false);
    
    const feeInUSDCin6decBurn = multiplyFromUSDCto6dec(burnFeeInUSDCshouldBeNowGlobalV);
    const beforeFeeCalcInUSDCin6decBurn = multiplyFromUSDCto6dec(burnReturnWOfeeInUSDCshouldBeNowGlobalV) + feeInUSDCin6decBurn; 
    
    const totalSupplyExistingNow = bigNumberToNumber(await benjaminsContract.totalSupply()); 
    
    await expect( benjaminsContract.connect(testUser_1_Signer).burn(1000))
    .to.emit(benjaminsContract, 'Exchanged')
    .withArgs(false, testUser_1, testUser_1, 1000, beforeFeeCalcInUSDCin6decBurn, feeInUSDCin6decBurn);  

    //emit Exchanged(isMint, msg.sender, _forWhom, _amountBNJI, beforeFeeCalcInUSDCin6dec, feeRoundedDownIn6dec); 



  });  
  
  it("Test 17. Account upgrades starting from level 0 work as expected", async function () {   
    
    await countAllCents();

    // testUser_1 upgrades from account level 0 to 1   
    await addUserAccDataPoints(testUser_1); 

    // minting 1000 BNJI to caller
    await testMinting(1000, testUser_1, testUser_1);   
    await addUserAccDataPoints(testUser_1);         
    
    // upgrading to account level 1     
    await testIncreaseLevel(testUser_1, 1, 0); 
    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(995); 

    const expectedUser1Levels    = [0,0, 1];      
    confirmUserDataPoints(testUser_1, expectedUser1Levels);

    await countAllCents();    

    // testUser_2 upgrades from account level 0 to 2
    await addUserAccDataPoints(testUser_2); 

    // minting 2000 BNJI to caller
    await testMinting(2000, testUser_2, testUser_2);   
    await addUserAccDataPoints(testUser_2); 
    
    // upgrading to account level 2
    await testIncreaseLevel(testUser_2, 2, 0);  
    
    await addUserAccDataPoints(testUser_2);   
    expect(await balBNJI(testUser_2)).to.equal(1990); 

    const expectedUser2Levels    = [0,0, 2];       
    confirmUserDataPoints(testUser_2, expectedUser2Levels);

    await countAllCents();
        
    // testUser_3 upgrades from account level 0 to 3 
    await addUserAccDataPoints(testUser_3); 

    // minting 3000 BNJI to caller
    await testMinting(3000, testUser_3, testUser_3);   
    await addUserAccDataPoints(testUser_3); 
    
    // upgrading to account level 3
    await testIncreaseLevel(testUser_3, 3, 0);  
    
    await addUserAccDataPoints(testUser_3);   
    expect(await balBNJI(testUser_3)).to.equal(2985); 

    const expectedUser3Levels    = [0,0, 3];    
    confirmUserDataPoints(testUser_3, expectedUser3Levels);

    await countAllCents();

    // testUser_4 upgrades from account level 0 to 4    
    await addUserAccDataPoints(testUser_4); 
    // minting 4000 BNJI to caller
    await testMinting(4000, testUser_4, testUser_4);   
    await addUserAccDataPoints(testUser_4);     
    // upgrading to account level 4
    await testIncreaseLevel(testUser_4, 4, 0);      
    await addUserAccDataPoints(testUser_4);   
    expect(await balBNJI(testUser_4)).to.equal(3980); 

    const expectedUser4Levels    = [0,0,4];      
    confirmUserDataPoints(testUser_4, expectedUser4Levels);

    await countAllCents();


  });  

  
  it("Test 18. Account upgrades starting from level 1 work as expected", async function () {   
    
    await countAllCents();

    // Preparation: testUser_1 gets account level 1    
    await addUserAccDataPoints(testUser_1); 

    // minting 2000 BNJI to caller
    await testMinting(2000, testUser_1, testUser_1);   
    await addUserAccDataPoints(testUser_1); 
    
    // upgrading to account level 1
    await testIncreaseLevel(testUser_1, 1, 0);  
    
    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(1995); 

    // testUser_1 upgrades from account level 1 to 2   
    await testIncreaseLevel(testUser_1, 1, 1);  
    
    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(1990); 

    const expectedUser1Levels    = [0,0, 1, 2];      
    confirmUserDataPoints(testUser_1, expectedUser1Levels);

    await countAllCents();    

    // Preparation: testUser_2 gets account level 1  
    await addUserAccDataPoints(testUser_2); 
    // minting 3000 BNJI to caller
    await testMinting(3000, testUser_2, testUser_2);   
    await addUserAccDataPoints(testUser_2); 
    expect(await balBNJI(testUser_2)).to.equal(3000);     
    // upgrading to account level 1
    await testIncreaseLevel(testUser_2, 1, 0); 
    await addUserAccDataPoints(testUser_2);   
    expect(await balBNJI(testUser_2)).to.equal(2995); 
    
    // testUser_2 upgrades from account level 1 to 3
    await testIncreaseLevel(testUser_2, 2, 1);  
    await addUserAccDataPoints(testUser_2);   
    expect(await balBNJI(testUser_2)).to.equal(2985); 

    const expectedUser2Levels    = [0,0, 1, 3];
    confirmUserDataPoints(testUser_2, expectedUser2Levels);

    await countAllCents();

    // Preparation: testUser_3 gets account level 1  
    await addUserAccDataPoints(testUser_3); 
    // minting 4000 BNJI to caller
    await testMinting(4000, testUser_3, testUser_3);   
    await addUserAccDataPoints(testUser_3); 
    expect(await balBNJI(testUser_3)).to.equal(4000);     
    // upgrading to account level 1
    await testIncreaseLevel(testUser_3, 1, 0); 
    await addUserAccDataPoints(testUser_3);   
    expect(await balBNJI(testUser_3)).to.equal(3995); 
        
    // testUser_3 upgrades from account level 1 to 4
    await testIncreaseLevel(testUser_3, 3, 1);  
    
    await addUserAccDataPoints(testUser_3);   
    expect(await balBNJI(testUser_3)).to.equal(3980); 

    const expectedUser3Levels    = [0,0, 1, 4];    
    confirmUserDataPoints(testUser_3, expectedUser3Levels);

    await countAllCents();

  });  

  
  it("Test 19. Account level changes are effective immediately after increasing the account level", async function () {   

    await countAllCents();
    
    await addUserAccDataPoints(testUser_1); 
   
    // minting 2600 BNJI to caller
    await testMinting(3600, testUser_1, testUser_1);    

    expect(await balBNJI(testUser_1)).to.equal(3600);   
    await addUserAccDataPoints(testUser_1);  

    // upgrading to account level 1
    await testIncreaseLevel(testUser_1, 1, 0);  
    
    expect(await balBNJI(testUser_1)).to.equal(3595);   
    await addUserAccDataPoints(testUser_1);

    // upgrading to account level 2
    await testIncreaseLevel(testUser_1, 1, 1);  
    
    expect(await balBNJI(testUser_1)).to.equal(3590); 
    await addUserAccDataPoints(testUser_1); 

    // upgrading to account level 3
    await testIncreaseLevel(testUser_1, 1, 2);  

    expect(await balBNJI(testUser_1)).to.equal(3585); 
    await addUserAccDataPoints(testUser_1); 

    const expectedUser1Levels =     [0,0, 1, 2, 3];   
    confirmUserDataPoints(testUser_1, expectedUser1Levels);       

    await countAllCents();
  });  

  it("Test 20. Account downgrades starting from level 3 work as expected", async function () {
    
    await countAllCents();  

    // Preparation: testUser_3 gets account level 3 
    // minting 3000 BNJI to caller
    await addUserAccDataPoints(testUser_3); 
    await testMinting(3000, testUser_3, testUser_3);   
    await addUserAccDataPoints(testUser_3); 
    expect(await balBNJI(testUser_3)).to.equal(3000); 

    // upgrading to account level 3
    await testIncreaseLevel(testUser_3, 3, 0);  
    
    await addUserAccDataPoints(testUser_3);   
    expect(await balBNJI(testUser_3)).to.equal(2985); 

    await expect( testDecreaseLevel(testUser_3, 1, 3) ).to.be.revertedWith(
      "Minimum holding time has not passed yet, levels can't be decreased now. You can check howManyBlocksUntilUnlock"
    );  

    await addUserAccDataPoints(testUser_3);   
    expect(await balBNJI(testUser_3)).to.equal(2985); 

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // downgrading to account level 2
    await testDecreaseLevel(testUser_3, 1, 3);  

    await addUserAccDataPoints(testUser_3);   
    expect(await balBNJI(testUser_3)).to.equal(2990); 

    const expectedUser3Levels    = [0,0, 3, 3, 2];  
    confirmUserDataPoints(testUser_3, expectedUser3Levels);

    await countAllCents();

    // Preparation: testUser_2 gets account level 3 
    // minting 3000 BNJI to caller
    await addUserAccDataPoints(testUser_2); 
    await testMinting(3000, testUser_2, testUser_2);   
    await addUserAccDataPoints(testUser_2); 
    expect(await balBNJI(testUser_2)).to.equal(3000); 

    // upgrading to account level 3
    await testIncreaseLevel(testUser_2, 3, 0);  
    
    await addUserAccDataPoints(testUser_2);   
    expect(await balBNJI(testUser_2)).to.equal(2985); 

    await expect( testDecreaseLevel(testUser_2, 2, 3) ).to.be.revertedWith(
      "Minimum holding time has not passed yet, levels can't be decreased now. You can check howManyBlocksUntilUnlock"
    );  

    await addUserAccDataPoints(testUser_2);   
    expect(await balBNJI(testUser_2)).to.equal(2985); 

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // downgrading to account level 1
    await testDecreaseLevel(testUser_2, 2, 3);  

    await addUserAccDataPoints(testUser_2);   
    expect(await balBNJI(testUser_2)).to.equal(2995); 

    const expectedUser2Levels    = [0,0, 3, 3, 1];
    confirmUserDataPoints(testUser_2, expectedUser2Levels);

    await countAllCents();

    // Preparation: testUser_1 gets account level 3 
    // minting 3000 BNJI to caller
    await addUserAccDataPoints(testUser_1); 
    await testMinting(3000, testUser_1, testUser_1);   
    await addUserAccDataPoints(testUser_1); 
    expect(await balBNJI(testUser_1)).to.equal(3000); 

    // upgrading to account level 3
    await testIncreaseLevel(testUser_1, 3, 0);  
    
    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(2985); 

    await expect( testDecreaseLevel(testUser_1, 3, 3) ).to.be.revertedWith(
      "Minimum holding time has not passed yet, levels can't be decreased now. You can check howManyBlocksUntilUnlock"
    );  

    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(2985); 

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // downgrading to account level 0
    await testDecreaseLevel(testUser_1, 3, 3);  

    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(3000); 

    const expectedUser1Levels    = [0,0, 3, 3,0];    
    confirmUserDataPoints(testUser_1, expectedUser1Levels);

    await countAllCents();

    // Preparation: testUser_4 gets account level 3 
    // minting 3000 BNJI to caller
    await addUserAccDataPoints(testUser_4); 
    await testMinting(3000, testUser_4, testUser_4);   
    await addUserAccDataPoints(testUser_4); 
    expect(await balBNJI(testUser_4)).to.equal(3000); 

    // upgrading to account level 3
    await testIncreaseLevel(testUser_4, 3, 0);  
    
    await addUserAccDataPoints(testUser_4);   
    expect(await balBNJI(testUser_4)).to.equal(2985); 

    // downgrading to account level below 0 is reverted
    await expect( testDecreaseLevel(testUser_4, 4, 3) ).to.be.reverted;

    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_4)).to.equal(2985); 

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // downgrading to account level below 0 is reverted, even after waiting time
    await expect( testDecreaseLevel(testUser_4, 4, 3) ).to.be.reverted;

    await addUserAccDataPoints(testUser_4);   
    expect(await balBNJI(testUser_4)).to.equal(2985); 

    const expectedUser4Levels    = [0,0, 3, 3, 3];    
    confirmUserDataPoints(testUser_4, expectedUser4Levels);

    await countAllCents();
  });


  it("Test 21. Account downgrades starting from level 0 are reverted as expected", async function () {   
    await countAllCents();
    
    await addUserAccDataPoints(testUser_1);    
    expect(await balBNJI(testUser_1)).to.equal(0); 

    await expect( testDecreaseLevel(testUser_1, 1, 0) ).to.be.reverted;   
    
    await addUserAccDataPoints(testUser_1);    
    expect(await balBNJI(testUser_1)).to.equal(0); 

    const expectedUser1Levels    = [0,0]; 
    confirmUserDataPoints(testUser_1, expectedUser1Levels);

    await countAllCents();

  });

  
  it("Test 22. Account level changes are effective immediately after decreasing the account level", async function () {   

    await countAllCents();
    
    await addUserAccDataPoints(testUser_1); 
   
    // minting 40000 BNJI to caller
    await testMinting(40000, testUser_1, testUser_1);    

    expect(await balBNJI(testUser_1)).to.equal(40000);   
    await addUserAccDataPoints(testUser_1);  

    // upgrading to account level 8000
    await testIncreaseLevel(testUser_1, 8000, 0);  
    
    expect(await balBNJI(testUser_1)).to.equal(0);   
    await addUserAccDataPoints(testUser_1);

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // downgrading to account level 0
    await testDecreaseLevel(testUser_1, 8000, 8000);  

    expect(await balBNJI(testUser_1)).to.equal(40000);  
    await addUserAccDataPoints(testUser_1);   

    const expectedUser1Levels =     [0,0, 8000, 0];    
      
    confirmUserDataPoints(testUser_1, expectedUser1Levels);       

    await countAllCents();
  });  
 
  it("Test 23. Downgrading accounts is not triggrered by burning", async function () { 

    await countAllCents();
    await addUserAccDataPoints(testUser_1);
    expect(await balBNJI(testUser_1)).to.equal(0);    
    const lockedBNJI_beforeMint = bigNumberToNumber( await benjaminsContract.lockedBalanceOf(testUser_1) ); 
    expect(lockedBNJI_beforeMint).to.equal(0);    

    // minting 5000 BNJI to caller
    await testMinting(5000, testUser_1, testUser_1);      
    await addUserAccDataPoints(testUser_1);   
    expect(await balBNJI(testUser_1)).to.equal(5000); 
    const lockedBNJI_afterMint = bigNumberToNumber( await benjaminsContract.lockedBalanceOf(testUser_1) ); 
    expect(lockedBNJI_afterMint).to.equal(0);    

    // increasing account level to 3
    await testIncreaseLevel(testUser_1, 3, 0);
    await addUserAccDataPoints(testUser_1); 
    expect(await balBNJI(testUser_1)).to.equal(4985); 
    const lockedBNJI_afterLevel3 = bigNumberToNumber( await benjaminsContract.lockedBalanceOf(testUser_1) ); 
    expect(lockedBNJI_afterLevel3).to.equal(15);    
    
    // burning 2000 tokens, returns go to caller, no needed holding times
    await testBurning(2000, testUser_1, testUser_1, false);    
    await addUserAccDataPoints(testUser_1);  
    expect(await balBNJI(testUser_1)).to.equal(2985);       
    const lockedBNJI_afterBurnUnlocked = bigNumberToNumber( await benjaminsContract.lockedBalanceOf(testUser_1) ); 
    expect(lockedBNJI_afterBurnUnlocked).to.equal(15);      

    const expectedUser1Levels    = [0,0, 3, 3];
    confirmUserDataPoints(testUser_1, expectedUser1Levels);   

    await countAllCents();
    
  });
  
  it("Test 24. Minting-, burning-, increase- and decrease- functions can't be called with a value of 0", async function () { 
    await countAllCents();
    await addUserAccDataPoints(testUser_1);
    expect(await balBNJI(testUser_1)).to.equal(0); 

    await expect( testMinting(0, testUser_1, testUser_1) ).to.be.revertedWith(
      "BNJ, quoteUSDC: Minimum BNJI value to move is $5 USDC"
    );
      
    await addUserAccDataPoints(testUser_1);
    expect(await balBNJI(testUser_1)).to.equal(0);

    await expect( testBurning(0, testUser_1, testUser_1, false) ).to.be.revertedWith(
      "BNJ, quoteUSDC: Minimum BNJI value to move is $5 USDC"
    );
      
    await addUserAccDataPoints(testUser_1);
    expect(await balBNJI(testUser_1)).to.equal(0);

    await expect( testIncreaseLevel(testUser_1, 0, 0) ).to.be.revertedWith(
      "Can't increase level by 0 or less"
    );
      
    await addUserAccDataPoints(testUser_1);
    expect(await balBNJI(testUser_1)).to.equal(0);

    await expect( testDecreaseLevel(testUser_1, 0, 0) ).to.be.revertedWith(
      "You can lower the account level down to level 0"
    );

    await addUserAccDataPoints(testUser_1);
    expect(await balBNJI(testUser_1)).to.equal(0);

    const expectedUser1Levels    = [0,0,0,0,0];    
    confirmUserDataPoints(testUser_1, expectedUser1Levels);     
    await countAllCents();
  });
  
   
  it.only("Test 25. Owner can use checkGains and withdrawGains to withdraw generated interest, as expected", async function () { 
    
    await countAllCents();

    const totalSupplyExistingStart = bigNumberToNumber(await benjaminsContract.totalSupply()); 
    console.log('totalSupplyExistingStart', totalSupplyExistingStart);

    const feeReceiverUSDCBalanceStartInCents = await balUSDCinCents(feeReceiver);  
    console.log('feeReceiverUSDCBalanceStartInCents', feeReceiverUSDCBalanceStartInCents);

    const usersUSDCStart = bigNumberToNumber(await balUSDC(testUser_5));
    console.log('usersUSDCStart', usersUSDCStart);

    const usersTokensStart = bigNumberToNumber(await balBNJI(testUser_5));
    console.log('usersTokensStart', usersTokensStart);

    const reserveStartin6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());
    console.log('reserveStartin6dec', reserveStartin6dec);

    await polygonUSDC.connect(deployerSigner).transfer(testUser_5, (4000000*scale6dec) );

    const usersUSDCSetup = bigNumberToNumber(await balUSDC(testUser_5));
    console.log('usersUSDCSetup', usersUSDCSetup);

    const reserveSetupin6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());
    console.log('reserveSetupin6dec', reserveSetupin6dec);

    // minting 4,800,000 BNJI to testUser_5
    await testMinting(4800000, testUser_5, testUser_5); 

    const totalSupplyExistingAfterMint = bigNumberToNumber(await benjaminsContract.totalSupply()); 
    console.log('totalSupplyExistingAfterMint', totalSupplyExistingAfterMint);

    const usersTokensAfterMint = bigNumberToNumber(await balBNJI(testUser_5));
    console.log('usersTokensAfterMint', usersTokensAfterMint);

    const usersUSDCAfterMint = bigNumberToNumber(await balUSDC(testUser_5));
    console.log('usersUSDCAfterMint', usersUSDCAfterMint);

    const reserveAfterMintin6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getReserveIn6dec());
    console.log('reserveAfterMintin6dec', reserveAfterMintin6dec);

    const balAMUSDCD_withdrawReceiver_start = await balAMUSDC(withdrawReceiver);    
    expect(balAMUSDCD_withdrawReceiver_start).to.equal(0);
    
    await passTime(10);
    await passTime(10);
    

    const checkedGainsIn6dec = await benjaminsContract.connect(deployerSigner).checkGains();
    const checkedGainsInCents = dividefrom6decToUSDCcents(checkedGainsIn6dec);
    const toWithdrawBufferedIn6dec = (multiplyFromUSDCcentsTo6dec(Math.floor(checkedGainsInCents)));

    console.log('checkedGainsInCents', checkedGainsInCents);
    console.log('toWithdrawBufferedIn6dec', toWithdrawBufferedIn6dec);
   
    if (toWithdrawBufferedIn6dec > 0 ) {     
      await benjaminsContract.connect(deployerSigner).withdrawGains(withdrawReceiver, toWithdrawBufferedIn6dec);  
    }   

    const balAMUSDCD_withdrawReceiver_end = await balAMUSDC(withdrawReceiver);    
    expect(balAMUSDCD_withdrawReceiver_end).to.equal(balAMUSDCD_withdrawReceiver_start + (dividefrom6decToUSDCcents(toWithdrawBufferedIn6dec)/100));

    console.log('balAMUSDCD_withdrawReceiver_start', balAMUSDCD_withdrawReceiver_start);
    console.log('dividefrom6decToUSDCcents(toWithdrawBufferedIn6dec)/100', dividefrom6decToUSDCcents(toWithdrawBufferedIn6dec)/100);
    console.log('balAMUSDCD_withdrawReceiver_end', balAMUSDCD_withdrawReceiver_end);
    
    await countAllCents();
  });

  it("Test 26. Mixed use example, shows that functions do not hinder each other and work as expected", async function () { 

    await countAllCents();

    // testUser_1 mints 5000 BNJI, increases level to 3    
    await testMinting(5000, testUser_1, testUser_1);
    await testIncreaseLevel(testUser_1, 3, 0); 
    
    // testUser_2 mints 3200 BNJI increases level to 2    
    await testMinting(3200, testUser_2, testUser_2); 
    await testIncreaseLevel(testUser_2, 2, 0); 
    
    // testUser_3 mints 4100 BNJI, increases level to 2
    await testMinting(4100, testUser_3, testUser_3);      
    await testIncreaseLevel(testUser_3, 2, 0); 
    
    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // testUser_1 decreases level to 2
    await testDecreaseLevel(testUser_1, 1, 3);

    // testUser_4 mints 3031 BNJI, increases level to 2
    await testMinting(3031, testUser_4, testUser_4);  
    await testIncreaseLevel(testUser_4, 2, 0); 

    // testUser_1 transfers 227 BNJI to testUser_4
    await testTransfer(227, testUser_1, testUser_4, false, 0); 
   
    // testUser_5 mints 6003 BNJI, increases level to 2
    await testMinting(6003, testUser_5, testUser_5);   
    await testIncreaseLevel(testUser_5, 2, 0); 

    // testUser_2 uses transferfrom to send 841 BNJI from testUser_3 to testUser_1
    await testTransfer(841, testUser_2, testUser_1, true, testUser_3);    

    // testUser_4 uses burnTo to reward testUser_2
    await testBurning(732, testUser_4, testUser_2, false);

    // testUser_3 increases a level, from 2 to 3
    await testIncreaseLevel(testUser_3, 1, 2); 

    // testUser_1 mints 2002 BNJI to user testUser_5    
    await testMinting(2002, testUser_1, testUser_5);      

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);
    
    // testUser_4 decreases level from 2 to 1
    await testDecreaseLevel(testUser_4, 1, 2);

    // testUser_1 mints 999 BNJI token
    await testMinting(999, testUser_1, testUser_1);      

    // testUser_5 uses burn
    await testBurning(1002, testUser_5, testUser_5, false);

    // speeding up interest accumuluation for this test
    // testUser_5 gets 4,000,000 USDC, mints 3,000,000 BNJI to testUser_5
    await polygonUSDC.connect(deployerSigner).transfer(testUser_5, (4000000*scale6dec) );    
    await testMinting(3000000, testUser_5, testUser_5);
    // passing time to accumulate interest
    await passTime(10); 
    
    // deployer uses checkGains and withdrawGains to take out generated interest to withdrawReceiver address
    const balAMUSDCD_withdrawReceiver_start = await balAMUSDC(withdrawReceiver);
    console.log('balAMUSDCD_withdrawReceiver_start', balAMUSDCD_withdrawReceiver_start); 
    const balAMUSDCD_contract_start = await balAMUSDC(benjaminsContract.address);
    console.log('balAMUSDCD_contract_start', balAMUSDCD_contract_start); 


    const checkedGainsIn6dec = await benjaminsContract.connect(deployerSigner).checkGains();
    console.log('checkedGainsIn6dec', bigNumberToNumber(checkedGainsIn6dec)); 
    const checkedGainsInCents = dividefrom6decToUSDCcents(checkedGainsIn6dec);
    const roundedToCents = checkedGainsInCents - (checkedGainsInCents%1); 

    const toWithdrawRoundedIn6dec = multiplyFromUSDCcentsTo6dec(roundedToCents);   
    console.log('toWithdrawRoundedIn6dec', toWithdrawRoundedIn6dec); 
    await benjaminsContract.connect(deployerSigner).withdrawGains(withdrawReceiver, toWithdrawRoundedIn6dec);  
    
    // rounded, AMUSDC are tricky
    const balAMUSDCD_withdrawReceiver_end = await balAMUSDC(withdrawReceiver);   
    console.log('balAMUSDCD_withdrawReceiver_end', balAMUSDCD_withdrawReceiver_end); 
    expect(balAMUSDCD_withdrawReceiver_end).to.equal(balAMUSDCD_withdrawReceiver_start + (dividefrom6decToUSDCcents(toWithdrawRoundedIn6dec)/100));  

    // all users decrease all levels to 0 and burn all their tokens, get USDC
    for (let index = 0; index < testUserAddressesArray.length; index++) {
      const callingAcc = testUserAddressesArray[index];

      const accountLevel = await getAccountLevel(callingAcc);
  
      if (accountLevel>0){        
        await testDecreaseLevel(callingAcc, accountLevel, accountLevel);
        expect(await getAccountLevel(callingAcc)).to.equal(0);

        const balanceBNJI = await balBNJI(callingAcc);
        await testBurning(balanceBNJI, callingAcc, callingAcc, false);
        expect(await balBNJI(callingAcc)).to.equal(0);
      }    
    }

    // owner burns all owned tokens
    const balBNJIdeployer = await balBNJI(deployer);   
    
    await testBurning(balBNJIdeployer, deployer, deployer, true);
    expect(await balBNJI(deployer)).to.equal(0);

    const totalSupplyExisting = bigNumberToNumber(await benjaminsContract.totalSupply()); 
    expect(totalSupplyExisting).to.equal(0); 

    await countAllCents(); 


    const balAMUSDCD_withdrawReceiver_Absolute_end = await balAMUSDC(withdrawReceiver);   
    console.log('balAMUSDCD_withdrawReceiver_Absolute_end', balAMUSDCD_withdrawReceiver_Absolute_end); 

    const balAMUSDCD_contract_Absolute_end = await balAMUSDC(benjaminsContract.address);
    console.log('balAMUSDCD_contract_Absolute_end', balAMUSDCD_contract_Absolute_end);

  });
  
    
  it("Test 27. testing setters and getters", async function () { 

    const feeReceiver_BeforeChange = await benjaminsContract.getFeeReceiver();
    expect(feeReceiver_BeforeChange).to.equal(feeReceiver);         
    // only the owner can update
    await expect( benjaminsContract.updateFeeReceiver(testUser_4) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );   
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateFeeReceiver(testUser_4))
    .to.emit(benjaminsContract, 'AddressUpdate')
    .withArgs(testUser_4, 'feeReceiver');                 
    const feeReceiver_AfterChange = await benjaminsContract.getFeeReceiver();
    expect(feeReceiver_AfterChange).to.equal(testUser_4);


    const baseFee_BeforeChange = bigNumberToNumber( await benjaminsContract.getBaseFeeTimes10k());
    expect(baseFee_BeforeChange).to.equal(baseFeeTimes10k);
    // only the owner can update
    await expect( benjaminsContract.updateBaseFee(7) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateBaseFee(7))
    .to.emit(benjaminsContract, 'BaseFeeUpdate')
    .withArgs(7);  
    const baseFee_AfterChange = bigNumberToNumber( await benjaminsContract.getBaseFeeTimes10k());
    expect(baseFee_AfterChange).to.equal(7);

    
    const blocksPerDay_BeforeChange = bigNumberToNumber(await benjaminsContract.getBlocksPerDay());
    expect(blocksPerDay_BeforeChange).to.equal(blocksPerDay);
    // only the owner can update
    await expect( benjaminsContract.updateBlocksPerDay(14) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );    
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateBlocksPerDay(14))
    .to.emit(benjaminsContract, 'BlocksPerDayUpdate')
    .withArgs(14);  
    const blocksPerDay_AfterChange = bigNumberToNumber(await benjaminsContract.getBlocksPerDay()); 
    expect(blocksPerDay_AfterChange).to.equal(14);


    const curveFactor_BeforeChange = bigNumberToNumber(await benjaminsContract.getCurveFactor());
    expect(curveFactor_BeforeChange).to.equal(curveFactor);
    // only the owner can update
    await expect( benjaminsContract.updateCurveFactor(148769) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateCurveFactor(148769))
    .to.emit(benjaminsContract, 'CurveFactorUpdate')
    .withArgs(148769);   
    const curveFactor_AfterChange = bigNumberToNumber(await benjaminsContract.getCurveFactor());
    expect(curveFactor_AfterChange).to.equal(148769);
    

    const lendingPoolApproval_BeforeChange = bigNumberToNumber(await polygonUSDC.allowance(benjaminsContract.address,'0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf'));
    expect(lendingPoolApproval_BeforeChange).to.equal(0);
    const newLendingPoolApproval = multiplyFromUSDCto6dec(1000); 
    // only the owner can update
    await expect( benjaminsContract.updateApproveLendingPool(newLendingPoolApproval) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );             
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateApproveLendingPool(newLendingPoolApproval))
    .to.emit(benjaminsContract, 'LendingPoolApprovalUpdate')
    .withArgs(newLendingPoolApproval);   
    const lendingPoolApproval_AfterChange = bigNumberToNumber(await polygonUSDC.allowance(benjaminsContract.address,'0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf'));
    expect(lendingPoolApproval_AfterChange).to.equal(newLendingPoolApproval);
     

    const polygonLendingPoolAddress_BeforeChange = await benjaminsContract.getPolygonLendingPool();
    expect(polygonLendingPoolAddress_BeforeChange).to.equal('0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf');
    // only the owner can update
    await expect( benjaminsContract.updatePolygonLendingPoolAddress(polygonUSDCaddress) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updatePolygonLendingPoolAddress(polygonUSDCaddress))
    .to.emit(benjaminsContract, 'LendingPoolUpdated')
    .withArgs(polygonUSDCaddress);   
    const polygonLendingPoolAddress_AfterChange = await benjaminsContract.getPolygonLendingPool();
    expect(polygonLendingPoolAddress_AfterChange).to.equal(polygonUSDCaddress);
    
    
    const polygonUSDCaddress_BeforeChange = await benjaminsContract.getPolygonUSDC();
    expect(polygonUSDCaddress_BeforeChange).to.equal(polygonUSDCaddress);
    // only the owner can update
    await expect( benjaminsContract.updatePolygonUSDC(benjaminsContract.address) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );  
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updatePolygonUSDC(benjaminsContract.address))
    .to.emit(benjaminsContract, 'AddressUpdate')
    .withArgs(benjaminsContract.address,'polygonUSDC'); 
    const polygonUSDCaddress_AfterChange = await benjaminsContract.getPolygonUSDC();
    expect(polygonUSDCaddress_AfterChange).to.equal(benjaminsContract.address);


    const polygonAMUSDCAddress_BeforeChange = await benjaminsContract.getPolygonAMUSDC();
    expect(polygonAMUSDCAddress_BeforeChange).to.equal(polygonAMUSDCAddress);

    // only the owner can update
    await expect( benjaminsContract.updatePolygonAMUSDC(benjaminsContract.address) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updatePolygonAMUSDC(benjaminsContract.address))
    .to.emit(benjaminsContract, 'AddressUpdate')
    .withArgs(benjaminsContract.address,'polygonAMUSDC'); 
    const polygonAMUSDCAddress_AfterChange = await benjaminsContract.getPolygonAMUSDC();
    expect(polygonAMUSDCAddress_AfterChange).to.equal(benjaminsContract.address);

    
    
    await getContractsHoldingTimeAndConfirmIt(30);
    const toChangeHoldingTime = 20 * blocksPerDay; 
    // only the owner can update
    await expect( benjaminsContract.updateHoldingTime(toChangeHoldingTime) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateHoldingTime(toChangeHoldingTime))
    .to.emit(benjaminsContract, 'HoldingTimeUpdate')
    .withArgs(toChangeHoldingTime);   
    await getContractsHoldingTimeAndConfirmIt(20);  
    
    
  });

    
  it("Test 28. testing setters and getters, while contract is paused", async function () { 

    // owner activates pause()
    await benjaminsContract.connect(deployerSigner).pause(); 

    const feeReceiver_BeforeChange = await benjaminsContract.connect(deployerSigner).getFeeReceiver();
    expect(feeReceiver_BeforeChange).to.equal(feeReceiver);         
    // only the owner can update
    await expect( benjaminsContract.updateFeeReceiver(testUser_4) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );   
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateFeeReceiver(testUser_4))
    .to.emit(benjaminsContract, 'AddressUpdate')
    .withArgs(testUser_4, 'feeReceiver');                 
    const feeReceiver_AfterChange = await benjaminsContract.connect(deployerSigner).getFeeReceiver();
    expect(feeReceiver_AfterChange).to.equal(testUser_4);


    const baseFee_BeforeChange = bigNumberToNumber( await benjaminsContract.connect(deployerSigner).getBaseFeeTimes10k());
    expect(baseFee_BeforeChange).to.equal(baseFeeTimes10k);
    // only the owner can update
    await expect( benjaminsContract.updateBaseFee(7) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateBaseFee(7))
    .to.emit(benjaminsContract, 'BaseFeeUpdate')
    .withArgs(7);  
    const baseFee_AfterChange = bigNumberToNumber( await benjaminsContract.connect(deployerSigner).getBaseFeeTimes10k());
    expect(baseFee_AfterChange).to.equal(7);

    
    const blocksPerDay_BeforeChange = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getBlocksPerDay());
    expect(blocksPerDay_BeforeChange).to.equal(blocksPerDay);
    // only the owner can update
    await expect( benjaminsContract.updateBlocksPerDay(14) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );    
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateBlocksPerDay(14))
    .to.emit(benjaminsContract, 'BlocksPerDayUpdate')
    .withArgs(14);  
    const blocksPerDay_AfterChange = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getBlocksPerDay()); 
    expect(blocksPerDay_AfterChange).to.equal(14);


    const curveFactor_BeforeChange = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getCurveFactor());
    expect(curveFactor_BeforeChange).to.equal(curveFactor);
    // only the owner can update
    await expect( benjaminsContract.updateCurveFactor(148769) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateCurveFactor(148769))
    .to.emit(benjaminsContract, 'CurveFactorUpdate')
    .withArgs(148769);   
    const curveFactor_AfterChange = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).getCurveFactor());
    expect(curveFactor_AfterChange).to.equal(148769);


    const polygonLendingPoolAddress_BeforeChange = await benjaminsContract.connect(deployerSigner).getPolygonLendingPool();
    expect(polygonLendingPoolAddress_BeforeChange).to.equal('0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf');
    // only the owner can update
    await expect( benjaminsContract.updatePolygonLendingPoolAddress(polygonUSDCaddress) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updatePolygonLendingPoolAddress(polygonUSDCaddress))
    .to.emit(benjaminsContract, 'LendingPoolUpdated')
    .withArgs(polygonUSDCaddress);   
    const polygonLendingPoolAddress_AfterChange = await benjaminsContract.connect(deployerSigner).getPolygonLendingPool();
    expect(polygonLendingPoolAddress_AfterChange).to.equal(polygonUSDCaddress);
    
    
    const polygonUSDCaddress_BeforeChange = await benjaminsContract.connect(deployerSigner).getPolygonUSDC();
    expect(polygonUSDCaddress_BeforeChange).to.equal(polygonUSDCaddress);
    // only the owner can update
    await expect( benjaminsContract.updatePolygonUSDC(benjaminsContract.address) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );  
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updatePolygonUSDC(benjaminsContract.address))
    .to.emit(benjaminsContract, 'AddressUpdate')
    .withArgs(benjaminsContract.address,'polygonUSDC'); 
    const polygonUSDCaddress_AfterChange = await benjaminsContract.connect(deployerSigner).getPolygonUSDC();
    expect(polygonUSDCaddress_AfterChange).to.equal(benjaminsContract.address);


    const polygonAMUSDCAddress_BeforeChange = await benjaminsContract.connect(deployerSigner).getPolygonAMUSDC();
    expect(polygonAMUSDCAddress_BeforeChange).to.equal(polygonAMUSDCAddress);

    // only the owner can update
    await expect( benjaminsContract.updatePolygonAMUSDC(benjaminsContract.address) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updatePolygonAMUSDC(benjaminsContract.address))
    .to.emit(benjaminsContract, 'AddressUpdate')
    .withArgs(benjaminsContract.address,'polygonAMUSDC'); 
    const polygonAMUSDCAddress_AfterChange = await benjaminsContract.connect(deployerSigner).getPolygonAMUSDC();
    expect(polygonAMUSDCAddress_AfterChange).to.equal(benjaminsContract.address);
  
   
    await getContractsHoldingTimeAndConfirmIt(30);
    const toChangeHoldingTime = 20 * blocksPerDay; 
    // only the owner can update
    await expect( benjaminsContract.updateHoldingTime(toChangeHoldingTime) ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );       
    // confirming event was emitted as expected
    await expect(benjaminsContract.connect(deployerSigner).updateHoldingTime(toChangeHoldingTime))
    .to.emit(benjaminsContract, 'HoldingTimeUpdate')
    .withArgs(toChangeHoldingTime);   
    await getContractsHoldingTimeAndConfirmIt(20);  
      
    
    // that benjaminsContract is still paused
    expect(await benjaminsContract.paused()).to.equal(true);
        
    // owner deactivates pause()
    await benjaminsContract.connect(deployerSigner).unpause();
    expect(await benjaminsContract.paused()).to.equal(false);
      
    await countAllCents();

  });

  it("Test 29. Activating pause() should lock public access to chosen functions, but allow owner", async function () { 
    
    await countAllCents();

    // Preparation mint
    await testMinting(200000, deployer, deployer); 

    // setup for test, testUser_1 mints 510 BNJI and waits 180 blocks,
    // after that, user would normally be able to transfer, burn etc
    await addUserAccDataPoints(testUser_1);        
    await testMinting(510, testUser_1, testUser_1);  
    expect(await balBNJI(testUser_1)).to.equal(510);    

    // anybody who is not the owner cannot activate pause()
    await expect( benjaminsContract.connect(testUser_1_Signer).pause() ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );   

    // owner activates pause()
    await benjaminsContract.connect(deployerSigner).pause(); 
    
    // when pause has been activated, normal users cannot use transfer
    await expect( benjaminsContract.connect(testUser_1_Signer).transfer(testUser_2, 10)).to.be.revertedWith(
      "Benjamins is paused."
    );
    
    // when pause has been activated, normal users cannot use transferFrom
    await expect( benjaminsContract.connect(testUser_1_Signer).transferFrom(testUser_2, testUser_3, 10)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use mint
    await expect( benjaminsContract.connect(testUser_1_Signer).mint(12)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use mintTo
    await expect( benjaminsContract.connect(testUser_1_Signer).mintTo(14, testUser_2)).to.be.revertedWith(
      "Benjamins is paused."
    );
    
    // when pause has been activated, normal users cannot use burn
    await expect( benjaminsContract.connect(testUser_1_Signer).burn(11)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use burnTo
    await expect( benjaminsContract.connect(testUser_1_Signer).burnTo(16, testUser_2)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use quoteUSDC
    await expect( benjaminsContract.connect(testUser_1_Signer).quoteUSDC(100, true)).to.be.revertedWith(
      "Benjamins is paused."
    );    

    // when pause has been activated, normal users cannot use getBlocksPerDay
    await expect( benjaminsContract.connect(testUser_1_Signer).getBlocksPerDay()).to.be.revertedWith(
      "Benjamins is paused."
    );

     // when pause has been activated, normal users cannot use decimals
     await expect( benjaminsContract.connect(testUser_1_Signer).decimals()).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use getCurveFactor
    await expect( benjaminsContract.connect(testUser_1_Signer).getCurveFactor()).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use getBaseFeeTimes10k
    await expect( benjaminsContract.connect(testUser_1_Signer).getBaseFeeTimes10k()).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use getHoldingTime
    await expect( benjaminsContract.connect(testUser_1_Signer).getHoldingTime()).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use getUsersUnlockTimestamp
    await expect( benjaminsContract.connect(testUser_1_Signer).getUsersUnlockTimestamp(testUser_2)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use getUsersAccountLevel
    await expect( benjaminsContract.connect(testUser_1_Signer).getUsersAccountLevel(testUser_2)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use lockedBalanceOf
    await expect( benjaminsContract.connect(testUser_1_Signer).lockedBalanceOf(testUser_2)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use howManyBlocksUntilUnlock
    await expect( benjaminsContract.connect(testUser_1_Signer).howManyBlocksUntilUnlock(testUser_2)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use increaseAccountLevels
    await expect( benjaminsContract.connect(testUser_1_Signer).increaseAccountLevels(1)).to.be.revertedWith(
      "Benjamins is paused."
    );
    
    // when pause has been activated, normal users cannot use decreaseAccountLevels
    await expect( benjaminsContract.connect(testUser_1_Signer).decreaseAccountLevels(1)).to.be.revertedWith(
      "Benjamins is paused."
    );

    // when pause has been activated, normal users cannot use decreaseAccountLevels
    await expect( benjaminsContract.connect(testUser_1_Signer).getPolygonLendingPool()).to.be.revertedWith(
      "Benjamins is paused."
    );

    // test preparation verification, contract owner should have 890000 tokens from "First Setup mint for 100k USDC"
    expect(await balBNJI(deployer)).to.equal(1090000);
       
    // when paused is active, contract owner can use transfer 40 BNJI from themself to testUser_2
    expect(await balBNJI(testUser_2)).to.equal(0);        
    await testTransfer(40, deployer, testUser_2, false,0 );
    expect(await balBNJI(testUser_2)).to.equal(40);  
    expect(await balBNJI(deployer)).to.equal(1089960); 
        
    // when paused is active, contract owner can use transferFrom to move 40 BNJI from testUser_1 to testUser_3
    expect(await balBNJI(deployer)).to.equal(1089960); 
    expect(await balBNJI(testUser_1)).to.equal(510); 
    expect(await balBNJI(testUser_3)).to.equal(0); 
    await testTransfer(40, deployer, testUser_3, true, testUser_1 );
    expect(await balBNJI(deployer)).to.equal(1089960); 
    expect(await balBNJI(testUser_1)).to.equal(470); 
    expect(await balBNJI(testUser_3)).to.equal(40);    
    
    // when paused is active, contract owner can use mint
    expect(await balBNJI(deployer)).to.equal(1089960); 
    // minting 120 BNJI to caller (owner)
    await testMinting(120, deployer, deployer);  
    expect(await balBNJI(deployer)).to.equal(1090080); 

    // when paused is active, contract owner can use mintTo to mint 140 BNJI to testUser_2
    expect(await balBNJI(deployer)).to.equal(1090080); 
    expect(await balBNJI(testUser_2)).to.equal(40);
    // minting 140 BNJI by caller (owner) to testUser_2
    await testMinting(140, deployer, testUser_2); 
    expect(await balBNJI(deployer)).to.equal(1090080);
    expect(await balBNJI(testUser_2)).to.equal(180);    
    
    // when paused is active, contract owner can use burn to burn 80 token for themself
    expect(await balBNJI(deployer)).to.equal(1090080);
    // burning 80 BNJI by caller (owner) to themself
    await testBurning(80, deployer, deployer, false);
    expect(await balBNJI(deployer)).to.equal(1090000);

    // when paused is active, contract owner can use burnTo to burn 160 token for testUser_2
    expect(await balBNJI(deployer)).to.equal(1090000);
    expect(await balUSDCinCents(testUser_2)).to.equal(1000000);  
    // burning 160 BNJI by caller (owner) to themself
    await testBurning(160, deployer, testUser_2, false);  
    expect(await balBNJI(deployer)).to.equal(1089840); 
    expect(await balUSDCinCents(testUser_2)).to.equal(1000000+4319);

    // when paused is active, contract owner can use quoteUSDC
    const tokenValueIn6dec = bigNumberToNumber(await benjaminsContract.connect(deployerSigner).quoteUSDC(100, true));
    expect(tokenValueIn6dec).to.equal(27260000);

    // when pause has been activated, contract owner can use getPolygonLendingPool
    const polygonLendingPoolQueried = await benjaminsContract.connect(deployerSigner).getPolygonLendingPool();
    expect(polygonLendingPoolQueried).to.equal('0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf');
    
    // when pause has been activated, contract owner can use getBlocksPerDay
    const blocksperday = await benjaminsContract.connect(deployerSigner).getBlocksPerDay();
    expect(blocksperday).to.equal(2);

    // when pause has been activated, contract owner can use decimals
    const decimals = await benjaminsContract.connect(deployerSigner).decimals();
    expect(decimals).to.equal(0);

    // when pause has been activated, contract owner can use getCurveFactor
    const curveFactor = await benjaminsContract.connect(deployerSigner).getCurveFactor();
    expect(curveFactor).to.equal(8000000);

    // when pause has been activated, contract owner can use getBaseFeeTimes10k
    const baseFeeTimes10k = await benjaminsContract.connect(deployerSigner).getBaseFeeTimes10k();    
    expect(baseFeeTimes10k).to.equal(10000);

    // when pause has been activated, contract owner can use getUsersUnlockTimestamp
    const usersUnlockTimestamp = await benjaminsContract.connect(deployerSigner).getUsersUnlockTimestamp(testUser_2);
    expect(usersUnlockTimestamp).to.equal(0);

    // when pause has been activated, contract owner can use getUsersAccountLevel
    const usersAccountLevel = await benjaminsContract.connect(deployerSigner).getUsersAccountLevel(testUser_2);
    expect(usersAccountLevel).to.equal(0);

    // when pause has been activated, contract owner can use lockedBalanceOf
    const lockedBalanceOf = await benjaminsContract.connect(deployerSigner).lockedBalanceOf(testUser_2);
    expect(lockedBalanceOf).to.equal(0);    

    // when pause has been activated, contract owner can use howManyBlocksUntilUnlock
    const howManyBlocksUntilUnlock = await benjaminsContract.connect(deployerSigner).howManyBlocksUntilUnlock(testUser_2);
    expect(howManyBlocksUntilUnlock).to.equal(0);

    // when pause has been activated, contract owner can use getHoldingTime
    await getContractsHoldingTimeAndConfirmIt(30);     
   
    const balBNJI_depl_beforeInc = await balBNJI(deployer);
    const lockedBNJI_depl_beforeInc = await benjaminsContract.connect(deployerSigner).lockedBalanceOf(deployer);
    // when pause has been activated, contract owner can use increaseAccountLevels
    await benjaminsContract.connect(deployerSigner).increaseAccountLevels(1);
    expect(balBNJI_depl_beforeInc).to.equal(1089840);
    expect(lockedBNJI_depl_beforeInc).to.equal(0);

    const balBNJI_depl_afterInc = await balBNJI(deployer);
    const lockedBNJI_depl_afterInc = await benjaminsContract.connect(deployerSigner).lockedBalanceOf(deployer);
    expect(balBNJI_depl_afterInc).to.equal(balBNJI_depl_beforeInc-5);
    expect(lockedBNJI_depl_afterInc).to.equal(lockedBNJI_depl_beforeInc+5);

    // waiting until timeout period has passed
    await mintBlocks(holdingTime);

    // when pause has been activated, contract owner can use decreaseAccountLevels
    await benjaminsContract.connect(deployerSigner).decreaseAccountLevels(1);    
    const balBNJI_depl_afterDec = await balBNJI(deployer);
    const lockedBNJI_depl_afterDec = await benjaminsContract.connect(deployerSigner).lockedBalanceOf(deployer);
    expect(balBNJI_depl_afterDec).to.equal(balBNJI_depl_beforeInc);
    expect(lockedBNJI_depl_afterDec).to.equal(lockedBNJI_depl_beforeInc);

    // verifying once more that benjaminsContract is still paused
    expect(await benjaminsContract.paused()).to.equal(true);

    // anybody who is not the owner cannot deactivate pause()
    await expect( benjaminsContract.connect(testUser_1_Signer).unpause() ).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );   
    
    // owner deactivates pause()
    await benjaminsContract.connect(deployerSigner).unpause();
    expect(await benjaminsContract.paused()).to.equal(false);
      
    await countAllCents();
    
  });

  
  it("Test 30. Owner can withdraw MATIC tokens that were sent to the contract directly, by mistake", async function () { 

    await countAllCents(); 

    const contractMATICstart = await getMATICbalance(benjaminsContract.address);  
    const deployerMATICstart = await getMATICbalance(deployer);
    const deployerMATICstartRounded = deployerMATICstart - (deployerMATICstart%1); 
    
    expect(contractMATICstart).to.equal(0); 
    
    await deployerSigner.sendTransaction({
      to: benjaminsContract.address,
      value: ethers.utils.parseEther("20") // 20 Matic
    })

    const contractMATICafterSend = await getMATICbalance(benjaminsContract.address); 
    expect(contractMATICafterSend).to.equal(contractMATICstart+20); 

    const deployerMATICafterSend = await getMATICbalance(deployer);
    const deployerMATICafterSendRounded = deployerMATICafterSend - (deployerMATICafterSend%1);
    expect(deployerMATICafterSendRounded).to.equal(deployerMATICstartRounded-20);   
    
    await benjaminsContract.connect(deployerSigner).cleanMATICtips();
  
    const contractMATICafterCleanedTips = await getMATICbalance(benjaminsContract.address); 
    expect(contractMATICafterCleanedTips).to.equal(0); 

    const deployerMATICafterCleanedTips = await getMATICbalance(deployer);
    const deployerMATICafterCleanedTipsRounded = deployerMATICafterCleanedTips - (deployerMATICafterCleanedTips%1);
    expect(deployerMATICafterCleanedTipsRounded).to.equal(deployerMATICafterSendRounded+20);
       
    await countAllCents(); 
  });    

  it("Test 31. Owner can use cleanERC20Tips to withdraw ERC20 tokens that were sent to contract by mistake - but not USDC, amUSDC or BNJI", async function () { 
  
    await countAllCents(); 

    // Creating instance of Chainlink
    const polygonLINKaddress = '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39';

    polygonChainlink = new ethers.Contract(
      polygonLINKaddress,
      [
        'function approve(address guy, uint wad) public returns (bool)',
        'function transfer(address dst, uint wad) public returns (bool)',
        'function balanceOf(address account) external view returns (uint256)',        
      ], 
      deployerSigner
    );

    // getting 10 LINK on quickswap
    const chainlinkToGetIn18dec = ethers.utils.parseEther("10");
    const wmaticToPayWithMaxIn18dec = ethers.utils.parseEther("1000");
    await polygonQuickswapRouter.connect(deployerSigner).swapTokensForExactTokens( chainlinkToGetIn18dec, wmaticToPayWithMaxIn18dec , [polygonWMATICaddress, polygonLINKaddress], deployer, 1665102928); 
    
    // preparation confirmation
    const chainlinkBalStart_deployer      = Number(ethers.utils.formatEther(await polygonChainlink.balanceOf(deployer)));    
    const chainlinkBalStart_BNJIcontract  = Number(ethers.utils.formatEther(await polygonChainlink.balanceOf(benjaminsContract.address)));
    expect(chainlinkBalStart_deployer).to.equal(10);
    expect(chainlinkBalStart_BNJIcontract).to.equal(0);  

    // sending over 10 LINK to contract
    await polygonChainlink.connect(deployerSigner).transfer(benjaminsContract.address, chainlinkToGetIn18dec);

    // transfer confirmation
    const chainlinkBalAfterSend_deployer      = Number(ethers.utils.formatEther(await polygonChainlink.balanceOf(deployer)));    
    const chainlinkBalAfterSend_BNJIcontract  = Number(ethers.utils.formatEther(await polygonChainlink.balanceOf(benjaminsContract.address)));
    expect(chainlinkBalAfterSend_deployer).to.equal(0);
    expect(chainlinkBalAfterSend_BNJIcontract).to.equal(10);  

    // reverts as expected: cleanERC20Tips does not accept USDC address as argument
    await expect( benjaminsContract.connect(deployerSigner).cleanERC20Tips(polygonUSDCaddress) ).to.be.revertedWith(
      "ERC20 cannot be USDC."
    );  

    // reverts as expected: cleanERC20Tips does not accept amUSDC address as argument
    await expect( benjaminsContract.connect(deployerSigner).cleanERC20Tips(polygonAMUSDCAddress) ).to.be.revertedWith(
      "ERC20 cannot be amUSDC."
    ); 

    // reverts as expected: cleanERC20Tips does not accept benjaminsContract address as argument
    await expect( benjaminsContract.connect(deployerSigner).cleanERC20Tips(benjaminsContract.address) ).to.be.revertedWith(
      "ERC20 cannot be BNJI."
    ); 
    
    // calling cleanERC20Tips with Chainlink address as argument, LINK is getting sent to calling owner
    await benjaminsContract.connect(deployerSigner).cleanERC20Tips(polygonLINKaddress);

    // cleanERC20Tips confirmation
    const chainlinkBalAfterClean_deployer      = Number(ethers.utils.formatEther(await polygonChainlink.balanceOf(deployer)));    
    const chainlinkBalAfterClean_BNJIcontract  = Number(ethers.utils.formatEther(await polygonChainlink.balanceOf(benjaminsContract.address)));
    expect(chainlinkBalAfterClean_deployer).to.equal(10);
    expect(chainlinkBalAfterClean_BNJIcontract).to.equal(0);  
    
    await countAllCents(); 

  });  
  
  it("Test 32. Owner can add additional funds to contract's amUSDC balance", async function () { 
    
    // Note: Not using countAllCents here, as some USDC will be converted into amUSDC, which can't be tracked the same way.

    // getting contracts amUSDC balance
    const contractAMUSDCbalBeforeInCents = dividefrom6decToUSDCcents (bigNumberToNumber (await polygonAMUSDC.balanceOf(benjaminsContract.address)));
    // since it constantly changes in tiny amounts, due to accruing interest, rounding it down to whole cents, easier to handle
    const roundedToCentsBefore = contractAMUSDCbalBeforeInCents - (contractAMUSDCbalBeforeInCents%1); 
    
    // owner deposits an extra $100 USDC into the lending pool on contracts behalf
    await depositAdditionalUSDC(100*scale6dec);

    // rounding down new amUSDC balance, same reasoning 
    const contractAMUSDCbalAfterInCents = dividefrom6decToUSDCcents (bigNumberToNumber (await polygonAMUSDC.balanceOf(benjaminsContract.address)));
    const roundedToCentsAfter = contractAMUSDCbalAfterInCents - (contractAMUSDCbalAfterInCents%1); 

    // expecting that the new balance is increased by more than $100 in the very next block (calculated in cents)
    expect(roundedToCentsAfter).to.equal(roundedToCentsBefore+10000);  

  });

  
}); 