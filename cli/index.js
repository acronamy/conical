#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { LocalStorage } = require("node-localstorage");
const yargs_1 = require("yargs");
const winston = require("winston");
const packageJson = require("./package.json");
exports.packageJson = packageJson;
const recurseCommand = (recurseLvl) => yargs_1.argv._[recurseLvl];
let copyArgs = yargs_1.argv._;
const helpSpecialModifier = yargs_1.argv.help || yargs_1.argv.h;
const colors = require("colors");
const fs = require("fs");
const path = require("path");
let onlyFlags = yargs_1.argv;
exports.onlyFlags = onlyFlags;
delete onlyFlags.$0;
delete onlyFlags._;
//DEFAULGS
exports.config = new LocalStorage('./config');
exports.configDefaults = {
    "loglevel": "debug"
};
if (!exports.config.getItem("firstRun")) {
    Object.keys(exports.configDefaults).forEach(key => {
        exports.config.setItem(key, exports.configDefaults[key]);
    });
    //has installed
    exports.config.setItem("firstRun", true);
}
winston.level = exports.config.getItem("loglevel");
//are we in a conical project?
let lockedOn = false;
function withinProject() {
    const cliHere = new Set(fs.readdirSync(process.cwd()));
    try {
        const checkProject = module.require(path.join(process.cwd(), "node_modules/@conical/core"));
        if (typeof checkProject === "object") {
            lockedOn = true;
        }
    }
    catch (err) {
        if (err) {
            process.chdir("../");
            if (process.cwd() !== "/") {
                withinProject();
            }
        }
    }
    return lockedOn;
}
exports.withinProject = withinProject;
class Commands {
    constructor(options) {
        this.name = options.name;
        this.short = options.short;
        this.children = options.children;
        this.flags = options.flags || false;
        this.description = options.description || this.name + " has no description, sorry!";
        this.global = options.global || false;
        const defaultHelp = () => {
            if (!withinProject()) {
                console.log(colors.yellow("Unable to find conical project at this directory commands will be ignored."));
            }
            winston.info(`${this.description}
  ${this.children.map(command => {
                return `${colors.green(command.name)} ${command.description}
  ${command.short ? colors.gray("@alias " + command.short) : ""}`;
            }).join("  ")}
${Object.keys(this.flags).map(key => `  --${key}`).join("\n")}
`);
        };
        this.help = options.help || defaultHelp;
        this.run = options.run || this.help;
        this.data = options.data || false;
    }
}
exports.Commands = Commands;
let lvl = 0;
function parseCommands(...commands) {
    copyArgs.shift();
    //use name or shortcode.
    const commandInstance = commands.find(command => command.name === recurseCommand(lvl)) ||
        commands.find(command => command.short === recurseCommand(lvl));
    //Specificity is now locked to one command so lets run it.
    const ignoreSelfArgsLen = (yargs_1.argv._.length - 1);
    if (lvl === ignoreSelfArgsLen) {
        //RUN
        const copyInstance = commandInstance;
        //call help?
        if (helpSpecialModifier) {
            copyInstance.help();
        }
        else {
            if (!withinProject() && copyInstance.global === false) {
                console.log(colors.yellow("Unable to find conical project at this directory"));
            }
            else {
                copyInstance.run(copyInstance);
            }
        }
    }
    if (copyArgs.length > 0 && commandInstance) {
        //When to search for children
        let conditionSearchChildren = commandInstance.children.length > 0;
        if (conditionSearchChildren) {
            lvl++;
            parseCommands(...commandInstance.children);
        }
    }
    const rootHelp = commands.find(command => command.name === "help");
    if (rootHelp) {
        rootHelp.data = commands;
    }
}
process.title = packageJson.name;
const config_command_1 = require("./commands/config.command");
const new_command_1 = require("./commands/new.command");
const generate_command_1 = require("./commands/generate.command");
const cli_command_1 = require("./commands/cli.command");
parseCommands(new_command_1.NewCommand, generate_command_1.GenerateCommand, 
//CLI Related
config_command_1.ConfigCommand, cli_command_1.VersionCommand, cli_command_1.RootHelpCommand);
