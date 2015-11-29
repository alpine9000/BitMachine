/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var cpu = {
    instructions: {}
};


// Assertions  ====================================
cpu.AssertAddressValid = function(address) {
    /*if (typeof(address) == "undefined") {
        throw "Simulator: Invalid Address";
    }

    var a = ToUnsigned(address);
    if (a > 0xFFFFFFFF) {
        throw "Simulator: Invalid Address: Exceeded 32 bits";
    }*/
};

cpu.AssertRegisterValid = function(n) {
    /*if (typeof(n) == "undefined" || n < 0 || n >= 16) {
        throw "Simulator: Invalid Register";
    }*/
};

cpu.AssertDataValid = function(data) {
    /*if (typeof(data) == "undefined") {
        throw "Simulator: Invalid Data";
    }*/
};

cpu.AssertBitLengthValid = function(length) {
    /*if (typeof(length) == "undefined") {
        throw "Simulator: Invalid Bit Length";
    }

    if (!(length == 32 || length == 16 || length == 8)) {
        throw "Simulator: Invalid Bit Length";
    }*/
};


// Operations ====================================
function swap16(val) {
    return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
}

cpu.PrepareAddress = function(address, bitLength) {
    if (bitLength == 32) {
        address = (address >>> 2) << 2;
    } else if (bitLength == 16) {
        address = (address >>> 1) << 1;
    }

    return address >>> 0;
};

cpu.ToUnsigned = function(x) {
    return x >>> 0;
};

cpu.ToSigned = function(x) {
    /*x = x >>> 0;
    if (0x80000000 & x) {
        return (x & 0x7FFFFFFF) - 2147483648;
    }
    return x;*/
    return x | 0;
};

cpu.ToFloat32 = function(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    ____dv.setUint32(0, x, false);
    return ____dv.getFloat32(0, false);
};

cpu.FromFloat32 = function(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    ____dv.setFloat32(0, x, false);
    return ____dv.getUint32(0, false);
};

cpu.BitSet = function(mask, bit) {
    return (mask & (1 << bit)) ? 1 : 0;
};

cpu.ClearBit = function(mask, bit) {
    return mask &= ~(1 << bit);
};

cpu.SetBit = function(mask, bit) {
    return mask |= (1 << bit);
};

cpu.RtsHook = function() {
    if (simulator.interactive) {
        simulator.nextTab = simulator.returnTabStack.pop();
    }
};

cpu.SubroutineHook = function() {
    if (simulator.interactive) {
        simulator.setFromSubroutine = true;
    }
};

cpu.DelayedBranch = function(address) {
    //AssertAddressValid(address);
    var _simulator = simulator;
    if (_simulator.delayedBranch !== undefined) {
        if (!_simulator.disassemble) {
            cpu.SetR(15, cpu.GetR(15) - 4);
            cpu.Write32(cpu.GetR(15), cpu.GetSR());
            cpu.SetR(15, cpu.GetR(15) - 4);
            cpu.Write32(cpu.GetR(15), cpu.GetPC());
            cpu.SetPC(cpu.Read32(24 + cpu.GetVBR()));
            _simulator.delayedBranch = _simulator.branchAfter = undefined;
            //throw "Simulator: Illegal Slot Exception";   
        }
    } else {
        if (_simulator.generateReferences) {
            _simulator.disa.AddReference(_simulator.address, address, "Simulator (delayed branch)");
        }
        _simulator.delayedBranch = address;
    }
};

cpu.ProcessInterrupt = function(source) {
    var mask = cpu.GetInterruptMask();
    var level = source.level;
    if (level > mask && simulator.delayedBranch === undefined) { // We don't use PC because we are interrupting before the next instruction has executed.
        var pc = simulator.address;
        var vectorAddress = (source.vector * 4) + cpu.GetVBR();
        cpu.SetR(15, cpu.GetR(15) - 4);
        cpu.Write32(cpu.GetR(15), cpu.GetSR());
        cpu.SetR(15, cpu.GetR(15) - 4);
        cpu.Write32(cpu.GetR(15), pc);
        cpu.SetSR((cpu.GetSR() & 0xFFFFFF0F) | (level << 4));
        cpu.SetPC(cpu.Read32(vectorAddress));
    }
};

cpu.ReadRam32 = function(address) {
    return simulator.ram[(address - cpu.ramStart) >>> 2];
};

cpu.CheckReadRam32 = function(address) {
    
    var currentPid = CurrentPid();
    
    if (currentPid != 1) {
        var pid = PIDOwnsRam(currentPid, address);
        if (pid != 0 && pid != 1 && pid != undefined && pid != currentPid) {
            console.log("[%c" + ToHex(simulator.address) + "%c] Bad read: currentPid:" + currentPid + " -> address:" + ToHex(address) + " ownerPid: " + pid, 'color: blue', 'color: black');
        }
    }
    
    return simulator.ram[(address - cpu.ramStart) >>> 2];
};


cpu.ReadRam16 = function(address, bitLength) {
    //var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
    var alignedAddress = ((address >>> 0) & 0xFFFFFFFC) >>> 0;

    var offset = address - alignedAddress;
    var data = simulator.ram[(alignedAddress - cpu.ramStart) >>> 2];

    if (offset === 0) {
        return data >>> 16;
    } else {
        return data & 0xFFFF;
    }
};

cpu.ReadRam8 = function(address) {
    var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
    var offset = address - alignedAddress;
    var data = simulator.ram[(alignedAddress - cpu.ramStart) >>> 2];

    if (offset === 0) {
        data = (data >>> 24) & 0xFF;
    } else if (offset === 1) {
        data = (data >>> 16) & 0xFF;
    } else if (offset === 2) {
        data = (data >>> 8) & 0xFF;
    } else {
        data = data & 0xFF;
    }

    return data;
};


cpu.FastRead32 = function(_address) {
    var address = ((_address >>> 2) << 2) >>> 0;
    //address = ((address >>> 0) & 0xFFFFFFFC) >>> 0;

    
    if (cpu.IsRamAddress(address)) {
        return cpu.ReadRam32(address);
    }
    
    if (cpu.IsRomAddress(address)) {
        return cpu.uint32Array[address / 4];
    }

    //if (cpu.IsPeripheralAddress(address)) { // Maybe not needed ? Put in for rom disassemble
        return cpu.ReadPeripheral(address, 32);
    //}
    
    //return 0;
   
};

