import {
  LCDClient,
  MsgStoreCode,
  isTxError,
  MnemonicKey
} from "@terra-money/terra.js";
import * as fs from 'fs';

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

const storeCode = new MsgStoreCode(
  wallet.key.accAddress,
  fs.readFileSync('../contracts/spar_test.wasm').toString('base64')
);

try{

    const storeCodeTx = await wallet.createAndSignTx({
      msgs: [storeCode],
    });
    const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);

    console.log(storeCodeTxResult);

    if (isTxError(storeCodeTxResult)) {
      throw new Error(
        `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
      );
    }

    const {
      store_code: { code_id },
    } = storeCodeTxResult.logs[0].eventsByType;

}catch(e){
  //Output error message if transaction failed
  console.log(e);
}