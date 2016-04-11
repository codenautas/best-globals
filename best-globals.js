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

var Promises = require('best-promise');

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

/*
function nothing(){ 
    var d=new Date();
    d.isRealDate=true;
    d.setDateValue=nothing;
    return d; 
}
*/

bestGlobals.date = {
    parseFormat: function parseFormat(dateStr) {
        var tz1 = ' [0-9]{2}:[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}';
        var tz2 = 'T[0-9]{2}:[0-9]{2}:[0-9]{2}Z';
        // var re = '([12][0-9]{3})([-/])(([1][0-2])|(0?[1-9]))\\3(([0123][0-9]))';
        var re = '([0-9]+)([-/])(([1][0-2])|(0?[1-9]))\\3(([0123][0-9]))';
        var reDate = new RegExp('^('+re+'('+tz1+'|'+tz2+')?)$');
        var match = reDate.exec(dateStr);
        if(! match) { throw new Error('invalid date'); }
        return { y:parseInt(match[2]), m:parseInt(match[4]), d:parseInt(match[7]) };
    },
    isValid: function isValid(y, m, d) {
        //console.log("isValid(", y, m, d, ")")
        if(y<0 || m<0 || d<0) { return false; }
        switch(m) {
            case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                if(d>31) { return false; }
                break;
            case 4: case 6: case 9: case 11:
                if(d>30) { return false; }
                break;
            case 2:
                if(d > ((new Date(y, 1, 29).getMonth() == 1) ? 29 : 28) ) { return false; }
                break;
            default: return false;
        }
        return true;
    },
    isReal: function isReal(dateObject) {
        if(Object.prototype.toString.call(dateObject) === "[object Date]") {
            if(isNaN(dateObject.getTime())) { return false; }
            return bestGlobals.date.isValid(dateObject.getFullYear(), dateObject.getMonth()+1, dateObject.getDay()+1);
        }
        return false;
    },
    ymd: function ymd(y, m, d) {
        if(! this.isValid(y, m, d)) { throw new Error('invalid date'); }
        var d = new Date(y, m-1, d, 0, 0, 0, 0);
        d.isRealDate=true;
        function isValidDate(dv) {
            if(Object.prototype.toString.call(dv) === "[object Date]") {
                if(isNaN(dv.getTime())) { return false; }
                if(dv.getHours()!==0 || dv.getMinutes() !==0 || dv.getSeconds() !==0 || dv.getMilliseconds() !==0) {
                    return false;
                }
                return true;
            }
            return false;
        };
        d.setDateValue = function setDateValue(dateVal) {
            if(! isValidDate(dateVal)) { throw new Error('invalid date'); }
            d.setTime(dateVal.valueOf()); 
        };

        return d;
    },
    iso: function iso(dateStr) {
        var parsed=this.parseFormat(dateStr);
        return this.ymd(parsed.y, parsed.m, parsed.d);
    },
    array: function array(arr) {
        return this.ymd(arr[0], arr[1], arr[2]);
    }
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