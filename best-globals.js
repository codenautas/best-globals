"use strict";
/*jshint eqnull:true */
/*jshint node:true */

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'bestGlobals', function() {
/*jshint +W040 */

/*jshint -W004 */
var bestGlobals = {};
/*jshint +W004 */

bestGlobals.coalesce=function coalesce(){
    var i=0;
    while(i<arguments.length-1 && arguments[i]==null){
        i++;
    }
    if(arguments[i] instanceof bestGlobals.coalesce.throwError){
        throw new Error(arguments[i].message);
    }
    return arguments[i];
};

bestGlobals.coalesce.throwError=function throwError(message){
    if(this === bestGlobals.coalesce){
        return new bestGlobals.coalesce.throwError(message);
    }else{
        this.message=message;
    }
};

function retreiveOptions(functionCallee, functionAruguments, mandatoryPositionCountingFromOne){
    if(functionAruguments.length<mandatoryPositionCountingFromOne){
        return {};
    }
    var opts = functionAruguments[mandatoryPositionCountingFromOne-1];
    if(opts instanceof functionCallee.options){
        return opts;
    }else{
        throw new Error("options must be constructed with "+functionCallee.name+".options function");
    }
}

bestGlobals.createOptionsToFunction = function createOptionsToFunction(fun, mandatoryPositionCountingFromOne){
    mandatoryPositionCountingFromOne = mandatoryPositionCountingFromOne || fun.length+1;
    fun.retreiveOptions = function retrieOptions(functionAruguments){
        return retreiveOptions(fun, functionAruguments, mandatoryPositionCountingFromOne);
    };
    fun.options = function options(opts){
        var result = Object.create(fun.options.prototype);
        /*jshint forin:false */
        for(var attr in opts){
            result[attr] = opts[attr];
        }
        /*jshint forin:true */
        return result;
    };
};

bestGlobals.isPlainObject = function isPlainObject(x){
    return typeof x==="object" && x && x.constructor === Object;
};

bestGlobals.changing = function changing(original, changes){
    var opts = bestGlobals.changing.retreiveOptions(arguments);
    if(!bestGlobals.isPlainObject(original) || original===null){
        if(changes!==undefined){
            return changes;
        }else{
            return original;
        }
    }else{
        if(typeof changes!=="object"){
            throw new Error("ERROR changing object with non-object");
        }else{
            var result={};
            /*jshint forin:false */
            for(var name in original){
                if(!(name in changes)){
                    result[name] = original[name];
                }else if('deletingValue' in opts && changes[name]===opts.deletingValue){
                }else{
                    result[name] = changing(original[name], changes[name]);
                }
            }
            for(name in changes){
                if(!(name in original)){
                    result[name] = changes[name];
                }
            }
            /*jshint forin:true */
            return result;
        }
    }
};

function nothing(){ 
    var d=new Date();
    d.isRealDate=true;
    d.setDateValue=nothing;
    return d; 
}

function dateIsValid(dateObject) {
    if(Object.prototype.toString.call(dateObject) === "[object Date]") {
        return ! isNaN(dateObject.getTime());
    }
    return false;
}

function setupDate(d) {
    d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
    d.isRealDate=dateIsValid(d);
    return d;
}

function prn(id, d) {
    console.log(id, ".toISOString", d.toISOString());
    console.log(id, ".toUTCString", d.toUTCString());
    console.log(id, ".getTimezoneOffset()", d.getTimezoneOffset());
    console.log(id, ".getDate()", d.getDate());
    console.log(id, ".getUTCDate()", d.getUTCDate());
    console.log(id, ".getDay()", d.getDay());
    console.log(id, ".getUTCDay()", d.getUTCDay());
    console.log(id, ".getTime()", d.getTime());
}

bestGlobals.date = {
    iso: function iso(dateStr) {
        return setupDate(new Date(Date.parse(dateStr)));
    },
    array: function array(arr) {
        return setupDate(new Date(Date.UTC(arr[0], arr[1]-1, arr[2], 0,0,0)));
    },
    ymd: function ymd(y, m, d) {
        return setupDate(new Date(Date.UTC(y, m-1, d, 0,0,0)));
    },
};

bestGlobals.createOptionsToFunction(bestGlobals.changing);

bestGlobals.setGlobals = function setGlobals(theGlobalObj){
    /*jshint forin:false */
    for(var name in bestGlobals){
        theGlobalObj[name] = bestGlobals[name];
    }
    /*jshint forin:true */
};

return bestGlobals;

});