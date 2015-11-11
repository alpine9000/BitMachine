/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */
 
// Vector table
//? VBR #0FFC50

// Tracing serial handler isr
// Start here: SCI0 RXI0 H'00000324 = *0xFFF74 = 0x2964
// Follow code til : F386
// Moves (R4) = (FFFFF004)[SCI_SSR0_B] to R0
//SCI1 RXI1 H'00000334 = 0xFFF84


var simulator = {
        instructionCache: [],
        instructionProcessors: [ function() { }],
        execution_registers  : {
            r: new Uint32Array(16),
            fr: new Uint32Array(16), 
            gbr : 0,
            vbr: 0,
            pr: 0,
            pc: 0,
            sr: 0,
            fpscr: 0,
            fpul: 0,
            mach: 0,
            macl: 0
         },
        disassembly_registers  : {
            r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            fr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            gbr : 0,
            pr: 0,
            pc: 0,
            sr: 0,
            fpscr: 0,
            fpul: 0,
            mach: 0,
            macl: 0
        },
        breakpoints : undefined,
        address : 0,  
        data: 0,   
        delayedBranch : undefined, 
        debug: false,
        blockSize: 1000000,
        interactive: false,
        preProcessCount: 500,
        returnTabStack: [],
        ram: [],
        uninitialisedRam: {},
        instructionCount: 0,
        stop: true,
        yield: false
    };   

simulator.log = function(s) {
    if (simulator.debug) {
        console.log(s);
    }
};

simulator.LoadRom = function(map) {
    var length = map.mapData.byteLength;
    cpu.uint8Array = new Uint8Array(length);
    cpu.uint16Array = new Uint16Array(length/2);
    cpu.uint32Array = new Uint32Array(length/4);
    
    for (var i = 0; i < length; i+=4) {
        cpu.uint32Array[i/4] = map.dataView.getUint32(i, false);
    }
    
    for (i = 0; i < length; i+=2) {
        cpu.uint16Array[i/2] = map.dataView.getUint16(i, false);
    }
    
    for (i = 0; i < length; i++) {
        cpu.uint8Array[i] = map.dataView.getUint8(i, false);
    }
    
    cpu.romSize = length;
};

simulator.RenderInstructionComponent = function(c) {
    if (simulator.instruction !== undefined) {
        if (simulator.instruction[c] !== undefined) {
            $("#disa-instruction-" + c).html(sprintf("%08X", simulator.instruction[c]));    
        } else {
            $("#disa-instruction-" + c).html("-");    
        }
    }
};

simulator.RenderRegisterN = function(n) {    
    $("#disa-register-r" + n).val(sprintf("%08X", cpu.GetR(n)));
};

simulator.RenderRegisterFRN = function(n) {    
    if (simulator.registers.fr[n] !== undefined) {
        if ($("#disa-show-float-data").is(":checked")) {
               $("#disa-register-fr" + n).val(sprintf("%.2f", ToFloat32(simulator.registers.fr[n])));    
        } else {
            $("#disa-register-fr" + n).val(sprintf("%08X", simulator.registers.fr[n]));    
        }
    }
};

simulator.PushState = function() {
    simulator.registers =  simulator.disassembly_registers;
    simulator._notImplemented = simulator.notImplemented;
    simulator._push_address = simulator.address;
    simulator._push_delayedBranch = simulator.delayedBranch;
};

simulator.PopState = function() {
    simulator.registers = simulator.execution_registers;
    simulator.notImplemented = simulator._notImplemented;
    simulator.address = simulator._push_address;
    simulator.delayedBranch = simulator._push_delayedBranch;
};

simulator.RenderSource = function(address, length) {    
    GetDisaView().done(function() { this.RefreshDisassembly();});
};

