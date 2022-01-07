"use strict";

/* eslint no-unused-expressions:0 */
var VERBOSE_DATE_TEST=false;

var expect = require('expect.js');
var sinon = require('sinon');
if(typeof process !== "undefined"){
    var assert = require('assert');
}
var bestGlobals = require('../best-globals.js');
var {compareForOrder} = bestGlobals;
var auditCopy = require('audit-copy');
var discrepances = require('discrepances');
var dig = bestGlobals.dig;
var spec = bestGlobals.spec;

console.log('DATES');
var now=new Date(Date.now());
console.log('now',now)
console.log('now.ISO',now.toISOString())
console.log('now.tzo',now.getTimezoneOffset())
console.log('now.LTS',now.toLocaleTimeString())
console.log('now.LDS',now.toLocaleDateString())
console.log('now.LS' ,now.toLocaleString())
console.log('nAR.LTS',now.toLocaleTimeString('es-AR', { timeZone: 'America/Buenos_Aires' }));
console.log('nAR.LDS',now.toLocaleDateString('es-AR', { timeZone: 'America/Buenos_Aires' }));
console.log('nAR.LS' ,now.toLocaleString    ('es-AR', { timeZone: 'America/Buenos_Aires' }));
console.log('nGB.LTS',now.toLocaleTimeString('en-GB', { timeZone: 'UTC' }));
console.log('nGB.LDS',now.toLocaleDateString('en-GB', { timeZone: 'UTC' }));
console.log('nGB.LS' ,now.toLocaleString    ('en-GB', { timeZone: 'UTC' }));
console.log('NUMBERS');
var number=1234.56;
console.log('number',number);
console.log('number',number.toLocaleString());
console.log('num.AR',number.toLocaleString('es-AR'));
console.log('num.GB',number.toLocaleString('en-GB'));

describe('best-globals', function(){
    describe('coalesce', function(){
        it('return the first value if is not null',function(){
            expect(bestGlobals.coalesce(7,8)).to.be(7);
            expect(bestGlobals.coalesce(7,8,bestGlobals.coalesce.throwError)).to.be(7);
            expect(bestGlobals.coalesce(7,8,bestGlobals.coalesce.throwErrorIfUndefined)).to.be(7);
        });
        it('return the first not null value',function(){
            expect(bestGlobals.coalesce(null,null,null,null,null,null,null,null,null,null,null,null,null,17,8)).to.be(17);
            expect(bestGlobals.coalesce(null,null,null,null,null,null,null,null,null,null,null,null,null,17,8,bestGlobals.coalesce.throwError)).to.be(17);
            expect(bestGlobals.coalesce(null,null,null,null,null,null,null,null,null,null,null,null,null,17,8,bestGlobals.coalesce.throwErrorIfUndefined)).to.be(17);
        });
        it('coalesce(null,undefined)===null',function(){
            expect(bestGlobals.coalesce(null,{}.inex)+"").to.be("null");
        });
        it('coalesce(undefined,undefined)===undefined',function(){
            expect(typeof bestGlobals.coalesce(undefined,{}.inex)).to.be("undefined");
        });
        it('throw error if all are nulls',function(){
            expect(function(){
                typeof bestGlobals.coalesce(null,null,bestGlobals.coalesce.throwError("this message"));
            }).to.throwError(/this message/);
            expect(
                bestGlobals.coalesce(null,null,bestGlobals.coalesce.throwErrorIfUndefined("m2"))+""
            ).to.eql("null");
        });
        it('throw error if all are undefined',function(){
            expect(function(x){
                bestGlobals.coalesce({}.inex,undefined,x,bestGlobals.coalesce.throwError("msgE"))
            }).to.throwError(/msgE/);
            expect(function(x){
                typeof bestGlobals.coalesce(x,undefined,{}.inex,bestGlobals.coalesce.throwErrorIfUndefined("msgU"));
            }).to.throwError(/msgU/);
        });
        var valids=[
            { element:[]         },
            { element:7          },
            { element:'pie'      },
            { element:7/0        },
            { element:new Date() },
            { element:{}         },
            { element:true       },
            { element:false      },
            { element:''         },
            { element:'0'        },
            { element:0          },
        ];
        valids.forEach(function(valid){
            it('return the valid element '+JSON.stringify(valid.element), function(){
                var result=bestGlobals.coalesce(null, {}.inexis, valid.element, 'last');
                expect(result).to.be(valid.element);
            });
        });
    });
    describe("isLowerIdent",function(){
        var valids=['valid','valid_yes','valid123__555','_valid'];
        var invalids=['Invalid','it is invalid','','1234','valid!','@invalid','is$invalid','is-invalid'];
        valids.forEach(function(value){
            it("is valid: "+value, function(){
                expect(bestGlobals.isLowerIdent(value)).to.be.ok();
            });
        });
        invalids.forEach(function(value){
            it("is invalid: "+value, function(){
                expect(bestGlobals.isLowerIdent(value)).to.not.be.ok();
            });
        })
    })
});

describe('is Plain Object', function(){
    it("recognizes {}",function(){
        expect(bestGlobals.isPlainObject({})).to.ok();
    });
    it("! recognizes Array",function(){
        expect(bestGlobals.isPlainObject([])).to.not.ok();
    });
    it("! recognizes null",function(){
        expect(bestGlobals.isPlainObject(null)).to.not.ok();
    });
});

describe('mini-tools config functions', function(){
    function Other(obj){
        this.alpha='alpha';
        this.one=1;
    }
    var changing=function(original){
        var obtained = bestGlobals.changing.apply(null, arguments);
        if(obtained === original && !(obtained instanceof Error)){
            throw new Error('changing: obtained must be a new object, not the original one');
        }
        return obtained;
    }
    it("deep 'changing' function", function(){
        var obtained = changing({
            soloOriginal:2,
            enAmbos:3,
            hijo:{
                nieto:{
                    soloOriginal:12,
                    enAmbos:13,
                },
                logicoPorFalse:true,
                logicoPorNull:true,
                logicoPorTrue:null,
                logicoUndefinedNoPisa:true,
            },
            soloObjetoOriginal:{
                original:7
            }
        },{
            enAmbos:4,
            hijo:{
                nieto:{
                    enAmbos:14,
                    soloCambio:15,
                },
                nietoFaltante:{
                    uno:16,
                    dos:17
                },
                logicoPorFalse:false,
                logicoPorNull:null,
                logicoPorTrue:true,
                logicoUndefinedNoPisa:undefined,
            },
            soloCambio:5,
        });
        expect(obtained).to.eql({
            soloOriginal:2,
            enAmbos:4,
            soloCambio:5,
            hijo:{
                nieto:{
                    soloOriginal:12,
                    enAmbos:14,
                    soloCambio:15,
                },
                nietoFaltante:{
                    uno:16,
                    dos:17
                },
                logicoPorFalse:false,
                logicoPorNull:null,
                logicoPorTrue:true,
                logicoUndefinedNoPisa:true, 
            },
            soloObjetoOriginal:{
                original:7
            },
        })
    });
    it("deep 'changing' function with null==undefined", function(){
        var obtained = changing({
            soloOriginal:2,
            enAmbos:3,
            hijo:{
                nieto:{
                    soloOriginal:12,
                    enAmbos:13,
                },
                logicoPorFalse:true,
                logicoPorNull:true,
                logicoPorTrue:null,
                logicoUndefinedNoPisa:true,
            },
            soloObjetoOriginal:{
                original:7
            }
        },{
            enAmbos:4,
            hijo:{
                nieto:{
                    enAmbos:14,
                    soloCambio:15,
                },
                nietoFaltante:{
                    uno:16,
                    dos:17
                },
                logicoPorFalse:false,
                logicoPorNull:null,
                logicoPorTrue:true,
                logicoUndefinedNoPisa:undefined,
            },
            soloCambio:5,
        },bestGlobals.changing.options({nullIsUndefined:true}));
        expect(obtained).to.eql({
            soloOriginal:2,
            enAmbos:4,
            soloCambio:5,
            hijo:{
                nieto:{
                    soloOriginal:12,
                    enAmbos:14,
                    soloCambio:15,
                },
                nietoFaltante:{
                    uno:16,
                    dos:17
                },
                logicoPorFalse:false,
                logicoPorNull:true,
                logicoPorTrue:true,
                logicoUndefinedNoPisa:true, 
            },
            soloObjetoOriginal:{
                original:7
            },
        })
    });
    it("deep 'bestGlobals.changing' function must delete", function(){
        var obtained = changing({
            normal:1,
            forDelete:2,
            stay:'data-to-delete'
        },{
            normal:3,
            forDelete:'data-to-delete'
        },bestGlobals.changing.options({deletingValue:'data-to-delete'}));
        expect(obtained).to.eql({
            normal:3,
            stay:'data-to-delete'
        })
    });
    it("deep 'bestGlobals.changing' function must delete undefineds", function(){
        var obtained = changing({
            normal:1,
            forDelete:2,
        },{
            normal:3,
            forDelete:undefined
        },bestGlobals.changing.options({deletingValue:undefined}));
        expect(obtained).to.eql({
            normal:3
        })
    });
    it("must try into non plain objects when mostlyPlain:true", function(){
        var obtained=changing(new Other(), {alpha:'a'}, bestGlobals.changing.options({mostlyPlain:true}));
        expect(bestGlobals.isPlainObject(obtained)).to.be.ok();
        expect(obtained).to.eql({alpha:'a', one:1});
    });
    it("must reject non plain original", function(){
        expect(function(){
            var obtained = changing(Other,{
                normal:3,
                forDelete:undefined
            });
        }).to.throwError(/changing with non Plain Object/);
    });
    it("must reject plain options", function(){
        expect(function(){
            var obtained = changing({
                normal:1,
                forDelete:2,
            },{
                normal:3,
                forDelete:undefined
            },{deletingValue:undefined});
        }).to.throwError(/options must be constructed with changing.options function/);
    });
    it("must reject non-object changer", function(){
        expect(function(){
            var obtained = changing({
                normal:{
                    one:1,
                    two:2
                }
            },{
                normal:3,
            });
        }).to.throwError(/changing object with non-object/);
    });
    it("non plain objects must be interpreted as values", function(){
        var obtained = changing({
            a: new Date('1/2/3'),
            b: ['a', 'b', 'c']
        },{
            a: new Date('3/2/3'),
            b: ['a', 'd']
        });
        expect(obtained).to.eql({
            a: new Date('3/2/3'),
            b: ['a', 'd']
        });
    });
    it("error objects must be interpreted as special object", function(){
        var err = new Error("this error");
        var obtained = changing(err,{code: 'A12', "z-number":12});
        expect(obtained).to.be.an(Error);
        expect(obtained).to.be(err);
        expect(obtained.message).to.eql("this error");
        expect(obtained.code).to.eql("A12");
        expect(obtained["z-number"]).to.eql(12);
    });
});

