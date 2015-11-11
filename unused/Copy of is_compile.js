var notImplementedExpressions = [
//"MSB of Rn → Q, MSB of Rm → M, M ^ Q → T ",
//"Signed operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits",
//"Unsigned operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits",
"Signed operation of (Rn) × (Rm) + MAC → MAC 32 × 32 + 64 → 64 bits",
"Signed operation of (Rn) × (Rm) + MAC → MAC 16 × 16 + 64 → 64 bits",
"Rn × Rm → MACL, 32 × 32 → 32 bits 2 to 4",
"If (Rn) is 0, 1 → T; 1 → MSB of (Rn)",
"(R0 + GBR) & imm; if the result is 0, 1 → T",

"0 → MACH, MACL ",
"Delayed branch, stack area → PC/SR ",
"Sleep 3",

]

var compiler = {}
compiler.log = function(x) {
//	console.log(x)
}
//(disp × 2 + PC) → Sign extension → Rn 
//SetR(instruction.n, SignExtend(instruction.i, BitLength(instruction.instruction, 'i')));

function findInstruction(t) {
	for (var i in is) {
		if (is[i].text.trim() == t) {
			return is[i];
		}
	}
	
	return undefined;	
}

function processTokens(e, lookup) {
	return common.map(e.split(" "), function(t) {		
		var u = lookup[t];
		if (u != undefined) {
			return u;
		} else {
			throw "Unexpected token ->" + t + "<- in expression " + e			
		}		
	}).join(" ");	
}

function convertMiddle(i, e) {
	compiler.log("MIDDLE " + e);

	var lookup = {
		"sign_extention" : "cpu.SignExtend(result, " + i.instructionBitLength + ")",
		"Rn" : "(cpu.simulator.registers.r[instruction.n]=result(instruction.n, result),result)"

	}
	
	var uCode = processTokens(e, lookup);

	return "result = " + uCode;
}

