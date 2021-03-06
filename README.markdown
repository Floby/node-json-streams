# Synopsis
Streaming parser and stringifier that act like writable and readable streams

_/!\ This module has been partly rewritten to work with new streams in node >= 0.10 /!\_

## Run tests

[![Build Status](https://secure.travis-ci.org/Floby/node-json-streams.png)](http://travis-ci.org/Floby/node-json-streams)

`npm test`

## ParseStream
You can build a `ParseStream` like so:

``` javascript
var json = require('json-streams');
var p = json.createParseStream();
```

`p` is an instance of the `json.ParseStream` class. `json.ParseStream` is a
writable stream which means you can write or pipe data to it.

``` javascript
var net = require('net');
var c = net.createConnection(1337, 'example.com');
c.pipe(p);
```

At the moment, ParseStream supports only one output event which is the 
`'end'` event. The listener gets called with the fully parsed object as
argument. No data is buffered during the parsing so you can load very big
JSON files. Support for finer events is on the TODO list as well as the
possibility to ignore some objects that are not needed and should be
_"garbage collected"_

``` javascript
p.on('end', function(object) {
    // do something with your object
})
```

## StringifyStream
`StringifyStream` is only a *very* thin wrapper around
[json-streamify](http://github.com/DTrejo/json-streamify). In fact, It is so 
thin that everything is still synchronous. Wrapping this correctly or 
rewriting some parts is at top priority on the TODO list.

# TODO
* improve `StringifyStream` so that it can pause when stringifying an object
and continue later.
* allow users to register on more specific events on `ParseStream`. I'm
thinking of somekind of subscription pattern where one could register for
`o.member`, `o.member.arrayMember[n]` or `o.member.arrayMember[3]`. However
this is *very* non-trivial and should be somewhat retrocompatible with the
current behaviour.

# Bugs / Forks / Patches / Pull requests
You are very welcome to file bugs on the
[github tracker](http://github.com/floby/node-json-streams) and send
patches or pull requests.


# License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2012 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
