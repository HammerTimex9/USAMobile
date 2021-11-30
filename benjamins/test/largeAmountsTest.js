const { expect } = require("chai");
const { ethers } = require("hardhat");
const { fixture } = deployments;

// Customized helpers

let tokensShouldExistNowGlobalV;
let mintPriceTotalInUSDCShouldBeNowGlobalV; 
let mintFeeInUSDCShouldBeNowGlobalV; 
let mintAllowanceInUSDCCentsShouldBeNowGlobalV;
let burnReturnWOfeeInUSDCShouldBeNowGlobalV;
let burnFeeInUSDCShouldBeNowGlobalV;
let transferFeeShouldBeNowInUSDCcentsGlobalV;

let tokensExistQueriedGlobalV;
let mintPriceTotalInUSDCWasPaidNowGlobalV;
let mintFeeInUSDCWasPaidNowGlobalV;
let mintAllowanceInUSDCCentsWasNowGlobalV;
let burnReturnWOfeeInUSDCWasPaidNowGlobalV;
let burnFeeInUSDCWasPaidNowGlobalV;
let transferFeeWasPaidNowInUSDCcentsGlobalV;

let protocolUSDCbalWithoutInterestInCentsGlobalV = 0;
let burnReturnStillInclFeesInUSDCcentsGlobalV = 0;

let testUserAddressesArray = [];
let totalUSDCcentsEntriesArr = [];
let liquidCentsArray = [];

let loopCounterTotal = 0;
let mintCounterTotal = 0;
let burnCounterTotal = 0;
let not5USDCworthCounter = 0;
let usersMintRecalcCounter;

let totalSpentInCents = 0;
let totalReturnedInCents = 0;

const scale6dec = 1000000;

let baseFeeTimes10k;
let blocksPerDay;
let curveFactor;
let neededBNJIperLevel;
let levelDiscountsArray = [];
let holdingTimesInDays = [];

let benjaminsContract;

let polygonUSDC;
const polygonUSDCaddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

let polygonAmUSDC;
const polygonAmUSDCAddress = '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F';

let polygonWMATIC;
const polygonWMATICaddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

let polygonQuickswapRouter;
const polygonQuickswapRouterAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';

let polygonLendingPool;
const polygonLendingPoolAddress = '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf';

let testUser_1_Signer;

let user1LevelDataArray = [];
let user1DiscountDataArray = [];
let user2LevelDataArray = [];
let user2DiscountDataArray = [];
let user3LevelDataArray = [];
let user3DiscountDataArray = [];
let user4LevelDataArray = [];
let user4DiscountDataArray = [];

// querrying and saving discount level and account discount info for userToCheck, and saving them to an array for later confirmation
async function addUserAccDataPoints(userToCheck){
 
  const userLevelNow = await getDiscountLevel(userToCheck);
  
  const userDiscountNow = await getDiscountPercentage(userToCheck);
    
  if (userToCheck == testUser_1){
    user1LevelDataArray.push(userLevelNow);
    user1DiscountDataArray.push(userDiscountNow);
  } else if (userToCheck == testUser_2) {
    user2LevelDataArray.push(userLevelNow);
    user2DiscountDataArray.push(userDiscountNow);
  } else if (userToCheck == testUser_3) {
    user3LevelDataArray.push(userLevelNow);
    user3DiscountDataArray.push(userDiscountNow);
  } else if (userToCheck == testUser_4) {
    user4LevelDataArray.push(userLevelNow);
    user4DiscountDataArray.push(userDiscountNow);
  } 
}


// confirms discount level and discount percentage as recorded via add addUserAccDataPoints function
function confirmUserDataPoints(userToCheck, expectedUserLevelsArray, expectedUserDiscountArray) {
  if  (userToCheck == testUser_1){
    for (let index = 0; index < user1LevelDataArray.length; index++) {
     
      expect(user1LevelDataArray[index]).to.equal(expectedUserLevelsArray[index]); 
      expect(user1DiscountDataArray[index]).to.equal(expectedUserDiscountArray[index]);
    }
  } else if (userToCheck == testUser_2) {

    for (let index = 0; index < user2LevelDataArray.length; index++) {
      expect(user2LevelDataArray[index]).to.equal(expectedUserLevelsArray[index]); 
      expect(user2DiscountDataArray[index]).to.equal(expectedUserDiscountArray[index]);
    }
  }
  // resetting for next test
  user1LevelDataArray = [];
  user1DiscountDataArray = [];
  user2LevelDataArray = [];
  user2DiscountDataArray = [];
}

// helper function to console log for testing/debugging: looking up the accounts[] variable for an address 
function findUsernameForAddress(addressToLookup){
  for (let findInd = 0; findInd < testUserAddressesArray.length; findInd++) {
    if (testUserAddressesArray[findInd] == addressToLookup) {
      return "testUser_" +`${findInd}`;
    } else if (addressToLookup == '0x0000000000000000000000000000000000000000' ) {
      return "Zero address: 0x0000000000000000000000000000000000000000"      
    }  else if (addressToLookup == '0xE51c8401fe1E70f78BBD3AC660692597D33dbaFF' ) {
      return "feeReceiver"      
    }  else if (addressToLookup == '0xCE74Ae6D4C53E1cC118Bd2549295Bc4e27923DA0' ) {
      return "deployer"      
    }   
  }  
}; 

async function getContractsHoldingTimesArrayAndConfirmIt(expectedHoldingTimesArray) {
  let holdingTimesInDaysWithBNs = [];
  holdingTimesInDaysWithBNs = await benjaminsContract.getHoldingTimes();
  holdingTimesInDays = [];

  for (let index = 0; index < holdingTimesInDaysWithBNs.length; index++) {     
    holdingTimesInDays.push(bigNumberToNumber(holdingTimesInDaysWithBNs[index]));
    expect(holdingTimesInDays[index]).to.equal(expectedHoldingTimesArray[index]); 
  }
}

async function getContractsDiscountArrayAndConfirmIt(expectedDiscountsArray) {
  let contractsDiscountArrayWithBNs = [];
  contractsDiscountArrayWithBNs = await benjaminsContract.getDiscounts();   
  levelDiscountsArray = [];

  for (let index = 0; index < contractsDiscountArrayWithBNs.length; index++) {     
    levelDiscountsArray.push(bigNumberToNumber(contractsDiscountArrayWithBNs[index]));
    expect(levelDiscountsArray[index]).to.equal(expectedDiscountsArray[index]); 
  }
}

// simulate the passing of blocks
async function mintBlocks (amountOfBlocksToMint) {
  for (let i = 0; i < amountOfBlocksToMint; i++) {
    await ethers.provider.send("evm_mine");
  }
}

async function getBlockheightNow() {
  const blockHeightNow = await ethers.provider.getBlockNumber();
  return blockHeightNow;
}

