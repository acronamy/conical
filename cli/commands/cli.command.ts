import * as winston from "winston";
import {Commands, config, onlyFlags, packageJson, withinProject} from "../index";
import * as colors from "colors";
import * as fs from "fs";
import * as path from "path";

const cliName:string = packageJson.name.replace("@conical/","");

const VersionCommand = new Commands({
    name:"version",
    description:"Outputs "+cliName+" CLI version.",
    short:"v",
    children:[],
    global:true,
    run(){
        winston.info(`${cliName} version:`,packageJson.version)
    }
})


function printFlags(flags:any){
    return Object.keys(flags).map(key=>{
        return colors.cyan("--"+key)
    }).join("\n  ")
}
function printChildren(children:Commands[]){
    return children.map(child=>{
        return `${colors.green(child.name)} ${colors.white(child.description)}`
    }).join("\n  ")
}


const RootHelpCommand = new Commands({
    name:"help",
    short:"h",
    children:[],
    global:true,
    run(command){
        process.nextTick(function(){
            
            if(!withinProject()){
                console.log(colors.yellow("Unable to find conical project at this directory"))
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

            const availableCommands:Commands[] = command.data;
            const stdout = availableCommands.map(command=>{

                //children and flags
                if(command.children.length>0 && command.flags!== false){
                    return `${cliName} ${command.name} <options..> ${colors.green("<subcommands>")}
  ${command.description}
  ${printFlags(command.flags)}
  ${printChildren(command.children)}
  `;
                }

                //no children just flags
                else if(command.flags!== false){
                    return `${cliName} ${command.name} ${colors.cyan("<options..>")}
  ${command.description}
  ${printFlags(command.flags)}
  `;
                }

                //no flags just children
                else if(command.children.length>0){
                    return `${cliName} ${command.name} ${colors.green("<subcommands>")}
  ${command.description}
  ${printChildren(command.children)}
  `;
                }

                //no children no flags
                else{
                    return `${cliName} ${command.name}
  ${command.description}
  `;
                }
                

            })
            console.log(stdout.join("\n"));
        })

    }
})

export {
    VersionCommand,
    RootHelpCommand
}