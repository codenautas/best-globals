declare module "best-globals"{
    namespace bestGlobals{
        function coalesce<T, TT extends (T|bestGlobals.coalesce.throwErrorIfUndefined)>(...params:(TT)[]):T;
        namespace coalesce{
            class throwErrorIfUndefined{
                constructor(message:string)
            }
        }
        function isPlainObject(other:any):boolean
        function deepCopy<T>(object:T):T
        function changing<T extends {}, T2 extends {}>(origin:T, changes:T2, opts:{
            mostlyPlain:boolean, nullIsUndefined:boolean, deletingValue:keyof {}, 
        }):T & T2
        class RealDate extends Date{
            add(ti:TimeInterval):RealDate
            sub(ti:TimeInterval):RealDate
            sub(d:RealDate):TimeInterval
            sameValue(ti:RealDate):boolean
        }
        type TimeOpts = {falsyReturnsNull?:true, nullReturnsNull?:true};
        namespace date{
            function ymd(year:number, month:1|2|3|4|5|6|7|8|9|10|11|12, day:number):RealDate
            function iso(IsoString:string):RealDate
            function iso(IsoString:string|null, opts:TimeOpts):RealDate|null
            function array(parts:number[]):RealDate
            function today():RealDate
        }
        class DateTime{
            toPlainString():string
            toPostgres():string
            add(ti:TimeInterval):DateTime
            sub(ti:TimeInterval):DateTime
            sub(dt:DateTime):TimeInterval
            sameValue(ti:DateTime):boolean
        }
        namespace datetime{
            function now():DateTime
            function iso(IsoString:string):DateTime
            function iso(IsoString:string|null, opts:TimeOpts):DateTime|null
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
        function functionName(f:Function):string
        function constructorName<T extends {}>(o:T):string
        function escapeRegExp(regExpString:string):RegExp
        function forOrder(text:string):string
        function compareForOrder<T extends {}>(sortColumns:{column: keyof T, order?:1|-1, fun:<U>(x:U)=>U|string}[]):(row1:T, row2:T)=>0|1|-1
        function sleep(ms:number):Promise<void>
        function serie(length:number):number[]
        function serie(first:number, length:number):number[]
        function serie(spec:{from?:number, step?:number, to:number}):number[]
        function serie(spec:{from?:number, step?:number, length:number}):number[]
        function sameValues(x:any, y:any):boolean
        function isLowerIdent(text:string):boolean
    }
    export = bestGlobals
}