async function balUSDCinCents(userToQuery) {
  return dividefrom6decToUSDCcents(bigNumberToNumber(await polygonUSDC.balanceOf(userToQuery)));
}

async function balUSDC(userToQuery) {
  return (await balUSDCinCents(userToQuery)/100);
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
  const deployerCents = await balUSDCinCents(deployer);
  const protocolCents = protocolUSDCbalWithoutInterestInCentsGlobalV;    

  const allLiquidCents = centsInAllTestUsers + feeReceiverCents + protocolCents + deployerCents;  

  liquidCentsArray.push(allLiquidCents);  

  // console.log(`These are the entries each time all liquid USDCcents were counted: `, liquidCentsArray); 

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
    benjaminsContract.connect(callingAccSigner).transferFrom(fromSenderAddress, receivingAddress, amountBNJItoTransfer)
  }

}

// TODO: create revert situation without USDC approval
async function testMinting(amountToMint, callingAccAddress, receivingAddress) {

  const callingAccUSDCBalanceBeforeMintInCents = await balUSDCinCents(callingAccAddress);  
  const feeReceiverUSDCBalanceBeforeMintInCents = await balUSDCinCents(feeReceiver);  
 
  // allowing benjaminsContract to handle USDC for ${callingAcc}   
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
  
  const restAllowanceToBNJIcontractIn6dec = await polygonUSDC.allowance(callingAccAddress, benjaminsContract.address);
  expect(await restAllowanceToBNJIcontractIn6dec).to.equal(0);
 
  const amountToApproveIn6dec = await calcMintApprovalAndPrep(amountToMint, true);  
 
  //now a block gets minted, signed writing to chain
  await polygonUSDC.connect(callingAccSigner).approve(benjaminsContract.address, amountToApproveIn6dec); // TODO: create revert case
  
  const givenAllowanceToBNJIcontractIn6dec = await polygonUSDC.allowance(callingAccAddress, benjaminsContract.address); 
  expect(Number (amountToApproveIn6dec)).to.equal(Number (givenAllowanceToBNJIcontractIn6dec));
  
  //now a block gets minted, signed writing to chain
  // descr: function mintTo(uint256 _amount, address _toWhom) public whenAvailable {  
  await benjaminsContract.connect(callingAccSigner).mintTo(amountToMint, receivingAddress);  

  const totalSupplyAfterMint = bigNumberToNumber( await benjaminsContract.totalSupply() ); 
 
  const callingAccUSDCBalanceAfterMintInCents = await balUSDCinCents(callingAccAddress);   
  const feeReceiverUSDCBalanceAfterMintInCents = await balUSDCinCents(feeReceiver); 
 
  const callingAccMintPricePaidInCents = callingAccUSDCBalanceBeforeMintInCents - callingAccUSDCBalanceAfterMintInCents;
 
  const feeReceiverUSDCdiffMintInCents = feeReceiverUSDCBalanceAfterMintInCents - feeReceiverUSDCBalanceBeforeMintInCents;     
  
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

async function testBurning(amountToBurn, callingAccAddress, receivingAddress) { 

  const receivingAddressUSDCBalanceBeforeBurnInCents = await balUSDCinCents(receivingAddress); 
  const feeReceiverUSDCBalanceBeforeBurnInCents = await balUSDCinCents(feeReceiver); 
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);

  await calcBurnVariables(amountToBurn);

  // descr: function burnTo(uint256 _amount, address _toWhom)
  await benjaminsContract.connect(callingAccSigner).burnTo(amountToBurn, receivingAddress);    

  const totalSupplyAfterBurn = bigNumberToNumber( await benjaminsContract.totalSupply() ); 
  const receivingAccUSDCBalanceAfterBurnInCents = await balUSDCinCents(receivingAddress);    
  
  const feeReceiverUSDCBalanceAfterBurnInCents = await balUSDCinCents(feeReceiver); 
  
  const receivingAccBurnReturnReceivedInCents = receivingAccUSDCBalanceAfterBurnInCents - receivingAddressUSDCBalanceBeforeBurnInCents;  
  const feeReceiverUSDCdiffBurnInCents = feeReceiverUSDCBalanceAfterBurnInCents - feeReceiverUSDCBalanceBeforeBurnInCents;       

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
  mintPriceTotalInUSDCShouldBeNowGlobalV = 0; 
  mintFeeInUSDCShouldBeNowGlobalV = 0; 
  mintAllowanceInUSDCCentsShouldBeNowGlobalV = 0;
  burnReturnWOfeeInUSDCShouldBeNowGlobalV = 0;
  burnFeeInUSDCShouldBeNowGlobalV = 0;
  transferFeeShouldBeNowInUSDCcentsGlobalV = 0;

  tokensExistQueriedGlobalV = 0;
  mintPriceTotalInUSDCWasPaidNowGlobalV = 0;
  mintFeeInUSDCWasPaidNowGlobalV = 0;
  mintAllowanceInUSDCCentsWasNowGlobalV = 0;
  burnReturnWOfeeInUSDCWasPaidNowGlobalV = 0;
  burnFeeInUSDCWasPaidNowGlobalV = 0;
  transferFeeWasPaidNowInUSDCcentsGlobalV = 0;

  user1LevelDataArray = [];
  user1DiscountDataArray = [];
  user2LevelDataArray = [];
  user2DiscountDataArray = [];

} 

function confirmMint(){  
  
  expect(tokensShouldExistNowGlobalV).to.equal( Number (tokensExistQueriedGlobalV));
  expect(mintPriceTotalInUSDCShouldBeNowGlobalV).to.equal(Number (mintPriceTotalInUSDCWasPaidNowGlobalV));
  expect(mintFeeInUSDCShouldBeNowGlobalV).to.equal(Number (mintFeeInUSDCWasPaidNowGlobalV));
  expect(mintAllowanceInUSDCCentsShouldBeNowGlobalV).to.equal(Number (mintAllowanceInUSDCCentsWasNowGlobalV));
};

function confirmBurn(){  
  
  expect(tokensShouldExistNowGlobalV).to.equal(Number(tokensExistQueriedGlobalV));
  expect(burnReturnWOfeeInUSDCShouldBeNowGlobalV).to.equal(Number(burnReturnWOfeeInUSDCWasPaidNowGlobalV));
  expect(burnFeeInUSDCShouldBeNowGlobalV).to.equal(Number(burnFeeInUSDCWasPaidNowGlobalV));
};

async function calcMintApprovalAndPrep(amountToMint, willReallyMintBool) {  
  
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

  if (willReallyMintBool == true) {
    tokensShouldExistNowGlobalV = amountOfTokensAfterMint;
    mintPriceTotalInUSDCShouldBeNowGlobalV = toPayTotalInUSDC;
    mintFeeInUSDCShouldBeNowGlobalV = mintFeeInCentsRoundedDown/100;     
  }

  mintAllowanceInUSDCCentsShouldBeNowGlobalV = toPayTotalInCents; 

  return toPayTotalIn6dec;
}