describe('dig', function(){
    var _=dig;
    if('example', function(){
        var obtained = _({name:'Argentina', lang:'es', other:77, stats:{anualCpi:50, pob:400000}} , {name:_, stats:_({pob:_}), democray:_.defualt(true)});
    })
    it('explained', function(){
        var input   ={want:'a', want2:'b', dont:'c', dont2:{}};
        var expected={want:'a', want2:'b'};
        var opts    ={want:_, want2:_.default('x'),want3:_};
        var obtained = dig('message', opts)(input);
        expect(obtained).to.eql(expected);
    })
    var fixtures=[{
        name:'simple',
        input   :{want:'a', want2:'b', dont:'c', dont2:{}},
        expected:{want:'a', want2:'b'},
        opts    :{want:_, want2:_.default('x'),want3:_},
    },{
        name:'excluding',
        input   :{want:'a', want2:'b', dont:'c', dont2:{}},
        expected:{want:'a', want2:'b'},
        fun     :_.exclude({dont:_, dont2:_}),
    },{
        name:'nested',
        input   :{want:'a', want2:{alfa:'a', beta:'b'}, dont:'c', dont2:{}},
        expected:{want:'a', want2:{alfa:'a'}},
        opts    :{want:_, want2:_({alfa:_})},
    },{
        name:'indexed_object',
        input   :{country:{
            ar:{name:'Argentina', lang:'es', other:77},
            de:{name:'Alemania' , lang:'de', other:99}
        }},
        expected:{country:{
            ar:{name:'Argentina', lang:'es'},
            de:{name:'Alemania' , lang:'de'}
        }},
        opts    :{country:_.idx({name:_, lang:_})},
    },{
        name:'array',
        input   :{list:[{want:'a', want2:'b', dont:'c', dont2:{}},{want:1, dont:2},{want2:3,x:5}]},
        expected:{list:[{want:'a', want2:'b'},{want:1},{want2:3}]},
        opts    :{list:_.array({want:_, want2:_})},
    },{
        name:'inside array',
        input   :[{want:'a', want2:'b', dont:'c', dont2:{}},{want:1, dont:2},{want2:3,x:5}],
        expected:[{want:'a', want2:'b'},{want:1},{want2:3}],
        opts    :_.array({want:_, want2:_}),
        fun     :_.array({want:_, want2:_}),
    },{
        name:'array with default',
        input   :{list:[{want:'a', want2:'b', dont:'c', dont2:{}},{want:1, dont:2},{want2:3,x:5}]},
        expected:{list:[{want:'a', want2:'b'},{want:1},{want:'def', want2:3}]},
        opts    :{list:_.array({want:_.default('def'), want2:_})},
    },{
        name:'force integer',
        input   :{name:'Jesús', age:'33'},
        expected:{name:'Jesús', age:33},
        opts    :{name:_, age:Number},
    }];
    fixtures.forEach(function(fixture){
        if(fixture.opts){
            it('opts '+fixture.name, function(){
                var obtained = dig(fixture.opts)(fixture.input);
                expect(obtained).to.eql(fixture.expected);
            })
        }
        it('fun '+fixture.name, function(){
            var fun = fixture.fun || dig(fixture.opts);
            var obtained = fun(fixture.input);
            expect(obtained).to.eql(fixture.expected);
        })
    })
    it('rejects non object', function(){
        expect(function(){
            _({y:{z:_}})({x:3});
        }).to.throwException(/must be a dig object/);
    })
});


describe('spec', function(){
    var _=spec;
    if('example', function(){
        var obtained = _({name:'Argentina', lang:'es', other:77, stats:{anualCpi:50, pob:400000}} , {name:_, stats:_({pob:_}), democray:_.defualt(true)});
    })
    var fixtures=[{
        name:'simple',
        input   :{want:'a', want2:'b', dont:'c', dont2:{}},
        expected:{want:'a', want2:'b'},
        opts    :{want:_("is what it wants"), want2:_.default("this too",'x'),want3:_},
    },{
        name:'excluding',
        input   :{want:'a', want2:'b', dont:'c', dont2:{}},
        expected:{want:'a', want2:'b'},
        fun     :_.exclude("all the record excluding audit fields", {dont:_, dont2:_}),
    },{
        name:'nested',
        input   :{want:'a', want2:{alfa:'a', beta:'b'}, dont:'c', dont2:{}},
        expected:{want:'a', want2:{alfa:'a'}},
        opts    :{want:_, want2:_("the alfa record", {alfa:_})},
    },{
        name:'indexed_object',
        input   :{country:{
            ar:{name:'Argentina', lang:'es', other:77},
            de:{name:'Alemania' , lang:'de', other:99}
        }},
        expected:{country:{
            ar:{name:'Argentina', lang:'es'},
            de:{name:'Alemania' , lang:'de'}
        }},
        opts    :{country:_.idx("an index object", {name:_, lang:_})},
        fun     :_({country:_.idx({name:_, lang:_})}),
    },{
        name:'array',
        input   :{list:[{want:'a', want2:'b', dont:'c', dont2:{}},{want:1, dont:2},{want2:3,x:5}]},
        expected:{list:[{want:'a', want2:'b'},{want:1},{want2:3}]},
        opts    :{list:_.array({want:_, want2:_})},
    },{
        name:'inside array',
        input   :[{want:'a', want2:'b', dont:'c', dont2:{}},{want:1, dont:2},{want2:3,x:5}],
        expected:[{want:'a', want2:'b'},{want:1},{want2:3}],
        opts    :_.array("pretty array", {want:_, want2:_}),
        fun     :_.array({want:_, want2:_}),
    },{
        name:'nested array and indexed',
        input   :[[{one:true, two:true, special:false}],[{alpha:false, beta:false},{a:false,b:false}]],
        expected:[[{one:true, two:true}],[{alpha:false, beta:false},{a:false,b:false}]],
        opts    :_.array("matrix", _.array("list of dictionaries", _.exclude({special:true}))),
        fun     :_.array("matrix", _.array("list of dictionaries", _.exclude({special:true}))),
    },{
        name:'array with default',
        input   :{list:[{want:'a', want2:'b', dont:'c', dont2:{}},{want:1, dont:2},{want2:3,x:5}]},
        expected:{list:[{want:'a', want2:'b'},{want:1},{want:'def', want2:3}]},
        opts    :{list:_.array({want:_.default('def'), want2:_})},
    },{
        name:'force integer',
        input   :{name:'Jesús', age:'33'},
        expected:{name:'Jesús', age:33},
        opts    :{name:_, age:Number},
    }];
    fixtures.forEach(function(fixture){
        if(fixture.opts){
            it('opts '+fixture.name, function(){
                var obtained = spec(fixture.opts)(fixture.input);
                expect(obtained).to.eql(fixture.expected);
            })
        }
        it('fun '+fixture.name, function(){
            var fun = fixture.fun || dig(fixture.opts);
            var obtained = fun(fixture.input);
            expect(obtained).to.eql(fixture.expected);
        })
    })
    it('rejects non object', function(){
        expect(function(){
            _({y:{z:_}})({x:3});
        }).to.throwException(/must be a dig object/);
    })
});

