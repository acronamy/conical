"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const NewCommand = new index_1.Commands({
    name: "new",
    short: "n",
    description: 'Creates a new directory and a new Conical server eg. "con new [name]"',
    children: [],
    run() {
        console.log("NEW RAN");
    },
    flags: {
        spa: {
            angular() {
            },
            react() {
            }
        },
        port: {
            ["8080"]() {
            }
        }
    }
});
exports.NewCommand = NewCommand;