async function calcBurnVariables(amountToBurn, isTransfer=false) {

  const amountOfTokensBeforeBurn = bigNumberToNumber(await benjaminsContract.totalSupply());  
  const amountOfTokensAfterBurn = amountOfTokensBeforeBurn - amountToBurn;  
  
  const burnReturnInUSDC = ( (amountOfTokensBeforeBurn * amountOfTokensBeforeBurn) - (amountOfTokensAfterBurn * amountOfTokensAfterBurn) ) / curveFactor;
  const burnReturnInCents = burnReturnInUSDC * 100;
  const burnReturnRoundedDownInCents = burnReturnInCents - (burnReturnInCents % 1);  
  
  const burnFeeInCentsRoundedDown = getRoundedFee(burnReturnRoundedDownInCents); 

  const toReceiveTotalInCents = burnReturnRoundedDownInCents - burnFeeInCentsRoundedDown;
  
  if (isTransfer==false){
    tokensShouldExistNowGlobalV = amountOfTokensAfterBurn;
    burnReturnTotalInUSDCcentsShouldBeNowGlobalV = toReceiveTotalInCents;
    burnFeeInUSDCcentsShouldBeNowGlobalV = burnFeeInCentsRoundedDown;
    burnReturnStillInclFeesInUSDCcentsGlobalV = burnReturnRoundedDownInCents;
  } else {
    return burnFeeInCentsRoundedDown;
  }
  
}

async function storeAddr(){ 
  testUserAddressesArray.push(testUser_0); 
  testUserAddressesArray.push(testUser_1);   
  testUserAddressesArray.push(testUser_2); 
  testUserAddressesArray.push(testUser_3); 
  testUserAddressesArray.push(testUser_4); 
  testUserAddressesArray.push(testUser_5); 
  testUserAddressesArray.push(testUser_6); 
  testUserAddressesArray.push(testUser_7); 
  testUserAddressesArray.push(testUser_8); 
  testUserAddressesArray.push(testUser_9); 
}









async function testIncreaseLevel(callingAccAddress, amountOfLevelsToGet, expectedStartingLevel) {
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
  const costInBNJI = (amountOfLevelsToGet*neededBNJIperLevel);

  const beforeLevelIncrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const beforeLevelIncrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address);  

  const beforeLevelIncrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const beforeLevelIncrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress);  

  const beforeLevelIncrease_UsersLockedBNJI = await getLockedBalanceOf(callingAccAddress);
  const beforeLevelIncrease_UsersDiscountLevel = await getDiscountLevel(callingAccAddress); 
  const beforeLevelIncrease_UsersDiscountPercentage = await getDiscountPercentage(callingAccAddress);  

  const beforeLevelIncrease_DiscountLevelExpected = beforeLevelIncrease_UsersLockedBNJI / neededBNJIperLevel;
  const beforeLevelIncrease_DiscountPercentageExpected = levelDiscountsArray[beforeLevelIncrease_UsersDiscountLevel]; 

  await benjaminsContract.connect(callingAccSigner).increaseDiscountLevels(amountOfLevelsToGet);
  
  const blockheightNow = await getBlockheightNow();
  
  const afterLevelIncrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const afterLevelIncrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address); 

  const afterLevelIncrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const afterLevelIncrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress); 

  const afterLevelIncrease_UsersLockedBNJI = await getLockedBalanceOf(callingAccAddress);
  const afterLevelIncrease_UsersDiscountLevel = await getDiscountLevel(callingAccAddress);  
  const afterLevelIncrease_UsersDiscountPercentage = await getDiscountPercentage(callingAccAddress);
  
  const afterLevelIncrease_DiscountPercentageExpected = levelDiscountsArray[afterLevelIncrease_UsersDiscountLevel];
  const afterLevelIncrease_LockedBNJIExpected = afterLevelIncrease_UsersDiscountLevel * neededBNJIperLevel;

  // updated unlock timestamp and amount of blocks to wait should now be updated, relating to new discount level
  const afterLevelIncrease_AmountOfBlocksToWaitExpected = holdingTimesInDays[afterLevelIncrease_UsersDiscountLevel] * blocksPerDay;
  const afterLevelIncrease_UnlockTimestampExpected = blockheightNow + (holdingTimesInDays[afterLevelIncrease_UsersDiscountLevel] * blocksPerDay);
  
  // user's discountLevel at the start should be equal to expected, sent in value
  expect(beforeLevelIncrease_UsersDiscountLevel).to.equal(expectedStartingLevel); 
  // user's discountLevel at the start should be equal to calculated value (using beforeLevelIncrease_UsersLockedBNJI)
  expect(expectedStartingLevel).to.equal(beforeLevelIncrease_DiscountLevelExpected);  
  // user's discountPercentage at the start should be equal to calculated value (comparing to queried levelDiscountsArray)
  expect(beforeLevelIncrease_UsersDiscountPercentage).to.equal(beforeLevelIncrease_DiscountPercentageExpected);

  // user's unlocked BNJI balance after level increase should be equal to before, minus the costInBNJI that were locked 
  expect(afterLevelIncrease_BNJIbal_User).to.equal(beforeLevelIncrease_BNJIbal_User - costInBNJI);   
  // the same amount should now be added to the benjaminsContract's balance of unlocked BNJI
  expect(afterLevelIncrease_BNJIbal_Contract).to.equal(beforeLevelIncrease_BNJIbal_Contract + costInBNJI);  
  
  // unlock timestamp and amount of blocks to wait should be updated (increased) by when increasing level
  expect(afterLevelIncrease_UsersUnlockTimestamp).to.be.greaterThan(beforeLevelIncrease_UsersUnlockTimestamp);
  expect(afterLevelIncrease_AmountOfBlocksToWait).to.be.greaterThan(beforeLevelIncrease_AmountOfBlocksToWait);  
  // unlock timestamp and amount of blocks to wait should now be calculated relating to new discount level
  expect(afterLevelIncrease_AmountOfBlocksToWait).to.equal(afterLevelIncrease_AmountOfBlocksToWaitExpected);  
  expect(afterLevelIncrease_UsersUnlockTimestamp).to.equal(afterLevelIncrease_UnlockTimestampExpected);  
  
  // user's balance of locked BNJI after level increase should be equal to calculated value (see above)  
  expect(afterLevelIncrease_UsersLockedBNJI).to.equal(afterLevelIncrease_LockedBNJIExpected);  
  // user's balance of locked BNJI after level increase should be equal to before, plus the costInBNJI that were locked 
  expect(afterLevelIncrease_UsersLockedBNJI).to.equal(beforeLevelIncrease_UsersLockedBNJI + costInBNJI); 

  // user's discount level after level increase should be equal to before, plus the amountOfLevelsToGet
  expect(afterLevelIncrease_UsersDiscountLevel).to.equal(beforeLevelIncrease_UsersDiscountLevel + amountOfLevelsToGet);    

  // user's discountPercentage after level increase should be equal to calculated value (see above) 
  expect(afterLevelIncrease_UsersDiscountPercentage).to.equal(afterLevelIncrease_DiscountPercentageExpected);   
}  

