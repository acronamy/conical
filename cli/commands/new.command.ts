import * as winston from "winston";
import {Commands, config, onlyFlags} from "../index";

const NewCommand = new Commands({
    name:"new",
    short:"n",
    description:'Creates a new directory and a new Conical server eg. "con new [name]"',
    children:[],
    run(){
        console.log("NEW RAN")
    },
    flags:{
        spa:{
            angular(){

            },
            react(){

            }
        },
        port:{
            ["8080"](){
                
            }
        }
    }
})

export {NewCommand}