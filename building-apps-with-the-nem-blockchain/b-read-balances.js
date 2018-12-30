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
// SNIPPET 2: Read balances
// ----------------------------------------------------------

// Configure the private key of the account to use
var publicKey = "7d8e08da31ca70c5b58bec2b71798b4e3cea7b1e8cb39d3f5c8d3f4b4500e456";
var privateKey = "068dd41b22209d8fae709ddb87b60fb13df5f6b957c2e681f4e446c4ce40a1ad";

// Format address from public key for Testnet
var networkId = -104; // Testnet=-104, Mainnet=104
var address = nem.model.address.toAddress(publicKey, networkId);

// Define a NEM node for the API request
var NEM_HOST = "http://hugetestalice2.nem.ninja"; // HugeTestAlice2 is Testnet.
var NEM_PORT = 7890;

// Connect to our define NEM node
var nem_node = nem.model.objects.create("endpoint")(NEM_HOST, NEM_PORT);

(async function() {

    // Read available balances
    const response = await nem.com.requests.account.mosaics.owned(nem_node, address);

    // Get mosaic names
    const mosaics = response.data.map((value, index) => {
        return value.mosaicId.namespaceId + ":" + value.mosaicId.name;
    });

    // Format account balances
    const balances = response.data.map((value, index) => {
        let fqmn = value.mosaicId.namespaceId + ":" + value.mosaicId.name;
        return value.quantity + " " + fqmn;
    });

    console.log(balances);
})();
