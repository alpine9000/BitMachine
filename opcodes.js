/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var simulator = {
    instruction : undefined,
    registers  : {
         r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
         gbr : 0xFFFF4024,
         pr: 0,
         pc: 0xFFFF4024     
     },
     sideEffects : "",
     debug: true
 }

simulator.log = function(s) {
    if (simulator.debug) {
        console.log(s)
    }
}

simulator.PopSideEffects = function() {
    var retval = simulator.sideEffects;
    simulator.sideEffects = "";
    return retval;
}

simulator.SideEffect = function(s) {
    if (simulator.sideEffects != "") {
        s = ", " + s ;
    }
    simulator.log(s);
    simulator.sideEffects += s;
 }

var IsRomAddress = function (address) {
    return address >= 0 && address < GetDisa().map.mapData.byteLength;
}

function BitMask(bitLength) {
    var x = 1;
    for (var i = 0; i < bitLength-1; i++) {
        x =  x | x << 1;
    }

    return x;
}

GetSymbolName = function (address) {
    var symbol = GetDisa().symbols.byAddress[address];

    if (symbol == undefined) {
        if (address >= GetDisa().map.mapData.byteLength) {
            symbol = sprintf("RAM:#%08X", address)
        } else {
            symbol = sprintf("ROM:#%08X", address)
        }
    } else {        
        if (symbol.type == "processor symbol") {
            symbol = symbol.name;
        
            console.log("Adding reference to " + symbol)        
            GetDisa().AddReference(address, simulator.address, "Simulator");
        }
    }

    return symbol;
}

function BitLength(instruction, component) {
    return instruction.masks[component].length * 4;
}

function SignExtend(value, bitLength) {    
    Wrapper.prototype.seLength = simulator.instructionSize;    
    var signBit = (1 << (bitLength) - 1);
    if (signBit & value) {
        value = ToUnsigned(value | ((1 << 31) >> 31 - (bitLength)));
    }    
    return value;
}

function ReadRam(address, bitLength) {
    var data = ToUnsigned(0xDEAD5EEF & BitMask(bitLength));
    var symbol = GetSymbolName(address, simulator.address);    
    simulator.SideEffect(symbol + " => #" + ToHex(data));
    return data;
}


function ReadRom(address, bitLength) {
    var data = GetDisa().map.GetUint32(address) & BitMask(bitLength);
    var symbol = GetSymbolName(address, simulator.address);    
    simulator.SideEffect(symbol + " => #" + ToHex(data));
    return data;
}

function Read(address, bitLength) {    
    if (IsRomAddress(address)) {                
        return ReadRom(address, bitLength);
    } else {        
        return ReadRam(address, bitLength);        
    }
}

function Write(address, data, bitLength) {
    var symbol = GetSymbolName(address);    
    simulator.SideEffect(sprintf("#%08X => %s", data, symbol));    
}

