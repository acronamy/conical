import * as winston from "winston";
import {Commands, config, onlyFlags} from "../index";

const GenerateCommand = new Commands({
    name:"generate",
    short:"g",
    children:[],
    run(){
        console.log("NEW GEN")
    }
})

export {GenerateCommand}