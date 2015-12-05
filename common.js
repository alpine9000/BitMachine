/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var common = {};

common.unique = function (array) {
    var results = [];
    var dict = {};
    for (var i in array) {
        dict[array[i]] = true;
    }
    for (var y in dict) {
        results.push(y);
    }
    return results;
};

common.map = function (list, functor) {
    var l = [];


    if (list.each !== undefined) {
        list.each(function () {
            l.push(functor($(this)));
        });
    } else if (list.forEach !== undefined) {
        list.forEach(function (e) {
            l.push(functor(e));
        });
    } else {
        for (var k in list) {
            l.push(functor(k, list[k]));
        }
    }
    return l;
};

common.reduce = function (array, functor) {
    var results = [];
    for (var a in array) {
        if (functor(array[a])) {
            results.push(array[a]);
        }
    }
    return results;
};

$.fn.datalist = function (data) {
    return common.map(this, function (x) { return x.data(data); });
};


$.fn.attrlist = function (attr) {
    return rms.map(this, function (x) { return x.attr(attr); });
};

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

common.toString = function (buf) {
    var deferred = $.Deferred();
    var b = new Blob([buf]);
    
    var f = new FileReader();
    f.onload = function(e) {
        deferred.resolve(e.target.result);
    }
    f.onerror = function(e) {
        deferred.reject(e);
    }
    f.readAsText(b);
    return deferred.promise();
};

common.multiDeferred = function(items, functor) {
    var main = $.Deferred();
    var deferredList = [];
    for (var x in items) {  
        var deferred = $.Deferred();
        deferred.done(function() {
            if (common.reduce(deferredList, function(f) { return f.state() != "resolved"}).length === 0) {
                main.resolve();
            }
        });
        deferredList.push(deferred);
    }
    
    for (var x in items) {  
            (function (x) {
               functor(items[x]).done(function() { deferredList[x].resolve()});
            })(x);
        }
    
    return main.promise();
}

function CreateArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = CreateArray.apply(this, args);
    }

    return arr;
}

function FromHex(hex) {
    return parseInt(hex, 16);
}

function ToHex(num) {
    return num.toString(16);
}

function FullHex(num) {
    return ("00000000" + ToHex(num)).substr(-8)
}

function SetBit(mask, bit) {
    return mask |= (1 << bit);
}

function ClearBit(mask, bit) {
    return mask &= ~(1 << bit);
}

function BitSet(mask, bit) {
    return (mask & (1 << bit)) ? 1 : 0;
}

/*function copy(buffer)
{
    var bytes = new Uint8Array(buffer);
    var output = new ArrayBuffer(buffer.byteLength);
    var outputBytes = new Uint8Array(output);
    for (var i = 0; i < bytes.length; i++)
        outputBytes[i] = bytes[i];
    return output;
}*/

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
