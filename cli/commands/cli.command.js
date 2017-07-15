"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const index_1 = require("../index");
const colors = require("colors");
const cliName = index_1.packageJson.name.replace("@conical/", "");
const VersionCommand = new index_1.Commands({
    name: "version",
    description: "Outputs " + cliName + " CLI version.",
    short: "v",
    children: [],
    global: true,
    run() {
        winston.info(`${cliName} version:`, index_1.packageJson.version);
    }
});
exports.VersionCommand = VersionCommand;
function printFlags(flags) {
    return Object.keys(flags).map(key => {
        return colors.cyan("--" + key);
    }).join("\n  ");
}
function printChildren(children) {
    return children.map(child => {
        return `${colors.green(child.name)} ${colors.white(child.description)}`;
    }).join("\n  ");
}
const RootHelpCommand = new index_1.Commands({
    name: "help",
    short: "h",
    children: [],
    global: true,
    run(command) {
        process.nextTick(function () {
            if (!index_1.withinProject()) {
                console.log(colors.yellow("Unable to find conical project at this directory"));
            }
            // try{
            //     //are we in a conical project
            //     module.require(path.join(process.cwd(),"node_modules/@conical/core"))
            //     winston.silly("Conical project found at "+process.cwd())
            // }
            // catch(err){
            //     if(err){
            //         console.log(colors.yellow("Unable to find conical project at "+process.cwd()))
            //         console.log(colors.yellow("Consider running con new [name] to create a new conical project"))
            //     }
            // }
            const availableCommands = command.data;
            const stdout = availableCommands.map(command => {
                //children and flags
                if (command.children.length > 0 && command.flags !== false) {
                    return `${cliName} ${command.name} <options..> ${colors.green("<subcommands>")}
  ${command.description}
  ${printFlags(command.flags)}
  ${printChildren(command.children)}
  `;
                }
                else if (command.flags !== false) {
                    return `${cliName} ${command.name} ${colors.cyan("<options..>")}
  ${command.description}
  ${printFlags(command.flags)}
  `;
                }
                else if (command.children.length > 0) {
                    return `${cliName} ${command.name} ${colors.green("<subcommands>")}
  ${command.description}
  ${printChildren(command.children)}
  `;
                }
                else {
                    return `${cliName} ${command.name}
  ${command.description}
  `;
                }
            });
            console.log(stdout.join("\n"));
        });
    }
});
exports.RootHelpCommand = RootHelpCommand;
