interface MountOptions{
    views:string|string[];
    path:string;
    providers?:any[];
}

class MountInstance{
    [key:string]: (req?,res?)=>string;
}


export {
    MountOptions,
    MountInstance
}