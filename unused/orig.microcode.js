/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */
 
 var cpu = {
     instructions : {}
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
}

cpu.AssertRegisterValid = function(n) {
    /*if (typeof(n) == "undefined" || n < 0 || n >= 16) {
        throw "Simulator: Invalid Register";
    }*/
}

cpu.AssertDataValid = function(data) {
    /*if (typeof(data) == "undefined") {
        throw "Simulator: Invalid Data";
    }*/
}

cpu.AssertBitLengthValid = function(length) {
    /*if (typeof(length) == "undefined") {
        throw "Simulator: Invalid Bit Length";
    }

    if (!(length == 32 || length == 16 || length == 8)) {
        throw "Simulator: Invalid Bit Length";
    }*/
}


// Operations ====================================
cpu.PrepareAddress = function(address, bitLength) {
    if (bitLength == 32) {
        address = (address >>> 2)  << 2;
    } else if (bitLength == 16) {
        address = (address >>> 1)  << 1;
    }

    return address >>> 0;
}

cpu.RtsHook = function() {
    if (simulator.interactive) {
        simulator.nextTab = simulator.returnTabStack.pop();
    }
}

cpu.SubroutineHook = function() {
    if (simulator.interactive) {
        simulator.setFromSubroutine = true;
    }
}

cpu.DelayedBranch = function(address) {
    //AssertAddressValid(address);
    if (simulator.delayedBranch !== undefined) {
        //throw "Simulator: Illegal Slot Exception";   
    }
    if (simulator.generateReferences) {
        simulator.disa.AddReference(simulator.address, address, "Simulator (delayed branch)");
    }
    simulator.delayedBranch = address;
}

cpu.ReadPeripheral = function(address, bitLength) {
    var index = ((((address - simulator.peripheralBase) >>>0) >>> 2) >>> 0);
    
    var data = io.peripheral[index]();
    
    if (simulator.disassemble) {
        var symbol = cpu.GetSymbolName(address);
        simulator.SideEffect(symbol + " => #" + ToHex(data));
    }

    return data >>> 0;
}

cpu.ToUnsigned = function(x) {
    return x >>> 0;
}

cpu.ToSigned = function(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    //____dv.setInt32(0, x);
    //return ____dv.getInt32(0);
    x = x >>>0;
    if (0x80000000 & x) {
        return (x & 0x7FFFFFFF) - 2147483648;
    }
    return x;
}

cpu.ToFloat32 = function(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    ____dv.setUint32(0, x, false);
    return ____dv.getFloat32(0, false);
}


cpu.FromFloat32 = function(x) {
    //var dv = new DataView(new ArrayBuffer(4));
    ____dv.setFloat32(0, x, false);
    return ____dv.getUint32(0, false);
}

cpu.BitSet = function(mask, bit) {
    return (mask & (1 << bit)) ? 1 : 0;
} 

cpu.ClearBit = function(mask, bit) {
    return mask &= ~(1 << bit);
}

cpu.SetBit = function(mask, bit) {
    return mask |= (1 << bit);
} 

cpu.ReadRam = function(address, bitLength) {
    
    var symbol;
    if (simulator.disassemble) {
        symbol = cpu.GetSymbolName(address); // For side effects
    }
    
    var alignedAddress = (((address >>>0) >>> 2) << 2) >>> 0;

    var offset = address - alignedAddress;
    var data = simulator.ram[alignedAddress-cpu.ramStart];
    
    if (data === undefined) {
        //data = 0;
        data = 0xDEADBEEF & cpu.BitMask(bitLength);
        if (!simulator.disassemble) {
            console.log("UNINITIALISED RAM READ at #" + ToHex(address) + " => #" + ToHex(data) + " from " + ToHex(simulator.address));
            //simulator.SideEffect("UNINITIALISED RAM READ at #" + ToHex(address) + " => #" + ToHex(data) + " from " + ToHex(simulator.address));
            //simulator.uninitialisedRam[address] = true;
            //simulator.notImplemented = true;
        }
    } else {
        if (bitLength == 32) {
            
        } else if (bitLength == 16) {
            
            if (offset === 0)
            {
                data = data >> 16;
            } else {
                data = data & 0xFFFF;
            }
        } else {
            
            if (offset === 0) {
                data = data >> 24;
            } else if (offset === 1) {
                data = (data >> 16) & 0xFF;
            } else if (offset === 2) {
                data = (data >> 8) & 0xFF;
            } else {
                data = data & 0xFF;
            }
        }
        
        if (simulator.disassemble) {
            simulator.SideEffect(symbol + " => #" + ToHex(data));
        }
    }


    return data;
}

