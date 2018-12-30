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
// SNIPPET 7: Auditor for Accounts Health Checks
// ----------------------------------------------------------

// Configure the auditor instance (1)
const auditor = {
    multisigPublicKey: '19a5ef8009aed00a7124c63a4e59833fe66ec18729b67d9386b2920dd3cabd6d',
    countCosigners: 4,
    requiredCosigners: 3,
    publicKeys: [
        '3cf4caedd2e231b3371dcbf85ab9826c632f54d1fca0805155c3e0aa597cee17',
        '4f746f7c6b7dc3a4ccdbb1060fd2df9e7ffab0149230c18d08d0156e308ddc1b',
        '036633c33eb1666f9c20d7604e859fe6976bb81172510594abef6e0b70d0f1b5',
        '4b5cd2a86fc344c06cfcbfffab42011db974955e3b8ba2ddfcf0f6184c389bf5'
    ]
};

/*
// ---
// Example of working auditor: TBKFYXLDLVMDZ76AU5EKVE7IA55BDXIV74FQSOCK
// ---
const auditor = {
    multisigPublicKey: '298711d4b81873ff840d2491086fbc3bbf003b9431da05aaa0be6ea5fe492b77',
    countCosigners: 1,
    requiredCosigners: 1,
    publicKeys: [
        '5645ea5b6bfc9bce6e69eab6002281d0e9c52fc0405ab99533d28e497b96ed81'
    ]
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

// Audit #1: Check that the multi-signature account is well configured
(async function() {

    const pubKey  = auditor.multisigPublicKey;
    const address = nem.model.address.toAddress(pubKey, networkId);

    // Read multi-signature account information (2)
    let info = await nem.com.requests.account.data(nem_node, address);

    // Configuration failure
    if (!info || !info.meta || !info.account) {
        console.error("Account Health: ERROR");
        console.error("Message: Invalid auditor configuration. Verify your accounts and try again.");
        return false;
    }

    // Auditor error case 1: Missing multi-signature configuration on the NEM blockchain
    if (!info.account.multisigInfo.hasOwnProperty("cosignatoriesCount")) {
        console.error("Account Health: ERROR");
        console.error("Message: Multi-signature account is not a multi-signature account!");
        return false;
    }

    // Auditor error case 2: Missing co-signatories configuration on the NEM blockchain
    if (!info.meta.cosignatories.length) {
        console.error("Account Health: ERROR");
        console.error("Message: Multi-signature account is missing co-signatories configuration!");
        return false;
    }

    // Verify presence of co-signer public keys (3)
    const cosignatories = info.meta.cosignatories.map((cosig, index) => {
        const pubKey = cosig.publicKey;
        return auditor.publicKeys.find((val, idx) => {
            return pubKey === val;
        });
    });

    // Auditor error case 3: Invalid list of co-signatories
    if (!cosignatories.length || cosignatories.length !== auditor.countCosigners) {
        console.error("Account Health: ERROR");
        console.error("Message: Multi-signature account has invalid co-signatories configuration!");
        return false;
    }

    // Auditor error case 4: Invalid count of available co-signatories
    if (info.account.multisigInfo.cosignatoriesCount !== auditor.countCosigners) {
        console.error("Account Health: ERROR");
        console.error("Message: Multi-signature account has wrong co-signatories count!");
        return false;
    }

    // Auditor error case 5: Invalid required co-signatories count configuration
    if (info.account.multisigInfo.minCosignatories !== auditor.requiredCosigners) {
        console.error("Account Health: ERROR");
        console.error("Message: Multi-signature account has wrong required co-signatories count!");
        return false;
    }

    console.log("Account Health: SUCCESS");

    return true;
})();
// End Audit #1