describe("date", function(){
    var indep = new Date(1916,7-1,9);
    var first = new Date(1910,5-1,25);
    var nateConstantino = new Date(272,2-1,27);
    var date = bestGlobals.date;
    var datetime = bestGlobals.datetime;
    var timeInterval = bestGlobals.timeInterval;
    function control(fechaConstruida, fechaControl, isDateTime){
        expect(isDateTime ? fechaConstruida.isRealDateTime : fechaConstruida.isRealDate).to.eql(true);
        if(!isDateTime){
            expect(fechaConstruida.toISOString()).to.eql(fechaControl.toISOString());
            expect(fechaConstruida.toUTCString()).to.eql(fechaControl.toUTCString());
            expect(fechaConstruida).to.eql(date(fechaControl));
        }
        expect(fechaConstruida.getTime()).to.eql(fechaControl.getTime());
        expect(fechaConstruida - fechaControl).to.eql(0);
    }
    it("create date from string", function(){
        var d1 = date.iso("1916-07-09");
        control(d1, indep);
    });
    it("date.iso(null,{nullReturnsNull:true})", function(){
        var d1 = date.iso(null, {nullReturnsNull:true});
        expect(d1 === null).to.be.ok();
    });
    it("date.iso('',{falsyReturnsNull:true})", function(){
        var d1 = date.iso('', {falsyReturnsNull:true});
        expect(d1 === null).to.be.ok();
    });
    it("date.iso('',{nullReturnsNull:true})", function(){
        expect(function(){
            var d1 = date.iso('', {nullReturnsNull:true});
        }).to.throwError(/invalid date/ );
    });
    /*
    it("create date from ms", function(){
        var d1 = date.ms(2*24*60*60*1000);
        control(d1, date.iso("1970-01-03"));
    });
    */  
    it("create date from string without trainling zeros", function(){
        var d1 = date.iso("272-2-27");
        control(d1, nateConstantino);
    });
    it("create date from array", function(){
        var d1 = date.array([1916,7,9]);
        control(d1, indep);
    });
    it("create date from integers", function(){
        var d1 = date.ymd(1916,7,9);
        control(d1, indep);
    });
    it("create date from string and ignore timezone in input", function(){
        var d1 = date.iso("1916-07-09 00:00:00-11:00");
        control(d1, indep);
        d1 = date.iso("1916-07-09T00:00:00Z");
        control(d1, indep);
        d1 = date.iso("1916-07-09T00:00:00.000Z");
        control(d1, indep);
    });
    function toPlainString(date){
        var shiftedDate = new Date(date.getTime()-date.getTimezoneOffset()*60*1000)
        return shiftedDate.toISOString().replace(/[T]/g,' ').replace(/[Z]/g,'');
    }
    it("create datetime from string", function(){
        var d1 = datetime.iso("1926-07-09 10:32:00.000");
        expect(d1.isRealDateTime).to.be.ok();
        expect(d1.toPlainString()).to.eql("1926-07-09 10:32");
        expect(d1.toDmy()).to.eql("9/7/1926");
        expect(d1.toLocaleString()).to.eql("9/7/1926 10:32");
    });
    /*--*/ it("create datetime from string with 6 digits", function(){
        var d1 = datetime.iso("1926-07-09 10:32:00.000001");
        expect(d1.isRealDateTime).to.be.ok();
        expect(d1.toPlainString()).to.eql(toPlainString(new Date(1926,7-1,9,10,32))+'001');
    });
    /*--*/ it("create datetime from string with 3 digits", function(){
        var d1 = datetime.iso("1926-07-09 10:32:00.123");
        expect(d1.isRealDateTime).to.be.ok();
        expect(d1.toPlainString()).to.eql(toPlainString(new Date(1926,7-1,9,10,32,0,123)));
    });
    /*--*/ it("create datetime from string with 1 digits decimals", function(){
        var d1 = datetime.iso("1926-07-09 10:32:00.2");
        expect(d1.isRealDateTime).to.be.ok();
        expect(d1.toPlainString()).to.eql(toPlainString(new Date(1926,7-1,9,10,32,0,200)));
    });
    it("date.datetime(null,{nullReturnsNull:true})", function(){
        var d1 = datetime.iso(null, {nullReturnsNull:true});
        expect(d1 === null).to.be.ok();
    });
    it("date.datetime('',{falsyReturnsNull:true})", function(){
        var d1 = datetime.iso('', {falsyReturnsNull:true});
        expect(d1 === null).to.be.ok();
    });
    it("date.datetime('',{nullReturnsNull:true})", function(){
        expect(function(){
            var d1 = datetime.iso('', {nullReturnsNull:true});
        }).to.throwError(/invalid date/ );
    });
    it("create datetime from integer", function(){
        var d1 = datetime.ymdHms(1926,7,9,10,32,10);
        expect(d1.toPlainString()).to.eql("1926-07-09 10:32:10");
    });
    it("create datetime from array", function(){
        var d1 = datetime.array([1916,7,9,0,0,0,0]);
        control(d1, indep, true);
    });
    it("create timeInterval from integer and format it", function(){
        expect(timeInterval({ms:new Date(1926,7,9,10,32,0)-new Date(1926,7,9,10,32,11)}).toHms()).eql('-00:00:11');
        expect(timeInterval({ms:new Date(1926,7,9,11,0,0)-new Date(1926,7,7,11,0,0)  }).toHms()).eql('48:00:00');
        expect(timeInterval({ms:new Date(1926,7,9,11,0,0)-new Date(1926,7,7,11,0,0)  }).toPlainString()).eql('2D');
        expect(timeInterval({ms:new Date(1926,7,9,12,0,0)-new Date(1926,7,7,11,0,0)  }).toPlainString()).eql('2D 1:00:00');
        expect(timeInterval({ms:new Date(1926,7,7,12,0,0)-new Date(1926,7,7,11,0,0)  }).toPlainString()).eql('1:00:00');
        expect(timeInterval({ms:new Date(1926,7,8,11,0,0)-new Date(1926,7,7,12,0,0)  }).toHms()).eql('23:00:00');
        expect(timeInterval({ms:new Date(1926,7,7,11,0,0)-new Date(1926,7,9,11,0,0)  }).toHms()).eql('-48:00:00');
        expect(timeInterval({ms:new Date(1926,7,7,11,0,0)-new Date(1926,7,9,10,32,11)}).toHms()).eql('-47:32:11');
        expect(timeInterval({ms:new Date(1926,7,7,11,0,0)-new Date(1926,7,9,10,32,11)}).toHm()).eql('-47:32');
        expect(timeInterval({ms:new Date(1926,7,7,11,0,0)-new Date(1926,7,8,10,32,0)}).toHmsOrMs()).eql('-23:32:00');
        expect(timeInterval({ms:new Date(1926,7,7,11,0,0)-new Date(1926,7,7,11,2,13)}).toHmsOrMs()).eql('-2:13');
        expect(timeInterval({ms:new Date(1926,7,7,11,0,0)-new Date(1926,7,7,11,0,3)}).toHmsOrMs()).eql('-0:03');
        expect(timeInterval({ms:new Date(1926,7,7,10,1,3)-new Date(1926,7,7,0,0,0)}).toHmsOrMs()).eql('10:01:03');
        expect(timeInterval({ms:new Date(1926,7,7,1,1,3)-new Date(1926,7,7,0,0,0)}).toHmsOrMs()).eql('1:01:03');
    });
    it("create timeInterval from string and format it", function(){
        expect(timeInterval.iso("48H").toHms()).eql('48:00:00');
        expect(timeInterval.iso("-11s").toHms()).eql('-00:00:11');
        expect(timeInterval.iso("2Days").toPlainString()).eql('2D');
        expect(timeInterval.iso("P2DT1H").toPlainString()).eql('2D 1:00:00');
        expect(timeInterval.iso("1Hour").toPlainString()).eql('1:00:00');
        expect(timeInterval.iso("23:00:00").toHms()).eql('23:00:00');
        expect(timeInterval.iso("-48h").toHms()).eql('-48:00:00');
        expect(timeInterval.iso("-47:32:11").toHms()).eql('-47:32:11');
        expect(timeInterval.iso("-T47h32m").toHm()).eql('-47:32');
        expect(timeInterval.iso("32m").toHm()).eql('00:32');
        //expect(timeInterval(new Date(1916,7,7,11, 0,0)-new Date(1916,7,9,10,32,11)).toHms()).eql('48:27:49');
    });
    it("timeInterval.datetime(null,{nullReturnsNull:true})", function(){
        var d1 = timeInterval.iso(null, {nullReturnsNull:true});
        expect(d1 === null).to.be.ok();
    });
    it("timeInterval.datetime('',{falsyReturnsNull:true})", function(){
        var d1 = timeInterval.iso('', {falsyReturnsNull:true});
        expect(d1 === null).to.be.ok();
    });
    it("timeInterval.datetime('',{nullReturnsNull:true})", function(){
        /*
        expect(function(){
            var d1 = timeInterval.iso('', {nullReturnsNull:true});
            console.log('****************** ACA',d1, typeof d1)
        }).to.throwError(/invalid date/ );
        */
    });
    it("timeInterval.datetime('19x18j')", function(){
        expect(function(){
            var d1 = timeInterval.iso('19x18j', {nullReturnsNull:true});
        }).to.throwError(/invalid timestamp/);
    });
    it("accept any interval", function(){
        discrepances.showAndThrow(
            timeInterval({ms:1, seconds:2, minutes:3, hours:4, days:5}),
            timeInterval({ms:1+1000*(2+60*(3+60*(4+24*5)))})
        );
        /*
        expect(timeInterval({ms:1, seconds:2, minutes:3, hours:4, days:5}))
        .to.eql(timeInterval({ms:1+1000*(2+60*(3+60*(4+24*5)))}));
        */
    });
    it("get allhours from interval", function(){
        expect(timeInterval({hours:44, minutes:30}).getAllHours()).to.eql(44.5);
        expect(timeInterval({hours:-44, minutes:0}).getAllHours()).to.eql(-44);
    });
    it("no sameValue if not the same class", function(){
        expect(timeInterval({hours:44, minutes:30}).sameValue({hours:44, minutes:30})).to.not.ok();
    });
    it("no sameValue if not the same ms", function(){
        expect(timeInterval({hours:44, minutes:30}).sameValue(timeInterval({hours:44, minutes:31}))).to.not.ok();
    });
    it("sameValue because the same ms", function(){
        expect(timeInterval({hours:44, minutes:30}).sameValue(timeInterval({minutes:30+44*60}))).to.ok();
    });
    it("interval toPostgres", function(){
        expect(timeInterval({hours:44, minutes:30}).toPostgres()).to.eql((44*60+30)*60000+'ms');
    });
    it("timeInterval toHms without zeros",function(){
        //var ti = timeInterval("1h 2m 3s");
        var ti=timeInterval({hours:1, minutes:2, seconds:3})
        expect(ti.toHms(false,false,true)).to.eql('1:02:03')
    });
    it("timeInterval toHms with date",function(){
        //var ti = timeInterval("1h 2m 3s");
        var ti=timeInterval({hours:26, minutes:2, seconds:3});
        expect(ti.toHms(false,false,true)).to.eql('26:02:03');
        expect(ti.toHms(false,true,true)).to.eql('1D 2:02:03');
        ti=timeInterval({days:11, hours:2, minutes:2, seconds:3});
        expect(ti.toHms(false,false,false)).to.eql('266:02:03');
        expect(ti.toHms(false,true ,false)).to.eql('11D 02:02:03');
    });
    it("indexing with dates", function(){
        var obj={};
        var d1=date.iso('2017-07-16');
        var d2=date.iso('2017-07-17');
        obj[d1]=42;
        obj[d2]=43;
        expect(obj[d1]).to.eql(42);
        expect(obj[d2]).to.eql(43);
    });
    it("indexing with timeInterval", function(){
        var obj={};
        var d1=bestGlobals.timeInterval({hours:3});
        var d2=bestGlobals.timeInterval({minutes:3, seconds:4});
        var d3=bestGlobals.timeInterval({days:5, minutes:3, seconds:4});
        obj[d1]=42;
        obj[d2]=43;
        obj[d3]=44;
        expect(obj[d1]).to.eql(42);
        expect(obj[d2]).to.eql(43);
        expect(obj[d3]).to.eql(44);
    });
    it("substact intervals", function(){
        discrepances.showAndThrow(
            timeInterval({ms:65000}).sub(timeInterval({seconds:60})),
            timeInterval({seconds:5})
        );
        discrepances.showAndThrow(
            timeInterval({ms:65000}).sub({seconds:60}),
            timeInterval({seconds:5})
        );
        discrepances.showAndThrow(
            timeInterval({ms:65000}).add({seconds:60}),
            timeInterval({seconds:125})
        );
    });
    [ ["1997-12"], [1997,12], [1997,0,1], [[1997,0,1]], [(new Date(1916,7-1,9)).getTime()]].forEach(function(invalidParams){
        it("rejects invalid date: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.iso.apply(date,invalidParams);
            }).to.throwError(/invalid date/);
        });
    });
    it("date should parse the format of a string", function() {
       var parse = date.parseFormat;
       var invalidErr = /invalid date/;
       expect(parse("2016-12-02")).to.eql({y:2016, m:12, d:2});
       expect(parse("2016-1-02")).to.eql({y:2016, m:1, d:2});
       expect(parse("2016/1/02")).to.eql({y:2016, m:1, d:2});
       expect(parse).withArgs("2016-12/02").to.throwError(invalidErr);
       expect(parse).withArgs("2016/12-02").to.throwError(invalidErr);
       expect(parse).withArgs("2016_12_02").to.throwError(invalidErr);
       expect(parse("2016-2-30")).to.eql({y:2016, m:2, d:30}); // right format, wrong date
    });
    it("datetime should parse the format of a string", function() {
       var parse = datetime.parseFormat;
       var invalidErr = /invalid datetime/;
       expect(datetime.iso("2016-12-02")).to.eql(datetime.ymdHmsM(2016,12,2,0,0,0,0));
       expect(datetime.iso("2016-12-02 01:02:03")).to.eql(datetime.ymdHmsM(2016,12,2,1,2,3,0));
       expect(datetime.iso("2016-12-02 01:02:03").toPostgres()).to.eql("2016-12-02 01:02:03");
       expect(datetime.iso("2016-12-02 01:02:03").sameValue(datetime.iso("2016-12-02 01:02:03"))).to.be.ok();
       expect(datetime.iso).withArgs("2016-12/02").to.throwError(invalidErr);
    });
    it("should validate 1970-1-2", function() { expect(bestGlobals.date.isValidDate(1970,1,2)).to.be.ok(); });
    it("should validate 1969-12-31", function() { expect(bestGlobals.date.isValidDate(1969,12,31)).to.be.ok(); });
    it("should validate 1970-1-1", function() { expect(bestGlobals.date.isValidDate(1970,1,1)).to.be.ok(); });
    it("should validate y/d/m", function() {
        var isValidDate = bestGlobals.date.isValidDate;
        expect(isValidDate(1900,1,1)).to.be.ok();
        expect(isValidDate(2016,2,28)).to.be.ok();
        expect(isValidDate(1969,12,31)).to.be.ok();
        expect(isValidDate(2016,2,29)).to.be.ok();
        expect(isValidDate(2015,2,29)).to.not.be.ok();
        expect(isValidDate(15,2,29)).to.not.be.ok();
        expect(isValidDate(1940,13,29)).to.not.be.ok();
        expect(isValidDate(1940,11,31)).to.not.be.ok();
        expect(isValidDate(1940,4,31)).to.not.be.ok();
        expect(isValidDate(1940,3,33)).to.not.be.ok();
        expect(isValidDate(-1940,3,33)).to.not.be.ok();
        expect(isValidDate(194,5,31)).to.be.ok();
        expect(isValidDate(1940,3,33)).to.not.be.ok();
    });
    it("should validate h/m/s/ms", function() {
        var isValidTime = bestGlobals.Datetime.isValidTime;
        expect(isValidTime(0,0,0,0)).to.be.ok();
        expect(isValidTime(23,59,59,999)).to.be.ok();
        expect(isValidTime(-1,59,59,999)).to.not.be.ok();
        expect(isValidTime(0,59,59,1999)).to.not.be.ok();
        expect(isValidTime(0,-59,59,1999)).to.not.be.ok();
        expect(isValidTime(0,59,-59,1999)).to.not.be.ok();
        expect(isValidTime(0,59,59,-1)).to.not.be.ok();
    });
    it("should validate a date object", function() {
       var isOK = bestGlobals.date.isOK;
       expect(isOK(new Date())).to.be.ok();
       expect(isOK(new Date("wrong"))).to.not.be.ok();
       expect(isOK(new Date('23/25/2014'))).to.not.be.ok();
       expect(isOK(2016)).to.not.be.ok();
       //expect(isOK(new Date('foo-bar 2014'))).to.not.be.ok();
    });
     [ [7], [3,4], [3,4,2010,4], [1992,4,4,1], ["1992-12-12"], [null] ].forEach(function(invalidParams){
        it("date.array rejects invalid input: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.array(invalidParams);
            }).to.throwError(/invalid date array/);
        });
    });
    [ [7], [3,4], [3,4,2010,4], [1992,4,4,-1], ["1992-12-12"], [1992,4,-1], [null] ].forEach(function(invalidParams){
        it("datetime.array rejects invalid input: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                datetime.array(invalidParams);
            }).to.throwError(/invalid date(time array)?/);
        });
    });
    [ {y:-1, m:7, d:4} , {y:1000, m:13, d:4}, {y:2000, m:7, d:34}  ].forEach(function(invalidParams){
        it("date.ymd rejects invalid input: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.ymd(invalidParams.y, invalidParams.m, invalidParams.d);
            }).to.throwError(/invalid date/);
        });
    });
    [
      {y:-2000, m:1, d:2, hh:0,  mm:0, ss:0, ms:0},
      {y:2000,  m:1, d:2, hh:-1, mm:0, ss:0, ms:0}
    ].forEach(function(invalidParams){
        it("datetime.ymdHmsM rejects invalid input: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                datetime.ymdHmsM(invalidParams.y, invalidParams.m, invalidParams.d,
                                 invalidParams.y, invalidParams.m, invalidParams.d, invalidParams.x);
            }).to.throwError(/invalid date/);
        });
    });
    describe("to string", function(){
        [ {} , 'un string', 232.3, [], 1000  ].forEach(function(invalidParams){
            it("date() rejects "+JSON.stringify(invalidParams), function(){
                expect(function(){ date(invalidParams); }).to.throwError(/invalid date/);
                /* expect(function(){ datetime(invalidParams); }).to.throwError(/invalid date/);*/ 
            });
        });
        it("rejects time in date", function(){
            expect(function(){ date(new Date(1999,11,12,10,20)); }).to.throwError(/invalid date.*begining/);
        });
        [
            {i:new Date(2015,  1, 10),            toYmd:'2015-02-10', toHms:'00:00:00', toYmdHms:'2015-02-10 00:00:00', toYmdHmsM:'2015-02-10 00:00:00.000'},
            {i:new Date(1935, 11,  1),            toYmd:'1935-12-01', toHms:'00:00:00', toYmdHms:'1935-12-01 00:00:00'},
            {i:new Date(1935, 11, 31),            toYmd:'1935-12-31', toHms:'00:00:00', toDmy:'31/12/1935'},
            {i:new Date(2035,  0,  1),            toYmd:'2035-01-01', toHms:'00:00:00', toDmy:'1/1/2035'},
            {i:new Date(2035,  0,  1,  3,  3),    toYmd:'2035-01-01', toHms:'03:03:00', toDmy:'1/1/2035', hasHour:true},
            {i:new Date(1935, 11,  1, 10, 11, 12),                    toHms:'10:11:12', toHm:'10:11', hasHour:true},
            {i:new Date(1935, 11,  1,  0,  1, 2 ),                    toHms:'00:01:02', hasHour:true},
            {i:new Date(1969,  1,  2, 14, 2, 30),                     toYmdHms:'1969-02-02 14:02:30', hasHour:true},
            {i:new Date(1969,  1,  2, 14, 2),                         toYmdHms:'1969-02-02 14:02:00', hasHour:true},
            {i:new Date(2015, 11,  1,  0,  0,   0, 100),              toYmdHmsM:'2015-12-01 00:00:00.100', hasHour:true},
            {i:new Date(1969,  1,  2, 14,  2,  30),                   toYmdHmsM:'1969-02-02 14:02:30.000', hasHour:true},
            {i:new Date(1969,  1,  2, 11, 22,  33, 444),              toYmdHmsM:'1969-02-02 11:22:33.444', hasHour:true},
            {i:new Date(10511,1,3),              toYmd:'10511-02-03'},
            {i:new Date(511,1,3),                toYmd:'511-02-03'},
        ].forEach(function(param){
            "toDmy,toYmd,toHms,toYmdHms,toYmdHmsM,toHm".split(',').forEach(function(functionName){
                if(param[functionName]) {
                    it(functionName+"("+param.i.toLocaleString()+") => ["+param[functionName]+"]", function(){
                        var auditCopyParam = auditCopy.inObject(param);
                        if(! param.hasHour){
                            expect(date(param.i)[functionName]()).to.eql(param[functionName]);
                        }
                        expect(datetime.ms(param.i.getTime())[functionName]()).to.eql(param[functionName]);
                        if(typeof process !== "undefined"){
                            // var equalComparation = assert.deepStrictEqual || assert.deepEqual;
                            // equalComparation(auditCopy.inObject(param),auditCopyParam);
                        }
                        discrepances.showAndThrow(auditCopy.inObject(param),auditCopyParam)
                    });
                }
            });
        });
    });
    describe("date from Date", function(){
        var fixtures=[
            {e:[2017,11,20, 0,0,0], res:'2017-12-20'},
            {e:[2017,11,21, 1,1,1], res:'2017-12-21'},
            {e:[2017,11,22, 20,33,33], res:'2017-12-22'},
            {e:[2017,11,23, 23,33,33], res:'2017-12-23'},
        ];
        fixtures.forEach(function(fixture){
            it("fixture "+JSON.stringify(fixture), function(){
                var e=fixture.e;
                var d = new Date(e[0],e[1],e[2],e[3],e[4],e[5]);
                expect(bestGlobals.date.round(d).toYmd()).to.eql(fixture.res);
            });
        });
    });
    it("date sub day by day", function(){
        var HS24=24*60*60*1000;
        var d=bestGlobals.date.today();
        var n=100000;
        while(n--){
            // try{
                var newd = d.sub({days:1});
                if(newd.getTime()-d.getTime()!=-HS24){
                    if(VERBOSE_DATE_TEST){
                        console.log('***** Date dif',newd.toISOString(),d.toISOString(),(newd.getTime()-d.getTime())/60/60/1000,'hours');
                    }
                    if(Math.abs(newd.getTime()-d.getTime() + HS24) > 2*60*60*1000){
                        throw new Error('Imposible date interval');
                    }
                }
                d=newd;
            // }catch(err){
            //     console.log("****************** ERROR in date ",d)
            //     throw err;
            //     console.log(err);
            //     throw new Error(err.message+' for '+d);
            // }
        }
        expect(true).to.be.ok();
    });
    it("date add day by day", function(){
        var HS24=24*60*60*1000;
        var d=bestGlobals.date.ymd(1899,12,31);
        var n=100000;
        while(n--){
            try{
                var newd = d.add({days:1});
                if(newd.getTime()-d.getTime()!=HS24){
                    if(VERBOSE_DATE_TEST){
                        console.log('***** Date dif',newd.toISOString(),d.toISOString(),(newd.getTime()-d.getTime())/60/60/1000,'hours');
                    }
                    if(Math.abs(newd.getTime()-d.getTime() - HS24) > 2*60*60*1000){
                        throw new Error('Imposible date interval');
                    }
                }
                d=newd;
            }catch(err){
                console.log("****************** ERROR in date ",d)
                throw err;
                throw new Error(err.message+' for '+d);
            }
        }
        expect(true).to.be.ok();
    });
    describe("dateForceIfNecesary", function(){
        it("ajust one ms", function(){
            var d=bestGlobals.dateForceIfNecesary({ms:bestGlobals.date.ymd(2019,3,22).getTime()-1});
            expect(d.isRealDate).to.be.ok();
        })
        it("accpet nulls", function(){
            var d=bestGlobals.dateForceIfNecesary(null);
            expect(d===null).to.be.ok();
        })
    })
    describe("date add", function(){
        var fixtures=[
            {d:'2017-12-20', days: 0   , res:'2017-12-20'},
            {d:'2017-12-21', days: 1   , res:'2017-12-22'},
            {d:'2017-12-22', days:30   , res:'2018-01-21'},
            {d:'1899-12-31', days:42151, res:'2015-05-28'},
        ];
        fixtures.forEach(function(fixture){
            it("fixture "+JSON.stringify(fixture), function(){
                var d = bestGlobals.date.iso(fixture.d);
                var obtained = d.add({days:fixture.days});
                expect(obtained).to.eql(bestGlobals.date.iso(fixture.res));
                obtained = d.add(bestGlobals.timeInterval({days:fixture.days}));
                expect(obtained).to.eql(bestGlobals.date.iso(fixture.res));
            });
        });
    });
    it("creates today", function(){
        var today = bestGlobals.date.today();
        var rawToday = new Date();
        expect([
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
        ]).to.eql([
            rawToday.getFullYear(),
            rawToday.getMonth(),
            rawToday.getDate(),
        ]);
    });
    it("creates now", function(){
        var now;
        var rawNow;
        var trys=4; // ocasionally rawNow is one millisec before now()
        do{
            now = bestGlobals.datetime.now();
            rawNow = new Date();
        }while(trys-- && now.getTime() != rawNow.getTime());
        expect([
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
        ]).to.eql([
            rawNow.getFullYear(),
            rawNow.getMonth(),
            rawNow.getDate(),
            rawNow.getHours(),
            rawNow.getMinutes(),
            rawNow.getSeconds(),
            rawNow.getMilliseconds()
        ]);
    });
    describe("timezone problems",function(){
        [
            {iso:"1968-10-05", ymd:[1968,10,5]},
            {iso:"1968-10-06", ymd:[1968,10,6]},
            {iso:"1968-10-07", ymd:[1968,10,7]},
        ].forEach(function(fixture){
            function controlDate(d){
                expect(d.toYmd()).to.eql(fixture.iso);
                expect(d.getDate()).to.eql(fixture.ymd[2]);
                expect(d.getMonth()+1).to.eql(fixture.ymd[1]);
                expect(d.getFullYear()).to.eql(fixture.ymd[0]);
            }
            it("from iso: "+fixture.iso,function(){
                var d=date.iso(fixture.iso)
                controlDate(d);
            });
            it("from ymd: "+fixture.ymd,function(){
                var d=date.ymd(fixture.ymd[0],fixture.ymd[1],fixture.ymd[2])
                controlDate(d);
            });
        });
    })
    describe("datetime substracts", function(){
        it("get an interval of 5s",function(){
            var a=bestGlobals.datetime.ymdHms(2018,12,24,23, 0,10);
            var b=bestGlobals.datetime.ymdHms(2018,12,24,22,59,50);
            var i=a.sub(b);
            expect(i.sameValue(timeInterval({ms:20000}))).to.be.ok();
            expect(i.toHms()).to.eql('00:00:20');
        })
        it("get an datetime 6s later",function(){
            var a=bestGlobals.datetime.ymdHms(2018,12,24,23, 0,10);
            var b=a.add({ms:6000});
            expect(b.sameValue(bestGlobals.datetime.ymdHms(2018,12,24,23, 0,16))).to.be.ok();
            expect(b.toHms()).to.eql('23:00:16');
        })
        it("get an datetime 5s behind",function(){
            var a=bestGlobals.datetime.ymdHms(2018,12,24,23, 0,10);
            var b=a.sub({ms:5000});
            expect(b.sameValue(bestGlobals.datetime.ymdHms(2018,12,24,23, 0,5))).to.be.ok();
            expect(b.toHms()).to.eql('23:00:05');
        })
    })
});