simulator.RenderRegisters = function () {
    
    if (this.disa.map == undefined) {
        return;
    }
    
     ["m", "n", "i", "d"].forEach(simulator.RenderInstructionComponent);
    for (var i = 0; i < 16; ++i) { 
        simulator.RenderRegisterN(i); 
        simulator.RenderRegisterFRN(i); 
    }

    
    //$("#disa-instruction").html(sprintf("%06X %06X", simulator.address, simulator.disa.map.GetUint16(simulator.address)));
    var instruction = cpu.uint16Array[simulator.address>>1];
    if (instruction === undefined) {
        instruction = 0;
    }
    $("#disa-instruction").html(sprintf("%06X %04X", simulator.address, instruction));
    $("#disa-register-address").val(sprintf("%08X", simulator.address));
    $("#disa-register-pc").val(sprintf("%08X", simulator.registers.pc));
    $("#disa-register-pr").val(sprintf("%08X", simulator.registers.pr));
    $("#disa-register-gbr").val(sprintf("%08X", simulator.registers.gbr));
    $("#disa-register-vbr").val(sprintf("%08X", simulator.registers.vbr));
    $("#disa-register-sr").val(sprintf("%08X", simulator.registers.sr));
    $("#disa-register-t").val(sprintf("%d", cpu.GetT()));
    $("#disa-register-macl").val(sprintf("%08X", cpu.GetMACL()));
    $("#disa-register-mach").val(sprintf("%08X", cpu.GetMACH()));
    $("#disa-register-fpscr").val(sprintf("%08X", cpu.GetFPSCR()));    
    
    if ($("#disa-show-float-data").is(":checked")) {
               $("#disa-register-fpul").val(sprintf("%.2f", cpu.ToFloat32(cpu.GetFPUL())));
                
        } else {
            $("#disa-register-fpul").val(sprintf("%08X", cpu.GetFPUL()));
            
        }
    
};

simulator.Render = function() {
    
    simulator.RenderRegisters();

    if (simulator.notImplemented !== undefined) {
        simulator.PopSideEffects();
        $("#disa-side-effects").html("<span style='color: red'>NOT IMPLEMENTED</span>");
    } else {
        $("#disa-side-effects").html(simulator.PopSideEffects());
    }

    if (simulator.instruction !== undefined) {
        $("#disa-instruction-text").html(simulator.instruction.instruction.text);    
        $("#disa-instruction-description").html(simulator.instruction.instruction.description);
    }
        
    simulator.RenderSource() ;                                
};

simulator.SideEffect = function(s) {
    if (simulator.sideEffects != "") {
        s = ", " + s ;
    }
    simulator.log(s);
    simulator.sideEffects += s;
 };

simulator.PopSideEffects = function() {
    var retval = simulator.sideEffects;
    simulator.log(retval);
    simulator.sideEffects = "";
    return retval;
};

simulator.SlowMode = function() {
    cpu.Read32 = cpu.SlowRead32;
    cpu.Read16 = cpu.SlowRead16;
    cpu.Read8 = cpu.SlowRead8;
    cpu.Write32 = cpu.SlowWrite32;
    cpu.Write16 = cpu.SlowWrite16;
    cpu.Write8 = cpu.SlowWrite8;
    simulator.Step = simulator.FastStep;
};

simulator.FastMode = function() {
    cpu.Read32 = cpu.FastRead32;
    cpu.Read16 = cpu.FastRead16;
    cpu.Read8 = cpu.FastRead8;
    cpu.Write32 = cpu.FastWrite32;
    cpu.Write16 = cpu.FastWrite16;
    cpu.Write8 = cpu.FastWrite8;
    simulator.Step = simulator.SlowStep;
};

simulator.Reset = function() {
    
    simulator.FastMode();
    cpu.IsPeripheralAddress = cpu.DefaultIsPeripheralAddress;
    
    simulator.stop = true;
    simulator.yield = true;
    simulator.instructionCount = 0;
    simulator.notImplemented = undefined;
    simulator.sideEffects = "";
    simulator.registers = simulator.execution_registers;
    simulator.registers.pc = simulator.registers.pr = simulator.registers.vbr = 0;
    simulator.registers.sr = 0xF0;
    simulator.registers.fpscr = 0x00040001;
    simulator.address = cpu.Read32(0x0);
    
    simulator.frArrayBuffer = new ArrayBuffer(16*4);
    simulator.registers.fr = new Uint32Array(simulator.frArrayBuffer);
    simulator.frFloat32 = new Float32Array(simulator.frArrayBuffer);
    simulator.frDataView = new DataView(simulator.frArrayBuffer);
    
    
    
    cpu.SetR(15, cpu.Read32(0x4)); //SP
    
    if (cpu.GetR(15) >= 0xFFFFFFA0) {
        simulator.peripheralBase = 0x10000000;
        cpu.IsRamAddress = cpu.BigIsRamAddress;
        cpu.IsPeripheralAddress = cpu.BigIsPeripheralAddress;
        //cpu.ramStart = 0xffbfffff;
        //cpu.ramSize = 0x400000;
        //cpu.ramStart = 0xff7fffff;
        
        cpu.ramSize =  0x8000000;
        //cpu.ramSize =  0x1D000000;
        cpu.ramStart = 0xffffffff - cpu.ramSize;
        cpu.ramEnd = cpu.ramSize + cpu.ramStart;
        simulator.FastMode();
    } else {
        //simulator.peripheralBase = 0xFFFFD000;
        simulator.peripheralBase = 0xFFFFFFFF;
        cpu.IsRamAddress = cpu.IsRamAddress;
        cpu.IsPeripheralAddress = cpu.DefaultIsPeripheralAddress;
        cpu.ramStart = 0xFFFF0000;
        cpu.ramSize = 0xbfff;
        cpu.ramEnd = cpu.ramSize + cpu.ramStart;
        simulator.SlowMode();
    }
    
    simulator.delayedBranch = undefined;
    simulator.ram = new Uint32Array(cpu.ramSize>>>2);
    simulator.uninitialisedRam = [];
    simulator.sideEffects = "";
    ResetFile();
    ResetVideo();
    ResetAudio();
    ResetMalloc();
};

