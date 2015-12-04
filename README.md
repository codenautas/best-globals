# best-globals

common global function and constants - i.e. coalesce


![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/best-globals.svg)](https://npmjs.org/package/best-globals)
[![downloads](https://img.shields.io/npm/dm/best-globals.svg)](https://npmjs.org/package/best-globals)
[![build](https://img.shields.io/travis/codenautas/best-globals/master.svg)](https://travis-ci.org/codenautas/best-globals)
[![coverage](https://img.shields.io/coveralls/codenautas/best-globals/master.svg)](https://coveralls.io/r/codenautas/best-globals)
[![climate](https://img.shields.io/codeclimate/github/codenautas/best-globals.svg)](https://codeclimate.com/github/codenautas/best-globals)
[![dependencies](https://img.shields.io/david/codenautas/best-globals.svg)](https://david-dm.org/codenautas/best-globals)


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


## Install


```sh
$ npm install best-globals
```


## Main goal

Have some common global functions


## API

### coalesce(a [...,b])


Returns the first not null nor undefined parameter


```js
console.log(coalesce(1,2)); // = 1
console.log(coalesce(null,3)); // = 3
console.log(coalesce(null,undefined,false,4)); // = false
```


### changing(originalConfig, changes, options)


Returns a new object like originalConfig with the changes reflected


```js

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


Returns a new object like originalConfig with the changes reflected


## License


[MIT](LICENSE)
