
/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var Map = function (filename, mapData, success, error) {
    var _this = this;
    this.filename = filename;
    this.scalingCache = {};
    var generation = "32bit";

    this.getters = {int8: this.GetInt8, uint8: this.GetUint8, uint16: this.GetUint16, float: this.GetFloat32 };
    this.setters = {int8: this.SetInt8, uint8: this.SetUint8, uint16: this.SetUint16, float: this.SetFloat32 };

    if (mapData.byteLength == 163840) { // 16 bit;
        this.mapData = new ArrayBuffer(196608);
        var dest = new DataView(this.mapData);
        var source = new DataView(mapData);
        for (var i = 0; i < this.mapData.byteLength; i++) {            
            if (i < 131072) {
                dest.setUint8(i, source.getUint8(i));
            } else if (i < 163840) {
                dest.setUint8(i, 0);
            } else {                
                dest.setUint8(i, source.getUint8(i - 32768));
            }
        }
        generation = "16bit";
    } else {
        this.mapData = mapData;
    }
    this.dataView = new DataView(this.mapData);
    this.uint16Array = new Uint16Array(this.mapData);
    
    this.EngineCodes = {
        "01": "2.5L SOHC",
        "02": "2.5L SOHC",
        "03": "2.2L SOHC",
        "04": "2.2L SOHC",
        "05": "1.5L SOHC",
        "06": "1.6L SOHC",
        "07": "1.8L SOHC",
        "08": "2.0L SOHC",
        "09": "2.0L DOHC",
        "0A": "2.5L DOHC",
        "0B": "2.0L DOHC Turbo",
        "0C": "2.0L DOHC Turbo",
        "0D": "2.0L DOHC Turbo",
        "0E": "3.0L DOHC",
        "0F": "2.0L DOHC Turbo",
        "10": "2.5L DOHC",
        "11": "2.5L DOHC Turbo",
        "12": "3.0L DOHC",
        "13": "1.5L DOHC",
        "14": "2.0L DOHC Turbo Diesel",
        "15": "3.6L DOHC"
    };

    this.ecuInfo = this.GetEcuInfo(generation);

    var done = function() {
        _this.romid = Definitions.prototype.RomIdToObject(_this.definition.find("romid"));
        _this.romid.filename = _this.filename;
        if (_this.romid.checksummodule == "subarudbw") {
            _this.validChecksum = GetChecksum().Valid(_this);    
        }
    };
    
    _this.LoadDef(_this.ecuInfo.id).done(function() { 
        done();                            
        success(_this);
        }).fail(function() {
            _this.romid = {};
            error(_this);
            });
   
};

Map.prototype.Patch = function(patchData) {
    
    var data = new DataView(patchData);
    var length = patchData.byteLength;
    
    for (var address = 0; address < length; address += 4) {
        this.dataView.setUint32(address, data.getUint32(address, false), false);   
    }
};

Map.prototype.LoadDef = function(filename, def) {
    var deferred;
    if (typeof (def) == "undefined") {
        deferred = $.Deferred();
    } else {
        deferred = def;
    }
    var _this = this;
    _this.LoadDefinition(filename).done(function (xml) {
        _this.definition = $($.parseXML(xml));
        var base = _this.definition.find("include").text();
        if (base == "") {
            deferred.resolve();
        } else {
            if (base.indexOf("BITBASE") != -1) {
                _this.LoadDefinition(base).done(function (xml) {
                    _this.base = $($.parseXML(xml));    
                    deferred.resolve();
                }).fail(function() { deferred.reject();});
            } else {
                _this.LoadDef(base, deferred);
            }
        }
    }).fail(function() { deferred.reject();});
    
    return deferred.promise();
};

Map.prototype.GetInt8 = function(address) {
    return  this.dataView.getInt8(address, false);
};

Map.prototype.GetUint16 = function(address) {
    //return this.dataView.getUint16(address, false);
    var x = this.uint16Array[address/2];
    return (x & 0xFF00) >> 8 | (x & 0xFF) << 8;
};

Map.prototype.GetUint8 = function(address) {
    return this.dataView.getUint8(address, false);
};

Map.prototype.GetInt16 = function (address) {
    return this.dataView.getInt16(address, false);
};

Map.prototype.GetUint32 = function(address) {
    if (address+4 > this.mapData.byteLength) {
        return 0;
    }
    return this.dataView.getUint32(address, false);
};

