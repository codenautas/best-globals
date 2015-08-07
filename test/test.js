"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

require('..');

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