function convertLHS(i, e) {		
	compiler.log("LHS")

	var withUnsigned = e.indexOf("with_unsigned_data") != -1;
	var withSigned = e.indexOf("with_signed_data") != -1;
	
	e = e.replace("If ", "");
	e = e.replace("if ", "");

	var lookup = {		
		"16": "16",		
		"8": "8",		
		"4": "4",
		"2": "2",
		"1": "1",
		"0": "0",
		"+" : "+",
		"–" : "-",
		"^" : "^",
		"=" : "==",
		">" : ">",
		"&": "&",
		"×": "*",
		"|" : "|",
		"<<" : "<<",
		">>" : ">>>",
		"0x00000000" : "0x00000000",
		"0x3F800000" : "0x3F800000",
		
		"negc_rm_rn" : "cpu.NegcRmRn(instruction)",
		"subc_rm_rn" : "cpu.SubcRmRn(instruction)",
		"subv_rm_rn" : "cpu.SubvRmRn(instruction.m, instruction.n)",
		
		"rts_hook": "cpu.RtsHook(),",
		"subroutine_hook": "cpu.SubroutineHook(),",
		"dt_rn" : "cpu.DtRn(instruction.n)",
		"swap_two_words_rm" : "cpu.SwapTwoWords(simulator.registers.r[instruction.m])",
		"swap_bottom_two_bytes_rm" : "cpu.SwapBottomTwoBytes(simulator.registers.r[instruction.m])",
		"frn_x_frm" : "cpu.FromFloat32(Tcpu.oFloat32(cpu.GetFR(instruction.n))*cpu.ToFloat32(cpu.GetFR(instruction.m)))",
		"fr0_x_frm_plus_frn" : "cpu.FromFloat32(cpu.ToFloat32cpu.(GetFR(0))*cpu.ToFloat32(cpu.GetFR(instruction.m))+cpu.ToFloat32(cpu.GetFR(instruction.n)))",
		"frn_div_frm" :  "cpu.FromFloat32(cpu.ToFloat32(cpu.GetFR(instruction.n))/cpu.ToFloat32(cpu.GetFR(instruction.m)))",
		"frn_plus_frm" : "cpu.FromFloat32(cpu.ToFloat32(cpu.GetFR(instruction.n))+cpu.ToFloat32(cpu.GetFR(instruction.m)))",
		"frn_minus_frm" : "cpu.FromFloat32(cpu.ToFloat32(cpu.GetFR(instruction.n))-cpu.ToFloat32(cpu.GetFR(instruction.m)))",
		"from_float_fpul" : "cpu.FromFloat32(cpu.GetFPUL())",
		"frm_to_int" : "parseInt(cpu.GetFR(instruction.m))",
		"rn_plus_imm" : "simulator.registers.r[instruction.n] + cpu.SignExtend(instruction.i, 8)",
		"rn_zeroextended": "cpu.ZeroExtend(instruction, simulator.registers.r[instruction.n])",
		"rm_zeroextended": "cpu.ZeroExtend(instruction, simulator.registers.r[instruction.m])",
		"with_unsigned_data": ", cpu.NotImplemented()",
		"with_signed_data": ", cpu.NotImplemented()",
		"sign_extend_imm": "cpu.SignExtend(instruction.i, 8)",
		"byte_sign_extend_rm" : "cpu.SignExtend(simulator.registers.r[instruction.m], 8)",
		"word_sign_extend_rm" : "cpu.SignExtend(simulator.registers.r[instruction.m], 16)",
		"rn_and_rm_have_an_equivalent_byte" : "cpu.EquivalentByte(simulator.registers.r[instruction.n], simulator.registers.r[instruction.n])",		
		"frn_gt_frm" : "cpu.ToFloat32(cpu.GetFR(instruction.n)) > ToFloat32(cpu.GetFR(instruction.m))",
		"frn_eq_frm" : "cpu.GetFR(instruction.n) == cpu.GetFR(instruction.m)",
		"rn_and_rm" : "!(simulator.registers.r[instruction.n] & simulator.registers.r[instruction.m])",
		"r0_and_imm" : "!(simulator.registers.r[0] & instruction.i)",
		"rn_gt_eq_rm" : "simulator.registers.r[instruction.n] >= simulator.registers.r[instruction.m]",
		"rn_eq_rm" : "simulator.registers.r[instruction.n] == simulator.registers.r[instruction.m]",
		"rn_eq_zero" : "simulator.registers.r[instruction.n] == 0",
		"rn_ge_zero" : "simulator.registers.r[instruction.n] >= 0",
		"rn_ge_zero_signed" : "cpu.ToSigned(simulator.registers.r[instruction.n]) >= 0",
		"rn_gt_zero_signed" : "cpu.ToSigned(simulator.registers.r[instruction.n]) > 0",
		"r0_eq_imm" : "simulator.registers.r[0] == cpu.ToUnsigned(cpu.SignExtendAddressComponent(instruction, 'i'))",
		"rn_ge_rm_signed" : "cpu.ToSigned(simulator.registers.r[instruction.n]) >= cpu.ToSigned(simulator.registers.r[instruction.m])",
		"rn_gt_rm_signed" : "cpu.ToSigned(simulator.registers.r[instruction.n]) > cpu.ToSigned(simulator.registers.r[instruction.m])",
		"rn_gt_rm_unsigned" : "simulator.registers.r[instruction.n] > simulator.registers.r[instruction.m]", 
		"if_result_is_zero" : "result = (result == 0)",
		"disp_x4_zero_extend_plus_pc" : "cpu.DispX4ZEPlusPC(instruction)",
		"disp_x2_zero_extend_plus_pc" : "(((instruction.d << 1) + cpu.GetPC())>>1)<<1", //"parseInt(((instruction.d * 2) + GetPC())/2)*2",
		"disp_x2_plus_pc" : "(((cpu.SignExtendAddressComponent(instruction, 'd') << 1) + cpu.GetPC())>>1)<<1", //"parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC())/2)*2",
		"middle_32_bits_of_Rm_Rn" : "cpu.Middle32Bits(simulator.registers.r[instruction.m], simulator.registers.r[instruction.n])",
		"rot_right_rn" : "cpu.RotRight(instruction.n)",
		"rot_left_rn" : "cpu.RotLeft(instruction.n)",
		"add_with_carry_rm_rn" : "cpu.AddWithCarry(instruction.m, instruction.n)",
		"add_with_overflow_check_rm_rn" : "cpu.AddWithOverflowCheck(instruction.m, instruction.n)",

		"Carry" : "simulator.carry",
		"Overflow" : "simulator.overflow",
		"Underflow" : "cpu.NotImplemented(),simulator.overflow",
				
		"disp": "instruction.d",		
		"nop": "cpu.Nop()",
		
		"Rn=Rm" : "simulator.registers.r[instruction.n]==simulator.registers.r[instruction.m]",		
		"GBR": "cpu.GetGBR()",
		"VBR": "cpu.GetVBR()",
		"SR": "cpu.GetSR()",
		"PR": "cpu.GetPR()",
		"PC": "cpu.GetPC()",
		"FPUL": "cpu.GetFPUL()",
		"FPSCR" : "cpu.GetFPSCR()",
		"MACH" : "cpu.GetMACH()",
		"MACL" : "cpu.GetMACL()",
		"T": "cpu.GetT()",
		"M": "cpu.GetM()",
		"Q": "cpu.GetQ()",		
		"R0": "simulator.registers.r[0]",		
		"FR0": "cpu.GetFR(0)",
		"~Rm" : "~simulator.registers.r[instruction.m]",
		"Rm": "simulator.registers.r[instruction.m]",
		"@Rm": "cpu.Read(simulator.registers.r[instruction.m])",
		"Rn": "simulator.registers.r[instruction.n]",
		"–FRn":"-1.0*cpu.GetFR(instruction.n)",
		"FRn/FRm": "cpu.GetFR(instruction.n)/cpu.GetFR(instruction.m)",
		"FRn": "cpu.GetFR(instruction.n)",
		"FRm": "cpu.GetFR(instruction.m)",
		"Rn–1" : "simulator.registers.r[instruction.n]-1",
		"Rn–2" : "simulator.registers.r[instruction.n]-2",
		"Rn–4" : "simulator.registers.r[instruction.n]-4",
		"Rn–=4" : "(simulator.registers.r[instruction.n] = simulator.registers.r[instruction.n]-4),simulator.registers.r[instruction.n]",
		"Rn+=4" : "(simulator.registers.r[instruction.n] = simulator.registers.r[instruction.n]+4),simulator.registers.r[instruction.n]",
		"Rm–=4" : "(simulator.registers.r[instruction.m] = simulator.registers.r[instruction.m]-4),simulator.registers.r[instruction.m]",
		"Rm+=4" : "(simulator.registers.r[instruction.m] = simulator.registers.r[instruction.m]+4),simulator.registers.r[instruction.m]",
		"#imm": "instruction.i",				
		"imm": "instruction.i",
		"shift_left" : "cpu.ShiftLeftRn(instruction.n)",
		"shift_right_logical_rn" : "cpu.LogicalShiftRightRn(instruction.n)",
		"shift_right_arithmetic_rn" : "cpu.ArithmeticShiftRightRn(instruction.n)",
		"rn_x_rm_16_x_16" : "cpu.To16Bit(simulator.registers.r[instruction.n]) * cpu.To16Bit(simulator.registers.r[instruction.m])", // TODO: Sign extend ?
		"rn_x_rm_32_x_32" : "simulator.registers.r[instruction.n] * simulator.registers.r[instruction.m]", 
		"unsigned_rn_x_rm_16_x_16" : "cpu.To16Bit(simulator.registers.r[instruction.n]) * cpu.To16Bit(simulator.registers.r[instruction.m])",
		"not_implemented": "Ncpu.otImplemented()"
	};
	

	if (e[0] == "(") {

		return "cpu.Read(" + convertLHS(i, e.slice(1, e.lastIndexOf(")"))) + ", " + i.instructionBitLength + ")";
	}


	var uCode = processTokens(e, lookup);
	
	
	//if (e.indexOf("&") != -1) {		
//		uCode = "ToUnsigned("+uCode+")";
	//}
	
	
	return uCode;
}

