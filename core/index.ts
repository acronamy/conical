import * as path from "path";
import * as url from "url";
import * as http from "http";
import * as Hashes from "jshashes";
import * as isPath from "is-valid-path";
import * as fs from "fs-extra";
import * as cheerio from "cheerio";

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
        proto.id = MD5.hex(target.name);
        //If no absolute path is specified, the path will become absolute but relative to the mount file.
        if("localViews" in proto){
            proto.localViews = proto.localViews.map(viewDir=>{
                const isAbsolutePath = path.resolve(viewDir) === path.normalize(viewDir); 
                return {
                    origin:"custom",
                    path:isAbsolutePath?viewDir:path.join(path.dirname(proto.locator.filename), viewDir),
                    priority:1,
                    mount:proto.id,
                    name:target.name
                }
            })
        }

        
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
        const systemViews = [
            path.join(__dirname,"systemViews")
        ]
        if("globalViews" in proto){
            proto.globalViews = proto.globalViews.concat(systemViews);
        }
        else{
            proto.views = [
                path.join(__dirname,"systemViews")
            ];
        }
        //Provide additional info about these views paths to make things easier to digest
        proto.globalViews = proto.globalViews.map( viewDir =>{
            const isAbsolutePath = path.resolve(viewDir) === path.normalize(viewDir); 
            const mainFile:any = require.main;
            return {
                origin:viewDir.split(path.sep).pop() === "systemViews"?"system":"custom",
                path:isAbsolutePath ? viewDir:path.join(path.dirname(mainFile.filename), viewDir),
                mount:"*",
                //ensure that this is never the first choice
                priority:-Infinity
            }
        })
    }
}

//this is a set of injectors designed for system use
const debugInjector = new Map();
debugInjector.set("404", function(html, data){
    const $ = cheerio.load(html);
    $("title").text("404 "+data.reqMethod +" "+ data.reqUrl)
    $("#req-method").text(data.reqMethod);
    $("#req-url").text(data.reqUrl);
    return $.html();
});
debugInjector.set("500", function(html, data){
    const $ = cheerio.load(html);
    $("title").text("500 "+ data.reqUrl)
    $("#req-method").text(data.reqMethod);
    $("#req-url").text(data.reqUrl);
    $("#mount-name").text(data.metadata.mountName);
    $("#reasoning").text(data.metadata.reasoning);
    $("#fallback-tries").text(data.metadata.attempts);
    $("#template-file").text(data.metadata.templateFile);
    $("#resolve-fallback-order").html(data.metadata.fallbacks.map(fallback=>"<tr><td>"+fallback.path+"</td><td>"+fallback.fileExists+"</td></tr>").join(""))
    $("#stacktrace").text(JSON.stringify(data.metadata.fallbacks,null,"\t"));
    return $.html();
});



export function run( Server:Function ){
     const DI = []
     const serverConfig = <ServerOptions>Reflect.construct(Server, DI)
     
     //get all global views excluding system status code pages
     const globalViews = Server.prototype.globalViews.filter(viewPath=>viewPath.origin === "custom");
     //get all system views pages
     const systemStatusViews = Server.prototype.globalViews.find(viewPath=>viewPath.origin === "system")

    httpServer.addListener("request", async function(req,res){
        //system pages intercept

        //for performance reasons we want to get just one mount as a declaration
        const mount = serverConfig.declarations.find(mount=>{
            return mount.prototype.url === req.url;
        });


        const reqUrl = req.url;
        const reqMethod = req.method.toUpperCase();
        

        res.end = new Proxy(res.end,{
            apply(target, thisArg, argumentsList){

                let statusMetaData;
                if(typeof argumentsList[1] === "function"){
                   statusMetaData = argumentsList[1]();
                }

                const statusCode = new Set([
                    "403", "404", "500", "503", "504"
                ])
                const useStatusCode = argumentsList[0].split(".")[0]; 
                if( statusCode.has( useStatusCode ) ){
                    
                    let statusViewPath = <string>fs.readdirSync(systemStatusViews.path)
                        .find( view=>new RegExp(useStatusCode).test(view) )

                    statusViewPath = path.join(systemStatusViews.path, statusViewPath);
                    let rawFile = fs.readFileSync(statusViewPath ,"utf8");
                    
                    rawFile = debugInjector.get(useStatusCode)(rawFile, {
                        reqUrl:reqUrl,
                        reqMethod:reqMethod,
                        metadata:statusMetaData
                    })

                    argumentsList[0] = rawFile;
                }

                return Reflect.apply(target, thisArg, argumentsList);
            }
        })
        
        if(req.url === "/favicon.ico"){

        }
        else{
            
            
            res.setHeader('content-type', 'text/html');
            
            
            

            if(mount){
                const proto = mount.prototype;
                const mountName = mount.name;
                const searchViewsDirs = proto.localViews.concat(globalViews);
                const mountRoutes = proto.routes;
                if(mountRoutes.has(req.url)){
                    //at this point we dont know what we are serving;
                    const candidateValue = mountRoutes.get(req.url).value();
                    //are we serving strings or files?
                    if(isPath(candidateValue)){
                        //okay so its a path to file, lets check with our viewsDirs

                        console.log(searchViewsDirs.length,searchViewsDirs, candidateValue)
                        let i = 0;
                        for(let viewDir of searchViewsDirs){
                            i++
                            //find the
                            const viewDirExists = await fs.pathExists( viewDir.path ) 
                            viewDir.dirExists = viewDirExists;
                            viewDir.fileExists = false;
                            if(viewDirExists){
                                const content = new Set(await fs.readdirSync( viewDir.path ));
                                if(content.has(candidateValue)){
                                    viewDir.fileExists = true;
                                    const rawFile = await fs.readFile( path.join(viewDir.path, candidateValue), "utf8" );

                                    //template engines here

                                    //injectors here

                                    //change this value to send different results
                                    const send = rawFile;
                                    res.end( send );
                                }
                                else{
                                    //no luck in this dir lets fallback to another view dir
                                    continue;
                                }
                            }
                            else{
                                //no luck there is no dir
                                console.log("attempt "+i+" of "+searchViewsDirs.length)
                                console.log("view dir does not exist "+viewDir.path)
                                if(i === searchViewsDirs.length){
                                    //Bail out there really is no file to serve
                                    //500

                                    //SEND THIS?
                                    // No template "+candidateValue+ " at any view dir <br/>"+ JSON.stringify(searchViewsDirs)
                                    
                                    res.end("500",function(){
                                        //callbacks cant return data so this is safe to pass to injector.
                                        return {
                                            mountName:mountName,
                                            templateFile:candidateValue,
                                            fallbacks:searchViewsDirs,
                                            attempts:i,
                                            attemptsOf:searchViewsDirs.length,
                                            reasoning:"No template could be resolved because either the views directories or file itself might not exist."
                                        }
                                    })

                                    break;
                                }
                                else{
                                    continue;
                                }
                                
                            }

                            
                        }
                    }
                    else{
                        //just send the string its not a file or path to file
                        res.end( candidateValue );
                    }
                }
            }
            else{
                res.end("404.html");
            }
        }

    })
    httpServer.listen(serverConfig.port)
}

export {
    route,
    mount,
    module
}
