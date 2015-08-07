# best-globals
common global function and constants - i.e. coalesce
<!--multilang v0 en:README.md es:LEEME.md -->

<!--lang:es--]

algunas funciones comunes que queremos que sean globales

[!--lang:*-->

![designing](https://img.shields.io/badge/stability-desgining-red.svg)
[![version](https://img.shields.io/npm/v/best-globals.svg)](https://npmjs.org/package/best-globals)
[![downloads](https://img.shields.io/npm/dm/best-globals.svg)](https://npmjs.org/package/best-globals)
[![build](https://img.shields.io/travis/codenautas/best-globals/master.svg)](https://travis-ci.org/codenautas/best-globals)
[![coverage](https://img.shields.io/coveralls/codenautas/best-globals/master.svg)](https://coveralls.io/r/codenautas/best-globals)
[![climate](https://img.shields.io/codeclimate/github/codenautas/best-globals.svg)](https://codeclimate.com/github/codenautas/best-globals)
[![dependencies](https://img.shields.io/david/codenautas/best-globals.svg)](https://david-dm.org/codenautas/best-globals)

<!--multilang buttons-->

language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)

<!--lang:en-->

## Install

<!--lang:es--]
## Instalación

[!--lang:*-->

```sh
$ npm install best-globals
```

<!--lang:en-->

## Main goal

Have some common globan functions

<!--lang:es--]

## Objetivo principal

Tener a mano algunas funciones que estén como globales

[!--lang:*-->

## API

### coalesce(a [...,b])

<!--lang:en-->

Returns the first not null nor undefined parameter

<!--lang:es--]

Retorna el primer argumento que no es nulo o indefinido

[!--lang:*-->

```js
console.log(coalesce(1,2)); // = 1
console.log(coalesce(null,3)); // = 3
console.log(coalesce(null,undefined,false,4)); // = false
```

<!--lang:en-->

## License

<!--lang:es--]

## Licencia

[!--lang:*-->

[MIT](LICENSE)

.............................