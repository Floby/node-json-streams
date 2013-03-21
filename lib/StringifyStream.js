var stream = require('stream');
var util = require('util');
var oi = require('object-iterator');

function StringifyStream (source, options) {
    stream.Readable.call(this, options);
    this.iterator = oi(source);

    this._inCompose = 0;
    this._isFirst = true;
}
util.inherits(StringifyStream, stream.Readable);

StringifyStream.prototype._read = function _read(size) {
    var chunk = '';
    var ended = false;
    while(chunk.length < size) {
        var v = this.iterator();
        if(!v) {
            ended = true;
            break;
        }
        var print = null;
        var novalue = false;
        switch(v.type) {
            case 'end-object':
                print = print || '}';
            case 'end-array':
                print = print || ']';
                novalue = true;

            case 'object':
                print = print || '{';
            case 'array':
                print = print || '[';

            default:
                if(novalue) break;
                print = print || JSON.stringify(v.value);
                if(this._inCompose && !this._isFirst) {
                    chunk += ',';
                }
                else {
                    this._isFirst = false;
                }
                if(v.key && typeof v.key == 'string') {
                    print = JSON.stringify(v.key) + ':' + print;
                }
                break;
        }

        chunk += print;

        switch(v.type) {
            case 'object':
                print = '{'
            case 'array':
                ++this._inCompose;
                this._isFirst = true;
                break;

            case 'end-object':
            case 'end-array':
                --this._inCompose;

            default:
                break;
        }
    }
    this.push(chunk);
    if(ended) this.push(null);
};



module.exports = StringifyStream;
