#!/usr/bin/env node

var json = require('../');


var paths = process.argv.slice(2);
if(!paths.length) {
    console.error('nothing to do.');
    process.exit(1);
}

var parser = json.createParseStream();
paths.forEach(function(p) {
    parser.on(p, function(value, path) {
        console.log('%s:\t%s', path, JSON.stringify(value));
    });
});

process.stdin.setEncoding('utf8');
process.stdin.pipe(parser);
