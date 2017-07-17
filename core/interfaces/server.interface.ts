interface systemPages{
    /**
     * Please provide a path to file relative to defined views directory.
     * 404 is commonly seen when content is requested that does not exist yet or was moved to a different url.
    */
    "notFound_404"?:string;
    /**
     * Please provide a path to file relative to defined views directory.
     * 403 generally means you need some sort of session to access this page because you do not have permission at this time.
    */
    "forbidden_403"?:string;
    /**
     * Please provide a path to file relative to defined views directory.
     * 500 pops up when there are gremlins in the system, there is likely something vastly wrong with what you just did.
    */
    "internalSeverError_500"?:string;
    /**
     * Please provide a path to file relative to defined views directory.
     * 504 is a hard to explain so here is an example: A proxy server needs to communicate with a secondary web server but the comunication timed out.
    */
    "gatewayTimeout_504"?:string;
    /**
     * Please provide a path to file relative to defined views directory.
     * 503 status code could be a temporary problem. It basically means the web server isn’t available and likely down. lets hope its not the entire internet on the blink!
    */
    "serviceUnavailable_503"?:string;
}

export interface ServerOptions{
    /**
     * Set Conical into Spa mode to allow special single page application behaviors in the router
     * Supported: Angular, React
    */
    spa?:"angular"|"react",
    /**
     * Although we start with localhost, any number of host names can be used.
    */
    host:number|string;
    /**
     * Provide a port number to listen on.
     * Popular choices include 8080, 8000, 3000, 9000, 1337 and many more!
    */
    port:number;
    /**
     * Conical uses the concept of mounts in the same way Django creates apps, each mount must be declared here or conical wont know the mount exists.
    */
    declarations:any[];
    /**
     * Optionally override a system page with the path to a file of your choosing.
     * There are several reasons for doing this, better debugging and stack tracing,
     * prettier printing and custom forwarding behaviors. 
    */
    systemPages?:systemPages;
    /**
     * Provide a views directory which system wide, all mounts and system pages will use to search for thier specified template.
     * There can be multiple views directories to provide fallbacks.
     * Mounts have a higher preference towards thier own local views directive in order to allow overide behaviors.
    */
    globalViews?:string[]
    /**
     * Allows you to inject services, to all mounts system wide, think middleware or plugins and your on the right track. 
    */
    globalProviders?:string[]
}