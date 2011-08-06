#!/usr/bin/env node

var size = 0;


function write(data) {
    process.stdout.write(data);
}


function noop() {}
function random(min, max) {
    var res = Math.random();
    res = res * (max - min);
    res = Math.floor(res);
    res += min;
    return res;
}
function writeValue() {
    var type = random(0,8);
    switch(type) {
        case 0:
            writeString();
            break;
        case 1:
            writeNumber();
            break;
        case 2:
            writeBoolean();
            break;
        case 3:
            writeNull();
            break;
        case 4:
        case 5:
            writeArray();
            break;
        case 6:
        case 7:
            writeObject();
            break;
        default:
            throw new Error('hum...');
    }
}

function writeString () {
    var length = random(5, 100);
    res = ""
    for(var i=0 ; i<length ; ++i) {
        var c = random(65,122);
        if (Math.random() > 0.85) c = 32;
        c = String.fromCharCode(c);
        res += c;
    }
    res = JSON.stringify(res);
    write(res);
}

function writeNumber(float) {
    var length = random(1,8);
    var res = ""
    for(var i=0; i<length ; ++i) {
        res += random(0,10);
    }
    write(res);
    if(float && Math.random() > 0.65) {
        write('.');
        writeNumber();
    }

}

function writeNull () {
    write('null');
}

function writeBoolean () {
    if(Math.random() > 0.5) {
        write("true");
    }
    else {
        write('false');
    }
}

function writeArray () {
    var length = random(0, 100);
    write('[');
    if(length) {
        writeValue();
    }
    for(var i=0; i<length ; ++i) {
        write(',');
        writeValue();
    }
    write(']');
}

function writeObject() {
    write('{');
    var length = random(0,100);
    if(length) {
        writeLabeledValue();
    }
    for(var i = 0 ; i<length ; ++i) {
        write(',');
        writeLabeledValue();
    }
    write('}');
}

function writeLabeledValue() {
    writeString();
    write(':');
    writeValue();
}

process.nextTick(function() {
    writeValue();
})
