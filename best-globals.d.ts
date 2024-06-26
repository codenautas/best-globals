declare module "best-globals"{
    namespace bestGlobals{
        function coalesce<T>(...params:T[]):T;
        function coalesce<T1>(p1:T1|null, opts:bestGlobals.coalesce.throwErrorIfUndefined):T1;
        function coalesce<T1, T2>(p1:T1|null, p2:T2|null, opts:bestGlobals.coalesce.throwErrorIfUndefined):T1|T2;
        function coalesce<T1, T2, T3>(p1:T1|null, p2:T2|null, p3:T3|null, opts:bestGlobals.coalesce.throwErrorIfUndefined):T1|T2|T3;
        function coalesce<T1, T2, T3, T4>(p1:T1|null, p2:T2|null, p3:T3|null, p4:T4|null, opts:bestGlobals.coalesce.throwErrorIfUndefined):T1|T2|T3|T4;
        function coalesce<T1, T2, T3, T4, T5>(p1:T1|null, p2:T2|null, p3:T3|null, p4:T4|null, p5:T5|null, opts:bestGlobals.coalesce.throwErrorIfUndefined):T1|T2|T3|T4|T5;
        namespace coalesce{
            class throwErrorIfUndefined{
                constructor(message:string)
            }
        }
        function isPlainObject(object:Date):false
        function isPlainObject(object:RegExp):false
        function isPlainObject<T,K>(object:Map<T,K>):false
        function isPlainObject(object:Symbol):false
        function isPlainObject(object:number):false
        function isPlainObject(object:string):false
        function isPlainObject(object:boolean):false
        function isPlainObject<T extends Function>(object:T):false
        function isPlainObject<T>(object:T[]):false
        function isPlainObject<T extends {}>(object:T):true
        function isPlainObject(object:Object):object is Object
        function isPlainObject(object:any):boolean
        function deepCopy<T>(object:T):T
        class ChangingOptions{}
        function changing<T extends {}, T2 extends {}>(origin:T, changes:T2, opts?:ChangingOptions):T & T2
        namespace changing{
            function options(opts:{
                mostlyPlain?:boolean, nullIsUndefined?:boolean, deletingValue:keyof {}|null|undefined, 
            }):ChangingOptions
        }
        class RealDate extends Date implements DateMethods{
            add(ti:TimeInterval|{days:number}):RealDate
            sub(ti:TimeInterval|{days:number}):RealDate
            sub(d:RealDate):TimeInterval
            sameValue(ti:RealDate):boolean
            toDmy():string
            toYmd():string
            toHms():string
            toYmdHms():string
            toYmdHmsM():string
            toYmdHmsMm():string
        }
        type TimeOpts = {falsyReturnsNull?:true, nullReturnsNull?:true};
        namespace date{
            function ymd(year:number, month:1|2|3|4|5|6|7|8|9|10|11|12, day:number):RealDate
            function iso(IsoString:string):RealDate
            function iso(IsoString:string|null, opts:TimeOpts):RealDate|null
            function array(parts:number[]):RealDate
            function today():RealDate
        }
        interface DateMethods{
            toDmy():string
            toYmd():string
            toHms():string
            toYmdHms():string
            toYmdHmsM():string
            toYmdHmsMm():string
        }
        interface TimePack{
            ms     :number
            seconds:number
            minutes:number
            hours  :number
            days   :number
        }
        class DateTime implements DateMethods{
            toPlainString():string
            toLocaleString():string
            toPostgres():string
            add(ti:TimeInterval):DateTime
            sub(ti:TimeInterval):DateTime
            sub(dt:DateTime):TimeInterval
            sub(invervalPlainObject:{ms:number}):DateTime
            add(invervalPlainObject:{ms:number}):DateTime
            toHms():string
            toYmd():string
            toDmy():string
            toHm():string
            toYmdHms():string
            toYmdHmsM():string
            toYmdHmsMm():string
            sameValue(ti:DateTime):boolean
            isValidTime(hours:number,minutes:number,seconds:number,ms:number):boolean
            getFullYear():number
            getMonth():number
            getDate():number
            getHours():number
            getMinutes():number
            getSeconds():number
            getMilliseconds():number
            getMicroseconds():number
            valueOf():number
            getTime():number
        }
        namespace datetime{
            function now():DateTime
            function iso(IsoString:string):DateTime
            function iso(IsoString:string|null, opts:TimeOpts):DateTime|null
            function ymdHms(year:number,month:number,day:number,hours:number,minutes:number,seconds:number):DateTime
            function ymdHmsM(year:number,month:number,day:number,hours:number,minutes:number,seconds:number,ms:number):DateTime
            function ymdHmsMm(year:number,month:number,day:number,hours:number,minutes:number,seconds:number,ms:number,micros:number):DateTime
            function ms(ms:number):DateTime
            function array(parts:number[]):DateTime
        }
        class TimeInterval{
            add(ti:TimeInterval):TimeInterval
            sub(ti:TimeInterval):TimeInterval
            sameValue(ti:TimeInterval):boolean
        }
        namespace timeInterval{
            function iso(IsoString:string):TimeInterval
            function iso(IsoString:string|null, opts:TimeOpts):TimeInterval|null
        }
        function timeInterval(timePack:TimePack):TimeInterval
        function functionName(f:Function):string
        function constructorName<T extends {}>(o:T):string
        function escapeRegExp(regExpString:string):string // minimalistic
        function escapeStringRegexp(regexpString:string):string // can put inside other regexp with [ ]
        function forOrder(text:string):string
        function compareForOrder<T extends {}>(sortColumns:{column: keyof T, order?:1|-1, fun?:<U>(x:U)=>U|string}[]):(row1:T, row2:T)=>0|1|-1
        function sleep(ms:number):Promise<void>
        function serie(length:number):number[]
        function serie(first:number, length:number):number[]
        function serie(spec:{from?:number, step?:number, to:number}):number[]
        function serie(spec:{from?:number, step?:number, length:number}):number[]
        function sameValue<T>(x:T, y:T):boolean
        function sameValues<T>(x:T, y:T):boolean
        function isLowerIdent(text:string):boolean
        function deepFreeze<T extends {}>(o:T):Readonly<T>
        function simplifyText(text:string):string
        function hyperSimplifyText(text:string, spaceReplacer?:string):string
        var simplifiedLetters:Record<string,string>
        function splitRawRowIntoRow(text:string):string[]
    }
    export = bestGlobals
}
