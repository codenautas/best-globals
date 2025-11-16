<!--multilang v0 es:fechas.md en:dates.md -->
# *best-globals* `date`
<!--lang:es-->

Manejar fechas en Javascript puede tener un montón de problemas:
   * agregar un día no es simplemente sumar `24 * 60 * 60 * 1000` milisegundos. A veces no!
   * crear una fecha y enviarla del frontend al backend o a la base de datos también tiene sus problemas.

Por ejemplo (en node.js):

<!--lang:en--]

Handling dates in Javascript is not easy as it seems. 
   * adding a day is not that simple as adding `24 * 60 * 60 * 1000` miliseconds. 
   * creating a date and then send it to the frontend o to the database can also have problems.

Try this in node.js:

[!--lang:*-->

```js
process.env.TZ = "America/Buenos_Aires";

var d1 = new Date("2009-03-15")
var d2 = new Date(d1.getTime() + 24*60*60*1000)
console.log(d1.toString()) // Sat Mar 14 2009 22:00:00 GMT-0200 (hora de verano de Argentina)
console.log(d2.toString()) // Sun Mar 15 2009 21:00:00 GMT-0300 (hora estándar de Argentina)
```

<!--lang:es-->
¿Se ve? 
Primero: El constructor de fecha a partir de un string construye un fecha
que es una en el uso horario 0. 
Cuando se muestra en la zona horaria de Buenos Aires todavía no es 15 de marzo, son dos horas antes, son las 10 de la noche.

Segundo: Al sumar 24 horas se obtiene la siguiente fecha, pero como ese día
(el 15/3) hubo cambio de hora, se obtiene el 15/3 a las 9 de la noche. 

<!--lang:en--]

Can you see it?
   * The date constructor, called with a string, interprets its paramter as a ISO date in the 0 time zone. Then in Buenos Aires is the date before, 2 hours before midnight. 
   * Adding 24 hours you obtain a date 24hs after the other, but March 15th changes the hour in Buenos Aires. That's why we obtain a date 3 hours before midnight. 

[!--lang:*-->

<!--lang:es-->

## el uso de `date` en *best-globals*

`date` contiene un conjunto de funciones que mejoran el uso de fechas en Javascript. 
Para poder utilizar la case `Date` nativa de Javascript se va a convenir que las fechas están en la hora `0:00` de timezone local.

<!--lang:en--]

## *best-globals* `date` usage

`date` has a set of helper functions that improves the use of Javascript dates. 
The result is a better `Date` that has the hour `12am` in the local timezone.

[!--lang:*-->

```ts
process.env.TZ = "America/Buenos_Aires";

import { date } from 'best-globals';

var d1 = date.iso("2009-03-14")
var d2 = d2.add({days: 1})
console.log(d1.toString()) // Sat Mar 14 2009 00:00:00 GMT-0200 (hora de verano de Argentina)
console.log(d2.toString()) // Sun Mar 15 2009 00:00:00 GMT-0300 (hora estándar de Argentina)
console.log(d1.toDmy()) // 15/3/2009
console.log((d2-d1) / (60*60*1000)); // 25
```

# `date.iso(s:string)` / `date.ymd(y:number, m:number, d:number)`

<!--lang:es-->

Devuelve una fecha de tipo `Date` con algunas funciones adicionales, por ejemplo `add` que permite agregar días (de la cantidad de horas correspondientes al timezone).

Los constructores nativos de Javascript `new Date(s)` y 
`new Date(y, m, d)` devuelven diferentes tipos de `Date`. 
En el primer caso lo devuelven en GMT0, en el segundo en el timezone local. 
Además, las funciones nativas de JS, en el segundo caso `m` va de `0` a `11`. Lo cual puede genera confusiones o errores de programación. 

<!--lang:en--]

Returns a `Date` object agumented with addicional functions, for example `add` that allows adding any number of days (with the appropriate hours).

Both Javascript native constructors `new Date(s)` and `new Date(y, m, d)`,  retun different kind of `Date`. 
In the first casi returns `GMT0` tz and in the seccond the local timezone. 
Also in the second case the month counts from `0` to `11`. 
That can produces programming mistakes. 


[!--lang:*-->

# `date.today()`

<!--lang:es-->

Fecha del día (con la fecha aumentada que produce `date`)

<!--lang:en--]

An augmented date of today

[!--lang:*-->

# `dateTime.iso(s:string)` / `dateTime.now()`

```ts
var begin = dateTime.iso('2023-11-20 10:33')
var end = dateTime.now()
var interval = end.sub(begin)
console.log(interval.toPlainString()); // 45D 10:30:12 
var dt = begin.add({minutes:10}) // 2023-11-20 10:43
```

<!--lang:es-->

Crea un Date a partir de un iso string pero con las funciones aumentadas de date. 

<!--lang:en--]

An augmented Date with date and time

[!--lang:*-->

# `timeInterval.iso(s:string)` / `timeInterval.iso({hours, minutes, seconds})

<!--lang:es-->

Crea un objeto que contiene un lapso de tiempo. Puede usarse junto a `toHm()` y `toHms()` para contener horas sin fecha.
Puede sumarse a _DateTime_ u obtenerse por diferencia entre dos _DateTime_(s)

<!--lang:en--]

Creates an object containing a lapse of time. It can be used with `toHm()` y `toHms()` to express the time of the date (without storing the date).
Can be added to a _DateTime_ or obtained by substracting to _DateTime_.

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

<!--lang:en--]

[!--lang:*-->

<!--lang:es-->

## más info

Para más información sobre los cambios de hora en la República Argentina se puede mirar el [Servicio de Hidrografía Naval](https://www.hidro.gov.ar/observatorio/LaHora.asp?op=3)