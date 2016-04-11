"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var bestGlobals = require('..');

describe('best-globals', function(){
    describe('coalesce', function(){
        it('return the first value if is not null',function(){
            expect(bestGlobals.coalesce(7,8)).to.be(7);
            expect(bestGlobals.coalesce(7,8,bestGlobals.coalesce.throwError)).to.be(7);
        });
        it('return the first not null value',function(){
            expect(bestGlobals.coalesce(null,null,null,null,null,null,null,null,null,null,null,null,null,17,8)).to.be(17);
            expect(bestGlobals.coalesce(null,null,null,null,null,null,null,null,null,null,null,null,null,17,8,bestGlobals.coalesce.throwError)).to.be(17);
        });
        it('return the last value if all are nulls',function(){
            expect(typeof bestGlobals.coalesce(null,{}.inex)).to.be("undefined");
        });
        it('throw error if all are nulls',function(){
            expect(function(){
                typeof bestGlobals.coalesce(null,{}.inex,bestGlobals.coalesce.throwError("this message"));
            }).to.throwError(/this message/);
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
            it('return the valid element '||valid, function(){
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
    it("deep 'changing' function", function(){
        var obtained = bestGlobals.changing({
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
        var obtained = bestGlobals.changing({
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
        var obtained = bestGlobals.changing({
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
    it("must reject plain options", function(){
        expect(function(){
            var obtained = bestGlobals.changing({
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
            var obtained = bestGlobals.changing({
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
        var obtained = bestGlobals.changing({
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
});

describe("date", function(){
    var indep = new Date(1916,7-1,9);
    var first = new Date(1910,5-1,25);
    var nateConstantino = new Date(272,2-1,27);
    var date = bestGlobals.date;
    function control(fechaConstruida, fechaControl){
        expect(fechaConstruida.isRealDate).to.eql(true);
        expect(fechaConstruida.toISOString()).to.eql(fechaControl.toISOString());
        expect(fechaConstruida.toUTCString()).to.eql(fechaControl.toUTCString());
        expect(fechaConstruida.getTime()).to.eql(fechaControl.getTime());
        expect(fechaConstruida - fechaControl).to.eql(0);
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
    [ [7], ["1992-12-12"], [new Date(1999,12,31,23,0,0)], [new Date("abcd")], [new Date('23/25/2014')], [null] ].forEach(function(invalidParams){
        it("setDateValue rejects invalid date: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                var d1 = date.iso("2016-04-03");
                d1.setDateValue.apply(d1, invalidParams);
            }).to.throwError(/invalid date/);
        });
    });
    it("should parse the format of a string", function() {
       var parse = date.parseFormat;
       var invalidDate = /invalid date/;
       expect(parse("2016-12-02")).to.eql({y:2016, m:12, d:2});
       expect(parse("2016-1-02")).to.eql({y:2016, m:1, d:2});
       expect(parse("2016/1/02")).to.eql({y:2016, m:1, d:2});
       expect(parse).withArgs("2016-12/02").to.throwError(invalidDate);
       expect(parse).withArgs("2016/12-02").to.throwError(invalidDate);
       expect(parse).withArgs("2016_12_02").to.throwError(invalidDate);
       expect(parse("2016-2-30")).to.eql({y:2016, m:2, d:30}); // right format, wrong date
    });
    it("should validate y/d/m", function() {
        var isValid = bestGlobals.date.isValid;
        expect(isValid(1900,1,1)).to.be.ok();
        expect(isValid(2016,2,28)).to.be.ok();
        expect(isValid(1969,12,31)).to.be.ok();
        expect(isValid(2016,2,29)).to.be.ok();
        expect(isValid(2015,2,29)).to.not.be.ok();
        expect(isValid(15,2,29)).to.not.be.ok();
        expect(isValid(1940,13,29)).to.not.be.ok();
        expect(isValid(1940,11,31)).to.not.be.ok();
        expect(isValid(1940,4,31)).to.not.be.ok();
        expect(isValid(1940,3,33)).to.not.be.ok();
        expect(isValid(-1940,3,33)).to.not.be.ok();
        expect(isValid(194,5,31)).to.be.ok();
    });
    it("should validate a date object", function() {
       var isReal = bestGlobals.date.isReal;
       expect(isReal(new Date())).to.be.ok();
       expect(isReal(new Date("wrong"))).to.not.be.ok();
       expect(isReal(new Date('23/25/2014'))).to.not.be.ok();
       expect(isReal(2016)).to.not.be.ok();
       //expect(isReal(new Date('foo-bar 2014'))).to.not.be.ok();
    });
    [ [7], [3,4], [3,4,2010,4], [1992,4,4,1], ["1992-12-12"], [null] ].forEach(function(invalidParams){
        it("date.array rejects invalid input: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.array(invalidParams);
            }).to.throwError(/invalid date array/);
        });
    });
    [ {y:-1, m:7, d:4} , {y:1000, m:13, d:4}, {y:2000, m:7, d:34}  ].forEach(function(invalidParams){
        it("date.ymd rejects invalid input: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.ymd(invalidParams.y, invalidParams.m, invalidParams.d);
            }).to.throwError(/invalid date/);
        });
    });
});

describe("setGlobals",function(){
    it("populate globals", function(){
        var fakeGlobal={};
        bestGlobals.setGlobals(fakeGlobal);
        expect(fakeGlobal.coalesce instanceof Function).to.ok();
    });
});