function globalFun(){
}

describe('functionName', function(){
    function localFun(){}
    var vf = function varFun(){};
    var anonymous = function(){};
    var forceAno = function(){};
    Object.defineProperty(forceAno, 'name', {get: function(){ return null; }});
    [
        {val:globalFun, name:'globalFun'},
        {val:localFun , name:'localFun' },
        {val:vf       , name:'varFun'   },
        {val:anonymous, name:'anonymous'},
        {val:forceAno , name:'anonymous'},
    ].forEach(function(input) {
        it(JSON.stringify(input.val)+" should be "+JSON.stringify(input.name) ,function(){
            expect(bestGlobals.functionName(input.val)).to.eql(input.name);
        }); 
    });
    it("rejects non functions", function(){
        expect(function(){
            bestGlobals.functionName({});
        }).to.throwError(/non function/);
    });
});

describe('constructorName', function(){
    function MiObj() {}
    function Tainted() {  delete this.constructor.name; } // coverage
    [
        {val:{}, name:'Object'},
        {val:new Date, name:'Date'},
        {val:[], name:'Array'},
        {val:new Array(), name:'Array'},
        {val:new RegExp('bla'), name:'RegExp'},
        {val:undefined, name:undefined},
        {val:null, name:undefined},
        {val:function MiObj() {}, name:'Function'},
        {val:new MiObj(), name:'MiObj'},
        {val:new Tainted(), name:'Tainted'},
    ].forEach(function(input) {
        it(JSON.stringify(input.val)+" should be "+JSON.stringify(input.name) ,function(){
            expect(bestGlobals.constructorName(input.val)).to.eql(input.name);
        }); 
    });
});

