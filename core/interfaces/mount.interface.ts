interface MountOptions{
    views:string|string[];
    url:string;
    providers?:any[];
}

class MountInstance{
    [key:string]: (req?,res?)=>string;
}


export {
    MountOptions,
    MountInstance
}