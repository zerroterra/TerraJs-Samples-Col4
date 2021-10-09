import {
  LCDClient,
  MsgMigrateContract,
  isTxError,
  MnemonicKey
} from "@terra-money/terra.js";

/* START : CONFIG */
import dotenv from 'dotenv'
dotenv.config({path: '../.env'})
let Config = process.env;
/* END : CONFIG */

//Declare network configuration
const terra = new LCDClient({
  URL: Config.LCDClientURL,
  chainID: Config.LCDClientChain,
});

// Create a key out of a Mnemonic
const mk = new MnemonicKey({
  mnemonic:
  Config.MY_WALLET_SEED,
});

//Wallet can be created out of any key
const wallet = terra.wallet(mk);

const contract = new MsgMigrateContract(
  wallet.key.accAddress, //admin
  'terra1457wfa6j8v4se657gq3pjqye2rjj22rmyxzyyz', //contract to update
  12489, //new code id
  { 
    "spar_token": Config.contract_spar_token, 
    "owner": Config.wallet_address_spar_admin, 
    "spend_limit": "100000000"
  } //msg instantiate
);

try{

  // Sign transaction
  const tx = await wallet.createAndSignTx({
    msgs: [contract],
    memo: "",
  });

  //Broadcast transaction and check result
  await terra.tx.broadcast(tx).then((txResult) => {
    if (isTxError(txResult)) {
  throw new Error(
    `encountered an error while running the transaction: ${txResult.code} ${txResult.codespace}`
  );
  }
  //Display transaction meta data
  console.log("hash is: ", txResult.txhash);
  console.log("height is: ", txResult.height);
  console.log("Logs: ", txResult.logs[0].eventsByType.message);
});

}catch(e){
//Output error message if transaction failed
console.log(e);

}