async function howLongUntilUnlock(userToCheck) {
  return (bigNumberToNumber (await benjaminsContract.howManyBlocksUntilUnlock(userToCheck)));
}


async function getUnlockTimestamp(userToCheck) {
  return (bigNumberToNumber (await benjaminsContract.getUsersUnlockTimestamp(userToCheck)));
}

async function getLockedBalanceOf(userToCheck) {
  return (bigNumberToNumber (await benjaminsContract.lockedBalanceOf(userToCheck)));
}

async function getDiscountLevel(userToCheck){
  const usersDiscountLevel = bigNumberToNumber (await benjaminsContract.getUsersDiscountLevel(userToCheck));
  return usersDiscountLevel;
}

async function getDiscountPercentage(userToCheck){
  const usersDiscountPercentage = (bigNumberToNumber(await benjaminsContract.getUsersDiscountPercentageTimes10k(userToCheck)))/baseFeeTimes10k;
  return usersDiscountPercentage;
}




async function testDecreaseLevel(callingAccAddress, amountOfLevelsToDecrease, expectedStartingLevel) {
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);
  const returnInBNJI = (amountOfLevelsToDecrease*neededBNJIperLevel);

  const beforeLevelDecrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const beforeLevelDecrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address);
  
  const beforeLevelDecrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const beforeLevelDecrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress);  

  const beforeLevelDecrease_UsersLockedBNJI = await getLockedBalanceOf(callingAccAddress);
  const beforeLevelDecrease_UsersDiscountLevel = await getDiscountLevel(callingAccAddress); 
  const beforeLevelDecrease_UsersDiscountPercentage = await getDiscountPercentage(callingAccAddress);  

  const beforeLevelDecrease_DiscountLevelExpected = beforeLevelDecrease_UsersLockedBNJI / neededBNJIperLevel;
  const beforeLevelDecrease_DiscountPercentageExpected = levelDiscountsArray[beforeLevelDecrease_UsersDiscountLevel]; 
  
  await benjaminsContract.connect(callingAccSigner).decreaseDiscountLevels(amountOfLevelsToDecrease);
  


  const afterLevelDecrease_BNJIbal_User = await balBNJI(callingAccAddress);
  const afterLevelDecrease_BNJIbal_Contract = await balBNJI(benjaminsContract.address); 

  const afterLevelDecrease_AmountOfBlocksToWait = await howLongUntilUnlock(callingAccAddress);
  const afterLevelDecrease_UsersUnlockTimestamp = await getUnlockTimestamp(callingAccAddress); 

  const afterLevelDecrease_UsersLockedBNJI = await getLockedBalanceOf(callingAccAddress);
  const afterLevelDecrease_UsersDiscountLevel = await getDiscountLevel(callingAccAddress);  
  const afterLevelDecrease_UsersDiscountPercentage = await getDiscountPercentage(callingAccAddress);
  
  const afterLevelDecrease_DiscountPercentageExpected = levelDiscountsArray[afterLevelDecrease_UsersDiscountLevel];
  const afterLevelDecrease_LockedBNJIExpected = afterLevelDecrease_UsersDiscountLevel * neededBNJIperLevel;

  
  // TODO: comment all expects
  
  // user's discountLevel at the start should be equal to expected, sent in value
  expect(beforeLevelDecrease_UsersDiscountLevel).to.equal(expectedStartingLevel); 
  // user's discountLevel at the start should be equal to calculated value (using beforeLevelDecrease_UsersLockedBNJI)
  expect(expectedStartingLevel).to.equal(beforeLevelDecrease_DiscountLevelExpected);  
  // user's discountPercentage at the start should be equal to calculated value (comparing to queried levelDiscountsArray)
  expect(beforeLevelDecrease_UsersDiscountPercentage).to.equal(beforeLevelDecrease_DiscountPercentageExpected);

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

  // user's discount level after level decrease should be equal to before, minus the amountOfLevelsToDecrease
  expect(afterLevelDecrease_UsersDiscountLevel).to.equal(beforeLevelDecrease_UsersDiscountLevel - amountOfLevelsToDecrease);    

  // user's discountPercentage after level decrease should be equal to calculated value (see above) 
  expect(afterLevelDecrease_UsersDiscountPercentage).to.equal(afterLevelDecrease_DiscountPercentageExpected);  

}

async function endBurn() {
  for (let index = 0; index < testUserAddressesArray.length; index++) {
    const callingAcc = testUserAddressesArray[index];

    const balanceBNJI = await balBNJI(callingAcc);

    if (balanceBNJI>0){
      console.log(balanceBNJI, `Endburn from testUser_${index}`);
      await testBurning(balanceBNJI, callingAcc, callingAcc);
      expect(await balBNJI(callingAcc)).to.equal(0);
    }    
  }

  const balBNJIdeployer = await balBNJI(deployer);
  console.log(balBNJIdeployer, `Endburn from deployer`);
  await testBurning(balBNJIdeployer, deployer, deployer);

  expect(await balBNJI(deployer)).to.equal(0);

  const totalSupplyExisting = bigNumberToNumber(await benjaminsContract.totalSupply()); 
  expect(totalSupplyExisting).to.equal(0);

}

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

async function showReserveInCents(){
  const reserveInCents = dividefrom6decToUSDCcents(bigNumberToNumber(await benjaminsContract.getReserveIn6dec()));
  console.log(reserveInCents, 'contract tracker shows this amount in USDC cents as reserve');
  return reserveInCents;
}