cpu.SlowRead32 = function(address) {
   
    //Slow - Trying to make disassembly work again

    address = ((address >>> 2) << 2) >>> 0;
    
    // Slow    
    if (simulator.generateReferences) {
        simulator.disa.AddReference(address, simulator.address, "Simulator (Read)");
        simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Read)");
    }

    
    if (!simulator.disassemble) {
        if (cpu.IsRamAddress(address)) {
            return cpu.ReadRam32(address);
        }
    }
    
    if (cpu.IsRomAddress(address)) {
        return cpu.uint32Array[address / 4];
    }

    if (!simulator.disassemble) {
        if (cpu.IsPeripheralAddress(address)) { // Maybe not needed ? Put in for rom disassemble
            return cpu.ReadPeripheral(address, 32);
        }
    }
    
    return 0;
    
};

cpu.Read32Disassemble = function(address) {
    address = ((address >>> 2) << 2) >>> 0;
    if (cpu.IsRomAddress(address)) {
        return cpu.uint32Array[address / 4];
    } else if (cpu.IsRamAddress(address)) {
        return cpu.ReadRam32(address);
    } else if (cpu.IsPeripheralAddress(address)) {
        return cpu.ReadPeripheral(address, 32);
    }

    return 0;
};

cpu.FastRead16 = function(address) {
    address = ((address >>> 1) << 1) >>> 0;
    
    if (address < cpu.romSize) {
        return cpu.uint16Array[address / 2];
    } else {
        return cpu.ReadRam16(address);
    }
    
    /*if (cpu.IsRamAddress(address)) {
        return cpu.ReadRam16(address);
    }
    
    return cpu.uint16Array[address / 2];*/
};

cpu.SlowRead16 = function(address) {
    //Slow - Trying to make disassembly work again
    
    address = ((address >>> 1) << 1) >>> 0;
    
    
    if (simulator.generateReferences) {
        simulator.disa.AddReference(address, simulator.address, "Simulator (Read)");
        simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Read)");
    }


    if (!simulator.disassemble) {        
        if (cpu.IsRamAddress(address)) {
            return cpu.ReadRam16(address);
        }
    }
    
    if (cpu.IsRomAddress(address)) {
        return cpu.uint16Array[address / 2];
    } 
    
    return 0;
        
    
};

cpu.Read16Disassemble = function(address) {
    address = ((address >>> 1) << 1) >>> 0;
    if (cpu.IsRomAddress(address)) {
        return cpu.uint16Array[address / 2];
    } else if (cpu.IsRamAddress(address)) {
        return cpu.ReadRam16(address);
    } else {
        return cpu.ReadPeripheral(address, 16);
    }
};

cpu.FastRead8 = function(address) {
    address = address >>> 0;

    if (cpu.IsRamAddress(address)) {
        return cpu.ReadRam8(address);
    }
    
    if (cpu.IsRomAddress(address)) {
        return cpu.uint8Array[address];
    } 
};

cpu.SlowRead8 = function(address) {
 // Slow    
    if (simulator.generateReferences) {
        simulator.disa.AddReference(address, simulator.address, "Simulator (Read)");
        simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Read)");
    }
    
    if (!simulator.disassemble) {
        

        if (cpu.IsRamAddress(address)) {
            return cpu.ReadRam8(address);
        }
        
        if (cpu.IsRomAddress(address)) {
            return cpu.uint8Array[address];
        } 
        
        console.log("BANG8");
        //    return cpu.ReadPeripheral(address, 8);
        
    }

    return 0;
};

cpu.DMARead = function(address, end) {
    //return simulator.disa.map.mapData.slice(address, address + length);
    var length = end - address;
    var ab = new ArrayBuffer(length + 4);
    var view = new DataView(ab);
    for (var a = 0; a < length; a += 4) {
        view.setUint32(a, cpu.Read32(a + address), false);
    }
    return ab;
};

cpu.ReadPeripheral = function(address, bitLength) {
    var index = ((((address - simulator.peripheralBase) >>> 0) >>> 2) >>> 0);

    var handler = io.peripheral[index];
    if (handler !== undefined) {
        var data = handler(address, bitLength);

        if (simulator.disassemble) {
            var symbol = cpu.GetSymbolName(address);
            simulator.SideEffect(symbol + " => #" + ToHex(data));
        }

        return data >>> 0;
    } else {
        var y = 1;
        return 0;
    }
};

cpu.WritePeripheral = function(address, data, bitLength) {
    //io.peripheral[((((address - simulator.peripheralBase) >>> 0) >>> 2) >>> 0)](data);
    var handler = io.peripheral[((((address - simulator.peripheralBase) >>> 0) >>> 2) >>> 0)];
    if (handler !== undefined) {
        handler(data);
    } else {
        console.log("Invalid peripheral write at " + ToHex(simulator.address) + " to " + ToHex(data));
        simulator.yield = simulator.stop = 1;
    }

};

cpu.WriteVideoRam = function(address, data, bitLength) {
    var index = (address - 0x20000000) >>> 0;
    var video = io.video;
    //var pixelArray = video.imageData[video.frameBuffer].data;//(data >>> 8) | ((data & 0xFF)<<24);
    var pixelArray = video.frameBuffer[io.video.videoRamIndex].imageData.data; //(data >>> 8) | ((data & 0xFF)<<24);

    pixelArray[index++] = (data & 0xFF000000) >>> 24;
    pixelArray[index++] = (data & 0xFF0000) >>> 16;
    pixelArray[index++] = (data & 0xFF00) >>> 8;
    pixelArray[index++] = data & 0xFF;
};

cpu.WriteRam32 = function(address, data) {
    //var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
    //simulator.ram[(alignedAddress - cpu.ramStart)>>>2] = data;
    // var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
    simulator.ram[(address - cpu.ramStart) >>> 2] = data;
};


cpu.WriteRam16 = function(address, data) {
    var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
    var existingData = simulator.ram[(alignedAddress - cpu.ramStart) >>> 2];
    var offset = address - alignedAddress;
    var existing = ____dv;
    existing.setUint32(0, existingData, false);
    existing.setUint16(offset, data, false);
    simulator.ram[(alignedAddress - cpu.ramStart) >>> 2] = existing.getUint32(0, false);
    return;
};


