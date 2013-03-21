var ParseStream = require('../lib/ParseStream');
var assert = require('assert');

var o ;
var json = JSON.stringify(o = {
    coucou: "salut",
    number: 8,
    bool: true,
    meh: null,
    nested_array: [
        {
            float: 1000.1,
            string: "a long string ? \" coucou 'oui oui non non' \n\r",
            nothingmuch: null
        },
        5,
        8,
        "yet another string"
    ]
});

var p = new ParseStream();
function log_event (value, path) {
    console.log('at %s: %s', path, value);
}

//p.on('*', log_event);

p.on('end', function(o) {
    var res = JSON.stringify(o);
    //assert.equal(res, json, "the objects are not identical");
});
p.end(json);

