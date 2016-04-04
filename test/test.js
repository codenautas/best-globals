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
    it("should validate a date object", function() {
       var isReal = bestGlobals.date.dateIsReal;
       expect(isReal(new Date())).to.be.ok();
       expect(isReal(new Date("wrong"))).to.not.be.ok();
       // esto deberia devolver false!!
       //expect(isReal(new Date(Date.parse("2016-02-31")))).to.not.be.ok();
    });
    
    var indep = new Date(1916,7-1,9);
    var first = new Date(1910,5-1,25);
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
    it("create date from array", function(){
        var d1 = date.array([1916,7,09]);
        control(d1, indep);
    });
    it("create date from integers", function(){
        var d1 = date.ymd(1916,7,09);
        control(d1, indep);
    });
    it.skip("create date from string and ignore timezone in input", function(){
        var d1 = date.iso("1916-07-09 00:00:00-11:00");
        control(d1, indep);
        var d1 = date.iso("1916-07-09T00:00:00Z");
        control(d1, indep);
    });
    [ ["1997-12"], [1997,12], [1997,0,1], [[1997,0,1]], [(new Date(1916,7-1,9)).getTime()]].forEach(function(invalidParams){
        it.skip("rejects invalid date: "+JSON.stringify(invalidParams), function(){
            expect(function(){
                date.iso.apply(date,invalidParams);
            }).to.throwError(/invalid date/);
        });
    });
    it.skip("add setDateValue function", function(){
        var d1 = date.iso("1916-07-09");
        var d2 = date.iso("1910-05-25");
        var d3 = date.iso("1913-01-31");
        d3.setDateValue(d2);
        control(d3, first);
    });
    if(typeof Promise == 'function'){
        it.skip("add setDateValue function Promise version", function(done){
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
});

describe("setGlobals",function(){
    it("populate globals", function(){
        var fakeGlobal={};
        bestGlobals.setGlobals(fakeGlobal);
        expect(fakeGlobal.coalesce instanceof Function).to.ok();
    });
});