cpu.ReadRom = function(address, bitLength) {
    if (bitLength == 32) {
        data = simulator.disa.map.GetUint32(address);
    } else if (bitLength == 16) {
        data = simulator.disa.map.GetUint16(address);
    } else {
        data = simulator.disa.map.GetUint8(address);
    }
    
    if (simulator.disassemble) {
        var symbol = cpu.GetSymbolName(address);
        simulator.SideEffect(symbol + " => #" + ToHex(data));
    }
    
    return data >>> 0;
}

cpu.Read = function(address, bitLength) {
    if (!simulator.disassemble) {
        address = cpu.PrepareAddress(address, bitLength);
        //AssertAddressValid(address);
        //AssertBitLengthValid(bitLength);
    
        if (simulator.generateReferences) {
            simulator.disa.AddReference(address, simulator.address, "Simulator (Read)");
            simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Read)");
        }
    
        if (cpu.IsRomAddress(address)) {
            return cpu.ReadRom(address, bitLength);
        } else if (cpu.IsRamAddress(address)) {
            return cpu.ReadRam(address, bitLength);
        } else {
            return cpu.ReadPeripheral(address, bitLength);
        }
    }
    
    return 0;
};

cpu.DMARead = function(address, length) {
    return simulator.disa.map.slice(address, length);
};


cpu.WritePeripheral = function(address, data, bitLength) {
    //var index = ((((address - 0xFFFFD000) >>>0) >>> 2) >>> 0);
    var index = ((((address - simulator.peripheralBase) >>>0) >>> 2) >>> 0);
    io.peripheral[index](data);
}

cpu.WriteRam = function(address, data, bitLength) {
    var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;

    var existingData = simulator.ram[alignedAddress-cpu.ramStart];
    if (existingData === undefined) {
        existingData = 0;
    }
    var offset = address - alignedAddress;
    //var ab = new ArrayBuffer(4);
    //var existing = new DataView(ab);
    var existing = ____dv;
    existing.setUint32(0, existingData, false);

    if (bitLength == 32) {
        existing.setUint32(offset, data, false);
    } else if (bitLength == 16) {
        existing.setUint16(offset, data, false);
    } else {
        existing.setUint8(offset, data, false);
    }

    simulator.ram[alignedAddress-cpu.ramStart] = existing.getUint32(0, false);
}

cpu.Write = function(address, data, bitLength) {
    if (!simulator.disassemble) {
        address = cpu.PrepareAddress(address, bitLength);
        //AssertAddressValid(address);
        //AssertDataValid(data);
        //AssertBitLengthValid(bitLength);
    
    
    
        simulator.lastWriteAddress = address;
    
        if (simulator.generateReferences) {
            simulator.disa.AddReference(address, simulator.address, "Simulator (Write)");
            simulator.disa.AddReference(simulator.address, address, "Reverse Simulator (Write)");
        }
    
    
        var symbol;
        if (simulator.disassemble) {
            symbol = cpu.GetSymbolName(address); // For side effects
        }
    
        if (cpu.IsRamAddress(address)) {
            cpu.WriteRam(address, data, bitLength);
            if (simulator.disassemble) {
                simulator.SideEffect(sprintf("RAM WRITE #%08X => %s from %08X", data, symbol, simulator.address));
            }
        } else if (cpu.IsPeripheralAddress(address)) {
            cpu.WritePeripheral(address, data, bitLength);
            if (simulator.disassemble) {
                simulator.SideEffect(sprintf("PERIPHERAL #%08X => %s from %08X", data, symbol, simulator.address));
            }
        } else {
            //TODO
        }
    }
}

cpu.Nop = function() {

}

cpu.NotImplemented = function() {
    simulator.notImplemented = true;
}



// T bit ====================================
cpu.SetT = function(t) {
    //AssertDataValid(t);
    if (t) {
        simulator.registers.sr = cpu.SetBit(simulator.registers.sr, 0);
    } else {
        simulator.registers.sr = cpu.ClearBit(simulator.registers.sr, 0);
    }
    if (simulator.disassemble) {
        simulator.SideEffect(sprintf("T = %d from %08X", t ? 1 : 0, simulator.address));
    }
}

cpu.GetT = function() {
    return cpu.BitSet(simulator.registers.sr, 0);
}

