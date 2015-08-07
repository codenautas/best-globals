<!-- multilang from README.md




NO MODIFIQUE ESTE ARCHIVO. FUE GENERADO AUTOMÁTICAMENTE POR multilang.js




-->
# best-globals
common global function and constants - i.e. coalesce


algunas funciones comunes que queremos que sean globales


![designing](https://img.shields.io/badge/stability-desgining-red.svg)
[![version](https://img.shields.io/npm/v/best-globals.svg)](https://npmjs.org/package/best-globals)
[![downloads](https://img.shields.io/npm/dm/best-globals.svg)](https://npmjs.org/package/best-globals)
[![build](https://img.shields.io/travis/codenautas/best-globals/master.svg)](https://travis-ci.org/codenautas/best-globals)
[![coverage](https://img.shields.io/coveralls/codenautas/best-globals/master.svg)](https://coveralls.io/r/codenautas/best-globals)
[![climate](https://img.shields.io/codeclimate/github/codenautas/best-globals.svg)](https://codeclimate.com/github/codenautas/best-globals)
[![dependencies](https://img.shields.io/david/codenautas/best-globals.svg)](https://david-dm.org/codenautas/best-globals)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

## Instalación


```sh
$ npm install best-globals
```


## Objetivo principal

Tener a mano algunas funciones que estén como globales


## API

### coalesce(a [...,b])


Retorna el primer argumento que no es nulo o indefinido


```js
console.log(coalesce(1,2)); // = 1
console.log(coalesce(null,3)); // = 3
console.log(coalesce(null,undefined,false,4)); // = false
```


## Licencia


[MIT](LICENSE)

.............................