Map.prototype.GetInt32 = function(address) {
    return this.dataView.getInt32(address, false);
};

Map.prototype.GetFloat32 = function(address) {
    return this.dataView.getFloat32(address, false);
};

Map.prototype.SetInt8 = function(address, value) {
    return this.dataView.setInt8(address, value, false);
};

Map.prototype.SetUint16 = function(address, value) {
    return this.dataView.setUint16(address, value, false);
};

Map.prototype.SetUint8 = function(address, value) {    
    return this.dataView.setUint8(address, Math.round(value), false);
}
;
Map.prototype.SetFloat32 = function(address, value) {
    return this.dataView.setFloat32(address, value, false);
};

Map.prototype.SetUint32 = function(address, value) {
    return this.dataView.setUint32(address, value, false);
};

Map.prototype.GetEcuInfo = function(generation) {
    var address = 0;
    var size = this.GetMapSize();
    var state = 0;
    var code;
    var a = FromHex("A2"), b = FromHex("10");
    var id = "";

    for (var i = 0; i < size; ++i) {
        var byte = this.GetMapByte(address);
        switch (state) {
            case 0:
                if (byte == a) {
                    state++;
                }
                break;
            case 1:
                if (byte == b) {
                    state++;
                } else {
                    state = 0;
                }
                break;
            case 2:                
                code = this.EngineCodes[sprintf("%02X", byte)];
                if (code === undefined) {
                    state = 0;
                }
                break;
        }
        if (code !== undefined) {
            for (var c = 0; c < 5; c++) {
                id += sprintf("%02X", this.GetMapByte(++address));
            }
            break;
        }
        address++;
    }

    return { code: code, id: id, generation: generation };
    
};

Map.prototype.ResetScalingCache = function() {
    this.scalingCache = {};
};

Map.prototype.GetMapValue = function (map, address, scaling) {
    var getter = this.getters[scaling.storagetype];

    if (getter === undefined) {
        gui.error("Map.GetMapValue: Unknown storage type " + scaling.storagetype);
        return 0xDEADBEEF;
    } else {
        var x = $.proxy(getter, this)(address);
        return eval(scaling.to);
    }
};

Map.prototype.GetMapSize = function () {
    return this.mapData.byteLength;
};

Map.prototype.GetMapByte = function (address) {    
    return this.dataView.getUint8(address, false);  
};

Map.prototype.SetMapValue = function (map, address, value, scaling) {
    
    var setter = this.setters[scaling.storagetype];
    
    if (setter === undefined) {
        throw "Unknown storage type " + scaling.storagetype;
    }

    var x = parseFloat(value);
    x = x > scaling.max ? scaling.max : x;
    x = x < scaling.min ? scaling.min : x;
    var raw = eval(scaling.from);
    $.proxy(setter, this)(address, raw);
};

Map.prototype.IncrementAddress = function (address, scaling) {
    switch (scaling.storagetype) {
        case "uint8":
        case "int8":
            address++;
            break;
        case "uint16":
        case "int16":
            address+=2;
            break;
        case "uint32":
        case "int32":
        case "float":
            address+=4;
            break;
        default:
            throw "Unknown storage type";
    }

    return address;
};

Map.prototype.LoadDefinition = function (filename) {
    var deferred = $.Deferred();
    var _this = this;
    _global_definitions.GetDefinition(filename).done(function (x) {        
        deferred.resolve(x);
    }).fail(function(e) {
        deferred.reject(e);
    });
    
    return deferred.promise();
};

Map.prototype.SaveDefinition = function () {
    var deferred = $.Deferred();
    var _this = this;
    var filename = _this.ecuInfo.id;
    var content = (new XMLSerializer()).serializeToString(this.definition.find("rom").get(0));
    _global_definitions.SaveDefinition(filename, content).done(function (x) {        
        deferred.resolve();
    }).fail(function() {
        deferred.reject();
    });
    
    return deferred.promise();
};

Map.prototype.GetAttribute = function (defs, name) {
    for (var i in defs) {        
        var result = defs[i].attr(name);
        if (typeof (result) != "undefined") {
            return result;
        }
    }

    return undefined;
};

Map.prototype.GetChild = function (defs, name) {
    for (var i in defs) {
        var result = defs[i].find(name);
        if (result.length > 0) {
            return result;
        }
    }

    return undefined;
};

