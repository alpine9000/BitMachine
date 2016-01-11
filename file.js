/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function FileSystem() {
    var _this = this;
    var deferred = new $.Deferred();

    var _this = this;
    this.filer = new Filer();
    this.filer.init({ persistent: false, size: 1024 * 1024 }, function () {
        deferred.resolveWith(_this);
    }, function() {
        console.log("FileSystem failed to initialise");
        deferred.rejectWith(_this);
    });

    return deferred.promise();
}

FileSystem.prototype.rename = function (src, dest) {
    GetGui().PushFileSystemOperation("local");
    var deferred = new $.Deferred();
    var _this = this;

    var bits = dest.split("/");
    var destFilename = _.last(bits);
    var destFolder = bits.slice(0, bits.length-1).join("/");
    
    this.filer.mv(src, destFolder, destFilename, function (fileEntry) {        
        deferred.resolveWith(_this, [fileEntry]);        
        GetGui().PopFileSystemOperation("local");
    }, function(e) {
        console.log("FileSystem.mv: Error[" + e.name +"] " + src + " " + dest);
        deferred.rejectWith(_this, [e]);        
        GetGui().PopFileSystemOperation("local");
    });

    return deferred.promise();
}

FileSystem.prototype.save = function (path, data) {
    GetGui().PushFileSystemOperation("local");
    var deferred = new $.Deferred();
    var _this = this;

    this.filer.write(path, { data: data }, function (fileEntry, fileWriter) {        
        deferred.resolveWith(_this, [fileEntry, fileWriter]);        
        GetGui().PopFileSystemOperation("local");
    }, function(e) {
        console.log("FileSystem.save: Error[" + e.name +"] " + path);
        deferred.rejectWith(_this, [path, e]);        
        GetGui().PopFileSystemOperation("local");
    });

    return deferred.promise();
};

FileSystem.prototype.stat = function (path) {
    GetGui().PushFileSystemOperation("local");
    var deferred = $.Deferred();
    var _this = this;
    
    this.filer.open(path, function(file) {
        GetGui().PopFileSystemOperation("local");
        deferred.resolveWith(_this, [file]);
        
    } , function() {
        GetGui().PopFileSystemOperation("local");
        deferred.reject();
    });
    return deferred.promise(); 
};

FileSystem.prototype.ls = function (path) {
    this.filer.ls(path, function (e) {
        for (var i in e) {
            console.log(e[i].name);
        }
    });
};

FileSystem.prototype.list = function (path, functor) {
    var _this = this;
    var deferred = $.Deferred();
    
    this.filer.ls(path, function (e) {
        var num = e.length;
        for (var i in e) {
            if (functor !== undefined) {
                functor(e[i], i == num-1);
            }
            e[i].title = e[i].name;
        }
        deferred.resolveWith(_this, [e]);
    }, function(e) {
        deferred.rejectWith(_this);
    });
    
    return deferred.promise();
};


FileSystem.prototype.rm = function (path) {
    var deferred = $.Deferred();
    var _this = this;
    
    //console.log("FileSystem.rm: " + path);
    
    //this.filer.open(path, function() {
        _this.filer.rm(path, function() {
            deferred.resolve();
        }, function() {
            deferred.reject();
        });
    //}, function() {
     //   deferred.reject();
//    });
        
    return deferred.promise();
};

FileSystem.prototype.mkdir = function (path) {
    var deferred = $.Deferred();
    this.filer.mkdir(path, false, function() {
        deferred.resolveWith(this);
    });
    return deferred.promise();
};

FileSystem.prototype._read = function (path, text) {
    GetGui().PushFileSystemOperation("local");
    var deferred = $.Deferred();


    var _this = this;
    _this.filer.open(path, function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolveWith(this, [e.target.result]);
            GetGui().PopFileSystemOperation("local");
        };
        reader.onerror = function (e) {
            GetGui().PopFileSystemOperation("local");
        };
        if (text) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }, function (e) {
        deferred.rejectWith(this, [e]);
        GetGui().PopFileSystemOperation("local");
    });

    return deferred.promise();
};


FileSystem.prototype.read = function (path, text) {  
    var deferred = $.Deferred();    
    var _this = this;

    function success(fileData) {
	/*       	if (fileData.byteLength == 64) {
	    var dv = new DataView(fileData);
	    if (String.fromCharCode(dv.getUint8(0)) == "#" &&
		String.fromCharCode(dv.getUint8(1)) == "!" &&
		String.fromCharCode(dv.getUint8(2)) == "!" &&
		String.fromCharCode(dv.getUint8(3)) == "#") {
		path = String.fromCharCode.apply(null, new Uint8Array(fileData)).slice(4).trim();            
		doread();
	    } else {
		deferred.resolveWith(this, [fileData]);	    
	    }
	} else {
	    deferred.resolveWith(this, [fileData]);	    
	    }*/
	deferred.resolveWith(this, [fileData]);	    
    } 

    function doread() {
        _this._read(path, text).done(function (fileData) {
            success(fileData);
        }).fail(function (e) {
            deferred.rejectWith(this, [e]);
        });
    }

    doread();

    return deferred.promise();
};
