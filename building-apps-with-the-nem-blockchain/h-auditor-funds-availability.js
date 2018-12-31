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
// SNIPPET 8: Auditor for Funds Availability with pre-defined
//            financial contract information
// ----------------------------------------------------------

// Specifying the financial contract details (1)
const contract = JSON.stringify({
    "min_price": 100,
    "max_price": 500,
    "details": "Purchase of a television for the office"
});

const config_in_hex = nem.utils.convert.utf8ToHex(contract);

// Configure the auditor instance (2)
const auditor = {
    multisigPublicKey: '19a5ef8009aed00a7124c63a4e59833fe66ec18729b67d9386b2920dd3cabd6d',
    requiredCosigners: 3,
    cosignaturePrice: 150000,
    messagePrice: 50000 * (Math.floor(contract.length / 32) + 1),
    neededCurrencies: ['nem:xem'],
    minimumTransactionsPossible: 50
};

/*
// ---
// Example of working auditor: TBKFYXLDLVMDZ76AU5EKVE7IA55BDXIV74FQSOCK
// ---
const auditor = {
    multisigPublicKey: '298711d4b81873ff840d2491086fbc3bbf003b9431da05aaa0be6ea5fe492b77',
    requiredCosigners: 1,
    cosignaturePrice: 150000,
    messagePrice: 50000 * (Math.floor(contract.length / 32) + 1),
    neededCurrencies: ['nem:xem'],
    minimumTransactionsPossible: 50
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

// Audit #2: Check that the multi-signature account can send at least 100 transactions during a full week
(async function() {

    const pubKey  = auditor.multisigPublicKey;
    const address = nem.model.address.toAddress(pubKey, networkId);

    // Read multi-signature balances (3)
    const response = await nem.com.requests.account.mosaics.owned(nem_node, address);

    // Get needed mosaics
    const fqmn = response.data.map((value, index) => {
        return value.mosaicId.namespaceId + ":" + value.mosaicId.name;
    });

    // Filter only `neededCurrencies` after formatting
    const mosaics = fqmn.map((mosaicFQMN, idx) => {
        // Filter taking only `neededCurrencies`
        return auditor.neededCurrencies.find((val, idx) => {
            return mosaicFQMN === val;
        });
    });

    // Auditor error case 1: Unavailable required currencies
    if (!mosaics || !mosaics.length || mosaics.length !== auditor.neededCurrencies.length) {
        console.error("Funds Availability: ERROR");
        console.error("Message: Multi-signature account does not hold all the required currencies!");
        console.error("Expected Currencies: ", auditor.neededCurrencies);
        console.error("Actual Currencies: ", mosaics);
        return false;
    }

    // Filter account balances
    const balance = response.data.filter((mosaic) => {
        return mosaic.mosaicId.namespaceId === "nem"
            && mosaic.mosaicId.name === "xem"
    }).shift();

    // Read raw XEM amount
    const xem = balance.quantity || 0;

    // Calculate the price per transaction (4)
    const price_per_tx = (auditor.requiredCosigners * auditor.cosignaturePrice)
                       + (auditor.messagePrice);

    // Auditor error case 2: Not enough funds available
    if (xem < price_per_tx) {
        console.error("Funds Availability: ERROR");
        console.error("Message: Multi-signature account does not hold enough XEM (nem:xem)!");
        console.error("Balance available: ", xem);
        return false;
    }

    // Check how many transactions are possible (5)
    const num_tx = Math.floor(xem / price_per_tx);

    if (num_tx < auditor.minimumTransactionsPossible) {
        let min = auditor.minimumTransactionsPossible;
        let total = ((min * price_per_tx) - xem) / Math.pow(10, 6);
        console.error("Funds Availability: ERROR");
        console.error("Message: Multi-signature account can only issue " + num_tx + " out of " + min + " transactions!");
        console.error("Action required: Please refill the multi-signature account with: " + total + " XEM");
        return false;
    }

    console.error("Funds Availability: SUCCESS");
    return true;
})();
// End Audit #2
