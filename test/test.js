"use strict";

var expect = require('expect.js');
var sinon = require('sinon');
var assert = require('assert');
var bestGlobals = require('..');
var auditCopy = require('audit-copy');

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
    it("deep 'bestGlobals.changing' function must delete", function(){
        var obtained = changing({
            normal:1,
            forDelete:2,
        },{
            normal:3,
            forDelete:'data-to-delete'
        },bestGlobals.changing.options({deletingValue:'data-to-delete'}));
        expect(obtained).to.eql({
            normal:3
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

describe("date", function(){
    var indep = new Date(1916,7-1,9);
    var first = new Date(1910,5-1,25);
    var nateConstantino = new Date(272,2-1,27);
    var date = bestGlobals.date;
    var datetime = bestGlobals.datetime;
    var timeInterval = bestGlobals.timeInterval;
    function control(fechaConstruida, fechaControl, isDateTime){
        expect(isDateTime ? fechaConstruida.isRealDateTime : fechaConstruida.isRealDate).to.eql(true);
        expect(fechaConstruida.toISOString()).to.eql(fechaControl.toISOString());
        expect(fechaConstruida.toUTCString()).to.eql(fechaControl.toUTCString());
        expect(fechaConstruida.getTime()).to.eql(fechaControl.getTime());
        expect(fechaConstruida - fechaControl).to.eql(0);
        expect(fechaConstruida).to.eql(date(fechaControl));
    }
    it("create date from string", function(){
        var d1 = date.iso("1916-07-09");
        control(d1, indep);
    });
    it("create date from string without trainling zeros", function(){
        var d1 = date.iso("272-2-27");
        control(d1, nateConstantino);
    });
    it("create date from array", function(){
        var d1 = date.array([1916,7,09]);
        control(d1, indep);
    });
    it("create date from integers", function(){
        var d1 = date.ymd(1916,7,09);
        control(d1, indep);
    });
    it("create date from string and ignore timezone in input", function(){
        var d1 = date.iso("1916-07-09 00:00:00-11:00");
        control(d1, indep);
        var d1 = date.iso("1916-07-09T00:00:00Z");
        control(d1, indep);
        var d1 = date.iso("1916-07-09T00:00:00.000Z");
        control(d1, indep);
    });
    it("create datetime from string", function(){
        var d1 = datetime.iso("1916-07-09 10:32:00.000");
        expect(d1.isRealDateTime).to.be.ok();
        expect(d1.toISOString()).to.eql(new Date(1916,7-1,9,10,32).toISOString());
    });
    it("create datetime from integer", function(){
        var d1 = datetime.ymdHms(1916,7,9,10,32,0);
        // expect(d1.toISOString()).to.eql(new Date(1916,7-1,9,10,32));
        expect(d1).to.eql(new Date(1916,7-1,9,10,32));
    });
    it("create datetime from array", function(){
        var d1 = datetime.array([1916,7,09,0,0,0,0]);
        control(d1, indep, true);
    });
    it("create timeInterval from integer and format it", function(){
        expect(timeInterval(new Date(1916,7,9,10,32,0)-new Date(1916,7,09,10,32,11)).toHms()).eql('-00:00:11');
        expect(timeInterval(new Date(1916,7,9,11,0,0)-new Date(1916,7,7,11,0,0)).toHms()).eql('48:00:00');
        expect(timeInterval(new Date(1916,7,8,11,0,0)-new Date(1916,7,7,12,0,0)).toHms()).eql('23:00:00');
        expect(timeInterval(new Date(1916,7,7,11,0,0)-new Date(1916,7,9,11,0,0)).toHms()).eql('-48:00:00');
        expect(timeInterval(new Date(1916,7,7,11,0,0)-new Date(1916,7,9,10,32,11)).toHms()).eql('-47:32:11');
        //expect(timeInterval(new Date(1916,7,7,11, 0,0)-new Date(1916,7,09,10,32,11)).toHms()).eql('48:27:49');
    });
    [ ["1997-12"], [1997,12], [1997,0,1], [[1997,0,1]], [(new Date(1916,7-1,9)).getTime()]].forEach(function(invalidParams){
        it("rejects invalid date: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.iso.apply(date,invalidParams);
            }).to.throwError(/invalid date/);
        });
    });
    it("add setDateValue function", function(){
        var d1 = date.iso("1916-07-09");
        var d2 = date.iso("1910-05-25");
        var d3 = date.iso("1913-01-31");
        d3.setDateValue(d2);
        control(d3, first);
    });
    if(typeof Promise == 'function'){
        it("add setDateValue function Promise version", function(done){
            var d1 = date.iso("1916-07-09");
            var d2 = date.iso("1910-05-25");
            var d3 = date.iso("1913-01-31");
            Promise.resolve(d2)
            .then(d3.setDateValue)
            .then(function(){
                control(d3, first);
            })
            .then(done, done);
        });
    };
    [ [7], ["1992-12-12"], /*[new Date(1999,12,31,23,0,0)],*/ [new Date("abcd")], [new Date('23/25/2014')], [null] ].forEach(function(invalidParams){
        it("setDateValue rejects invalid date: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                var d1 = date.iso("2016-04-03");
                d1.setDateValue.apply(d1, invalidParams);
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
       expect(parse("2016-12-02")).to.eql({y:2016, m:12, d:2, hh:0, mm:0, ss:0, ms:0});
       expect(parse("2016-12-02 01:02:03")).to.eql({y:2016, m:12, d:2, hh:1, mm:2, ss:3, ms:0});
       expect(parse).withArgs("2016-12/02").to.throwError(invalidErr);
    });
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
        var isValidTime = bestGlobals.datetime.isValidTime;
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
                expect(function(){ datetime(invalidParams); }).to.throwError(/invalid date/);
            });
        });
        it("rejects time in date", function(){
            expect(function(){ date(new Date(1999,11,12,10,20)); }).to.throwError(/invalid date.*because it has time/);
        });
        [
            {i:new Date(2015,  1, 10),            toYmd:'2015-02-10', toHms:'00:00:00', toYmdHms:'2015-02-10 00:00:00', toYmdHmsM:'2015-02-10 00:00:00.000'},
            {i:new Date(1935, 11,  1),            toYmd:'1935-12-01', toHms:'00:00:00', toYmdHms:'1935-12-01 00:00:00'},
            {i:new Date(1935, 11, 31),            toYmd:'1935-12-31', toHms:'00:00:00'},
            {i:new Date(2035,  0,  1),            toYmd:'2035-01-01', toHms:'00:00:00'},
            {i:new Date(2035,  0,  1,  3,  3),    toYmd:'2035-01-01', toHms:'03:03:00', hasHour:true},
            {i:new Date(1935, 11,  1, 10, 11, 12),                    toHms:'10:11:12', hasHour:true},
            {i:new Date(1935, 11,  1,  0,  1, 2 ),                    toHms:'00:01:02', hasHour:true},
            {i:new Date(1969,  1,  2, 14, 2, 30),                     toYmdHms:'1969-02-02 14:02:30', hasHour:true},
            {i:new Date(1969,  1,  2, 14, 2),                         toYmdHms:'1969-02-02 14:02:00', hasHour:true},
            {i:new Date(2015, 11,  1,  0,  0,   0, 100),              toYmdHmsM:'2015-12-01 00:00:00.100', hasHour:true},
            {i:new Date(1969,  1,  2, 14,  2,  30),                   toYmdHmsM:'1969-02-02 14:02:30.000', hasHour:true},
            {i:new Date(1969,  1,  2, 11, 22,  33, 444),              toYmdHmsM:'1969-02-02 11:22:33.444', hasHour:true},
            {i:new Date(10511,1,3),              toYmd:'10511-02-03'},
            {i:new Date(511,1,3),                toYmd:'511-02-03'},
        ].forEach(function(param){
            "toYmd,toHms,toYmdHms,toYmdHmsM".split(',').forEach(function(functionName){
                if(param[functionName]) {
                    it(functionName+"("+param.i.toLocaleString()+") => ["+param[functionName]+"]", function(){
                        var auditCopyParam = auditCopy.inObject(param);
                        if(! param.hasHour){
                            expect(date(param.i)[functionName]()).to.eql(param[functionName]);
                        }
                        expect(datetime(param.i)[functionName]()).to.eql(param[functionName]);
                        var equalComparation = assert.deepStrictEqual || assert.deepEqual;
                        equalComparation(auditCopy.inObject(param),auditCopyParam);
                    });
                }
            });
        });
    });
});

