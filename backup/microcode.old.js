
simulator.instructionProcessors['1110nnnniiiiiiii'] = function(instruction) {
    //MOV #imm,Rn 
    //#imm → Sign extension → Rn 

    SetR(instruction.n, SignExtend(instruction.i, BitLength(instruction.instruction, 'i')));
    
}

simulator.instructionProcessors['1001nnnndddddddd'] = function(instruction) {
    //MOV.W @(disp,PC),Rn 
    //(disp × 2 + PC) → Sign extension → Rn 
    SetR(instruction.n, SignExtend(Read(instruction.d * 2 + GetPC(), 16), 16))    
}

simulator.instructionProcessors['1101nnnndddddddd'] = function(instruction) {
    //MOV.L @(disp,PC),Rn 
    //(disp × 4 + PC) → Rn 
    SetR(instruction.n, Read(instruction.d * 4 + GetPC(), 32));    
}

simulator.instructionProcessors['0110nnnnmmmm0011'] = function(instruction) {
    //MOV Rm,Rn 
    //Rm → Rn 
    SetR(instruction.n, GetR(instruction.m));
}

simulator.instructionProcessors['0010nnnnmmmm0000'] = function(instruction) {
    //MOV.B Rm,@Rn 
    //Rm → (Rn) 
    Write(GetR(instruction.n), GetR(instruction.m), 8);
}

simulator.instructionProcessors['0010nnnnmmmm0001'] = function(instruction) {
    //MOV.W Rm,@Rn 
    //Rm → (Rn) 
    Write(GetR(instruction.n), GetR(instruction.m), 16);    
}

simulator.instructionProcessors['0010nnnnmmmm0010'] = function(instruction) {
    //MOV.L Rm,@Rn 
    //Rm → (Rn) 
    Write(GetR(instruction.n), GetR(instruction.m), 32);       
}

simulator.instructionProcessors['0110nnnnmmmm0000'] = function(instruction) {
    //MOV.B @Rm,Rn 
    //(Rm) → Sign extension → Rn 
    SetR(instruction.n, SignExtend(Read(GetR(instruction.m), 8), 8))    
}

simulator.instructionProcessors['0110nnnnmmmm0001'] = function(instruction) {
    //MOV.W @Rm,Rn 
    //(Rm) → Sign extension → Rn 

    SetR(instruction.n, SignExtend(Read(GetR(instruction.m), 16), 16))    
}

simulator.instructionProcessors['0110nnnnmmmm0010'] = function(instruction) {
    //MOV.L @Rm,Rn 
    //(Rm) → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.L @Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm0100'] = function(instruction) {
    //MOV.B Rm,@–Rn 
    //Rn–1 → Rn, Rm → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B Rm,@–Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm0101'] = function(instruction) {
    //MOV.W Rm,@–Rn 
    //Rn–2 → Rn, Rm → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.W Rm,@–Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm0110'] = function(instruction) {
    //MOV.L Rm,@–Rn 
    //Rn–4 → Rn, Rm → (Rn) 
    SetR(instruction.n, GetR(instruction.n)-4)
    Write(GetR(instruction.n), GetR(instruction.m), 32)    
}

simulator.instructionProcessors['0110nnnnmmmm0100'] = function(instruction) {
    //MOV.B @Rm+,Rn 
    //(Rm) → Sign extension → Rn,Rm + 1 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B @Rm+,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm0101'] = function(instruction) {
    //MOV.W @Rm+,Rn 
    //(Rm) → Sign extension → Rn,Rm + 2 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.W @Rm+,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm0110'] = function(instruction) {
    //MOV.L @Rm+,Rn 
    //(Rm) → Rn,Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.L @Rm+,Rn ');
}

simulator.instructionProcessors['10000000nnnndddd'] = function(instruction) {
    //MOV.B R0,@(disp,Rn) 
    //R0 → (disp + Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B R0,@(disp,Rn) ');
}

simulator.instructionProcessors['10000001nnnndddd'] = function(instruction) {
    //MOV.W R0,@(disp,Rn) 
    //R0 → (disp × 2 + Rn) 
    Write(instruction.d*2+GetR(instruction.n), GetR(0), 16);        
}

simulator.instructionProcessors['0001nnnnmmmmdddd'] = function(instruction) {
    //MOV.L Rm,@(disp,Rn) 
    //Rm → (disp × 4 + Rn) 
    Write(instruction.d*4+GetR(instruction.n), GetR(instruction.m), 32);           
}

