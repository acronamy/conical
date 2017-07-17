"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const Hashes = require("jshashes");
const MD5 = new Hashes.MD5;
const routes = new Map();
const httpServer = http.createServer();
const routeDefaults = {
    methods: "get",
};
function mount(mountOptions) {
    return function (target) {
        let proto = target.prototype;
        proto = Object.assign(proto, mountOptions);
        proto.id = MD5.hex(proto.name);
        proto.routes = new Map();
        Reflect.ownKeys(proto).forEach(function (key) {
            let referal = key.replace("$$tmp_", "");
            if (/\$\$tmp_/.test(key)) {
                let accessor = Object.freeze(Object.assign({
                    value: proto[referal]
                }, proto[key]));
                if ("url" in proto) {
                    if (proto.url !== "/") {
                        proto[key].url = proto.url + proto[key].url.replace(/\/$/, "");
                    }
                }
                proto.routes.set(proto[key].url, accessor);
                proto.routes.set(proto[key].id, accessor);
                //clean up tmp keys
                delete proto[key];
            }
        });
    };
}
exports.mount = mount;
function route(url, routeOptions = routeDefaults) {
    return function (mount, routeKey, descriptor) {
        //expose the metadata we need
        mount["$$tmp_" + routeKey] = {
            name: routeKey,
            id: MD5.hex(routeKey),
            url: url
        };
    };
}
exports.route = route;
function module(serverOptions) {
    return function (target) {
        let proto = target.prototype;
        proto = Object.assign(proto, serverOptions);
    };
}
exports.module = module;
function run(Server) {
    const DI = [];
    const serverConfig = Reflect.construct(Server, DI);
    httpServer.addListener("request", function (req, res) {
        for (let mount of serverConfig.declarations) {
            const mountRoutes = mount.prototype.routes;
            //
            console.log("REQ", req.url);
            console.log(mountRoutes);
            if (mountRoutes.has(req.url)) {
                res.end(mountRoutes.get(req.url).value());
            }
            else {
                res.end("404");
            }
        }
    });
    console.log("Runtime", mount.prototype.routes);
    httpServer.listen(serverConfig.port);
}
exports.run = run;