Disa.prototype.ToJavascript2 = function(text, instruction) {  
    Wrapper.prototype.val = undefined;    
    
    simulator.log(ToHex(simulator.address));
    simulator.log(instruction.instruction.description)

    text = text.replaceAll("\\(", "{");
    text = text.replaceAll("\\)", "}");
    console.log(text)
    text = text.replace("Byte in Rm is zeroextended", "new Wrapper(0xAAAAAAAA)"); //TODO

    text = text.replace("Delayed branch,", "");
    text = text.replace("No operation", "");

    //#imm → Sign extension → Rn  
    //x = Rn(Sign extention(#imm))

    //(Rm) → Sign extension → Rn  
    //x = Rn(Sig extention(Indirect(Rm())))

    //R0 → (disp × 2 + GBR)
    // R0(Indirect(disp × 2 + GBR))

    //(disp × 2 + Rm) → Sign extension → R0
    //R0(SignExtenstion(Indirect(disp × 2 + Rm)))

    //text = text.replace("{disp × 2 + GBR}", "new Wrapper('IA(disp * 2 + GBR)')");
    //text = text.replace("{disp × 2 + Rm}", "new Wrapper('IA(disp * 2 + simulator.registers.r[simulator.instruction.m])')");
    text = text.replace("disp × 2 + PC", "new Wrapper(disp * 2 + simulator.registers.pc)");
    text = text.replace("disp × 4 + PC", "new Wrapper(disp * 4 + simulator.registers.pc)");
    
    text = text.replace("Rn + imm", "new Wrapper(simulator.registers.r[simulator.instruction.n] + simulator.instruction.i)");
    text = text.replace("Rn–4", "new Wrapper(simulator.registers.r[simulator.instruction.n] - 4)");
    text = text.replace("Rn – 4", "new Wrapper(simulator.registers.r[simulator.instruction.n] - 4)");
    
    
    // ( -> ""
    // ) -> indirect
    // -4 -> Sub(4)
    // x4 -> Mult(4)

    //text = text.replaceAll("{Rm}", "new Wrapper('IR(simulator.instruction.m)')");
    
    text = text.replaceAll("{", "new IndirectWrapper( ");
    text = text.replaceAll("}", ") ");

    text = text.replaceAll("R0", "new Wrapper('RN(0)')");
    text = text.replaceAll("Rn", "new Wrapper('RN(simulator.instruction.n)')");
    text = text.replaceAll("Rm", "new Wrapper('RN(simulator.instruction.m)')");
    text = text.replaceAll("<<8", ">>new Wrapper('LeftShift(Wrapper.prototype.val, 8)')");    
    text = text.replaceAll("#imm" , "new Wrapper('simulator.instruction.i', BitLength(simulator.instruction.instruction, 'i'))");
    text = text.replaceAll("Sign extension", "new Wrapper('SignExtend(Wrapper.prototype.val, Wrapper.prototype.seLength)')");


    text = text.replaceAll("×", "*");
    text = text.replaceAll("disp", "simulator.instruction.d");
    text = text.replaceAll("GBR", "simulator.registers.gbr");
    text = text.replaceAll("PR", "simulator.registers.pr");
    text = text.replaceAll("PC", "new Wrapper('REG(\"PC\")')");
    

    text = text.replaceAll("→", " >> ");

    if (text.trim() != "") {
        simulator.log("text = " + text)
        eval(text + ", simulator.result = Wrapper.prototype.val")
    }

    return text;
}



function InstructionLength(instruction)  {
    if (instruction.text.indexOf(".B") != -1) {
        return 8;
    } else if (instruction.text.indexOf(".W") != -1) {
        return 16;
    } else {
        return 32;
    }
}

function Wrapper(x, seLength) {
    console.log("Wrapper()")
    this.expression = x;
    if (typeof(seLength) != "undefined") {
        this.seLength = seLength;
    } 
    //console.log("Wrapper(" + x + ") seLength = " + this.seLength + "\n")   
}

Wrapper.prototype.valueOf = function () {
    

    if (this.indirect) {
        console.log("+++need indirect version " + this.expression)
        if (simulator.lhsExpression) {
            console.log("LHS")
            Wrapper.prototype.val = Read(eval(this.expression), simulator.instructionSize);
        } else {
            console.log("RHS")
            Write(eval(this.expression), Wrapper.prototype.val, simulator.instructionSize);
        }
    } else {

        if (this.seLength != undefined) {
            Wrapper.prototype.seLength = this.seLength;
        } else if (Wrapper.prototype.seLength == undefined) {
            Wrapper.prototype.seLength = simulator.instructionSize;
        }

        console.log("+++valueOf " + this.expression + " this.seLength " + this.seLength)

        //console.log("instructionSize " + simulator.instructionSize)
        
        //console.log("LHS == " + (simulator.lhsExpression).toString());
        
        
        if (simulator.lhsExpression) {
            //console.log(this.expression)        
           Wrapper.prototype.val = eval(eval(this.expression));        
        } else {
            //console.log("kaks " + this.expression)
            var result = eval(this.expression);         
            //console.log("var result = " + result);
            if (result.indexOf != undefined && result.indexOf("%RHV%") != -1) {
                result =  result.replaceAll("%RHV%", Wrapper.prototype.val)
                //console.log("evaling " + result)
                eval(result );            
            } else {
                //console.log("XXX" + result + " " + typeof(result))
                Wrapper.prototype.val = result;
            }
            
        }
    }
    

    simulator.lhsExpression = Wrapper.prototype.val == undefined;     
    
    console.log("simulator.lhsExpression = " + simulator.lhsExpression)

    //console.log(sprintf("New val = %08X", Wrapper.prototype.val));  
  
    return Wrapper.prototype.val;
};

Wrapper.prototype.value = function() {    
    return Wrapper.prototype.val;
}

