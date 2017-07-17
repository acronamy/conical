import * as path from "path";
import * as url from "url";
import * as http from "http";
import * as Hashes from "jshashes";

//Interfaces
//Interfaces: options
import { MountOptions, MountInstance } from "./interfaces/mount.interface";
import { RouteOptions } from "./interfaces/route.interface";
import { ServerOptions } from "./interfaces/server.interface";

const MD5 = new Hashes.MD5;
const routes = new Map();
const httpServer = http.createServer();



const routeDefaults:RouteOptions = {
    methods:"get",
}
function mount(mountOptions:MountOptions) {
    return function (target:Function) {
        let proto = target.prototype;
        proto = Object.assign(proto, mountOptions)
        
        proto.id = MD5.hex(proto.name);
        proto.routes = new Map();

        Reflect.ownKeys(proto).forEach(function(key:string){
            let referal = key.replace("$$tmp_","");
            if(/\$\$tmp_/.test(key)){

                let accessor = Object.freeze(Object.assign({
                    value: proto[referal]
                }, proto[key]))

                if("url" in proto){
                    if(proto.url!=="/"){
                        proto[key].url = proto.url+proto[key].url.replace(/\/$/, "")
                    }
                }

                proto.routes.set( proto[key].url, accessor );
                proto.routes.set( proto[key].id, accessor );
                //clean up tmp keys
                delete proto[key];
            }
        })
    }
}

function route(url:string, routeOptions:RouteOptions = routeDefaults) {
    return function (mount:any, routeKey:string, descriptor:PropertyDescriptor) {
        //expose the metadata we need
        mount["$$tmp_"+routeKey] = {
            name: routeKey,
            id: MD5.hex(routeKey),
            url: url
        }
    }
}

function module(serverOptions:ServerOptions){
    return function (target:Function) {
        let proto = target.prototype;
        proto = Object.assign(proto,serverOptions);

    }
}


export function run( Server:Function ){
     const DI = []
     const serverConfig = <ServerOptions>Reflect.construct(Server, DI)
     
    httpServer.addListener("request", function(req,res){


        for(let mount of serverConfig.declarations){
            const mountRoutes = mount.prototype.routes;
            //
            console.log("REQ",req.url)
            console.log(mountRoutes)

            if(mountRoutes.has(req.url)){
                res.end( mountRoutes.get(req.url).value() );
                
            }
            else{
                res.end("404");
            }
        }
    })

    console.log("Runtime",mount.prototype.routes)

    httpServer.listen(serverConfig.port)
}

export {
    route,
    mount,
    module
}