cpu.WriteRam8 = function(address, data) {
    var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
    var index = (alignedAddress - cpu.ramStart) >>> 2;
    var existingData = simulator.ram[index];
    var offset = address - alignedAddress;
    var existing = ____dv;
    existing.setUint32(0, existingData, false);
    existing.setUint8(offset, data, false);
    simulator.ram[index] = existing.getUint32(0, false);
};


cpu.FastWrite32 = function(_address, _data) {
    //address = ((address >>> 2) << 2) >>> 0;
    var address = _address >>> 0;
    var data = _data >>> 0;
    
     if (cpu.IsRamAddress(address)) {
        cpu.WriteRam32(address, data);
        return;
    }
    if (cpu.IsPeripheralAddress(address)) {
        cpu.WritePeripheral(address, data, 32);
        return;
    }
    if (cpu.IsVideoRamAddress(address)) {
        cpu.WriteVideoRam(address, data, 32);
        return;
    }
};

cpu.SlowWrite32 = function(address, data) {
    //Slow
    if (simulator.generateReferences) {
        simulator.disa.AddReference(address, simulator.address, "Simulator (Write)");
        simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Write)");
    }
    
    if (!simulator.disassemble) {    
        if (cpu.IsRamAddress(address)) {
            cpu.WriteRam32(address, data);
            return;
        }
        if (cpu.IsPeripheralAddress(address)) {
            cpu.WritePeripheral(address, data, 32);
            return;
        }
        if (cpu.IsVideoRamAddress(address)) {
            cpu.WriteVideoRam(address, data, 32);
            return;
        }
    }
};

cpu.FastWrite16 = function(address, data) {
    address = address >>> 0;
    
    cpu.WriteRam16(address, data);
};

cpu.SlowWrite16 = function(address, data) {
    // Slow
    if (simulator.generateReferences) {
        simulator.disa.AddReference(address, simulator.address, "Simulator (Write)");
        simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Write)");
    }
    
    if (!simulator.disassemble) {
        
        cpu.WriteRam16(address, data);
        
        //if (cpu.IsRamAddress(address)) {
        //    cpu.WriteRam16(address, data);
        //} else if (cpu.IsPeripheralAddress(address)) {
        //    cpu.WritePeripheral(address, data, 16);
        //} else if (cpu.IsVideoRamAddress(address)) {
        //    cpu.WriteVideoRam(address, data, 16);
        //}
    }
};

cpu.FastWrite8 = function (address, data) {
     address = address >>> 0;
    
     if (cpu.IsRamAddress(address)) {
        cpu.WriteRam8(address, data);
    } else if (cpu.IsPeripheralAddress(address)) {
        cpu.WritePeripheral(address, data, 8);
    } else if (cpu.IsVideoRamAddress(address)) {
        cpu.WriteVideoRam(address, data, 8);
    } else {
            console.log("%c Bad write to " + ToHex(address) + " at " + ToHex(simulator.address), 'color: red');
            simulator.stop = true;
            simulator.yield = true;
    }
};

cpu.SlowWrite8 = function(address, data) {
    // Slow
    if (simulator.generateReferences) {
        simulator.disa.AddReference(address, simulator.address, "Simulator (Write)");
        simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Write)");
    }
    
    if (!simulator.disassemble) {
        //cpu.WriteRam8(address, data);
        
        if (cpu.IsRamAddress(address)) {
            cpu.WriteRam8(address, data);
        } else if (cpu.IsPeripheralAddress(address)) {
            cpu.WritePeripheral(address, data, 8);
        } else if (cpu.IsVideoRamAddress(address)) {
            cpu.WriteVideoRam(address, data, 8);
        } else {
                console.log("%c Bad write to " + ToHex(address) + " at " + ToHex(simulator.address), 'color: red');
                simulator.stop = true;
                simulator.yield = true;
        }
    }
};

cpu._Write = function(address, data, bitLength) {
    if (!simulator.disassemble) {
        address = cpu.PrepareAddress(address, bitLength);
        //AssertAddressValid(address);
        //AssertDataValid(data);
        //AssertBitLengthValid(bitLength);



        //simulator.lastWriteAddress = address;

        if (simulator.generateReferences) {
            simulator.disa.AddReference(address, simulator.address, "Simulator (Write)");
            simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Write)");
        }


        /*var symbol;
        if (simulator.disassemble) {
            symbol = cpu.GetSymbolName(address); // For side effects
        }*/

        if (cpu.IsRamAddress(address)) {
            cpu.WriteRam(address, data, bitLength);
            /* if (simulator.disassemble) {
                simulator.SideEffect(sprintf("RAM WRITE #%08X => %s from %08X", data, symbol, simulator.address));
            }*/
        } else if (cpu.IsPeripheralAddress(address)) {
            cpu.WritePeripheral(address, data, bitLength);
            /*if (simulator.disassemble) {
                simulator.SideEffect(sprintf("PERIPHERAL #%08X => %s from %08X", data, symbol, simulator.address));
            }*/
        } else if (cpu.IsVideoRamAddress(address)) {
            cpu.WriteVideoRam(address, data, bitLength);
        }
    }
};

cpu.Nop = function() {

};

cpu.NotImplemented = function() {
    simulator.notImplemented = true;
    simulator.yield = true;
};

// T bit ====================================
cpu.SetT = function(t) {
    //AssertDataValid(t);
    if (t) {
        //simulator.registers.sr = cpu.SetBit(simulator.registers.sr, 0);
        simulator.registers.sr = simulator.registers.sr | 1;
    } else {
        //simulator.registers.sr = cpu.ClearBit(simulator.registers.sr, 0);
        simulator.registers.sr = simulator.registers.sr & 0xFFFFFFFE;
    }
    //if (simulator.disassemble) {
    //  simulator.SideEffect(sprintf("T = %d from %08X", t ? 1 : 0, simulator.address));
    //}
};

cpu.GetT = function() {
    //return cpu.BitSet(simulator.registers.sr, 0);
    return (simulator.registers.sr & 1) ? 1 : 0;
};

