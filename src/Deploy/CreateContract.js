import {
  LCDClient,
  MsgInstantiateContract,
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

const instantiate = new MsgInstantiateContract(
  wallet.key.accAddress, //sender
  wallet.key.accAddress, //admin
  10166, // code ID of deployed contract
  {
    "owner": wallet.key.accAddress,
    "validator": "terra1ya23p5cxtxwcfdrq4dmd2h0p5nc0vcl96tm0nw",
    "tokens": "uluna"
  }, // InitMsg to execute contract
  { uluna: 1000000 }, // init coins
  false // migratable
);

const instantiateTx = await wallet.createAndSignTx({
  msgs: [instantiate],
});
const instantiateTxResult = await terra.tx.broadcast(instantiateTx);

console.log(instantiateTxResult);

if (isTxError(instantiateTxResult)) {
  throw new Error(
    `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
  );
}

const {
  instantiate_contract: { contract_address },
} = instantiateTxResult.logs[0].eventsByType;