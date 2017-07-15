"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const config_get_1 = require("./config.get");
const config_set_1 = require("./config.set");
const config_reset_1 = require("./config.reset");
const ConfigCommand = new index_1.Commands({
    name: "config",
    global: true,
    description: "sets, gets and resets conical cli global settings.",
    children: [
        config_set_1.set,
        config_get_1.get,
        config_reset_1.reset
    ]
});
exports.ConfigCommand = ConfigCommand;