// M bit ====================================
cpu.SetM = function(m) {
    //AssertDataValid(m);
    if (m) {
        //simulator.registers.sr = cpu.SetBit(simulator.registers.sr, 9);
        simulator.registers.sr = simulator.registers.sr | 0x200;
    } else {
        //simulator.registers.sr = cpu.ClearBit(simulator.registers.sr, 9);
        simulator.registers.sr = simulator.registers.sr & 0xfffffdff;
    }
    //if (simulator.disassemble) {
    //  simulator.SideEffect(sprintf("M = %d from %08X", m ? 1 : 0, simulator.address));
    //}
};

cpu.GetM = function() {
    //return cpu.BitSet(simulator.registers.sr, 9);
    return (simulator.registers.sr & 0x200) ? 1 : 0;
};

// Q bit ====================================
cpu.SetQ = function(q) {
    //AssertDataValid(q);
    if (q) {
        //simulator.registers.sr = cpu.SetBit(simulator.registers.sr, 8);
        simulator.registers.sr |= 0x100;
    } else {
        //simulator.registers.sr = cpu.ClearBit(simulator.registers.sr, 8);
        simulator.registers.sr &= 0xfffffeff;
    }
    //if (simulator.disassemble) {
    //  simulator.SideEffect(sprintf("Q = %d from %08X", q ? 1 : 0, simulator.address));
    //}
};

cpu.GetQ = function() {
    //return cpu.BitSet(simulator.registers.sr, 8);
    return (simulator.registers.sr & 0x100) ? 1 : 0;
};

// R ====================================
cpu.SlowSetR = function(r, v) {
    //AssertRegisterValid(r);
    //AssertDataValid(v);
    //v = v >>> 0;

    if (simulator.disassemble) {
        var se = sprintf("R%d = 0x%08X from %08X (was %08X)", r, v, simulator.address, cpu.GetR(r));
        simulator.log(se);
        simulator.SideEffect(se);
    }

    if (simulator.generateReferences) {
        simulator.disa.AddReference(v, simulator.address, "Simulator (R)");
    }

    simulator.registers.r[r] = v;
};

cpu.SetR = function(r, v) {
    simulator.registers.r[r] = v;
};

cpu.GetR = function(r) {
    //AssertRegisterValid(r);
    //simulator.log(sprintf("GetR%d = 0x%08X", r, simulator.registers.r[r]));
    return simulator.registers.r[r];
};

// FR ====================================
cpu.GetFR = function(r) {
    //AssertRegisterValid(r);
    //simulator.log(sprintf("GetFR%d = 0x%08X", r, simulator.registers.fr[r]));
    return simulator.registers.fr[r];
};

cpu.GetFRFloat32 = function(r) {
    return simulator.frFloat32[r];
};

cpu.SetFRFloat32 = function(r, v) {
    simulator.frFloat32[r] = v;
};

cpu.SetFR = function(r, v) {
    //AssertRegisterValid(r);
    //AssertDataValid(v);
    //v = v >>> 0;

    /*if (simulator.disassemble) {
        var se = sprintf("FR%d = 0x%08X from %08X (was %08X)", r, v, simulator.address, simulator.registers.r[r]);
        simulator.log(se);
        simulator.SideEffect(se);
    }*/

    simulator.registers.fr[r] = v;
};

// GBR ====================================
cpu.GetGBR = function() {
    return simulator.registers.gbr;
};

cpu.SetGBR = function(a) {
    a = a >>> 0;
    //AssertAddressValid(a);
    //simulator.log(sprintf("SetGBR(0x%08X)", a));
    if (simulator.generateReferences) {
        simulator.disa.AddReference(a, simulator.address, "Simulator (GBR)");
    }
    simulator.registers.gbr = a;
};

// VBR ====================================
cpu.GetVBR = function() {
    return simulator.registers.vbr;
};

cpu.SetVBR = function(a) {
    a = a >>> 0;
    //AssertAddressValid(a);
    //simulator.log(sprintf("SetVBR(0x%08X)", a));
    if (simulator.generateReferences) {
        simulator.disa.AddReference(a, simulator.address, "Simulator (VBR)");
    }
    simulator.registers.vbr = a;
};


// FPUL ====================================
cpu.GetFPUL = function() {
    return simulator.registers.fpul;
};

cpu.SetFPUL = function(d) {
    d = d >>> 0;
    simulator.registers.fpul = d;
};


// FPSCR ====================================
cpu.GetFPSCR = function() {
    return simulator.registers.fpscr;
};

cpu.SetFPSCR = function(v) {
    v = v >>> 0;
    simulator.registers.fpscr = v;
};

// PC ====================================
cpu.GetPC = function() {
    return simulator.registers.pc;
};

cpu.SetPC = function(a) {
    a = a >>> 0;

    //AssertAddressValid(a);

    if (simulator.generateReferences) {
        if (simulator.pr_set) {
            simulator.disa.AddReference(a, simulator.address, "Simulator (subroutine call)");
            simulator.disa.AddReference(simulator.address, a, "Reverse Simulator (subroutine call)");
        } else {
            simulator.disa.AddReference(a, simulator.address, "Simulator (branch)");
            simulator.disa.AddReference(simulator.address, a, "Reverse Simulator (branch)");
        }

        simulator.pr_set = undefined;
    }

    //simulator.log(sprintf("SetPC(0x%08X)", a));
    simulator.address = a;

    if (simulator.interactive && !simulator.disassemble) {
        if (simulator.setFromSubroutine) {
            simulator.returnTabStack.push($(".dynamic-tab.active a").data("address"));
            DisaView.prototype.instance.ShowSymbolView(simulator.address);
        } else if (simulator.nextTab) {
            $(".dynamic-tab a[data-address=" + simulator.nextTab + "]").click();
            simulator.nextTab = undefined;
        } else {
            GetDisaView().done(function() {
                this.GotoAddress(simulator.address - 4);
            });
        }
        simulator.setFromSubroutine = undefined;

    }
}

cpu.FastSetPC = function(a) {
    simulator.address = a >>> 0;
};

// MACL ====================================
cpu.GetMACL = function() {
    return simulator.registers.macl;
};

cpu.SetMACL = function(v) {
    v = v >>> 0;
    //AssertDataValid(v);
    simulator.registers.macl = v;
};