function convertRHS(i, e) {	
	var lookup = {
        "fpu.FABS" : "fpu.FABS(instruction)",
        "fpu.FADD" : "fpu.FADD(instruction)",
        "fpu.FCMP_EQ" : "fpu.FCMP_EQ(instruction)",
        "fpu.FCMP_GT" : "fpu.FCMP_GT(instruction)",
        "fpu.FDIV" : "fpu.FDIV(instruction)",
        "fpu.FLDI0" : "fpu.FLDI0(instruction)",
        "fpu.FLDI1" : "fpu.FLDI1(instruction)",
        "fpu.FPUL" : "fpu.FPUL(instruction)",
        "fpu.FLDS" : "fpu.FLDS(instruction)",
        
        
        "fpu.FLOAT" : "fpu.FLOAT(instruction)",
        "fpu.FMAC" : "fpu.FMAC(instruction)",
        "fpu.FMUL" : "fpu.FMUL(instruction)",
        "fpu.FNEG" : "fpu.FNEG(instruction)",
        "fpu.FSTS" : "fpu.FSTS(instruction)",
        "fpu.FSUB" : "fpu.FSUB(instruction)",
        

        "fpu.LDS_RESTORE" : "fpu.LDS_RESTORE(instruction.m)",
        "fpu.LDS" : "fpu.LDS(instruction.m)",
        "fpu.FTRC" : "fpu.FTRC(instruction)",
        
        
        "rot_with_carry_left_rn" : "cpu.RotWithCarryLeftRn(instruction.n)",
        
        "DIV1" : "cpu.DIV1(instruction.m, instruction.n)",
        "DIV0S": "cpu.DIV0S(instruction)",
        "DMULU" : "cpu.DMULU(instruction)",
        "DMULS" : "cpu.DMULS(instruction)",
        "BFS" : "cpu.BFS(instruction.d)",
        "BTS" : "cpu.BTS(instruction.d)",
        "BT"  : "cpu.BT(instruction.d)",
		"(Rn)" : "cpu.Write(Gcpu.etR(instruction.n), result, " + i.instructionBitLength + ")",
		"R0" : "simulator.registers.r[0]=result",
		"FR0" : "cpu.SetFR(0, result)",
		"@Rn" : "cpu.Write(simulator.registers.r[instruction.n], result, " + i.instructionBitLength + ")",
		"@Rm" : "cpu.Write(simulator.registers.r[instruction.m], result, " + i.instructionBitLength + ")",
		"Rn" : "simulator.registers.r[instruction.n]=result",
		"FRn" : "cpu.SetFR(instruction.n, result)",
		"FRm" : "cpu.SetFR(instruction.m, result)",
		"Rm" : "cpu.SetR(instruction.m, result)",
		"GBR" : "cpu.SetGBR(result)",
		"VBR" : "cpu.SetVBR(result)",
		"FPUL" : "cpu.SetFPUL(result)",
		"FPSCR" : "cpu.SetFPSCR(result)",
		"MACH" : "cpu.SetMACH(result)",
		"MACL" : "cpu.SetMACL(result)",
		"Rn–=4" : "cpu.SetR(instruction.n, simulator.registers.r[instruction.n]-4)",
		"Rn+=4" : "cpu.SetR(instruction.n, simulator.registers.r[instruction.n]+4)",
		"Rm–=4" : "cpu.SetR(instruction.m, simulator.registers.r[instruction.m]-4)",
		"Rm+=4" : "cpu.SetR(instruction.m, simulator.registers.r[instruction.m]+4)",
		"T": "cpu.SetT(result)",
		"Q": "cpu.SetQ(result)",
		"M": "cpu.SetM(result)",
		"DelayedPC": "cpu.DelayedBranch(result)",
		"PC" : "cpu.SetPC(result)",
		"PR" : "cpu.SetPR(result)",
		"SR" : "cpu.SetSR( result)",
		"clear_m_q_t" : "cpu.SetM(0), cpu.SetQ(0), cpu.SetT(0)",
		"nop": "cpu.Nop()",
		"not_implemented": "cpu.NotImplemented()"
	}

	compiler.log("RHS " + e);
	
	
	if (e[0] == "(" && e[e.length-1] ==")") {
		return "var address = (" + convertLHS(i, e.slice(1, e.length-1)) + ");\n cpu.Write(address, result, " + i.instructionBitLength + ")";
	}	
	
	
	if (i.delayedBranch) {
		e = e.replace("PC", "DelayedPC");
	} 
	
	var uCode = processTokens(e, lookup);	
	
	return uCode;
}
	
