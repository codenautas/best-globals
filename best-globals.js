"use strict";

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
    var hasNull=false;
    while(i<arguments.length && arguments[i]==null){
        hasNull=hasNull || arguments[i]===null;
        i++;
    }
    if(arguments[i] instanceof bestGlobals.coalesce.throwError){
        if(arguments[i] instanceof bestGlobals.coalesce.throwErrorIfUndefined && hasNull){
            return null;
        }else{
            throw new Error(arguments[i].message);
        }
    }
    if(i>=arguments.length){
        if(hasNull){
            return null;
        }
    }else{
        return arguments[i];
    }
};

bestGlobals.coalesce.throwError=function throwError(message){
    if(this === bestGlobals.coalesce){
        return new bestGlobals.coalesce.throwError(message);
    }else{
        this.message=message;
    }
};

bestGlobals.coalesce.throwErrorIfUndefined=function throwErrorIfUndefined(message){
    if(this === bestGlobals.coalesce){
        return new bestGlobals.coalesce.throwErrorIfUndefined(message);
    }else{
        this.message=message;
    }
};

bestGlobals.coalesce.throwErrorIfUndefined.prototype=Object.create(bestGlobals.coalesce.throwError.prototype);

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
        /* eslint guard-for-in: 0 */
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

function deepCopy(object){
    var rta=object;
    if(bestGlobals.isPlainObject(object)){
        rta={};
        for(var attr in object){
            rta[attr]=deepCopy(object[attr]);
        }
    }
    if(object instanceof Array){
        rta=[];
        for(var attr in object){
            rta[attr]=deepCopy(object[attr]);
        }
    }
    return rta;
}

bestGlobals.deepCopy = deepCopy;

bestGlobals.changing = function changing(original, changes){
    var opts = bestGlobals.changing.retreiveOptions(arguments);
    if(original===null ||
        !bestGlobals.isPlainObject(original) &&
            !(original instanceof Error) &&
            (!opts.mostlyPlain || typeof original != "object" || !bestGlobals.isPlainObject(changes))
         // && !bestGlobals.changing
    ){
        if(!arguments[3]){
            throw new Error("changing with non Plain Object");
        }else if(changes!==undefined){
            return deepCopy(changes);
        }else{
            return deepCopy(original);
        }
    }else{
        if(typeof changes!=="object"){
            throw new Error("ERROR changing object with non-object");
        }else{
            var result=original instanceof Error?original:{};
            /*jshint forin:false */
            for(var name in original){
                if(!(name in changes)){
                    result[name] = deepCopy(original[name]);
                }else if('deletingValue' in opts && changes[name]===opts.deletingValue){
                    // empty
                }else{
                    result[name] = changing(original[name], changes[name], bestGlobals.changing.options(opts), true);
                }
            }
            for(name in changes){
                if(!(name in original)){
                    result[name] = deepCopy(changes[name]);
                }
            }
            /*jshint forin:true */
            return result;
        }
    }
};

bestGlobals.createOptionsToFunction(bestGlobals.changing);

