var Parser = require('parser');
var Tokenizer = require('./JsonTokenizer');
var util = require('util');
var assert = require('assert');


/**
 * The constuctor for Json parsing streams.
 * @inherits Parser
 */
function ParseStream () {
    Parser.call(this, new Tokenizer());

    this._object;
    var self = this;
    function initialSet (value) {
        self._object = value;
    }
    this.initialHandler(this.value(initialSet));
    // TODO set a default handler which is stricter than `ignore`
    this.defaultHandler(function(token, type, next) {
        if(type !== 'eof') {
            throw new SyntaxError("unexpected token "+token+". expected eof");
        }
    });
}
util.inherits(ParseStream, Parser);

/**
 * Factory. Returns a handler able to parse any JSON value
 * @param set a function to be called when the value has to be set
 *          on its parent object or array.
 * @return a handler expanding to the correct handlers depending on the 
 *          token we get
 */
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

/**
 * Factory. Returns a handler able to parse any non-composed value
 *          (string, boolean, number, null)
 *  @param set the function to set the value on its parent
 *  @return a handler
 */
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
                int &= (token.indexOf('e') === -1);
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

/**
 * Factory. Returns a handler able to parse an array
 * @param set a function to set this array on its parent
 * @return a handler expanding to the correct handlers
 */
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

/**
 * Factory. Returns a handler able to parse a javascript object
 * @param set the function to set this object on its parent
 * @return a handler expanding to the correct handler to parse an object
 */
ParseStream.prototype.object = function object(set) {
    var o = {};
    set(o);
    function objectSet (label, value) {
        o[label] = value;
    }
    
    return function object (token, type, next) {
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

/**
 * Factory. returns a handler able to parse labeled value (as in JS objects)
 * @param objectSet the function to set the labeled value on the parent object
 * @return a handler expanding to the correct handlers to parse a labeled value
 */
ParseStream.prototype.labeledValue = function labeledValue(objectSet) {
    var label;
    /**
     * this handler reads the label and sets the closured var `label`
     */
    function readLabel (token, type, next) {
        assert.equal(type, 'string', "unexpected token "+token+". expected string");
        label = JSON.parse(token);
    }
    /**
     * this is the function that should be called when the value part has
     * to be set
     */
    function set (value) {
        objectSet(label, value);
    }

    /**
     * the actual handler
     */
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
