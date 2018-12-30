const nem = require("nem-sdk").default;

// ----------------------------------------------------------
// SNIPPET 5: Convert a NEM Account to multi-signature
// ----------------------------------------------------------

// Configure the private key of the accounts to use
const accounts = { 
   business: { 
       publicKey: '19a5ef8009aed00a7124c63a4e59833fe66ec18729b67d9386b2920dd3cabd6d',
       privateKey: 'ddee05102935e1f31cc7df8c6352f0e1a0193cbefe9673029a04228b395de846'},
   vendor: { publicKey: '3cf4caedd2e231b3371dcbf85ab9826c632f54d1fca0805155c3e0aa597cee17'},
   signBot1: { publicKey: '4f746f7c6b7dc3a4ccdbb1060fd2df9e7ffab0149230c18d08d0156e308ddc1b'},
   signBot2: { publicKey: '036633c33eb1666f9c20d7604e859fe6976bb81172510594abef6e0b70d0f1b5'},
   signBot3: { publicKey: '4b5cd2a86fc344c06cfcbfffab42011db974955e3b8ba2ddfcf0f6184c389bf5'}
};

// Define a NEM node for the API request
const NEM_HOST = "http://hugetestalice2.nem.ninja"; // HugeTestAlice2 is Testnet.
const NEM_PORT = 7890;

// Connect to our defined NEM node
const nem_node = nem.model.objects.create("endpoint")(NEM_HOST, NEM_PORT);

(async function() {
    // constants
    const TYPE_ADD_COSIG = 1;
    const TYPE_DEL_COSIG = 2;

    // Create our MultisigCosignatoryModification objects
    const cosignerFactory = nem.model.objects.create("multisigCosignatoryModification");
    const modifications = [
        cosignerFactory(TYPE_ADD_COSIG, accounts.vendor.publicKey),
        cosignerFactory(TYPE_ADD_COSIG, accounts.signBot1.publicKey),
        cosignerFactory(TYPE_ADD_COSIG, accounts.signBot2.publicKey),
        cosignerFactory(TYPE_ADD_COSIG, accounts.signBot3.publicKey),
    ];

    // Create our MultisigAggregateModification transactions
    const aggregateFactory = nem.model.objects.create("multisigAggregateModification");
    const transaction = aggregateFactory();

    // Populate our aggregate modification
    transaction.modifications = modifications;
    transaction.relativeChange = 3;

    // Prepare signer
    const creds = nem.model.objects.create("common")("", accounts.business.privateKey);

    // Prepare our NEM Transaction
    const networkId = -104;
    const entity = nem.model.transactions.prepare("multisigAggregateModificationTransaction")(
        creds,
        transaction,
        networkId
    );

    // Get current network time
    let timeSync = await nem.com.requests.chain.time(nem_node);
    const time   = Math.floor(timeSync.sendTimeStamp / 1000);

    // Fix time for entity broadcast
    entity.timeStamp = time;
    entity.deadline  = time + (60 * 1000); // + 60 seconds

    // Sign the transaction and then broadcast
    // Important: Signing happens on the client!
    const response = await nem.model.transactions.send(creds, entity, nem_node);

    // If code >= 2, it's an error
    if (response.code >= 2) {
        console.log("[NEM] [ERROR] Could not send Transaction: " + JSON.stringify(response));
        return false;
    }

    // Read the response data
    let trxHash = response.transactionHash.data;
    console.log("[SUCCESS] Successfully converted to multi-signature, transaction Hash is: " + trxHash);
})();