Map.prototype.LoadScalingFromDefs = function (defs, name) {
    var scaling = Map.prototype.GetChild(defs, "scaling[name='" + name + "']");
   
    return {
        name: name,
        to: scaling.attr("toexpr"),
        from: scaling.attr("frexpr"),
        min: parseFloat(scaling.attr("min")),
        max: parseFloat(scaling.attr("max")),
        format: scaling.attr("format"),
        storagetype: scaling.attr("storagetype"),
        units: scaling.attr("units")
    };
};

Map.prototype.MergeToBase = function(tableName, baseName) {
    var b, d;
    var base = this.base.find("table[name='" + baseName + "']");
    var def = this.definition.find("table[name='" + tableName + "']"); 
    var axis = base.find("table");
    
    def.attr("name", base.attr("name"));
    def.attr("category", base.attr("category"));
    def.attr("scaling", base.attr("scaling"));
    
    axis.each(function(e) {
       b = $(axis[e]);
       d = def.find("table[type='"+b.attr("type")+"']");
       d.attr("name", b.attr("name"));
       d.attr("scaling", b.attr("scaling"));
    });
};

Map.prototype.UpdateTableName = function (tableName, name) {
    var table = this.definition.find("table[name='" + tableName + "']");
    table.attr("name", name);   
};

Map.prototype.UpdateCategoryName = function (tableName, category) {
    var table = this.definition.find("table[name='" + tableName + "']");
    table.attr("category", category);   
};

Map.prototype.UpdateScaling = function (tableName, scaling) {
    var table = this.definition.find("table[name='" + tableName + "']");
    table.attr("scaling", scaling);
};

Map.prototype.UpdateAxisScaling = function (tableName, axisName, scaling) {
     var table = this.definition.find("table[name='" + tableName + "'] table[name='"+axisName+"']");
    table.attr("scaling", scaling);
};

Map.prototype.UnassociatedTableList = function () {
    var base = this.base.find("rom>table");
    var def = this.definition.find("rom>table");
    var bases = {};
    var defs = {};
    var name, results = [];
    
    def.each(function() {
        defs[$(this).attr("name")] = true;
    });
    
    base.each(function() {
       name = $(this).attr("name");
       if (defs[name] === undefined) {
           results.push(name);
       }
    });
    
    return results;
};

Map.prototype.ScalingList = function () {
    var defs = [this.base, this.definition];
    
    var name, results = [];
    
    _.filter(Map.prototype.GetChild(defs, "scaling"), function(e) { 
        name = $(e).attr("name");
        if (name.indexOf("(P") !== 0) {
            results.push(name);
        }
    });
    
    return results;
    
};

Map.prototype.LoadScaling = function (name) {
    var scaling = this.scalingCache[name];

    if (scaling === undefined) {
        var defs = [this.base, this.definition];
        scaling = this.LoadScalingFromDefs(defs, name);   
        this.scalingCache[name] = scaling;
    }

    return scaling;
};

Map.prototype.LoadStaticAxis = function (defs, name, map) {
    var base = this.GetChild(defs, "table[type='" + name + " Axis']");
    var def = this.GetChild(defs, "table[name='" + base.attr("name") + "']");
    defs = [base, def];

    var axis = {
        name: this.GetAttribute(defs, "name"),
        type: this.GetAttribute(defs, "type"),        
        elements: parseInt(this.GetAttribute(defs, "elements"), 10),        
    };


    var data = [];

    base.find("data").each(function () {
        data.push({ display: $(this).text() });
    });
    
    axis.data = data;

    return axis;
};

Map.prototype.LoadAxis = function (defs, name, map) {
    var base = this.GetChild(defs, "table[type='" + name + " Axis']");
    var _name = base.attr("name");

    var _defs;
    if (_name !== undefined) {
        _defs = this.GetChild(defs, "table[name='" + name + "']");
        if (_defs === undefined) {
            _defs = [this.GetChild(defs, "table[name='" + _name + "']"), base];
        } else {
            _defs = [_defs, base];
        }
    } else {
        _defs = [this.GetChild(defs, "table"), base];
    }

    
    defs = _defs;

    var axis = {
        name: this.GetAttribute(defs, "name"),
        type: this.GetAttribute(defs, "type"),
        address: this.GetAttribute(defs, "address"),
        elements: parseInt(this.GetAttribute(defs, "elements"), 10),
        scaling: this.LoadScaling(this.GetAttribute(defs, "scaling")),        
    };


    var getter = this.getters[axis.scaling.storagetype];

    if (getter === undefined) {
        throw "Unknown storage type " + scaling.storagetype;
    }


    var data = new Array(axis.elements);
    var address = FromHex(axis.address);
    for (var _x = 0; _x < axis.elements; ++_x) {

        var x = $.proxy(getter, this)(address);
        x = eval(axis.scaling.to);
        data[_x] = { value: x, display: sprintf(axis.scaling.format, x) };
        address = this.IncrementAddress(address, axis.scaling);
    }

    axis.data = data;

    return axis;
};

