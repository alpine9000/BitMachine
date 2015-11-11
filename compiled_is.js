cpu.instructions.instruction1110nnnniiiiiiii = function(instruction) {
	// MOV #imm,Rn 
	// #imm ? Sign extension ? Rn 
	var result = (cpu.SignExtend(instruction.i, 8));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[1] = cpu.instructions.instruction1110nnnniiiiiiii;

cpu.instructions.instruction1001nnnndddddddd = function(instruction) {
	// MOV.W @(disp,PC),Rn 
	// (disp × 2 + PC) ? Sign extension ? Rn 
	var result = (cpu.Read16((((instruction.d << 1) + cpu.GetPC())>>1)<<1));
	result = cpu.SignExtend(result, 16);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[2] = cpu.instructions.instruction1001nnnndddddddd;

cpu.instructions.instruction1101nnnndddddddd = function(instruction) {
	// MOV.L @(disp,PC),Rn 
	// (disp × 4 + PC) ? Rn 
	var result = (cpu.Read32(instruction.d * 4 + cpu.GetPC()));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[3] = cpu.instructions.instruction1101nnnndddddddd;

cpu.instructions.instruction0110nnnnmmmm0011 = function(instruction) {
	// MOV Rm,Rn 
	// Rm ? Rn 
	var result = (cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[4] = cpu.instructions.instruction0110nnnnmmmm0011;

cpu.instructions.instruction0010nnnnmmmm0000 = function(instruction) {
	// MOV.B Rm,@Rn 
	// Rm ? (Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write8(address, result);
};

simulator.instructionProcessors[5] = cpu.instructions.instruction0010nnnnmmmm0000;

cpu.instructions.instruction0010nnnnmmmm0001 = function(instruction) {
	// MOV.W Rm,@Rn 
	// Rm ? (Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write16(address, result);
};

simulator.instructionProcessors[6] = cpu.instructions.instruction0010nnnnmmmm0001;

cpu.instructions.instruction0010nnnnmmmm0010 = function(instruction) {
	// MOV.L Rm,@Rn 
	// Rm ? (Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[7] = cpu.instructions.instruction0010nnnnmmmm0010;

cpu.instructions.instruction0110nnnnmmmm0000 = function(instruction) {
	// MOV.B @Rm,Rn 
	// (Rm) ? Sign extension ? Rn 
	var result = (cpu.Read8(cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 8);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[8] = cpu.instructions.instruction0110nnnnmmmm0000;

cpu.instructions.instruction0110nnnnmmmm0001 = function(instruction) {
	// MOV.W @Rm,Rn 
	// (Rm) ? Sign extension ? Rn 
	var result = (cpu.Read16(cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 16);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[9] = cpu.instructions.instruction0110nnnnmmmm0001;

cpu.instructions.instruction0110nnnnmmmm0010 = function(instruction) {
	// MOV.L @Rm,Rn 
	// (Rm) ? Rn 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[10] = cpu.instructions.instruction0110nnnnmmmm0010;

cpu.instructions.instruction0010nnnnmmmm0100 = function(instruction) {
	// MOV.B Rm,@–Rn 
	// Rn–1 ? Rn, Rm ? (Rn) 
	var result = (cpu.GetR(instruction.n)-1);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write8(address, result);
};

simulator.instructionProcessors[11] = cpu.instructions.instruction0010nnnnmmmm0100;

cpu.instructions.instruction0010nnnnmmmm0101 = function(instruction) {
	// MOV.W Rm,@–Rn 
	// Rn–2 ? Rn, Rm ? (Rn) 
	var result = (cpu.GetR(instruction.n)-2);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write16(address, result);
};

simulator.instructionProcessors[12] = cpu.instructions.instruction0010nnnnmmmm0101;

cpu.instructions.instruction0010nnnnmmmm0110 = function(instruction) {
	// MOV.L Rm,@–Rn 
	// Rn–4 ? Rn, Rm ? (Rn) 
	var result = (cpu.GetR(instruction.n)-4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[13] = cpu.instructions.instruction0010nnnnmmmm0110;

cpu.instructions.instruction0110nnnnmmmm0100 = function(instruction) {
	// MOV.B @Rm+,Rn 
	// (Rm) ? Sign extension ? Rn,Rm + 1 ? Rm 
	var result = (cpu.Read8(cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 8);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetR(instruction.m) + 1);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[14] = cpu.instructions.instruction0110nnnnmmmm0100;

cpu.instructions.instruction0110nnnnmmmm0101 = function(instruction) {
	// MOV.W @Rm+,Rn 
	// (Rm) ? Sign extension ? Rn,Rm + 2 ? Rm 
	var result = (cpu.Read16(cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 16);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetR(instruction.m) + 2);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[15] = cpu.instructions.instruction0110nnnnmmmm0101;

cpu.instructions.instruction0110nnnnmmmm0110 = function(instruction) {
	// MOV.L @Rm+,Rn 
	// (Rm) ? Rn,Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[16] = cpu.instructions.instruction0110nnnnmmmm0110;

cpu.instructions.instruction10000000nnnndddd = function(instruction) {
	// MOV.B R0,@(disp,Rn) 
	// R0 ? (disp + Rn) 
	var result = (cpu.GetR(0));
	var address = (instruction.d + cpu.GetR(instruction.n));
 cpu.Write8(address, result);
};

simulator.instructionProcessors[17] = cpu.instructions.instruction10000000nnnndddd;

cpu.instructions.instruction10000001nnnndddd = function(instruction) {
	// MOV.W R0,@(disp,Rn) 
	// R0 ? (disp × 2 + Rn) 
	var result = (cpu.GetR(0));
	var address = (instruction.d * 2 + cpu.GetR(instruction.n));
 cpu.Write16(address, result);
};

simulator.instructionProcessors[18] = cpu.instructions.instruction10000001nnnndddd;

cpu.instructions.instruction0001nnnnmmmmdddd = function(instruction) {
	// MOV.L Rm,@(disp,Rn) 
	// Rm ? (disp × 4 + Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (instruction.d * 4 + cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[19] = cpu.instructions.instruction0001nnnnmmmmdddd;

cpu.instructions.instruction10000100mmmmdddd = function(instruction) {
	// MOV.B @(disp,Rm),R0 
	// (disp + Rm) ? Sign extension ? R0 
	var result = (cpu.Read8(instruction.d + cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 8);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[20] = cpu.instructions.instruction10000100mmmmdddd;

cpu.instructions.instruction10000101mmmmdddd = function(instruction) {
	// MOV.W @(disp,Rm),R0 
	// (disp × 2 + Rm) ? Sign extension ? R0 
	var result = (cpu.Read16(instruction.d * 2 + cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 16);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[21] = cpu.instructions.instruction10000101mmmmdddd;

cpu.instructions.instruction0101nnnnmmmmdddd = function(instruction) {
	// MOV.L @(disp,Rm),Rn 
	// (disp × 4 + Rm) ? Rn 
	var result = (cpu.Read32(instruction.d * 4 + cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[22] = cpu.instructions.instruction0101nnnnmmmmdddd;

cpu.instructions.instruction0000nnnnmmmm0100 = function(instruction) {
	// MOV.B Rm,@(R0,Rn) 
	// Rm ? (R0 + Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(0) + cpu.GetR(instruction.n));
 cpu.Write8(address, result);
};

simulator.instructionProcessors[23] = cpu.instructions.instruction0000nnnnmmmm0100;

cpu.instructions.instruction0000nnnnmmmm0101 = function(instruction) {
	// MOV.W Rm,@(R0,Rn) 
	// Rm ? (R0 + Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(0) + cpu.GetR(instruction.n));
 cpu.Write16(address, result);
};

simulator.instructionProcessors[24] = cpu.instructions.instruction0000nnnnmmmm0101;

cpu.instructions.instruction0000nnnnmmmm0110 = function(instruction) {
	// MOV.L Rm,@(R0,Rn) 
	// Rm ? (R0 + Rn) 
	var result = (cpu.GetR(instruction.m));
	var address = (cpu.GetR(0) + cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[25] = cpu.instructions.instruction0000nnnnmmmm0110;

cpu.instructions.instruction0000nnnnmmmm1100 = function(instruction) {
	// MOV.B @(R0,Rm),Rn 
	// (R0 + Rm) ? Sign extension ? Rn 
	var result = (cpu.Read8(cpu.GetR(0) + cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 8);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[26] = cpu.instructions.instruction0000nnnnmmmm1100;

cpu.instructions.instruction0000nnnnmmmm1101 = function(instruction) {
	// MOV.W @(R0,Rm),Rn 
	// (R0 + Rm) ? Sign extension ? Rn 
	var result = (cpu.Read16(cpu.GetR(0) + cpu.GetR(instruction.m)));
	result = cpu.SignExtend(result, 16);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[27] = cpu.instructions.instruction0000nnnnmmmm1101;

cpu.instructions.instruction0000nnnnmmmm1110 = function(instruction) {
	// MOV.L @(R0,Rm),Rn 
	// (R0 + Rm) ? Rn 
	var result = (cpu.Read32(cpu.GetR(0) + cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[28] = cpu.instructions.instruction0000nnnnmmmm1110;

cpu.instructions.instruction11000000dddddddd = function(instruction) {
	// MOV.B R0,@(disp,GBR) 
	// R0 ? (disp + GBR) 
	var result = (cpu.GetR(0));
	var address = (instruction.d + cpu.GetGBR());
 cpu.Write8(address, result);
};

simulator.instructionProcessors[29] = cpu.instructions.instruction11000000dddddddd;

cpu.instructions.instruction11000001dddddddd = function(instruction) {
	// MOV.W R0,@(disp,GBR) 
	// R0 ? (disp × 2 + GBR) 
	var result = (cpu.GetR(0));
	var address = (instruction.d * 2 + cpu.GetGBR());
 cpu.Write16(address, result);
};

simulator.instructionProcessors[30] = cpu.instructions.instruction11000001dddddddd;

cpu.instructions.instruction11000010dddddddd = function(instruction) {
	// MOV.L R0,@(disp,GBR) 
	// R0 ? (disp × 4 + GBR) 
	var result = (cpu.GetR(0));
	var address = (instruction.d * 4 + cpu.GetGBR());
 cpu.Write32(address, result);
};

simulator.instructionProcessors[31] = cpu.instructions.instruction11000010dddddddd;

cpu.instructions.instruction11000100dddddddd = function(instruction) {
	// MOV.B @(disp,GBR),R0 
	// (disp + GBR) ? Sign extension ? R0 
	var result = (cpu.Read8(instruction.d + cpu.GetGBR()));
	result = cpu.SignExtend(result, 8);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[32] = cpu.instructions.instruction11000100dddddddd;

cpu.instructions.instruction11000101dddddddd = function(instruction) {
	// MOV.W @(disp,GBR),R0 
	// (disp × 2 + GBR) ? Sign extension ? R0 
	var result = (cpu.Read16(instruction.d * 2 + cpu.GetGBR()));
	result = cpu.SignExtend(result, 16);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[33] = cpu.instructions.instruction11000101dddddddd;

cpu.instructions.instruction11000110dddddddd = function(instruction) {
	// MOV.L @(disp,GBR),R0 
	// (disp × 4 + GBR) ? R0 
	var result = (cpu.Read32(instruction.d * 4 + cpu.GetGBR()));
	cpu.SetR(0, result);
};

simulator.instructionProcessors[34] = cpu.instructions.instruction11000110dddddddd;

cpu.instructions.instruction11000111dddddddd = function(instruction) {
	// MOVA @(disp,PC),R0 
	// disp × 4 + PC ? R0 
	var result = (cpu.DispX4ZEPlusPC(instruction));
	cpu.SetR(0, result);
};

simulator.instructionProcessors[35] = cpu.instructions.instruction11000111dddddddd;

cpu.instructions.instruction0000nnnn00101001 = function(instruction) {
	// MOVT Rn 
	// T ? Rn 
	var result = (cpu.GetT());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[36] = cpu.instructions.instruction0000nnnn00101001;

cpu.instructions.instruction0110nnnnmmmm1000 = function(instruction) {
	// SWAP.B Rm,Rn 
	// Rm ? Swap bottom two bytes ? Rn 
	var result = (cpu.SwapBottomTwoBytes(cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[37] = cpu.instructions.instruction0110nnnnmmmm1000;

cpu.instructions.instruction0110nnnnmmmm1001 = function(instruction) {
	// SWAP.W Rm,Rn 
	// Rm ? Swap two consecutive words ? Rn 
	var result = (cpu.SwapTwoWords(cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[38] = cpu.instructions.instruction0110nnnnmmmm1001;

cpu.instructions.instruction0010nnnnmmmm1101 = function(instruction) {
	// XTRCT Rm,Rn 
	// Rm: Middle 32 bits of Rn ? Rn 
	var result = (cpu.Middle32Bits(cpu.GetR(instruction.m), cpu.GetR(instruction.n)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[39] = cpu.instructions.instruction0010nnnnmmmm1101;

cpu.instructions.instruction0011nnnnmmmm1100 = function(instruction) {
	// ADD Rm,Rn 
	// Rn + Rm ? Rn 
	var result = (cpu.GetR(instruction.n) + cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[40] = cpu.instructions.instruction0011nnnnmmmm1100;

cpu.instructions.instruction0111nnnniiiiiiii = function(instruction) {
	// ADD #imm,Rn 
	// Rn + imm ? Rn 
	var result = (cpu.GetR(instruction.n) + cpu.SignExtend(instruction.i, 8));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[41] = cpu.instructions.instruction0111nnnniiiiiiii;

cpu.instructions.instruction0011nnnnmmmm1110 = function(instruction) {
	// ADDC Rm,Rn 
	// Rn + Rm + T ? Rn, Carry ? T 
	var result = (cpu.AddWithCarry(instruction.m, instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[42] = cpu.instructions.instruction0011nnnnmmmm1110;

cpu.instructions.instruction0011nnnnmmmm1111 = function(instruction) {
	// ADDV Rm,Rn 
	// Rn + Rm ? Rn, Overflow ? T 
	var result = (cpu.AddWithOverflowCheck(instruction.m, instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[43] = cpu.instructions.instruction0011nnnnmmmm1111;

cpu.instructions.instruction10001000iiiiiiii = function(instruction) {
	// CMP/EQ #imm,R0 
	// If R0 = imm, 1 ? T
	var result = (cpu.GetR(0) == cpu.ToUnsigned(cpu.SignExtendAddressComponent(instruction, 'i')));
	cpu.SetT(result);
};

simulator.instructionProcessors[44] = cpu.instructions.instruction10001000iiiiiiii;

cpu.instructions.instruction0011nnnnmmmm0000 = function(instruction) {
	// CMP/EQ Rm,Rn 
	// If Rn = Rm, 1 ? T
	var result = (cpu.GetR(instruction.n) == cpu.GetR(instruction.m));
	cpu.SetT(result);
};

simulator.instructionProcessors[45] = cpu.instructions.instruction0011nnnnmmmm0000;

cpu.instructions.instruction0011nnnnmmmm0010 = function(instruction) {
	// CMP/HS Rm,Rn 
	// If Rn>=Rm with unsigned data, 1 ? T
	var result = (cpu.GetR(instruction.n) >= cpu.GetR(instruction.m));
	cpu.SetT(result);
};

simulator.instructionProcessors[46] = cpu.instructions.instruction0011nnnnmmmm0010;

cpu.instructions.instruction0011nnnnmmmm0011 = function(instruction) {
	// CMP/GE Rm,Rn 
	// If Rn >= Rm with signed data, 1 ? T
	var result = (cpu.ToSigned(cpu.GetR(instruction.n)) >= cpu.ToSigned(cpu.GetR(instruction.m)));
	cpu.SetT(result);
};

simulator.instructionProcessors[47] = cpu.instructions.instruction0011nnnnmmmm0011;

cpu.instructions.instruction0011nnnnmmmm0110 = function(instruction) {
	// CMP/HI Rm,Rn 
	// If Rn > Rm with unsigned data, 1 ? T
	var result = (cpu.GetR(instruction.n) > cpu.GetR(instruction.m));
	cpu.SetT(result);
};

simulator.instructionProcessors[48] = cpu.instructions.instruction0011nnnnmmmm0110;

cpu.instructions.instruction0011nnnnmmmm0111 = function(instruction) {
	// CMP/GT Rm,Rn 
	// If Rn > Rm with signed data, 1 ? T
	var result = (cpu.ToSigned(cpu.GetR(instruction.n)) > cpu.ToSigned(cpu.GetR(instruction.m)));
	cpu.SetT(result);
};

simulator.instructionProcessors[49] = cpu.instructions.instruction0011nnnnmmmm0111;

cpu.instructions.instruction0100nnnn00010101 = function(instruction) {
	// CMP/PL Rn 
	// If Rn > 0, 1 ? T
	var result = (cpu.ToSigned(cpu.GetR(instruction.n)) > 0);
	cpu.SetT(result);
};

simulator.instructionProcessors[50] = cpu.instructions.instruction0100nnnn00010101;

cpu.instructions.instruction0100nnnn00010001 = function(instruction) {
	// CMP/PZ Rn 
	// If Rn >= 0, 1 ? T
	var result = (cpu.ToSigned(cpu.GetR(instruction.n)) >= 0);
	cpu.SetT(result);
};

simulator.instructionProcessors[51] = cpu.instructions.instruction0100nnnn00010001;

cpu.instructions.instruction0010nnnnmmmm1100 = function(instruction) {
	// CMP/STR Rm,Rn 
	// If Rn and Rm have an equivalent byte, 1 ? T
	var result = (cpu.EquivalentByte(cpu.GetR(instruction.n), cpu.GetR(instruction.m)));
	cpu.SetT(result);
};

simulator.instructionProcessors[52] = cpu.instructions.instruction0010nnnnmmmm1100;

cpu.instructions.instruction0011nnnnmmmm0100 = function(instruction) {
	// DIV1 Rm,Rn 
	// Single-step division (Rn ÷ Rm) 1 ? T
	cpu.DIV1(instruction.m, instruction.n);
};

simulator.instructionProcessors[53] = cpu.instructions.instruction0011nnnnmmmm0100;

cpu.instructions.instruction0010nnnnmmmm0111 = function(instruction) {
	// DIV0S Rm,Rn 
	// MSB of Rn ? Q, MSB of Rm ? M, M ^ Q ? T 
	cpu.DIV0S(instruction);
};

simulator.instructionProcessors[54] = cpu.instructions.instruction0010nnnnmmmm0111;

cpu.instructions.instruction0000000000011001 = function(instruction) {
	// DIV0U 
	// 0 ? M/Q/T
	cpu.SetM(0), cpu.SetQ(0), cpu.SetT(0);
};

simulator.instructionProcessors[55] = cpu.instructions.instruction0000000000011001;

cpu.instructions.instruction0011nnnnmmmm1101 = function(instruction) {
	// DMULS.L Rm,Rn 
	// Signed operation of Rn × Rm ? MACH, MACL 32 × 32 ? 64 bits
	cpu.DMULS(instruction);
};

simulator.instructionProcessors[56] = cpu.instructions.instruction0011nnnnmmmm1101;

cpu.instructions.instruction0011nnnnmmmm0101 = function(instruction) {
	// DMULU.L Rm,Rn 
	// Unsigned operation of Rn × Rm ? MACH, MACL 32 × 32 ? 64 bits
	cpu.DMULU(instruction);
};

simulator.instructionProcessors[57] = cpu.instructions.instruction0011nnnnmmmm0101;

cpu.instructions.instruction0100nnnn00010000 = function(instruction) {
	// DT Rn 
	// Rn – 1 ? Rn, when Rn is 0, 1 ? T. When Rn is nonzero, 0 ? T
	var result = (cpu.DtRn(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[58] = cpu.instructions.instruction0100nnnn00010000;

cpu.instructions.instruction0110nnnnmmmm1110 = function(instruction) {
	// EXTS.B Rm,Rn 
	// Byte in Rm is signextended ? Rn 
	var result = (cpu.SignExtend(cpu.GetR(instruction.m), 8));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[59] = cpu.instructions.instruction0110nnnnmmmm1110;

cpu.instructions.instruction0110nnnnmmmm1111 = function(instruction) {
	// EXTS.W Rm,Rn 
	// Word in Rm is signextended ? Rn 
	var result = (cpu.SignExtend(cpu.GetR(instruction.m), 16));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[60] = cpu.instructions.instruction0110nnnnmmmm1111;

cpu.instructions.instruction0110nnnnmmmm1100 = function(instruction) {
	// EXTU.B Rm,Rn 
	// Byte in Rm is zeroextended ? Rn 
	var result = (cpu.ZeroExtend(instruction, cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[61] = cpu.instructions.instruction0110nnnnmmmm1100;

cpu.instructions.instruction0110nnnnmmmm1101 = function(instruction) {
	// EXTU.W Rm,Rn 
	// Word in Rm is zeroextended ? Rn 
	var result = (cpu.ZeroExtend(instruction, cpu.GetR(instruction.m)));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[62] = cpu.instructions.instruction0110nnnnmmmm1101;

cpu.instructions.instruction0000nnnnmmmm1111 = function(instruction) {
	// MAC.L @Rm+,@Rn+ 
	// Signed operation of (Rn) × (Rm) + MAC ? MAC 32 × 32 + 64 ? 64 bits
	cpu.NotImplemented()
;
};

simulator.instructionProcessors[63] = cpu.instructions.instruction0000nnnnmmmm1111;

cpu.instructions.instruction0100nnnnmmmm1111 = function(instruction) {
	// MAC.W @Rm+,@Rn+ 
	// Signed operation of (Rn) × (Rm) + MAC ? MAC 16 × 16 + 64 ? 64 bits
	cpu.NotImplemented()
;
};

simulator.instructionProcessors[64] = cpu.instructions.instruction0100nnnnmmmm1111;

cpu.instructions.instruction0000nnnnmmmm0111 = function(instruction) {
	// MUL.L Rm,Rn 
	// Rn × Rm ? MACL, 32 × 32 ? 32 bits
	var result = (cpu.MultiplyUint32(cpu.GetR(instruction.n), cpu.GetR(instruction.m)));
	cpu.SetMACL(result);
};

simulator.instructionProcessors[65] = cpu.instructions.instruction0000nnnnmmmm0111;

cpu.instructions.instruction0010nnnnmmmm1111 = function(instruction) {
	// MULS.W Rm,Rn 
	// Signed operation of Rn × Rm ? MACL 16 × 16 ? 32 bits 1 to 3
	var result = (cpu.To16Bit(cpu.GetR(instruction.n)) * cpu.To16Bit(cpu.GetR(instruction.m)));
	cpu.SetMACL(result);
};

simulator.instructionProcessors[66] = cpu.instructions.instruction0010nnnnmmmm1111;

cpu.instructions.instruction0010nnnnmmmm1110 = function(instruction) {
	// MULU.W Rm,Rn 
	// Unsigned operation of Rn × Rm ? MACL 16 × 16 ? 32 bits
	var result = (cpu.To16Bit(cpu.GetR(instruction.n)) * cpu.To16Bit(cpu.GetR(instruction.m)));
	cpu.SetMACL(result);
};

simulator.instructionProcessors[67] = cpu.instructions.instruction0010nnnnmmmm1110;

cpu.instructions.instruction0110nnnnmmmm1011 = function(instruction) {
	// NEG Rm,Rn 
	// 0 – Rm ? Rn 
	var result = (0 - cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[68] = cpu.instructions.instruction0110nnnnmmmm1011;

cpu.instructions.instruction0110nnnnmmmm1010 = function(instruction) {
	// NEGC Rm,Rn 
	// 0 – Rm – T ? Rn, Borrow ? T 
	var result = (cpu.NegcRmRn(instruction));
	cpu.SetT(result);
};

simulator.instructionProcessors[69] = cpu.instructions.instruction0110nnnnmmmm1010;

cpu.instructions.instruction0011nnnnmmmm1000 = function(instruction) {
	// SUB Rm,Rn 
	// Rn – Rm ? Rn 
	var result = (cpu.GetR(instruction.n) - cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[70] = cpu.instructions.instruction0011nnnnmmmm1000;

cpu.instructions.instruction0011nnnnmmmm1010 = function(instruction) {
	// SUBC Rm,Rn 
	// Rn – Rm – T ? Rn, Borrow ? T 
	var result = (cpu.SubcRmRn(instruction));
	cpu.SetT(result);
};

simulator.instructionProcessors[71] = cpu.instructions.instruction0011nnnnmmmm1010;

cpu.instructions.instruction0011nnnnmmmm1011 = function(instruction) {
	// SUBV Rm,Rn 
	// Rn – Rm ? Rn, Underflow ? T 
	var result = (cpu.SubvRmRn(instruction.m, instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[72] = cpu.instructions.instruction0011nnnnmmmm1011;

cpu.instructions.instruction0010nnnnmmmm1001 = function(instruction) {
	// AND Rm,Rn 
	// Rn & Rm ? Rn 
	var result = (cpu.GetR(instruction.n) & cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[73] = cpu.instructions.instruction0010nnnnmmmm1001;

cpu.instructions.instruction11001001iiiiiiii = function(instruction) {
	// AND #imm,R0 
	// R0 & imm ? R0 
	var result = (cpu.GetR(0) & instruction.i);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[74] = cpu.instructions.instruction11001001iiiiiiii;

cpu.instructions.instruction11001101iiiiiiii = function(instruction) {
	// AND.B #imm,@(R0,GBR) 
	// (R0 + GBR) & imm ? (R0 + GBR) 
	var result = (cpu.Read8(cpu.GetR(0) + cpu.GetGBR()));
	var address = (cpu.GetR(0) + cpu.GetGBR());
 cpu.Write8(address, result);
};

simulator.instructionProcessors[75] = cpu.instructions.instruction11001101iiiiiiii;

cpu.instructions.instruction0110nnnnmmmm0111 = function(instruction) {
	// NOT Rm,Rn 
	// ~Rm ? Rn 
	var result = (~cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[76] = cpu.instructions.instruction0110nnnnmmmm0111;

cpu.instructions.instruction0010nnnnmmmm1011 = function(instruction) {
	// OR Rm,Rn 
	// Rn | Rm ? Rn 
	var result = (cpu.GetR(instruction.n) | cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[77] = cpu.instructions.instruction0010nnnnmmmm1011;

cpu.instructions.instruction11001011iiiiiiii = function(instruction) {
	// OR #imm,R0 
	// R0 | imm ? R0 
	var result = (cpu.GetR(0) | instruction.i);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[78] = cpu.instructions.instruction11001011iiiiiiii;

cpu.instructions.instruction11001111iiiiiiii = function(instruction) {
	// OR.B #imm,@(R0,GBR) 
	// (R0 + GBR) | imm ? (R0 + GBR) 
	var result = (cpu.Read8(cpu.GetR(0) + cpu.GetGBR()));
	var address = (cpu.GetR(0) + cpu.GetGBR());
 cpu.Write8(address, result);
};

simulator.instructionProcessors[79] = cpu.instructions.instruction11001111iiiiiiii;

cpu.instructions.instruction0100nnnn00011011 = function(instruction) {
	// TAS.B @Rn 
	// If (Rn) is 0, 1 ? T; 1 ? MSB of (Rn)
	cpu.TAS(instruction);
};

simulator.instructionProcessors[80] = cpu.instructions.instruction0100nnnn00011011;

cpu.instructions.instruction0010nnnnmmmm1000 = function(instruction) {
	// TST Rm,Rn 
	// Rn & Rm; if the result is 0, 1 ? T
	var result = (!(cpu.GetR(instruction.n) & cpu.GetR(instruction.m)));
	cpu.SetT(result);
};

simulator.instructionProcessors[81] = cpu.instructions.instruction0010nnnnmmmm1000;

cpu.instructions.instruction11001000iiiiiiii = function(instruction) {
	// TST #imm,R0 
	// R0 & imm; if the result is 0, 1 ? T
	var result = (!(cpu.GetR(0) & instruction.i));
	cpu.SetT(result);
};

simulator.instructionProcessors[82] = cpu.instructions.instruction11001000iiiiiiii;

cpu.instructions.instruction11001100iiiiiiii = function(instruction) {
	// TST.B #imm,@(R0,GBR) 
	// (R0 + GBR) & imm; if the result is 0, 1 ? T
	cpu.NotImplemented()
;
};

simulator.instructionProcessors[83] = cpu.instructions.instruction11001100iiiiiiii;

cpu.instructions.instruction0010nnnnmmmm1010 = function(instruction) {
	// XOR Rm,Rn 
	// Rn ^ Rm ? Rn 
	var result = (cpu.GetR(instruction.n) ^ cpu.GetR(instruction.m));
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[84] = cpu.instructions.instruction0010nnnnmmmm1010;

cpu.instructions.instruction11001010iiiiiiii = function(instruction) {
	// XOR #imm,R0 
	// R0 ^ imm ? R0 
	var result = (cpu.GetR(0) ^ instruction.i);
	cpu.SetR(0, result);
};

simulator.instructionProcessors[85] = cpu.instructions.instruction11001010iiiiiiii;

cpu.instructions.instruction11001110iiiiiiii = function(instruction) {
	// XOR.B #imm,@(R0,GBR) 
	// (R0 + GBR) ^ imm ? (R0 + GBR) 
	var result = (cpu.Read8(cpu.GetR(0) + cpu.GetGBR()));
	var address = (cpu.GetR(0) + cpu.GetGBR());
 cpu.Write8(address, result);
};

simulator.instructionProcessors[86] = cpu.instructions.instruction11001110iiiiiiii;

cpu.instructions.instruction0100nnnn00000100 = function(instruction) {
	// ROTL Rn 
	// T ? Rn ? MSB 
	var result = (cpu.RotLeft(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[87] = cpu.instructions.instruction0100nnnn00000100;

cpu.instructions.instruction0100nnnn00000101 = function(instruction) {
	// ROTR Rn 
	// LSB ? Rn ? T 
	var result = (cpu.RotRight(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[88] = cpu.instructions.instruction0100nnnn00000101;

cpu.instructions.instruction0100nnnn00100100 = function(instruction) {
	// ROTCL Rn 
	// T ? Rn ? T 
	cpu.RotWithCarryLeftRn(instruction.n);
};

simulator.instructionProcessors[89] = cpu.instructions.instruction0100nnnn00100100;

cpu.instructions.instruction0100nnnn00100101 = function(instruction) {
	// ROTCR Rn 
	// T ? Rn ? T 
	cpu.ROTCR(instruction);
};

simulator.instructionProcessors[90] = cpu.instructions.instruction0100nnnn00100101;

cpu.instructions.instruction0100nnnn00100000 = function(instruction) {
	// SHAL Rn 
	// T ? Rn ? 0 
	var result = (cpu.ShiftLeftRn(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[91] = cpu.instructions.instruction0100nnnn00100000;

cpu.instructions.instruction0100nnnn00100001 = function(instruction) {
	// SHAR Rn 
	// MSB ? Rn ? T 
	var result = (cpu.ArithmeticShiftRightRn(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[92] = cpu.instructions.instruction0100nnnn00100001;

cpu.instructions.instruction0100nnnn00000000 = function(instruction) {
	// SHLL Rn 
	// T ? Rn ? 0 
	var result = (cpu.ShiftLeftRn(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[93] = cpu.instructions.instruction0100nnnn00000000;

cpu.instructions.instruction0100nnnn00000001 = function(instruction) {
	// SHLR Rn 
	// 0 ? Rn ? T 
	var result = (cpu.LogicalShiftRightRn(instruction.n));
	cpu.SetT(result);
};

simulator.instructionProcessors[94] = cpu.instructions.instruction0100nnnn00000001;

cpu.instructions.instruction0100nnnn00001000 = function(instruction) {
	// SHLL2 Rn 
	// Rn<<2 ? Rn 
	var result = (cpu.GetR(instruction.n) << 2);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[95] = cpu.instructions.instruction0100nnnn00001000;

cpu.instructions.instruction0100nnnn00001001 = function(instruction) {
	// SHLR2 Rn 
	// Rn>>2 ? Rn 
	var result = (cpu.GetR(instruction.n) >>> 2);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[96] = cpu.instructions.instruction0100nnnn00001001;

cpu.instructions.instruction0100nnnn00011000 = function(instruction) {
	// SHLL8 Rn 
	// Rn<<8 ? Rn 
	var result = (cpu.GetR(instruction.n) << 8);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[97] = cpu.instructions.instruction0100nnnn00011000;

cpu.instructions.instruction0100nnnn00011001 = function(instruction) {
	// SHLR8 Rn 
	// Rn>>8 ? Rn 
	var result = (cpu.GetR(instruction.n) >>> 8);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[98] = cpu.instructions.instruction0100nnnn00011001;

cpu.instructions.instruction0100nnnn00101000 = function(instruction) {
	// SHLL16 Rn 
	// Rn<<16 ? Rn 
	var result = (cpu.GetR(instruction.n) << 16);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[99] = cpu.instructions.instruction0100nnnn00101000;

cpu.instructions.instruction0100nnnn00101001 = function(instruction) {
	// SHLR16 Rn 
	// Rn>>16 ? Rn 
	var result = (cpu.GetR(instruction.n) >>> 16);
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[100] = cpu.instructions.instruction0100nnnn00101001;

cpu.instructions.instruction10001011dddddddd = function(instruction) {
	// BF label 
	// If T = 0, disp × 2 + PC ? PC; if T = 1, nop
	var result = (cpu.GetT() == 0);
	if (!result) { return; };
	
var result = ((((cpu.SignExtendAddressComponent(instruction, 'd') << 1) + cpu.GetPC())>>1)<<1);
	cpu.SetPC(result);
	
var result = (cpu.GetT() == 1);
	if (!result) { return; };
	
cpu.Nop();
};

simulator.instructionProcessors[101] = cpu.instructions.instruction10001011dddddddd;

cpu.instructions.instruction10001111dddddddd = function(instruction) {
	// BF/S label 
	// Delayed branch, if T = 0, disp × 2 + PC ? PC; if T = 1, nop
	cpu.BFS(instruction.d);
};

simulator.instructionProcessors[102] = cpu.instructions.instruction10001111dddddddd;

cpu.instructions.instruction10001001dddddddd = function(instruction) {
	// BT label 
	// If T = 1, disp × 2 + PC ? PC; if T = 0, nop
	cpu.BT(instruction.d);
};

simulator.instructionProcessors[103] = cpu.instructions.instruction10001001dddddddd;

cpu.instructions.instruction10001101dddddddd = function(instruction) {
	// BT/S label 
	// Delayed branch, if T = 1, disp × 2 + PC ? PC; if T = 0, nop
	cpu.BTS(instruction.d);
};

simulator.instructionProcessors[104] = cpu.instructions.instruction10001101dddddddd;

cpu.instructions.instruction1010dddddddddddd = function(instruction) {
	// BRA label 
	// Delayed branch, disp × 2 + PC ? PC 
	var result = ((((cpu.SignExtendAddressComponent(instruction, 'd') << 1) + cpu.GetPC())>>1)<<1);
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[105] = cpu.instructions.instruction1010dddddddddddd;

cpu.instructions.instruction0000mmmm00100011 = function(instruction) {
	// BRAF Rm 
	// Delayed branch, Rm + PC ? PC 
	var result = (cpu.GetR(instruction.m) + cpu.GetPC());
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[106] = cpu.instructions.instruction0000mmmm00100011;

cpu.instructions.instruction1011dddddddddddd = function(instruction) {
	// BSR label 
	// Delayed branch, PC ? PR, disp × 2 + PC ? PC 
	var result = (cpu.SubroutineHook(), cpu.GetPC());
	cpu.SetPR(result);
	
var result = ((((cpu.SignExtendAddressComponent(instruction, 'd') << 1) + cpu.GetPC())>>1)<<1);
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[107] = cpu.instructions.instruction1011dddddddddddd;

cpu.instructions.instruction0000mmmm00000011 = function(instruction) {
	// BSRF Rm 
	// Delayed branch, PC ? PR, Rm + PC ? PC 
	var result = (cpu.SubroutineHook(), cpu.GetPC());
	cpu.SetPR(result);
	
var result = (cpu.GetR(instruction.m) + cpu.GetPC());
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[108] = cpu.instructions.instruction0000mmmm00000011;

cpu.instructions.instruction0100mmmm00101011 = function(instruction) {
	// JMP @Rm 
	// Delayed branch, Rm ? PC 
	var result = (cpu.GetR(instruction.m));
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[109] = cpu.instructions.instruction0100mmmm00101011;

cpu.instructions.instruction0100mmmm00001011 = function(instruction) {
	// JSR @Rm 
	// Delayed branch, PC ? PR, Rm ? PC 
	var result = (cpu.SubroutineHook(), cpu.GetPC());
	cpu.SetPR(result);
	
var result = (cpu.GetR(instruction.m));
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[110] = cpu.instructions.instruction0100mmmm00001011;

cpu.instructions.instruction0000000000001011 = function(instruction) {
	// RTS 
	// Delayed branch, PR ? PC 
	var result = (cpu.RtsHook(), cpu.GetPR());
	cpu.DelayedBranch(result);
};

simulator.instructionProcessors[111] = cpu.instructions.instruction0000000000001011;

cpu.instructions.instruction0000000000001000 = function(instruction) {
	// CLRT 
	// 0 ? T
	var result = (0);
	cpu.SetT(result);
};

simulator.instructionProcessors[112] = cpu.instructions.instruction0000000000001000;

cpu.instructions.instruction0000000000101000 = function(instruction) {
	// CLRMAC 
	// 0 ? MACH, MACL 
	cpu.NotImplemented()
;
};

simulator.instructionProcessors[113] = cpu.instructions.instruction0000000000101000;

cpu.instructions.instruction0100mmmm00001110 = function(instruction) {
	// LDC Rm,SR 
	// Rm ? SR 
	var result = (cpu.GetR(instruction.m));
	cpu.SetSR( result);
};

simulator.instructionProcessors[114] = cpu.instructions.instruction0100mmmm00001110;

cpu.instructions.instruction0100mmmm00011110 = function(instruction) {
	// LDC Rm,GBR 
	// Rm ? GBR 
	var result = (cpu.GetR(instruction.m));
	cpu.SetGBR(result);
};

simulator.instructionProcessors[115] = cpu.instructions.instruction0100mmmm00011110;

cpu.instructions.instruction0100mmmm00101110 = function(instruction) {
	// LDC Rm,VBR 
	// Rm ? VBR 
	var result = (cpu.GetR(instruction.m));
	cpu.SetVBR(result);
};

simulator.instructionProcessors[116] = cpu.instructions.instruction0100mmmm00101110;

cpu.instructions.instruction0100mmmm00000111 = function(instruction) {
	// LDC.L @Rm+,SR 
	// (Rm) ? SR, Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetSR( result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[117] = cpu.instructions.instruction0100mmmm00000111;

cpu.instructions.instruction0100mmmm00010111 = function(instruction) {
	// LDC.L @Rm+,GBR 
	// (Rm) ? GBR, Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetGBR(result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[118] = cpu.instructions.instruction0100mmmm00010111;

cpu.instructions.instruction0100mmmm00100111 = function(instruction) {
	// LDC.L @Rm+,VBR 
	// (Rm) ? VBR, Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetVBR(result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[119] = cpu.instructions.instruction0100mmmm00100111;

cpu.instructions.instruction0100mmmm00001010 = function(instruction) {
	// LDS Rm,MACH 
	// Rm ? MACH 
	var result = (cpu.GetR(instruction.m));
	cpu.SetMACH(result);
};

simulator.instructionProcessors[120] = cpu.instructions.instruction0100mmmm00001010;

cpu.instructions.instruction0100mmmm00011010 = function(instruction) {
	// LDS Rm,MACL 
	// Rm ? MACL 
	var result = (cpu.GetR(instruction.m));
	cpu.SetMACL(result);
};

simulator.instructionProcessors[121] = cpu.instructions.instruction0100mmmm00011010;

cpu.instructions.instruction0100mmmm00101010 = function(instruction) {
	// LDS Rm,PR 
	// Rm ? PR 
	var result = (cpu.GetR(instruction.m));
	cpu.SetPR(result);
};

simulator.instructionProcessors[122] = cpu.instructions.instruction0100mmmm00101010;

cpu.instructions.instruction0100mmmm00000110 = function(instruction) {
	// LDS.L @Rm+,MACH 
	// (Rm) ? MACH, Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetMACH(result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[123] = cpu.instructions.instruction0100mmmm00000110;

cpu.instructions.instruction0100mmmm00010110 = function(instruction) {
	// LDS.L @Rm+,MACL 
	// (Rm) ? MACL, Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetMACL(result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[124] = cpu.instructions.instruction0100mmmm00010110;

cpu.instructions.instruction0100mmmm00100110 = function(instruction) {
	// LDS.L @Rm+,PR 
	// (Rm) ? PR, Rm + 4 ? Rm 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetPR(result);
	
var result = (cpu.GetR(instruction.m) + 4);
	cpu.SetR(instruction.m, result);
};

simulator.instructionProcessors[125] = cpu.instructions.instruction0100mmmm00100110;

cpu.instructions.instruction0000000000001001 = function(instruction) {
	// NOP 
	// No operation 
	cpu.Nop();
};

simulator.instructionProcessors[126] = cpu.instructions.instruction0000000000001001;

cpu.instructions.instruction0000000000101011 = function(instruction) {
	// RTE 
	// Delayed branch, stack area ? PC/SR 
	cpu.RTE();
};

simulator.instructionProcessors[127] = cpu.instructions.instruction0000000000101011;

cpu.instructions.instruction0000000000011000 = function(instruction) {
	// SETT 
	// 1 ? T
	var result = (1);
	cpu.SetT(result);
};

simulator.instructionProcessors[128] = cpu.instructions.instruction0000000000011000;

cpu.instructions.instruction0000000000011011 = function(instruction) {
	// SLEEP 
	// Sleep 3
	cpu.NotImplemented()
;
};

simulator.instructionProcessors[129] = cpu.instructions.instruction0000000000011011;

cpu.instructions.instruction0000nnnn00000010 = function(instruction) {
	// STC SR,Rn 
	// SR ? Rn 
	var result = (cpu.GetSR());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[130] = cpu.instructions.instruction0000nnnn00000010;

cpu.instructions.instruction0000nnnn00010010 = function(instruction) {
	// STC GBR,Rn 
	// GBR ? Rn 
	var result = (cpu.GetGBR());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[131] = cpu.instructions.instruction0000nnnn00010010;

cpu.instructions.instruction0000nnnn00100010 = function(instruction) {
	// STC VBR,Rn 
	// VBR ? Rn 
	var result = (cpu.GetVBR());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[132] = cpu.instructions.instruction0000nnnn00100010;

cpu.instructions.instruction0100nnnn00000011 = function(instruction) {
	// STC.L SR,@–Rn 
	// Rn – 4 ? Rn, SR ? (Rn) 
	var result = (cpu.GetR(instruction.n) - 4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetSR());
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[133] = cpu.instructions.instruction0100nnnn00000011;

cpu.instructions.instruction0100nnnn00010011 = function(instruction) {
	// STC.L GBR,@–Rn 
	// Rn – 4 ? Rn, GBR ? (Rn) 
	var result = (cpu.GetR(instruction.n) - 4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetGBR());
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[134] = cpu.instructions.instruction0100nnnn00010011;

cpu.instructions.instruction0100nnnn00100011 = function(instruction) {
	// STC.L VBR,@–Rn 
	// Rn – 4 ? Rn, VBR ? (Rn) 
	var result = (cpu.GetR(instruction.n) - 4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetVBR());
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[135] = cpu.instructions.instruction0100nnnn00100011;

cpu.instructions.instruction0000nnnn00001010 = function(instruction) {
	// STS MACH,Rn 
	// MACH ? Rn 
	var result = (cpu.GetMACH());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[136] = cpu.instructions.instruction0000nnnn00001010;

cpu.instructions.instruction0000nnnn00011010 = function(instruction) {
	// STS MACL,Rn 
	// MACL ? Rn 
	var result = (cpu.GetMACL());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[137] = cpu.instructions.instruction0000nnnn00011010;

cpu.instructions.instruction0000nnnn00101010 = function(instruction) {
	// STS PR,Rn 
	// PR ? Rn 
	var result = (cpu.GetPR());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[138] = cpu.instructions.instruction0000nnnn00101010;

cpu.instructions.instruction0100nnnn00000010 = function(instruction) {
	// STS.L MACH,@–Rn 
	// Rn – 4 ? Rn, MACH ? (Rn) 
	var result = (cpu.GetR(instruction.n) - 4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetMACH());
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[139] = cpu.instructions.instruction0100nnnn00000010;

cpu.instructions.instruction0100nnnn00010010 = function(instruction) {
	// STS.L MACL,@–Rn 
	// Rn – 4 ? Rn, MACL ? (Rn) 
	var result = (cpu.GetR(instruction.n) - 4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetMACL());
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[140] = cpu.instructions.instruction0100nnnn00010010;

cpu.instructions.instruction0100nnnn00100010 = function(instruction) {
	// STS.L PR,@–Rn 
	// Rn – 4 ? Rn, PR ? (Rn) 
	var result = (cpu.GetR(instruction.n) - 4);
	cpu.SetR(instruction.n, result);
	
var result = (cpu.GetPR());
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[141] = cpu.instructions.instruction0100nnnn00100010;

cpu.instructions.instruction11000011iiiiiiii = function(instruction) {
	// TRAPA #imm 
	// PC/SR ? stack area, (imm × 4 + VBR) ? PC 
	cpu.TRAPA(instruction);
};

simulator.instructionProcessors[142] = cpu.instructions.instruction11000011iiiiiiii;

cpu.instructions.instruction1111nnnn01011101 = function(instruction) {
	// FABS FRn 
	// |FRn| ? FRn 
	fpu.FABS(instruction);
};

simulator.instructionProcessors[143] = cpu.instructions.instruction1111nnnn01011101;

cpu.instructions.instruction1111nnnnmmmm0000 = function(instruction) {
	// FADD FRm,FRn 
	// FRn + FRm ? FRn 
	fpu.FADD(instruction);
};

simulator.instructionProcessors[144] = cpu.instructions.instruction1111nnnnmmmm0000;

cpu.instructions.instruction1111nnnnmmmm0100 = function(instruction) {
	// FCMP/EQ FRm,FRn 
	// (FRn = FRm)? 1:0 ? T
	fpu.FCMP_EQ(instruction);
};

simulator.instructionProcessors[145] = cpu.instructions.instruction1111nnnnmmmm0100;

cpu.instructions.instruction1111nnnnmmmm0101 = function(instruction) {
	// FCMP/GT FRm,FRn 
	// (FRn > FRm)? 1:0 ? T
	fpu.FCMP_GT(instruction);
};

simulator.instructionProcessors[146] = cpu.instructions.instruction1111nnnnmmmm0101;

cpu.instructions.instruction1111nnnnmmmm0011 = function(instruction) {
	// FDIV FRm,FRn 
	// FRn/FRm ? FRn
	fpu.FDIV(instruction);
};

simulator.instructionProcessors[147] = cpu.instructions.instruction1111nnnnmmmm0011;

cpu.instructions.instruction1111nnnn10001101 = function(instruction) {
	// FLDI0 FRn 
	// 0x00000000 ? FRn 
	fpu.FLDI0(instruction);
};

simulator.instructionProcessors[148] = cpu.instructions.instruction1111nnnn10001101;

cpu.instructions.instruction1111nnnn10011101 = function(instruction) {
	// FLDI1 FRn 
	// 0x3F800000 ? FRn 
	fpu.FLDI1(instruction);
};

simulator.instructionProcessors[149] = cpu.instructions.instruction1111nnnn10011101;

cpu.instructions.instruction1111mmmm00011101 = function(instruction) {
	// FLDS FRm,FPUL 
	// FRm ? FPUL 
	fpu.FLDS(instruction);
};

simulator.instructionProcessors[150] = cpu.instructions.instruction1111mmmm00011101;

cpu.instructions.instruction1111nnnn00101101 = function(instruction) {
	// FLOAT FPUL,FRn 
	// (float) FPUL ? FRn 
	fpu.FLOAT(instruction);
};

simulator.instructionProcessors[151] = cpu.instructions.instruction1111nnnn00101101;

cpu.instructions.instruction1111nnnnmmmm1110 = function(instruction) {
	// FMAC FR0,FRm,FRn 
	// FR0 × FRm + FRn ? FRn 
	fpu.FMAC(instruction);
};

simulator.instructionProcessors[152] = cpu.instructions.instruction1111nnnnmmmm1110;

cpu.instructions.instruction1111nnnnmmmm1100 = function(instruction) {
	// FMOV FRm, FRn 
	// FRm ? FRn 
	var result = (cpu.GetFR(instruction.m));
	cpu.SetFR(instruction.n, result);
};

simulator.instructionProcessors[153] = cpu.instructions.instruction1111nnnnmmmm1100;

cpu.instructions.instruction1111nnnnmmmm0110 = function(instruction) {
	// FMOV.S @(R0,Rm),FRn 
	// (R0 + Rm) ? FRn 
	var result = (cpu.Read32(cpu.GetR(0) + cpu.GetR(instruction.m)));
	cpu.SetFR(instruction.n, result);
};

simulator.instructionProcessors[154] = cpu.instructions.instruction1111nnnnmmmm0110;

cpu.instructions.instruction1111nnnnmmmm1001 = function(instruction) {
	// FMOV.S @Rm+,FRn 
	// (Rm) ? FRn, Rm+ = 4 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetFR(instruction.n, result);
	
cpu.SetR(instruction.m, cpu.GetR(instruction.m)+4);
};

simulator.instructionProcessors[155] = cpu.instructions.instruction1111nnnnmmmm1001;

cpu.instructions.instruction1111nnnnmmmm1000 = function(instruction) {
	// FMOV.S @Rm,FRn 
	// (Rm) ? FRn 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetFR(instruction.n, result);
};

simulator.instructionProcessors[156] = cpu.instructions.instruction1111nnnnmmmm1000;

cpu.instructions.instruction1111nnnnmmmm0111 = function(instruction) {
	// FMOV.S FRm,@(R0,Rn) 
	// FRm ? (R0 + Rn) 
	var result = (cpu.GetFR(instruction.m));
	var address = (cpu.GetR(0) + cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[157] = cpu.instructions.instruction1111nnnnmmmm0111;

cpu.instructions.instruction1111nnnnmmmm1011 = function(instruction) {
	// FMOV.S FRm,@-Rn 
	// Rn– = 4, FRm ? (Rn) 
	cpu.SetR(instruction.n, cpu.GetR(instruction.n)-4);
	
var result = (cpu.GetFR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[158] = cpu.instructions.instruction1111nnnnmmmm1011;

cpu.instructions.instruction1111nnnnmmmm1010 = function(instruction) {
	// FMOV.S FRm,@Rn 
	// FRm ? (Rn) 
	var result = (cpu.GetFR(instruction.m));
	var address = (cpu.GetR(instruction.n));
 cpu.Write32(address, result);
};

simulator.instructionProcessors[159] = cpu.instructions.instruction1111nnnnmmmm1010;

cpu.instructions.instruction1111nnnnmmmm0010 = function(instruction) {
	// FMUL FRm,FRn 
	// FRn × FRm ? FRn 
	fpu.FMUL(instruction);
};

simulator.instructionProcessors[160] = cpu.instructions.instruction1111nnnnmmmm0010;

cpu.instructions.instruction1111nnnn01001101 = function(instruction) {
	// FNEG FRn 
	// –FRn ? FRn 
	fpu.FNEG(instruction);
};

simulator.instructionProcessors[161] = cpu.instructions.instruction1111nnnn01001101;

cpu.instructions.instruction1111nnnn00001101 = function(instruction) {
	// FSTS FPUL,FRn 
	// FPUL ? FRn 
	fpu.FSTS(instruction);
};

simulator.instructionProcessors[162] = cpu.instructions.instruction1111nnnn00001101;

cpu.instructions.instruction1111nnnnmmmm0001 = function(instruction) {
	// FSUB FRm,FRn 
	// FRn – FRm ? FRn 
	fpu.FSUB(instruction);
};

simulator.instructionProcessors[163] = cpu.instructions.instruction1111nnnnmmmm0001;

cpu.instructions.instruction1111mmmm00111101 = function(instruction) {
	// FTRC FRm,FPUL 
	// (long) FRm ? FPUL 
	fpu.FTRC(instruction);
};

simulator.instructionProcessors[164] = cpu.instructions.instruction1111mmmm00111101;

cpu.instructions.instruction0100mmmm01101010 = function(instruction) {
	// LDS Rm,FPSCR 
	// Rm ? FPSCR 
	fpu.LDS(instruction.m);
};

simulator.instructionProcessors[165] = cpu.instructions.instruction0100mmmm01101010;

cpu.instructions.instruction0100mmmm01011010 = function(instruction) {
	// LDS Rm,FPUL 
	// Rm ? FPUL 
	var result = (cpu.GetR(instruction.m));
	cpu.SetFPUL(result);
};

simulator.instructionProcessors[166] = cpu.instructions.instruction0100mmmm01011010;

cpu.instructions.instruction0100mmmm01100110 = function(instruction) {
	// LDS.L @Rm+, FPSCR 
	// @Rm ? FPSCR, Rm+ = 4 
	fpu.LDS_RESTORE(instruction.m);
};

simulator.instructionProcessors[167] = cpu.instructions.instruction0100mmmm01100110;

cpu.instructions.instruction0100mmmm01010110 = function(instruction) {
	// LDS.L @Rm+, FPUL 
	// @Rm ? FPUL, Rm+ = 4 
	var result = (cpu.Read32(cpu.GetR(instruction.m)));
	cpu.SetFPUL(result);
	
cpu.SetR(instruction.m, cpu.GetR(instruction.m)+4);
};

simulator.instructionProcessors[168] = cpu.instructions.instruction0100mmmm01010110;

cpu.instructions.instruction0000nnnn01101010 = function(instruction) {
	// STS FPSCR, Rn 
	// FPSCR ? Rn 
	var result = (cpu.GetFPSCR());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[169] = cpu.instructions.instruction0000nnnn01101010;

cpu.instructions.instruction0000nnnn01011010 = function(instruction) {
	// STS FPUL,Rn 
	// FPUL ? Rn 
	var result = (cpu.GetFPUL());
	cpu.SetR(instruction.n, result);
};

simulator.instructionProcessors[170] = cpu.instructions.instruction0000nnnn01011010;

cpu.instructions.instruction0100nnnn01100010 = function(instruction) {
	// STS.L FPSCR,@-Rn 
	// Rn– = 4, FPSCR ? @Rn 
	cpu.SetR(instruction.n, cpu.GetR(instruction.n)-4);
	
var result = (cpu.GetFPSCR());
	cpu.Write32(cpu.GetR(instruction.n), result);
};

simulator.instructionProcessors[171] = cpu.instructions.instruction0100nnnn01100010;

cpu.instructions.instruction0100nnnn01010010 = function(instruction) {
	// STS.L FPUL,@-Rn 
	// Rn– = 4, FPUL ? @Rn
	cpu.SetR(instruction.n, cpu.GetR(instruction.n)-4);
	
var result = (cpu.GetFPUL());
	cpu.Write32(cpu.GetR(instruction.n), result);
};

simulator.instructionProcessors[172] = cpu.instructions.instruction0100nnnn01010010;

function getInstructionBitLength(i) {
	if (i.text.indexOf(".B") != -1) {
		return 8;
	} else if (i.text.indexOf(".W") != -1) {
		return 16;		
	} else {
		return 32;
	}
}