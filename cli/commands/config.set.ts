import * as winston from "winston";
import {Commands, config, onlyFlags} from "../index";

const set = new Commands({
    name:"set",
    short:"s",
    global:true,
    description:"save conical cli global settings",
    children:[],
    run(command){
        //console.log(onlyFlags)
        const commandFlags:any = command.flags;
        const allowableFlags = Object.keys(commandFlags);
        const tryFlags = Object.keys(onlyFlags);

        if(tryFlags.length <= 0){
            command.help()
        }

        tryFlags.forEach(candidateFlag=>{
            if(allowableFlags.indexOf(candidateFlag) >= 0){
                //okay flag exists lets find its accepted values
                const valueOfFlag = onlyFlags[candidateFlag];
                if(valueOfFlag in commandFlags[candidateFlag]){
                    //CALL THE FLAG
                    if(typeof commandFlags[candidateFlag][valueOfFlag] === "function"){
                        commandFlags[candidateFlag][valueOfFlag]();
                    }
                }
                else{
                    winston.error(`"--${candidateFlag}" from "${command.name}" does not accept the value "${valueOfFlag}"`);
                    (command as any).help()
                }
            }
            else{
                //THROW no flag
                winston.error(`"--${candidateFlag}" is not a valid flag for command "${command.name}"`)
            }
        })
    },
    flags:{
        loglevel:{
            error(){
                config.setItem("loglevel","error");
            }, 
            warn(){
                config.setItem("loglevel","warn");
            },
            info(){
                config.setItem("loglevel","info");
            },
            verbose(){
                config.setItem("loglevel","verbose");
            }, 
            debug(){
                config.setItem("loglevel","debug");
            },
            silly(){
                config.setItem("loglevel","silly");
            }
        },
    }
})

export {set}