describe('escapeRegExp', function(){
    [
        {exp:'a.b' , no:'acb' , escaped:'a\\.b'     },
        {exp:'[ab]', no:'ab'  , escaped:'\\[ab\\]'  },
        {exp:'ab*c', no:'abbc', escaped:'ab\\*c'    },
        {exp:'ab+c', no:'abbc', escaped:'ab\\+c'    },
        {exp:'[^a]', no:'bcde', escaped:'\\[\\^a\\]'},
        {exp:'a|b' , no:'a'   , escaped:'a\\|b'     },
        {exp:'(a)' , no:'a'   , escaped:'\\(a\\)'   },
        {exp:'a{2}', no:'aa'  , escaped:'a\\{2\\}'  },
        {exp:'[a-c]',no:'b'   , escaped:'\\[a-c\\]' },
    ].forEach(function(fixture) {
        it(JSON.stringify(fixture),function(){
            var escaped = bestGlobals.escapeRegExp(fixture.exp);
            var r = RegExp(escaped);
            expect(r.test(fixture.exp)).to.be.ok();
            expect(r.test(fixture.no)).to.not.be.ok();
            expect(RegExp(fixture.exp).test(fixture.no)).to.be.ok();
            if('escaped' in fixture){
                expect(escaped).to.be(fixture.escaped);
            }
            expect(new RegExp(bestGlobals.escapeStringRegexp(fixture.exp).replace(/\\x2d/,'-'))).to.eql(r);
        }); 
    });
});

