/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function GetDisa() {
    if (Disa.prototype.promise === undefined) {
        Disa.prototype.promise = new Disa(GetMapEdit().map).done(function () { 
            Disa.prototype.instance = this;
        });
    }
    
    return Disa.prototype.promise;
}


function BootSimulator(filename, cmd) {
    GetDisa().done(function() {
	    ElfKernelLoadFromFile(filename, cmd); 
	});
}


var Disa = function (map) {
    return this.Init(map) ;
};

Disa.prototype.Init = function(map) {
 var deferred = $.Deferred();
    var _this = this;
    this.vbrReferences = [];
    this.instructionCache = [];
    this.map = map;
    this.processor = "sh7058s";   
    if (this.map !== undefined) {
        this.internalString = this.map.romid.internalidstring;
    }
    //this.ssmBase = FromHex("05D714");
    //this.ssmBase = FromHex("059368");    
    
    this.references = {};
    
    this.instructionSize = 2;
    //this.instructionSet = this.DecodeInstructionSpecs(this.LoadSpec());
    require(["fpu", "compiled_is"], function() {
    //require(["fpu", "is_compile"], function() {
        if (_this.instructionSet === undefined) {
            _this.instructionSet = is;
            var instructionIndex = 1;
            _this.instructionSet = _.filter(_this.instructionSet, function(i) {
               i.instructionCode = FromHex(i.instructionCode);
               i.instructionCodeMask = FromHex(i.instructionCodeMask);
               if (i.instructionIndex === undefined) { // compiled_is.js mode
                    i.instructionBitLength = getInstructionBitLength(i);
                    i.instructionIndex = instructionIndex++;
               }
               i.rawMasks = { d: FromHex(i.masks.d), i: FromHex(i.masks.i), m: FromHex(i.masks.m), n: FromHex(i.masks.n)};
               i.bitLengths = { d: i.masks.d.length * 4, i: i.masks.i.length * 4, m: i.masks.m.length * 4, n: i.masks.n.length * 4};
               return i;
            });
            for (var i = 0; i <= 0xFFFF; i++) {
                _this.DecodeInstruction(i);
            }
        }
       
        _this.ResetSymbols();
        simulator.disa = _this;
        if (_this.map != undefined) {
            simulator.LoadRom(_this.map);
        }
        new FileSystem().done(function () {
            _this.fs = this;
            var start = new Date().getTime();
            console.log("loading references...");
            _this.LoadReferences().done(function () {
                    var end = new Date().getTime();
                    var time = end - start;
                    console.log('Done in ' + time);
                    console.log("loading symbols...");
                    _this.LoadSymbols().done(function () {
                        simulator.Reset();                                        
                        simulator.LoadBreakpoints(function() {
                            simulator.Render();
                            console.log("ready");
                            deferred.resolveWith(_this);
                        });
                        
                    }).fail(function() {
                        simulator.Reset();       
                        //gui.log("Disa: No symbols found. Run Analyse ROM!");
                        console.log("ready");
                        deferred.resolveWith(_this);
                    });
                }).fail(function () {
                    simulator.Reset();       
                    //gui.log("Disa: No references found. Run Analyse ROM!");
                    deferred.resolveWith(_this);
                });
        });
    });
    
    return deferred.promise();
};

Disa.prototype.dataAddresses = {};

Disa.prototype.AddReference = function(address, referenceAddress, type) {
    
    if (type == "Simulator (VBR)") {
        this.vbrReferences.push({address: address, referenceAddress: referenceAddress, type: type});
    }
    
    
    if (this.references[address] === undefined) {
        this.references[address] = [];
    }

    this.references[address].push({address: address, referenceAddress: referenceAddress, type: type, referenceData:FromHex("DEADBEEF")});
};

Disa.prototype.SaveReferences = function () {
    var _this = this;
    window.setTimeout(function() {
        new FileSystem().done(function() {
            this.save("/"+_this.internalString+"/references.json", JSON.stringify(_this.references)).done(function () { console.log("Saved References");});    
        });
    }, 1);
};

