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

function npad(num, width) {
    var n=num+''; // to string
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function dateIsValid(y, m, d) {
    if(y<0 || m<0 || d<0) { return false; }
    switch(m) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            if(d>31) { return false; }
            break;
        case 4: case 6: case 9: case 11:
            if(d>30) { return false; }
            break;
        case 2:
            if(d > ((new Date(y, 1, 29).getMonth() === 1) ? 29 : 28) ) { return false; }
            break;
        default: return false;
    }
    return true;
};


function dateIsReal(dt) {
    if(! (dt instanceof Date)
       || isNaN(dt.getTime())
       || ! dateIsValid(dt.getFullYear(), dt.getMonth()+1, dt.getDay()+1)
    ) { return false }
    return true;
}
   
bestGlobals.date = function date(dt) {
    if(! dateIsReal(dt)) { throw new Error('invalid date'); }
    dt.isRealDate = true;
    dt.toYmd = function toYmd() {
        var r = [];
        r.push(this.getFullYear());
        r.push(npad(this.getMonth()+1,2));
        r.push(npad(this.getDate(),2));
        return r.join('-');        
    }
    dt.toHms = function toHms() {
        var r = [];
        r.push(npad(this.getHours(),2));
        r.push(npad(this.getMinutes(),2));
        r.push(npad(this.getSeconds(),2));
        return r.join(':');
    },
    dt.toYmdHms = function toYmdHms() {
        return this.toYmd()+' '+this.toHms();
    },
    dt.toYmdHmsM = function toYmdHmsM() {
        return this.toYmdHms()+'.'+npad(this.getMilliseconds(),3);
    }
    dt.setDateValue = function setDateValue(dateVal) {
        if(! dateIsReal(dateVal)) { throw new Error('invalid date'); }
        dt.setTime(dateVal.valueOf()); 
    };
    return dt;
};
bestGlobals.date.ymd = function ymd(y, m, d) {
    if(! dateIsValid(y, m, d)) { throw new Error('invalid date'); }
    return bestGlobals.date(new Date(y, m-1, d, 0, 0, 0, 0));
};

bestGlobals.date.parseFormat = function parseFormat(dateStr) {
    var tz1 = ' [0-9]{2}:[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}';
    var tz2 = 'T[0-9]{2}:[0-9]{2}:[0-9]{2}Z';
    // var re = '([12][0-9]{3})([-/])(([1][0-2])|(0?[1-9]))\\3(([0123][0-9]))';
    var re = '([0-9]+)([-/])(([1][0-2])|(0?[1-9]))\\3(([0123][0-9]))';
    var reDate = new RegExp('^('+re+'('+tz1+'|'+tz2+')?)$');
    var match = reDate.exec(dateStr);
    if(! match) { throw new Error('invalid date'); }
    return { y:parseInt(match[2],10), m:parseInt(match[4],10), d:parseInt(match[7],10) };
};

bestGlobals.date.iso =  function iso(dateStr) {
    var parsed=bestGlobals.date.parseFormat(dateStr);
    return bestGlobals.date.ymd(parsed.y, parsed.m, parsed.d);
};

bestGlobals.date.array = function array(arr) {
    if(arr.length !== 3) { throw new Error('invalid date array'); }
    return bestGlobals.date.ymd(arr[0], arr[1], arr[2]);
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