simulator.instructionProcessors['10000100mmmmdddd'] = function(instruction) {
    //MOV.B @(disp,Rm),R0 
    //(disp + Rm) → Sign extension → R0 
    SetR(0, SignExtend(Read(instruction.d + GetR(instruction.m), 8), 8));
}

simulator.instructionProcessors['10000101mmmmdddd'] = function(instruction) {
    //MOV.W @(disp,Rm),R0 
    //(disp × 2 + Rm) → Sign extension → R0 
    
    SetR(0, SignExtend(Read(instruction.d * 2 + GetR(instruction.m), 16), 16));
}

simulator.instructionProcessors['0101nnnnmmmmdddd'] = function(instruction) {
    //MOV.L @(disp,Rm),Rn 
    //(disp × 4 + Rm) → Rn 
    SetR(instruction.n, Read(instruction.d * 4 + GetR(instruction.m), 32))
}

simulator.instructionProcessors['0000nnnnmmmm0100'] = function(instruction) {
    //MOV.B Rm,@(R0,Rn) 
    //Rm → (R0 + Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B Rm,@(R0,Rn) ');
}

simulator.instructionProcessors['0000nnnnmmmm0101'] = function(instruction) {
    //MOV.W Rm,@(R0,Rn) 
    //Rm → (R0 + Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.W Rm,@(R0,Rn) ');
}

simulator.instructionProcessors['0000nnnnmmmm0110'] = function(instruction) {
    //MOV.L Rm,@(R0,Rn) 
    //Rm → (R0 + Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.L Rm,@(R0,Rn) ');
}

simulator.instructionProcessors['0000nnnnmmmm1100'] = function(instruction) {
    //MOV.B @(R0,Rm),Rn 
    //(R0 + Rm) → Sign extension → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B @(R0,Rm),Rn ');
}

simulator.instructionProcessors['0000nnnnmmmm1101'] = function(instruction) {
    //MOV.W @(R0,Rm),Rn 
    //(R0 + Rm) → Sign extension → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.W @(R0,Rm),Rn ');
}

simulator.instructionProcessors['0000nnnnmmmm1110'] = function(instruction) {
    //MOV.L @(R0,Rm),Rn 
    //(R0 + Rm) → Rn 
    SetR(instruction.n, Read(GetR(0)+GetR(instruction.m), 32));
}

simulator.instructionProcessors['11000000dddddddd'] = function(instruction) {
    //MOV.B R0,@(disp,GBR) 
    //R0 → (disp + GBR) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B R0,@(disp,GBR) ');
}

simulator.instructionProcessors['11000001dddddddd'] = function(instruction) {
    //MOV.W R0,@(disp,GBR) 
    //R0 → (disp × 2 + GBR) 
    
    Write(instruction.d*2+simulator.registers.gbr, GetR(0), 16);
}

simulator.instructionProcessors['11000010dddddddd'] = function(instruction) {
    //MOV.L R0,@(disp,GBR) 
    //R0 → (disp × 4 + GBR) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.L R0,@(disp,GBR) ');
}

simulator.instructionProcessors['11000100dddddddd'] = function(instruction) {
    //MOV.B @(disp,GBR),R0 
    //(disp + GBR) → Sign extension → R0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.B @(disp,GBR),R0 ');
}

simulator.instructionProcessors['11000101dddddddd'] = function(instruction) {
    //MOV.W @(disp,GBR),R0 
    //(disp × 2 + GBR) → Sign extension → R0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.W @(disp,GBR),R0 ');
}

simulator.instructionProcessors['11000110dddddddd'] = function(instruction) {
    //MOV.L @(disp,GBR),R0 
    //(disp × 4 + GBR) → R0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOV.L @(disp,GBR),R0 ');
}

simulator.instructionProcessors['11000111dddddddd'] = function(instruction) {
    //MOVA @(disp,PC),R0 
    //disp × 4 + PC → R0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOVA @(disp,PC),R0 ');
}

simulator.instructionProcessors['0000nnnn00101001'] = function(instruction) {
    //MOVT Rn 
    //T → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MOVT Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1000'] = function(instruction) {
    //SWAP.B Rm,Rn 
    //Rm → Swap bottom two bytes → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SWAP.B Rm,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1001'] = function(instruction) {
    //SWAP.W Rm,Rn 
    //Rm → Swap two consecutive words → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SWAP.W Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1101'] = function(instruction) {
    //XTRCT Rm,Rn 
    //Rm: Middle 32 bits of Rn → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: XTRCT Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm1100'] = function(instruction) {
    //ADD Rm,Rn 
    //Rn + Rm → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ADD Rm,Rn ');
}