simulator.AddBreakPoint = function(address) {
    if (simulator.breakpoints == undefined) {
        simulator.breakpoints = {};
    }
    simulator.breakpoints[address] = true;
    simulator.SaveBreakpoints();
    GetDisaView().done(function() {this.RenderBreakpointList();});
};

simulator.ToggleBreakPoint = function(address) {
    if (simulator.breakpoints == undefined) {
        simulator.breakpoints = {};
    }
    if (simulator.breakpoints[address] == true) {
        delete simulator.breakpoints[address];
    } else {
        simulator.breakpoints[address] = true;
    }
    simulator.SaveBreakpoints();
    GetDisaView().done(function() {this.RenderBreakpointList();});
};

simulator.SaveBreakpoints = function () { 
    //simulator.disa.fs.save("/"+simulator.disa.internalString+"/breakpoints.json", JSON.stringify(simulator.breakpoints)).done(function () { console.log("Saved Breakpoints");});
};

simulator.LoadBreakpoints = function (success) {
    /*var _this = this;
    
    simulator.disa.fs.read("/"+simulator.disa.internalString+"/breakpoints.json", true).done(function (e) {
        eval("simulator.breakpoints = " + e);
        console.log("Breakpoints loaded");        
    }).always(function() {
        if (typeof(success) != "undefined") {
            success();
        }
    });*/
    
    success();
};

simulator.OldStep = function() {
     var _simulator = simulator;
    _simulator.branchAfter = _simulator.delayedBranch;
    var initialAddress = _simulator.address;
    
    
    /*
    if (simulator.trace !== undefined) {
        var s = Disa.prototype.instance.symbols.byAddress[_simulator.address];
        if (s !== undefined) {        
            simulator.trace.push({ name: s.name, address: ToHex(simulator.address)});
        }
    }*/
    
    
    //_simulator.instruction = _simulator.instructionCache[cpu.uint16Array[_simulator.address/2]] ;
    _simulator.instruction = _simulator.instructionCache[cpu.Read16(_simulator.address)] ;
    
    
    if (_simulator.branchAfter !== undefined) { // Delay slot instruction
        _simulator.registers.pc = _simulator.address+2;
    } else {
        _simulator.registers.pc = _simulator.address+4;
    }

    //_simulator.instructionCount++;
    
    _simulator.instructionProcessors[_simulator.instruction.instruction.instructionIndex](_simulator.instruction);

    if (_simulator.branchAfter !== undefined) {
        cpu.SetPC(_simulator.branchAfter);
        _simulator.delayedBranch = _simulator.branchAfter = undefined;
    } else if (_simulator.address == initialAddress) { // Haven't imm branched
        _simulator.address+=2;
    }
};