Map.prototype.IncrementVersion = function() {
    var filename = this.filename;
    var part = filename.split(".hex")[0];
    var name = filename.slice(0, part.lastIndexOf("v")+1);
    var version = parseInt(part.slice(part.split(".hex")[0].lastIndexOf("v")+1), 10) + 1;
    this.filename = name + version + ".hex";
};

Map.prototype.Save = function () {
    var c = GetChecksum();
    c.WriteChecksum(this);
    var b = new Blob([this.mapData]);
    this.IncrementVersion();
    saveAs(b, this.filename);
};

Map.prototype.DownloadDefinition = function () {
    var b = new Blob([(new XMLSerializer()).serializeToString(this.definition.find("rom").get(0))]);
    saveAs(b, this.romid.xmlid + ".xml");
};

Map.prototype.SaveToGdfs = function (name) {
    var deferred = $.Deferred();
    var _this = this;
    var c = GetChecksum();
    c.WriteChecksum(this);
    new GDFileSystem().done(function() {
        _this.IncrementVersion();
        this.InsertFile(Options.googleDriveFolderId, _this.filename,  new Blob([_this.mapData])).done(function() {
           deferred.resolve(_this.filename);
        });
    });
    
    return deferred.promise();
};

Map.prototype.TableList = function () {
    var tables = this.definition.find("rom>table");
    var list = [];
    var _this = this;

    tables.each(function () {
        var table = $(this);
        var name = table.attr("name");
        var baseDef = _this.base.find("table[name='" + name + "']");
        if (baseDef.length > 0) {
            var defs = [table, baseDef];
            list.push({ name: name, type: baseDef.attr("type"), category: _this.GetAttribute(defs, "category"), address: table.attr("address"), scaling: _this.GetAttribute(defs, "scaling") });
        } else {
            list.push({ name: name, type: table.attr("type"), category: table.attr("category"), address: table.attr("address"), scaling: table.attr("scaling") });
        }
    });

    return list;
};

Map.prototype.LoadTable1D = function (defs, name) {
        
    var hexAddress = this.GetAttribute(defs, "address");
    var scaling = this.LoadScaling(this.GetAttribute(defs, "scaling"));

    var address = FromHex(hexAddress);
    var type = this.GetAttribute(defs, "type");
    var category = this.GetAttribute(defs, "category");
    
    var value = this.GetMapValue(this.mapData, address, scaling);
    var display = sprintf(scaling.format, value);
    var data = { value: value, display: display };

    var description = this.GetChild(defs, "description");

    return {
        address: hexAddress,
        scaling: scaling,
        category: category,
        description: description !== undefined ? description.text() : "No description available",
        type: type,
        name: name,        
        data: data
    };
};

Map.prototype.LoadTable2D = function (defs, name) {
    var staticY = this.GetChild(defs, "table [type='Static Y Axis']");
    var staticX = this.GetChild(defs, "table [type='Static X Axis']");
    var axis = this.GetChild(defs, "table [type$='Axis']");
    var category = this.GetAttribute(defs, "category");
    
    var yAxis;

    if (staticY) {
        yAxis = this.LoadStaticAxis(defs, "Static Y", this.mapData);
    } else if (staticX) {
        yAxis = this.LoadStaticAxis(defs, "Static X", this.mapData);
    } else {
        yAxis = this.LoadAxis(defs, axis.attr("type").replace(" Axis", ""), this.mapData);
    }

    var data = [];

    var hexAddress = this.GetAttribute(defs, "address");
    var scaling = this.LoadScaling(this.GetAttribute(defs, "scaling"));

    var address = FromHex(hexAddress);
    var type = this.GetAttribute(defs, "type");

    for (var y = 0; y < yAxis.elements; y++) {
        var value = this.GetMapValue(this.mapData, address, scaling);
        address = this.IncrementAddress(address, scaling);
        var display = sprintf(scaling.format, value);
        data.push({ value: value, display: display });
    }

    return {
        address: hexAddress,        
        scaling: scaling,
        description: this.GetChild(defs, "description") !== undefined ? this.GetChild(defs, "description").text() : "No description available",
        type: type,
        category: category,
        name: name,        
        yAxis: yAxis,
        data: data
    };
};

