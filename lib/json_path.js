// that's the regex we use to split up a
// canonical json path
var regex = /^(\[([^\[\]]*)\])(.*)$/;

exports.expand = function expand(JSONPath) {
    // TODO assert that JSONPath is a canonical URL
    if('' == JSONPath) return [''];
    var res = [];
    if(JSONPath[0] === '$') {
        var res = ['*'];
        expand(JSONPath.substring(1)).map(function(p) {
            res.push('$' + p);
        });
        return res.sort();
    }

    var m = regex.exec(JSONPath);
    if(!m) return [''];

    var sub = expand(m[3]);
    
    sub.forEach(function(e) {
        res.push(m[1] + e);
        res.push('[*]' + e);
    });

    try {
        var key = JSON.parse(m[2]);
        if(typeof key == 'string') {
            sub.forEach(function(p) {
                res.push('.' + key + p);
                res.push('.' + '*' + p);
            })
        }
    } catch(e) {
        // not a parsable key
    }

    return res.sort();
}

