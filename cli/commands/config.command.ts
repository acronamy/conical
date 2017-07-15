import {Commands} from "../index";

import {get} from "./config.get";
import {set} from "./config.set";
import {reset} from "./config.reset";

const ConfigCommand = new Commands({
    name:"config",
    global:true,
    description:"sets, gets and resets conical cli global settings.",
    children:[
        set,
        get,
        reset
    ]
})


export { ConfigCommand }