Map.prototype.LoadTable3D = function (defs, name) {
    var x, y;
    var xAxis = this.LoadAxis(defs, "X", this.mapData);
    var yAxis = this.LoadAxis(defs, "Y", this.mapData);
    

    var data = CreateArray(yAxis.elements, xAxis.elements);

    var hexAddress = this.GetAttribute(defs, "address");
    var scaling = this.LoadScaling(this.GetAttribute(defs, "scaling"));
    var type = this.GetAttribute(defs, "type");
    var address = FromHex(hexAddress);
    var category = this.GetAttribute(defs, "category");
    var add = this.GetAttribute(defs, "add");
    var div2d = this.GetAttribute(defs, "div2d");
    var throttle = this.GetAttribute(defs, "throttle");
    var addTable, div2dTable, throttleLookupTable;

    if (add !== undefined) {
        addTable = this.LoadTable(add);
    }
    
      if (div2d !== undefined) {
        div2dTable = this.LoadTable(div2d);
    }
    
    if (throttle !== undefined) {
        throttleLookupTable = this.LoadTable(throttle);
    }

    for (y in data) {
        for (x = 0; x < xAxis.elements; ++x) {
            var value = this.GetMapValue(this.mapData, address, scaling);
            address = this.IncrementAddress(address, scaling);
            var display = sprintf(scaling.format, value);
            data[y][x] = { value: value, display: display };
        }
    }

    var description = this.GetChild(defs, "description");
    if (description !== undefined && description.length > 0) {
        description = description.text();
    } else {
        description = "No description available";
    }

    var table = {
        address: hexAddress,
        scaling: scaling,
        description: description,
        category: category,
        type: type,
        add: add,
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        data: data
    };
    
    if (addTable !== undefined) {
        
        for (x = 0; x < table.xAxis.elements;  x ++) {
            for (y = 0; y < table.yAxis.elements; y++) {
                table.data[y][x].value += this.Get3D(addTable, table.xAxis.data[x].value, table.yAxis.data[y].value);
                table.data[y][x].display = sprintf(table.scaling.format, table.data[y][x].value);
            }
        }
    }
    
    if (div2dTable !== undefined) {
        for (x = 0; x < table.xAxis.elements;  x ++) {
            for (y = 0; y < table.yAxis.elements; y++) {
                table.data[y][x].value /= this.Get2D(div2dTable, div2dTable.yAxis.data[x].value);
                table.data[y][x].display = sprintf(table.scaling.format, table.data[y][x].value);
            }
        }
    }
    
    if (throttleLookupTable !== undefined) {
        for (x = 0; x < table.xAxis.elements;  x ++) {
            for (y = 0; y < table.yAxis.elements; y++) {
                var newX = table.data[y][x];
                table.data[y][x].value = this.Get3D(throttleLookupTable, newX.value, table.yAxis.data[y].value);
                table.data[y][x].display = sprintf(throttleLookupTable.scaling.format, table.data[y][x].value);
            }
        }
    }
    
    return table;
};

Map.prototype.GetLowerIndex = function (table, axis, x) {
  
    var result;
    for (var i in axis.data) {
        if (i > 0 && x <= axis.data[i].value && x >= axis.data[i-1].value) {
            result = i-1;
            break;
        }
    }

    if (result === undefined) {
        if (x < axis.data[0].value) {
            result = 0;
        } else {
            result = axis.data.length - 1;
        }
    }

    return result;
};

Map.prototype.GetUpperIndex = function (table, axis, x) {
  
    var result;
    for (var i in axis.data) {
        if (i > 0 && x <= axis.data[i].value && x >= axis.data[i - 1].value) {
            result = i;
            break;
        }
    }

    if (result === undefined) {
        if (x < axis.data[0].value) {
            result = 0;
        } else {
            result = axis.data.length - 1;
        }
    }

    return result;
};

