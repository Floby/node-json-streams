exports.ParseStream = require('./ParseStream');
exports.StringifyStream = require('./StringifyStream');

exports.createParseStream = function createParseStream() {
    return new ParseStream;
}
exports.createStringifyStream = function createStringifyStream(object) {
    return new StringifyStream(object);
}
