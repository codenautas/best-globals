"use strict";

var bestGlobals = {};

bestGlobals.coalesce=function coalesce(){
    var i=0;
    while(i<arguments.length-1 && arguments[i]==null) i++;
    return arguments[i];
}

bestGlobals.changing = function changing(original, changes, deleting, whatToDelete){
    if(typeof original!=="object" || original===null){
        if(changes!==undefined){
            return changes;
        }else{
            return original;
        }
    }else{
        if(typeof changes!=="object"){
            console.log("ERROR changing object with non-object");
            console.dir(original);
            console.dir(changes);
            throw new Error("ERROR changing object with non-object");
        }else if(!changes){
            return changes;
        }else{
            var result={};
            for(var name in original){
                if(!(name in changes)){
                    result[name] = original[name];
                }else if(deleting && changes[name]===whatToDelete){
                }else{
                    result[name] = changing(original[name], changes[name]);
                }
            }
            for(var name in changes){
                if(!(name in original)){
                    result[name] = changes[name];
                }
            }
            return result;
        }
    }
}
    
bestGlobals.setGlobals = function setGlobals(theGlobalObj){
    for(var name in bestGlobals){
        theGlobalObj[name] = bestGlobals[name];
    }
}

module.exports = bestGlobals;