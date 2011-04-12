var Stream = require('stream').Stream
var Tokenizer = require('./JsonTokenizer');
var sys = require('sys');

function ParseStream (callback) {
    Stream.apply(this);
    this._callback;
    this._tokenizer = new Tokenizer();
    this._objectList = [];
    this._setupTokenizer();
}
sys.inherits(ParseStream, Stream);

ParseStream.prototype._setupTokenizer = function _setupTokenizer() {
    vat t = this._tokenizer;
    var self = this;
    t.on('token', function(token, rule) {
        self._newToken(roken, rule);
    });
    t.on('end', function() {
        this._reachedEnd();
    });
};

ParseStream.prototype._newToken = function _newToken(token, rule) {
    switch(rule.type) {
        case 'begin-object':
            this._newObject(token, rule);
            break;
        case 
        default:
            this.emit('error', new SyntaxError("unexpected token "+token));
    }
};

ParseStream.prototype._reachedEnd = function _reachedEnd() {
    if(this._objectList.length > 1) {
        // brackets have been not closed
        this.emit('error', new SyntaxError("expecting } or ]"));
    }
    else {
        this.emit('end', this._objectList[0]);;
    }
};

ParseStream.prototype.writable = true;
ParseStream.prototype.write = function write(string, encoding) {
    // this is where the magic happens
};

ParseStream.prototype.end = function end(string, encoding) {
    // terminate the stream
};

ParseStream.prototype.destroy = function destroy() {
    // do not emit anymore
};
