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
const sleep = require("sleep");

// ------------------------------------------------------------
// SNIPPET 9: Auditor for Volume Health of our application
// ------------------------------------------------------------

// Configure the auditor instance (1)
const auditor = {
    multisigPublicKey: '19a5ef8009aed00a7124c63a4e59833fe66ec18729b67d9386b2920dd3cabd6d',
    minimumTransactions: 50,
    minimumAccumulatedAmount: 1000000000 // 1000.000000 XEM (or 1000 XEM)
};

/*
// ---
// Example of working auditor: TBKFYXLDLVMDZ76AU5EKVE7IA55BDXIV74FQSOCK
// ---
const auditor = {
    multisigPublicKey: '298711d4b81873ff840d2491086fbc3bbf003b9431da05aaa0be6ea5fe492b77',
    minimumTransactions: 2,
    minimumAccumulatedAmount: 10000000 // 10.000000 XEM (or 10 XEM)
};
// ---
// End of example
// ---
*/

// Define a NEM node for the API requests
const NEM_HOST = "http://hugetestalice2.nem.ninja"; // HugeTestAlice2 is Testnet.
const NEM_PORT = 7890;

// Connect to our defined NEM node
const networkId = -104; // Testnet
const nem_node = nem.model.objects.create("endpoint")(NEM_HOST, NEM_PORT);

// Audit #4: Check that the application is issuing transactions
(async function() {

    // Create address from public key
    const pubKey  = auditor.multisigPublicKey;
    const address = nem.model.address.toAddress(pubKey, networkId);

    // Read all transactions from multi-signature account
    let lastId = null;
    let txes = [];
    let rows = [];
    let hashes = {};
    let totalAmt = 0;
    do {
        // Read transactions starting at `lastId` (2)
        const result = await nem.com.requests
                          .account
                          .transactions
                          .all(nem_node, address, null, lastId);

        rows = result.data.filter((row) => {
            let hash = row.meta.hash.data;
            let amt  = (row.transaction.type === 4100 ?  row.transaction.otherTrans.amount : row.transaction.amount) || 0;
            let isNew = !hashes.hasOwnProperty(hash);

            // Store the transaction hash and timestamp (3)
            hashes[hash] = row.transaction.timeStamp;
            lastId = row.meta.id;
            totalAmt += amt;
            return isNew;
        });

        // Concatenate transactions
        txes = txes.concat(rows);

        // NEM DoS-Filter counter measure (4)
        sleep.sleep(1);
    }
    while (rows && rows.length);

    // Auditor error case 1: No transactions were ever created
    if (!txes.length) {
        console.error("Volume Health: ERROR");
        console.error("Message: The application has never sent transactions!");
        return false;
    }

    // Auditor error case 2: Minimum transactions count not reached
    if (txes.length < auditor.minimumTransactions) {
        console.error("Volume Health: ERROR");
        console.error("Message: The application has not reached the mininum transaction count!");
        console.error("Expected Count: " + auditor.minimumTransactions);
        console.error("Actual Count: " + txes.length);
        return false;
    }

    // Auditor error case 3: Minimum accumulated amount not reached
    if (totalAmt < auditor.minimumAccumulatedAmount) {
        console.error("Volume Health: ERROR");
        console.error("Message: The application has not reached the mininum accumulated amount!");
        console.error("Expected Amount: " + auditor.minimumAccumulatedAmount);
        console.error("Actual Amount  : " + totalAmt);
        return false;
    }

    console.error("Volume Health: SUCCESS");
    return true;
})();
// End Audit #4
