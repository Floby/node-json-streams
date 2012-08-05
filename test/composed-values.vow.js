#!/usr/bin/env node

var vows = require('vows');
var assert = require('assert');
var ParseStream = require('../lib/ParseStream');


var suite = vows.describe('Composed Values');

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
    "When parsing an array": {
        "while empty": assertSameParsed('[]'),
        "with one numeric entry": assertSameParsed('[4]'),
        "with one numeric entry": assertSameParsed('[-0.9e4]'),
        "with one string entry": assertSameParsed('["hey"]'),
        "with one boolean entry": assertSameParsed('[true]'),
        "with two boolean entries": assertSameParsed('[true, false]'),
        "with two numeric entries": assertSameParsed('[-44.7, 9.0322]'),
        "with two string entries": assertSameParsed('["Hello", "World"]'),
        "with 5 mixed entries": assertSameParsed('["Hello", true, 9, false, null]'),
    }
}).addBatch({
    "When parsing an object": {
        "while empty": assertSameParsed('{}'),
        "with one numeric entry, at word key": assertSameParsed('{"hey": 8}'),
        "with one numeric entry, at phrase key": assertSameParsed('{"hey hey my my": 8}'),
    }
}).addBatch({
    "When parsing nested objects,": {
        "Array in object": assertSameParsed('{"array":[1,2,3]}'),
        "Object in Array": assertSameParsed('[1, {"key":"value"}]'),
    }
}).export(module);
