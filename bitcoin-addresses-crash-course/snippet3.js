
const bitcoin = require("bitcoinjs-lib");
const http = require("http");
const qstring = require("querystring");

// ----------------------------------------------------------
// SNIPPET 3
// ----------------------------------------------------------

console.log("-------------------");
console.log("SNIPPET 3");
console.log("");

const regtest = bitcoin.networks.testnet;
const API_URL = 'https://regtest.bitbank.cc/1';
const API_HOST = 'regtest.bitbank.cc';

function randomAddress () {
  const kp = bitcoin.ECPair.makeRandom({
    network: regtest
  });

  return bitcoin.payments.p2pkh({
    pubkey: kp.publicKey,
    network: regtest
  }).address;
}

// create random keypairs
const keyPairs = [
  bitcoin.ECPair.makeRandom({ network: regtest }),
  bitcoin.ECPair.makeRandom({ network: regtest }),
  bitcoin.ECPair.makeRandom({ network: regtest })
];

// configure multi-signature address
const pubkeys = keyPairs.map(x => x.publicKey);
const p2sh = bitcoin.payments.p2sh({ 
  redeem: bitcoin.payments.p2ms({ m: 2, pubkeys: pubkeys, network: regtest }), 
  network: regtest 
});

console.log("The address is: ", p2sh.address);

// Now building transaction
// This is where we specify the CORRECT INPUT that will be spent
const transaction = new bitcoin.TransactionBuilder(regtest);
const txId = bitcoin.ECPair.makeRandom({ network: regtest });
const pubKey = Buffer.from("12345678901234567890123456789012");
transaction.addInput(pubKey, 1); // txId, vout

// CAREFUL HERE: the coins are sent to a random address!
transaction.addOutput(randomAddress(), 1e4);

// MAGIC HERE: co-signature from MULTIPLE signers
transaction.sign(0, keyPairs[0], p2sh.redeem.output);
transaction.sign(0, keyPairs[2], p2sh.redeem.output);

// create the serialized transaction payload
const tx = transaction.build();

try {
  // broadcast the transaction
  let req = http.request({
    host: API_HOST,
    path: "/t/push",
    port: 80,
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(tx.toHex())
    }
  }, (res) => {
    console.log("Transaction broadcast!");
  });

  req.write(tx.toHex());
  req.end();
}
catch (e) {
  console.error("An error occured: ", e);
}
