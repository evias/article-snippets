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
// SNIPPET 3: Transaction broadcaster
// ----------------------------------------------------------

// Configure the private key of the account to use
const publicKey = "7d8e08da31ca70c5b58bec2b71798b4e3cea7b1e8cb39d3f5c8d3f4b4500e456";
const privateKey = "068dd41b22209d8fae709ddb87b60fb13df5f6b957c2e681f4e446c4ce40a1ad";

// Format address from public key for Testnet
const networkId = -104; // Testnet=-104, Mainnet=104
const address   = nem.model.address.toAddress(publicKey, networkId);
const recipient = "TD2PEY23Y6O3LNGAO4YJYNDRQS3IRTEC7PZUIWLT";

// Define a NEM node for the API request
const NEM_HOST = "http://hugetestalice2.nem.ninja"; // HugeTestAlice2 is Testnet.
const NEM_PORT = 7890;

// Connect to our defined NEM node
const nem_node = nem.model.objects.create("endpoint")(NEM_HOST, NEM_PORT);

(async function() {

    // Prepare transaction tokens
    const definitionPairs = nem.model.objects.get("mosaicDefinitionMetaDataPair");

    // Prepare our transaction object
    const message = "EVS-" + (new Date()).valueOf();
    const transaction = nem.model.objects.create("transferTransaction")(recipient, 10, message);

    // Prepare signer
    const creds = nem.model.objects.create("common")("", privateKey);

    // Populate a NEM Transfer Transaction
    const entity = nem.model.transactions.prepare("transferTransaction")(
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
        console.log("[NEM] [ERROR] Could not send Transaction to " + recipient + ": " + JSON.stringify(response));
        return false;
    }

    // Read the response data
    let trxHash = response.transactionHash.data;
    console.log("[SUCCESS] Successfully sent mosaic transfer transaction, Hash is: " + trxHash);
})();