Disa.prototype.LoadReferences = function () {
    var deferred = $.Deferred();
    var _this = this;    
    _this.fs.read("/"+_this.internalString+"/references.json", true).done(function (e) {            
        eval("_this.references = " + e);
        console.log("References loaded");
        deferred.resolveWith(this);
    }).fail(function(e) { 
        deferred.rejectWith(this, [e]);
    });
    
    return deferred.promise();
};

Disa.prototype.GenerateReferences = function () {
    this.references = {};    
    
    simulator.generateReferences = true;
    lines = this.Disassemble(FromHex(0), this.map.mapData.byteLength);
    simulator.generateReferences = false;
    
    for (var l in lines) {        
        if (lines[l].info.target != undefined && !lines[l].info.isData) {            
            this.AddReference(lines[l].info.target.address, lines[l].address, "reverse operand");
            this.AddReference(lines[l].info.target.data, lines[l].address, "reverse operand pointer");
        }
    }

    // Vector table references
    var length = this.map.mapData.byteLength;
    for (var address = 0; address < length; address += 4) {
        var lword = this.map.GetUint32(address);
        if (lword >= 0 && lword < this.map.mapData.byteLength - 4) {
            this.AddReference(address, lword, "reverse vector");
            this.AddReference(lword, address, "vector");
        }
    }
};

Disa.prototype.SaveSymbols = function () {
    var _this = this;  
    window.setTimeout(function() {
        new FileSystem().done(function() {
            this.save("/"+_this.internalString+"/symbols.json", JSON.stringify(_this.symbols)).done(function () { console.log("Saved Symbols"); });    
        });
    }, 1);
};

Disa.prototype.LoadSymFile = function (arrayBuffer) {
    var _this = this;
     common.toString(arrayBuffer).done(
         function(data) { 
            _.each(data.split("\n"), function(line) {
                var parts = line.split(" ");
                if (parts.length === 3) {
                    console.log(parts[0] + " -> " + parts[2]);
                    _this.AddSymbol(FromHex(parts[0]), parts[2], "Program Symbol");
                }
            });
            GetDisaView().done(function() {
                this.RenderTableList(); 
            });
         });
    
};

Disa.prototype.LoadSymbols = function () {
    var deferred = $.Deferred();
    var _this = this;
        
    this.fs.read("/"+_this.internalString+"/symbols.json", true).done(function (e) {
        eval("_this.symbols = " + e);
        deferred.resolveWith(this);
    }).fail(function () {            
        deferred.rejectWith(this);
    });    
    
    return deferred.promise();
};

Disa.prototype.LoadProcessorSymbols = function (processor) {
    var deferred = $.Deferred();
    var _this = this;
    /*
    var spec = $("#disa-register-definitions").text();
    var i = 0;
    var processorScoped = undefined;
    spec.split("\n").forEach(function (l) {
        if (l.length > 0 && l[0] != ";") {
            
            if (l[0] == ".") {
                processorScoped = l.slice(1);
            } else {
                var parts = l.split(" ");
                parts = common.reduce(parts, function (p) { return p != ""; });
                if (parts.length == 2) {
                    if ((processorScoped != undefined && processorScoped == processor) || processorScoped == undefined) {                                                
                        _this.AddSymbol(FromHex(parts[1]), parts[0], "processor symbol");
                    }      
                }
            }
        }
    });*/
    
    require(["register-definitions"], function() {
        console.log("Disa.LoadProcessorSymbols...");
        _registerDefinitions.forEach(function(r) {
            _this.AddSymbol(r.address, r.name, "processor symbol");
        });
        
        console.log("Disa.LoadProcessorSymbols...Done");
        deferred.resolve();
    });
        
    return deferred.promise();
};

Disa.prototype.AddSymbol = function (address, name, type, scaling) {    
    this.symbols.byAddress[address] = { name: name, type: type, scaling: scaling};
    this.symbols.byName[name] = address;
};


