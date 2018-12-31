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

// ------------------------------------------------------------
// SNIPPET 9: Auditor for Network Health of the NEM blockchain
// ------------------------------------------------------------

// Configure the auditor instance (1)
const auditor = {
    nodes: [
        "http://hugetestalice2.nem.ninja",
        "http://bigalice2.nem.ninja"
    ]
};

// Define a NEM node for the API requests
const NEM_PORT = 7890;

// Connect to our defined NEM node
const networkId = -104; // Testnet

// Audit #3: Check that the used NEM network nodes are still online
(async function() {

    for (let i = 0, m = auditor.nodes.length; i < m; i++) {
        const nem_node = nem.model.objects.create("endpoint")(auditor.nodes[i], NEM_PORT);

        // Read heartbeat API (2)
        const response = await nem.com.requests.endpoint.heartbeat(nem_node);

        // Auditor error case 1: One of the nodes is not responding
        if (!response || !response.code || response.code !== 1) {
            console.error("Network Health: ERROR");
            console.error("Message: The NEM network node at '" + auditor.nodes[i] + "' is not responding!");
            return false;
        }
    }

    console.error("Network Health: SUCCESS");
    return true;
})();
// End Audit #3
