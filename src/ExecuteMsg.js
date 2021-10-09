import {
  LCDClient,
  isTxError,
  Coin,
  MnemonicKey,
  MsgExecuteContract
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
console.log("wallet key is", wallet.key);

// Construct contract
const contract = new MsgExecuteContract(
  Config.MY_WALLET_ADDRESS, // Sender wallet address
  "terra17m3d20fdwwzsc0ye706lm3xhdrwmm0sl87gkvr", // contract address
  {
    "token_send": {}
  }, // handle msg
  {
    uusd: 1000000
  } // coins
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