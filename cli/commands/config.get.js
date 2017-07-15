"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const index_1 = require("../index");
const get = new index_1.Commands({
    name: "get",
    short: "g",
    children: [],
    global: true,
    description: "prints out conical global settings",
    run(command) {
        const commandFlags = command.flags;
        const allowableFlags = Object.keys(index_1.configDefaults);
        const tryFlags = Object.keys(index_1.onlyFlags);
        if (tryFlags.length <= 0) {
            command.help();
        }
        tryFlags.forEach(candidateFlag => {
            if (allowableFlags.indexOf(candidateFlag) >= 0) {
                //okay flag exists lets find its accepted values
                winston.info(`${candidateFlag}:`, index_1.config.getItem(candidateFlag));
            }
            else {
                //THROW no flag
                winston.error(`"--${candidateFlag}" is not a valid flag for command "${command.name}"`);
            }
        });
    },
    flags: Object.keys(index_1.configDefaults)
});
exports.get = get;