simulator.instructionProcessors['0111nnnniiiiiiii'] = function(instruction) {
    //ADD #imm,Rn 
    //Rn + imm → Rn     
    SetR(instruction.n, GetR(instruction.n) + ConvertToSigned(instruction.i, 8));
}

simulator.instructionProcessors['0011nnnnmmmm1110'] = function(instruction) {
    //ADDC Rm,Rn 
    //Rn + Rm + T → Rn, Carry → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ADDC Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm1111'] = function(instruction) {
    //ADDV Rm,Rn 
    //Rn + Rm → Rn, Overflow → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ADDV Rm,Rn ');
}

simulator.instructionProcessors['10001000iiiiiiii'] = function(instruction) {
    //CMP/EQ #imm,R0 
    //If R0 = imm, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/EQ #imm,R0 ');
}

simulator.instructionProcessors['0011nnnnmmmm0000'] = function(instruction) {
    //CMP/EQ Rm,Rn 
    //If Rn = Rm, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/EQ Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm0010'] = function(instruction) {
    //CMP/HS Rm,Rn 
    //If Rn=Rm with unsigned data, 1 → T 1 Compariso
    if (GetR(instruction.n) == GetR(instruction.m)) {
        SetT(true);
    }    
}

simulator.instructionProcessors['0011nnnnmmmm0011'] = function(instruction) {
    //CMP/GE Rm,Rn 
    //If Rn = Rm with signed data, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/GE Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm0110'] = function(instruction) {
    //CMP/HI Rm,Rn 
    //If Rn > Rm with unsigned data, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/HI Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm0111'] = function(instruction) {
    //CMP/GT Rm,Rn 
    //If Rn > Rm with signed data, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/GT Rm,Rn ');
}

simulator.instructionProcessors['0100nnnn00010101'] = function(instruction) {
    //CMP/PL Rn 
    //If Rn > 0, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/PL Rn ');
}

simulator.instructionProcessors['0100nnnn00010001'] = function(instruction) {
    //CMP/PZ Rn 
    //If Rn = 0, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/PZ Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1100'] = function(instruction) {
    //CMP/STR Rm,Rn 
    //If Rn and Rm have an equivalent byte, 1 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CMP/STR Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm0100'] = function(instruction) {
    //DIV1 Rm,Rn 
    //Single-step division (Rn ÷ Rm) 1 Calculatio
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: DIV1 Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm0111'] = function(instruction) {
    //DIV0S Rm,Rn 
    //MSB of Rn → Q, MSB of Rm → M, M ^ Q → T 1 Calculatio
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: DIV0S Rm,Rn ');
}

simulator.instructionProcessors['0000000000011001'] = function(instruction) {
    //DIV0U 
    //0 → M/Q/T 1
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: DIV0U ');
}

simulator.instructionProcessors['0011nnnnmmmm1101'] = function(instruction) {
    //DMULS.L Rm,Rn 
    //Signed operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits 2 to 4
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: DMULS.L Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm0101'] = function(instruction) {
    //DMULU.L Rm,Rn 
    //Unsigned operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits 2 to 4
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: DMULU.L Rm,Rn ');
}

simulator.instructionProcessors['0100nnnn00010000'] = function(instruction) {
    //DT Rn 
    //Rn – 1 → Rn, when Rn is 0, 1 → T. When Rn is nonzero, 0 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: DT Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1110'] = function(instruction) {
    //EXTS.B Rm,Rn 
    //Byte in Rm is signextended → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: EXTS.B Rm,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1111'] = function(instruction) {
    //EXTS.W Rm,Rn 
    //Word in Rm is signextended → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: EXTS.W Rm,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1100'] = function(instruction) {
    //EXTU.B Rm,Rn 
    //Byte in Rm is zeroextended → Rn 
    // TODO: Test    
    SetR(instruction.n, GetR(instruction.m) & 0xFF);
}

simulator.instructionProcessors['0110nnnnmmmm1101'] = function(instruction) {
    //EXTU.W Rm,Rn 
    //Word in Rm is zeroextended → Rn 
    SetR(instruction.n, GetR(instruction.m) & 0xFFFF);            
}