var ____dv = new DataView(new ArrayBuffer(4));
function ToUnsigned(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    //____dv.setUint32(0, x);
    //return ____dv.getUint32(0);
    return x >>> 0;
}

function ToSigned(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    //____dv.setInt32(0, x);
    //return ____dv.getInt32(0);
    x = x >>>0;
    if (0x80000000 & x) {
        return (x & 0x7FFFFFFF) - 2147483648;
    }
    return x;
}

function ToFloat32(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    //____dv.setUint32(0, x, false);
    //return ____dv.getFloat32(0, false);
    
    ____dv.setUint32(0, x);
    return ____dv.getFloat32(0);
}


function FromFloat32(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    ____dv.setFloat32(0, x, false);
    return ____dv.getUint32(0, false);
}

Disa.prototype.ResetSymbols = function () {
    var symbols = [];
    if (this.symbols !== undefined) {
        for (var a in this.symbols.byAddress) {
             if (this.symbols.byAddress[a].type == "User Defined") {
                 symbols[a] = this.symbols.byAddress[a];
             }
        }
    }
    
    this.symbols = {
        byAddress: {},
        byName: {}
    };    
    
    for (var a in symbols) {
        this.AddSymbol(a, symbols[a].name, symbols[a].type);    
    }
};

Disa.prototype.FindSymbols = function () {
    var deferred = $.Deferred();
    var disa = this;
    
    this.LoadProcessorSymbols(this.processor).done(function() {
        disa.fs.read("/logger.xml", true).done(function(data) {
            var logger = $($.parseXML(data));
            logger.find("parameter").each(function () {
                var _this = $(this);
                var name =_this.attr("name");        
                var address = (FromHex(_this.find("address").text()) * 4)  + disa.ssmBase;
                if (address !== undefined && address > 0) {
                    disa.AddSymbol(address, "-> SSM Get " + name, "SSM Parameter Table");
                    disa.AddSymbol(disa.map.GetUint32(address), "SSM Get " + name, "SSM Parameter");
                }
            });
        
            var ecuid = GetMapEdit().map.romid.ecuid; //
            logger.find("ecuparam").each(function () {
                var _this = $(this);
                var name = _this.attr("name");
                var address = _this.find("ecu[id*='" + ecuid + "'] address").text();
                if (address != "") {
                    address = ToUnsigned(FromHex(address) | FromHex("0xff000000"));
                    disa.AddSymbol(address, name, "RAM Variable");
                }
            });
        
            var f = FindUndefinedMaps();
            Object.keys(f.results3D).forEach(function(y) { 
                var t = f.results3D[y];
                if (t.name !== undefined) {
                    disa.AddSymbol(t.address, t.name, "3D Table"); // TODO: add scaling                                         
                } else {
                    disa.AddSymbol(t.address, "Undefined 3D table at " + ToHex(t.address) + " [" + ToHex(t.z.address) + "]" , "3D Table"); // TODO: add scaling                                         
                }
            });
            
            Object.keys(f.results2D).forEach(function(y) { 
                var t = f.results2D[y];
                if (t.name !== undefined) {
                    disa.AddSymbol(t.address, t.name, "2D Table");  // TODO: add scaling                                                                                                   
                } else {
                    disa.AddSymbol(t.address, "Undefined 2D table at " + ToHex(t.address)  + " [" + ToHex(t.z.address) + "]", "2D Table"); // TODO: add scaling                                         
                }
            });
             
            GetMapEdit().CachedTableList(GetMapEdit().map).done(function(tables) {
                //var tables = GetMapEdit().tables;
                
                if (tables === undefined) {
                    gui.error("Disa..FindSymbols: No tables loaded!");
                }
            
                for (var t in tables[0]) {
                    table = tables[0][t];
            /*        if (table.type == "3D") {                                                           
                        var address = disa.references[disa.references[FromHex(table.address)][0].address][0].referenceAddress - 12;            
                        disa.AddSymbol(address, table.name, "3D Table", table.scaling);                                                    
                    } else if (table.type == "2D") {
                        if (table.yAxis != undefined && table.yAxis.type == "Y Axis") {
                            var address = disa.references[disa.references[FromHex(table.address)][0].address][0].referenceAddress - 8;
                            disa.AddSymbol(address, table.name, "2D Table", table.scaling);
                        } else if (table.xAxis != undefined && table.xAxis.type == "X Axis") {
                            var address = disa.references[disa.references[FromHex(table.address)][0].address][0].referenceAddress - 8;
                            disa.AddSymbol(address, table.name, "2D Table", table.scaling);
                        } else {
                            var address = FromHex(table.address);
                            disa.AddSymbol(address, table.name, "2D Table (static axis)", table.scaling);    
                        }            
                    } else */
                    if (table.type == "2D") {
                        var tt = GetMapEdit().map.LoadTable(table.name);
                        if ((tt.yAxis !== undefined && tt.yAxis.type == "Static Y Axis") || (tt.xAxis !== undefined && tt.xAxis.type == "Static X Axis")) {
                            var address = FromHex(tt.address);
                            disa.AddSymbol(address, tt.name, "2D Table (static axis)", table.scaling);
                        }           
                    } else if (table.type == "1D") {
                        var address = FromHex(table.address);
                        disa.AddSymbol(address, table.name, "1D Table", table.scaling);
                    }
            
                }
                deferred.resolve();
            });
        });
    });
    
    return deferred.promise();
};

