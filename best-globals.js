"use strict";


global.coalesce=function coalesce(){
    var i=0;
    while(i<arguments.length-1 && arguments[i]==null) i++;
    return arguments[i];
}