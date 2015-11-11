/*
2D table (uint16 data)
Axis Length 0009
Data Type   0800
Axis Addr   000c07ac
Data Addr   000c07d0
Multiplier  3b800000
Additive    c2480000

3D Table    (uint16 data no x or +)
Y-axis Length 0010
X-axis Length 0005
Y-axis Addr   000cd6b8
X-axis Addr   000cd6f8
Data Addr     000cd70c
Data Type     00000000
*/

/*

Find undefined maps 16x16
_.filter(_.filter(GetMapEdit().categories["Undefined Tables"], function(t) { return t.type == "3D"}), function(t) { var xx = GetMapEdit().map.LoadTable(t.name); return xx.xAxis.elements == 16 && xx.yAxis.elements == 16});

*/

MapFind = function (map) {
    this.map = map;

    this.sizeMin = 2;
    this.sizeMax = 255;
    
    this.addressMax = map.mapData.byteLength - 28;
    this.addressMin = 8 * 1024;

    this.floatScaling = Map.prototype.LoadScalingFromDefs([this.DefFromXml('<scaling name="float" units="%" toexpr="x" frexpr="x" format="%.2f" min="0" max="105.00" inc=".1" storagetype="float" endian="big" />')], "float");
    this.uint8Scaling = Map.prototype.LoadScalingFromDefs([this.DefFromXml('<scaling name="uint8" units="%" toexpr="x" frexpr="x" format="%.2f" min="0" max="105.00" inc=".1" storagetype="uint8" endian="big" />')], "uint8");
    this.uint8Scaling = Map.prototype.LoadScalingFromDefs([this.DefFromXml('<scaling name="int8" units="%" toexpr="x" frexpr="x" format="%.2f" min="0" max="105.00" inc=".1" storagetype="uint8" endian="big" />')], "int8");
    this.uint16Scaling = Map.prototype.LoadScalingFromDefs([this.DefFromXml('<scaling name="uint16" units="%" toexpr="x" frexpr="x" format="%.2f" min="0" max="105.00" inc=".1" storagetype="uint16" endian="big" />')], "uint16");
    this.int16Scaling = Map.prototype.LoadScalingFromDefs([this.DefFromXml('<scaling name="int16" units="%" toexpr="x" frexpr="x" format="%.2f" min="0" max="105.00" inc=".1" storagetype="int16" endian="big" />')], "int16");

    this.TableTypes = {
        0: "Float32", //"00000000"
        67108864: "UInt8", //"04000000"
        134217728: "UInt16", //"08000000"
        201326592: "Int8", //0C000000
        10000000: "Int16" //10000000
    };
    
    this.TableTypes2D = {
        0x00: "Float32",
        0x0400: "UInt8",
        0x0800: "UInt16",
        0x0C00: "Int8",
        0x1000: "Int16"
    }
    
    this.TableSizes2D = {
        0x0000: 4,
        0x0400: 1,
        0x0800: 2,
        0x0C00: 1,
        0x1000: 2 
    };

    
    this.TableSizes = {
        0: 4, //"00000000"
        67108864: 1, //"04000000"
        134217728: 2, //"08000000"
        201326592: 1, //0C000000
        10000000: 2 //10000000
    };

    this.TableScaling = {
        0: this.floatScaling, //"00000000"
        67108864: this.uint8Scaling, //"04000000"
        134217728: this.uint16Scaling, //"08000000"
        201326592: this.uint8Scaling, //0C000000
        10000000: this.uint8Scaling //10000000
    };
    
    this.TableScaling2D = {
        0x0000: this.floatScaling, //"00000000"
        0x0400: this.uint8Scaling, //"04000000"
        0x0800: this.uint16Scaling, //"08000000"
        0x0C00: this.uint8Scaling, //0C000000
        0x1000: this.uint8Scaling //10000000
    };
};

MapFind.prototype.TableDef3D = function (result) {
    var source = $("#3d-table-def-template").html();
    var template = Handlebars.compile(source);
    return template(result);
};

MapFind.prototype.TableDef2D = function (result) {
    var source = $("#2d-table-def-template").html();
    var template = Handlebars.compile(source);
    return template(result);
};

MapFind.prototype.DefFromXml = function (xml) {
    return $($.parseXML(xml));
};

MapFind.prototype.ValidSize = function (size) {
    return size >= this.sizeMin && size <= this.sizeMax;      
};

MapFind.prototype.Valid2DSize = function (size) {
    return size >= 1 && size <= this.sizeMax;      
};

MapFind.prototype.ValidAddress = function (address) {
    return address >= this.addressMin && address <= this.addressMax;
};

MapFind.prototype.Overlaps = function (a, b) {

    for (var i in b) {
        if (a.address > b[i].address && a.address < b[i].end) {
            return false;
        }
        if (a.end > b[i].address && a.end < b[i].end) {
            return false;
        }
    }

};