function npad(num, width) {
    var n=num+''; // to string
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function addDateMethods(dt) {
    dt.toYmd = function toYmd() {
        var r = [];
        r.push(this.getFullYear());
        r.push(npad(this.getMonth()+1,2));
        r.push(npad(this.getDate(),2));
        return r.join('-');        
    };
    dt.toHms = function toHms() {
        var r = [];
        r.push(npad(this.getHours(),2));
        r.push(npad(this.getMinutes(),2));
        r.push(npad(this.getSeconds(),2));
        return r.join(':');
    };
    dt.toYmdHms = function toYmdHms() {
        return this.toYmd()+' '+this.toHms();
    };
    dt.toYmdHmsM = function toYmdHmsM() {
        return this.toYmdHms()+'.'+npad(this.getMilliseconds(),3);
    };
    dt.setDateValue = function setDateValue(dateVal) {
        if(! bestGlobals.date.isOK(dateVal)) { throw new Error('invalid date'); }
        dt.setTime(dateVal.valueOf()); 
    };
    dt.add = function add(objectOrTimeInterval){
        if(!objectOrTimeInterval.timeInterval){
            objectOrTimeInterval=bestGlobals.timeInterval(objectOrTimeInterval);
        }
        return bestGlobals.date(new Date(dt.getTime()+objectOrTimeInterval.timeInterval.ms));
    };
    return dt;
}

////////// date
bestGlobals.date = function date(dt) {
    if(! bestGlobals.date.isOK(dt)) { throw new Error('invalid date'); }
    var d = addDateMethods(new Date(dt.getTime()));
    if(d.getHours() || d.getMinutes() || d.getSeconds() || d.getMilliseconds()) {
        throw new Error('invalid date "'+d.toDateString()+'"because it has time');
    }
    d.isRealDate = true;
    return d;
};

bestGlobals.date.isValidDate = function isValidDate(year, month, day) {
    if(year<0 || month<1 || day<0) { return false; } 
    month -= 1;
    var d = new Date(year, month, day);
    return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day;
 };

bestGlobals.date.isOK = function isOK(dt) {
    if(! (dt instanceof Date) ||
       isNaN(dt.getTime()) ||
       ! bestGlobals.date.isValidDate(dt.getFullYear(), dt.getMonth()+1, dt.getDate())
    ){
        return false;
    }
    return true;
};

bestGlobals.date.ymd = function ymd(y, m, d) {
    if(! bestGlobals.date.isValidDate(y, m, d)) { throw new Error('invalid date'); }
    return bestGlobals.date(new Date(y, m-1, d, 0, 0, 0, 0));
};

// var reDate = '([12][0-9]{3})([-/])(([1][0-2])|(0?[1-9]))\\3(([0123][0-9]))';
var reDate = '([0-9]+)([-/])(([1][0-2])|(0?[1-9]))\\3(([0123][0-9]))';

bestGlobals.date.parseFormat = function parseFormat(dateStr) {
    var reTz1 = ' [0-9]{2}:[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}';
    var reTz2 = 'T([0-9]{2}):[0-9]{2}:[0-9]{2}\.?[0-9]*Z';
    var re = new RegExp('^('+reDate+'('+reTz1+'|'+reTz2+')?)$');
    var match = re.exec(dateStr);
    if(! match) { throw new Error('invalid date'); }
    return { y:parseInt(match[2],10), m:parseInt(match[4],10), d:parseInt(match[7],10) };
};

bestGlobals.date.iso = function iso(dateStr) {
    var parsed=bestGlobals.date.parseFormat(dateStr);
    return bestGlobals.date.ymd(parsed.y, parsed.m, parsed.d);
};

/*
bestGlobals.date.ms = function ms(ms){
    console.log('xxxxxxxxxxxxxxxx ', ms);
    console.log('xxxxxxxxxxxxxxxx ', new Date(ms));
    return bestGlobals.date(new Date(ms));
};
*/

bestGlobals.date.array = function array(arr) {
    if(arr.length !== 3) { throw new Error('invalid date array'); }
    return bestGlobals.date.ymd(arr[0], arr[1], arr[2]);
};

bestGlobals.date.round = function round(timedDate){
    var milisec = timedDate.getTime();
    var rawDate=new Date(milisec-milisec%(1000*60*60*24));
    console.log(bestGlobals.date.ymd(rawDate.getUTCFullYear(), rawDate.getUTCMonth()+1, rawDate.getUTCDate()));
    return bestGlobals.date.ymd(rawDate.getUTCFullYear(), rawDate.getUTCMonth()+1, rawDate.getUTCDate());
}

bestGlobals.date.today = function today(){
    return bestGlobals.date.round(new Date());
}

/////// datetime
bestGlobals.datetime=function datetime(dt) {
    if(! bestGlobals.date.isOK(dt)) { throw new Error('invalid date'); }
    var d = addDateMethods(new Date(dt.getTime()));
    d.isRealDateTime = true;
    return d;
};

bestGlobals.datetime.isValidTime = function isValidTime(h, m, s, ms) {
    if(h<0 || m<0 || s<0 || ms<0 || h>23 || m>59 || s>59 || ms>999) { return false; }
    return true;
};

bestGlobals.datetime.ymdHms = function ymdHmsM(y, m, d, hh, mm, ss) {
    return bestGlobals.datetime.ymdHmsM(y, m, d, hh, mm, ss, 0);
};

bestGlobals.datetime.ymdHmsM = function ymdHmsM(y, m, d, hh, mm, ss, ms) {
    if(! bestGlobals.date.isValidDate(y, m, d)) { throw new Error('invalid date'); }
    if(! bestGlobals.datetime.isValidTime(hh, mm, ss, ms)) { throw new Error('invalid datetime'); }
    return bestGlobals.datetime(new Date(y, m-1, d, hh, mm, ss, ms));
};

bestGlobals.datetime.parseFormat = function parseFormat(dateStr) {
    var reTz3 = ' ([0-9]{2}):([0-9]{2})(:([0-9]{2}))?(.([0-9]{3}))?';
    var re = new RegExp('^('+reDate+'('+reTz3+')?)$');
    var match = re.exec(dateStr);
    if(! match) { throw new Error('invalid datetime'); }
    // for(var p=0; p<match.length; ++p) { console.log(p, match[p]); }
    return {  y:parseInt(match[2],10), m:parseInt(match[4],10), d:parseInt(match[7],10),
             hh:parseInt(match[10]||0,10), mm:parseInt(match[11]||0,10),
             ss:parseInt(match[13]||0,10), ms:parseInt(match[15]||0,10) };
};

bestGlobals.datetime.iso = function iso(dateStr) {
    var parsed=bestGlobals.datetime.parseFormat(dateStr);
    return bestGlobals.datetime.ymdHmsM(parsed.y, parsed.m, parsed.d, parsed.hh, parsed.mm, parsed.ss, parsed.ms);
};

bestGlobals.datetime.array = function array(arr) {
    if(arr.length < 3 || arr.length>7) { throw new Error('invalid datetime array'); }
    return bestGlobals.datetime.ymdHmsM(arr[0], arr[1], arr[2], arr[3]||0, arr[4]||0, arr[5]||0, arr[6]||0);
};

bestGlobals.TimeInterval = function TimeInterval(timePack){
    if(typeof timePack === 'number'){
        timePack={ms:timePack};
        console.log('|-----------------------------|');
        console.log('| DEPRECATED timeInterval(ms) |');
        console.log('|-----------------------------|');
    }
    var timeValues={
        ms     :1,
        seconds:1000,
        minutes:1000*60,
        hours  :1000*60*60,
        days   :1000*60*60*24,
    }
    var time=0;
    for(var attr in timePack){
        time+=timePack[attr]*timeValues[attr];
    }
    this.timeInterval={ms:time};
    this.toHms = function toHms(omitSeconds, withDays, omitLeftCeros) {
        var leftCero = omitLeftCeros?'':'0';
        var tm = this.timeInterval.ms;
        var prefix = (tm<0?'-':'');
        var tdiff = [];
        var x = Math.abs(tm);
        x /= 1000;
        var s = Math.floor(x % 60);
        x /= 60;
        var m = Math.floor(x % 60);
        x /= 60;
        var h = Math.floor(x);
        if(withDays){
            h = Math.floor(x % 24);
            x /= 24;
            var d = Math.floor(x);
            if(d){
                prefix+=(Math.abs(d)<10?leftCero:'')+d+'D';
                if(!h && !m && !s){
                    return prefix;
                }
                prefix+=' ';
            }
        }
        tdiff.push((h<10?leftCero:'')+h);
        tdiff.push((m<10?'0':'')+m);
        if(!omitSeconds){
            tdiff.push((s<10?'0':'')+s);
        }
        var hourPart=tdiff.join(':');
        return prefix+hourPart;
    };
    this.toHm = function toHm() {
        return this.toHms(true);
    }
    this.toPlainString = function toPlainString(){
        return this.toHms(false,true,true);
    }
    this.add = function add(objectOrTimeInterval, factor){
        if(!objectOrTimeInterval.timeInterval){
            objectOrTimeInterval=bestGlobals.timeInterval(objectOrTimeInterval);
        }
        return new bestGlobals.TimeInterval({ms:this.timeInterval.ms+objectOrTimeInterval.timeInterval.ms*(factor||1)});
    };
    this.sub = function sub(objectOrTimeInterval){
        return this.add(objectOrTimeInterval,-1);
    }
    this.getAllHours = function getAllHours(){
        return this.timeInterval.ms/(1000*60*60);
    }
    this.sameValue = function sameValue(otherInterval){
        return otherInterval && 
            otherInterval instanceof bestGlobals.TimeInterval && 
            this.timeInterval.ms == otherInterval.timeInterval.ms;
    }
}

bestGlobals.TimeInterval.prototype.toString = function toString(){
    return this.toHms(false,true,false);
}

bestGlobals.timeInterval = function timeInterval(timePack) {
    return new bestGlobals.TimeInterval(timePack);
};

bestGlobals.functionName = function functionName(fun) {
    if(typeof fun !== "function"){
        throw new Error("non function in functionName");
    }
    return fun.name||fun.toString().replace(/^\s*function\s*([^(]*)\((.|\s)*$/i,'$1')||'anonymous';
};

bestGlobals.constructorName = function constructorName(obj) {
    if(obj){
        return bestGlobals.functionName(obj.constructor);
    }else{
        console.log('deprecate use of constructorName with non-object for',obj);
        console.log('it will throw Error in future releases');
    }
};

bestGlobals.escapeRegExp = function escapeRegExp(text){
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

var letterTranslator = {
    'à':'a', 'á':'a', 'â':'a', 'ã':'a', 'ä':'a', 'å':'a', 'À':'a', 'Á':'a', 'Â':'a', 'Ã':'a', 'Ä':'a', 'Å':'a',
    'è':'e', 'é':'e', 'ê':'e', 'ë':'e', 'È':'e', 'É':'e', 'Ê':'e', 'Ë':'e',
    'ì':'i', 'í':'i', 'î':'i', 'ï':'i', 'Ì':'i', 'Í':'i', 'Î':'i', 'Ï':'i',
    'ò':'o', 'ó':'o', 'ô':'o', 'õ':'o', 'ö':'o', 'Ò':'o', 'Ó':'o', 'Ô':'o', 'Õ':'o', 'Ö':'o',
    'ù':'u', 'ú':'u', 'û':'u', 'ü':'u', 'Ù':'u', 'Ú':'u', 'Û':'u', 'Ü':'u',
    'ñ':'nzzzzzzzzzz', 'Ñ':'nzzzzzzzzzz'
};

var letterTranslatorRegexp = new RegExp(
    '['+
    bestGlobals.escapeRegExp(Object.keys(letterTranslator).join(''))+
    ']','g'
);

bestGlobals.auxComplementInteger = function auxComplementInteger(integerText){
    return integerText.split('').map(function(digitText){ return digitText==='.'?'.':''+(9-digitText); }).join('');
}

bestGlobals.forOrder = function forOrder(text){
    if(text==null){
        return 'zzz(null)';
    }
    if(text instanceof Date){
        return text.toISOString();
    }
    var coalesce = bestGlobals.coalesce;
    var main=[];
    var signs=[];
    var canBeNegative=true;
    var normal=text.toString()
    .replace(letterTranslatorRegexp, function(letter){ return letterTranslator[letter]; })
    .replace(
        /([a-z]+)|((-?)0*(0|[1-9][0-9]*)(\.[0-9]+)?)|([^a-z0-9])/ig, 
        function(t, letters, nums, sign, integer, decimals, others){
            if(letters){
                main.push(' '+letters.toLowerCase());
            }
            if(nums){
                if(!integer){
                    integer='0';
                }
                var negative;
                if(sign && canBeNegative){
                    integer = bestGlobals.auxComplementInteger(integer||'');
                    decimals = bestGlobals.auxComplementInteger(decimals||'');
                    negative = true;
                }else{
                    negative = false;
                }
                main.push(' '+(negative?'A':'')+String.fromCharCode(65+coalesce(integer,'').length)+coalesce(integer,'')+coalesce(decimals,''));
            }
            canBeNegative=false;
            if(others){
                canBeNegative=true;
                signs.push(' , '+others);
            }
        }
    );
    return main.join('')+signs.join('')+'   '+text;
};

bestGlobals.forOrder.Native = function forOrderNative(a){
    return a;
};

bestGlobals.nullsOrder = 1; // 1=last -1=first;

bestGlobals.compareForOrder = function compareForOrder(sortColumns){
    var thisModule = this;
    return function forOrderComparator(row1,row2){
        var column;
        var i=0;
        do{
            var order = bestGlobals.coalesce(sortColumns[i].order, 1);
            column=sortColumns[i].column;
            if(row1[column]==null){
                if(row2[column]!=null){
                    return thisModule.nullsOrder;
                }
            }else if(row2[column]==null){
                return -thisModule.nullsOrder;
            }else{
                var a=(sortColumns[i].func||thisModule.forOrder)(row1[column]);
                var b=(sortColumns[i].func||thisModule.forOrder)(row2[column]);
                if(a>b){
                    return 1*order;
                }else if(a<b){
                    return -1*order;
                }
            }
            i++;
        }while(i<sortColumns.length);
        return 0;
    };
};

bestGlobals.sleep = function sleep(milliseconds){
    var pseudoFunction = function sleepAndPass(value){
        return new Promise(function(resolve){
            setTimeout(function(){ resolve(value); },milliseconds);
        });
    };
    pseudoFunction.then = function then(f){
        return pseudoFunction().then(f);
    };
    return pseudoFunction;
};

/* istanbul ignore next */
bestGlobals.registerJson4All = function registerJson4All(JSON4all){
    JSON4all.addType(Date, {
        specialTag: function specialTag(value){
            if(value.isRealDate){
                return 'date';
            }else{
                return 'Date';
            }
        },
        construct:function construct(value){
            return new Date(value);
        },
        deconstruct:function deconstruct(date){
            if(date.isRealDate){
                return date.toYmd();
            }else{
                return date.getTime();
            }
        }
    });
    JSON4all.addType('date', {
        construct: function construct(value){
            return bestGlobals.date.iso(value);
        },
    });
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
// 2017-03-26
// https://tc39.github.io/ecma262/#sec-array.prototype.find
// adapted by Emilio Platzer
function arrayFind(predicate){
 // 1. Let O be ? ToObject(this value).
  if (this == null) {
    throw new TypeError('"this" is null or not defined');
  }

  var o = Object(this);

  // 2. Let len be ? ToLength(? Get(O, "length")).
  var len = o.length >>> 0;

  // 3. If IsCallable(predicate) is false, throw a TypeError exception.
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }

  // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
  var thisArg = arguments[1];

  // 5. Let k be 0.
  var k = 0;

  // 6. Repeat, while k < len
  while (k < len) {
    // a. Let Pk be ! ToString(k).
    // b. Let kValue be ? Get(O, Pk).
    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
    // d. If testResult is true, return kValue.
    var kValue = o[k];
    if (predicate.call(thisArg, kValue, k, o)) {
      return kValue;
    }
    // e. Increase k by 1.
    k++;
  }

  // 7. Return undefined.
  return undefined;
}

if(!Array.prototype.find){
  Object.defineProperty(Array.prototype, 'find', {
    value: arrayFind
  });
}

bestGlobals.arrayFind = arrayFind;

bestGlobals.serie = function serie(NorFirst, NifNoFirst){
    var n     = NifNoFirst==null ? NorFirst : NifNoFirst;
    var first = NifNoFirst==null ? 0        : NorFirst  ;
    return Array.apply(null, Array(n)).map(function (_, i) {return i+first;});
};

return bestGlobals;

});