async function runMintOrBurnLoop(loopsToRun, runMint, accOrderArray, testNr) {
  
  let mintCounter = 0;
  let burnCounter = 0;

  let accPosCounter;

  // running either minting or burning, this many loops: loopsToRun
  for (loopCounter = 1; loopCounter <= loopsToRun; loopCounter++) {
    
    // accounts are up next in the order they are sent in via accOrderArray
    // when all 10 test accounts acted, array starts over, until loopsToRun are all done
    accPosCounter = loopCounter-1;
    if (accPosCounter>=10){
      accPosCounter = accPosCounter%10;
    }
    
    const accNrNow = accOrderArray[accPosCounter];
    const accNow = testUserAddressesArray[accNrNow];    
    const signerNow = await ethers.provider.getSigner(accNow);
    const accNowName = findUsernameForAddress(accNow);     

    const balUSDCcentsAtStart = await balUSDCinCents(accNow);
    
    const balBNJIatStart = await balBNJI(accNow);
    
    // MINTING
    // if runMint == true, mint. 
    if (runMint == true) {
    
      usersMintRecalcCounter = 0;

      // function to check minting amount repeatedly until it's okay
      async function checkMintingAmountOkay() {     
        if (usersMintRecalcCounter<10){
          if (mintAllowanceInUSDCCentsShouldBeNowGlobalV < 1000 || mintAllowanceInUSDCCentsShouldBeNowGlobalV > balUSDCcentsAtStart) {
            if (mintAllowanceInUSDCCentsShouldBeNowGlobalV < 1000) {
              console.log(`RECALC, mint call would be under $10`);  
              randomAmountMinting = Math.floor (Math.random() * 100000); 
            }
            if (mintAllowanceInUSDCCentsShouldBeNowGlobalV > balUSDCcentsAtStart){
              console.log(`RECALC, mint call would be too big for ${accNowName}'s USDC balance`) 
              // halving the randomAmountMinting from before and rounding it down to full integers
              randomAmountMinting = Math.floor(randomAmountMinting* 0.5); 
            }          
            
            console.log('RECALC randomAmountMinting', randomAmountMinting);
            await calcMintApprovalAndPrep(randomAmountMinting, false);  // this call will change mintAllowanceInUSDCCentsShouldBeNowGlobalV, so no endless loop
            usersMintRecalcCounter += 1;
            await checkMintingAmountOkay();         
          }
        } 
      }

      // randomizing amount to mint
      let randomAmountMinting = await randomizedMint(accNow);       
      
      // will be called twice, once here and once in testMinting
      // console.log is between the two, to show problems if there are any
      await calcMintApprovalAndPrep(randomAmountMinting, false);
      
      await checkMintingAmountOkay(); // checking if amount is okay

      console.log(`In ${testNr}, operation nr: ${loopCounter} ${accNowName} MINTS this many tokens:`, randomAmountMinting);

      mintCounter++;
      
      await testMinting(randomAmountMinting, accNow, accNow);

      totalSpentInCents += mintAllowanceInUSDCCentsWasNowGlobalV;  

    } 
    
  
    // BURNING
    // if runMint == false, burn.
    else {     
      
      let burnNow = Math.floor (balBNJIatStart * 0.35); // this means burning 35% of their tokens per call      
             
      calcBurnVariables(burnNow, false); // this returns fee not value

      if(burnReturnStillInclFeesInUSDCcentsGlobalV >= 500) {
        console.log(`In ${testNr}, operation nr: ${loopCounter} ${accNowName} BURNS this many tokens:`, burnNow);        
       
        await testBurning(burnNow, accNow, accNow);
        
        totalReturnedInCents += burnReturnTotalInUSDCcentsWasPaidNowGlobalV + burnFeeInUSDCcentsWasPaidNowGlobalV;
        burnCounter++;
      } else {
        not5USDCworthCounter += 1
      }
            
    }    
    
  }

  loopCounterTotal += loopCounter-1;
  mintCounterTotal += mintCounter;
  burnCounterTotal += burnCounter;

  console.log(`test ran ${loopCounterTotal} loops so far, of which ${mintCounterTotal} were mints and ${burnCounterTotal} were burns. ${not5USDCworthCounter} time(s), less than $5 of tokens existed`); 
  console.log(`estimate: so far, roughly ${totalSpentInCents/100} USDC were spent by the testusers (excl. deployer) and ${totalReturnedInCents/100} USDC were paid out by the contract in total`);   

  const protocolBalanceAfterTestInCents = dividefrom6decToUSDCcents( bigNumberToNumber (await polygonAmUSDC.balanceOf(benjaminsContract.address)) );
  
  const feeReceiverUSDCbalAfterTestsInCents = dividefrom6decToUSDCcents( bigNumberToNumber (await polygonUSDC.balanceOf(feeReceiver)) );
  
  const endTokenBalance = bigNumberToNumber(await benjaminsContract.totalSupply() );
  const valueBNJIexistingInCents = dividefrom6decToUSDCcents(await benjaminsContract.quoteUSDC(endTokenBalance, false));

  console.log('at the end of all loops so far, this many tokens exist:', endTokenBalance);  
  if (endTokenBalance>0) {console.log(valueBNJIexistingInCents/100, `if all these tokens were burnt, they would be worth this much USDC, before fees (to take off)`)};
  console.log(protocolUSDCbalWithoutInterestInCentsGlobalV/100, 'protocol should have this many (am)USDC, without interest so far');
  const reserveTracked = await showReserveInCents();
  expect(reserveTracked).to.equal(protocolUSDCbalWithoutInterestInCentsGlobalV); 
  console.log(protocolBalanceAfterTestInCents/100, 'protocol has this many funds in amUSDC, incl interest so far');  
  console.log(feeReceiverUSDCbalAfterTestsInCents/100, `feeReceiver's USDC balance at the end of all loops so far`); 
}

async function randomizedMint(callingAcc){

  //  formula for minting for a specified amount of currency (totalPriceForTokensMintingNow) :
  //  totalSupplyAfterMinting = SquareRootOf ( (totalPriceForTokensMintingNow * curveFactor) + (totalSupplyBeforeMinting ^2) )
  //  tokenAmountMintingNow = totalSupplyAfterMinting - totalSupplyBeforeMinting

  const balUSDCofCaller = await balUSDC(callingAcc);
  const mintNow = Math.floor(balUSDCofCaller * 0.35);   // this means minting for 35% of their total funds each time
  const totalSupplyExisting = await benjaminsContract.totalSupply();

  const totalSupplyAfterMinting = Math.sqrt((mintNow * curveFactor) + (totalSupplyExisting * totalSupplyExisting));

  const tokensMintingNow = totalSupplyAfterMinting - totalSupplyExisting;

  return Math.floor(tokensMintingNow);

}