Disa.prototype.FindSymbol = function (address) {
    var symbol = this.symbols.byAddress[address];
    var indirect = false;

    if (symbol === undefined) {
        if (address < (this.map.mapData.byteLength - 4)) {
            symbol = this.symbols.byAddress[this.map.GetUint32(address)];
            if (symbol !== undefined) {
                indirect = true;
            }
        }        
    }

    if (symbol !== undefined) {
        return {symbol: symbol, indirect: indirect};
    } else {
        return undefined;
    }
};

Disa.prototype.ExtraInstructionDescription = function (d) {
    var endIndex = d.length-1;
    for (var i = endIndex; i >= 0; --i) {
        if (!isNaN(d[i])) {
            return d.slice(0, i-1);
        }
    }

    return d;
};
/*

Disa.prototype.LoadSpec = function () {
    var instructionSetSpec = [];
    var instructionCodeRegEx = new RegExp("[01nmid]{16}");
    var regex = new RegExp("\ [01nmid]{16}\ ");
    var parts = $("#is").text().split("\n");
    var input = [];
    for (var p in parts) {
        if (parts[p].search(regex) == -1) {
            input[input.length - 1] += (" " + parts[p]);
        } else {
            input.push(parts[p]);
        }
    }    

    for (var i in input) {
        var str = input[i].replace(/\n/g, " ");
        var instructionCodeIndex = str.search(instructionCodeRegEx);
        var text = str.slice(0, instructionCodeIndex);
        var description = this.ExtraInstructionDescription(str.slice(instructionCodeIndex + 16 + 1));
        var targetMultiplier;

        if (text.indexOf("label") != -1) {
            targetMultiplier = 2;
        }

        if (text.indexOf("disp") != -1) {
            if (description.indexOf("disp × 4") != -1) {
                targetMultiplier = 4;
            }
        }

        instructionSetSpec.push({
            instructionCode: str.slice(instructionCodeIndex, instructionCodeIndex + 16),
            text: text,
            description: description,
            targetMultiplier: targetMultiplier
        });
    }

    return instructionSetSpec;
};

Disa.prototype.InstructionSpecBitMask = function (spec, type) {
    var i, mask = 0;
    var length = spec.length;
    if (type === undefined) {
        for (i in spec) {
            if (spec[length - 1 - i] == "0" || spec[length - 1 - i] == "1") {
                mask = SetBit(mask, i);
            }
        }
    } else {
        for (i in spec) {
            if (spec[length - 1 - i] == type) {
                mask = SetBit(mask, i);
            }
        }
    }

    return mask;
};

Disa.prototype.InstructionSpecInstructionCode = function (spec) {
    var code = 0;
    var length = spec.length;    
    for (var i in spec) {
        if (spec[length - 1 - i] == "1") {
            code = SetBit(code, i);
        }
    }     

    return code;
};


Disa.prototype.DecodeInstructionSpec = function (spec) {
    return {
        masks : {
            "i": ToHex(this.InstructionSpecBitMask(spec.instructionCode, "i")),
            "n": ToHex(this.InstructionSpecBitMask(spec.instructionCode, "n")),
            "m": ToHex(this.InstructionSpecBitMask(spec.instructionCode, "m")),
            "d": ToHex(this.InstructionSpecBitMask(spec.instructionCode, "d")),        
        },
        instructionCodeMask: ToHex(this.InstructionSpecBitMask(spec.instructionCode)),
        instructionCode: ToHex(this.InstructionSpecInstructionCode(spec.instructionCode)),
        text: spec.text,
        spec: spec,
        description: spec.description
    };
};

Disa.prototype.DecodeInstructionSpecs = function (instructionSetSpec) {

    var instructionSet = [];

    for (var i in instructionSetSpec) {
        instructionSet.push(this.DecodeInstructionSpec(instructionSetSpec[i]));
    }

    return instructionSet;
};

*/


