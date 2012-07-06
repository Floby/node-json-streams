var streamify = require('json-streamify').streamify;
var Stream = require('stream').Stream;
var util = require('util');

function StringifyStream (object) {
    Stream.apply(this);
    this.on('newListener', function(event, listener) {
        if(event === 'data') {
            this._start();
        }
    });
}

StringifyStream.prototype._start = function _start() {
    var self = this;
    process.nextTick(function() {
        // streamify is synchronous so this is somewhat
        // not what we want to do but this is on the
        // TODO list
        streamify(self._object, function(data) {
            self.emit(data);
        })
    })
};

util.inherits(StringifyStream, Stream);

StringifyStream.prototype.readable = true;

StringifyStream.prototype.setEncoding = function setEncoding() {
    // no support for encoding since it makes little sense for
    // something supposed to yield JSON. So utf8 it is
};
StringifyStream.prototype.pause = function pause() {
    // this will come later, haha!
};
StringifyStream.prototype.resume = function resume() {
    // same as above
};
StringifyStream.prototype.destroy = function destroy() {
    // yeah... well
};
StringifyStream.prototype.destroySoon = function destroySoon() {
    // meh
};

