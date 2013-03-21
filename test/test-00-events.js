var ParseStream = require('../').ParseStream;

exports.testAllFromArray = function(test) {
    var array = [0,2,2,3,4,5,6];
    var parsed = 0;
    p = new ParseStream();
    p.on('$[*]', function(value, path) {
        test.equal(value, array[parsed], 'Parsed value should be equal');
        ++parsed;
    });
    p.on('end', function() {
        test.equal(parsed, array.length, "We should have parsed every element");
        test.done();
    });
    p.on('error', function(err) {
       test.fail(err);
    });
    p.end(JSON.stringify(array));
}

exports.testAllFromObject = function(test) {
    var object = {one: 1, two: 2, three: 3};
    var keys = Object.keys(object);
    var parsed = 0;
    p = new ParseStream();
    p.on('$.*', function(value, path) {
        test.equal(value, object[keys[parsed++]], 'Parsed value should be equal');
    });
    p.on('end', function() {
        test.equal(parsed, keys.length, "We should have parsed every element");
        test.done();
    });
    p.on('error', function(err) {
        test.fail(err);
    });
    p.end(JSON.stringify(object));
}