// MACL ====================================
cpu.GetMACH = function() {
    return simulator.registers.mach;
};

cpu.SetMACH = function(v) {
    v = v >>> 0;
    //AssertDataValid(v);
    simulator.registers.mach = v;
};

// SR ====================================
cpu.GetSR = function() {
    return simulator.registers.sr;
};

cpu.SetSR = function(v) {
    v = v >>> 0;
    //AssertDataValid(v);
    
    simulator.registers.sr = v & 0x3F3;
    if (simulator.disassemble) {
        simulator.SideEffect(sprintf("SR = %08X", v));
    }
};

// SR.IRB 

cpu.GetInterruptMask = function() {
    return (simulator.registers.sr & 0xF0) >>> 4;
};

// PR ====================================
cpu.GetPR = function() {
    return simulator.registers.pr;
};

cpu.SetPR = function(a) {
    a = a >>> 0;
    //AssertAddressValid(a);
    simulator.registers.pr = a;
    if (simulator.generateReferences || simulator.interactive) {
        simulator.pr_set = true;
        if (simulator.interactive) {

        }
    }
};

// Instructions =========================

cpu.NegcRmRn = function(instruction) {
    //var a = 0;
    //var b = ToSigned(GetR(instruction.m));
    //var borrow = a < b ? 1 : 0;
    //var result = a - b - borrow;
    //SetR(instruction.n, result);
    //return borrow;

    var n = instruction.n,
        m = instruction.m;
    var temp, T = cpu.GetT();
    temp = 0 - cpu.GetR(m);
    cpu.SetR(n, temp - T);
    if (0 < temp) {
        T = 1;
    } else {
        T = 0;
    }
    if (temp < cpu.GetR(n)) {
        T = 1;
    }
    return T;
}

cpu.SubvRmRn = function(m, n) {
    var T, dest, src, ans;
    if (cpu.ToSigned(cpu.GetR(n)) >= 0) {
        dest = 0;
    } else {
        dest = 1;
    }

    if (cpu.ToSigned(cpu.GetR(m)) >= 0) {
        src = 0;
    } else {
        src = 1;
    }
    src += dest;
    cpu.SetR(n, cpu.GetR(n) - cpu.GetR(m));

    if (cpu.ToSigned(cpu.GetR(n)) >= 0) {
        ans = 0;
    } else {
        ans = 1;
    }
    ans += dest;
    if (src == 1) {
        if (ans == 1) {
            T = 1;
        } else {
            T = 0;
        }
    } else {
        T = 0;
    }

    return T;
}

cpu.SubcRmRn = function(instruction) {
    var T = cpu.GetT(),
        n = instruction.n,
        m = instruction.m;
    var tmp0, tmp1;
    tmp1 = cpu.GetR(n) - cpu.GetR(m);
    tmp0 = cpu.GetR(n);
    cpu.SetR(n, tmp1 - T);
    if (tmp0 < tmp1) {
        T = 1;
    } else {
        T = 0;
    }

    if (tmp1 < cpu.GetR(n)) {
        T = 1;
    }

    return T;
}

cpu.BFS = function(d) /* BFS disp */ {
    if (cpu.GetT() !== 0) {
        return;
    }

    var disp;

    if ((d & 0x80) === 0) {
        disp = cpu.ToSigned(0x000000FF & d);
    } else {
        disp = cpu.ToSigned(0xFFFFFF00 | d);
    }

    disp = ((((disp << 1) + cpu.GetPC()) >> 1) << 1);
    cpu.DelayedBranch(disp);

}

cpu.BTS = function(d) /* BFS disp */ {
    if (cpu.GetT() === 0) {
        return;
    }

    var disp;

    if ((d & 0x80) === 0) {
        disp = cpu.ToSigned(0x000000FF & d);
    } else {
        disp = cpu.ToSigned(0xFFFFFF00 | d);
    }

    disp = ((((disp << 1) + cpu.GetPC()) >> 1) << 1);
    cpu.DelayedBranch(disp);

}

cpu.BT = function(d) {
    if (cpu.GetT() !== 1) {
        return;
    }
    var disp;

    if ((d & 0x80) === 0) {
        disp = cpu.ToSigned(0x000000FF & d);
    } else {
        disp = cpu.ToSigned(0xFFFFFF00 | d);
    }

    disp = ((((disp << 1) + cpu.GetPC()) >> 1) << 1);
    cpu.SetPC(disp);

}

cpu.DtRn = function(n) {
    //Rn – 1 → Rn, when Rn is 0, 1 → T. When Rn is nonzero, 0
    var x = cpu.GetR(n);
    x--;
    cpu.SetR(n, x);
    return x === 0;
}

cpu.DispX4ZEPlusPC = function(instruction) {
    //return parseInt(((instruction.d * 4) + GetPC())/4)*4;
    return (((instruction.d << 2) + cpu.GetPC()) >> 2) << 2;
}

cpu.DIV1 = function(m, n) { /* DIV1 Rm,Rn */
    var registers = simulator.registers;
    var tmp0; // unsigned long
    var tmp1; // char 

    var old_q = (registers.sr & 0x100) >>> 8;
    //var old_q = cpu.GetQ()

    var rn = registers.r[n],
        rm = registers.r[m];

    var q = ((0x80000000 & rn) !== 0) >>> 0;

    var m = (registers.sr & 0x200) >>> 9;
    //var m = cpu.GetM();

    rn = (rn << 1) >>> 0;

    //rn = (rn | cpu.GetT()) >>> 0;
    rn = (rn | (registers.sr & 1)) >>> 0;

    if (old_q == 0) {

        if (m == 0) {
            tmp0 = rn;
            rn = (rn - rm) >>> 0;
            tmp1 = (rn > tmp0) >>> 0;
            if (q == 0) {
                q = tmp1;
            } else if (q == 1) {
                q = tmp1 === 0;
            }
        } else if (m == 1) {
            tmp0 = rn;
            rn = (rn + rm) >>> 0;
            tmp1 = (rn < tmp0) >>> 0;
            if (q == 0) {
                q = tmp1 === 0;
            } else if (q == 1) {
                q = tmp1;
            }
        }

    } else if (old_q == 1) {
        if (m == 0) {
            tmp0 = rn;
            rn = (rn + rm) >>> 0;
            tmp1 = (rn < tmp0) >>> 0;
            if (q == 0)
                q = tmp1;
            else if (q == 1)
                q = tmp1 === 0;
        } else if (m == 1) {
            tmp0 = rn;
            n = (rn - rm) >>> 0;
            tmp1 = (rn > tmp0) >>> 0;
            if (q == 0)
                q = tmp1 === 0;
            else if (q == 1)
                q = tmp1;
        }
    }

    cpu.SetQ(q);
    registers.r[n] = rn;

    cpu.SetT(q == m);
}

