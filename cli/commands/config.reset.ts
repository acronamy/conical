import * as winston from "winston";
import {Commands, config} from "../index";

const reset = new Commands({
    name:"reset",
    short:"R",
    global:true,
    description:"factory reset conical cli global settings",
    children:[],
    run(){
        config.clear();
    }
})

export {reset}