simulator.instructionProcessors['0000nnnnmmmm1111'] = function(instruction) {
    //MAC.L @Rm+,@Rn+ 
    //Signed operation of (Rn) × (Rm) + MAC → MAC 32 × 32 + 64 → 64 bits 3/(2 to 4)
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MAC.L @Rm+,@Rn+ ');
}

simulator.instructionProcessors['0100nnnnmmmm1111'] = function(instruction) {
    //MAC.W @Rm+,@Rn+ 
    //Signed operation of (Rn) × (Rm) + MAC → MAC 16 × 16 + 64 → 64 bits 3/(2)
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MAC.W @Rm+,@Rn+ ');
}

simulator.instructionProcessors['0000nnnnmmmm0111'] = function(instruction) {
    //MUL.L Rm,Rn 
    //Rn × Rm → MACL, 32 × 32 → 32 bits 2 to 4
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MUL.L Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1111'] = function(instruction) {
    //MULS.W Rm,Rn 
    //Signed operation of Rn × Rm → MACL 16 × 16 → 32 bits 1 to 3
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MULS.W Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1110'] = function(instruction) {
    //MULU.W Rm,Rn 
    //Unsigned operation of Rn × Rm → MACL 16 × 16 → 32 bits 1 to 3
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: MULU.W Rm,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1011'] = function(instruction) {
    //NEG Rm,Rn 
    //0 – Rm → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: NEG Rm,Rn ');
}

simulator.instructionProcessors['0110nnnnmmmm1010'] = function(instruction) {
    //NEGC Rm,Rn 
    //0 – Rm – T → Rn, Borrow → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: NEGC Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm1000'] = function(instruction) {
    //SUB Rm,Rn 
    //Rn – Rm → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SUB Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm1010'] = function(instruction) {
    //SUBC Rm,Rn 
    //Rn – Rm – T → Rn, Borrow → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SUBC Rm,Rn ');
}

simulator.instructionProcessors['0011nnnnmmmm1011'] = function(instruction) {
    //SUBV Rm,Rn 
    //Rn – Rm → Rn, Underflow → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SUBV Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1001'] = function(instruction) {
    //AND Rm,Rn 
    //Rn & Rm → Rn 
    SetR(instruction.n, ToUnsigned(GetR(instruction.n) & GetR(instruction.m))); 
}

simulator.instructionProcessors['11001001iiiiiiii'] = function(instruction) {
    //AND #imm,R0 
    //R0 & imm → R0 
    SetR(0, ToUnsigned(instruction.i & GetR(0)));    
}

simulator.instructionProcessors['11001101iiiiiiii'] = function(instruction) {
    //AND.B #imm,@(R0,GBR) 
    //(R0 + GBR) & imm → (R0 + GBR) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: AND.B #imm,@(R0,GBR) ');
}

simulator.instructionProcessors['0110nnnnmmmm0111'] = function(instruction) {
    //NOT Rm,Rn 
    //~Rm → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: NOT Rm,Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1011'] = function(instruction) {
    //OR Rm,Rn 
    //Rn | Rm → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: OR Rm,Rn ');
}

simulator.instructionProcessors['11001011iiiiiiii'] = function(instruction) {
    //OR #imm,R0 
    //R0 | imm → R0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: OR #imm,R0 ');
}

simulator.instructionProcessors['11001111iiiiiiii'] = function(instruction) {
    //OR.B #imm,@(R0,GBR) 
    //(R0 + GBR) | imm → (R0 + GBR) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: OR.B #imm,@(R0,GBR) ');
}

simulator.instructionProcessors['0100nnnn00011011'] = function(instruction) {
    //TAS.B @Rn 
    //If (Rn) is 0, 1 → T; 1 → MSB of (Rn) 4 Tes
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: TAS.B @Rn ');
}

simulator.instructionProcessors['0010nnnnmmmm1000'] = function(instruction) {
    //TST Rm,Rn 
    //Rn & Rm; if the result is 0, 1 → T 1 Tes
    SetT((GetR(instruction.n) & GetR(instruction.m)) == 0);
}

simulator.instructionProcessors['11001000iiiiiiii'] = function(instruction) {
    //TST #imm,R0 
    //R0 & imm; if the result is 0, 1 → T 1 Tes
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: TST #imm,R0 ');
}

