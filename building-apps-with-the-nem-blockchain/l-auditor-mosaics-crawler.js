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
// SNIPPET 11: Auditor for Mosaics Crawler for the NEM blockchain
// --------------------------------------------------------------

// Configure the auditor instance (1)
const auditor = {
    mosaic: "pacnem:afficionado",
};

/*
// ---
// Example of working auditor: TCTIMURL5LPKNJYF3OB3ACQVAXO3GK5IU2BJMPSU
// ---
const auditor = {
    mosaic: "pacnem:daily-ad-view",
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

// Audit #6: Check that the pre-configured mosaic has been transferred
(async function() {

    // Read mosaic definitions for namespace `pacnem`
    const namespace = auditor.mosaic.replace(/(.*):(.*)/, '$1');
    const mosaic    = auditor.mosaic.replace(/(.*):(.*)/, '$2');
    const page = await nem.com.requests.namespace.mosaicDefinitions(nem_node, namespace);
    const defs = page.data.filter((row) => {
        return row.mosaic.id.name === mosaic;
    });

    // Read creator public key from mosaic definition
    const creator = defs.shift().mosaic.creator;
    const address = nem.model.address.toAddress(creator, networkId);

    // Crawl the NEM blockchain transactions to find our mosaic
    const response = await nem.com.requests.account.transactions.outgoing(nem_node, address);
    const filtered = response.data.filter((row) => {
        let content = row.transaction.type === 4100 ? row.transaction.otherTrans : row.transaction;
        return content.type === 257 
            && content.mosaics.length 
            && content.mosaics.filter((mos) => {
                return mos.mosaicId.namespaceId === namespace
                    && mos.mosaicId.name === mosaic
            }).length;
    });

    if (!filtered.length) {
        console.error("Mosaics Crawler: ERROR");
        console.error("Message: The mosaic " + auditor.mosaic + " was not transferred!");
        return false;
    }

    console.log("Mosaics Expiry: SUCCESS");
    console.log("Details: Total of " + filtered.length + " transactions found!");
    return true;
})();
// End Audit #6
