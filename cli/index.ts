#!/usr/bin/env node

const {LocalStorage} = require("node-localstorage");
import {argv, } from "yargs";
import * as winston from "winston";
const packageJson = require("./package.json")
const recurseCommand = (recurseLvl:number)=> argv._[recurseLvl];
let copyArgs = argv._;
const helpSpecialModifier = argv.help||argv.h;
import * as colors from "colors";

import * as fs from "fs";
import * as path from "path";

let onlyFlags = argv;
delete onlyFlags.$0;
delete onlyFlags._;
export {onlyFlags};

//DEFAULGS
export const config = new LocalStorage('./config')
export const configDefaults = {
    "loglevel":"debug"
}
if(!config.getItem("firstRun")){
    Object.keys(configDefaults).forEach(key => {
        config.setItem(key, configDefaults[key]);    
    });
    //has installed
    config.setItem("firstRun",true);
}

winston.level = config.getItem("loglevel");

//are we in a conical project?
let lockedOn = false;
export function withinProject(){
    const cliHere = new Set(fs.readdirSync(process.cwd()))

    try{
        const checkProject = module.require(path.join(process.cwd(),"node_modules/@conical/core"))
        if(typeof checkProject === "object"){
            lockedOn = true;
        }
    }
    catch(err){
        if(err){
            process.chdir("../")
            if(process.cwd()!=="/"){
                withinProject();
            }
        }
    }
    return lockedOn;
}


interface flag{
    [key:string]:()=>void;
}
interface flags{
    [key:string]:flag;
}

interface CommandOptions{
    name:string;
    short?:string;
    description?:string;
    children:Commands[];
    run?:(command:Commands)=>void;
    help?:()=>void;
    flags?:flags | string[] | boolean;
    data?:any;
    global?:boolean;
}

export class Commands implements CommandOptions{
    name:string;
    description?:string;
    short?:string;
    children:Commands[];
    run?:(command:Commands)=>void;
    help?:()=>void;
    flags?:flags | string[] | boolean;
    data?:any;
    global?:boolean;
    constructor(options:CommandOptions){
        this.name = options.name;
        this.short = options.short;
        this.children = options.children;
        this.flags = options.flags||false;
        this.description = options.description||this.name+" has no description, sorry!"
        this.global = options.global||false;
        const defaultHelp = ()=>{
            if(!withinProject()){
                console.log(colors.yellow("Unable to find conical project at this directory commands will be ignored."))
            }
            winston.info(
`${this.description}
  ${this.children.map(command=>{
      return `${colors.green(command.name)} ${command.description}
  ${command.short?colors.gray("@alias "+ command.short):""}`}).join("  ")}
${Object.keys(this.flags).map(key=>`  --${key}`).join("\n")}
`
)
        }
        this.help = options.help||defaultHelp;
        this.run = options.run||this.help;
        this.data = options.data||false;
    }
}

let lvl = 0;
function parseCommands(...commands:Commands[]){

    copyArgs.shift()
    //use name or shortcode.
    const commandInstance =   commands.find(command=>command.name === recurseCommand(lvl))||
                    commands.find(command=>command.short === recurseCommand(lvl));

    //Specificity is now locked to one command so lets run it.
    const ignoreSelfArgsLen = (argv._.length -1);
    if(lvl === ignoreSelfArgsLen){
        //RUN
        const copyInstance = commandInstance as any;
        
        
        //call help?
        if(helpSpecialModifier){
            copyInstance.help();
        }
        else{

            if(!withinProject() && copyInstance.global === false){
                console.log(colors.yellow("Unable to find conical project at this directory"))
            }
            else{
                copyInstance.run(copyInstance);
            }
        }
    }
    
    if(copyArgs.length > 0 && commandInstance){
        //When to search for children
        let conditionSearchChildren = commandInstance.children.length>0;
        if(conditionSearchChildren){
            lvl++
            parseCommands(...commandInstance.children);
        }
    }

    const rootHelp:any = commands.find(command=>command.name === "help");
    if(rootHelp){
        rootHelp.data = commands;
    }
}

process.title = packageJson.name;
export {packageJson}

import {ConfigCommand} from "./commands/config.command";
import {NewCommand} from "./commands/new.command";
import {GenerateCommand} from "./commands/generate.command";
import {RootHelpCommand, VersionCommand} from "./commands/cli.command";


parseCommands(
    NewCommand,
    GenerateCommand,
    //CLI Related
    ConfigCommand,
    VersionCommand,
    RootHelpCommand
)