simulator.instructionProcessors['11001100iiiiiiii'] = function(instruction) {
    //TST.B #imm,@(R0,GBR) 
    //(R0 + GBR) & imm; if the result is 0, 1 → T 3 Tes
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: TST.B #imm,@(R0,GBR) ');
}

simulator.instructionProcessors['0010nnnnmmmm1010'] = function(instruction) {
    //XOR Rm,Rn 
    //Rn ^ Rm → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: XOR Rm,Rn ');
}

simulator.instructionProcessors['11001010iiiiiiii'] = function(instruction) {
    //XOR #imm,R0 
    //R0 ^ imm → R0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: XOR #imm,R0 ');
}

simulator.instructionProcessors['11001110iiiiiiii'] = function(instruction) {
    //XOR.B #imm,@(R0,GBR) 
    //(R0 + GBR) ^ imm → (R0 + GBR) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: XOR.B #imm,@(R0,GBR) ');
}

simulator.instructionProcessors['0100nnnn00000100'] = function(instruction) {
    //ROTL Rn 
    //T ← Rn ← MSB 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ROTL Rn ');
}

simulator.instructionProcessors['0100nnnn00000101'] = function(instruction) {
    //ROTR Rn 
    //LSB → Rn → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ROTR Rn ');
}

simulator.instructionProcessors['0100nnnn00100100'] = function(instruction) {
    //ROTCL Rn 
    //T ← Rn ← T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ROTCL Rn ');
}

simulator.instructionProcessors['0100nnnn00100101'] = function(instruction) {
    //ROTCR Rn 
    //T → Rn → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: ROTCR Rn ');
}

simulator.instructionProcessors['0100nnnn00100000'] = function(instruction) {
    //SHAL Rn 
    //T ← Rn ← 0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHAL Rn ');
}

simulator.instructionProcessors['0100nnnn00100001'] = function(instruction) {
    //SHAR Rn 
    //MSB → Rn → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHAR Rn ');
}

simulator.instructionProcessors['0100nnnn00000000'] = function(instruction) {
    //SHLL Rn 
    //T ← Rn ← 0 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHLL Rn ');
}

simulator.instructionProcessors['0100nnnn00000001'] = function(instruction) {
    //SHLR Rn 
    //0 → Rn → T 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHLR Rn ');
}

simulator.instructionProcessors['0100nnnn00001000'] = function(instruction) {
    //SHLL2 Rn 
    //Rn<<2 → Rn 
    SetR(instruction.n, LeftShift(GetR(instruction.n), 2))    
}

simulator.instructionProcessors['0100nnnn00001001'] = function(instruction) {
    //SHLR2 Rn 
    //Rn>>2 → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHLR2 Rn ');
}

simulator.instructionProcessors['0100nnnn00011000'] = function(instruction) {
    //SHLL8 Rn 
    //Rn<<8 → Rn     
    SetR(instruction.n, LeftShift(GetR(instruction.n), 8))    
}

simulator.instructionProcessors['0100nnnn00011001'] = function(instruction) {
    //SHLR8 Rn 
    //Rn>>8 → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHLR8 Rn ');
}

simulator.instructionProcessors['0100nnnn00101000'] = function(instruction) {
    //SHLL16 Rn 
    //Rn<<16 → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHLL16 Rn ');
}

simulator.instructionProcessors['0100nnnn00101001'] = function(instruction) {
    //SHLR16 Rn 
    //Rn>>16 → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SHLR16 Rn ');
}

simulator.instructionProcessors['10001011dddddddd'] = function(instruction) {
    //BF label 
    //If T = 0, disp × 2 + PC → PC; if T = 1, nop 3/1
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: BF label ');
}

simulator.instructionProcessors['10001111dddddddd'] = function(instruction) {
    //BF/S label 
    //Delayed branch, if T = 0, disp × 2 + PC → PC; if T = 1, nop 3/1
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: BF/S label ');
}

simulator.instructionProcessors['10001001dddddddd'] = function(instruction) {
    //BT label 
    //If T = 1, disp × 2 + PC → PC; if T = 0, nop 3/1
    var d = ConvertToSigned(instruction.d, 8)
    if (GetT()) {
        SetPC(d * 2 + GetPC())
    }    
}

simulator.instructionProcessors['10001101dddddddd'] = function(instruction) {
    //BT/S label 
    //Delayed branch, if T = 1, disp × 2 + PC → PC; if T = 0, nop 2/1
    if (GetT()) {
        var d = ConvertToSigned(instruction.d, 8)
        DelayedBranch(d * 2 + GetPC())
    }
}