MapFind.prototype.AddDefinitions = function (map, results) {
    var xml = "";

    for (var i in results) {
        if (results[i].type == "3D") {
            xml += this.TableDef3D(results[i]);
        }
        if (results[i].type == "2D") {
            xml += this.TableDef2D(results[i]);
        }
    }
    
    
    var source = $("#table-scaling-def-template").html();
    var template = Handlebars.compile(source);
     
    var defs = this.DefFromXml(template({ content: xml }));

    map.definition.find("rom").append(defs.find("rom>table"));
    map.definition.find("rom").append(defs.find("scaling"));
};

/*
MapFind.prototype.CreateDefs = function (results) {
    var xml = "";

    for (var i in results) {
        if (results[i].type == "3D") {
            xml += this.TableDef3D(results[i]);
        }
        if (results[i].type == "2D") {
            xml += this.TableDef2D(results[i]);
        }
    }

    var source = $("#table-scaling-def-template").html();
    var template = Handlebars.compile(source);
     
    Map.prototype.extraDef = this.DefFromXml(template({ content: xml }));
};

MapFind.prototype.Render = function (result) {
    Map.prototype.extraDef = this.DefFromXml($("#table-scaling-def-template").text());
    var xml = this.TableDef3D(result);  
    var def = this.DefFromXml(xml).find("table");    
    var table = GetMapEdit().map.LoadTable3D([def], ToHex(x.z.address));
    
    $("#table-map-select").click();
    $(".table-component").show();
    $("#rom-information-placeholder").hide();
    GetMapEdit().RenderTable(table);
};
*/

MapFind.prototype.Load3D = function (address) {
    var map = this.map;
    var i = address;

    var type = map.GetUint32(address + 16);
    var tableType = this.TableTypes[type];

    if (tableType === undefined) {
        return undefined;
    }

    var result = {
        address : i,
        type: "3D",
        x : {size : map.GetInt16(i), address : map.GetInt32(i+4)},
        y : {size : map.GetInt16(i+2), address : map.GetInt32(i+8)},
        z: { address: map.GetInt32(i + 12) },
        tableType : tableType
    };
               
    result.x.scaling = this.floatScaling;
    result.x.end = result.x.address + (4 * result.x.size);
    result.y.end = result.y.address + (4 * result.y.size);
    result.y.scaling = this.floatScaling;
    result.z.size = result.x.size * result.y.size;
    result.z.end = result.z.address + (this.TableSizes[type] * result.z.size);
    result.z.scaling = this.TableScaling[type];

    if (!this.ValidSize(result.x.size) ||
        !this.ValidSize(result.y.size) ||
        result.x.address > result.y.address ||
        result.z.address < result.y.address ||
        !this.ValidAddress(result.x.address) ||
        !this.ValidAddress(result.y.address) ||
        !this.ValidAddress(result.z.address) ||
        !this.ValidAddress(result.x.end) ||
        !this.ValidAddress(result.y.end) ||
        !this.ValidAddress(result.z.end) ||
        this.Overlaps(result.x, [result.y, result.z]) ||
        this.Overlaps(result.y, [result.x, result.z]) || 
        this.Overlaps(result.z, [result.x, result.y])) {
        return undefined;
    } else {
        return result;
    }
};

MapFind.prototype.Load2D = function (address) {
    
    /*
    row_count: 2 bytes indicating the number of elements
    data_bits: 2 bytes indicating the type of data (0 = 32-bit*, 4 = 8-bit, 8 = 16-bit)
    row_address: 4 bytes pointing to the start of the row heading value array
    data_address: 4 bytes pointing to the start of the data array*/
    
    var map = this.map;
    var i = address;

    var type = map.GetUint16(address + 2);
    var tableType = this.TableTypes2D[type];

   // if (tableType === undefined) {
     //   return undefined;
    //}

    var result = {
        address : i,
        type: "2D",
        x : {size : map.GetInt16(i), address : map.GetInt32(i+4)},
        z: { address: map.GetUint32(i + 8) },
        tableType : tableType
    };

     
    result.x.scaling = this.floatScaling;
    result.z.end = result.z.address + (this.TableSizes2D[type] * result.x.size);
    result.z.scaling = this.TableScaling2D[type];


    if (!this.Valid2DSize(result.x.size) ||
        !this.ValidAddress(result.x.address) ||
        !this.ValidAddress(result.z.address) ||
        !this.ValidAddress(result.z.end) ||
        this.Overlaps(result.z, [result.x])) {
        return undefined;
    } else {
        return result;
    }
};

MapFind.prototype.FindSequence = function(vv) {
    var results = [];
    var foundCount = 0;
    for (var i = 0; i < this.addressMax; i+=4) {
        if (Math.abs(this.map.GetFloat32(i) - vv[foundCount]) < 0.1) {
            foundCount++;
            if (foundCount == vv.length) {
                results.push(ToHex(i-((vv.length-1)*4)));
                foundCount = 0;
            }
        } else {
            foundCount = 0;
        }
    }
    
    return results;
}

