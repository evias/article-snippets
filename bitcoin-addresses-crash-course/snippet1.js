
const bitcoin = require("bitcoinjs-lib");

// ----------------------------------------------------------
// SNIPPET 1
// ----------------------------------------------------------

console.log("-------------------");
console.log("SNIPPET 1");
console.log("");

const secret = Buffer.from('abcdefghijklmnopqrstuvwxyz012345');
const keyPair = bitcoin.ECPair.makeRandom({ rng: () => { return secret; } }); // (1)

// read the keypair and format to address
const pubKey  = keyPair.publicKey.toString();
const privKey = keyPair.privateKey.toString();
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }) // (2)

// print created address
console.log("The address is:     ", address);
console.log("The public key is:  ", pubKey);
console.log("The private key is: ", privKey);
console.log("");