/*const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { fixture } = deployments;

// Customized helpers

/*

let tokensShouldExistNowGlobalV = 0;
let mintPriceTotalInUSDCcentsShouldBeNowGlobalV = 0; 
let mintFeeInUSDCcentsShouldBeNowGlobalV = 0; 
let mintAllowanceInUSDCCentsShouldBeNowGlobalV = 0;
let burnReturnTotalInUSDCcentsShouldBeNowGlobalV = 0;
let burnFeeInUSDCcentsShouldBeNowGlobalV = 0;

let tokensExistQueriedGlobalV = 0;
let mintPriceTotalInUSDCcentsWasPaidNowGlobalV = 0;
let mintFeeInUSDCcentsWasPaidNowGlobalV = 0;
let mintAllowanceInUSDCCentsWasNowGlobalV = 0;
let burnReturnTotalInUSDCcentsWasPaidNowGlobalV = 0;
let burnFeeInUSDCcentsWasPaidNowGlobalV = 0;

let burnReturnStillInclFeesInUSDCcentsGlobalV = 0;

let protocolUSDCbalWithoutInterestInCentsGlobalV = 0;
let loopCounterTotal = 0;
let mintCounterTotal = 0;
let burnCounterTotal = 0;
let not5USDCworthCounter = 0;

let totalSpentInCents = 0;
let totalReturnedInCents = 0;
let totalUSDCcentsInTestAccs = 0;

let totalUSDCcentsEntriesArr = [];

const scale6dec = 1000000;

const baseFee = 1;
const levelDiscountsArray = [ 0, 5,  10,  20,  40,   75]; 

let benjaminsContract;

let polygonUSDC;
const polygonUSDCaddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';

let polygonAmUSDC;
const polygonAmUSDCAddress = '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F';

let polygonWMATIC;
const polygonWMATICaddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

let polygonQuickswapRouter;
const polygonQuickswapRouterAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';

let testUserAddressesArray = [];

let user1LevelDataArray = [];
let user1DiscountDataArray = [];
let user2LevelDataArray = [];
let user2DiscountDataArray = [];

// querrying and saving account level and account discount info for userToCheck, and saving them to an array for later confirmation
async function addUserAccDataPoints(userToCheck){
  const userLevelNow = bigNumberToNumber (await benjaminsContract.discountLevel(userToCheck));
  const userDiscountNow = 100 - bigNumberToNumber( await benjaminsContract.quoteFeePercentage(userToCheck)/100); 
  
  if (userToCheck == testUser_1){
    user1LevelDataArray.push(userLevelNow);
    user1DiscountDataArray.push(userDiscountNow);
  } else if (userToCheck == testUser_2) {
    user2LevelDataArray.push(userLevelNow);
    user2DiscountDataArray.push(userDiscountNow);

  } 
}

// simulate the passing of blocks
async function mintBlocks (amountOfBlocksToMint) {
  for (let i = 0; i < amountOfBlocksToMint; i++) {
    await ethers.provider.send("evm_mine");
  }
}

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

async function balUSDCinCents(userToQuery) {
  return dividefrom6decToUSDCcents(bigNumberToNumber(await polygonUSDC.balanceOf(userToQuery)));
}

async function balUSDC(userToQuery) {
  return (await balUSDCinCents(userToQuery)/100);
}

async function balUSDCin6decBN(userToQuery) {
  return await polygonUSDC.balanceOf(userToQuery);
}

async function balBNJI(userToQuery) {
  return bigNumberToNumber (await benjaminsContract.balanceOf(userToQuery));
}

async function showReserveInCents(){
  const reserveInCents = dividefrom6decToUSDCcents(bigNumberToNumber(await benjaminsContract.getReserveIn6dec()));
  console.log(reserveInCents, 'contract tracker shows this amount in USDC cents as reserve');
  return reserveInCents;
}

// converting BN big numbers to normal numbers
function bigNumberToNumber(bignumber) {
  let convertedNumber = Number ((ethers.utils.formatUnits(bignumber, 0)).toString());  
  return convertedNumber;
}

// converting from 6dec to USDC
function divideFrom6decToUSDC (largeNumber) {
  const numberInUSDC = Number( largeNumber / (10**6) );      
  return numberInUSDC;    
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

// converting USDC to cents
function fromUSDCToCents (numberInUSDC) {
  const numberInCents = numberInUSDC *100;      
  return numberInCents;    
}

async function getMaticBalance(adress) {    
  const balanceInWEI = await ethers.provider.getBalance(adress); 
  const balanceInMATIC = Number(balanceInWEI / (10**18) );        
  return balanceInMATIC;
}

function getRoundedFee(userLevel, principalInUSDCcents){    
  const feeModifier = (100 * baseFee * (100-levelDiscountsArray[userLevel])) /10000;
  const feeStarterInCents = ((principalInUSDCcents * feeModifier ) /100);   
  const feeInCentsRoundedDown = feeStarterInCents - (feeStarterInCents % 1);
  return feeInCentsRoundedDown  
}



async function testBurning(burnName, amountToBurn, callingAccAddress, receivingAddress) {  

  const receivingAddressUSDCBalanceBeforeBurnInCents = await balUSDCinCents(receivingAddress); 
  const feeReceiverUSDCBalanceBeforeBurnInCents = await balUSDCinCents(feeReceiver); 
  
  const callingAccSigner = await ethers.provider.getSigner(callingAccAddress);

  await calcBurnVariables(amountToBurn, callingAccAddress);
  
  await benjaminsContract.connect(callingAccSigner).burnTo(amountToBurn, receivingAddress);  
 
  const totalSupplyAfterBurn = bigNumberToNumber( await benjaminsContract.totalSupply() ); 
  const receivingAccUSDCBalanceAfterBurnInCents = await balUSDCinCents(receivingAddress);     
 
  const feeReceiverUSDCBalanceAfterBurnInCents = await balUSDCinCents(feeReceiver);   
  
  const receivingAccBurnReturnReceivedInCents = receivingAccUSDCBalanceAfterBurnInCents - receivingAddressUSDCBalanceBeforeBurnInCents;
  const feeReceiverUSDCdiffBurnInCents = feeReceiverUSDCBalanceAfterBurnInCents - feeReceiverUSDCBalanceBeforeBurnInCents;     

  // since amUSDC amounts change due to interest accrued, transfer amount WITHOUT fees are saved globally for comparison
  // here, transfer amount refers to USDC cents amounts of funds paid out by the protocol, to the user, plus fees, paid by protocol to feeReceiver
  const againstInterestDistortionInCents = receivingAccBurnReturnReceivedInCents + feeReceiverUSDCdiffBurnInCents;
  protocolUSDCbalWithoutInterestInCentsGlobalV -= againstInterestDistortionInCents;

  burnReturnTotalInUSDCcentsWasPaidNowGlobalV = receivingAccBurnReturnReceivedInCents;
  burnFeeInUSDCcentsWasPaidNowGlobalV = feeReceiverUSDCdiffBurnInCents;
  tokensExistQueriedGlobalV = totalSupplyAfterBurn;

  confirmBurn();
};

function resetTrackers(){
  tokensShouldExistNowGlobalV = 0;
  mintPriceTotalInUSDCcentsShouldBeNowGlobalV = 0; 
  mintFeeInUSDCcentsShouldBeNowGlobalV = 0; 

  mintAllowanceInUSDCCentsShouldBeNowGlobalV = 0;
  burnReturnTotalInUSDCcentsShouldBeNowGlobalV = 0;
  burnFeeInUSDCcentsShouldBeNowGlobalV = 0;

  tokensExistQueriedGlobalV = 0;
  mintPriceTotalInUSDCcentsWasPaidNowGlobalV = 0;
  mintFeeInUSDCcentsWasPaidNowGlobalV = 0;

  mintAllowanceInUSDCCentsWasNowGlobalV = 0;
  burnReturnTotalInUSDCcentsWasPaidNowGlobalV = 0;
  burnFeeInUSDCcentsWasPaidNowGlobalV = 0;
} 

function confirmMint(){  
  
  expect(tokensShouldExistNowGlobalV).to.equal( Number (tokensExistQueriedGlobalV));
  expect(mintPriceTotalInUSDCcentsShouldBeNowGlobalV).to.equal(Number (mintPriceTotalInUSDCcentsWasPaidNowGlobalV));
  expect(mintFeeInUSDCcentsShouldBeNowGlobalV).to.equal(Number (mintFeeInUSDCcentsWasPaidNowGlobalV));
  expect(mintAllowanceInUSDCCentsShouldBeNowGlobalV).to.equal(Number (mintAllowanceInUSDCCentsWasNowGlobalV));
  
};

function confirmBurn(){  
  
  expect(tokensShouldExistNowGlobalV).to.equal(Number(tokensExistQueriedGlobalV));
  expect(burnReturnTotalInUSDCcentsShouldBeNowGlobalV).to.equal(Number(burnReturnTotalInUSDCcentsWasPaidNowGlobalV));
  expect(burnFeeInUSDCcentsShouldBeNowGlobalV).to.equal(Number(burnFeeInUSDCcentsWasPaidNowGlobalV));
};


async function calcBurnVariables(amountToBurn, accountBurning, isTransfer=false) {

  const amountOfTokensBeforeBurn = bigNumberToNumber(await benjaminsContract.totalSupply());  
  const amountOfTokensAfterBurn = amountOfTokensBeforeBurn - amountToBurn;

  const usersTokenAtStart = await balBNJI(accountBurning);
  const userLevel = bigNumberToNumber (await benjaminsContract.discountLevel(accountBurning)); 
  
  
  const burnReturnInUSDC = ( (amountOfTokensBeforeBurn * amountOfTokensBeforeBurn) - (amountOfTokensAfterBurn * amountOfTokensAfterBurn) ) / curveFactor;
  const burnReturnInCents = burnReturnInUSDC * 100;
  const burnReturnRoundedDownInCents = burnReturnInCents - (burnReturnInCents % 1);  
  
  const burnFeeInCentsRoundedDown = getRoundedFee(userLevel, burnReturnRoundedDownInCents); 

  const toReceiveTotalInCents = burnReturnRoundedDownInCents - burnFeeInCentsRoundedDown;
  
  if (isTransfer==false){
    tokensShouldExistNowGlobalV = amountOfTokensAfterBurn;
    burnReturnTotalInUSDCcentsShouldBeNowGlobalV = toReceiveTotalInCents;
    burnFeeInUSDCcentsShouldBeNowGlobalV = burnFeeInCentsRoundedDown;
    burnReturnStillInclFeesInUSDCcentsGlobalV = burnReturnRoundedDownInCents;
  } else {
    return burnFeeInCentsRoundedDown;
  }
  
}



// checking balances and adding them up
async function checkTestAddresses(amountUSDC, amountMatic, amountBNJI, expectBool){
  for (let index = 0; index < 10; index++) {
    const testUserAddress = testUserAddressesArray[index];  
    const testAccUSDCcentsbal = await balUSDCinCents(testUserAddress);
    const testAccMATICbal = await getMaticBalance(testUserAddress);
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
  if (totalUSDCcentsEntriesArr.length == 1 ) {startTotalUSDCcents = totalUSDCcentsInTestAccs}
  
  // reset counter for next round of queries
  totalUSDCcentsInTestAccs = 0;
  return nowUSDCcentsInAllTestAccs;
}

let liquidCentsArray = [];
async function countAllCents() {
  const centsInAllTestUsers = await checkTestAddresses();
  const feeReceiverCents = await balUSDCinCents(feeReceiver); 
  const protocolCents = protocolUSDCbalWithoutInterestInCentsGlobalV;
  const deployerCents = await balUSDCinCents(deployer);

  const allLiquidCents = centsInAllTestUsers + feeReceiverCents + protocolCents + deployerCents;  

  liquidCentsArray.push(allLiquidCents);  

  // verifying that amount of counted cents is always the same
  // starts at second array entry and compares all entries to the one before
  for (let index = 1; index < liquidCentsArray.length; index++) {
    expect(liquidCentsArray[index]).to.equal(liquidCentsArray[index-1]);    
  }

  console.log(`These are the entries each time all liquid USDCcents were counted: `, liquidCentsArray); 
}



 */