simulator.instructionProcessors['1010dddddddddddd'] = function(instruction) {
    //BRA label 
    //Delayed branch, disp × 2 + PC → PC 
    
    DelayedBranch(instruction.d * 2 + GetPC())
}

simulator.instructionProcessors['0000mmmm00100011'] = function(instruction) {
    //BRAF Rm 
    //Delayed branch, Rm + PC → PC 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: BRAF Rm ');
}

simulator.instructionProcessors['1011dddddddddddd'] = function(instruction) {
    //BSR label 
    //Delayed branch, PC → PR, disp × 2 + PC → PC 

    SetPR(GetPC())
    DelayedBranch(instruction.d * 2 + GetPC())
    //simulator.notImplemented = true;console.log('NOT IMPLEMENTED: BSR label ');
}

simulator.instructionProcessors['0000mmmm00000011'] = function(instruction) {
    //BSRF Rm 
    //Delayed branch, PC → PR, Rm + PC → PC 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: BSRF Rm ');
}

simulator.instructionProcessors['0100mmmm00101011'] = function(instruction) {
    //JMP @Rm 
    //Delayed branch, Rm → PC 
    
    DelayedBranch(GetR(instruction.m));    
}

simulator.instructionProcessors['0100mmmm00001011'] = function(instruction) {
    //JSR @Rm 
    //Delayed branch, PC → PR, Rm → PC 

    SetPR(GetPC())
    DelayedBranch(GetR(instruction.m));    
}

simulator.instructionProcessors['0000000000001011'] = function(instruction) {
    //RTS 
    //Delayed branch, PR → PC 
    DelayedBranch(GetPR())
}

simulator.instructionProcessors['0000000000001000'] = function(instruction) {
    //CLRT 
    //0 → T 1
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CLRT ');
}

simulator.instructionProcessors['0000000000101000'] = function(instruction) {
    //CLRMAC 
    //0 → MACH, MACL 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: CLRMAC ');
}

simulator.instructionProcessors['0100mmmm00001110'] = function(instruction) {
    //LDC Rm,SR 
    //Rm → SR 
    SetSR(GetR(instruction.m))
}

simulator.instructionProcessors['0100mmmm00011110'] = function(instruction) {
    //LDC Rm,GBR 
    //Rm → GBR 
    SetGBR(GetR(instruction.m));        
}

simulator.instructionProcessors['0100mmmm00101110'] = function(instruction) {
    //LDC Rm,VBR 
    //Rm → VBR 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDC Rm,VBR ');
}

simulator.instructionProcessors['0100mmmm00000111'] = function(instruction) {
    //LDC.L @Rm+,SR 
    //(Rm) → SR, Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDC.L @Rm+,SR ');
}

simulator.instructionProcessors['0100mmmm00010111'] = function(instruction) {
    //LDC.L @Rm+,GBR 
    //(Rm) → GBR, Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDC.L @Rm+,GBR ');
}

simulator.instructionProcessors['0100mmmm00100111'] = function(instruction) {
    //LDC.L @Rm+,VBR 
    //(Rm) → VBR, Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDC.L @Rm+,VBR ');
}

simulator.instructionProcessors['0100mmmm00001010'] = function(instruction) {
    //LDS Rm,MACH 
    //Rm → MACH 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS Rm,MACH ');
}

simulator.instructionProcessors['0100mmmm00011010'] = function(instruction) {
    //LDS Rm,MACL 
    //Rm → MACL 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS Rm,MACL ');
}

simulator.instructionProcessors['0100mmmm00101010'] = function(instruction) {
    //LDS Rm,PR 
    //Rm → PR 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS Rm,PR ');
}

simulator.instructionProcessors['0100mmmm00000110'] = function(instruction) {
    //LDS.L @Rm+,MACH 
    //(Rm) → MACH, Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS.L @Rm+,MACH ');
}

simulator.instructionProcessors['0100mmmm00010110'] = function(instruction) {
    //LDS.L @Rm+,MACL 
    //(Rm) → MACL, Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS.L @Rm+,MACL ');
}

simulator.instructionProcessors['0100mmmm00100110'] = function(instruction) {
    //LDS.L @Rm+,PR 
    //(Rm) → PR, Rm + 4 → Rm 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS.L @Rm+,PR ');
}