function getInstructionBitLength(i) {
	if (i.text.indexOf(".B") != -1) {
		return 8;
	} else if (i.text.indexOf(".W") != -1) {
		return 16;		
	} else {
		return 32;
	}
}

function compileExpression(i, e, a) {
	
	var validSingles = ["SetT(t)","Nop()"];
	var parts = e.split(/→|:/);
	var subExpressions = common.map(parts, function(e) { return e.trim();});
	var result = "";
	
	compiler.log("======================================");
	compiler.log("Expression: " + e);


	if (subExpressions.length == 2) {		
		result = "var result = (" + convertLHS(i, subExpressions[0]) + ");\n\t"+ convertRHS(i, subExpressions[1]);				
	} else if (subExpressions.length == 1 && (subExpressions[0][0] == "I" || subExpressions[0].indexOf("; if the result is ") != -1 || subExpressions[0].indexOf("if") == 0)) { 
		result = "var result = (" + convertLHS(i, subExpressions[0]) + ");\n\tif (!result) { return; }"
	} else if (subExpressions.length == 1 && subExpressions[0] == "Rn & Rm") {
		result = convertLHS(i, subExpressions[0]);		
	} else if (subExpressions.length == 1) {
		result = convertRHS(i, subExpressions[0]);
	} else if (subExpressions.length == 3) {
		result = "var result = (" + convertLHS(i, subExpressions[0]) + ");\n\t"+ convertMiddle(i, subExpressions[1]) + ";\n\t" + convertRHS(i, subExpressions[2]);				
	}
		

	if (result == "") {
		throw "Expression Syntax error (" + subExpressions.length + ")";
	}

	compiler.log("Result => " + result);
	
	return result;
}

