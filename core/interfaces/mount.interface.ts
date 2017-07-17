interface MountOptions{
    /**
     * The locator needs the module object, it is the safest way to get information about this file from the internals of conical.
     * The locator is absolutely 100% *required* and should be left alone and always included.
    */
    locator:NodeModule,
    /**
     * Mounts have a higher preference towards thier own local views directive in order to allow override behaviors.
     * If the views directory or the template is not found, mounts will attempt to fallback to global views.
     * If no absolute path is specified, the path will become absolute but relative to this file
     * Relative path behavior: views => {this-file}/views
     * Absolute path behavior: Anything you set it to be, so be careful!
    */
    localViews:string[];
    /**
     * Provide a url attach this mount
    */
    url:string;
    /**
     * Allows you to inject services, to this mount only, think middleware or plugins and your on the right track. 
    */
    localProviders?:any[];
}

class MountInstance{
    [key:string]: (req?,res?)=>string;
}


export {
    MountOptions,
    MountInstance
}