MapFind.prototype.Find3D = function () {
    var results = {};
    for (var i = 0; i < this.addressMax; i+=4) {
        var x = this.Load3D(i);
        if (x !== undefined) {
            results[x.z.address] = x;
        }
    }
    this.results3D = results;
    return results;
};

MapFind.prototype.Find2D = function () {
    var results = {};
    for (var i = 0; i < this.addressMax; i+=4) {
        var x = this.Load2D(i);
        if (x !== undefined) {
            results[x.z.address] = x;
        }
    }
    this.results2D = results;
    return results;
};

MapFind.prototype.AssociateDefs = function () {
    var tables = this.map.TableList();    
    for (var t in tables) {
        if (tables[t].type == "3D") {
            var found = this.results3D[FromHex(tables[t].address)];
            if (found === undefined) {
                console.log("MapFind.AssociateDefs: Missing definition " + tables[t].name);
                console.log(tables[t].name);
            } else {
                var table = this.map.LoadTable(tables[t].name);
                var xAddress = FromHex(table.xAxis.address);
                if (xAddress != found.x.address) {
                    console.log("MapFind.AssociateDefs: Incorrect x axis for table: " + tables[t].name + " address is " + ToHex(xAddress) + " should be " + ToHex(found.x.address));
                }
                var yAddress = FromHex(table.yAxis.address);
                if (yAddress != found.y.address) {
                    console.log("MapFind.AssociateDefs: Incorrect y axis for table: " + tables[t].name + " address is " + ToHex(yAddress) + " should be " + ToHex(found.y.address));
                }
                found.name = tables[t].name;
            }
        } else if (tables[t].type == "2D") {
            var table = this.map.LoadTable(tables[t].name);
            if ((table.yAxis !== undefined && table.yAxis.elements > 1 && table.yAxis.type.indexOf("Static") == -1) || (table.xAxis !== undefined && table.xAxis.elements > 1 && table.xAxis.type.indexOf("Static") == -1)) {
                var found = this.results2D[FromHex(tables[t].address)];
                if (found === undefined) {
                    console.log("MapFind.AssociateDefs: Missing 2D definition " + tables[t].name + " " +  table.yAxis.elements);
                } else {
                    if (table.xAxis !== undefined) {
                        var xAddress = FromHex(table.xAxis.address);
                        if (xAddress != found.x.address) {
                            console.log("MapFind.AssociateDefs: Incorrect x axis for table: " + tables[t].name + " address is " + ToHex(xAddress) + " should be " + ToHex(found.x.address));
                        }
                    }
                    
                    if (table.yAxis !== undefined) {
                        var yAddress = FromHex(table.yAxis.address);
                        if (yAddress != found.x.address) {
                            console.log("MapFind.AssociateDefs: Incorrect y axis for table: " + tables[t].name + " address is " + ToHex(yAddress) + " should be " + ToHex(found.x.address));
                        }
                    }
                    
                    found.name = tables[t].name;
                }
            }
        }
    }
};

MapFind.prototype.Stats = function () {
    var known = 0, unknown = 0;
    for (var i in this.results2D) {
        if (this.results2D[i].name !== undefined) {
            known++;
        } else {
            unknown++;
        }
    }
    
     for (i in this.results3D) {
        if (this.results3D[i].name !== undefined) {
            known++;
        } else {
            unknown++;
        }
    }

    console.log("Known " + known + " Unknown " + unknown);
};

function FindUndefinedMaps() {
    var map = GetMapEdit().map;
    var f = new MapFind(map);
    f.Find3D();
    f.Find2D();
    f.AssociateDefs();
    var unknown = [];

    for (var i in f.results3D) {
        if (f.results3D[i].name === undefined) {
            unknown.push(f.results3D[i]);
        }
    }
    
    for (i in f.results2D) {
        if (f.results2D[i].name === undefined) {
            unknown.push(f.results2D[i]);
        }
    }
    /*f.CreateDefs(unknown);*/
    f.AddDefinitions(map, unknown);
    map.ResetScalingCache();
    GetMapEdit().ResetTableCache(map);
    GetMapEdit().RenderTableList(map);

    var known = 0;
    unknown = 0;
    for (i in f.results3D) {
        if (f.results3D[i].name !== undefined) {
            known++;
        } else {
            unknown++;
        }
    }
    
     for (i in f.results2D) {
        if (f.results2D[i].name !== undefined) {
            known++;
        } else {
            unknown++;
        }
    }

    GetMapEdit().map.romid.definedTables = known;
    GetMapEdit().map.romid.undefinedTables = unknown;

    GetMapEdit().RenderRomInformation();
    
    return f;
}