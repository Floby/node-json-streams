var createParseStream = require('../').createParseStream;

function testParsedEquals(v) {
    return function(test) {
        var p = createParseStream();
        p.on('end', function(value) {
          test.equal(JSON.stringify(value), JSON.stringify(v), "parsed value should be identical");
          test.done();
        });
        p.end(JSON.stringify(v));
    }
}

exports.parseInt = testParsedEquals(8);
exports.parseFloat = testParsedEquals(12.98);
exports.parseBoolean = testParsedEquals(true);
exports.parseString = testParsedEquals("o hai frendz");

exports.parseEmptyArray = testParsedEquals([]);
exports.parseStringArray = testParsedEquals(["O hai", 'hello', "This is a text\n", "\x65ಠ"]);
exports.parseMixedArray = testParsedEquals([5, true, null, 'hello', 5e12]);
exports.parseArrayInArray = testParsedEquals([[4545], [true, false]]);

exports.parseEmptyObject = testParsedEquals({});
exports.parseMixedObject = testParsedEquals({
    hello: 'goodbye',
    one: 1,
    yes: true,
    nothing: null,
    great: 1.8e20,
})