simulator.instructionProcessors['0000000000001001'] = function(instruction) {
    //NOP 
    //No operation 
    //simulator.notImplemented = true;console.log('NOT IMPLEMENTED: NOP ');
}

simulator.instructionProcessors['0000000000101011'] = function(instruction) {
    //RTE 
    //Delayed branch, stack area → PC/SR 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: RTE ');
}

simulator.instructionProcessors['0000000000011000'] = function(instruction) {
    //SETT 
    //1 → T 1
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SETT ');
}

simulator.instructionProcessors['0000000000011011'] = function(instruction) {
    //SLEEP 
    //Sleep 3
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: SLEEP ');
}

simulator.instructionProcessors['0000nnnn00000010'] = function(instruction) {
    //STC SR,Rn 
    //SR → Rn 
    SetR(instruction.n, GetSR());    
}

simulator.instructionProcessors['0000nnnn00010010'] = function(instruction) {
    //STC GBR,Rn 
    //GBR → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STC GBR,Rn ');
}

simulator.instructionProcessors['0000nnnn00100010'] = function(instruction) {
    //STC VBR,Rn 
    //VBR → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STC VBR,Rn ');
}

simulator.instructionProcessors['0100nnnn00000011'] = function(instruction) {
    //STC.L SR,@–Rn 
    //Rn – 4 → Rn, SR → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STC.L SR,@–Rn ');
}

simulator.instructionProcessors['0100nnnn00010011'] = function(instruction) {
    //STC.L GBR,@–Rn 
    //Rn – 4 → Rn, GBR → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STC.L GBR,@–Rn ');
}

simulator.instructionProcessors['0100nnnn00100011'] = function(instruction) {
    //STC.L VBR,@–Rn 
    //Rn – 4 → Rn, BR → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STC.L VBR,@–Rn ');
}

simulator.instructionProcessors['0000nnnn00001010'] = function(instruction) {
    //STS MACH,Rn 
    //MACH → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS MACH,Rn ');
}

simulator.instructionProcessors['0000nnnn00011010'] = function(instruction) {
    //STS MACL,Rn 
    //MACL → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS MACL,Rn ');
}

simulator.instructionProcessors['0000nnnn00101010'] = function(instruction) {
    //STS PR,Rn 
    //PR → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS PR,Rn ');
}

simulator.instructionProcessors['0100nnnn00000010'] = function(instruction) {
    //STS.L MACH,@–Rn 
    //Rn – 4 → Rn, MACH → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS.L MACH,@–Rn ');
}

simulator.instructionProcessors['0100nnnn00010010'] = function(instruction) {
    //STS.L MACL,@–Rn 
    //Rn – 4 → Rn, MACL → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS.L MACL,@–Rn ');
}

simulator.instructionProcessors['0100nnnn00100010'] = function(instruction) {
    //STS.L PR,@–Rn 
    //Rn – 4 → Rn, PR → (Rn) 
    SetR(instruction.n, GetR(instruction.n)-4)
    Write(GetR(instruction.n), GetPR(), 32)
}

simulator.instructionProcessors['11000011iiiiiiii'] = function(instruction) {
    //TRAPA #imm 
    //PC/SR → stack area, (imm × 4 + VBR) → PC 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: TRAPA #imm ');
}

simulator.instructionProcessors['1111nnnn01011101'] = function(instruction) {
    //FABS FRn 
    //|FRn| → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FABS FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0000'] = function(instruction) {
    //FADD FRm,FRn 
    //FRn + FRm → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FADD FRm,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0100'] = function(instruction) {
    //FCMP/EQ FRm,FRn 
    //(FRn = FRm)? 1:0 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FCMP/EQ FRm,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0101'] = function(instruction) {
    //FCMP/GT FRm,FRn 
    //(FRn > FRm)? 1:0 → T 1 Compariso
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FCMP/GT FRm,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0011'] = function(instruction) {
    //FDIV FRm,FRn 
    //FRn/FRm → FRn 1
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FDIV FRm,FRn ');
}

simulator.instructionProcessors['1111nnnn10001101'] = function(instruction) {
    //FLDI0 FRn 
    //0x00000000 → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FLDI0 FRn ');
}

simulator.instructionProcessors['1111nnnn10011101'] = function(instruction) {
    //FLDI1 FRn 
    //0x3F800000 → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FLDI1 FRn ');
}