function notImplemented(e) {
	return $.inArray(e, notImplementedExpressions) != -1;
}

var instructionIndex = 1;

function compile(i) {
	i.instructionBitLength = getInstructionBitLength(i);
	i.instructionIndex = instructionIndex++;
	compiler.log(i.text);
	compiler.log(i.spec.description+"\n\n");
	var expressions = i.spec.description;

	var compiledExpressions = []
	if (notImplemented(expressions)) {
		compiledExpressions.push("cpu.NotImplemented()\n");
	} else {
        
        expressions = expressions.replace("Single-step division (Rn ÷ Rm) 1 → T", "DIV1")
        expressions = expressions.replace("MSB of Rn → Q, MSB of Rm → M, M ^ Q → T ", "DIV0S")
        expressions = expressions.replace("Unsigned operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits", "DMULU")
        expressions = expressions.replace("Signed operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits", "DMULS")
        expressions = expressions.replace("Delayed branch, if T = 0, disp × 2 + PC → PC; if T = 1, nop", "BFS")
        expressions = expressions.replace("Delayed branch, if T = 1, disp × 2 + PC → PC; if T = 0, nop", "BTS")
        expressions = expressions.replace("If T = 1, disp × 2 + PC → PC; if T = 0, nop", "BT")
    
        expressions = expressions.replace("(long) FRm → FPUL", "fpu.FTRC")
        expressions = expressions.replace("|FRn| → FRn", "fpu.FABS")
        expressions = expressions.replace("FRn + FRm → FRn", "fpu.FADD")
        expressions = expressions.replace("(FRn = FRm)? 1:0 → T", "fpu.FCMP_EQ")
        expressions = expressions.replace("(FRn > FRm)? 1:0 → T", "fpu.FCMP_GT")
        expressions = expressions.replace("FRn/FRm → FRn", "fpu.FDIV")
        expressions = expressions.replace("0x00000000 → FRn", "fpu.FLDI0")
        expressions = expressions.replace("0x3F800000 → FRn", "fpu.FLDI1")
        expressions = expressions.replace("FRm → FPUL", "fpu.FLDS")
        
        expressions = expressions.replace("(float) FPUL → FRn", "fpu.FLOAT")
        expressions = expressions.replace("FR0 × FRm + FRn → FRn", "fpu.FMAC")
        expressions = expressions.replace("FRn × FRm → FRn", "fpu.FMUL")
        expressions = expressions.replace("–FRn → FRn", "fpu.FNEG")
        expressions = expressions.replace("FPUL → FRn", "fpu.FSTS")
        expressions = expressions.replace("FRn – FRm → FRn", "fpu.FSUB")
        
        expressions = expressions.replace("@Rm → FPSCR, Rm+ = 4", "fpu.LDS_RESTORE")
        expressions = expressions.replace("Rm → FPSCR", "fpu.LDS")
        
        
		expressions = expressions.replace("<<", " << ")
		expressions = expressions.replace(">>", " >> ")
		expressions = expressions.replace("Rn– = 4", "Rn–=4")
		expressions = expressions.replace("Rn+ = 4", "Rn+=4")
		expressions = expressions.replace("Rm+ = 4", "Rm+=4")
		
		
		expressions = expressions.replace("T ← Rn ← T", "rot_with_carry_left_rn")
		expressions = expressions.replace("T ← Rn ← MSB", "rot_left_rn → T")
		expressions = expressions.replace("LSB → Rn", "rot_right_rn ")
		expressions = expressions.replace("0 → M/Q/T", "clear_m_q_t")
		
		
		expressions = expressions.replace("If Rn = 0, 1", "rn_eq_zero")
		expressions = expressions.replace("If Rn >= 0, 1", "rn_ge_zero_signed")
		expressions = expressions.replace("If Rn > 0, 1", "rn_gt_zero_signed")
		expressions = expressions.replace("0 → Rn", "shift_right_logical_rn")
		expressions = expressions.replace("MSB → Rn ", "shift_right_arithmetic_rn")
		expressions = expressions.replace("T ← Rn ← 0", "shift_left → T")
		
		
		expressions = expressions.replace("Rn – Rm → Rn, Underflow", "subv_rm_rn")
		expressions = expressions.replace("Rn – Rm – T → Rn, Borrow", "subc_rm_rn")
		expressions = expressions.replace("0 – Rm – T → Rn, Borrow", "negc_rm_rn")
		expressions = expressions.replace("Byte in Rm is signextended","byte_sign_extend_rm")
		expressions = expressions.replace("Word in Rm is signextended","word_sign_extend_rm")
		
		expressions = expressions.replace("R0 & imm; if the result is 0, 1", "r0_and_imm")
		expressions = expressions.replace("PC/SR → stack area", "nop") //TODO
		expressions = expressions.replace("PC → PR", "subroutine_hook PC → PR")
		expressions = expressions.replace("Delayed branch, PR → PC", "Delayed branch, rts_hook PR → PC")
		
		expressions = expressions.replace("If R0 = imm, 1", "r0_eq_imm")
		expressions = expressions.replace("If Rn = Rm, 1", "rn_eq_rm")
		expressions = expressions.replace("If Rn>=Rm with unsigned data, 1", "rn_gt_eq_rm");
		expressions = expressions.replace("If Rn > Rm with signed data, 1", "rn_gt_rm_signed")
		expressions = expressions.replace("If Rn >= Rm with signed data, 1", "rn_ge_rm_signed")
		expressions = expressions.replace("If Rn > Rm with unsigned data, 1 ", "rn_gt_rm_unsigned")
		expressions = expressions.replace("Rn & Rm; if the result is 0, 1", "rn_and_rm")
		expressions = expressions.replace("Rn + Rm + T → Rn, Carry", "add_with_carry_rm_rn")
		expressions = expressions.replace("Rn + Rm → Rn, Overflow", "add_with_overflow_check_rm_rn")
		
		
		expressions = expressions.replace("If Rn and Rm have an equivalent byte, 1", "rn_and_rm_have_an_equivalent_byte")
		expressions = expressions.replace("Rn – 1 → Rn, when Rn is 0, 1 → T. When Rn is nonzero, 0", "dt_rn")
		
		expressions = expressions.replace("Rn × Rm → MACL, 32 × 32 → 32 bits", "rn_x_rm_32_x_32 → MACL")
		expressions = expressions.replace("Signed operation of Rn × Rm → MACL 16 × 16 → 32 bits 1 to 3", "rn_x_rm_16_x_16 → MACL")
		expressions = expressions.replace("Unsigned operation of Rn × Rm → MACL 16 × 16 → 32 bits", "unsigned_rn_x_rm_16_x_16  → MACL")
		
		expressions = expressions.replace("FR0 × FRm + FRn", "fr0_x_frm_plus_frn")
		expressions = expressions.replace("FRn + FRm", "frn_plus_frm")
		expressions = expressions.replace("FRn – FRm", "frn_minus_frm")
		expressions = expressions.replace("FRn × FRm", "frn_x_frm")
		expressions = expressions.replace("FRn/FRm", "frn_div_frm")
		
		expressions = expressions.replace("(long) FRm", "frm_to_int");
		expressions = expressions.replace("(float) FPUL", "from_float_fpul");
		
		expressions = expressions.replace("No operation", "nop")	
		expressions = expressions.replace("Signed operation of", "with_signed_data")	
		expressions = expressions.replace("with signed data", "with_signed_data")
		expressions = expressions.replace("if the result is 0", "if_result_is_zero")
		
		expressions = expressions.replace("Rn + imm", "rn_plus_imm")	
		expressions = expressions.replace("with unsigned data", "with_unsigned_data")	
		expressions = expressions.replace("#imm → Sign extension", "sign_extend_imm")
		expressions = expressions.replace("Sign extension", "sign_extention")
		expressions = expressions.replace("Rm → Swap bottom two bytes", "swap_bottom_two_bytes_rm")
		expressions = expressions.replace("Rm → Swap two consecutive words", "swap_two_words_rm")
		expressions = expressions.replace("Rm: Middle 32 bits of Rn", "middle_32_bits_of_Rm_Rn")
		expressions = expressions.replace("Byte in Rm is zeroextended", "rm_zeroextended")	
		expressions = expressions.replace("Word in Rm is zeroextended", "rm_zeroextended")	
		
		expressions = expressions.replace("(FRn > FRm)? 1:0", "frn_gt_frm")
		expressions = expressions.replace("(FRn = FRm)? 1:0", "frn_eq_frm")
		expressions = expressions.replace("disp × 4 + PC → R0 ", "disp_x4_zero_extend_plus_pc → R0 ")
		expressions = expressions.replace("(disp × 2 + PC)", "(disp_x2_zero_extend_plus_pc)")
		expressions = expressions.replace("disp × 2 + PC", "disp_x2_plus_pc")
		
		
		

		
		//expressions = expressions.replace("", "not_implemented")
		//expressions = expressions.replace("M ^ Q", "m^q")
		
		//expressions = expressions.replace("MSB of Rn", "msb#Rn")		
		//expressions = expressions.replace("MSB of Rm", "msb#Rm")		
		//expressions = expressions.replace("disp × 2 + PC → PC", "se#disp × 2 + PC → PC")		
		//expressions = expressions.replace("1 → T", "SetT(t)")
		/*expressions = expressions.replace("1 Tes", "")
		expressions = expressions.replace("1 Compariso", "")
		expressions = expressions.replace("1 Calculatio", "")	 
		expressions = expressions.replace(" 2/1", "")	 
		expressions = expressions.replace(" 3/1", "")	 
	*/

		expressions = expressions.split(/,|;/);
		
		var result = "";
		
		compiler.log("Num expressions : " + expressions.length)	
		
		if (expressions[0].indexOf("Delayed branch") != -1) {
			i.delayedBranch = true;
			compiler.log("Delayed Branch");
			expressions = common.map(expressions.slice(1), function(e) { return e.trim(); });
		}	

		expressions.forEach(function(e) {
			compiledExpressions.push(compileExpression(i, e));
		});

		compiler.log("uCode: " + compiledExpressions.join("; "));
		compiler.log("========================================================\n\n")
	}

	var result = "";
	result += ("cpu.instructions.instruction" + i.spec.instructionCode + " = function(instruction) {\n");
	result += ("\t// " + i.spec.text + "\n")
	result += ("\t// " + i.spec.description + "\n")
	result += ("\t"+compiledExpressions.join(";\n\t\n"));
	result += (";\n};\n\n")
	result += ("simulator.instructionProcessors[" + i.instructionIndex + "] = cpu.instructions.instruction" + i.spec.instructionCode+";\n\n");
	/*result += ("simulator.instructionProcessors['" + i.spec.instructionCode + "'] = function(instruction) {\n");
	result += ("\t// " + i.spec.text + "\n")
	result += ("\t// " + i.spec.description + "\n")
	result += ("\t"+compiledExpressions.join(";\n\t\n"));
	result += (";\n};\n\n")*/
	
	return result;
}

function go() {
	var results = "";
	is.forEach(function(e) { 
		result = compile(e); 
		if (result != undefined) {
			results += result;
		} 
	})
    
    xxx = results

	return results;
}

eval(go());