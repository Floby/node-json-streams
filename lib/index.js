var ParseStream = exports.ParseStream = require('./ParseStream');
exports.StringifyStream = require('./StringifyStream');

exports.createParseStream = function createParseStream(noStore) {
    return new ParseStream(noStore);
}
exports.createStringifyStream = function createStringifyStream(object) {
    return new StringifyStream(object);
}