simulator.instructionProcessors['1111mmmm00011101'] = function(instruction) {
    //FLDS FRm,FPUL 
    //FRm → FPUL 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FLDS FRm,FPUL ');
}

simulator.instructionProcessors['1111nnnn00101101'] = function(instruction) {
    //FLOAT FPUL,FRn 
    //(float) FPUL → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FLOAT FPUL,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm1110'] = function(instruction) {
    //FMAC FR0,FRm,FRn 
    //FR0 × FRm + FRn → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMAC FR0,FRm,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm1100'] = function(instruction) {
    //FMOV FRm, FRn 
    //FRm → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV FRm, FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0110'] = function(instruction) {
    //FMOV.S @(R0,Rm),FRn 
    //(R0 + Rm) → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV.S @(R0,Rm),FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm1001'] = function(instruction) {
    //FMOV.S @Rm+,FRn 
    //(Rm) → FRn, Rm+ = 4 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV.S @Rm+,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm1000'] = function(instruction) {
    //FMOV.S @Rm,FRn 
    //(Rm) → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV.S @Rm,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0111'] = function(instruction) {
    //FMOV.S FRm,@(R0,Rn) 
    //FRm → (R0 + Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV.S FRm,@(R0,Rn) ');
}

simulator.instructionProcessors['1111nnnnmmmm1011'] = function(instruction) {
    //FMOV.S FRm,@-Rn 
    //Rn– = 4, FRm → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV.S FRm,@-Rn ');
}

simulator.instructionProcessors['1111nnnnmmmm1010'] = function(instruction) {
    //FMOV.S FRm,@Rn 
    //FRm → (Rn) 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMOV.S FRm,@Rn ');
}

simulator.instructionProcessors['1111nnnnmmmm0010'] = function(instruction) {
    //FMUL FRm,FRn 
    //FRn × FRm → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FMUL FRm,FRn ');
}

simulator.instructionProcessors['1111nnnn01001101'] = function(instruction) {
    //FNEG FRn 
    //–FRn → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FNEG FRn ');
}

simulator.instructionProcessors['1111nnnn00001101'] = function(instruction) {
    //FSTS FPUL,FRn 
    //FPUL → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FSTS FPUL,FRn ');
}

simulator.instructionProcessors['1111nnnnmmmm0001'] = function(instruction) {
    //FSUB FRm,FRn 
    //FRn – FRm → FRn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FSUB FRm,FRn ');
}

simulator.instructionProcessors['1111mmmm00111101'] = function(instruction) {
    //FTRC FRm,FPUL 
    //(long) FRm → FPUL 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: FTRC FRm,FPUL ');
}

simulator.instructionProcessors['0100mmmm01101010'] = function(instruction) {
    //LDS Rm,FPSCR 
    //Rm → FPSCR 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS Rm,FPSCR ');
}

simulator.instructionProcessors['0100mmmm01011010'] = function(instruction) {
    //LDS Rm,FPUL 
    //Rm → FPUL 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS Rm,FPUL ');
}

simulator.instructionProcessors['0100mmmm01100110'] = function(instruction) {
    //LDS.L @Rm+, FPSCR 
    //@Rm → FPSCR, Rm+ = 4 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS.L @Rm+, FPSCR ');
}

simulator.instructionProcessors['0100mmmm01010110'] = function(instruction) {
    //LDS.L @Rm+, FPUL 
    //@Rm → FPUL, Rm+ = 4 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: LDS.L @Rm+, FPUL ');
}

simulator.instructionProcessors['0000nnnn01101010'] = function(instruction) {
    //STS FPSCR, Rn 
    //FPSCR → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS FPSCR, Rn ');
}

simulator.instructionProcessors['0000nnnn01011010'] = function(instruction) {
    //STS FPUL,Rn 
    //FPUL → Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS FPUL,Rn ');
}

simulator.instructionProcessors['0100nnnn01100010'] = function(instruction) {
    //STS.L FPSCR,@-Rn 
    //Rn– = 4, FPCSR → @Rn 
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS.L FPSCR,@-Rn ');
}

simulator.instructionProcessors['0100nnnn01010010'] = function(instruction) {
    //STS.L FPUL,@-Rn 
    //Rn– = 4, FPUL → @Rn 1 —   
    simulator.notImplemented = true;console.log('NOT IMPLEMENTED: STS.L FPUL,@-Rn ');
}