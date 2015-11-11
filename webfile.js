/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function WebFileSystem() {
    var _this = this;
    var deferred = new $.Deferred();

    deferred.resolveWith(_this);
    return deferred.promise();
}

WebFileSystem.prototype.stat = function (path) {
    GetGui().PushFileSystemOperation("web");
    var deferred = $.Deferred();
    /*var _this = this;
    
    this.filer.open(path, function(file) {
        GetGui().PopFileSystemOperation("local");
        deferred.resolveWith(_this, [file]);
        
    } , function() {
        GetGui().PopFileSystemOperation("local");
        deferred.reject();
    });*/
    
    GetGui().PopFileSystemOperation("web");
    deferred.reject();
    return deferred.promise(); 
};

WebFileSystem.prototype.read = function (path, text) {
    GetGui().PushFileSystemOperation("web");
    var deferred = $.Deferred();
    var _this = this;
    
    if (path[0] == "/") {
        path = path.replace("/", "");
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'arraybuffer';
     
    xhr.onreadystatechange = function (oEvent) {  
        if (xhr.readyState === 4) {  
            if (xhr.status !== 200) {  
                deferred.rejectWith(this);           
                GetGui().PopFileSystemOperation("web");        
            }  
        }  
    }; 
    xhr.onload = function(e) {
      // response is unsigned 8 bit integer
     // var responseArray = new Uint8Array(this.response); 
      deferred.resolveWith(this, [this.response]);           
      GetGui().PopFileSystemOperation("web");
    };
     
    xhr.send();
    
  /*  $.ajax({
        url:path,
        dataType: "arraybuffer"
    }).done(function(data) {
        deferred.resolveWith(this, [data]);           
        GetGui().PopFileSystemOperation("web");
    }).fail(function(e) {
        deferred.rejectWith(this, [e]);
        GetGui().PopFileSystemOperation("web");
    });*/
    
    return deferred.promise();
};