// M bit ====================================
cpu.SetM = function(m) {
    //AssertDataValid(m);
    if (m) {
        simulator.registers.sr = cpu.SetBit(simulator.registers.sr, 9);
    } else {
        simulator.registers.sr = cpu.ClearBit(simulator.registers.sr, 9);
    }
    if (simulator.disassemble) {
        simulator.SideEffect(sprintf("M = %d from %08X", m ? 1 : 0, simulator.address));
    }
}

cpu.GetM = function() {
    return cpu.BitSet(simulator.registers.sr, 9);
}

// Q bit ====================================
cpu.SetQ = function(q) {
    //AssertDataValid(q);
    if (q) {
        simulator.registers.sr = cpu.SetBit(simulator.registers.sr, 8);
    } else {
        simulator.registers.sr = cpu.ClearBit(simulator.registers.sr, 8);
    }
    if (simulator.disassemble) {
        simulator.SideEffect(sprintf("Q = %d from %08X", q ? 1 : 0, simulator.address));
    }
}

cpu.GetQ = function() {
    return cpu.BitSet(simulator.registers.sr, 8);
}

// R ====================================
cpu.SetR = function(r, v) {
    //AssertRegisterValid(r);
    //AssertDataValid(v);
    v = v >>> 0;
    
    if (simulator.disassemble) {
        var se = sprintf("R%d = 0x%08X from %08X (was %08X)", r, v, simulator.address, simulator.registers.r[r]);
        simulator.log(se);
        simulator.SideEffect(se);
    }

    if (simulator.generateReferences) {
        simulator.disa.AddReference(v, simulator.address, "Simulator (R)");
    }

    simulator.registers.r[r] = v;
}

cpu.FastSetR = function(r, v) {
    simulator.registers.r[r] = v >>> 0;
}

cpu.GetR = function(r) {
    //AssertRegisterValid(r);
    //simulator.log(sprintf("GetR%d = 0x%08X", r, simulator.registers.r[r]));
    return simulator.registers.r[r];
}

// FR ====================================
cpu.GetFR = function(r) {
    //AssertRegisterValid(r);
    //simulator.log(sprintf("GetFR%d = 0x%08X", r, simulator.registers.fr[r]));
    return simulator.registers.fr[r];
}

cpu.SetFR = function(r, v) {
    //AssertRegisterValid(r);
    //AssertDataValid(v);
    v = v >>>0;
    
    if (simulator.disassemble) {
        var se = sprintf("FR%d = 0x%08X from %08X (was %08X)", r, v, simulator.address, simulator.registers.r[r]);
        simulator.log(se);
        simulator.SideEffect(se);
    }
    
    simulator.registers.fr[r] = v;
}

// GBR ====================================
cpu.GetGBR = function() {
    return simulator.registers.gbr;
}

cpu.SetGBR = function(a) {
    a = a >>> 0;
    //AssertAddressValid(a);
    //simulator.log(sprintf("SetGBR(0x%08X)", a));
    if (simulator.generateReferences) {
        simulator.disa.AddReference(a, simulator.address, "Simulator (GBR)");
    }
    simulator.registers.gbr = a;
}

// VBR ====================================
cpu.GetVBR = function() {
    return simulator.registers.vbr;
}

cpu.SetVBR = function(a) {
    a = a >>> 0;
    //AssertAddressValid(a);
    //simulator.log(sprintf("SetVBR(0x%08X)", a));
    if (simulator.generateReferences) {
        simulator.disa.AddReference(a, simulator.address, "Simulator (VBR)");
    }
    simulator.registers.vbr = a;
}


// FPUL ====================================
cpu.GetFPUL = function() {
    return simulator.registers.fpul;
}

cpu.SetFPUL = function(d) {
    d = d >>> 0;
    simulator.registers.fpul = d;
}


// FPSCR ====================================
cpu.GetFPSCR = function() {
    return simulator.registers.fpscr;
}

cpu.SetFPSCR = function(v) {
    v = v >>> 0;
    simulator.registers.fpscr = v;
}

// PC ====================================
cpu.GetPC = function() {
    return simulator.registers.pc;
}

