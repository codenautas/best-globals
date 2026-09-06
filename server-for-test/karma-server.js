"use strict";

//var _ = require('lodash');
var express = require('express');
var app = express();
app.disable("x-powered-by");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var fs = require('fs-promise');
var path = require('path');
//var readYaml = require('read-yaml-promise');
//var extensionServeStatic = require('extension-serve-static');

var karmaIndex=process.argv.indexOf('--karma');
if(karmaIndex>0){
    var karma = require('karma'); // eslint-disable-line global-require
    var karmaConfig = require('../karma.conf.js'); // eslint-disable-line global-require
    var options;
    karmaConfig({set:function(opts){
        options=opts;
        var posBrowsers = process.argv.indexOf('--browsers')
        if(posBrowsers>0){
            options.browsers=(process.argv[posBrowsers+1]||'').split(',');
        }
    }},{singleRun:process.argv.indexOf('--single-run')>0 || process.env.SINGLE_RUN});
    console.log('karma starting');
    var karmaServer = new karma.Server(options, function(exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode); // eslint-disable-line no-process-exit
    })
    karmaServer.start();
    console.log('karma starting',options.port);
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