simulator.SlowStep = function() {
    var s = this;
    s.branchAfter = s.delayedBranch;
    var initialAddress = s.address;
    
    //s.instruction = s.instructionCache[cpu.Read16(s.address)] ;
    
    if (s.address < cpu.romSize) {
        s.instruction = s.instructionCache[cpu.uint16Array[s.address>>>1]];
    } else {
        s.instruction = s.instructionCache[cpu.ReadRam16(s.address)];
    }
    
    // Fastest, but prevents executing from ram :(
    //s.instruction = s.instructionCache[cpu.uint16Array[s.address>>>1]] ;
    
    if (s.branchAfter !== undefined) { // Delay slot instruction
        s.registers.pc = s.address+2;
    } else {
        s.registers.pc = s.address+4;
    }

    
    s.instructionProcessors[s.instruction.instruction.instructionIndex](s.instruction);

    if (s.branchAfter !== undefined) {
        cpu.SetPC(s.branchAfter);
        //cpu.FastSetPC(s.branchAfter);
        s.delayedBranch = s.branchAfter = undefined;
    } else if (s.address == initialAddress) { // Haven't imm branched
        s.address+=2;
    }
};

simulator.FastStep = function() {
    var s = this;
    s.branchAfter = s.delayedBranch;
    var initialAddress = s.address;
    
    //s.instruction = s.instructionCache[cpu.Read16(s.address)] ;
    
    if (s.address < cpu.romSize) {
        s.instruction = s.instructionCache[cpu.uint16Array[s.address>>>1]];
    } else {
        s.instruction = s.instructionCache[cpu.ReadRam16(s.address)];
    }
    
    // Fastest, but prevents executing from ram :(
    //s.instruction = s.instructionCache[cpu.uint16Array[s.address>>>1]] ;
    
    if (s.branchAfter !== undefined) { // Delay slot instruction
        s.registers.pc = s.address+2;
    } else {
        s.registers.pc = s.address+4;
    }

    
    s.instructionProcessors[s.instruction.instruction.instructionIndex](s.instruction);

    if (s.branchAfter !== undefined) {
        simulator.address = s.branchAfter;
        s.delayedBranch = s.branchAfter = undefined;
    } else if (s.address == initialAddress) { // Haven't imm branched
        s.address+=2;
    }
};


simulator.ExecuteInstruction = function (instruction, address) {    
    //var _simulator = simulator;
    //_simulator.address = address;
    //_simulator.instruction = instruction;
    //_simulator.sideEffects = "";
    //_simulator.notImplemented = undefined;
    //simulator.instructionProcessors[instruction.instruction.instructionIndex](instruction);
};


simulator.Simulate = function() {    
    simulator.stop = false;
    simulator.notImplemented = undefined;
    var fps = $("#disa-fps");
    var fpsCount = 0;
    //var startTime = Date.now();
    var timeGettingThingy = window.performance;
    if (timeGettingThingy === undefined) {
        timeGettingThingy = Date;
    }
    var startTime = timeGettingThingy.now();
    var lastTime = 0;
    
    function simulateBlock() { 
        var s = simulator;
        var count, max = s.blockSize;
        
        
        if (s.stop || s.notImplemented) {
            done();
            return;
        }
        io.vblank = true;
        s.yield = false;
        var startAddress = s.address;
        var blockStart = timeGettingThingy.now();
        io.time = Date.now();
        var time = blockStart >>>0;
        io.elapsedTime = time - startTime;
      
        /*if (io.ktrace !== undefined) {
            io.ktrace.push({ id: "TICK", time: blockStart});
        }*/
        
        if (s.delayedBranch !== undefined) {
            s.Step();
        }
        
        cpu.ProcessInterrupt({ level: 15, vector: 2}); // WDT 
      
        if (s.breakpoints !== undefined) {
            
           for (count = 0; s.yield === false && count < max; ++count) {    
                if (startAddress != s.address && s.breakpoints[s.address] !== undefined) {
                    s.stop = true;
                    break;
                } else {
                    s.Step();   
                }
            }
        } else {
            /*for (count = 0; s.yield === false && count < max; ++count) {
                s.Step();
            }*/
            
            //for (count = 0; s.yield === false && count < max; count+=10000) {
            while (s.yield === false) {
                var t = timeGettingThingy.now();
                if (t-blockStart < 32) { //32 is "faster", 16 is "real"
                    for (var inner = 0; s.yield === false && inner < 10000; ++inner) {    
                        s.Step();
                    }
                } else {
                    break;
                }
            }
            
            /*if (io.ktrace !== undefined) {
                if (s.yield) {
                    io.ktrace.push({ action: "YIELD", time: blockStart}); 
                } else if (s.count >= max) {
                    io.ktrace.push({ action: "MAX", time: blockStart}); 
                } else {
                    io.ktrace.push({ action: "TIME", time: blockStart}); 
                }
            }*/
        }
        
        if (++fpsCount == 10) {
            fpsCount = 0;
            s.fps = 10000/(io.time - lastTime);
            lastTime = io.time;
            fps.text(parseInt(s.fps+0.5, 10));
        }
        
        
        if (!s.stop) {
            /*if (io.ktrace !== undefined) {
                io.ktrace.push({ action: "TOCK", time: window.performance.now()});
            }*/
            window.requestAnimationFrame(simulateBlock);
        } else {
            done();
        }
    }
    
    
    function done() {
        GetDisaView().done(function() {
            if (simulator.breakpoints !== undefined && simulator.breakpoints[simulator.address] !== undefined) {
                $("#disa-disassembly-tab").click();
                console.log("BREAKPOINT");
            }
            
            if (simulator.notImplemented) {
                $("#disa-disassembly-tab").click();
               console.log("NOT IMPLEMENTED at " + ToHex(simulator.address)); 
            }
            
            this.GotoAddress(simulator.address);
            simulator.Render();
        });
    }
    
    simulateBlock();
            
};


