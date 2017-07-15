import * as winston from "winston";
import {Commands, config, onlyFlags, configDefaults} from "../index";

const get = new Commands({
    name:"get",
    short:"g",
    children:[],
    global:true,
    description:"prints out conical global settings",
    run(command){
        const commandFlags = command.flags
        const allowableFlags = Object.keys(configDefaults);
        const tryFlags = Object.keys(onlyFlags);

        if(tryFlags.length <= 0){
            command.help()
        }

        tryFlags.forEach(candidateFlag=>{
            if(allowableFlags.indexOf(candidateFlag) >= 0){
                //okay flag exists lets find its accepted values
                winston.info(`${candidateFlag}:`,config.getItem(candidateFlag))
            }
            else{
                //THROW no flag
                winston.error(`"--${candidateFlag}" is not a valid flag for command "${command.name}"`)
            }
        })
    },
    flags:Object.keys(configDefaults)
})

export {get}