cpu.SetPC = function(a) {
    a = a>>>0;
    
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

    if (simulator.interactive) {
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
  simulator.address = a>>>0;   
}

// MACL ====================================
cpu.GetMACL = function() {
    return simulator.registers.macl;
}

cpu.SetMACL = function(v) {
    v = v >>> 0;
    //AssertDataValid(v);
    simulator.registers.macl = v;
}

// MACL ====================================
cpu.GetMACH = function() {
    return simulator.registers.mach;
}

cpu.SetMACH = function(v) {
    v = v >>> 0;
    //AssertDataValid(v);
    simulator.registers.mach = v;
}

// SR ====================================
cpu.GetSR = function() {
    return simulator.registers.sr;
}

cpu.SetSR = function(v) {
    v = v >>> 0;
    //AssertDataValid(v);
    simulator.registers.sr = v & 0x3F3;
    if (simulator.disassemble) {
        simulator.SideEffect(sprintf("SR = %08X", v));
    }
}

// PR ====================================
cpu.GetPR = function() {
    return simulator.registers.pr;
}

cpu.SetPR = function(a) {
    a = a >>> 0;
    //AssertAddressValid(a);
    simulator.registers.pr = a;
    if (simulator.generateReferences || simulator.interactive) {
        simulator.pr_set = true;
        if (simulator.interactive) {

        }
    }
}

// Instructions =========================

cpu.NegcRmRn = function(instruction) {
    //var a = 0;
    //var b = ToSigned(GetR(instruction.m));
    //var borrow = a < b ? 1 : 0;
    //var result = a - b - borrow;
    //SetR(instruction.n, result);
    //return borrow;
    
    var n = instruction.n, m = instruction.m;
    var temp, T=cpu.GetT();
    temp=0-cpu.GetR(m);
    cpu.SetR(n, temp-T);
    if (0<temp) {
        T=1;
    } else {
        T=0;
    }
    if (temp<cpu.GetR(n)) {
        T=1;
    }
    return T;
}

cpu.SubvRmRn = function(m, n) {
    var T, dest,src,ans;
    if (cpu.ToSigned(cpu.GetR(n))>=0) {
        dest=0;
    } else {
        dest=1;
    }

    if (cpu.ToSigned(cpu.GetR(m))>=0) {
        src=0;
    } else {
        src=1;
    }
    src+=dest;
    cpu.SetR(n, cpu.GetR(n)-cpu.GetR(m));

    if (cpu.ToSigned(cpu.GetR(n))>=0) {
        ans=0;
    } else {
        ans=1;
    }
    ans+=dest;
    if (src==1) {
        if (ans==1) {
            T=1;
        } else {
            T=0;
        }
    } else {
        T=0;
    }
    
    return T;
}

cpu.SubcRmRn = function(instruction) {
    var T = cpu.GetT(), n = instruction.n, m = instruction.m;
    var tmp0,tmp1;
    tmp1=cpu.GetR(n)-cpu.GetR(m);
    tmp0=cpu.GetR(n);
    cpu.SetR(n,tmp1-T);
    if (tmp0<tmp1) {
        T=1;
    } else {
        T=0;
    }
    
    if (tmp1<cpu.GetR(n))  {
        T=1;
    }
    
    return T;
}

cpu.BFS = function(d) /* BFS disp */ {
    if (cpu.GetT() !== 0) { return; }
	
    var disp;
    
    if ((d&0x80)===0) {
        disp=cpu.ToSigned(0x000000FF & d);
    } else {
        disp=cpu.ToSigned(0xFFFFFF00 | d);
    }
    
    disp = ((((disp << 1) + cpu.GetPC())>>1)<<1);
    cpu.DelayedBranch(disp);

}

cpu.BTS = function(d) /* BFS disp */
{
    if (cpu.GetT() === 0) { return; }
	
    var disp;
    
    if ((d&0x80)===0) {
        disp=cpu.ToSigned(0x000000FF & d);
    } else {
        disp=cpu.ToSigned(0xFFFFFF00 | d);
    }
    
    disp = ((((disp << 1) + cpu.GetPC())>>1)<<1);
    cpu.DelayedBranch(disp);

}

cpu.BT = function(d) {
	if (cpu.GetT() !== 1) { return; }
	var disp;
	
    if ((d&0x80)===0) {
        disp=cpu.ToSigned(0x000000FF & d);
    } else {
        disp=cpu.ToSigned(0xFFFFFF00 | d);
    }
    
    disp = ((((disp << 1) + cpu.GetPC())>>1)<<1);
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
    return (((instruction.d << 2) + cpu.GetPC())>>2)<<2;
}

cpu.DIV1 = function(m,n) { /* DIV1 Rm,Rn */
    var tmp0; // unsigned long
    var old_q,tmp1; // char 
    old_q = cpu.GetQ();
    
    cpu.SetQ((0x80000000 & cpu.GetR(n))!==0);
    
    cpu.SetR(n, cpu.GetR(n)<<1);
    cpu.SetR(n, cpu.GetR(n) | cpu.GetT());

    switch(old_q) {
        case 0:
            switch(cpu.GetM()){
                case 0:
                    tmp0 = cpu.GetR(n);
                    cpu.SetR(n, cpu.ToUnsigned(cpu.GetR(n)-cpu.GetR(m)));
                    tmp1 = (cpu.GetR(n)>tmp0) ? 1 : 0;
                    switch(cpu.GetQ()) {
                        case 0:
                            cpu.SetQ(tmp1);
                        break;
                        case 1:
                            cpu.SetQ(tmp1===0);
                        break;
                    }
                break;
                case 1:
                    tmp0=cpu.GetR(n);
                    cpu.SetR(n, cpu.GetR(n)+cpu.GetR(m));
                    tmp1=(cpu.GetR(n)<tmp0) ? 1 : 0;
                    switch(cpu.GetQ()){
                        case 0:
                            cpu.SetQ(tmp1===0);
                        break;
                        case 1:
                            cpu.SetQ(tmp1);
                        break;
                    }
                break;
            }
        break;
        case 1:
            switch(cpu.GetM()){
                case 0:
                    tmp0=cpu.GetR(n);
                    cpu.SetR(n, cpu.GetR(n)+cpu.GetR(m));
                    tmp1=(cpu.GetR(n)<tmp0) ? 1 : 0;
                    switch(cpu.GetQ()){
                        case 0:
                            cpu.SetQ(tmp1);
                        break;
                        case 1:
                            cpu.SetQ(tmp1===0);
                        break;
                    }
                break;
                case 1:
                    tmp0=cpu.GetR(n);
                    cpu.SetR(n, cpu.ToUnsigned(cpu.GetR(n)-cpu.GetR(m)));
                    tmp1=(cpu.GetR(n)>tmp0) ? 1 : 0;
                    switch(cpu.GetQ()){
                        case 0:
                            cpu.SetQ(tmp1===0);
                        break;
                        case 1:
                            cpu.SetQ(tmp1);
                        break;
                    }
                break;
            }
        break;
    }
    return cpu.GetQ()==cpu.GetM();
}
// Tools ====================================

cpu.IsRomAddress = function(address) {
    return address >= 0 && address < simulator.disa.map.mapData.byteLength;
};

cpu.DefaultIsRamAddress = function(address) {
    return address >= 0xFFFF0000 && address < 0xFFFFBFFF;
}

cpu.BigIsRamAddress = function(address) {
    return address >= 0xffdfffff && address < 0xFFFFFFFF;
};

cpu.DefaultIsPeripheralAddress = function(address) {
    return address >= 0xFFFFD000 && address < 0xFFFFF87F;
};

cpu.BigIsPeripheralAddress = function(address) {
    return address >= 0x10000000 && address < 0x1000029F7;
};

cpu.LeftShift = function(x, n) {
    //AssertDataValid(x);
    //AssertDataValid(n);
    //return ToUnsigned((x << n) & 0xFFFFFFFF);
    return (x << n) >>> 0;
}

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
    if ((cpu.GetR(n)&0x00000001)===0) {
        T=0;
    } else {
        T=1;
    }

    if ((cpu.GetR(n)&0x80000000)===0) {
        temp=0;
    } else {
        temp=1;
    }
    
    cpu.SetR(n, cpu.ToUnsigned((cpu.GetR(n) >> 1)));
    if (temp==1) {
        cpu.SetR(n, cpu.GetR(n)|0x80000000);
    } else { 
        cpu.SetR(n, cpu.GetR(n)&0x7FFFFFFF);
    }
    
    return T;
}