describe("Benjamins, testing large amounts", function () {

  // setting instances of contracts
  before(async function() {   

    ({ deployer, 
    feeReceiver, 
    accumulatedReceiver,
    testUser_0,
    testUser_1, 
    testUser_2, 
    testUser_3, 
    testUser_4, 
    testUser_5,
    testUser_6, 
    testUser_7, 
    testUser_8, 
    testUser_9    
    } = await getNamedAccounts());
    
    deployerSigner = await ethers.provider.getSigner(deployer); 

    await storeAddr();   
    
    // Deploy contract
    await fixture(["Benjamins"]);
    benjaminsContract = await ethers.getContract("Benjamins");      
    
    // Get amount of blocksPerDay into this testing suite
    blocksPerDay = bigNumberToNumber(await benjaminsContract.getBlocksPerDay());

    // Get baseFeeTimes10k into this testing suite
    baseFeeTimes10k = bigNumberToNumber(await benjaminsContract.getBaseFeeTimes10k());

    // Get curveFactor into this testing suite
    curveFactor = bigNumberToNumber(await benjaminsContract.getCurveFactor());

    // Get neededBNJIperLevel into this testing suite
    neededBNJIperLevel = bigNumberToNumber(await benjaminsContract.getneededBNJIperLevel());
  
    const expectedHoldingTimesArray  =  [0, 30, 90, 300];
    await getContractsHoldingTimesArrayAndConfirmIt(expectedHoldingTimesArray);

    const expectedDiscountsArray = [0, 10, 25,  50]; 
    await getContractsDiscountArrayAndConfirmIt(expectedDiscountsArray);

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

    polygonAmUSDC = new ethers.Contract(
      polygonAmUSDCAddress,
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
      value: ethers.utils.parseEther("5201000") // 5,001,000 Matic
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

    const balWMATIC = bigNumberToNumber(await polygonWMATIC.connect(deployerSigner).balanceOf(deployer));
    //console.log(balWMATIC, "balWMATIC");
      
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
    
    //function approve(address spender, uint value) external returns (bool);
    await polygonWMATIC.connect(deployerSigner).approve( polygonQuickswapRouterAddress, ethers.utils.parseEther("82000000000") );

    //function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)
    const amountToReceiveUSDCIn6dec = 4210000 * (10**6);
    const amountInMaxInWEI = ethers.utils.parseEther("6000000"); //82000000 * (10**18);   
    await polygonQuickswapRouter.connect(deployerSigner).swapTokensForExactTokens( amountToReceiveUSDCIn6dec, amountInMaxInWEI , [polygonWMATICaddress, polygonUSDCaddress], deployer, 1665102928);  
   
     
    await benjaminsContract.connect(deployerSigner).unpause(); 

    resetTrackers();
    
    await countAllCents();
    waitFor(4000);   

    await testMinting(889000, deployer, deployer);   
    
    await showReserveInCents();
        
    for (let index = 0; index < 10; index++) {
      const testUserAddress = testUserAddressesArray[index];      
       
      await deployerSigner.sendTransaction({
        to: testUserAddress,
        value: ethers.utils.parseEther("10") // 10 Matic
      })

      await polygonUSDC.connect(deployerSigner).transfer(testUserAddress, (400000*scale6dec) ); 
                 
    }     
    

  })      

  it.only("Preparation.", async function () {    
        
    await countAllCents();   

    // Verifying each of the 10 test users has 400k USDC, 10 Matic and 0 BNJI
    await checkTestAddresses(400000,10,0, true);

    for (let index = 0; index < 10; index++) {
      const testUserAddress = testUserAddressesArray[index];      
      
      // all testUsers mint 3000 BNJI     
      await testMinting(3000, testUserAddress, testUserAddress)
       
      // all testUsers upgrade to discount level 3 with highest discounts     
      await testIncreaseLevel(testUserAddress, 3, 0);         
    }     

    await countAllCents();
    
  });  
  
  it.only("1.: Large amounts test: 100 mints", async function () {     
    let accOrderArray1 = [9,8,7,6,5,4,3,2,1,0];      
    await runMintOrBurnLoop(100, true, accOrderArray1, 'Test 1');
    await countAllCents();    
    await mintBlocks(720);
    waitFor(4000);
  });
  
  it.only("2.: Large amounts test: 100 burns", async function () {     
    let accOrderArray2 = [0,8,3,6,5,1,7,2,4,9];  
    await runMintOrBurnLoop(100, false, accOrderArray2, 'Test 2');
    await countAllCents();
    waitFor(4000);

  });
  
  it("3.: Large amounts test: 100 mints", async function () {     
    let accOrderArray3 = [5,8,3,6,8,1,7,2,4,0];  
    await runMintOrBurnLoop(100, true, accOrderArray3, 'Test 3');
    await countAllCents();    
    await mintBlocks(720);
    waitFor(4000);
  });
  
  it("4.: Large amounts test: 100 burns", async function () {     
    let accOrderArray4 = [0,8,9,6,7,5,1,4,2,3];  
    await runMintOrBurnLoop(100, false, accOrderArray4, 'Test 4');
    await countAllCents();
    waitFor(4000);
  });
  
  it("5.: Large amounts test: 100 mints", async function () {     
    let accOrderArray5 = [1,8,3,6,7,5,0,4,2,9];    
    await runMintOrBurnLoop(100, true, accOrderArray5, 'Test 5');
    await countAllCents();    
    await mintBlocks(720);
    waitFor(4000);
  });
  
  it("6.: Large amounts test: 100 burns", async function () { 
    let accOrderArray6 = [0,9,3,6,5,7,1,2,4,8];  
    await runMintOrBurnLoop(100, false, accOrderArray6, 'Test 6');
    await countAllCents();    
    waitFor(4000);
  });

  it("7.: Large amounts test: 100 mints", async function () {     
    let accOrderArray7 = [6,8,1,4,5,9,3,2,7,0];  
    await runMintOrBurnLoop(100, true, accOrderArray7, 'Test 7');
    await countAllCents();    
    await mintBlocks(720);
    waitFor(4000);
  });
  
  it("8.: Large amounts test: 100 burns", async function () {     
    let accOrderArray8 = [0,8,1,7,2,9,3,5,4,6];  
    await runMintOrBurnLoop(100, false, accOrderArray8, 'Test 8');
    await countAllCents();    
    waitFor(4000);
  });

  it("9.: Large amounts test: 100 mints", async function () {     
    let accOrderArray9 = [9,8,1,6,3,0,2,5,4,7];    
    await runMintOrBurnLoop(100, true, accOrderArray9, 'Test 9');
    await countAllCents();    
    await mintBlocks(720);
    waitFor(4000);
  });
  
  it("10.: Large amounts test: 100 burns", async function () {     
    let accOrderArray10 = [3,2,0,6,4,9,7,8,5,1];  
    await runMintOrBurnLoop(100, false, accOrderArray10, 'Test 10');
    await countAllCents();
    waitFor(4000);
  });

  it("11.: Large amounts test: 100 mints", async function () {     
    let accOrderArray9 = [4,8,2,6,3,7,0,5,9,1];    
    await runMintOrBurnLoop(100, true, accOrderArray9, 'Test 11');
    await countAllCents();    
    await mintBlocks(720);
    waitFor(4000);
  });//*/

  it("Test 12. All tokens that exist can be burned, and the connected USDC paid out by the protocol", async function () { 

    // deployer deposits $1 extra
    //await depositAdditionalUSDC(1*scale6dec);   
    
    await mintBlocks(720);
    
    for (let index = 0; index < testUserAddressesArray.length; index++) {
      const callingAcc = testUserAddressesArray[index];

      const balanceBNJI = await balBNJI(callingAcc);      

      if (balanceBNJI>0){
        await testBurning(`Endburn from testUser_${index}`, balanceBNJI, callingAcc, callingAcc);
        expect(await balBNJI(callingAcc)).to.equal(0);
      }    
    }

    const balBNJIdeployer = await balBNJI(deployer);
    await testBurning(`Endburn from deployer`, balBNJIdeployer, deployer, deployer);

    expect(await balBNJI(deployer)).to.equal(0);

    const totalSupplyExistingAtEnd = bigNumberToNumber(await benjaminsContract.totalSupply()); 
    expect(totalSupplyExistingAtEnd).to.equal(0);

    await showReserveInCents();

    console.log(await balUSDCinCents(feeReceiver), "feeReceiver bal in Cents, end");
    console.log(await balUSDCinCents(deployer), "deployer bal in Cents, end");

    console.log(dividefrom6decToUSDCcents(bigNumberToNumber (await polygonAmUSDC.balanceOf(benjaminsContract.address))), 'benjaminsContract amUSDC at end in cents');
  });
}); 