$(document).ready(function() {    
    $("#disa-show-float-data").on("change", function() {
            simulator.RenderRegisters();
    });
    
    $("#disa-simulator .simulator-register").on("change", function() {
        eval($(this).data("set") + FromHex($(this).val()) + ");");
        simulator.RenderRegisters();
    });

    $(document).on("keyup", function(e) {
        io.keyState[e.which] = false;
    });
    
    $(document).on("keydown", function(e) {
        io.keyState[e.which] = true;
    });
    
     $("#disa-display").on("keydown", function(e) {
         if ([8,9].indexOf(e.which) != -1) { // Backspace, TAB
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(e.which);
         }
         
        if ([37,39].indexOf(e.which) != -1) { // Left/Right
            e.preventDefault();
            e.stopPropagation();
            io.keyState[e.which] = true;
            io.consoleKeyboardBuffer.push(0x80 | e.which);
        }
        
        if ([38,40].indexOf(e.which) != -1) { // Up/Down
            io.keyState[e.which] = true;
            e.preventDefault();
            e.stopPropagation();
            if (e.which == 38) {
                io.consoleKeyboardBuffer.push(0x80 | 36);
            } else {
                io.consoleKeyboardBuffer.push(0x80 | e.which);
            }
        }
        
        if (e.ctrlKey && e.which > 64) { 
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(e.which-64);
        }
        
        /*if (e.ctrlKey && e.which == 86) { // Ctrl-V
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(22);
        }
        
        if (e.ctrlKey && e.which == 88) { // Ctrl-X
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(24);
        }
         
        if (e.ctrlKey && e.which == 67) { // Ctrl-C
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(3);
        }
        
        if (e.ctrlKey && e.which == 69) { // Ctrl-E
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(5);
        }
        
        if (e.ctrlKey && e.which == 83) { // Ctrl-S
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(19);
        }
        
         if (e.ctrlKey && e.which == 65) { // Ctrl-A
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(1);
         }
         
         if (e.ctrlKey && e.which == 75) { // Ctrl-K
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(11);
         }
         
         if (e.ctrlKey && e.which == 76) { // Ctrl-L
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(12);
         }
         
          if (e.ctrlKey && e.which == 70) { // Ctrl-F
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(6);
         }
         
        if (e.ctrlKey && e.which == 78) { // Ctrl-N (Doesn't work on windows)
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(14);
        }
        
        if (e.ctrlKey && e.which == 16) { // Ctrl-P
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(14);
        }*/
         
         if (e.which == 27) { // Esc
            e.preventDefault();
            e.stopPropagation();
            io.consoleKeyboardBuffer.push(e.which);
         }
    });
    
    $("#disa-display").on("mousemove", function(e) {
        var x = $(this).offset();
        io.mouse.x = e.pageX - x.left;
        io.mouse.y = e.pageY - x.top;
    });
    
    $("#disa-display").on("mousedown", function(e) {
        io.mouse.button = 1;
    });
    
    $("#disa-display").on("mouseup", function(e) {
        io.mouse.button = 0;
    });
    
    $("#disa-display,#ios-input").on("keypress", function(e) {
       e.preventDefault();
       e.stopPropagation();
       io.consoleKeyboardBuffer.push(e.which);
    });
    

    $("body").keyup(function (e) {
        if ($(".disa-output").is(":visible") && e.target == $("body").get(0) ) {
            
            if (e.keyCode == 83) {
               $("#disa-simulator-step").click();
            }

            if (e.keyCode == 66) {
               $("#disa-simulator-breakpoint").click();
            }

            if (e.keyCode == 69) {
               $("#disa-simulator-execute").click();
            }

            if (e.keyCode == 82) {
               $("#disa-simulator-reset").click();
            }

            if (e.keyCode == 74) {
               $("#disa-simulator-jump").click();
            }

            if (e.keyCode == 71) {
               $("#disa-simulator-goto").click();
            }
            
            if (e.keyCode == 76) {
               $("#load-bitos-from-local").click();
            }
            
            if (e.keyCode == 68) {
               $("#load-bitos-from-gdfs").click();
            }
            
            if (e.keyCode == 87) {
               $("#load-bitos-from-web").click();
            }
            
            if (e.keyCode == 90) {
                $("#disa-simulator-rendertable").click();
            }
        }
    });

    $("#disa-simulator-step").on("click", function(e) {
        simulator.interactive = true;
        //try {
            simulator.Step();
        //} catch (e) {
          //  console.log("Instruction error:");
        //    console.log(e);
        //}
        simulator.interactive = false;
        simulator.Render();    
    });

    $("#disa-simulator-breakpoint").on("click", function(e) {
        var address = prompt("Hex address or symbol for breakpoint ?");

        if (address !== undefined) {
            var symbol = simulator.disa.symbols.byName[address];
            if (symbol !== undefined) {
                address = ToHex(symbol);
            }
            simulator.AddBreakPoint(FromHex(address));
        }
    });

    $("#disa-simulator-execute").on("click", function(e) {
        if (simulator.stop === true) {
            simulator.Simulate(1024*1024*1024);
        }
    });

    $("#disa-simulator-reset").on("click", function(e) {
        
        GetDisaView().done(function() {
            simulator.Reset();
            simulator.Render();    
            this.GotoAddress(simulator.address);
        });
    });


    $("#disa-simulator-find").on("click", function(e) {
        var data = prompt("Hex data to find?");

        if (data !== undefined) {
        
            var mask = "";
            for (var i = 0; i < data.length; ++i) {
                mask += "F";
            }
            var address = simulator.disa.FindInMap(FromHex(data), mask);
            address = parseInt(address/4, 10)*4;
            GetDisaView().done(function() {
                        this.GotoAddress(address);
                    });

        }
    });
        

    $("#disa-simulator-rendertable").on("click", function(e) {
        GetDisaView().done(function() { this.RenderTableList();});
    });

    $("#disa-simulator-goto").on("click", function(e) {
          var address = prompt("Hex address or symbol to display ?");

        if (address !== undefined) {
            var symbol = simulator.disa.symbols.byName[address];
            if (symbol !== undefined) {
                address = ToHex(symbol);
            }
            GetDisaView().done(function() {
                this.GotoAddress(FromHex(address));
            });
            simulator.Render();
        }
    });
    
    $("#disa-simulator-jump").on("click", function(e) {

        var address = prompt("Hex address for PC ?");

        if (address !== undefined) {
            cpu.SetPC(FromHex(address));
            GetDisaView().done(function() {
                this.GotoAddress(FromHex(address));
            });
            simulator.Render();
        }
        
    });
});

/*

Table 11.9 Allowed Displacement Values (cont) 
Addressing Mode Displacement* 
symbol [When used as a branch instruction operand] 
When used as an operand for a conditional branch instruction (BT, BF, 
BF/S, or BT/S): 
 
 
H'00000000 to H'000000FF (0 to 255) 
H'FFFFFF00 to H'FFFFFFFF (–256 to –1) 
 When used as an operand for an unconditional branch instruction 
(BRA or BSR) 
 
 
H'00000000 to H'00000FFF (0 to 4095) 
H'FFFFF000 to H'FFFFFFFF (–4096 to –1) 
 [When used as the operand of a data move instruction] 
When the operation size is word (W): 
 H'00000000 to H'000001FE (0 to 510) 
When the operation size is longword (L): 
 H'00000000 to H'000003FC (0 to 1020) 
[When used as an operand of an instruction that sets the RS or RE 
register (LDRS or LDRE)] 
H'FFFFFF00 to H'000000FE (–256 to 254) 
*/