cpu.MultiplyUint32 = function(a, b) {
    var ah = (a >> 16) & 0xffff, al = a & 0xffff;
    var bh = (b >> 16) & 0xffff, bl = b & 0xffff;
    var high = ((ah * bl) + (al * bh)) & 0xffff;
    return ((high << 16)>>>0) + (al * bl);
}

cpu.OldDMULU = function(instruction) {
    var RnL, RnH, RmL, RmH, Res0, Res1, Res2;
    var temp0, temp1, temp2, temp3;
    RnL = cpu.GetR(instruction.n) & 0x0000FFFF;
    RnH = (cpu.GetR(instruction.n) >> 16) & 0x0000FFFF;
    RmL = cpu.GetR(instruction.m) & 0x0000FFFF;
    RmH = (cpu.GetR(instruction.m) >> 16) & 0x0000FFFF;
    temp0 = RmL * RnL;
    temp1 = RmH * RnL;
    temp2 = RmL * RnH;
    temp3 = RmH * RnH;
    Res2 = 0;
    Res1 = temp1 + temp2;
    if (Res1 < temp1) Res2 += 0x00010000;
    temp1 = (Res1 << 16) & 0xFFFF0000;
    Res0 = temp0 + temp1;
    if (Res0 < temp0) Res2++;
    Res2 = Res2 + ((Res1 >> 16) & 0x0000FFFF) + temp3;
    cpu.SetMACH(Res2);
    cpu.SetMACL(Res0);
};

cpu.DMULU = function(instruction) {
    var RnL, RnH, RmL, RmH, Res0, Res1, Res2;
    var temp0, temp1, temp2, temp3;
    RnL = cpu.GetR(instruction.n) & 0x0000FFFF;
    RnH = (cpu.GetR(instruction.n) >> 16) & 0x0000FFFF;
    RmL = cpu.GetR(instruction.m) & 0x0000FFFF;
    RmH = (cpu.GetR(instruction.m) >> 16) & 0x0000FFFF;
    temp0 = RmL * RnL;
    temp1 = RmH * RnL;
    temp2 = RmL * RnH;
    temp3 = RmH * RnH;
    Res2 = 0;
    Res1 = temp1 + temp2;
    if (Res1 < temp1) Res2 += 0x00010000;
    temp1 = ((Res1 << 16) & 0xFFFF0000) >>> 0;
    Res0 = (temp0 + temp1) >>> 0;
    if (Res0 < temp0) Res2++;
    Res2 = Res2 + ((Res1 >> 16) & 0x0000FFFF) + temp3;
    
    cpu.SetMACH(Res2);
    cpu.SetMACL(Res0);
};

cpu.DMULS = function(instruction) /* DMULS.L Rm,Rn */ {
    var RnL, RnH, RmL, RmH, Res0, Res1, Res2;
    var temp0, temp1, temp2, temp3;
    var tempm, tempn, fnLmL; /* Signed */

    tempn = ToSigned(cpu.GetR(instruction.n));
    tempm = ToSigned(cpu.GetR(instruction.m));
    if (tempn < 0) tempn = 0 - tempn;
    if (tempm < 0) tempm = 0 - tempm;
    if (ToSigned(cpu.GetR(instruction.n) ^ cpu.GetR(instruction.m)) < 0) fnLmL = -1;
    else fnLmL = 0;
    temp1 = tempn >>> 0;
    temp2 = tempm >>> 0;
    RnL = temp1 & 0x0000FFFF;
    RnH = (temp1 >> 16) & 0x0000FFFF;
    RmL = temp2 & 0x0000FFFF;
    RmH = (temp2 >> 16) & 0x0000FFFF;
    temp0 = (RmL * RnL) >>> 0;
    temp1 = (RmH * RnL) >>> 0;
    temp2 = (RmL * RnH) >>> 0;
    temp3 = (RmH * RnH) >>> 0;
    Res2 = 0;
    Res1 = (temp1 + temp2) >>> 0;
    if (Res1 < temp1) {
        Res2 = (Res2 + 0x00010000) >>> 0
    }
    temp1 = (Res1 << 16) & 0xFFFF0000;
    Res0 = (temp0 + temp1) >>> 0;
    if (Res0 < temp0) {
        Res2 = (Res2+1) >>> 0;
    }
    Res2 = (Res2 + ((Res1 >> 16) & 0x0000FFFF) + temp3) >>> 0;
    if (fnLmL < 0) {
        Res2 = ~Res2;
        if (Res0 == 0)
            Res2++;
        else
            Res0 = (~Res0) + 1;
    }
    cpu.SetMACH(Res2 >>> 0);
    cpu.SetMACL(Res0 >>> 0);
};

cpu.DMULSOld = function(instruction) /* DMULS.L Rm,Rn */ {
    var RnL, RnH, RmL, RmH, Res0, Res1, Res2;
    var temp0, temp1, temp2, temp3;
    var tempm, tempn, fnLmL; /* Signed */

    tempn = ToSigned(cpu.GetR(instruction.n));
    tempm = ToSigned(cpu.GetR(instruction.m));
    if (tempn < 0) tempn = 0 - tempn;
    if (tempm < 0) tempm = 0 - tempm;
    if (ToSigned(cpu.GetR(instruction.n) ^ cpu.GetR(instruction.m)) < 0) fnLmL = -1;
    else fnLmL = 0;
    temp1 = tempn >>> 0;
    temp2 = tempm >>> 0;
    RnL = temp1 & 0x0000FFFF;
    RnH = (temp1 >> 16) & 0x0000FFFF;
    RmL = temp2 & 0x0000FFFF;
    RmH = (temp2 >> 16) & 0x0000FFFF;
    temp0 = RmL * RnL;
    temp1 = RmH * RnL;
    temp2 = RmL * RnH;
    temp3 = RmH * RnH;
    Res2 = 0;
    Res1 = temp1 + temp2;
    if (Res1 < temp1) Res2 += 0x00010000;
    temp1 = (Res1 << 16) & 0xFFFF0000;
    Res0 = temp0 + temp1;
    if (Res0 < temp0) Res2++;
    Res2 = Res2 + ((Res1 >> 16) & 0x0000FFFF) + temp3;
    if (fnLmL < 0) {
        Res2 = ~Res2;
        if (Res0 == 0)
            Res2++;
        else
            Res0 = (~Res0) + 1;
    }
    cpu.SetMACH(Res2);
    cpu.SetMACL(Res0);
};