describe('ordering', function(){
    it("calculates integer complement", function(){
        expect(bestGlobals.auxComplementInteger('12')).to.eql('87');
        expect(bestGlobals.auxComplementInteger('1002')).to.eql('8997');
        expect(bestGlobals.auxComplementInteger('0')).to.eql('9');
    });
    [
        {a:'ABC'        , b:'abd'       , label:'ignore case                 '},
        {a:'abc'        , b:'ABD'       , label:'ignore case                 '},
        {a:'x9b'        , b:'x11a'      , label:'natural number ordering     '},
        {a:'x9.51b'     , b:'x9.9a'     , label:'decimal numbers             '},
        {a:'x9.51b'     , b:'x009.9a'   , label:'trailing ceros              '},
        {a:'x009.51b'   , b:'x19.9a'    , label:'trailing ceros              '},
        {a:'The Zeta'   , b:'There'     , label:'word by word                '},
        {a:'The~Zeta'   , b:'There'     , label:'word by word, any separator '},
        {a:'The, 1'     , b:'The 2'     , label:'any secuence of separators  '},
        {a:'The 1'      , b:'The, 2'    , label:'any secuence of separators  '},
        {a:'ábcéno'     , b:'Abceña'    , label:'spanish                     '},
        {a:'abceño'     , b:'abcepa'    , label:'spanish                     '},
        {a:'{A}'        , b:'{AB}'      , label:'shortest                    '},
        {a:' A'         , b:'B'         , label:'ignore trailing spaces      '},
        {a:'A'          , b:' B'        , label:'ignore trailing spaces      '},
        {a:'a b'        , b:'A!B'       , label:'at the end signs defines    '},
        {a:'aBc'        , b:'abC'       , label:'uppers first                '},
        {a:'aBc'        , b:'abC.'      , label:'trailing signs last         '},
        {a:'aBc'        , b:' abC'      , label:'trailing left signs last    '},
        {a:' aBc'       , b:'abC '      , label:'trailing left signs last    '},
        {a:'7'          , b:'a'         , label:'numbers first               '},
        {a:7            , b:'11'        , label:'numbers                     '},
        {a:'-7'         , b:'6'         , label:'text of negative numbers    '},
        {a:-7           , b:6           , label:'negative numbers            '},
        {a:-7           , b:1           , label:'negative numbers 2          '},
        {a:'0.2134'     , b:1           , label:'small decimals              '},
        {a:'0.2134'     , b:'0.4134'    , label:'small decimals 2            '},
        {a:'-0.4134'    , b:'0.21349'   , label:'small decimals neg          '},
        {a:'a-1'        , b:'a-2'       , label:'code with number            '},
        {a:'999-123-456', b:'999-321-456',label:'telephones                  '},
        {a:'11'         , b:'11-2'      , label:'subcodes 1                  '},
        {a:'11-2'       , b:'11-2-1'    , label:'subcodes 2                  '},
        {a:'11-2-3'     , b:'11-2-3-1'  , label:'subcodes 3                  '},
        {a:'1 2 3'      , b:'1-2*4'     , label:'mix spaces and separators   '},
        {a:'1-2*3'      , b:'1 2 4'     , label:'mix spaces and separators   '},
        {a:'1 2 3'      , b:'1 2 3 4'   , label:'many numbers                '},
        {a:'06-0001'    , b:'06-0001-060028',label:'subcodes 0               '},
        {a:'other'      , b:null        , label:'nulls last                  '},
        {a:new Date(2012,9,15,8), b:new Date() , label:'dates                '},
    ].forEach(function(fixture) {
        it(JSON.stringify(fixture),function(){
            var a1 = bestGlobals.forOrder(fixture.a);
            var b1 = bestGlobals.forOrder(fixture.b);
            if(!(a1<b1)){
                console.log('a1', a1);
                console.log('b1', b1);
            }
            expect(a1<b1).to.be.ok();
            expect(a1>b1).to.not.be.ok();
            expect(a1==b1).to.not.be.ok();
            expect(a1!=null).to.be.ok();
            expect(typeof a1=="string").to.be.ok();
        }); 
    });
});