function IndirectWrapper(x) {
    var expression = x;
    if (x.expression != undefined) {
        expression = x.expression;
    }
    console.log("IndirectWrapper("+expression+") + LHS = " + simulator.lhsExpression)
    eval("this.expression = "+ expression);
    this.indirect = true;
    //console.log("Wrapper(" + x + ") seLength = " + this.seLength + "\n")   
}

IndirectWrapper.prototype = Wrapper.prototype;


function SetRegister(n, v) {    
    //console.log(sprintf("---> SetRegister(%d, 0x%08X)", n ,v));
    simulator.SideEffect(sprintf("#%08X => R%d", v, n));
    simulator.registers.r[n] = v;
}

function SetREG(reg, address) {    
    //console.log(sprintf("---> SetRegister(%d, 0x%08X)", n ,v));
    simulator.SideEffect(sprintf("#%08X => %s", address, name));
    simulator.registers[reg] = address;
}

function RN(n) {
    if (simulator.lhsExpression) {
        return "simulator.registers.r["+ n + "]";
    } else {
        return "SetRegister("+n+", %RHV%),simulator.registers.r[" + n + "]";
    }
}

function REG(name) {
    if (simulator.lhsExpression) {
        return "simulator.registers."+name;
    } else {
        return "SetREG('"+name+"',%RHV%),simulator.registers."+name;
    }
}

function IR(n) {
    if (simulator.lhsExpression) {
        return Read(simulator.registers.r[n], simulator.instructionSize);
    } else {        
        return "Write(simulator.registers.r["+ n + "], %RHV%, simulator.instructionSize)";        
    }
}

function IA(address) {
    if (simulator.lhsExpression) {
        return Read(address, simulator.instructionSize);
    } else {        
        return "Write("+address+", %RHV%, simulator.instructionSize)";        
    }
}

function LeftShift(x, n) {
    return ToUnsigned(x << n);
}

function Value(v, bits) {
    this.value = v;
    this.bits = bits;
}

function SignExtend3(v) {
    return SignExtend(v.value, v.bits)
}

function LeftShift8(v) {
    return v << 8;
}

function R14(x) {
    if (typeof(x) != "undefined") {
        console.log(ToHex(x) + "=> R14")
    } else {        
        return "1";
    }        
}

function R0(x) {
    if (typeof(x) != "undefined") {
        console.log(ToHex(x) + "=> R0")
    } else {        
        return "1";
    }        
}

function replace(parts, p, v) {
    for (var i in parts) {
        parts[i] = parts[i].replaceAll(p, v);
    }

    return parts;
}

function Indirect(x) {
    return 20;
}

Disa.prototype.ToJavascript3 = function(text, instruction) {  
    Wrapper.prototype.val = undefined;    
    
    simulator.log(ToHex(simulator.address));
    simulator.log(instruction.instruction.description)

    text = text.replaceAll("<<", "<<LeftShift");    
    text = text.replaceAll("\\(", "Indirect(");      

    var parts = text.split(/→|<</).reverse();
    console.log(parts)

    parts = replace(parts, "#imm" , "new Value(simulator.instruction.i, BitLength(simulator.instruction.instruction, 'i'))");
    parts = replace(parts, "Sign extension", "SignExtend3");    
    parts = replace(parts, "Rn", "R" + simulator.instruction.n);
    parts = replace(parts, "Rm", "R" + simulator.instruction.m);

    console.log(parts[parts.length-1])
    
    if (typeof(eval(parts[parts.length-1])) == "function") {
        parts[parts.length-1] += "()"
    }
    
    var text = "(" + parts.join("(");

    parts.forEach(function (p) { text += ")"});
    
    
    console.log(text)
    
    // Rn<<8 → Rn 

    //#imm → Sign extension → Rn  
    //x = R14(Sign extention(#imm))

    //(Rm) → Sign extension → Rn  
    //x = Rn(Sig extention(Indirect(Rm())))

    //R0 → (disp × 2 + GBR)
    // R0(Indirect(disp × 2 + GBR))

    //(disp × 2 + Rm) → Sign extension → R0
    //R0(SignExtenstion(Indirect(disp × 2 + Rm)))

    //text = text.replace("{disp × 2 + GBR}", "new Wrapper('IA(disp * 2 + GBR)')");
    //text = text.replace("{disp × 2 + Rm}", "new Wrapper('IA(disp * 2 + simulator.registers.r[simulator.instruction.m])')");
  
    return text;
}
