"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const index_1 = require("../index");
const set = new index_1.Commands({
    name: "set",
    short: "s",
    global: true,
    description: "save conical cli global settings",
    children: [],
    run(command) {
        //console.log(onlyFlags)
        const commandFlags = command.flags;
        const allowableFlags = Object.keys(commandFlags);
        const tryFlags = Object.keys(index_1.onlyFlags);
        if (tryFlags.length <= 0) {
            command.help();
        }
        tryFlags.forEach(candidateFlag => {
            if (allowableFlags.indexOf(candidateFlag) >= 0) {
                //okay flag exists lets find its accepted values
                const valueOfFlag = index_1.onlyFlags[candidateFlag];
                if (valueOfFlag in commandFlags[candidateFlag]) {
                    //CALL THE FLAG
                    if (typeof commandFlags[candidateFlag][valueOfFlag] === "function") {
                        commandFlags[candidateFlag][valueOfFlag]();
                    }
                }
                else {
                    winston.error(`"--${candidateFlag}" from "${command.name}" does not accept the value "${valueOfFlag}"`);
                    command.help();
                }
            }
            else {
                //THROW no flag
                winston.error(`"--${candidateFlag}" is not a valid flag for command "${command.name}"`);
            }
        });
    },
    flags: {
        loglevel: {
            error() {
                index_1.config.setItem("loglevel", "error");
            },
            warn() {
                index_1.config.setItem("loglevel", "warn");
            },
            info() {
                index_1.config.setItem("loglevel", "info");
            },
            verbose() {
                index_1.config.setItem("loglevel", "verbose");
            },
            debug() {
                index_1.config.setItem("loglevel", "debug");
            },
            silly() {
                index_1.config.setItem("loglevel", "silly");
            }
        },
    }
});
exports.set = set;
