simulator.instructionProcessors['1110nnnniiiiiiii'] = function(instruction) {
    // MOV #imm,Rn 
    // #imm → Sign extension → Rn 
    var result = (SignExtend(instruction.i, 8));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['1001nnnndddddddd'] = function(instruction) {
    // MOV.W @(disp,PC),Rn 
    // (disp × 2 + PC) → Sign extension → Rn 
    var result = (Read(parseInt(((instruction.d * 2) + GetPC()) / 2) * 2, 16));
    result = SignExtend(result, 16);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['1101nnnndddddddd'] = function(instruction) {
    // MOV.L @(disp,PC),Rn 
    // (disp × 4 + PC) → Rn 
    var result = (Read(instruction.d * 4 + GetPC(), 32));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm0011'] = function(instruction) {
    // MOV Rm,Rn 
    // Rm → Rn 
    var result = (GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0010nnnnmmmm0000'] = function(instruction) {
    // MOV.B Rm,@Rn 
    // Rm → (Rn) 
    var result = (GetR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 8);
};

simulator.instructionProcessors['0010nnnnmmmm0001'] = function(instruction) {
    // MOV.W Rm,@Rn 
    // Rm → (Rn) 
    var result = (GetR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 16);
};

simulator.instructionProcessors['0010nnnnmmmm0010'] = function(instruction) {
    // MOV.L Rm,@Rn 
    // Rm → (Rn) 
    var result = (GetR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0110nnnnmmmm0000'] = function(instruction) {
    // MOV.B @Rm,Rn 
    // (Rm) → Sign extension → Rn 
    var result = (Read(GetR(instruction.m), 8));
    result = SignExtend(result, 8);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm0001'] = function(instruction) {
    // MOV.W @Rm,Rn 
    // (Rm) → Sign extension → Rn 
    var result = (Read(GetR(instruction.m), 16));
    result = SignExtend(result, 16);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm0010'] = function(instruction) {
    // MOV.L @Rm,Rn 
    // (Rm) → Rn 
    var result = (Read(GetR(instruction.m), 32));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0010nnnnmmmm0100'] = function(instruction) {
    // MOV.B Rm,@–Rn 
    // Rn–1 → Rn, Rm → (Rn) 
    var result = (GetR(instruction.n) - 1);
    SetR(instruction.n, result);

    var result = (GetR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 8);
};

simulator.instructionProcessors['0010nnnnmmmm0101'] = function(instruction) {
    // MOV.W Rm,@–Rn 
    // Rn–2 → Rn, Rm → (Rn) 
    var result = (GetR(instruction.n) - 2);
    SetR(instruction.n, result);

    var result = (GetR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 16);
};

simulator.instructionProcessors['0010nnnnmmmm0110'] = function(instruction) {
    // MOV.L Rm,@–Rn 
    // Rn–4 → Rn, Rm → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0110nnnnmmmm0100'] = function(instruction) {
    // MOV.B @Rm+,Rn 
    // (Rm) → Sign extension → Rn,Rm + 1 → Rm 
    var result = (Read(GetR(instruction.m), 8));
    result = SignExtend(result, 8);
    SetR(instruction.n, result);

    var result = (GetR(instruction.m) + 1);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0110nnnnmmmm0101'] = function(instruction) {
    // MOV.W @Rm+,Rn 
    // (Rm) → Sign extension → Rn,Rm + 2 → Rm 
    var result = (Read(GetR(instruction.m), 16));
    result = SignExtend(result, 16);
    SetR(instruction.n, result);

    var result = (GetR(instruction.m) + 2);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0110nnnnmmmm0110'] = function(instruction) {
    // MOV.L @Rm+,Rn 
    // (Rm) → Rn,Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetR(instruction.n, result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['10000000nnnndddd'] = function(instruction) {
    // MOV.B R0,@(disp,Rn) 
    // R0 → (disp + Rn) 
    var result = (GetR(0));
    var address = (instruction.d + GetR(instruction.n));
    Write(address, result, 8);
};

simulator.instructionProcessors['10000001nnnndddd'] = function(instruction) {
    // MOV.W R0,@(disp,Rn) 
    // R0 → (disp × 2 + Rn) 
    var result = (GetR(0));
    var address = (instruction.d * 2 + GetR(instruction.n));
    Write(address, result, 16);
};

simulator.instructionProcessors['0001nnnnmmmmdddd'] = function(instruction) {
    // MOV.L Rm,@(disp,Rn) 
    // Rm → (disp × 4 + Rn) 
    var result = (GetR(instruction.m));
    var address = (instruction.d * 4 + GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['10000100mmmmdddd'] = function(instruction) {
    // MOV.B @(disp,Rm),R0 
    // (disp + Rm) → Sign extension → R0 
    var result = (Read(instruction.d + GetR(instruction.m), 8));
    result = SignExtend(result, 8);
    SetR(0, result);
};

simulator.instructionProcessors['10000101mmmmdddd'] = function(instruction) {
    // MOV.W @(disp,Rm),R0 
    // (disp × 2 + Rm) → Sign extension → R0 
    var result = (Read(instruction.d * 2 + GetR(instruction.m), 16));
    result = SignExtend(result, 16);
    SetR(0, result);
};

simulator.instructionProcessors['0101nnnnmmmmdddd'] = function(instruction) {
    // MOV.L @(disp,Rm),Rn 
    // (disp × 4 + Rm) → Rn 
    var result = (Read(instruction.d * 4 + GetR(instruction.m), 32));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnnmmmm0100'] = function(instruction) {
    // MOV.B Rm,@(R0,Rn) 
    // Rm → (R0 + Rn) 
    var result = (GetR(instruction.m));
    var address = (GetR(0) + GetR(instruction.n));
    Write(address, result, 8);
};

simulator.instructionProcessors['0000nnnnmmmm0101'] = function(instruction) {
    // MOV.W Rm,@(R0,Rn) 
    // Rm → (R0 + Rn) 
    var result = (GetR(instruction.m));
    var address = (GetR(0) + GetR(instruction.n));
    Write(address, result, 16);
};

simulator.instructionProcessors['0000nnnnmmmm0110'] = function(instruction) {
    // MOV.L Rm,@(R0,Rn) 
    // Rm → (R0 + Rn) 
    var result = (GetR(instruction.m));
    var address = (GetR(0) + GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0000nnnnmmmm1100'] = function(instruction) {
    // MOV.B @(R0,Rm),Rn 
    // (R0 + Rm) → Sign extension → Rn 
    var result = (Read(GetR(0) + GetR(instruction.m), 8));
    result = SignExtend(result, 8);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnnmmmm1101'] = function(instruction) {
    // MOV.W @(R0,Rm),Rn 
    // (R0 + Rm) → Sign extension → Rn 
    var result = (Read(GetR(0) + GetR(instruction.m), 16));
    result = SignExtend(result, 16);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnnmmmm1110'] = function(instruction) {
    // MOV.L @(R0,Rm),Rn 
    // (R0 + Rm) → Rn 
    var result = (Read(GetR(0) + GetR(instruction.m), 32));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['11000000dddddddd'] = function(instruction) {
    // MOV.B R0,@(disp,GBR) 
    // R0 → (disp + GBR) 
    var result = (GetR(0));
    var address = (instruction.d + GetGBR());
    Write(address, result, 8);
};

simulator.instructionProcessors['11000001dddddddd'] = function(instruction) {
    // MOV.W R0,@(disp,GBR) 
    // R0 → (disp × 2 + GBR) 
    var result = (GetR(0));
    var address = (instruction.d * 2 + GetGBR());
    Write(address, result, 16);
};

simulator.instructionProcessors['11000010dddddddd'] = function(instruction) {
    // MOV.L R0,@(disp,GBR) 
    // R0 → (disp × 4 + GBR) 
    var result = (GetR(0));
    var address = (instruction.d * 4 + GetGBR());
    Write(address, result, 32);
};

simulator.instructionProcessors['11000100dddddddd'] = function(instruction) {
    // MOV.B @(disp,GBR),R0 
    // (disp + GBR) → Sign extension → R0 
    var result = (Read(instruction.d + GetGBR(), 8));
    result = SignExtend(result, 8);
    SetR(0, result);
};

simulator.instructionProcessors['11000101dddddddd'] = function(instruction) {
    // MOV.W @(disp,GBR),R0 
    // (disp × 2 + GBR) → Sign extension → R0 
    var result = (Read(instruction.d * 2 + GetGBR(), 16));
    result = SignExtend(result, 16);
    SetR(0, result);
};

simulator.instructionProcessors['11000110dddddddd'] = function(instruction) {
    // MOV.L @(disp,GBR),R0 
    // (disp × 4 + GBR) → R0 
    var result = (Read(instruction.d * 4 + GetGBR(), 32));
    SetR(0, result);
};

simulator.instructionProcessors['11000111dddddddd'] = function(instruction) {
    // MOVA @(disp,PC),R0 
    // disp × 4 + PC → R0 
    var result = (DispX4ZEPlusPC(instruction));
    SetR(0, result);
};

simulator.instructionProcessors['0000nnnn00101001'] = function(instruction) {
    // MOVT Rn 
    // T → Rn 
    var result = (GetT());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm1000'] = function(instruction) {
    // SWAP.B Rm,Rn 
    // Rm → Swap bottom two bytes → Rn 
    var result = (SwapBottomTwoBytes(GetR(instruction.m)));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm1001'] = function(instruction) {
    // SWAP.W Rm,Rn 
    // Rm → Swap two consecutive words → Rn 
    var result = (SwapTwoWords(GetR(instruction.m)));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0010nnnnmmmm1101'] = function(instruction) {
    // XTRCT Rm,Rn 
    // Rm: Middle 32 bits of Rn → Rn 
    var result = (Middle32Bits(GetR(instruction.m), GetR(instruction.n)));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0011nnnnmmmm1100'] = function(instruction) {
    // ADD Rm,Rn 
    // Rn + Rm → Rn 
    var result = (GetR(instruction.n) + GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0111nnnniiiiiiii'] = function(instruction) {
    // ADD #imm,Rn 
    // Rn + imm → Rn 
    var result = (GetR(instruction.n) + SignExtend(instruction.i, 8));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0011nnnnmmmm1110'] = function(instruction) {
    // ADDC Rm,Rn 
    // Rn + Rm + T → Rn, Carry → T 
    var result = (AddWithCarry(instruction.m, instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm1111'] = function(instruction) {
    // ADDV Rm,Rn 
    // Rn + Rm → Rn, Overflow → T 
    var result = (AddWithOverflowCheck(instruction.m, instruction.n));
    SetT(result);
};

simulator.instructionProcessors['10001000iiiiiiii'] = function(instruction) {
    // CMP/EQ #imm,R0 
    // If R0 = imm, 1 → T
    var result = (GetR(0) == ToUnsigned(SignExtendAddressComponent(instruction, 'i')));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm0000'] = function(instruction) {
    // CMP/EQ Rm,Rn 
    // If Rn = Rm, 1 → T
    var result = (GetR(instruction.n) == GetR(instruction.m));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm0010'] = function(instruction) {
    // CMP/HS Rm,Rn 
    // If Rn>=Rm with unsigned data, 1 → T
    var result = (GetR(instruction.n) >= GetR(instruction.m));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm0011'] = function(instruction) {
    // CMP/GE Rm,Rn 
    // If Rn >= Rm with signed data, 1 → T
    var result = (ToSigned(GetR(instruction.n)) >= ToSigned(GetR(instruction.m)));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm0110'] = function(instruction) {
    // CMP/HI Rm,Rn 
    // If Rn > Rm with unsigned data, 1 → T
    var result = (GetR(instruction.n) > GetR(instruction.m));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm0111'] = function(instruction) {
    // CMP/GT Rm,Rn 
    // If Rn > Rm with signed data, 1 → T
    var result = (ToSigned(GetR(instruction.n)) > ToSigned(GetR(instruction.m)));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00010101'] = function(instruction) {
    // CMP/PL Rn 
    // If Rn > 0, 1 → T
    var result = (ToSigned(GetR(instruction.n)) > 0);
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00010001'] = function(instruction) {
    // CMP/PZ Rn 
    // If Rn >= 0, 1 → T
    var result = (ToSigned(GetR(instruction.n)) >= 0);
    SetT(result);
};

simulator.instructionProcessors['0010nnnnmmmm1100'] = function(instruction) {
    // CMP/STR Rm,Rn 
    // If Rn and Rm have an equivalent byte, 1 → T
    var result = (EquivalentByte(GetR(instruction.n), GetR(instruction.m)));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm0100'] = function(instruction) {
    // DIV1 Rm,Rn 
    // Single-step division (Rn ÷ Rm) 1 → T
    var result = (DIV1(instruction.m, instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0010nnnnmmmm0111'] = function(instruction) {
    // DIV0S Rm,Rn 
    // MSB of Rn → Q, MSB of Rm → M, M ^ Q → T 
    NotImplemented();
};

simulator.instructionProcessors['0000000000011001'] = function(instruction) {
    // DIV0U 
    // 0 → M/Q/T
    SetM(0), SetQ(0), SetT(0);
};

simulator.instructionProcessors['0011nnnnmmmm1101'] = function(instruction) {
    // DMULS.L Rm,Rn 
    // Signed operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits
    NotImplemented();
};

simulator.instructionProcessors['0011nnnnmmmm0101'] = function(instruction) {
    // DMULU.L Rm,Rn 
    // Unsigned operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits
    NotImplemented();
};

simulator.instructionProcessors['0100nnnn00010000'] = function(instruction) {
    // DT Rn 
    // Rn – 1 → Rn, when Rn is 0, 1 → T. When Rn is nonzero, 0 → T
    var result = (DtRn(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0110nnnnmmmm1110'] = function(instruction) {
    // EXTS.B Rm,Rn 
    // Byte in Rm is signextended → Rn 
    var result = (SignExtend(GetR(instruction.m), 8));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm1111'] = function(instruction) {
    // EXTS.W Rm,Rn 
    // Word in Rm is signextended → Rn 
    var result = (SignExtend(GetR(instruction.m), 16));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm1100'] = function(instruction) {
    // EXTU.B Rm,Rn 
    // Byte in Rm is zeroextended → Rn 
    var result = (ZeroExtend(instruction, GetR(instruction.m)));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm1101'] = function(instruction) {
    // EXTU.W Rm,Rn 
    // Word in Rm is zeroextended → Rn 
    var result = (ZeroExtend(instruction, GetR(instruction.m)));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnnmmmm1111'] = function(instruction) {
    // MAC.L @Rm+,@Rn+ 
    // Signed operation of (Rn) × (Rm) + MAC → MAC 32 × 32 + 64 → 64 bits
    NotImplemented();
};

simulator.instructionProcessors['0100nnnnmmmm1111'] = function(instruction) {
    // MAC.W @Rm+,@Rn+ 
    // Signed operation of (Rn) × (Rm) + MAC → MAC 16 × 16 + 64 → 64 bits
    NotImplemented();
};

simulator.instructionProcessors['0000nnnnmmmm0111'] = function(instruction) {
    // MUL.L Rm,Rn 
    // Rn × Rm → MACL, 32 × 32 → 32 bits
    var result = (GetR(instruction.n) * GetR(instruction.m));
    SetMACL(result);
};

simulator.instructionProcessors['0010nnnnmmmm1111'] = function(instruction) {
    // MULS.W Rm,Rn 
    // Signed operation of Rn × Rm → MACL 16 × 16 → 32 bits 1 to 3
    var result = (To16Bit(GetR(instruction.n)) * To16Bit(GetR(instruction.m)));
    SetMACL(result);
};

simulator.instructionProcessors['0010nnnnmmmm1110'] = function(instruction) {
    // MULU.W Rm,Rn 
    // Unsigned operation of Rn × Rm → MACL 16 × 16 → 32 bits
    var result = (To16Bit(GetR(instruction.n)) * To16Bit(GetR(instruction.m)));
    SetMACL(result);
};

simulator.instructionProcessors['0110nnnnmmmm1011'] = function(instruction) {
    // NEG Rm,Rn 
    // 0 – Rm → Rn 
    var result = (0 - GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0110nnnnmmmm1010'] = function(instruction) {
    // NEGC Rm,Rn 
    // 0 – Rm – T → Rn, Borrow → T 
    var result = (NegcRmRn(instruction));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm1000'] = function(instruction) {
    // SUB Rm,Rn 
    // Rn – Rm → Rn 
    var result = (GetR(instruction.n) - GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0011nnnnmmmm1010'] = function(instruction) {
    // SUBC Rm,Rn 
    // Rn – Rm – T → Rn, Borrow → T 
    var result = (SubcRmRn(instruction));
    SetT(result);
};

simulator.instructionProcessors['0011nnnnmmmm1011'] = function(instruction) {
    // SUBV Rm,Rn 
    // Rn – Rm → Rn, Underflow → T 
    var result = (SubvRmRn(instruction.m, instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0010nnnnmmmm1001'] = function(instruction) {
    // AND Rm,Rn 
    // Rn & Rm → Rn 
    var result = (GetR(instruction.n) & GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['11001001iiiiiiii'] = function(instruction) {
    // AND #imm,R0 
    // R0 & imm → R0 
    var result = (GetR(0) & instruction.i);
    SetR(0, result);
};

simulator.instructionProcessors['11001101iiiiiiii'] = function(instruction) {
    // AND.B #imm,@(R0,GBR) 
    // (R0 + GBR) & imm → (R0 + GBR) 
    var result = (Read(GetR(0) + GetGBR(), 8));
    var address = (GetR(0) + GetGBR());
    Write(address, result, 8);
};

simulator.instructionProcessors['0110nnnnmmmm0111'] = function(instruction) {
    // NOT Rm,Rn 
    // ~Rm → Rn 
    var result = (~GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0010nnnnmmmm1011'] = function(instruction) {
    // OR Rm,Rn 
    // Rn | Rm → Rn 
    var result = (GetR(instruction.n) | GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['11001011iiiiiiii'] = function(instruction) {
    // OR #imm,R0 
    // R0 | imm → R0 
    var result = (GetR(0) | instruction.i);
    SetR(0, result);
};

simulator.instructionProcessors['11001111iiiiiiii'] = function(instruction) {
    // OR.B #imm,@(R0,GBR) 
    // (R0 + GBR) | imm → (R0 + GBR) 
    var result = (Read(GetR(0) + GetGBR(), 8));
    var address = (GetR(0) + GetGBR());
    Write(address, result, 8);
};

simulator.instructionProcessors['0100nnnn00011011'] = function(instruction) {
    // TAS.B @Rn 
    // If (Rn) is 0, 1 → T; 1 → MSB of (Rn)
    NotImplemented();
};

simulator.instructionProcessors['0010nnnnmmmm1000'] = function(instruction) {
    // TST Rm,Rn 
    // Rn & Rm; if the result is 0, 1 → T
    var result = (!(GetR(instruction.n) & GetR(instruction.m)));
    SetT(result);
};

simulator.instructionProcessors['11001000iiiiiiii'] = function(instruction) {
    // TST #imm,R0 
    // R0 & imm; if the result is 0, 1 → T
    var result = (!(GetR(0) & instruction.i));
    SetT(result);
};

simulator.instructionProcessors['11001100iiiiiiii'] = function(instruction) {
    // TST.B #imm,@(R0,GBR) 
    // (R0 + GBR) & imm; if the result is 0, 1 → T
    NotImplemented();
};

simulator.instructionProcessors['0010nnnnmmmm1010'] = function(instruction) {
    // XOR Rm,Rn 
    // Rn ^ Rm → Rn 
    var result = (GetR(instruction.n) ^ GetR(instruction.m));
    SetR(instruction.n, result);
};

simulator.instructionProcessors['11001010iiiiiiii'] = function(instruction) {
    // XOR #imm,R0 
    // R0 ^ imm → R0 
    var result = (GetR(0) ^ instruction.i);
    SetR(0, result);
};

simulator.instructionProcessors['11001110iiiiiiii'] = function(instruction) {
    // XOR.B #imm,@(R0,GBR) 
    // (R0 + GBR) ^ imm → (R0 + GBR) 
    var result = (Read(GetR(0) + GetGBR(), 8));
    var address = (GetR(0) + GetGBR());
    Write(address, result, 8);
};

simulator.instructionProcessors['0100nnnn00000100'] = function(instruction) {
    // ROTL Rn 
    // T ← Rn ← MSB 
    var result = (RotLeft(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00000101'] = function(instruction) {
    // ROTR Rn 
    // LSB → Rn → T 
    var result = (RotRight(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00100100'] = function(instruction) {
    // ROTCL Rn 
    // T ← Rn ← T 
    var result = (RotWithCarryLeftRn(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00100101'] = function(instruction) {
    // ROTCR Rn 
    // T → Rn → T 
    var result = (GetT());
    result = (SetR(instruction.n, result), result);
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00100000'] = function(instruction) {
    // SHAL Rn 
    // T ← Rn ← 0 
    var result = (ShiftLeftRn(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00100001'] = function(instruction) {
    // SHAR Rn 
    // MSB → Rn → T 
    var result = (ArithmeticShiftRightRn(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00000000'] = function(instruction) {
    // SHLL Rn 
    // T ← Rn ← 0 
    var result = (ShiftLeftRn(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00000001'] = function(instruction) {
    // SHLR Rn 
    // 0 → Rn → T 
    var result = (LogicalShiftRightRn(instruction.n));
    SetT(result);
};

simulator.instructionProcessors['0100nnnn00001000'] = function(instruction) {
    // SHLL2 Rn 
    // Rn<<2 → Rn 
    var result = (GetR(instruction.n) << 2);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00001001'] = function(instruction) {
    // SHLR2 Rn 
    // Rn>>2 → Rn 
    var result = (GetR(instruction.n) >>> 2);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00011000'] = function(instruction) {
    // SHLL8 Rn 
    // Rn<<8 → Rn 
    var result = (GetR(instruction.n) << 8);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00011001'] = function(instruction) {
    // SHLR8 Rn 
    // Rn>>8 → Rn 
    var result = (GetR(instruction.n) >>> 8);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00101000'] = function(instruction) {
    // SHLL16 Rn 
    // Rn<<16 → Rn 
    var result = (GetR(instruction.n) << 16);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00101001'] = function(instruction) {
    // SHLR16 Rn 
    // Rn>>16 → Rn 
    var result = (GetR(instruction.n) >>> 16);
    SetR(instruction.n, result);
};

simulator.instructionProcessors['10001011dddddddd'] = function(instruction) {
    // BF label 
    // If T = 0, disp × 2 + PC → PC; if T = 1, nop
    var result = (GetT() == 0);
    if (!result) {
        return;
    };

    var result = (parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC()) / 2) * 2);
    SetPC(result);

    var result = (GetT() == 1);
    if (!result) {
        return;
    };

    Nop();
};

simulator.instructionProcessors['10001111dddddddd'] = function(instruction) {
    // BF/S label 
    // Delayed branch, if T = 0, disp × 2 + PC → PC; if T = 1, nop
    var result = (GetT() == 0);
    if (!result) {
        return;
    };

    var result = (parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC()) / 2) * 2);
    DelayedBranch(result);

    var result = (GetT() == 1);
    if (!result) {
        return;
    };

    Nop();
};

simulator.instructionProcessors['10001001dddddddd'] = function(instruction) {
    // BT label 
    // If T = 1, disp × 2 + PC → PC; if T = 0, nop
    var result = (GetT() == 1);
    if (!result) {
        return;
    };

    var result = (parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC()) / 2) * 2);
    SetPC(result);

    var result = (GetT() == 0);
    if (!result) {
        return;
    };

    Nop();
};

simulator.instructionProcessors['10001101dddddddd'] = function(instruction) {
    // BT/S label 
    // Delayed branch, if T = 1, disp × 2 + PC → PC; if T = 0, nop
    var result = (GetT() == 1);
    if (!result) {
        return;
    };

    var result = (parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC()) / 2) * 2);
    DelayedBranch(result);

    var result = (GetT() == 0);
    if (!result) {
        return;
    };

    Nop();
};

simulator.instructionProcessors['1010dddddddddddd'] = function(instruction) {
    // BRA label 
    // Delayed branch, disp × 2 + PC → PC 
    var result = (parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC()) / 2) * 2);
    DelayedBranch(result);
};

simulator.instructionProcessors['0000mmmm00100011'] = function(instruction) {
    // BRAF Rm 
    // Delayed branch, Rm + PC → PC 
    var result = (GetR(instruction.m) + GetPC());
    DelayedBranch(result);
};

simulator.instructionProcessors['1011dddddddddddd'] = function(instruction) {
    // BSR label 
    // Delayed branch, PC → PR, disp × 2 + PC → PC 
    var result = (SubroutineHook(), GetPC());
    SetPR(result);

    var result = (parseInt(((SignExtendAddressComponent(instruction, 'd') * 2) + GetPC()) / 2) * 2);
    DelayedBranch(result);
};

simulator.instructionProcessors['0000mmmm00000011'] = function(instruction) {
    // BSRF Rm 
    // Delayed branch, PC → PR, Rm + PC → PC 
    var result = (SubroutineHook(), GetPC());
    SetPR(result);

    var result = (GetR(instruction.m) + GetPC());
    DelayedBranch(result);
};

simulator.instructionProcessors['0100mmmm00101011'] = function(instruction) {
    // JMP @Rm 
    // Delayed branch, Rm → PC 
    var result = (GetR(instruction.m));
    DelayedBranch(result);
};

simulator.instructionProcessors['0100mmmm00001011'] = function(instruction) {
    // JSR @Rm 
    // Delayed branch, PC → PR, Rm → PC 
    var result = (SubroutineHook(), GetPC());
    SetPR(result);

    var result = (GetR(instruction.m));
    DelayedBranch(result);
};

simulator.instructionProcessors['0000000000001011'] = function(instruction) {
    // RTS 
    // Delayed branch, PR → PC 
    var result = (RtsHook(), GetPR());
    DelayedBranch(result);
};

simulator.instructionProcessors['0000000000001000'] = function(instruction) {
    // CLRT 
    // 0 → T
    var result = (0);
    SetT(result);
};

simulator.instructionProcessors['0000000000101000'] = function(instruction) {
    // CLRMAC 
    // 0 → MACH, MACL 
    NotImplemented();
};

simulator.instructionProcessors['0100mmmm00001110'] = function(instruction) {
    // LDC Rm,SR 
    // Rm → SR 
    var result = (GetR(instruction.m));
    SetSR(result);
};

simulator.instructionProcessors['0100mmmm00011110'] = function(instruction) {
    // LDC Rm,GBR 
    // Rm → GBR 
    var result = (GetR(instruction.m));
    SetGBR(result);
};

simulator.instructionProcessors['0100mmmm00101110'] = function(instruction) {
    // LDC Rm,VBR 
    // Rm → VBR 
    var result = (GetR(instruction.m));
    SetVBR(result);
};

simulator.instructionProcessors['0100mmmm00000111'] = function(instruction) {
    // LDC.L @Rm+,SR 
    // (Rm) → SR, Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetSR(result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0100mmmm00010111'] = function(instruction) {
    // LDC.L @Rm+,GBR 
    // (Rm) → GBR, Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetGBR(result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0100mmmm00100111'] = function(instruction) {
    // LDC.L @Rm+,VBR 
    // (Rm) → VBR, Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetVBR(result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0100mmmm00001010'] = function(instruction) {
    // LDS Rm,MACH 
    // Rm → MACH 
    var result = (GetR(instruction.m));
    SetMACH(result);
};

simulator.instructionProcessors['0100mmmm00011010'] = function(instruction) {
    // LDS Rm,MACL 
    // Rm → MACL 
    var result = (GetR(instruction.m));
    SetMACL(result);
};

simulator.instructionProcessors['0100mmmm00101010'] = function(instruction) {
    // LDS Rm,PR 
    // Rm → PR 
    var result = (GetR(instruction.m));
    SetPR(result);
};

simulator.instructionProcessors['0100mmmm00000110'] = function(instruction) {
    // LDS.L @Rm+,MACH 
    // (Rm) → MACH, Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetMACH(result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0100mmmm00010110'] = function(instruction) {
    // LDS.L @Rm+,MACL 
    // (Rm) → MACL, Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetMACL(result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0100mmmm00100110'] = function(instruction) {
    // LDS.L @Rm+,PR 
    // (Rm) → PR, Rm + 4 → Rm 
    var result = (Read(GetR(instruction.m), 32));
    SetPR(result);

    var result = (GetR(instruction.m) + 4);
    SetR(instruction.m, result);
};

simulator.instructionProcessors['0000000000001001'] = function(instruction) {
    // NOP 
    // No operation 
    Nop();
};

simulator.instructionProcessors['0000000000101011'] = function(instruction) {
    // RTE 
    // Delayed branch, stack area → PC/SR 
    NotImplemented();
};

simulator.instructionProcessors['0000000000011000'] = function(instruction) {
    // SETT 
    // 1 → T
    var result = (1);
    SetT(result);
};

simulator.instructionProcessors['0000000000011011'] = function(instruction) {
    // SLEEP 
    // Sleep 3
    NotImplemented();
};

simulator.instructionProcessors['0000nnnn00000010'] = function(instruction) {
    // STC SR,Rn 
    // SR → Rn 
    var result = (GetSR());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnn00010010'] = function(instruction) {
    // STC GBR,Rn 
    // GBR → Rn 
    var result = (GetGBR());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnn00100010'] = function(instruction) {
    // STC VBR,Rn 
    // VBR → Rn 
    var result = (GetVBR());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00000011'] = function(instruction) {
    // STC.L SR,@–Rn 
    // Rn – 4 → Rn, SR → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetSR());
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0100nnnn00010011'] = function(instruction) {
    // STC.L GBR,@–Rn 
    // Rn – 4 → Rn, GBR → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetGBR());
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0100nnnn00100011'] = function(instruction) {
    // STC.L VBR,@–Rn 
    // Rn – 4 → Rn, VBR → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetVBR());
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0000nnnn00001010'] = function(instruction) {
    // STS MACH,Rn 
    // MACH → Rn 
    var result = (GetMACH());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnn00011010'] = function(instruction) {
    // STS MACL,Rn 
    // MACL → Rn 
    var result = (GetMACL());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnn00101010'] = function(instruction) {
    // STS PR,Rn 
    // PR → Rn 
    var result = (GetPR());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn00000010'] = function(instruction) {
    // STS.L MACH,@–Rn 
    // Rn – 4 → Rn, MACH → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetMACH());
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0100nnnn00010010'] = function(instruction) {
    // STS.L MACL,@–Rn 
    // Rn – 4 → Rn, MACL → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetMACL());
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['0100nnnn00100010'] = function(instruction) {
    // STS.L PR,@–Rn 
    // Rn – 4 → Rn, PR → (Rn) 
    var result = (GetR(instruction.n) - 4);
    SetR(instruction.n, result);

    var result = (GetPR());
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['11000011iiiiiiii'] = function(instruction) {
    // TRAPA #imm 
    // PC/SR → stack area, (imm × 4 + VBR) → PC 
    Nop();

    var result = (Read(instruction.i * 4 + GetVBR(), 32));
    SetPC(result);
};

simulator.instructionProcessors['1111nnnn01011101'] = function(instruction) {
    // FABS FRn 
    // |FRn| → FRn 
    //var result = (Fabs(GetFR(instruction.n)));
    //SetFR(instruction.n, result);

   

simulator.instructionProcessors['1111nnnnmmmm0000'] = function(instruction) {
    // FADD FRm,FRn 
    // FRn + FRm → FRn 
    //var result = (FromFloat32(ToFloat32(GetFR(instruction.n)) + ToFloat32(GetFR(instruction.m))));
    //SetFR(instruction.n, result);

    
};

simulator.instructionProcessors['1111nnnnmmmm0100'] = function(instruction) {
    // FCMP/EQ FRm,FRn 
    // (FRn = FRm)? 1:0 → T
    var result = (GetFR(instruction.n) == GetFR(instruction.m));
    SetT(result);
};

simulator.instructionProcessors['1111nnnnmmmm0101'] = function(instruction) {
    // FCMP/GT FRm,FRn 
    // (FRn > FRm)? 1:0 → T
    var result = (ToFloat32(GetFR(instruction.n)) > ToFloat32(GetFR(instruction.m)));
    SetT(result);
};

simulator.instructionProcessors['1111nnnnmmmm0011'] = function(instruction) {
    // FDIV FRm,FRn 
    // FRn/FRm → FRn
    var result = (FromFloat32(ToFloat32(GetFR(instruction.n)) / ToFloat32(GetFR(instruction.m))));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnn10001101'] = function(instruction) {
    // FLDI0 FRn 
    // 0x00000000 → FRn 
    var result = (0x00000000);
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnn10011101'] = function(instruction) {
    // FLDI1 FRn 
    // 0x3F800000 → FRn 
    var result = (0x3F800000);
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111mmmm00011101'] = function(instruction) {
    // FLDS FRm,FPUL 
    // FRm → FPUL 
    var result = (GetFR(instruction.m));
    SetFPUL(result);
};

simulator.instructionProcessors['1111nnnn00101101'] = function(instruction) {
    // FLOAT FPUL,FRn 
    // (float) FPUL → FRn 
    var result = (FromFloat32(GetFPUL()));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnnmmmm1110'] = function(instruction) {
    // FMAC FR0,FRm,FRn 
    // FR0 × FRm + FRn → FRn 
    var result = (FromFloat32(ToFloat32(GetFR(0)) * ToFloat32(GetFR(instruction.m)) + ToFloat32(GetFR(instruction.n))));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnnmmmm1100'] = function(instruction) {
    // FMOV FRm, FRn 
    // FRm → FRn 
    var result = (GetFR(instruction.m));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnnmmmm0110'] = function(instruction) {
    // FMOV.S @(R0,Rm),FRn 
    // (R0 + Rm) → FRn 
    var result = (Read(GetR(0) + GetR(instruction.m), 32));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnnmmmm1001'] = function(instruction) {
    // FMOV.S @Rm+,FRn 
    // (Rm) → FRn, Rm+ = 4 
    var result = (Read(GetR(instruction.m), 32));
    SetFR(instruction.n, result);

    SetR(instruction.m, GetR(instruction.m) + 4);
};

simulator.instructionProcessors['1111nnnnmmmm1000'] = function(instruction) {
    // FMOV.S @Rm,FRn 
    // (Rm) → FRn 
    var result = (Read(GetR(instruction.m), 32));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnnmmmm0111'] = function(instruction) {
    // FMOV.S FRm,@(R0,Rn) 
    // FRm → (R0 + Rn) 
    var result = (GetFR(instruction.m));
    var address = (GetR(0) + GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['1111nnnnmmmm1011'] = function(instruction) {
    // FMOV.S FRm,@-Rn 
    // Rn– = 4, FRm → (Rn) 
    SetR(instruction.n, GetR(instruction.n) - 4);

    var result = (GetFR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['1111nnnnmmmm1010'] = function(instruction) {
    // FMOV.S FRm,@Rn 
    // FRm → (Rn) 
    var result = (GetFR(instruction.m));
    var address = (GetR(instruction.n));
    Write(address, result, 32);
};

simulator.instructionProcessors['1111nnnnmmmm0010'] = function(instruction) {
    // FMUL FRm,FRn 
    // FRn × FRm → FRn 
    var result = (FromFloat32(ToFloat32(GetFR(instruction.n)) * ToFloat32(GetFR(instruction.m))));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnn01001101'] = function(instruction) {
    // FNEG FRn 
    // –FRn → FRn 
    var result = (-1.0 * GetFR(instruction.n));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnn00001101'] = function(instruction) {
    // FSTS FPUL,FRn 
    // FPUL → FRn 
    var result = (GetFPUL());
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111nnnnmmmm0001'] = function(instruction) {
    // FSUB FRm,FRn 
    // FRn – FRm → FRn 
    var result = (FromFloat32(ToFloat32(GetFR(instruction.n)) - ToFloat32(GetFR(instruction.m))));
    SetFR(instruction.n, result);
};

simulator.instructionProcessors['1111mmmm00111101'] = function(instruction) {
    // FTRC FRm,FPUL 
    // (long) FRm → FPUL 
    var result = (parseInt(GetFR(instruction.m)));
    SetFPUL(result);
};

simulator.instructionProcessors['0100mmmm01101010'] = function(instruction) {
    // LDS Rm,FPSCR 
    // Rm → FPSCR 
    var result = (GetR(instruction.m));
    SetFPSCR(result);
};

simulator.instructionProcessors['0100mmmm01011010'] = function(instruction) {
    // LDS Rm,FPUL 
    // Rm → FPUL 
    var result = (GetR(instruction.m));
    SetFPUL(result);
};

simulator.instructionProcessors['0100mmmm01100110'] = function(instruction) {
    // LDS.L @Rm+, FPSCR 
    // @Rm → FPSCR, Rm+ = 4 
    var result = (Read(GetR(instruction.m)));
    SetFPSCR(result);

    SetR(instruction.m, GetR(instruction.m) + 4);
};

simulator.instructionProcessors['0100mmmm01010110'] = function(instruction) {
    // LDS.L @Rm+, FPUL 
    // @Rm → FPUL, Rm+ = 4 
    var result = (Read(GetR(instruction.m)));
    SetFPUL(result);

    SetR(instruction.m, GetR(instruction.m) + 4);
};

simulator.instructionProcessors['0000nnnn01101010'] = function(instruction) {
    // STS FPSCR, Rn 
    // FPSCR → Rn 
    var result = (GetFPSCR());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0000nnnn01011010'] = function(instruction) {
    // STS FPUL,Rn 
    // FPUL → Rn 
    var result = (GetFPUL());
    SetR(instruction.n, result);
};

simulator.instructionProcessors['0100nnnn01100010'] = function(instruction) {
    // STS.L FPSCR,@-Rn 
    // Rn– = 4, FPSCR → @Rn 
    SetR(instruction.n, GetR(instruction.n) - 4);

    var result = (GetFPSCR());
    Write(GetR(instruction.n), result, 32);
};

simulator.instructionProcessors['0100nnnn01010010'] = function(instruction) {
    // STS.L FPUL,@-Rn 
    // Rn– = 4, FPUL → @Rn
    SetR(instruction.n, GetR(instruction.n) - 4);

    var result = (GetFPUL());
    Write(GetR(instruction.n), result, 32);
};