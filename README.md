# best-globals

common global function and constants - i.e. coalesce


![stable](https://img.shields.io/badge/stability-stable-blue.svg)
[![npm-version](https://img.shields.io/npm/v/best-globals.svg)](https://npmjs.org/package/best-globals)
[![downloads](https://img.shields.io/npm/dm/best-globals.svg)](https://npmjs.org/package/best-globals)
[![build](https://github.com/codenautas/best-globals/actions/workflows/node.js.yml/badge.svg)](https://github.com/codenautas/best-globals/actions/workflows/node.js.yml)
[![coverage](https://img.shields.io/coveralls/codenautas/best-globals/master.svg)](https://coveralls.io/r/codenautas/best-globals)
[![outdated-deps](https://img.shields.io/github/issues-search/codenautas/best-globals?color=9cf&label=outdated-deps&query=is%3Apr%20author%3Aapp%2Fdependabot%20is%3Aopen)](https://github.com/codenautas/best-globals/pulls/app%2Fdependabot)


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


## Install


```sh
$ npm install best-globals
```


## Main goal

Have handy some common global functions


## API

### coalesce(a [...,b] [,coalesce.throwError(message)])


Returns the first not null nor undefined parameter.

Use `coalesce.throwError(message)` for throw an Exception if all parameters are null or undefined.

Use `coalesce.throwErrorIfUndefined(message)` for throw an Exception if all parameters are undefined.

`coalesce` is similar to `??`, but `coalesce` with `null` and `undefined` returns `null`,
and `??` returns the last. Also `coalesce` can be used with his auxiliar functions `throwError` and `throwErrorIfUndefined`.


```js
var coalesce = require('best-globals').coalesce;

console.log(coalesce(1,2)); // = 1
console.log(coalesce(null,3)); // = 3
console.log(coalesce(null,undefined,false,4)); // = false
console.log(coalesce(null,undefined)); // = null [1]
console.log(coalesce(undefined,null)); // = null
console.log(coalesce(undefined,undefined)); // = undefined
console.log(coalesce(undefined,coalesce.throwErrorIfUndefined('name'))); // = throw an Error [1]
```

**Note** `[1]` the behavior differs from `??`


### changing(originalConfig, changes, options)


Returns a new object like originalConfig with the changes reflected

Changes can be:
   * any value,
   * an object to apply the recursive changes (if the original is also an object)
   * a call to `changes.trueByObject(changes)` that means that the change only applies to non falsy values



```js
var changing = require('best-globals').changing;

var newConfig = changing(
    {
        database:'default_db',
        port:3306,
        user:'default_user',
        throwExceptions:true
    },
    {
        database:'develop_db',
        user:'devel_user',
        password:'d3v31_u53r',
        throwExceptions:undefined
    },
    changing.options({deletingValue:undefined})
);

console.log(newConfig);
/*
    {
        database:'develop_db',
        port:3306,
        user:'devel_user',
        password:'d3v31_u53r',
    },
*/

```


options         |default  |use
----------------|---------|----------------------------
`deletingValue` | *off*   |value used to delete a property
`mostlyPlain`   | `false` |allows non plain object to be changed property by property


### changing(new Error(msg), changes)


If the first argument is an instance of Error, It returns the same object with the changes reflected


```js
var changing = require('best-globals').changing;

try{
  //something
  throw changing(new Error('error in example', {Gravity:'Falls'}));
}catch(err){
  console.log(err.message); // error in example
  consoel.log(err.Gravity); // Falls
}
```


### escapeRegExp(text)


Returns de text that must be passed to `RegExp` for detects the exact original text.


```js
var escapeRegExp = require('best-globals').escapeRegExp;

console.log(RegExp(escapeRegExp('a|b')).test('a|b')); // true
console.log(RegExp(escapeRegExp('a|b')).test('a')); // false
console.log(RegExp(/a|b/).test('a')); // true
```


### forOrder(text)


Returns a unreadeable text that can be used to order the text in an human way


```js
var forOrder = require('best-globals').forOrder;

console.log(forOrder('code X9')<forOrder('code X11')); // true
```


### compareForOrder(criteria)


Returns a function to be pased to the sort array function.


```js
var compareForOrder = require('best-globals').compareForOrder;

var data=[
    {lastName:'Smith', firstName:'Bob'  },
    {lastName:'Kerry', firstName:'Kelly'},
];

data.sort(compareForOrder([
    {column:'lastName' },
    {column:'firstName', order:-1}, // descending
]));

console.log(data);
```


### sleep(milliseconds)


Suspends a promises chain for a while


```js
var sleep = require('best-globals').sleep;

sleep(2000).then(function(){
    console.log('two seconds waited');
    return sleep(1000);
}).then(function(){
    console.log('another second waited');
    return 42;
}).then(sleep(3000)).then(function(result){
    console.log('wait three seconds and pass the result to the next "then"');
});

```

### serie({[from:number,] to:number [,step:number]})
### serie({[from:number,] length:number [,step:number]})


Returns an array with a serie of numbers starting with *from* (or zero), step by *step* (or 1);
with *length* or until *to*.


```js
var serie = require('best-globals').serie;

console.log(serie({length:3})); // [0,1,2]
console.log(serie({from:2,length:3})); // [2,3,4]
console.log(serie({from:2,to:4})); // [2,3,4]
console.log(serie({from:2,to:15,step:5})); // [2,7,12]
```

### today()


Returns today with hour


```js
var today = require('best-globals').today;

console.log(today()); // 2017-03-31 current date!
```


## License


[MIT](LICENSE)
