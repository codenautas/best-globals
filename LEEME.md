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

<!--lang:es-->

opciones        |predeterminado |uso
----------------|---------------|----------------------------
`deletingValue` | *apagado*     |valor que se usa como señal de que la propiedad debe ser eliminada
`mostlyPlain`   | `false`       |permite cambiar un objeto de una clase que no es "plain"

<!--lang:en--]

options         |default  |use
----------------|---------|----------------------------
`deletingValue` | *off*   |value used to delete a property
`mostlyPlain`   | `false` |allows non plain object to be changed property by property

[!--lang:*-->

### changing(new Error(msg), changes)

<!--lang:es-->

Si el primer parámetro es de clase Error retorna el mismo objeto con los cambios en él.

<!--lang:en--]

If the first argument is an instance of Error, It returns the same object with the changes reflected

[!--lang:*-->

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

<!--lang:*-->

### escapeRegExp(text)

<!--lang:es-->

Produce el texto que debe ser enviado a `RegExp` para que detecte exacto ese texto
(aún cuando en el texto haya caracteres especiales de una regexp). 

<!--lang:en--]

Returns de text that must be passed to `RegExp` for detects the exact original text.

[!--lang:*-->

```js
var escapeRegExp = require('best-globals').escapeRegExp;

console.log(RegExp(escapeRegExp('a|b')).test('a|b')); // true
console.log(RegExp(escapeRegExp('a|b')).test('a')); // false
console.log(RegExp(/a|b/).test('a')); // true
```

<!--lang:*-->

### forOrder(text)

<!--lang:es-->

Produce un texto que puede ser comparado para un orden "mas humano" de modo de que sea cierto:

<!--lang:en--]

Returns a unreadeable text that can be used to order the text in an human way

[!--lang:*-->

```js
var forOrder = require('best-globals').forOrder;

console.log(forOrder('code X9')<forOrder('code X11')); // true
```

<!--lang:*-->

### compareForOrder(criteria)

<!--lang:es-->

Crea una función para ser utilizada con la función sort de arreglos

<!--lang:en--]

Returns a function to be pased to the sort array function.

[!--lang:*-->

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

<!--lang:*-->

### sleep(milliseconds)

<!--lang:es-->

Suspende una cadena de promesas durante un tiempo

<!--lang:en--]

Suspends a promises chain for a while

[!--lang:*-->

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
<!--lang:*-->

### serie([a,]n) 

<!--lang:es-->

Devuelve un arreglo con *n* números empezando por *a* (o por cero)

<!--lang:en--]

Returns an array with *n* numbers starting with *a* (or zero)

[!--lang:*-->

```js
var serie = require('best-globals').serie;

console.log(serie(3)); // [0,1,2]
console.log(serie(2,3)); // [2,3,4]
```
<!--lang:*-->

### today() 

<!--lang:es-->

Devuelve un date sin hora

<!--lang:en--]

Returns today with hour

[!--lang:*-->

```js
var today = require('best-globals').today;

console.log(today()); // 2017-03-31 current date!
```

<!--lang:es-->

## Licencia

<!--lang:en--]

## License

[!--lang:*-->

[MIT](LICENSE)