Disa.prototype.FindInstruction = function (word) {
    for (var i in this.instructionSet) {
        var is = this.instructionSet[i];
        var maskedInstructionCode = word & is.instructionCodeMask;
        if (maskedInstructionCode == is.instructionCode) {
            return is;
        }
    }

    return undefined;
};


Disa.prototype.DecodeInstruction = function (word) {
    //var cacheIndex = (word & 0xFF00) >> 8 | (word & 0xFF) << 8;
    var cacheIndex = word;
    var cached = simulator.instructionCache[cacheIndex];
    if (cached !== undefined) {
        return cached;
    }
    
    var instruction = this.FindInstruction(word);

    if (instruction !== undefined) {
        var result = {
            instruction: instruction,            
            d: this.ParseInstructionData(word, instruction, "d"),
            i: this.ParseInstructionData(word, instruction, "i"),
            n: this.ParseInstructionData(word, instruction, "n"),
            m: this.ParseInstructionData(word, instruction, "m")
        };
        simulator.instructionCache[cacheIndex] = result;

        return result;
    }
    
    var data = { instruction : {
        instructionIndex: 0 // Undefined
    }};
    
    simulator.instructionCache[cacheIndex] = data;
    return data;
};

Disa.prototype.ParseInstructionData = function (word, instruction, type) {    
    var mask = instruction.rawMasks[type];
    if (mask != 0) {
        var masked = word & mask;
        for (var i = 0; i < 16; ++i) {
            if ((mask & (1 << i)) == 0) {
                masked = masked >> 1;              
            } else {
                break;
            }
        }
        return masked;
    }

    return undefined;
};


Disa.prototype.SignExtend = function(component, value, instruction)
{
    var bitLength = instruction.masks[component].length * 4;
    var signBit = (1 << (bitLength) - 1);
    if (signBit & value) {
        value = ToUnsigned(value | ((1 << 31) >> 31 - (bitLength)));
    }
    return value;
};



Disa.prototype.ReplaceOperand = function (text, operand, format, values) {
    var args = [format];
    var argsArray = Array.prototype.slice.apply(arguments);
    
    if (values !== undefined) {
        args = args.concat(argsArray.slice(3));
        return text.replace(operand, sprintf.apply(this, args));
    } else {
        return text;
    }
};