function globalFun(){
}

describe('functionName', function(){
    function localFun(){}
    var vf = function varFun(){};
    var anonymous = function(){};
    var forceAno = function(){};
    if(process.versions.node>='4'){
        // for coverage: emulate previous version anonymous functions:
        Object.defineProperty(forceAno, 'name', {get: function(){ return null; }});
    }
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
    function MiObj() {};
    function Tainted() {  if(! process.version.match(/^(v0.12)/)) { delete this.constructor.name; } }; // coverage
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
        }); 
    });
});

describe('ordering', function(){
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
        {a:'other'      , b:null        , label:'nulls last                  '},
        {a:new Date(2012,9,15,8), b:new Date() , label:'dates                '},
    ].forEach(function(fixture) {
        it(JSON.stringify(fixture),function(){
            var a1 = bestGlobals.forOrder(fixture.a);
            var b1 = bestGlobals.forOrder(fixture.b);
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
        data.sort(bestGlobals.compareForOrder(criteria));
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
    it("sleeps and pass the returned value", function(){
        var now=new Date();
        return Promise.resolve(42).then(bestGlobals.sleep(200)).then(function(value){
            expect(value).to.eql(42);
            expect(new Date().getTime()-now.getTime() >=200).to.be.ok();
            expect(new Date().getTime()-now.getTime() < 250).to.be.ok();
        })
    });
    it("sleeps directly", function(){
        var now=new Date();
        return bestGlobals.sleep(400).then(function(){
            expect(new Date().getTime()-now.getTime() >=400).to.be.ok();
            expect(new Date().getTime()-now.getTime() < 450).to.be.ok();
        })
    });
});