cpu.LogicalShiftRightRn = function(n) {
    //AssertDataValid(n);
    
    var T;
    if ((cpu.GetR(n)&0x00000001)===0) {
        T=0;
    } else {
        T=1;
    }
    cpu.SetR(n, cpu.GetR(n)>>1);
    cpu.SetR(n, cpu.GetR(n)&0x7FFFFFFF);

    return T;
}

cpu.ShiftLeftRn = function(n)  { /* SHAL Rn(Same as SHLL) */
    
    var T;
    if ((cpu.GetR(n)&0x80000000)===0) {
        T=0;
    } else {
        T=1;
    }
    cpu.SetR(n, cpu.GetR(n)<<1);
    return T;
}

cpu.BitLength = function(instruction, component) {
//    return instruction.masks[component].length * 4;
    return instruction.bitLengths[component];
}

cpu.SignExtendAddressComponent = function(instruction, component) {
    var value = instruction[component];
    var bitLength = instruction.instruction.bitLengths[component];
    
    var signBit = (1 << (bitLength) - 1);
    if (signBit & value) {
        value = cpu.ToUnsigned(value | ((1 << 31) >> 31 - (bitLength)));
    }
    return cpu.ToSigned(value);
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
    if ((cpu.GetR(n)&0x00000001)===0) {
        T=0;
    } else {
        T=1;
    }
    cpu.SetR(n, cpu.GetR(n)>>1);
    if (T==1) {
        cpu.SetR(n, cpu.GetR(n)|0x80000000);
    } else {
        cpu.SetR(n, cpu.GetR(n) &0x7FFFFFFF);
    }
    
    return T;
}

