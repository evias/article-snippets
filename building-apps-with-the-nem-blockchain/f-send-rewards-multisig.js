/**
 *
 * Part of the evias/article-snippets package.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the Apache License, Version 2.0.
 *
 * This source file is subject to the Apache License, Version 2.0 that is
 * bundled with this package in the LICENSE file.
 *
 * @package    evias/article-snippets
 * @version    1.0.0
 * @author     Grégory Saive <greg@evias.be>
 * @license    MIT License
 * @copyright  (c) 2016-2019, Grégory Saive for eVias Services
 *
 * --
 *
 * MIT License for Package evias/article-snippets
 *
 * Copyright (c) 2016-2019 Grégory Saive <greg@evias.be>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/
const nem = require("nem-sdk").default;

// ----------------------------------------------------------
// SNIPPET 6: Multi-signature Transactions broadcaster
// ----------------------------------------------------------

// Configure the private key of the account to use (for the initiation)
const publicKey = "3cf4caedd2e231b3371dcbf85ab9826c632f54d1fca0805155c3e0aa597cee17";
const privateKey = "b3cbcd708ecbb997e5ce081b6f0e3fee927e4ced8845f23f05e3d95fe3bb45c8";

// Format address from public key for Testnet
const networkId = -104; // Testnet=-104, Mainnet=104
const address   = nem.model.address.toAddress(publicKey, networkId);

// The recipient is the player being rewarded
const recipient = "TD2PEY23Y6O3LNGAO4YJYNDRQS3IRTEC7PZUIWLT";

// Define a NEM node for the API request
const NEM_HOST = "http://hugetestalice2.nem.ninja"; // HugeTestAlice2 is Testnet.
const NEM_PORT = 7890;

// Connect to our defined NEM node
const nem_node = nem.model.objects.create("endpoint")(NEM_HOST, NEM_PORT);

(async function() {

    // Prepare transaction tokens
    let definitionPairs = nem.model.objects.get("mosaicDefinitionMetaDataPair");

    // Include our token specification, this token MUST exist on the NEM blockchain.
    // /!\ Note that this Mosaic must exist on the NEM blockchain, you can see if it
    //     is the case by following this URL: http://hugetestalice2.nem.ninja:7890/namespace/mosaic/definition/page?namespace=pacnem
    definitionPairs["pacnem:afficionado"] = {
        "mosaicDefinition": {
            "creator": "7e5606db494a485d64f40c41416e43bb9a1405f52ba8dc7dcbe8abeb2dde1f40",
            "description": "PacNEM Testnet Achievements: Afficionado!\n\nhttps://www.pacnem.com",
            "id": { "namespaceId": "pacnem", "name": "afficionado" },
            "properties": [
                { "name": "divisibility", "value": 0 },
                { "name": "initialSupply", "value": "290888" },
                { "name": "supplyMutable", "value": "true" },
                { "name": "transferable", "value": "true" },
            ]
        }
    };

    // Prepare our transaction object
    const message = "EVS-" + (new Date()).valueOf();
    let transaction = nem.model.objects.create("transferTransaction")(recipient, 1, message);

    // Configure multi-signature wrapper
    transaction.isMultisig = true;
    transaction.multisigAccount = {
        publicKey: "19a5ef8009aed00a7124c63a4e59833fe66ec18729b67d9386b2920dd3cabd6d"
    };

    // Prepare signer
    const creds = nem.model.objects.create("common")("", privateKey);

    // Prepare transaction mosaic attachment
    const reward = nem.model.objects.create("mosaicAttachment")("pacnem", "afficionado", 1);

    // Attach reward to transaction
    transaction.mosaics.push(reward);

    // Populate a NEM Transfer Transaction
    const entity = nem.model.transactions.prepare("mosaicTransferTransaction")(
        creds,
        transaction,
        definitionPairs,
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
        console.log("[NEM] [ERROR] Could not send Transaction to " + recipient + ": " + JSON.stringify(response));
        return false;
    }

    // Read the response data
    const trxHash = response.innerTransactionHash.data;
    console.log("[SUCCESS] Successfully sent multi-signature, Inner Hash to be co-signed is: " + trxHash);
})();
