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

// --------------------------------------------------------------
// SNIPPET 10: Auditor for Mosaics Expiry for the NEM blockchain
// --------------------------------------------------------------

// Configure the auditor instance (1)
const auditor = {
    mosaic: "pacnem:afficionado",
};

// Define a NEM node for the API requests
const NEM_HOST = "http://hugetestalice2.nem.ninja"; // HugeTestAlice2 is Testnet.
const NEM_PORT = 7890;

// Connect to our defined NEM node
const networkId = -104; // Testnet
const nem_node = nem.model.objects.create("endpoint")(NEM_HOST, NEM_PORT);

// Audit #5: Check that the pre-configured mosaic has more than 30 days to live
(async function() {

    // Read mosaic definitions for namespace `pacnem`
    const namespace = auditor.mosaic.replace(/(.*):(.*)/, '$1');
    const mosaic    = auditor.mosaic.replace(/(.*):(.*)/, '$2');
    const info = await nem.com.requests.namespace.info(nem_node, namespace);
    const chain = await nem.com.requests.chain.height(nem_node);

    // Testnet has 2-minutes block time
    const FIFTEEN_D = 15 * (24 * 60 * 60 / 120);
    const ONE_YEAR  = 365 * (24 * 60 * 60 / 120);

    // Mainnet has 1-minute block time
    //const FIFTEEN_D = 15 * (24 * 60 * 60 / 60);
    //const ONE_YEAR  = 365 * (24 * 60 * 60 / 60);

    // Read creation height
    const creation = info.height;
    const current = chain.height;
    const expiry  = creation + ONE_YEAR;
    const grace   = expiry + (2 * FIFTEEN_D);

    if (current >= expiry) {
        console.error("Mosaics Expiry: ERROR");
        console.error("Message: The namespace " + namespace + " expired at block #" + expiry + "!");
        console.error("Details: You have up to block #" + grace + " to renew the namespace created on block #" + creation + "!");
        console.error("Current: Block #" + current);
        return false;
    }

    const remain = expiry - current;
    if (remain <= 2 * FIFTEEN_D) {
        console.error("Mosaics Expiry: ERROR");
        console.error("Message: The namespace " + namespace + " expires at block #" + expiry + " which is in " + remain + "!");
        console.error("Details: You have up to block #" + grace + " to renew the namespace!");
        console.error("Current: Block #" + current);
        return false;
    }

    console.log("Mosaics Expiry: SUCCESS");
    console.log("Details: Mosaic expires in " + remain + " blocks!");
    return true;
})();
// End Audit #5
