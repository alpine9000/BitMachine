
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
        instructionProcessors: [],
        breakpoints : {},
        execution_registers  : {
            r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            fr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
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
        address : 0,  
        data: 0,   
        delayedBranch : undefined, 
        debug: false,
        blockSize: 100000,
        interactive: false,
        preProcessCount: 500,
        returnTabStack: [],
        ram: [],
        uninitialisedRam: {},
        instructionCount: 0
    };   

simulator.log = function(s) {
    if (simulator.debug) {
        console.log(s);
    }
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
    if (simulator.registers.r[n] !== undefined) {
        $("#disa-register-r" + n).val(sprintf("%08X", simulator.registers.r[n]));    
    }
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
     ["m", "n", "i", "d"].forEach(simulator.RenderInstructionComponent);
    for (var i = 0; i < 16; ++i) { 
        simulator.RenderRegisterN(i); 
        simulator.RenderRegisterFRN(i); 
    }

    
    $("#disa-instruction").html(sprintf("%06X %06X", simulator.address, simulator.data));
    $("#disa-register-address").val(sprintf("%08X", simulator.address));
    $("#disa-register-pc").val(sprintf("%08X", simulator.registers.pc));
    $("#disa-register-pr").val(sprintf("%08X", simulator.registers.pr));
    $("#disa-register-gbr").val(sprintf("%08X", simulator.registers.gbr));
    $("#disa-register-sr").val(sprintf("%08X", simulator.registers.sr));
    $("#disa-register-t").val(sprintf("%d", cpu.GetT()));
    $("#disa-register-macl").val(sprintf("%d", cpu.GetMACL()));
    $("#disa-register-mach").val(sprintf("%d", cpu.GetMACH()));
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

simulator.Reset = function() {
    simulator.stop = true;
    simulator.instructionCount = 0;
    simulator.notImplemented = undefined;
    simulator.sideEffects = "";
    simulator.registers = simulator.execution_registers;
    simulator.registers.pc = simulator.registers.pr = simulator.registers.gbr = 0;
    simulator.registers.sr = 0xF0;
    simulator.registers.fpscr = 0x00040001;
    simulator.address = cpu.Read(0x0, 32);
    
    simulator.registers.r[15] = cpu.Read(0x4, 32); //SP
    
    if (simulator.registers.r[15] >= 0xFFFFFFA0) {
        simulator.peripheralBase = 0x10000000;
        cpu.IsRamAddress = cpu.BigIsRamAddress;
        cpu.IsPeripheralAddress = cpu.BigIsPeripheralAddress;
        cpu.ramStart = 0xffdfffff;
        cpu.ramSize = 0x200000;
        //simulator.ram = new Uint32Array();
    } else {
        simulator.peripheralBase = 0xFFFFD000;
        cpu.IsRamAddress = cpu.DefaultIsRamAddress;
        cpu.IsPeripheralAddress = cpu.DefaultIsPeripheralAddress;
        cpu.ramStart = 0xFFFF0000;
        cpu.ramSize = 0xbfff;
        //simulator.ram = new Uint32Array();
    }
    simulator.delayedBranch = undefined;
    simulator.ram = {};
    simulator.uninitialisedRam = {};
    simulator.sideEffects = "";
    ResetVideo();
};

simulator.AddBreakPoint = function(address) {
    simulator.breakpoints[address] = true;
    simulator.SaveBreakpoints();
    GetDisaView().done(function() {this.RenderBreakpointList();});
};

simulator.ToggleBreakPoint = function(address) {

    if (simulator.breakpoints[address] == true) {
        delete simulator.breakpoints[address];
    } else {
        simulator.breakpoints[address] = true;
    }
    simulator.SaveBreakpoints();
    GetDisaView().done(function() {this.RenderBreakpointList();});
};

simulator.SaveBreakpoints = function () { 
    simulator.disa.fs.save("/"+simulator.disa.internalString+"/breakpoints.json", JSON.stringify(simulator.breakpoints)).done(function () { console.log("Saved Breakpoints");});
};

simulator.LoadBreakpoints = function (success) {
    var _this = this;
    
    simulator.disa.fs.read("/"+simulator.disa.internalString+"/breakpoints.json", true).done(function (e) {
        eval("simulator.breakpoints = " + e);
        console.log("Breakpoints loaded");        
    }).always(function() {
        if (typeof(success) != "undefined") {
            success();
        }
    });
};

simulator.Step = function() {
    var disa = simulator.disa;
    var _simulator = simulator;
    _simulator.lastWriteAddress = undefined;

    var branchAfter = _simulator.delayedBranch;
    var initialAddress = _simulator.address;
    var word = _simulator.data = disa.map.GetUint16(_simulator.address);
    var instruction = disa.DecodeInstruction(word);            
    
    if (branchAfter !== undefined) { // Delay slot instruction
        _simulator.registers.pc = _simulator.address+2;
    } else {
        _simulator.registers.pc = _simulator.address+4;
    }

    //simulator.log(sprintf("0x%08X : %s", simulator.address, instruction.instruction.text));
    //simulator.log(instruction.instruction.description);
    
    _simulator.instructionCount++;
    if (instruction !== undefined) {
        _simulator.ExecuteInstruction(instruction, _simulator.address);
    }
    
    if (branchAfter !== undefined) {
        cpu.SetPC(branchAfter);
        _simulator.delayedBranch = undefined;
    } else if (_simulator.address == initialAddress) { // Haven't imm branched
        _simulator.address+=2;
    }
};

simulator.ExecuteInstruction = function (instruction, address) {    
    var _simulator = simulator;
    //_simulator.address = address;
    _simulator.instruction = instruction;     
    _simulator.sideEffects = "";
    _simulator.notImplemented = undefined;
    _simulator.instructionProcessors[instruction.instruction.instructionIndex](instruction);
};

simulator.Simulate = function(length) {    
    simulator.stop = false;
    simulator.stopAddress = simulator.address + length;
    
    function simulateBlock(max) { 
        io.vblank = true;
        var startAddress = simulator.address;
        var stop = false;
        io.time = Date.now();
        /*var start = new Date().getTime();
        var current = start;
        var end = start + 30;
        var timeCount = 0; */
        
        for (var count = 0; 
                            count < max 
                            /*current <= end*/
                            && simulator.address < simulator.stopAddress; ++count) {    
            if (simulator.stop === true) {
                stop = true;
                console.log("SIMULATOR STOPPED");
                break;
            } else if (startAddress != simulator.address && simulator.breakpoints[simulator.address] !== undefined) {
                stop = true;
                console.log("BREAKPOINT");
                break;
            } else if (simulator.notImplemented) {
                stop = true;
                console.log("NOT IMPLEMENTED");
                break;
            } else {
                simulator.Step();   
            }
           /* if (timeCount > 100) {
                current = new Date().getTime();
                timeCount = 0;
            } else {
                timeCount++;
            }*/
        }
        
        if (!stop && simulator.address < simulator.stopAddress) {
            //window.setTimeout(doit, 0);
            window.requestAnimationFrame(doit)
        } else {
            done();
        }
    }
    
    function doit() {
        simulateBlock(simulator.blockSize);
    }
    
    function done() {
        GetDisaView().done(function() {
            this.GotoAddress(simulator.address);
            simulator.Render();
        });
    }
    
    doit();
            
};



$(document).ready(function() {    
    $("#disa-show-float-data").on("change", function() {
            simulator.RenderRegisters();
    });
    
    $("#disa-simulator .simulator-register").on("change", function() {
        eval($(this).data("set") + FromHex($(this).val()) + ");");
        simulator.RenderRegisters();
    });

    $("body").keyup(function (e) {
        if ($("#disa-simulator").is(":visible") && e.target == $("body").get(0)) {
            
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
                var address = prompt("Enter hex address to display?");
                if (address !== undefined) {
                    GetDisaView().done(function() {
                        this.GotoAddress(FromHex(address));
                    });
                }
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
        var address = prompt("Hex address for breakpoint ?");

        if (address !== undefined) {
            simulator.AddBreakPoint(FromHex(address));
        }
    });

    $("#disa-simulator-execute").on("click", function(e) {
        simulator.Simulate(1024*1024*1024);
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