cpu.RotLeft = function(n) {
    var T;
    if ((cpu.GetR(n)&0x80000000)===0) {
        T=0;
    } else {
        T=1;
    }
    cpu.SetR(n, cpu.GetR(n)<<1);
    if (T==1) {
        cpu.SetR(n, cpu.GetR(n)|0x00000001);
    } else {
        cpu.SetR(n, cpu.GetR(n)&0xFFFFFFFE);
    }
    return T;
}

cpu.RotWithCarryLeftRn = function(n) {
    var temp;
    if ((cpu.GetR(n)&0x80000000)===0) {
        temp=0;
    } else {
        temp=1;
    }
    cpu.SetR(n, cpu.GetR(n)<<1);
    if (cpu.GetT()==1) {
        cpu.SetR(n, cpu.GetR(n)|0x00000001);
    } else {
        cpu.SetR(n, cpu.GetR(n)&0xFFFFFFFE);
    }
    var t;
    if (temp==1) {
        t = 1;
    } else {
        t = 0;
    }
    
    return t;
}

cpu.AddWithCarry = function(m,n) {
    var T, tmp0,tmp1;
    tmp1=cpu.GetR(n)+cpu.GetR(m);
    tmp0=cpu.GetR(n);
    cpu.SetR(n, tmp1+cpu.GetT());
    if (tmp0>tmp1) {
        T=1;
    } else {
        T=0;
    }
    if (tmp1>cpu.GetR(n)) {
        T=1;
    }
    return T;
}

cpu.AddWithOverflowCheck = function(m, n) { /*ADDV Rm,Rn */
    var T,dest,src,ans;
    
    if (cpu.ToSigned(cpu.GetR(n))>=0) {
        dest=0;
    } else {
        dest=1;
    }
    
    if (cpu.ToSigned(cpu.GetR(m))>=0) {
        src=0;
    } else {
        src=1;
    }
    
    src+=dest;
    
    cpu.SetR(n, cpu.GetR(n)+cpu.GetR(m));
    
    if (cpu.ToSigned(cpu.GetR(n))>=0)  {
        ans=0;
    } else {
        ans=1;
    }
    ans+=dest;
    
    if (src===0 || src==2) {
        if (ans==1) {
            T=1;
        } else {
            T=0;
        }
    } else {
        T=0;
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
    }

    //simulator.log(sprintf("SignExtend(0x%08d, %d) = 0x%08d", value, bitLength, result));
    return result;
}

cpu.SwapBottomTwoBytes = function(a) {
    //return "ToUnsigned((" + a + " & 0xFFFF0000) | ((" + a + " & 0xFFF) << 8) | ((" + a + " & 0xFF00) >> 8)))";
    var temp0,temp1, result;
    temp0=a&0xffff0000;
    temp1=(a&0x000000ff)<<8;
    result=(a>>8)&0x000000ff;
    result=result|temp1|temp0;
    return result;
}

cpu.SwapTwoWords = function(a) {
    //return "ToUnsigned(((" + a + " >> 16) & 0xFFFF) | ToUnsigned((" + a + " << 16) & 0xFFFF0000))";
    var temp;
    temp = (a>>16) & 0x0000FFFF;
    var result = a<<16;
    result |= temp;
    return result;
}

cpu.Middle32Bits = function(m, n) {
    var temp;
    temp=(m<<16)&0xFFFF0000;
    var result=(n>>16)&0x0000FFFF;
    result|=temp;
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