cpu.DIV0S = function(instruction) /* DIV0S Rm,Rn */ {
    if ((cpu.GetR(instruction.n) & 0x80000000) == 0) {
        cpu.SetQ(0);
    } else {
        cpu.SetQ(1);
    }
    if ((cpu.GetR(instruction.m) & 0x80000000) == 0) {
        cpu.SetM(0);
    } else {
        cpu.SetM(1);
    }
    cpu.SetT(!(cpu.GetM() == cpu.GetQ()));
};

cpu.TRAPA = function(instruction) {
    if (!simulator.disassemble) {
        cpu.SetR(15, cpu.GetR(15) - 4);
        cpu.Write32(cpu.GetR(15), cpu.GetSR());
        cpu.SetR(15, cpu.GetR(15) - 4);
        cpu.Write32(cpu.GetR(15), cpu.GetPC() - 2); // Can't be in a delay slot 
        //cpu.SetSR(cpu.GetSR() | 0xF0); // This is wrong!
        cpu.SetPC(cpu.Read32(instruction.i * 4 + cpu.GetVBR()));
    }
};

cpu.RTE = function() /* RTE */ {
    if (!simulator.disassemble) {
        var address = cpu.Read32(cpu.GetR(15)); //+2 TODO: Investigate this
        cpu.SetR(15, cpu.GetR(15) + 4);
        cpu.SetSR(cpu.Read32(cpu.GetR(15)) & 0x0FFF0FFF);
        cpu.SetR(15, cpu.GetR(15) + 4);
        cpu.DelayedBranch(address);

        if (simulator.yieldOnRTE === true) {
            simulator.yieldOnRTE = false;
            simulator.yield = true;
        }
    }
};

cpu.TAS = function(instruction) /* TAS.B @Rn */ {
    var temp;
    var address = cpu.GetR(instruction.n);
    temp = cpu.Read8(address); /* Bus Lock enable */
    if (temp == 0) {
        cpu.SetT(1);
    } else {
        cpu.SetT(0);
    }
    temp |= 0x00000080;
    cpu.Write8(address, temp); /* Bus Lock disable */

};
// Tools ====================================

cpu.IsRomAddress = function(address) {
    return address >= 0 && address < cpu.romSize;
};

cpu.IsRamAddress = function(address) {
    return address >= 0xFFFF0000 && address < 0xFFFFBFFF;
};

cpu.BigIsRamAddress = function(address) {
    //return address >= cpu.ramStart && address < cpu.ramStart+cpu.ramSize;
    return address >= cpu.ramStart && address < cpu.ramEnd;
    //return address >= this.ramStart && address < this.ramEnd;
};

cpu.DefaultIsPeripheralAddress = function(address) {
    return address >= 0xFFFFD000 && address < 0xFFFFF87F;
};

cpu.BigIsPeripheralAddress = function(address) {
    return address >= 0x10000000 && address < 0x100029F7;
};

cpu.IsVideoRamAddress = function(address) {
    return address >= 0x20000000 && address < 0x30000000;
};

cpu.LeftShift = function(x, n) {
    //AssertDataValid(x);
    //AssertDataValid(n);
    //return ToUnsigned((x << n) & 0xFFFFFFFF);
    return (x << n) >>> 0;
};

cpu.EquivalentByte = function(n, m) {
    return (n & 0xFF) === (m & 0xFF) ||
        (n & 0xFF00) === (m & 0xFF00) ||
        (n & 0xFF0000) === (m & 0xFF0000) ||
        (n & 0xFF000000) === (m & 0xFF000000);
}

cpu.RightShift = function(x, n) {
    //AssertDataValid(x);
    //AssertDataValid(n);
    return cpu.ToUnsigned((x >> n) & 0xFFFFFFFF);
}

cpu.ArithmeticShiftRightRn = function(n) {
    //DataValid(n);

    var T, temp;
    if ((cpu.GetR(n) & 0x00000001) === 0) {
        T = 0;
    } else {
        T = 1;
    }

    if ((cpu.GetR(n) & 0x80000000) === 0) {
        temp = 0;
    } else {
        temp = 1;
    }

    cpu.SetR(n, cpu.ToUnsigned((cpu.GetR(n) >> 1)));
    if (temp == 1) {
        cpu.SetR(n, cpu.GetR(n) | 0x80000000);
    } else {
        cpu.SetR(n, cpu.GetR(n) & 0x7FFFFFFF);
    }

    return T;
}

cpu.LogicalShiftRightRn = function(n) {
    //AssertDataValid(n);

    var T;
    if ((cpu.GetR(n) & 0x00000001) === 0) {
        T = 0;
    } else {
        T = 1;
    }
    cpu.SetR(n, cpu.GetR(n) >> 1);
    cpu.SetR(n, cpu.GetR(n) & 0x7FFFFFFF);

    return T;
}

cpu.ShiftLeftRn = function(n) { /* SHAL Rn(Same as SHLL) */

    var T;
    if ((cpu.GetR(n) & 0x80000000) === 0) {
        T = 0;
    } else {
        T = 1;
    }
    cpu.SetR(n, cpu.GetR(n) << 1);
    return T;
}

cpu.BitLength = function(instruction, component) {
    //    return instruction.masks[component].length * 4;
    return instruction.bitLengths[component];
}