Disa.prototype.ExtractData = function (address, data) {
    var symbol;
    var foundSymbol = this.FindSymbol(address);    

    var symbolRendering = "";

    if (foundSymbol !== undefined ) {
         symbol = foundSymbol.symbol;

        if (!foundSymbol.indirect && symbol.name.indexOf("table at") != -1) {
            symbolRendering = "<a href='' data-name='"+symbol.name+"' data-address='" + address + "' class='table-link'>"+symbol.name+"</a>";
        } else {
            symbolRendering = (foundSymbol.indirect ? "&rarr; " : "") + symbol.name;
    
            if (symbol.scaling !== undefined) {
                var scaling = this.map.LoadScaling(symbol.scaling);            
                symbolRendering = sprintf("%s%s ("+scaling.format+")", foundSymbol.indirect ? "&rarr; " : "", symbolRendering, this.map.GetMapValue(this.map.mapData, address, scaling));
            }
        }
    }

    return {
        text: "DATA.W",
        isData: true,       
        references: this.references[address], // TODO: render symbols here
        symbol: symbolRendering,
        spec: "",
        description: symbol !== undefined ? symbol.name : ""
    };
};

Disa.prototype.ExtractInfo = function (instruction, address) {
    var text = instruction.instruction.text;

    
    var description = instruction.instruction.description;
    var targetAddressLink = "";

    var scaling, target, targetSymbol, name, undefinedSymbol = "";

    if (instruction.instruction.spec.targetMultiplier !== undefined) {        
        var pc = (parseInt((address/instruction.instruction.spec.targetMultiplier), 10)*instruction.instruction.spec.targetMultiplier) + 4;    
        var targetAddress = pc + (instruction.d * instruction.instruction.spec.targetMultiplier);
        
        //if (targetAddress < this.map.mapData.byteLength - 4) {
            //target = { address: targetAddress, data: this.map.GetUint32(targetAddress) };
            target = { address: targetAddress, data: cpu.Read32Disassemble(targetAddress) };
        //} else {
         //   target = { address: targetAddress, data: 0xDEADBEEF };
    //    }
    }

    
    if (target !== undefined) { //TODO: clean up this mess       
        targetSymbol = this.symbols.byAddress[target.data];
        
        if (targetSymbol !== undefined) {
            name = targetSymbol.name;            
        } else {
            targetSymbol = this.symbols.byAddress[target.address];
            if (targetSymbol !== undefined) {

                if (targetSymbol.scaling !== undefined) {   
                    scaling = this.map.LoadScaling(targetSymbol.scaling);
                    name = sprintf("%s ("+scaling.format+")", targetSymbol.name,  this.map.GetMapValue(this.map.mapData, target.address, scaling));                
                } else {
                    name = sprintf("%s (#%06X)", targetSymbol.name,  target.data);                
                }
            } else {
                name = sprintf("#%06X", target.data);
                undefinedSymbol = "disa-undefined-symbol";
            }
        }
        
        //MOVA @(disp,PC),R0  // Test @02B3AA in AZ1G900C
        //       cpu.DispX4ZEPlusPC = function(instruction) {
        //           //return parseInt(((instruction.d * 4) + GetPC())/4)*4;
        //           return (((instruction.d << 2) + cpu.GetPC()) >> 2) << 2;
        //        }
        text = this.ReplaceOperand(text, "MOVA @(disp,PC)", "MOVA <a class='disa-link %s' title='@0x%06X' data-address='%d' href=''>%s</a>", undefinedSymbol, target.address, target.address, sprintf("#%06X", target.address));
        text = this.ReplaceOperand(text, "@(disp,PC)", "<a class='disa-link %s' title='@0x%06X->0x%06X' data-address='%d' href=''>%s</a>", undefinedSymbol, target.address, target.data, target.data, name);
    }
    
    if (instruction.d !== undefined) {
        
        var gbrOffset = cpu.GetGBR() + instruction.d;
        targetSymbol = this.symbols.byAddress[gbrOffset];
        undefinedSymbol = "";
        if (targetSymbol !== undefined) {
            if (targetSymbol.scaling !== undefined) {   
                scaling = this.map.LoadScaling(targetSymbol.scaling);
                name = sprintf("%s ("+scaling.format+")", targetSymbol.name,  this.map.GetMapValue(this.map.mapData, target.address, scaling));                
            } else {
                name = sprintf("%s (@%06X)", targetSymbol.name,  gbrOffset);                
            }
        } else {
            name = sprintf("@%06X", gbrOffset);
            undefinedSymbol = "disa-undefined-symbol";
        }
        text = this.ReplaceOperand(text, "@(disp,GBR)", "<a class='disa-link %s' title='@(%06X,GBR)' data-address='%d' href=''>%s</a>", undefinedSymbol, instruction.d, gbrOffset, name);
    }

    text = this.ReplaceOperand(text, "label", "0x%X", instruction.d);
    text = this.ReplaceOperand(text, "Rn", "R%d", instruction.n);
    text = this.ReplaceOperand(text, "Rm", "R%d", instruction.m);
    text = this.ReplaceOperand(text, "#imm", "#0x%06X", instruction.i);
    text = this.ReplaceOperand(text, "disp", "0x%06X", instruction.d);
   
    var foundSymbol = this.FindSymbol(address);
    
    var symbolRendering = "";

    if (foundSymbol !== undefined ) {
            //symbolRendering = sprintf('<a data-name="%s" class="disa-symbol-link" data-type="" href="">%s</a>', symbol.name, symbol.name);
        var symbol = foundSymbol.symbol;
        symbolRendering = symbol.name;

        if (!foundSymbol.indirect && symbol.name.indexOf("table at") != -1) {
            symbolRendering = "<a href='' data-name='"+symbol.name+"' data-address='" + address + "' class='table-link'>"+symbol.name+"</a>";
        } else if (symbol.scaling !== undefined) {
            var scaling = this.map.LoadScaling(symbol.scaling);            
            symbolRendering = sprintf("%s%s ("+scaling.format+")", foundSymbol.indirect ? "&rarr; " : "", symbolRendering, this.map.GetMapValue(this.map.mapData, address, scaling));
        }
    }

    if (instruction.n !== undefined && instruction.instruction.spec.text.indexOf("#imm") != -1) {
        //console.log("R" + instruction.n + " = " + ToHex(instruction.i));
    }

    var references = this.references[address];
    
    
    
    return {
        text: text,
        target: target,
        symbol: symbolRendering,
        references: references,       
        subroutine: _.filter(references, function(r) { return r.type == "Simulator (subroutine call)"}),
        spec: instruction.instruction.spec.text,
        instruction: instruction,
        description: instruction.instruction.description + " " + instruction.instruction.spec.instructionCode,
        sideEffects: instruction.sideEffects
    };
};

