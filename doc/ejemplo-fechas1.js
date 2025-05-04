process.env.TZ = "America/Buenos_Aires";

var d1 = new Date("2009-03-15")
var d2 = new Date(d1.getTime() + 24*60*60*1000);
console.log(d1.toString()) // Sat Mar 14 2009 22:00:00 GMT-0200 (hora de verano de Argentina)
console.log(d2.toString()) // Sun Mar 15 2009 21:00:00 GMT-0300 (hora estándar de Argentina)
console.log((d2-d1) / (60*60*1000)); // 24

console.log(Intl);

var bg = require('../best-globals')
var {date} = bg;

var d1 = date.iso("2009-03-14")
var d2 = d1.add({days: 1})
console.log(d1.toString()) // Sat Mar 14 2009 00:00:00 GMT-0200 (hora de verano de Argentina)
console.log(d2.toString()) // Sun Mar 15 2009 00:00:00 GMT-0300 (hora estándar de Argentina)
console.log((d2-d1) / (60*60*1000)); // 25

return;

var d0 = new Date(2008, 10-1, 17);
var d1 = new Date(2008, 10-1, 18);
var d2 = new Date(2008, 10-1, 19);
var d3 = new Date(2008, 10-1, 20);
var d4 = new Date(2008, 10-1, 21);
/*
var d0 = new Date(2009, 3-1, 16);
var d1 = new Date(2009, 3-1, 17);
var d2 = new Date(2009, 3-1, 18);
var d3 = new Date(2009, 3-1, 19);
var d4 = new Date(2009, 3-1, 20);
*/
console.log((d1 - d0) / (60*60*1000));
console.log((d2 - d1) / (60*60*1000));
console.log((d3 - d2) / (60*60*1000));
console.log((d4 - d3) / (60*60*1000));
console.log(d0,d1,d2,d3,d4)

var d = new Date(2024, 11-1, 3);  // mes - 1 ! 😈

console.log(d);
// 2024-11-03T04:00:00.000Z   4 hours after GMT-0 🌍

console.log(d.toLocaleString())
// 3/11/2024, 12:00:00        

d2 = new Date(d.getTime()+14*60*60*1000);

console.log(d2.toLocaleString());