describe('comparing', function(){
    it('sorts tuples',function(){
        var data=[
            [11,  11, 11],
            [11,null, 11],
            [null,11, 11],
            [ 9,  11, 11],
            [11,   9, 11],
            [11,  11,  9],
        ];
        var expected=[
            [11,   9, 11],
            [11,  11,  9],
            [11,  11, 11],
            [ 9,  11, 11],
            [null,11, 11],
            [11,null, 11],
        ]
        var criteria=[
            {column:1, func:bestGlobals.forOrder.Native},
            {column:2, },
            {column:0, order:-1},
        ]
        data.sort(compareForOrder(criteria));
        expect(data).to.eql(expected);
    })
    var columnsOrder=[
        {column:'b', order: 1},
        {column:'c', order: 1, func:bestGlobals.forOrder.Native},
        {column:'d', order:-1},
    ];
    var compareFunction=bestGlobals.compareForOrder(columnsOrder);
    [
        {a:{a:1, b:2,   c:3,   d:4}, b:{a:4, b:4,   c:4,   d:4}, expected:-1, label:'fist field <               '},
        {a:{a:1, b:5,   c:3,   d:4}, b:{a:4, b:4,   c:4,   d:4}, expected: 1, label:'fist field >               '},
        {a:{a:1, b:'ñ', c:3,   d:4}, b:{a:4, b:'z', c:4,   d:4}, expected:-1, label:'fist field <Alpha          '},
        {a:{a:1, b:4,   c:3,   d:4}, b:{a:4, b:4,   c:4,   d:4}, expected:-1, label:'= <                        '},
        {a:{a:1, b:4,   c:'z', d:4}, b:{a:4, b:4,   c:'ñ', d:4}, expected:-1, label:'= <Native                  '},
        {a:{a:1, b:4,   c:4,   d:5}, b:{a:4, b:4,   c:4,   d:4}, expected:-1, label:'= = > desc                 '},
        {a:{a:1, b:4,   c:4,   d:4}, b:{a:4, b:4,   c:4,   d:4}, expected: 0, label:'= = =                      '},
        {a:{a:1, b:4,c:null,d:null}, b:{a:4, b:4,c:null,   d:4}, expected:-1, label:'= = null first             '},
    ].forEach(function(fixture) {
        it(JSON.stringify(fixture),function(){
            bestGlobals.nullsOrder = -1;
            var result = compareFunction(fixture.a, fixture.b);
            expect(result).to.eql(fixture.expected);
        }); 
    });
});

describe("Promises", function(){
    var d=200 + (typeof navigator !== "undefined" && navigator.userAgent.match(/Firefox\/[0-9.]+/)?1000:0);
    it("sleeps and pass the returned value", function(){
        var now=new Date();
        return Promise.resolve(42).then(bestGlobals.sleep(200)).then(function(value){
            expect(value).to.eql(42);
            expect(new Date().getTime()-now.getTime()).not.to.be.lessThan(200);
            expect(new Date().getTime()-now.getTime()).to.be.lessThan(200+d);
        })
    });
    it("sleeps directly", function(){
        this.timeout(5000)
        var FUTURE_DELTA=1; // https://travis-ci.org/codenautas/best-globals/jobs/401541694 tardó un milisegundo menos
        var now=new Date();
        return bestGlobals.sleep(400).then(function(){
            expect(new Date().getTime()-now.getTime()).not.to.be.lessThan(400-FUTURE_DELTA);
            expect(new Date().getTime()-now.getTime()).to.be.lessThan(400+d);
            now=new Date();
            return bestGlobals.sleep(100);
        }).catch(function(err){
            console.log(err);
            console.log(err.stack);
            throw new Error("Must not be here");
        }).then(function(){
            expect(new Date().getTime()-now.getTime()).not.to.be.lessThan(100-FUTURE_DELTA);
            expect(new Date().getTime()-now.getTime()).to.be.lessThan(100+d);
        })
    });
    it("sleep catchs errors version 1", function(){
        var now=new Date();
        return bestGlobals.sleep(100).then(function(){
            expect(new Date().getTime()-now.getTime()).not.to.be.lessThan(100);
            expect(new Date().getTime()-now.getTime()).to.be.lessThan(100+d);
            throw new Error("force");
        }).then(function(){
            return bestGlobals.sleep(200);
        }).then(function(){
            throw new Error("Must not be here 2");
        }).catch(function(err){
            expect(err.message).to.eql("force");
            expect(new Date().getTime()-now.getTime()).not.to.be.lessThan(100);
            expect(new Date().getTime()-now.getTime()).to.be.lessThan(100+d);
        })
    });
    it("sleep catchs errors version 2", function(){
        var now=new Date();
        var epsilon = 1;
        return bestGlobals.sleep(100).then(function(){
            expect(new Date().getTime()-now.getTime()+epsilon).not.to.be.lessThan(100);
            expect(new Date().getTime()-now.getTime()-epsilon).to.be.lessThan(100+d);
            throw new Error("force");
        }).then(function(){
            return bestGlobals.sleep(200);
        }).catch(function(err){
            expect(err.message).to.eql("force");
            expect(new Date().getTime()-now.getTime()+epsilon).not.to.be.lessThan(100);
            expect(new Date().getTime()-now.getTime()-epsilon).to.be.lessThan(100+d);
            throw new Error("force2");
        }).then(function(){
            throw new Error("Must not be here 2");
        }).catch(function(err){
            expect(err.message).to.eql("force2");
        })
    });
});

describe("Array.find polyfill", function(){
    it("founds one", function(){
        var searched={};
        var toSearch=[{num:3},{num:1},{num:5}];
        var theThis={ f: function(a,i){
            a[i]=true;
        }};
        var founded = bestGlobals.arrayFind.call(toSearch,function(element, index, array){
            this.f(searched,index);
            if(element.num===index){
                return true;
            }else{
                array[index]='x';
            }
        },theThis);
        expect(founded === toSearch[1]).to.be.ok();
        expect(searched).to.eql({0:true, 1:true});
        expect(toSearch).to.eql(['x',{num:1},{num:5}]);
    });
    it("not found", function(){
        var toSearch=[{num:3},{num:1},{num:5}];
        var founded = bestGlobals.arrayFind.call(toSearch,function(element){
            return element.num==2;
        });
        expect(founded === undefined).to.be.ok();
    });
});

