var Parser = require('parser');
var Tokenizer = require('./JsonTokenizer');
var sys = require('sys');
var assert = require('assert');


function ParseStream (callback) {
    Parser.call(this, new Tokenizer());
    this._callback;

    //this.defaultHandler(this.object);
    this._object;
    var self = this;
    function initialSet (value) {
        console.log('initial set')
        self._object = value;
    }
    this.initialHandler(this.value(initialSet));

    // debug
    this._tokenizer.on('token',function(token, type) {
        console.log('got token "%s" of type %s', token, type);
    })
}
sys.inherits(ParseStream, Parser);

ParseStream.prototype.value = function(set) {
    return function value(token, type, next) {
        switch(type) {
            case 'begin-object':
                next(this.object(set));
                break;
            case 'begin-array':
                next(this.array(set));
                break;
            case 'string':
            case 'boolean':
            case 'number':
            case 'null':
                next(this.native(set));
                break;
            default:
                throw new SyntaxError("unexpected token "+token);
                break;
        }
        return true;
    };
}

ParseStream.prototype.native = function Native(set) {
    return function Native(token, type, next) {
        switch(type) {
            case 'boolean':
                if(token[0] === 't') {
                    set(true);
                }
                else set(false);
                break;
            case 'null':
                set(null);
                break;
            case 'number':
                var int = (token.indexOf('.') === -1);
                set(int ? parseInt(token) : parseFloat(token));
                break;
            case 'string':
                set(JSON.parse(token));
                break;
            default:
                throw new SyntaxError("unexpected token "+token+". expecting native");
        }
    }
};

ParseStream.prototype.array = function array(set) {
    var a = [];
    set(a);
    function arraySet (value) {
        a.push(value);
    }
    return function array (token, type, next) {
        next(
            Parser.expect('begin-array'),
            Parser.list(
                'comma',                // array
                this.value(arraySet),   // values
                'end-array'             // token ending the list
            ),
            Parser.expect('end-array')
        );
        return true; //expand this
    }
};

ParseStream.prototype.object = function object(set) {
     console.log('creating new object');
    var o = {};
    set(o);
    function objectSet (label, value) {
        o[label] = value;
    }
    
    return function object (token, type, next) {
        console.log('in object with %s', token);
        next(
            Parser.expect('begin-object'),
            Parser.list(
                'comma',                        // separator
                this.labeledValue(objectSet),   // values
                'end-object'                    // token ending the list
            ),
            Parser.expect('end-object')
        )
        return true;
    }
};

ParseStream.prototype.labeledValue = function labeledValue(objectSet) {
    var label;
    function readLabel (token, type, next) {
        assert.equal(type, 'string', "unexpected token "+token+". expected string");
        label = JSON.parse(token);
    }
    function set (value) {
        objectSet(label, value);
    }

    return function labeledValue (token, type, next) {
        next(
            readLabel,
            Parser.expect('end-label'),
            this.value(set)
        );
        return true;
    }
};

ParseStream.prototype._reachedEnd = function _reachedEnd() {
    this.emit('end', this._object);
};

ParseStream.prototype.writable = true;

ParseStream.prototype.destroy = function destroy() {
    // do not emit anymore
};


module.exports = ParseStream;
