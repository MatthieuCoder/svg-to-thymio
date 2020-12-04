/*
 *
 *  * This file is subject to the terms and conditions defined in
 *  * file 'LICENSE.txt', which is part of this source code package.
 *
 */

import resolve from "rollup-plugin-node-resolve";

export default {
    input: "build/temp/Main.js",
    output: {
        file: "distribution/app.js",
        format: "iife"
    },
    plugins: [
        resolve(),
    ]
};
