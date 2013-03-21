var util = require('util');
var stream = require('stream');

function Sink () {
    if(!(this instanceof Sink)) return new Sink()
    stream.Writable.call(this);
    this._result = [];
    this.on('finish', function() {
      this.emit('data', this._result.join(''));
    });
}
util.inherits(Sink, stream.Writable);

Sink.prototype._write = function _write(chunk, encoding, callback) {
    this._result.push(chunk.toString('utf8'));
    return callback();
};

module.exports = Sink;