describe("deep-copy", function(){
    [
        {object:{a:'a'}                       , modif:function(x){ x.a='A';            }},
        {object:{a:{b:{c:['d', {e:{f:'g'}}]}}}, modif:function(x){ x.a.b.c[1].e.f='h'; }},
    ].forEach(function(fixture){
        var object=fixture.object;
        it("for "+JSON.stringify(object), function(){
            var original=JSON.stringify(object);
            var result=bestGlobals.deepCopy(object);
            expect(JSON.stringify(result)).to.eql(original);
            fixture.modif(result);
            expect(JSON.stringify(object)).to.eql(original);
        });
    });
});

describe("deep-copy when changing with {}", function(){
    [
        function(object){ return bestGlobals.changing({},object);},
        function(object){ return bestGlobals.changing(object,{});},
    ].forEach(function(f, i){
        it("step "+i+": "+f, function(){
            var object={a:{b:{c:['d', {e:{f:'g'}}]}}};
            var original=JSON.stringify(object);
            var result=f(object);
            expect(JSON.stringify(result)).to.eql(original);
            result.a.b.c[1].e.f='h';
            expect(JSON.stringify(object)).to.eql(original);
        });
    });
});


describe("serie", function(){
    [
        {a:1, b:0, res:[]},
        {a:1, b:1, res:[1]},
        {a:1, b:4, res:[1,2,3,4]},
        {a:0     , res:[]},
        {a:1     , res:[0]},
        {a:0, b:2, res:[0,1]},
        {a:5     , res:[0,1,2,3,4]},
        {a:{from:1,length:0}, res:[]},
        {a:{from:1,length:1}, res:[1]},
        {a:{from:1,length:4}, res:[1,2,3,4]},
        {a:{length:0       }, res:[]},
        {a:{length:1       }, res:[0]},
        {a:{from:0,length:2}, res:[0,1]},
        {a:{length:5       }, res:[0,1,2,3,4]},
        {a:{from:1,to:0}, res:[]},
        {a:{from:1,to:1}, res:[1]},
        {a:{from:1,to:4}, res:[1,2,3,4]},
        {a:{to:-1      }, res:[]},
        {a:{to:0       }, res:[0]},
        {a:{from:0,to:1}, res:[0,1]},
        {a:{to:4       }, res:[0,1,2,3,4]},
        {a:{from:1,to:4,step:2}, res:[1,3]},
        {a:{to:4       ,step:2}, res:[0,2,4]},
    ].forEach(function(fixture){
        it("for "+JSON.stringify(fixture), function(){
            var obtained = bestGlobals.serie(fixture.a, fixture.b);
            expect(obtained).to.eql(fixture.res);
        });
    });
    it("throws lack from or to", function(){
        expect(function(){
            return bestGlobals.serie({step:1});
        }).to.throwError(/lack/);
    })
    it("n must be>0", function(){
        var list = bestGlobals.serie({from:5, to: 1});
        expect(list).to.eql([])
    })
    it("throws on no number step", function(){
        expect(function(){
            return bestGlobals.serie({from:-1, to: 1, step:'x'});
        }).to.throwError(/must be a number/);
    })
});


describe("sameValue", function(){
    [
        {a:1, b:0  , res:false},
        {a:1, b:1  , res:true},
        {a:new Date(2001,2,3), b:new Date(2001,2,3), res:true},
        {a:bestGlobals.timeInterval({minutes:2}), b:bestGlobals.timeInterval({minutes:3}), res:false},
        {a:bestGlobals.timeInterval({minutes:2}), b:bestGlobals.timeInterval({seconds:120}), res:true},
        {a:bestGlobals.MAX_SAFE_INTEGER*1000, b:bestGlobals.MAX_SAFE_INTEGER*1000+0.0001, res:true},
        {a:bestGlobals.MAX_SAFE_INTEGER*1000, b:bestGlobals.MAX_SAFE_INTEGER*100, res:false},
        {a:-bestGlobals.MAX_SAFE_INTEGER*1000, b:-bestGlobals.MAX_SAFE_INTEGER*1001, res:false},
    ].forEach(function(fixture){
        it("for "+JSON.stringify(fixture), function(){
            var obtained = bestGlobals.sameValue(fixture.a, fixture.b);
            expect(obtained).to.eql(fixture.res);
        });
    });
});

describe("sameValues", function(){
    [
        {a:{a:1,x:1}, b:{a:1,x:0}  , res:false},
        {a:{a:1,x:1}, b:{x:1,a:1}  , res:true},
        {a:{a:1,b:2,x:new Date(2001,2,3)}, b:{b:2,a:1,x:new Date(2001,2,3)}, res:true},
        {a:{x:bestGlobals.timeInterval({minutes:2})}, b:{x:bestGlobals.timeInterval({minutes:3})}, res:false},
        {a:{a:1,x:bestGlobals.timeInterval({minutes:2})}, b:{a:1,x:bestGlobals.timeInterval({seconds:120})}, res:true},
        {a:{a:1,x:bestGlobals.MAX_SAFE_INTEGER*1000}, b:{a:1,x:bestGlobals.MAX_SAFE_INTEGER*1000+0.0001}, res:true},
    ].forEach(function(fixture){
        it("for "+JSON.stringify(fixture), function(){
            var obtained = bestGlobals.sameValues(fixture.a, fixture.b);
            expect(obtained).to.eql(fixture.res);
        });
    });
    it("sameValues if the same instance", function(){
        var a={x:3};
        var b=a;
        expect(bestGlobals.sameValues(a,b)).to.ok();
    });
});

describe("deepFreeze", function(){
    var deepFreeze = bestGlobals.deepFreeze;
    it("returns the same object", function(){
        var original = {a:1, b:['hi', 'world'], c:new Date()};
        var same = deepFreeze(original);
        expect(original == same).to.be.ok();
        expect(original.b == same.b).to.be.ok();
    })
    it("freeze the root object", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        expect(function(){
            original.a=2;
        }).to.throwError(/read.only/);
    })
    it("freeze the array deepth 1", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        expect(function(){
            original.b[0]='Hello';
        }).to.throwError(/read.only/);
    })
    it("freeze the object deepth 2", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        expect(function(){
            original.b[2].sign='?';
        }).to.throwError(/read.only/);
    })
    it("freeze the object for addings", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        expect(function(){
            original.b[2].space=' ';
        }).to.throwError(/not extensible/);
    })
    it("freeze the array for addings", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        expect(function(){
            original.b.push('\n');
        }).to.throwError(/not extensible|non-writable/);
    })
    it("freeze the object for deleting", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        expect(function(){
            delete original.a;
        }).to.throwError(/Cannot delete|non-configurable/);
    })
    it("can freeze a freezed object", function(){
        var original = {a:1, b:['hi', 'world', {sign:'!'}], c:new Date()};
        var same = deepFreeze(original);
        var other = deepFreeze(same);
    })
})

describe("escapeStringRegexp", function(){
    var fixtures =[
        ['\\ ^ $ * + ? . ( ) | { } [ ]', '\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]', /\\ \^ \$ \* \+ \? \. \( \) \| \{ \} \[ \]/],
        ['foo - bar', 'foo \\x2d bar', /foo \x2d bar/],
        ['-', '\\x2d', /\x2d/]
    ];
    fixtures.forEach(f=>{
        it('fixture: '+f[0], function(){
            var escaped = bestGlobals.escapeStringRegexp(f[0]);
            expect(escaped).to.eql(f[1]);
            expect(new RegExp(escaped)).to.eql(f[2]);
            expect(new RegExp(bestGlobals.escapeRegExp(f[0]).replace(/-/,'\\x2d'))).to.eql(f[2]);
        })
    })
    it('rejects non strings', function(){
        expect(function(){
            bestGlobals.escapeStringRegexp(7);
        }).to.throwError(/Expect.+a string/)
    })
})

describe("simplifyText", function(){
    var fixtures =[
        ['¡Ésta!', '¡Esta!','esta'],
        ['Citroën', 'Citroen', 'citroen'],
        [' año - 2019 ', ' ano - 2019 ','ano 2019','ano2019'],
    ]
    fixtures.forEach(f=>{
        it('fixture: '+f[0], function(){
            expect(bestGlobals.simplifyText(f[0])).to.eql(f[1]);
            if(f[2]) expect(bestGlobals.hyperSimplifyText(f[0])).to.eql(f[2]);
            if(f[3]) expect(bestGlobals.hyperSimplifyText(f[0],'')).to.eql(f[3]);
        })
    })
})