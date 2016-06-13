<!--multilang v0 es:LEEME.md en:README.md -->
# best-globals
<!--lang:es-->

algunas funciones comunes que queremos que sean globales

<!--lang:en--]

common global function and constants - i.e. coalesce

[!--lang:*-->

<!-- cucardas -->
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/best-globals.svg)](https://npmjs.org/package/best-globals)
[![downloads](https://img.shields.io/npm/dm/best-globals.svg)](https://npmjs.org/package/best-globals)
[![build](https://img.shields.io/travis/codenautas/best-globals/master.svg)](https://travis-ci.org/codenautas/best-globals)
[![coverage](https://img.shields.io/coveralls/codenautas/best-globals/master.svg)](https://coveralls.io/r/codenautas/best-globals)
[![climate](https://img.shields.io/codeclimate/github/codenautas/best-globals.svg)](https://codeclimate.com/github/codenautas/best-globals)
[![dependencies](https://img.shields.io/david/codenautas/best-globals.svg)](https://david-dm.org/codenautas/best-globals)
[![qa-control](http://codenautas.com/github/codenautas/best-globals.svg)](http://codenautas.com/github/codenautas/best-globals)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->

## Instalación

<!--lang:en--]

## Install

[!--lang:*-->

```sh
$ npm install best-globals
```

<!--lang:es-->

## Objetivo principal

Tener a mano algunas funciones que estén como globales

<!--lang:en--]

## Main goal

Have handy some common global functions

[!--lang:*-->

## API

### coalesce(a [...,b] [,coalesce.throwError(message)])

<!--lang:es-->

Retorna el primer argumento que no es nulo o indefinido

En caso de recibir como parámetro `coalesce.throwError(message)` 
y que los parámetros anteriores no están definidos o son distintos de null
lanza una excepción con ese mensaje. 

En caso de recibir como parámetro `coalesce.throwErrorIfUndefined(message)` 
y que los parámetros anteriores no están definidos 
lanza una excepción con ese mensaje. 

<!--lang:en--]

Returns the first not null nor undefined parameter. 

Use `coalesce.throwError(message)` for throw an Exception if all parameters are null or undefined.

Use `coalesce.throwErrorIfUndefined(message)` for throw an Exception if all parameters are undefined.

[!--lang:*-->

```js
var coalesce = require('best-globals').coalesce;

console.log(coalesce(1,2)); // = 1
console.log(coalesce(null,3)); // = 3
console.log(coalesce(null,undefined,false,4)); // = false
```

<!--lang:*-->

### changing(originalConfig, changes, options)

<!--lang:es-->

Retorna un nuevo objeto con los datos que tiene orginalConfig cambiados por los que diga changes. 

<!--lang:en--]

Returns a new object like originalConfig with the changes reflected

[!--lang:*-->

```js
var chaging = require('best-globals').chaging;

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

<!--lang:*-->

### setGlobals(globalObject)

<!--lang:es-->

Recibe el objeto que tiene las variables globales y publica ahí todas las funciones del módulo best-globals

<!--lang:en--]

Receives the global object and populates all the module functions

[!--lang:*-->

```js
require('best-globals').setGlobals(global);
/*
  coalesce and the other functions are now global
*/

console.log(coalesce(null, 'yes));

```

<!--lang:es-->

## Licencia

<!--lang:en--]

## License

[!--lang:*-->

[MIT](LICENSE)
