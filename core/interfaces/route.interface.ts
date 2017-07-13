import { httpMethod } from "./http.interface";

export interface RouteOptions{
    name?:string;
    id?:string;
    methods:httpMethod[]|httpMethod;
    url?:string;
}