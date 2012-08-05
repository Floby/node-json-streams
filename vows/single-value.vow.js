#!/usr/bin/env node

var vows = require('vows');
var assert = require('assert');
var ParseStream = require('../lib/ParseStream');


var suite = vows.describe('Single Values');

function assertSameParsed(value) {
    function parseValue (value) {
        return function() {
            var parser = new ParseStream();
            var cb = this.callback;
            parser.on('end', function(object) {
                cb(null, object);
            });
            parser.on('error', function(err) {
                cb(err);
            });
            parser.end(value);
        }
    }
    return {
        topic: parseValue(value),
        'it should be parsed correctly': function(parsed) {
            parsed = JSON.stringify(parsed);
            val = JSON.stringify(JSON.parse(value));
            assert.equal(parsed, val,
                'The parsed value is not equal to the given value '+parsed+' != '+val);
        }
    }
}

suite.addBatch({
    "When parsing a number": {
        "positive integer": assertSameParsed('4'),
        "negative integer": assertSameParsed('-31'),
        "positive fraction": assertSameParsed('10.89'),
        "negative fraction": assertSameParsed('-40.54'),
        "exponential notation": assertSameParsed('4e3'),
        "exponential notation with decimal part": assertSameParsed('80.5e3'),
        "exponential notation negative": assertSameParsed('-4e3'),
        "exponential notation negative with decimal part": assertSameParsed('-4.6e3'),
        "exponential notation, negative exponent": assertSameParsed('4e-3'),
        "exponential notation, negative exponent, negative value": assertSameParsed('-4e-3'),
        "exponential notation, negative exponent, negative value, decimal part": assertSameParsed('-4.8e-3'),
    },
    "When parsing a boolean": {
        "false": assertSameParsed('false'),
        "true": assertSameParsed('true'),
    },
    "When parsing null": {
        "null": assertSameParsed('null')
    },
    "When parsing a string": {
        "Simple string": assertSameParsed('"hello world!"'),
        "utf8 string": assertSameParsed('"안녕하세요"'),
        "with escaped characters": assertSameParsed('"haha \\" hoho"'),
        "with encoded characters": assertSameParsed('"\\u0CA0_\\u0ca0"'),
    }
}).export(module);