function lerp(a, b, c) {
    var x = (b - a);
    var y = (c - a);
    if (x == 0) {
        return 0.0;
    }
    if (y == 0) {
        return 1.0;
    }
    return x / y;
}

Map.prototype.Get2D = function (table, x) {
    var _x = x;
    var axis;
    if (table.xAxis === undefined) {
        axis = table.yAxis;
    } else {
        axis = table.xAxis;
    }
    var xli = this.GetLowerIndex(table, axis, x);
    var xui = this.GetUpperIndex(table, axis, x);

    var xla = axis.data[xli].value;
    var xua = axis.data[xui].value;

    var l = table.data[xli].value;
    var r = table.data[xui].value;

    var x_factor = lerp(xla, x, xua);

    var _top =  l + ((r - l) * x_factor);

    return _top;
};

Map.prototype.Get3D = function (table, x, y) {
    var _x = x;
    var _y = y;

    var xli = this.GetLowerIndex(table, table.xAxis, x);
    var xui = this.GetUpperIndex(table, table.xAxis, x);

    var xla = table.xAxis.data[xli].value;
    var xua = table.xAxis.data[xui].value;

    var yli = this.GetLowerIndex(table, table.yAxis, y);
    var yui = this.GetUpperIndex(table, table.yAxis, y);

    var yla = table.yAxis.data[yli].value;
    var yua = table.yAxis.data[yui].value;

    var tl = table.data[yli][xli].value;
    var tr = table.data[yli][xui].value;
    var bl = table.data[yui][xli].value;
    var br = table.data[yui][xui].value;

    var x_factor = lerp(xla, x, xua);
    var y_factor = lerp(yla, y, yua);

    var _top =  tl + ((tr - tl) * x_factor);
    var _bottom = bl + ((br - bl) * x_factor);

    var _val = _top + ((_bottom - _top) * y_factor);

    return _val;
};

Map.prototype.UpdateAxisValue = function(axis, index, value) {
    var setter = this.setters[axis.scaling.storagetype];

    if (setter === undefined) {
        throw "Unknown storage type " + scaling.storagetype;
    }

    var address = FromHex(axis.address);
    for (var _x = 0; _x < axis.elements; ++_x) {
        if (_x == index) {
            var x = value;
            eval(axis.scaling.from);
            $.proxy(setter, this)(address, x);
        }
            
        address = this.IncrementAddress(address, axis.scaling);
    }
}

Map.prototype.UpdateTable3D = function (table, x, y, value) {
    var address = FromHex(table.address);
    for (var _y in table.yAxis.data) {
        for (var _x in table.xAxis.data) {
            if (_x == x && _y == y) {
                this.SetMapValue(this.mapData, address, value, table.scaling);
                return sprintf(table.scaling.format, this.GetMapValue(this.mapData, address, table.scaling));
            }
            address = this.IncrementAddress(address, table.scaling);
        }
    }
};

Map.prototype.GetTable3D = function (table, x, y) {
    var address = FromHex(table.address);
    for (var _y in table.yAxis.data) {
        for (var _x in table.xAxis.data) {
            if (_x == x && _y == y) {
                return sprintf(table.scaling.format, this.GetMapValue(this.mapData, address, table.scaling));
            }
            address = this.IncrementAddress(address, table.scaling);
        }
    }
};

Map.prototype.UpdateTable2D = function (table, y, value) {
    var address = FromHex(table.address);
    for (var _y in table.yAxis.data) {        
        if (_y == y) {
            this.SetMapValue(this.mapData, address, value, table.scaling);
            return sprintf(table.scaling.format, this.GetMapValue(this.mapData, address, table.scaling));
        }
        address = this.IncrementAddress(address, table.scaling);        
    }
};

Map.prototype.UpdateTable1D = function (table, value) {
    var address = FromHex(table.address);            
    this.SetMapValue(this.mapData, address, value, table.scaling);
    return sprintf(table.scaling.format, this.GetMapValue(this.mapData, address, table.scaling));   
};

Map.prototype.LoadTable = function (name) {
    var base = this.base.find("table[name='" + name + "']");
    var defs = [this.definition.find("table[name='" + name + "']"), base];
    
    var type = this.GetAttribute(defs, "type");
   
    switch (type) {
        case "3D":
            return this.LoadTable3D(defs, name);
        case "2D":
            return this.LoadTable2D(defs, name);
        case "1D":
            return this.LoadTable1D(defs, name);
    }
};