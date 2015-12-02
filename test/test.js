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
        })
    });
    it("deep 'changing' function must delete", function(){
        var obtained = changing({
            normal:1,
            forDelete:2,
        },{
            normal:3,
            forDelete:'data-to-delete'
        },true,'data-to-delete');
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
        },true);
        expect(obtained).to.eql({
            normal:3
        })
    });
});
