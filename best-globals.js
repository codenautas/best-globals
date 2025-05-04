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
        for(attr in object){
            rta[attr]=deepCopy(object[attr]);
        }
    }
    return rta;
}

bestGlobals.deepCopy = deepCopy;

function ChangingWithSpecial(change){
    this.change = change;
}

function changing(original, changes){
    var opts = changing.retreiveOptions(arguments);
    if (changes instanceof ChangingWithSpecial) {
        return changes.change(original);
    }
    if(original===null ||
        !bestGlobals.isPlainObject(original) &&
            !(original instanceof Error) &&
            (!opts.mostlyPlain || typeof original != "object" || !bestGlobals.isPlainObject(changes))
         // && !bestGlobals.changing
    ){
        if(!arguments[3]){
            throw new Error("changing with non Plain Object");
        }else if(changes===undefined || opts.nullIsUndefined && changes===null){
            return deepCopy(original);
        }else{
            return deepCopy(changes);
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
                    result[name] = changing(original[name], changes[name], changing.options(opts), true);
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

changing.trueByObject = function trueByObject(object){
    return new ChangingWithSpecial(function(original, opts){
        if (original == true) return deepCopy(object);
        if (original) return changing(original, object, changing.options(opts))
        return original;
    });
}

bestGlobals.dig = function dig(description, wanted){
    if(arguments.length==1){
        wanted=description;
        description=null;
    }
    if(typeof wanted==="function"){
        return wanted;
    }else{
        return bestGlobals.dig.record(wanted);
    }
};

bestGlobals.dig.record = function digrecord(description, wanted){
    /* istanbul ignore else */
    if(arguments.length==1){
        if(typeof description==="string"){
            return bestGlobals.dig;
        }
        wanted=description;
        description=null;
    }
    return function(data){
        var result={};
        for(var name in wanted){
            var want=wanted[name];
            if(typeof want !== "function"){
                throw new Error("the value must be a dig object");
            }
            if(want===bestGlobals.dig){
                if(name in data){
                    result[name] = data[name];
                }
            }else{
                result[name] = want(data[name]);
            }
        }
        return result;
    };
};

bestGlobals.dig.exclude = function digExclude(description, dontWanted){
    if(arguments.length==1){
        dontWanted=description;
        description=null;
    }
    return function(data){
        var result={};
        for(var name in data){
            if(!(name in dontWanted) || !dontWanted[name]){
                result[name] = data[name];
            }
        }
        return result;
    };
}

bestGlobals.dig.default = function (description, defaultValue){
    if(arguments.length==1){
        defaultValue=description;
        description=null;
    }
    return function(value){
        return value===undefined?defaultValue:value;
    };
};

bestGlobals.dig.indexedObject = function digIndexedObject(description, wanted){
    if(arguments.length==1){
        wanted=description;
        description=null;
    }
    return function(colection){
        var result={};
        for(var idx in colection){
            result[idx] = bestGlobals.dig(wanted)(colection[idx]);
        }
        return result;
    };
}
bestGlobals.dig.idx = bestGlobals.dig.indexedObject;

bestGlobals.dig.array = function array(description, wanted){
    if(arguments.length==1){
        wanted=description;
        description=null;
    }
    return function(array){
        var result=array.map(function(element){ return bestGlobals.dig(wanted)(element);});
        return result;
    };
}

bestGlobals.spec = bestGlobals.dig;


bestGlobals.createOptionsToFunction(changing);

bestGlobals.changing = changing;

function npad(num, width) {
    var n=num+''; // to string
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

var dateMethods=[
    {name: "toYmd", fun: function toYmd() {
        var r = [];
        r.push(this.getFullYear());
        r.push(npad(this.getMonth()+1,2));
        r.push(npad(this.getDate(),2));
        return r.join('-');        
    }},
    {name: "toDmy", fun: function toYmd() {
        var r = [];
        r.push(this.getDate());
        r.push(this.getMonth()+1);
        r.push(this.getFullYear());
        return r.join('/');        
    }},
	{name: "toHm", fun: function toHm() {
        var r = [];
        r.push(npad(this.getHours(),2));
        r.push(npad(this.getMinutes(),2));
        return r.join(':');
    }},
    {name: "toHms", fun: function toHms() {
        var r = [];
        r.push(npad(this.getHours(),2));
        r.push(npad(this.getMinutes(),2));
        r.push(npad(this.getSeconds(),2));
        return r.join(':');
    }},
    {name: "toYmdHms", fun: function toYmdHms() {
        return this.toYmd()+' '+this.toHms();
    }},
    {name: "toYmdHmsM", fun: function toYmdHmsM() {
        return this.toYmdHms()+'.'+npad(this.getMilliseconds(),3);
    }},
    {name: "toYmdHmsMm", fun: function toYmdHmsMm() {
        return this.toYmdHms()+'.'+npad(this.getMilliseconds(),3)+npad(this.getMicroseconds(),3);
    }},
    {name: "add", fun: function add(objectOrTimeInterval, sign){
        var ms=0;
        if(!objectOrTimeInterval.getTime){
            objectOrTimeInterval=bestGlobals.timeInterval(objectOrTimeInterval);
        }            
        ms=objectOrTimeInterval.getTime();
        return {ms:this.getTime()+ms*(sign||1)};
    }, mustConstruct:true},
    {name: "sub", fun: function sub(objectOrTimeIntervalOrDatetime){
        if(objectOrTimeIntervalOrDatetime.isRealDate || objectOrTimeIntervalOrDatetime.isRealDateTime){
            return bestGlobals.timeInterval({ms:this.getTime()-objectOrTimeIntervalOrDatetime.getTime()});
        }else{
            return this.add(objectOrTimeIntervalOrDatetime, -1);
        }
    }},
    {name: "sameValue", fun: function sameValue(other){
        return other && 
            other instanceof other.constructor && 
            this.getTime() == other.getTime();
    }}
]

function addDateMethods(dt, constructor) {
    dateMethods.forEach(function(funDef){
        if(funDef.mustConstruct){
            dt[funDef.name] = function(){
                return constructor(funDef.fun.apply(this,arguments));
            }
        }else{
            dt[funDef.name] = funDef.fun;
        }
    });
    return dt;
}

var DELTA4DATE = 1;

////////// date
bestGlobals.date = function date(dt) {
    return bestGlobals.dateForceIfNecesary(dt, true);
};

bestGlobals.dateForceIfNecesary = function dateForceIfNecesary(dt, strict) {
    if(!strict){
        if(dt==null) return null;
    }
    if(dt.ms == null && ! bestGlobals.date.isOK(dt)) { throw new Error('invalid date'); }
    var d=new Date(dt.ms != null ? dt.ms : dt.getTime());
    var delta=4*60*60*1000;
    do{
        if(new Date(d-DELTA4DATE).getDate()!=d.getDate()){
            d = addDateMethods(d, bestGlobals.dateForceIfNecesary);
            d.isRealDate = true;
            return d;
        }
        if(!strict){
            if(new Date(d.getTime()-delta).getDate()!=d.getDate()){
                d = new Date(d.getTime()-delta)
                /* istanbul ignore if */
                if(delta<=1){
                    delta=0;
                }else{
                    delta=Math.ceil(delta/2);
                }
            }else{
                d = new Date(d.getTime()+delta)
            }
        }
    }while(!strict && delta>0);
    throw new Error('invalid date "'+d.toDateString()+'"because it is not at the begining of the date');
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
    return bestGlobals.dateForceIfNecesary(new Date(y, m-1, d, 0, 0, 0, 0), false);
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

bestGlobals.date.iso = function iso(dateStr, opts) {
    if(opts && !dateStr && (opts.falsyReturnsNull || opts.nullReturnsNull && dateStr == null)){
        return null;
    }
    var parsed=bestGlobals.date.parseFormat(dateStr);
    return bestGlobals.date.ymd(parsed.y, parsed.m, parsed.d);
};

bestGlobals.date.array = function array(arr) {
    if(arr.length !== 3) { throw new Error('invalid date array'); }
    return bestGlobals.date.ymd(arr[0], arr[1], arr[2]);
};

bestGlobals.date.round = function round(timedDate){
    // var milisec = timedDate.getTime();
    // console.log('xxxxx timedDate',timedDate, timedDate.getUTCFullYear(), timedDate.getUTCMonth()+1, timedDate.getUTCDate());
    // var rawDate=new Date(milisec-milisec%(1000*60*60*24));
    // console.log('xxxxx rawDate',rawDate, rawDate.getUTCFullYear(), rawDate.getUTCMonth()+1, rawDate.getUTCDate());
    return bestGlobals.date.ymd(timedDate.getFullYear(), timedDate.getMonth()+1, timedDate.getDate());
}

bestGlobals.date.today = function today(){
    return bestGlobals.date.round(new Date());
}

/////// datetime
bestGlobals.Datetime=function Datetime(integerParts) {
    this.parts=integerParts;
    this.isRealDateTime = true;
}

bestGlobals.Datetime.reTz3 = ' ([0-9]{2}):([0-9]{2})(:([0-9]{2}))?(.([0-9]{1,6}))?';
bestGlobals.Datetime.re = new RegExp('^('+reDate+'('+bestGlobals.Datetime.reTz3+')?)$');

bestGlobals.Datetime.prototype.getFullYear     = function getFullYear()     { return this.parts.year;     };
bestGlobals.Datetime.prototype.getMonth        = function getMonth()        { return this.parts.month-1;  };
bestGlobals.Datetime.prototype.getDate         = function getDate()         { return this.parts.day;      };
bestGlobals.Datetime.prototype.getHours        = function getHours()        { return this.parts.hour;     };
bestGlobals.Datetime.prototype.getMinutes      = function getMinutes()      { return this.parts.minutes;  };
bestGlobals.Datetime.prototype.getSeconds      = function getSeconds()      { return this.parts.seconds;  };
bestGlobals.Datetime.prototype.getMilliseconds = function getMilliseconds() { return this.parts.ms;       };
bestGlobals.Datetime.prototype.getMicroseconds = function getMicroseconds() { return this.parts.micros;   };

bestGlobals.Datetime.prototype.valueOf = function getTime() { 
    return this.getTime();
}
bestGlobals.Datetime.prototype.getTime = function getTime() { 
    return new Date(
        this.parts.year   ,
        this.parts.month-1,
        this.parts.day    ,
        this.parts.hour   ,
        this.parts.minutes,
        this.parts.seconds,
        this.parts.ms     
    ).getTime();
};

bestGlobals.Datetime.prototype.toPlainString = function toPlainString(preserveHm){ 
    var str=this.toYmdHmsMm();
    var prune = function(what){
        if(str.substr(str.length-what.length)==what){
            str=str.substr(0,str.length-what.length);
            return true;
        }
        return false;
    }
    /* eslint no-unused-expressions: 0 */
    prune('000') && prune('.000') && prune(':00') && (preserveHm || prune(' 00:00'));
    return str; 
}
// bestGlobals.Datetime.prototype.toUTCString = function toUTCString(){ return this.iso; }

bestGlobals.Datetime.prototype.toSqlString = function toSqlString(){
    return this.toPlainString();
}

bestGlobals.Datetime.prototype.toPostgres = bestGlobals.Datetime.prototype.toSqlString;


bestGlobals.Datetime.prototype.toLocaleString = function toSqlString(){
    var str=this.toDmy()+' '+this.toHms();
    var prune = function(what){
        if(str.substr(str.length-what.length)==what){
            str=str.substr(0,str.length-what.length);
            return true;
        }
        return false;
    }
    /* eslint no-unused-expressions: 0 */
    prune(':00') && prune(' 00:00');
    return str;
}
/*
bestGlobals.Datetime.prototype.add = function add(dt){
    return bestGlobals.timeInterval({ms:this.getTime()+dt.getTime()});
}

bestGlobals.Datetime.prototype.sub = function sub(dt){
    return bestGlobals.timeInterval({ms:this.getTime()-dt.getTime()});
}
*/
bestGlobals.datetime={};

bestGlobals.Datetime.isValidTime = function isValidTime(h, m, s, ms, micros) {
    if(h<0 || m<0 || s<0 || ms<0 || h>23 || m>59 || s>59 || ms>999 || micros<0 || micros>999) { return false; }
    return true;
};

bestGlobals.datetime.ymdHms = function ymdHms(y, m, d, hh, mm, ss) {
    return bestGlobals.datetime.ymdHmsM(y, m, d, hh, mm, ss, 0);
};

bestGlobals.datetime.ymdHmsM = function ymdHmsM(y, m, d, hh, mm, ss, ms) {
    return bestGlobals.datetime.ymdHmsMm(y, m, d, hh, mm, ss, ms, 0)
}

bestGlobals.datetime.ymdHmsMm = function ymdHmsMm(year, month, day, hour, minutes, seconds, ms, micros){
    if(! bestGlobals.date.isValidDate(year, month, day)) { throw new Error('invalid date'); }
    if(! bestGlobals.Datetime.isValidTime(hour, minutes, seconds, ms, micros)) { throw new Error('invalid datetime'); }
    var integerParts={
        year   : year   ,
        month  : month  ,
        day    : day    ,
        hour   : hour   ,
        minutes: minutes,
        seconds: seconds,
        ms     : ms     ,
        micros : micros ,
    }
    return new bestGlobals.Datetime(integerParts);
};

bestGlobals.datetime.ms = function ms(msTicks){
    var d = new Date(msTicks);
    var integerParts={
        year   : d.getFullYear()    ,
        month  : d.getMonth()+1     ,
        day    : d.getDate()        ,
        hour   : d.getHours()       ,
        minutes: d.getMinutes()     ,
        seconds: d.getSeconds()     ,
        ms     : d.getMilliseconds(),
        micros : 0
    }
    return new bestGlobals.Datetime(integerParts);
}

bestGlobals.datetime.now = function now(){
    return bestGlobals.datetime.ms(new Date().getTime());
}

bestGlobals.datetime.iso = function iso(dateStr, opts) {
    if(opts && !dateStr && (opts.falsyReturnsNull || opts.nullReturnsNull && dateStr == null)){
        return null;
    }
    var match = bestGlobals.Datetime.re.exec(dateStr);
    if(match){
        var integerParts={};
        integerParts.year    = parseInt(match[2],10)
        integerParts.month   = parseInt(match[4],10)
        integerParts.day     = parseInt(match[7],10)
        integerParts.hour    = parseInt(match[10]||0,10)
        integerParts.minutes = parseInt(match[11]||0,10)
        integerParts.seconds = parseInt(match[13]||0,10)
        integerParts.ms      = parseInt(((match[15]||'0')+'000000').substr(0,3),10)
        var microPartWithoutMilliSecs = ((match[15]||'0')+'000000').substr(3);
        microPartWithoutMilliSecs+='000';
        microPartWithoutMilliSecs = microPartWithoutMilliSecs.substr(0,3);
        integerParts.micros  = parseInt(microPartWithoutMilliSecs,10);
    }else{
        throw new Error('invalid datetime');
    }
    return new bestGlobals.Datetime(integerParts)
};

bestGlobals.datetime.array = function array(arr) {
    if(arr.length < 3 || arr.length>8) { throw new Error('invalid datetime array'); }
    return bestGlobals.datetime.ymdHmsMm(arr[0], arr[1], arr[2], arr[3]||0, arr[4]||0, arr[5]||0, arr[6]||0, arr[7]||0);
};

addDateMethods(bestGlobals.Datetime.prototype, function(msPack){ return bestGlobals.datetime.ms(msPack.ms);});

bestGlobals.TimeInterval = function TimeInterval(timePack){
    /* istanbul ignore next */
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
    this.toHms = function toHms(omitSeconds, withDays, omitLeftCeros, omitHourCero, omitFirstLeftCero) {
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
        if(h || !omitHourCero){
            if(withDays){
                h = Math.floor(x % 24);
                x /= 24;
                var d = Math.floor(x);
                if(d){
                    prefix+=(Math.abs(d)<10 && !omitFirstLeftCero?(leftCero):'')+d+'D';
                    if(!h && !m && !s){
                        return prefix;
                    }
                    prefix+=' ';
                    omitFirstLeftCero = false;
                }
            }
            tdiff.push((h<10 && !omitFirstLeftCero?leftCero:'')+h);
            omitFirstLeftCero = false;
        }
        tdiff.push((m<10 && !omitFirstLeftCero?'0':'')+m);
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
    this.getTime = function getTime(){
        return this.timeInterval.ms;
    }
}

bestGlobals.TimeInterval.prototype.toString = function toString(){
    return this.toHms(false,true,false);
}

bestGlobals.TimeInterval.prototype.toHmsOrMs = function toHmsOrMs(){
    return this.toHms(false,false,false,true,true);
}

bestGlobals.TimeInterval.prototype.toSqlString = function toSqlString(){
    return this.timeInterval.ms+'ms';
}

bestGlobals.TimeInterval.prototype.toPostgres = bestGlobals.TimeInterval.prototype.toSqlString;

bestGlobals.timeInterval = function timeInterval(timePack) {
    return new bestGlobals.TimeInterval(timePack);
};

bestGlobals.timeInterval.iso = function iso(s, opts){
    if(opts && !s && (opts.falsyReturnsNull || opts.nullReturnsNull && s == null)){
        return null;
    }
    var m = s.match(/^(-?)[T ]?(?:(\d+)M(?:inute(?:s)?)?)?(?:(\d+)S(?:econd(?:s)?)?)?$/i);
    if(m && m[0]){
        m = [s,m[1],0,0,0,0,m[2],m[3],m[4]];
    }else{
        m = s.match(/^(-?)P?(?:(\d+)Y(?:ear(?:s)?)?)?(?:(\d+)M(?:onth(?:s)?)?)?(?:(\d+)D(?:ay(?:s)?)?)?[T ]?(?:(\d+)H(?:our(?:s)?)?)?(?:(\d+)M(?:inute(?:s)?)?)?(?:(\d+)S(?:econd(?:s)?)?)?$/i);
        if(!m || !m[0]){
            m = s.match(/^(-?)P?(?:(\d+)[/-](\d+)[/-](\d+))?[T ]?(?:(\d+):(\d+)(?::(\d+)))?$/i);
        }
    }
    if(m){
        var sign=m[1]=='-'?-1:1;
        return bestGlobals.timeInterval({
            ms     : m[8]*sign||0,
            seconds: m[7]*sign||0,
            minutes: m[6]*sign||0,
            hours  : m[5]*sign||0,
            days   : m[4]*sign||0,
        });
    }
    throw new Error('invalid timestamp '+s)
}

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
                var negative;
                if(sign && canBeNegative){
                    integer = bestGlobals.auxComplementInteger(integer);
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


bestGlobals.orderingCriteria = {
    native: x => x,
    default: bestGlobals.forOrder
}

bestGlobals.nullsOrder = 1; // 1=last -1=first;

bestGlobals.compareForOrder = function compareForOrder(sortColumns){
    var thisModule = this || bestGlobals;
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
                var columnOrderFun = sortColumns[i].orderFunc||thisModule.orderingCriteria[sortColumns[i].orderCriterion||'default'];
                var a = columnOrderFun(row1[column]);
                var b = columnOrderFun(row2[column]);
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
        },
        serialize: function serialize(date){
            return date.isRealDate ? date.toYmd() : date.toISOString();
        },
        deserialize: JSON4all.DateFunctions.deserialize,
        valueLike:true
    });
    JSON4all.addType('date', {
        construct: function construct(value){
            return bestGlobals.date.iso(value);
        },
        serialize: function serialize(o){
            return o.toYmd();
        },
        deserialize: function deserialize(plainValue){
            var ok = /^\d{4}-\d\d-\d\d$/.test(plainValue);
            var value = ok && bestGlobals.date.iso(plainValue) || null;
            return {ok, value};
        },
        valueLike:true
    });
    JSON4all.addType(bestGlobals.Datetime, {
        construct: function construct(value){
            return bestGlobals.datetime.iso(value);
        },
        deconstruct: function construct(datetime){
            return datetime.toPlainString();
        },
        serialize: function serialize(datetime){
            return datetime.toPlainString(true);
        },
        deserialize: function deserialize(plainValue){
            var ok = /^\d{4}-\d\d-\d\d \d\d:\d\d(:\d\d(.\d+)?)?$/.test(plainValue);
            var value = ok && bestGlobals.datetime.iso(plainValue) || null;
            return {ok, value};
        },
        valueLike:true
    });
};

/* istanbul ignore next */
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

/* eslint no-extend-native: 0 */
/* istanbul ignore next */
if(!Array.prototype.find){
  Object.defineProperty(Array.prototype, 'find', {
    value: arrayFind
  });
}

bestGlobals.arrayFind = arrayFind;

bestGlobals.serie = function serie(NorFirstOrObject, NifNoFirst){
    var last;
    var first;
    var step;
    var n; 
    if(NorFirstOrObject instanceof Object){
        first = 'from' in NorFirstOrObject ? NorFirstOrObject.from : 0;
        step = 'step' in NorFirstOrObject ? NorFirstOrObject.step : 1;
        if('length' in NorFirstOrObject){
            n = NorFirstOrObject.length;
            last = (n-1)*step + first;
        }else{
            last = 'to' in NorFirstOrObject ? NorFirstOrObject.to : function (){ throw new Error('serie lack of "from" or "to"') }();
            n = Math.floor((last - first)/step)+1
        }
    }else{
        n     = NifNoFirst==null ? NorFirstOrObject : NifNoFirst;
        first = NifNoFirst==null ? 0        : NorFirstOrObject  ;
        step = 1;
    }
    if(typeof step === 'number'){
        if(n<0){
            n=0;
        }
        return Array.apply(null, Array(n)).map(function (_, i) {return i*step+first;});
    }else{
        throw new Error('ERROR serie.step must be a number')
    }
};

var MAX_SAFE_INTEGER = bestGlobals.MAX_SAFE_INTEGER = 9007199254740991;

bestGlobals.sameValue = function sameValue(a,b){
    return a==b ||
      a instanceof Date && b instanceof Date && a.getTime() == b.getTime() ||
      typeof a === 'number' && (a>MAX_SAFE_INTEGER || a< -MAX_SAFE_INTEGER) && Math.abs(a/b)<1.00000000000001 && Math.abs(a/b)>0.99999999999999 ||
      a !=null && !!a.sameValue && a.sameValue(b);
}

bestGlobals.sameValues = function sameValues(a,b, sideOfBigger){
    if(a===b) return true;
    if(bestGlobals.sameValue(a,b)) return true;
    if(!(a instanceof Object) || !(b instanceof Object)) return false;
    if(sideOfBigger=="left"){
        return bestGlobals.sameValues(b,a,"right");
    }else if(sideOfBigger=="right"){
        for(var name in a){
            if(!(name in b) || !bestGlobals.sameValue(a[name],b[name])) return false;
        }
        return true;
    }else{
        return bestGlobals.sameValues(a,b,"right") && bestGlobals.sameValues(a,b,"left");
    }
}

bestGlobals.isLowerIdent = function isLowerIdent(text){
    return text && typeof text === "string" && /^[_a-z][_a-z0-9]*$/.test(text);
};

bestGlobals.deepFreeze = function deepFreeze(o){
    if(o && o instanceof Object){
        if(o instanceof Array){
            o.forEach(function(e){

            })
        }
        for(var attr in o){
            bestGlobals.deepFreeze(o[attr])
        }
        Object.freeze(o);
    }
    return o;
}

bestGlobals.escapeStringRegexp = function escapeStringRegexp(string) {
    if (typeof string !== 'string') {
        throw new TypeError('Expected a string');
    }
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string
        .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        .replace(/-/g, '\\x2d');
}

bestGlobals.simplifiedLetters={
    "\u00a0":" ",
    "Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A",
    "Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY",
    "Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B",
    "Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C",
    "Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ",
    "É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET",
    "Ḟ":"F","Ƒ":"F",
    "Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G",
    "Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H",
    "Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I",
    "Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS",
    "Ĵ":"J","Ɉ":"J",
    "Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K",
    "Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ",
    "Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M",
    "Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"Nj","Ñ":"N","Ǌ":"NJ",
    "Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU",
    "Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P",
    "Ꝙ":"Q","Ꝗ":"Q",
    "Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R",
    "Ꜿ":"C","Ǝ":"E",
    "Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S",
    "Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T",
    "Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ",
    "Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U",
    "Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY",
    "Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W",
    "Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y"
    ,"Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE",
    "ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z",
    "á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay",
    "ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o",
    "ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c",
    "ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d",
    "ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz",
    "é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et",
    "ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f",
    "ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g",
    "ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv",
    "í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is",
    "ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j",
    "ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k",
    "ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s",
    "ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m",
    "ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj",
    "ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou",
    "ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p",
    "ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q",
    "ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r",
    "ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u",
    "ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th",
    "ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz",
    "ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um",
    "ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy",
    "ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w",
    "ẍ":"x","ẋ":"x","ᶍ":"x",
    "ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y",
    "ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z",
    "ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st",
    "ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"
};
bestGlobals.simplifiedChars=bestGlobals.simplifiedLetters;

bestGlobals.simplifyText = function simplifyText(text){
    return text.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return bestGlobals.simplifiedChars[a]||a});
}
bestGlobals.hyperSimplifyText = function hyperSimplifyText(text, spaceReplacer){
    return text.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return bestGlobals.simplifiedChars[a]||' '}).trim().replace(/\s+/g,spaceReplacer==undefined?' ':spaceReplacer).toLowerCase();
}
bestGlobals.splitRawRowIntoRow = function splitRawRowIntoRow(line){
    return line.split(/(?<!(?:^|[^\\])(?:\\\\)*\\)\|/).map(item => item.trimRight().replace(
        /\\([^x]|x[\dA-Za-z]{1,2})/g,
        (_,l)=>(l=='t'?'\t':l=='r'?'\r':l=='n'?'\n':l=='s'?' ':l[0]=='x'?String.fromCodePoint(parseInt(l.substr(1),16)):l)
    ))
}


return bestGlobals;

});
