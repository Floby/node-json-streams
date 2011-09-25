var ParseStream = require('../lib/ParseStream');
var assert = require('assert');

json = JSON.stringify([
    'coucou',
    'salut',
    8,
    true,
    [
        10,
        false
    ]
]);
console.log('parsing %s\n\n', json);

var p = new ParseStream();
p.on('end', function(o) {
    console.log('\nresult object', o);
    var res = JSON.stringify(o);
    assert.equal(res, json, "the objects are not identical");
    console.log('ignored', this._ignored);
    console.log('queue', this._queue);
});
p.end(json);