cpu.SignExtendAddressComponent = function(instruction, component) {
  /*  var value = instruction[component];
    var bitLength = instruction.instruction.bitLengths[component];

    var signBit = (1 << (bitLength) - 1);
    if (signBit & value) {
        value = cpu.ToUnsigned(value | ((1 << 31) >> 31 - (bitLength)));
    }
    return cpu.ToSigned(value);*/
    
    var value = instruction[component];
    var bitLength = instruction.instruction.bitLengths[component];

    var signBit = (1 << (bitLength) - 1);
    if (signBit & value) {
        value = (value | ((1 << 31) >> 31 - (bitLength))) >>> 0;
    }
    return value|0;
}

cpu.BitMask = function(bitLength) {
    var x = 1;
    for (var i = 0; i < bitLength - 1; i++) {
        x = x | x << 1;
    }

    return x;
}

cpu.To16Bit = function(n) {
    return cpu.BitMask(16) & n;
}

cpu.RotRight = function(n) {
    var T;
    if ((cpu.GetR(n) & 0x00000001) === 0) {
        T = 0;
    } else {
        T = 1;
    }
    cpu.SetR(n, cpu.GetR(n) >> 1);
    if (T == 1) {
        cpu.SetR(n, cpu.GetR(n) | 0x80000000);
    } else {
        cpu.SetR(n, cpu.GetR(n) & 0x7FFFFFFF);
    }

    return T;
}

cpu.RotLeft = function(n) {
    var T;
    if ((cpu.GetR(n) & 0x80000000) === 0) {
        T = 0;
    } else {
        T = 1;
    }
    cpu.SetR(n, cpu.GetR(n) << 1);
    if (T == 1) {
        cpu.SetR(n, cpu.GetR(n) | 0x00000001);
    } else {
        cpu.SetR(n, cpu.GetR(n) & 0xFFFFFFFE);
    }
    return T;
}

cpu.ROTCR = function(instruction) /* ROTCR Rn */ {
    var n = instruction.n;
    var rn = simulator.registers.r[n];
    var temp;
    if ((rn & 0x00000001) == 0)
        temp = 0;
    else
        temp = 1;
    rn = rn >>> 1;

    if (cpu.GetT() == 1) rn |= 0x80000000;
    else rn &= 0x7FFFFFFF;
    if (temp == 1) cpu.SetT(1);
    else cpu.SetT(0);
    simulator.registers.r[n] = rn;
}

cpu.RotWithCarryLeftRn = function(n) {
    var temp;
    var rn = simulator.registers.r[n];
    if ((rn & 0x80000000) === 0) {
        temp = 0;
    } else {
        temp = 1;
    }
    rn = (rn << 1) >>> 0;
    if (cpu.GetT() == 1) {
        rn = rn | 0x00000001;
    } else {
        rn = rn & 0xFFFFFFFE;
    }
    var t;
    if (temp == 1) {
        t = 1;
    } else {
        t = 0;
    }

    simulator.registers.r[n] = rn;
    cpu.SetT(t);
}

cpu.AddWithCarry = function(m, n) {
    var T, tmp0, tmp1;
    tmp1 = cpu.GetR(n) + cpu.GetR(m);
    tmp0 = cpu.GetR(n);
    cpu.SetR(n, tmp1 + cpu.GetT());
    if (tmp0 > tmp1) {
        T = 1;
    } else {
        T = 0;
    }
    if (tmp1 > cpu.GetR(n)) {
        T = 1;
    }
    return T;
}

cpu.AddWithOverflowCheck = function(m, n) { /*ADDV Rm,Rn */
    var T, dest, src, ans;

    if (cpu.ToSigned(cpu.GetR(n)) >= 0) {
        dest = 0;
    } else {
        dest = 1;
    }

    if (cpu.ToSigned(cpu.GetR(m)) >= 0) {
        src = 0;
    } else {
        src = 1;
    }

    src += dest;

    cpu.SetR(n, cpu.GetR(n) + cpu.GetR(m));

    if (cpu.ToSigned(cpu.GetR(n)) >= 0) {
        ans = 0;
    } else {
        ans = 1;
    }
    ans += dest;

    if (src === 0 || src == 2) {
        if (ans == 1) {
            T = 1;
        } else {
            T = 0;
        }
    } else {
        T = 0;
    }

    return T;
}

cpu.SignExtend = function(value, bitLength) {
    //AssertDataValid(value);
    //AssertBitLengthValid(bitLength);

    var signBit = (1 << (bitLength) - 1);
    var result;
    if (signBit & value) {
        result = (value | ((1 << 31) >> 31 - (bitLength))) >>> 0;
    } else {
        result = value;
        if (bitLength == 16) {
            result = result & 0xFFFF;
        } else if (bitLength == 8) {
            result = result & 0xFF;
        }
    }



    //simulator.log(sprintf("SignExtend(0x%08d, %d) = 0x%08d", value, bitLength, result));
    return result;
}

cpu.SwapBottomTwoBytes = function(a) {
    //return "ToUnsigned((" + a + " & 0xFFFF0000) | ((" + a + " & 0xFFF) << 8) | ((" + a + " & 0xFF00) >> 8)))";
    var temp0, temp1, result;
    temp0 = a & 0xffff0000;
    temp1 = (a & 0x000000ff) << 8;
    result = (a >> 8) & 0x000000ff;
    result = result | temp1 | temp0;
    return result;
}

cpu.SwapTwoWords = function(a) {
    //return "ToUnsigned(((" + a + " >> 16) & 0xFFFF) | ToUnsigned((" + a + " << 16) & 0xFFFF0000))";
    var temp;
    temp = (a >> 16) & 0x0000FFFF;
    var result = a << 16;
    result |= temp;
    return result;
}

cpu.Middle32Bits = function(m, n) {
    var temp;
    temp = (m << 16) & 0xFFFF0000;
    var result = (n >> 16) & 0x0000FFFF;
    result |= temp;
    return result;
}

cpu.ZeroExtend = function(i, a) {
    return a & ((1 << i.instruction.instructionBitLength) - 1);
}

cpu.GetSymbolName = function(address) {
    var symbol = simulator.disa.symbols.byAddress[address];

    if (symbol === undefined) {
        if (address >= simulator.disa.map.mapData.byteLength) {
            symbol = sprintf("RAM:#%08X", address);
        } else {
            symbol = sprintf("ROM:#%08X", address);
        }
    } else {
        if (symbol.type == "processor symbol") {
            symbol = symbol.name;
        }
    }

    return symbol;
}