Disa.prototype.Disassemble = function (startAddress, length) {
    // Slow
    //return;
    simulator.SlowMode();
    lines = [];
    startAddress = parseInt(startAddress, 10);
    var endAddress = startAddress + length;
    var debug = simulator.debug;
    simulator.disassemble = true;
    simulator.debug = false;
    simulator.PushState();
    
    
    if (this.lastDisassmeblyAddress != (startAddress - this.instructionSize)) {
        for (var address = startAddress-simulator.preProcessCount; address < startAddress;  address += this.instructionSize) {
            if (address >= 0) {
                simulator.address = address;
                simulator.sideEffects = "";
                simulator.notImplemented = undefined;
                //try {
                    simulator.Step();
                //} catch (e) {
                    
                //}
            }
        }
    }    
    
    for (var address = startAddress; address < endAddress; address += this.instructionSize) {
        this.lastDisassmeblyAddress = simulator.address = address;
        var notImplemented = false;
        simulator.sideEffects = "";
        simulator.notImplemented = undefined;
        //try {
            simulator.Step();
        //} catch (e) {
          //  notImplemented = true;
        //}
        //var word = this.map.GetUint16(address);
        var word = cpu.Read16Disassemble(address);
        if (this.dataAddresses[address] !== undefined) {
            info = this.ExtractData(address, word);
            notImplemented = false;
        } else {
            var instruction = this.DecodeInstruction(word);            
            
            //if (instruction !== undefined) {
            if (instruction.instruction.instructionIndex !== 0) {
                //try {
                    
                    //console.log("=====================================================")
                    
                    //this.ExecuteInstruction(instruction, address);
                    //instruction.sideEffects = simulator.PopSideEffects();                    
                    
                    info = this.ExtractInfo(instruction, address);
                //} catch (e) {

                //}
                
            } else {
                info = this.ExtractData(address);
                notImplemented = false;
            }
        }
        
        info.notImplemented = notImplemented;
        
        lines.push({ address: address, word: word, info: info });     
    }
    
    simulator.PopState();
    simulator.debug = debug;
    simulator.disassemble = false;
    simulator.FastMode();
    return lines;
};

