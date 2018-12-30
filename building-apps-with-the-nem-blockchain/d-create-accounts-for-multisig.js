const nem = require("nem-sdk").default;

// ----------------------------------------------------------
// SNIPPET 4: Create NEM Accounts for multi-signature
// ----------------------------------------------------------

// Create our accounts structure (1)
const accounts = {
    // TAIBKLU6MWMHDPJOJLRU6FHWIGPSNUY3EE6ZU5F5
    business: null, // ddee05102935e1f31cc7df8c6352f0e1a0193cbefe9673029a04228b395de846
    vendor: null,   // b3cbcd708ecbb997e5ce081b6f0e3fee927e4ced8845f23f05e3d95fe3bb45c8
    signBot1: null, // f0e8612e69e0fd46e81177ae78624305ff01ff1f07d1a78a2c85a55a8749feec
    signBot2: null, // db6f3d4057bbf625a490f860ebec3ca8ae072313835e78edf6055979d38fbb17
    signBot3: null  // 065ae131b0d795e7954804c157605a112bea3fd692567a0e2ebc7c569334c9ec
};

// Generate random private key bytes (2)
const privateKeys = Object.keys(accounts).map((value, index) => {
    let bytes = nem.crypto.nacl.randomBytes(32);
    return nem.utils.convert.ua2hex(bytes);
});

// Store private keys per account (3)
privateKeys.map((value, index) => {
    let acct = Object.keys(accounts)[index];
    accounts[acct] = value; 
});

// NEM network ID: Testnet=-104, Mainnet=104
var networkId = -104; 

// Create keypairs per account (4)
Object.keys(accounts).map((account, index) => {
    let privateKey = accounts[account];
    let keyPair    = nem.crypto.keyPair.create(privateKey);
    let publicKey  = keyPair.publicKey.toString();

    accounts[account] = {
        address: nem.model.address.toAddress(publicKey, networkId),
        publicKey: publicKey,
        privateKey: privateKey
    };
});

console.log(accounts);