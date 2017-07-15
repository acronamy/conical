"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const GenerateCommand = new index_1.Commands({
    name: "generate",
    short: "g",
    children: [],
    run() {
        console.log("NEW GEN");
    }
});
exports.GenerateCommand = GenerateCommand;