Disa.prototype.SetData = function (address, length) {
    this.dataAddresses[address] = length;
};

Disa.prototype.ClearData = function (address, length) {
    delete this.dataAddresses[address] ;
};


Disa.prototype.Analyse = function () {
    GetGui().PushFileSystemOperation();
    var deferred = $.Deferred();
    console.log(this);
    console.log("Resetting references and symbols...");
    
    this.references = {};
    
    console.log("Generating references...");
    this.GenerateReferences();
    
    if (this.internalString !== undefined) {
        this.ResetSymbols();
        console.log("Finding ssm base...");
        this.ssmBase = this.FindSSMBase();
        console.log("Ssm base = " + this.ssmBase);
        console.log("Finding sybols");
        this.FindSymbols().done(function() {
            deferred.resolve();
            gui.log("Disa.Analyse: Analysis complete!");
            GetGui().PopFileSystemOperation();
        });
    } else {
        deferred.resolve();
        gui.log("Disa.Analyse: Analysis complete!");
        GetGui().PopFileSystemOperation();
    }
    return deferred.promise();
};

Disa.prototype.FindInMap = function (x, bitmask) {
    var endAddress = this.map.mapData.byteLength - 4;
    for (var address = 0; address < endAddress; address += 4) {
        var word = this.map.GetUint32(address);
        if (x == ToUnsigned(word & FromHex(bitmask))) {
            return address;
        }
    }
    return undefined;
};

Disa.prototype.FindSSMBase = function () {
    a = this.FindInMap(FromHex("a21011"), "00FFFFFF") + 4;
    r = common.reduce(this.references[a], function (r) { return r.type == "vector"; })[0];
    r = common.reduce(this.references[r.referenceAddress], function (r) { return r.type == "reverse operand"; })[0];
    return common.reduce(this.references[r.referenceAddress], function (r) { return r.type == "vector"; })[0].referenceAddress - 4;
};


Handlebars.registerHelper('disaRefType', function (type, address) {
    var display = "";
    var disa = Disa.prototype.instance;
    var symbol = disa.symbols.byAddress[address];
    if (symbol === undefined) {
        symbol = "";
    } else {
        symbol = symbol.name + " ";
    }
    switch (type) {
        case "Reverse Simulator (Write)": 
            display = sprintf("&rarr;(Write to:"+symbol+"%06X)", address);
            break;
        case "Reverse Simulator (Read)": 
            display = sprintf("&larr;(Read from:"+symbol+"%06X)", address);
            break;    
        case "Simulator (subroutine call)": 
            display = sprintf("&larr;(Subroutine called from:%06X)", address);
            break;    
        case "Reverse Simulator (subroutine call)": 
            display = sprintf("&rarr;(Jump to subroutine:%06X)", address);
            break;
        case "Simulator (delayed branch)": 
            display = sprintf("&rarr;(Delayed branch:%06X)", address);
            break;
        case "Simulator (branch)": 
            display = sprintf("&larr;(Branch from:%06X)", address);
            break;    
        case "Reverse Simulator (branch)": 
            display = sprintf("&rarr;(Branch to:%06X)", address);
            break;
        case "reverse operand":             
            display = sprintf("&larr;(O:%06X)", address);
            break;
        case "vector":
            display = sprintf("&larr;(R:%06X)", address);
            break;
        case "reverse vector":             
            display = sprintf("&rarr;(R:%06X)", address);
            break;    
        case "reverse operand pointer":
            display = sprintf("&larr;(0:%06X)", address);
    }
    
    return display;
});

