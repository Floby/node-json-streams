var Parser = require('parser');
var Tokenizer = require('./JsonTokenizer');
var sys = require('sys');
var assert = require('assert');


/**
 * The constuctor for Json parsing streams.
 * @constructor
 * @extends Parser
 */
function ParseStream () {
    // call the parent constructor that needs a tokenizer as parameter
    Parser.call(this, new Tokenizer());

    this._object;
    var self = this;
    this.rootObjectPath = '$'

    /**
     * called when parsing the top level object of the JSON fragment
     * sets the internal reference to what is parsed
     * @param value the value at top level
     * @return JSONPath to the root element
     */
    function initialSet (value) {
        self._object = value;
        self.emitValue(self.rootObjectPath, value);
        return self.rootObjectPath;
    }

    this.initialHandler(this.value(initialSet, '$'));
    // TODO set a default handler which is stricter than `ignore`
    this.defaultHandler(function(token, type, next) {
        if(type !== 'eof') {
            throw new SyntaxError("unexpected token "+token+". expected eof");
        }
    });
}
sys.inherits(ParseStream, Parser);

/**
 * emits values out of the parser according to their JSONPath
 * @param path the path of the value to emit
 * @param value value to emit
 * @return void
 */
ParseStream.prototype.emitValue = function emitValue(path, value) {
    var type = null === value ? null : value.constructor.name;
    //console.log('emitting %s at %s = ', type, path, value);
    // here we should emit these for real

    if('string' == typeof path) this.emit(path, value, path);
    else {
        for (var i = 0; i < path.length; ++i) {
            this.emit(path[i], value, path[i]);
        }
    }
};

ParseStream.prototype.emit = function emit(event, object) {
    var type = null === object ? null : object.constructor.name;
    console.log('emitting with event = %s. type = %s', event, type);
    Parser.prototype.emit.apply(this, arguments);
};

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
    var self = this;
    paths = set(a);
    var index = 0;

    /**
     * a function to set a value to the array being parsed
     * @param value the value to push to the array
     * @return the full JSONPath to this value
     */
    function arraySet (value) {
        a.push(value);
        var newPaths = self.makeArrayPath(paths, index++);
        //console.log('newPaths = ', newPaths);
        self.emitValue(newPaths, value);
        return newPaths;
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
    paths = set(o);
    var self = this;

    /**
     * a function to set a value to its label inside the object being parsed
     * @param label the label to which to set the value
     * @param value the value to set
     * @return the full JSONPath of that value
     */
    function objectSet (label, value) {
        o[label] = value;
        var newPaths = self.makeObjectPath(paths, label);
        self.emitValue(newPaths, value);
        return newPaths;
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
    var self = this;
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
     * @param value the value to set
     * @return the full JSONPath to this value
     */
    function set (value) {
        return objectSet(label, value);
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

/**
 * given a base JSONPath, gives the full JSONPath for the value at this label
 * @param paths base JSONPath
 * @param label the label to get the JSONPath of
 * @return full JSONPath
 */
ParseStream.prototype.makeObjectPath = function makeObjectPath(paths, label) {
    var res = [];
    for (var i = 0; i < paths.length; ++i) {
        res.push(paths[i] + '['+JSON.stringify(label)+']');
        res.push(paths[i] + '[*]');
    }
    return res;
};

/**
 * given a base JSONPath, gives the full JSONPath for the value at this index
 * @param path base JSONPath
 * @param index the index to get the JSONPath of
 * @return full JSONPath
 */
ParseStream.prototype.makeArrayPath = function makeArrayPath(paths, index) {
    var res = [];
    for (var i = 0; i < paths.length; ++i) {
        res.push(paths[i] + '['+ index +']');
        res.push(paths[i] + '[*]');
    }
    return res;
};

ParseStream.prototype._reachedEnd = function _reachedEnd() {
    this.emit('end', this._object);
};

ParseStream.prototype.writable = true;

ParseStream.prototype.destroy = function destroy() {
    // do not emit anymore
};


module.exports = ParseStream;
