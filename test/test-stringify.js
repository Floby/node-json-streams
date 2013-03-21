var stringify = require('../').StringifyStream;
var sink = require('./sink');

exports.testStringify = function(test) {
    var source = {
        one: 1,
        two: 'two',
        three: [
            true,
            null,
            "Hello"
        ]
    };
    var s = new stringify(source);
    s.pipe(sink()).on('data', function(data) {
        test.equal(data, JSON.stringify(source), "JSON should be identical");
        clearTimeout(to);
        test.done();
    });
    var to = setTimeout(function() {
        if(!done) {
            test.fail('No end detected');
            test.done();
        }
    }, 20)
}

exports.testLongObject = function(test) {
    var source = {
        one: 1,
        two: 'two',
        three: [
            true,
            null,
            "Hello",
            {
                Hello: "Nothing to see here",
                a: 68988754,
                "null":null
            }
        ]
    };
    var s = new stringify(source);
    s.pipe(sink()).on('data', function(data) {
        test.equal(data, JSON.stringify(source), "JSON should be identical");
        clearTimeout(to);
        test.done();
    });
    var to = setTimeout(function() {
        if(!done) {
            test.fail('No end detected');
            test.done();
        }
    }, 20)
}

