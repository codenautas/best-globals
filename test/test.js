"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

require('..').setGlobals(global);

describe('best-globals', function(){
    describe('coalesce', function(){
        it('return the first value if is not null',function(){
            expect(coalesce(7,8)).to.be(7);
        });
        it('return the first not null value',function(){
            expect(coalesce(null,null,null,null,null,null,null,null,null,null,null,null,null,17,8)).to.be(17);
        });
        it('return the last value if all are nulls',function(){
            expect(typeof coalesce(null,{}.inex)).to.be("undefined");
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
                var result=coalesce(null, {}.inexis, valid.element, 'last');
                expect(result).to.be(valid.element);
            });
        });
    });
});

describe('is Plain Object', function(){
    it("recognizes {}",function(){
        expect(isPlainObject({})).to.ok();
    });
    it("! recognizes Array",function(){
        expect(isPlainObject([])).to.not.ok();
    });
    it("! recognizes null",function(){
        expect(isPlainObject(null)).to.not.ok();
    });
});

describe('mini-tools config functions', function(){
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
    it("deep 'changing' function must delete", function(){
        var obtained = changing({
            normal:1,
            forDelete:2,
        },{
            normal:3,
            forDelete:'data-to-delete'
        },changing.options({deletingValue:'data-to-delete'}));
        expect(obtained).to.eql({
            normal:3
        })
    });
    it("deep 'changing' function must delete undefineds", function(){
        var obtained = changing({
            normal:1,
            forDelete:2,
        },{
            normal:3,
            forDelete:undefined
        },changing.options({deletingValue:undefined}));
        expect(obtained).to.eql({
            normal:3
        })
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
});
