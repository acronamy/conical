"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const reset = new index_1.Commands({
    name: "reset",
    short: "R",
    global: true,
    description: "factory reset conical cli global settings",
    children: [],
    run() {
        index_1.config.clear();
    }
});
exports.reset = reset;
