process.env.TZ = "America/New_York";

var d0 = new Date(2024, 11-1, 3);
var d1 = new Date(2024, 11-1, 4);
var d2 = new Date(2024, 11-1, 5);
var d3 = new Date(2024, 11-1, 6);

console.log((d1 - d0) / (60*60*1000));
console.log((d2 - d1) / (60*60*1000));
console.log((d3 - d2) / (60*60*1000));

console.log(d0, d1, d2, d3);

var d = new Date(2024, 11-1, 3);  // mes - 1 ! 😈

console.log(d);
// 2024-11-03T04:00:00.000Z   4 hours after GMT-0 🌍

console.log(d.toLocaleString())
// 3/11/2024, 12:00:00        

d2 = new Date(d.getTime()+14*60*60*1000);

console.log(d2.toLocaleString());