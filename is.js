/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var is = [
{
   "masks":{
      "i":"ff",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"e000",
   "text":"MOV #imm,Rn ",
   "spec":{
      "instructionCode":"1110nnnniiiiiiii",
      "text":"MOV #imm,Rn ",
      "description":"#imm → Sign extension → Rn "
   },
   "description":"#imm → Sign extension → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"9000",
   "text":"MOV.W @(disp,PC),Rn ",
   "spec":{
      "instructionCode":"1001nnnndddddddd",
      "text":"MOV.W @(disp,PC),Rn ",
      "description":"(disp × 2 + PC) → Sign extension → Rn "
   },
   "description":"(disp × 2 + PC) → Sign extension → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"d000",
   "text":"MOV.L @(disp,PC),Rn ",
   "spec":{
      "instructionCode":"1101nnnndddddddd",
      "text":"MOV.L @(disp,PC),Rn ",
      "description":"(disp × 4 + PC) → Rn ",
      "targetMultiplier":4
   },
   "description":"(disp × 4 + PC) → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6003",
   "text":"MOV Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0011",
      "text":"MOV Rm,Rn ",
      "description":"Rm → Rn "
   },
   "description":"Rm → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2000",
   "text":"MOV.B Rm,@Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0000",
      "text":"MOV.B Rm,@Rn ",
      "description":"Rm → (Rn) "
   },
   "description":"Rm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2001",
   "text":"MOV.W Rm,@Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0001",
      "text":"MOV.W Rm,@Rn ",
      "description":"Rm → (Rn) "
   },
   "description":"Rm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2002",
   "text":"MOV.L Rm,@Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0010",
      "text":"MOV.L Rm,@Rn ",
      "description":"Rm → (Rn) "
   },
   "description":"Rm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6000",
   "text":"MOV.B @Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0000",
      "text":"MOV.B @Rm,Rn ",
      "description":"(Rm) → Sign extension → Rn "
   },
   "description":"(Rm) → Sign extension → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6001",
   "text":"MOV.W @Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0001",
      "text":"MOV.W @Rm,Rn ",
      "description":"(Rm) → Sign extension → Rn "
   },
   "description":"(Rm) → Sign extension → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6002",
   "text":"MOV.L @Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0010",
      "text":"MOV.L @Rm,Rn ",
      "description":"(Rm) → Rn "
   },
   "description":"(Rm) → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2004",
   "text":"MOV.B Rm,@–Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0100",
      "text":"MOV.B Rm,@–Rn ",
      "description":"Rn–1 → Rn, Rm → (Rn) "
   },
   "description":"Rn–1 → Rn, Rm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2005",
   "text":"MOV.W Rm,@–Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0101",
      "text":"MOV.W Rm,@–Rn ",
      "description":"Rn–2 → Rn, Rm → (Rn) "
   },
   "description":"Rn–2 → Rn, Rm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2006",
   "text":"MOV.L Rm,@–Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0110",
      "text":"MOV.L Rm,@–Rn ",
      "description":"Rn–4 → Rn, Rm → (Rn) "
   },
   "description":"Rn–4 → Rn, Rm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6004",
   "text":"MOV.B @Rm+,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0100",
      "text":"MOV.B @Rm+,Rn ",
      "description":"(Rm) → Sign extension → Rn,Rm + 1 → Rm "
   },
   "description":"(Rm) → Sign extension → Rn,Rm + 1 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6005",
   "text":"MOV.W @Rm+,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0101",
      "text":"MOV.W @Rm+,Rn ",
      "description":"(Rm) → Sign extension → Rn,Rm + 2 → Rm "
   },
   "description":"(Rm) → Sign extension → Rn,Rm + 2 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6006",
   "text":"MOV.L @Rm+,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0110",
      "text":"MOV.L @Rm+,Rn ",
      "description":"(Rm) → Rn,Rm + 4 → Rm "
   },
   "description":"(Rm) → Rn,Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"f0",
      "m":"0",
      "d":"f"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8000",
   "text":"MOV.B R0,@(disp,Rn) ",
   "spec":{
      "instructionCode":"10000000nnnndddd",
      "text":"MOV.B R0,@(disp,Rn) ",
      "description":"R0 → (disp + Rn) "
   },
   "description":"R0 → (disp + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f0",
      "m":"0",
      "d":"f"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8100",
   "text":"MOV.W R0,@(disp,Rn) ",
   "spec":{
      "instructionCode":"10000001nnnndddd",
      "text":"MOV.W R0,@(disp,Rn) ",
      "description":"R0 → (disp × 2 + Rn) "
   },
   "description":"R0 → (disp × 2 + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"f"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"1000",
   "text":"MOV.L Rm,@(disp,Rn) ",
   "spec":{
      "instructionCode":"0001nnnnmmmmdddd",
      "text":"MOV.L Rm,@(disp,Rn) ",
      "description":"Rm → (disp × 4 + Rn) ",
      "targetMultiplier":4
   },
   "description":"Rm → (disp × 4 + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f0",
      "d":"f"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8400",
   "text":"MOV.B @(disp,Rm),R0 ",
   "spec":{
      "instructionCode":"10000100mmmmdddd",
      "text":"MOV.B @(disp,Rm),R0 ",
      "description":"(disp + Rm) → Sign extension → R0 "
   },
   "description":"(disp + Rm) → Sign extension → R0 "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f0",
      "d":"f"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8500",
   "text":"MOV.W @(disp,Rm),R0 ",
   "spec":{
      "instructionCode":"10000101mmmmdddd",
      "text":"MOV.W @(disp,Rm),R0 ",
      "description":"(disp × 2 + Rm) → Sign extension → R0 "
   },
   "description":"(disp × 2 + Rm) → Sign extension → R0 "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"f"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"5000",
   "text":"MOV.L @(disp,Rm),Rn ",
   "spec":{
      "instructionCode":"0101nnnnmmmmdddd",
      "text":"MOV.L @(disp,Rm),Rn ",
      "description":"(disp × 4 + Rm) → Rn ",
      "targetMultiplier":4
   },
   "description":"(disp × 4 + Rm) → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"4",
   "text":"MOV.B Rm,@(R0,Rn) ",
   "spec":{
      "instructionCode":"0000nnnnmmmm0100",
      "text":"MOV.B Rm,@(R0,Rn) ",
      "description":"Rm → (R0 + Rn) "
   },
   "description":"Rm → (R0 + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"5",
   "text":"MOV.W Rm,@(R0,Rn) ",
   "spec":{
      "instructionCode":"0000nnnnmmmm0101",
      "text":"MOV.W Rm,@(R0,Rn) ",
      "description":"Rm → (R0 + Rn) "
   },
   "description":"Rm → (R0 + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6",
   "text":"MOV.L Rm,@(R0,Rn) ",
   "spec":{
      "instructionCode":"0000nnnnmmmm0110",
      "text":"MOV.L Rm,@(R0,Rn) ",
      "description":"Rm → (R0 + Rn) "
   },
   "description":"Rm → (R0 + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"c",
   "text":"MOV.B @(R0,Rm),Rn ",
   "spec":{
      "instructionCode":"0000nnnnmmmm1100",
      "text":"MOV.B @(R0,Rm),Rn ",
      "description":"(R0 + Rm) → Sign extension → Rn "
   },
   "description":"(R0 + Rm) → Sign extension → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"d",
   "text":"MOV.W @(R0,Rm),Rn ",
   "spec":{
      "instructionCode":"0000nnnnmmmm1101",
      "text":"MOV.W @(R0,Rm),Rn ",
      "description":"(R0 + Rm) → Sign extension → Rn "
   },
   "description":"(R0 + Rm) → Sign extension → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"e",
   "text":"MOV.L @(R0,Rm),Rn ",
   "spec":{
      "instructionCode":"0000nnnnmmmm1110",
      "text":"MOV.L @(R0,Rm),Rn ",
      "description":"(R0 + Rm) → Rn "
   },
   "description":"(R0 + Rm) → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c000",
   "text":"MOV.B R0,@(disp,GBR) ",
   "spec":{
      "instructionCode":"11000000dddddddd",
      "text":"MOV.B R0,@(disp,GBR) ",
      "description":"R0 → (disp + GBR) "
   },
   "description":"R0 → (disp + GBR) "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c100",
   "text":"MOV.W R0,@(disp,GBR) ",
   "spec":{
      "instructionCode":"11000001dddddddd",
      "text":"MOV.W R0,@(disp,GBR) ",
      "description":"R0 → (disp × 2 + GBR) "
   },
   "description":"R0 → (disp × 2 + GBR) "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c200",
   "text":"MOV.L R0,@(disp,GBR) ",
   "spec":{
      "instructionCode":"11000010dddddddd",
      "text":"MOV.L R0,@(disp,GBR) ",
      "description":"R0 → (disp × 4 + GBR) ",
      "targetMultiplier":4
   },
   "description":"R0 → (disp × 4 + GBR) "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c400",
   "text":"MOV.B @(disp,GBR),R0 ",
   "spec":{
      "instructionCode":"11000100dddddddd",
      "text":"MOV.B @(disp,GBR),R0 ",
      "description":"(disp + GBR) → Sign extension → R0 "
   },
   "description":"(disp + GBR) → Sign extension → R0 "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c500",
   "text":"MOV.W @(disp,GBR),R0 ",
   "spec":{
      "instructionCode":"11000101dddddddd",
      "text":"MOV.W @(disp,GBR),R0 ",
      "description":"(disp × 2 + GBR) → Sign extension → R0 "
   },
   "description":"(disp × 2 + GBR) → Sign extension → R0 "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c600",
   "text":"MOV.L @(disp,GBR),R0 ",
   "spec":{
      "instructionCode":"11000110dddddddd",
      "text":"MOV.L @(disp,GBR),R0 ",
      "description":"(disp × 4 + GBR) → R0 ",
      "targetMultiplier":4
   },
   "description":"(disp × 4 + GBR) → R0 "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c700",
   "text":"MOVA @(disp,PC),R0 ",
   "spec":{
      "instructionCode":"11000111dddddddd",
      "text":"MOVA @(disp,PC),R0 ",
      "description":"disp × 4 + PC → R0 ",
      "targetMultiplier":4
   },
   "description":"disp × 4 + PC → R0 "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"29",
   "text":"MOVT Rn ",
   "spec":{
      "instructionCode":"0000nnnn00101001",
      "text":"MOVT Rn ",
      "description":"T → Rn "
   },
   "description":"T → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6008",
   "text":"SWAP.B Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1000",
      "text":"SWAP.B Rm,Rn ",
      "description":"Rm → Swap bottom two bytes → Rn "
   },
   "description":"Rm → Swap bottom two bytes → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6009",
   "text":"SWAP.W Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1001",
      "text":"SWAP.W Rm,Rn ",
      "description":"Rm → Swap two consecutive words → Rn "
   },
   "description":"Rm → Swap two consecutive words → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"200d",
   "text":"XTRCT Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1101",
      "text":"XTRCT Rm,Rn ",
      "description":"Rm: Middle 32 bits of Rn → Rn "
   },
   "description":"Rm: Middle 32 bits of Rn → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"300c",
   "text":"ADD Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1100",
      "text":"ADD Rm,Rn ",
      "description":"Rn + Rm → Rn "
   },
   "description":"Rn + Rm → Rn "
},
{
   "masks":{
      "i":"ff",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"7000",
   "text":"ADD #imm,Rn ",
   "spec":{
      "instructionCode":"0111nnnniiiiiiii",
      "text":"ADD #imm,Rn ",
      "description":"Rn + imm → Rn "
   },
   "description":"Rn + imm → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"300e",
   "text":"ADDC Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1110",
      "text":"ADDC Rm,Rn ",
      "description":"Rn + Rm + T → Rn, Carry → T "
   },
   "description":"Rn + Rm + T → Rn, Carry → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"300f",
   "text":"ADDV Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1111",
      "text":"ADDV Rm,Rn ",
      "description":"Rn + Rm → Rn, Overflow → T "
   },
   "description":"Rn + Rm → Rn, Overflow → T "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8800",
   "text":"CMP/EQ #imm,R0 ",
   "spec":{
      "instructionCode":"10001000iiiiiiii",
      "text":"CMP/EQ #imm,R0 ",
      "description":"If R0 = imm, 1 → T"
   },
   "description":"If R0 = imm, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3000",
   "text":"CMP/EQ Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0000",
      "text":"CMP/EQ Rm,Rn ",
      "description":"If Rn = Rm, 1 → T"
   },
   "description":"If Rn = Rm, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3002",
   "text":"CMP/HS Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0010",
      "text":"CMP/HS Rm,Rn ",
      "description":"If Rn>=Rm with unsigned data, 1 → T"
   },
   "description":"If Rn>=Rm with unsigned data, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3003",
   "text":"CMP/GE Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0011",
      "text":"CMP/GE Rm,Rn ",
      "description":"If Rn >= Rm with signed data, 1 → T"
   },
   "description":"If Rn >= Rm with signed data, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3006",
   "text":"CMP/HI Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0110",
      "text":"CMP/HI Rm,Rn ",
      "description":"If Rn > Rm with unsigned data, 1 → T"
   },
   "description":"If Rn > Rm with unsigned data, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3007",
   "text":"CMP/GT Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0111",
      "text":"CMP/GT Rm,Rn ",
      "description":"If Rn > Rm with signed data, 1 → T"
   },
   "description":"If Rn > Rm with signed data, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4015",
   "text":"CMP/PL Rn ",
   "spec":{
      "instructionCode":"0100nnnn00010101",
      "text":"CMP/PL Rn ",
      "description":"If Rn > 0, 1 → T"
   },
   "description":"If Rn > 0, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4011",
   "text":"CMP/PZ Rn ",
   "spec":{
      "instructionCode":"0100nnnn00010001",
      "text":"CMP/PZ Rn ",
      "description":"If Rn >= 0, 1 → T"
   },
   "description":"If Rn >= 0, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"200c",
   "text":"CMP/STR Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1100",
      "text":"CMP/STR Rm,Rn ",
      "description":"If Rn and Rm have an equivalent byte, 1 → T"
   },
   "description":"If Rn and Rm have an equivalent byte, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3004",
   "text":"DIV1 Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0100",
      "text":"DIV1 Rm,Rn ",
      "description":"Single-step division (Rn ÷ Rm) 1 → T"
   },
   "description":"Single-step division (Rn ÷ Rm) 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2007",
   "text":"DIV0S Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm0111",
      "text":"DIV0S Rm,Rn ",
      "description":"MSB of Rn → Q, MSB of Rm → M, M ^ Q → T "
   },
   "description":"MSB of Rn → Q, MSB of Rm → M, M ^ Q → T "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"19",
   "text":"DIV0U ",
   "spec":{
      "instructionCode":"0000000000011001",
      "text":"DIV0U ",
      "description":"0 → M/Q/T"
   },
   "description":"0 → M/Q/T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"300d",
   "text":"DMULS.L Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1101",
      "text":"DMULS.L Rm,Rn ",
      "description":"Signed operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits"
   },
   "description":"Signed operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3005",
   "text":"DMULU.L Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm0101",
      "text":"DMULU.L Rm,Rn ",
      "description":"Unsigned operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits"
   },
   "description":"Unsigned operation of Rn × Rm → MACH, MACL 32 × 32 → 64 bits"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4010",
   "text":"DT Rn ",
   "spec":{
      "instructionCode":"0100nnnn00010000",
      "text":"DT Rn ",
      "description":"Rn – 1 → Rn, when Rn is 0, 1 → T. When Rn is nonzero, 0 → T"
   },
   "description":"Rn – 1 → Rn, when Rn is 0, 1 → T. When Rn is nonzero, 0 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"600e",
   "text":"EXTS.B Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1110",
      "text":"EXTS.B Rm,Rn ",
      "description":"Byte in Rm is signextended → Rn "
   },
   "description":"Byte in Rm is signextended → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"600f",
   "text":"EXTS.W Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1111",
      "text":"EXTS.W Rm,Rn ",
      "description":"Word in Rm is signextended → Rn "
   },
   "description":"Word in Rm is signextended → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"600c",
   "text":"EXTU.B Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1100",
      "text":"EXTU.B Rm,Rn ",
      "description":"Byte in Rm is zeroextended → Rn "
   },
   "description":"Byte in Rm is zeroextended → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"600d",
   "text":"EXTU.W Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1101",
      "text":"EXTU.W Rm,Rn ",
      "description":"Word in Rm is zeroextended → Rn "
   },
   "description":"Word in Rm is zeroextended → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f",
   "text":"MAC.L @Rm+,@Rn+ ",
   "spec":{
      "instructionCode":"0000nnnnmmmm1111",
      "text":"MAC.L @Rm+,@Rn+ ",
      "description":"Signed operation of (Rn) × (Rm) + MAC → MAC 32 × 32 + 64 → 64 bits"
   },
   "description":"Signed operation of (Rn) × (Rm) + MAC → MAC 32 × 32 + 64 → 64 bits"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"400f",
   "text":"MAC.W @Rm+,@Rn+ ",
   "spec":{
      "instructionCode":"0100nnnnmmmm1111",
      "text":"MAC.W @Rm+,@Rn+ ",
      "description":"Signed operation of (Rn) × (Rm) + MAC → MAC 16 × 16 + 64 → 64 bits"
   },
   "description":"Signed operation of (Rn) × (Rm) + MAC → MAC 16 × 16 + 64 → 64 bits"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"7",
   "text":"MUL.L Rm,Rn ",
   "spec":{
      "instructionCode":"0000nnnnmmmm0111",
      "text":"MUL.L Rm,Rn ",
      "description":"Rn × Rm → MACL, 32 × 32 → 32 bits"
   },
   "description":"Rn × Rm → MACL, 32 × 32 → 32 bits"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"200f",
   "text":"MULS.W Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1111",
      "text":"MULS.W Rm,Rn ",
      "description":"Signed operation of Rn × Rm → MACL 16 × 16 → 32 bits 1 to 3"
   },
   "description":"Signed operation of Rn × Rm → MACL 16 × 16 → 32 bits 1 to 3"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"200e",
   "text":"MULU.W Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1110",
      "text":"MULU.W Rm,Rn ",
      "description":"Unsigned operation of Rn × Rm → MACL 16 × 16 → 32 bits"
   },
   "description":"Unsigned operation of Rn × Rm → MACL 16 × 16 → 32 bits"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"600b",
   "text":"NEG Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1011",
      "text":"NEG Rm,Rn ",
      "description":"0 – Rm → Rn "
   },
   "description":"0 – Rm → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"600a",
   "text":"NEGC Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm1010",
      "text":"NEGC Rm,Rn ",
      "description":"0 – Rm – T → Rn, Borrow → T "
   },
   "description":"0 – Rm – T → Rn, Borrow → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"3008",
   "text":"SUB Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1000",
      "text":"SUB Rm,Rn ",
      "description":"Rn – Rm → Rn "
   },
   "description":"Rn – Rm → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"300a",
   "text":"SUBC Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1010",
      "text":"SUBC Rm,Rn ",
      "description":"Rn – Rm – T → Rn, Borrow → T "
   },
   "description":"Rn – Rm – T → Rn, Borrow → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"300b",
   "text":"SUBV Rm,Rn ",
   "spec":{
      "instructionCode":"0011nnnnmmmm1011",
      "text":"SUBV Rm,Rn ",
      "description":"Rn – Rm → Rn, Underflow → T "
   },
   "description":"Rn – Rm → Rn, Underflow → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2009",
   "text":"AND Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1001",
      "text":"AND Rm,Rn ",
      "description":"Rn & Rm → Rn "
   },
   "description":"Rn & Rm → Rn "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c900",
   "text":"AND #imm,R0 ",
   "spec":{
      "instructionCode":"11001001iiiiiiii",
      "text":"AND #imm,R0 ",
      "description":"R0 & imm → R0 "
   },
   "description":"R0 & imm → R0 "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"cd00",
   "text":"AND.B #imm,@(R0,GBR) ",
   "spec":{
      "instructionCode":"11001101iiiiiiii",
      "text":"AND.B #imm,@(R0,GBR) ",
      "description":"(R0 + GBR) & imm → (R0 + GBR) "
   },
   "description":"(R0 + GBR) & imm → (R0 + GBR) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"6007",
   "text":"NOT Rm,Rn ",
   "spec":{
      "instructionCode":"0110nnnnmmmm0111",
      "text":"NOT Rm,Rn ",
      "description":"~Rm → Rn "
   },
   "description":"~Rm → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"200b",
   "text":"OR Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1011",
      "text":"OR Rm,Rn ",
      "description":"Rn | Rm → Rn "
   },
   "description":"Rn | Rm → Rn "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"cb00",
   "text":"OR #imm,R0 ",
   "spec":{
      "instructionCode":"11001011iiiiiiii",
      "text":"OR #imm,R0 ",
      "description":"R0 | imm → R0 "
   },
   "description":"R0 | imm → R0 "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"cf00",
   "text":"OR.B #imm,@(R0,GBR) ",
   "spec":{
      "instructionCode":"11001111iiiiiiii",
      "text":"OR.B #imm,@(R0,GBR) ",
      "description":"(R0 + GBR) | imm → (R0 + GBR) "
   },
   "description":"(R0 + GBR) | imm → (R0 + GBR) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"401b",
   "text":"TAS.B @Rn ",
   "spec":{
      "instructionCode":"0100nnnn00011011",
      "text":"TAS.B @Rn ",
      "description":"If (Rn) is 0, 1 → T; 1 → MSB of (Rn)"
   },
   "description":"If (Rn) is 0, 1 → T; 1 → MSB of (Rn)"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"2008",
   "text":"TST Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1000",
      "text":"TST Rm,Rn ",
      "description":"Rn & Rm; if the result is 0, 1 → T"
   },
   "description":"Rn & Rm; if the result is 0, 1 → T"
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c800",
   "text":"TST #imm,R0 ",
   "spec":{
      "instructionCode":"11001000iiiiiiii",
      "text":"TST #imm,R0 ",
      "description":"R0 & imm; if the result is 0, 1 → T"
   },
   "description":"R0 & imm; if the result is 0, 1 → T"
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"cc00",
   "text":"TST.B #imm,@(R0,GBR) ",
   "spec":{
      "instructionCode":"11001100iiiiiiii",
      "text":"TST.B #imm,@(R0,GBR) ",
      "description":"(R0 + GBR) & imm; if the result is 0, 1 → T"
   },
   "description":"(R0 + GBR) & imm; if the result is 0, 1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"200a",
   "text":"XOR Rm,Rn ",
   "spec":{
      "instructionCode":"0010nnnnmmmm1010",
      "text":"XOR Rm,Rn ",
      "description":"Rn ^ Rm → Rn "
   },
   "description":"Rn ^ Rm → Rn "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"ca00",
   "text":"XOR #imm,R0 ",
   "spec":{
      "instructionCode":"11001010iiiiiiii",
      "text":"XOR #imm,R0 ",
      "description":"R0 ^ imm → R0 "
   },
   "description":"R0 ^ imm → R0 "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"ce00",
   "text":"XOR.B #imm,@(R0,GBR) ",
   "spec":{
      "instructionCode":"11001110iiiiiiii",
      "text":"XOR.B #imm,@(R0,GBR) ",
      "description":"(R0 + GBR) ^ imm → (R0 + GBR) "
   },
   "description":"(R0 + GBR) ^ imm → (R0 + GBR) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4004",
   "text":"ROTL Rn ",
   "spec":{
      "instructionCode":"0100nnnn00000100",
      "text":"ROTL Rn ",
      "description":"T ← Rn ← MSB "
   },
   "description":"T ← Rn ← MSB "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4005",
   "text":"ROTR Rn ",
   "spec":{
      "instructionCode":"0100nnnn00000101",
      "text":"ROTR Rn ",
      "description":"LSB → Rn → T "
   },
   "description":"LSB → Rn → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4024",
   "text":"ROTCL Rn ",
   "spec":{
      "instructionCode":"0100nnnn00100100",
      "text":"ROTCL Rn ",
      "description":"T ← Rn ← T "
   },
   "description":"T ← Rn ← T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4025",
   "text":"ROTCR Rn ",
   "spec":{
      "instructionCode":"0100nnnn00100101",
      "text":"ROTCR Rn ",
      "description":"T → Rn → T "
   },
   "description":"T → Rn → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4020",
   "text":"SHAL Rn ",
   "spec":{
      "instructionCode":"0100nnnn00100000",
      "text":"SHAL Rn ",
      "description":"T ← Rn ← 0 "
   },
   "description":"T ← Rn ← 0 "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4021",
   "text":"SHAR Rn ",
   "spec":{
      "instructionCode":"0100nnnn00100001",
      "text":"SHAR Rn ",
      "description":"MSB → Rn → T "
   },
   "description":"MSB → Rn → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4000",
   "text":"SHLL Rn ",
   "spec":{
      "instructionCode":"0100nnnn00000000",
      "text":"SHLL Rn ",
      "description":"T ← Rn ← 0 "
   },
   "description":"T ← Rn ← 0 "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4001",
   "text":"SHLR Rn ",
   "spec":{
      "instructionCode":"0100nnnn00000001",
      "text":"SHLR Rn ",
      "description":"0 → Rn → T "
   },
   "description":"0 → Rn → T "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4008",
   "text":"SHLL2 Rn ",
   "spec":{
      "instructionCode":"0100nnnn00001000",
      "text":"SHLL2 Rn ",
      "description":"Rn<<2 → Rn "
   },
   "description":"Rn<<2 → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4009",
   "text":"SHLR2 Rn ",
   "spec":{
      "instructionCode":"0100nnnn00001001",
      "text":"SHLR2 Rn ",
      "description":"Rn>>2 → Rn "
   },
   "description":"Rn>>2 → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4018",
   "text":"SHLL8 Rn ",
   "spec":{
      "instructionCode":"0100nnnn00011000",
      "text":"SHLL8 Rn ",
      "description":"Rn<<8 → Rn "
   },
   "description":"Rn<<8 → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4019",
   "text":"SHLR8 Rn ",
   "spec":{
      "instructionCode":"0100nnnn00011001",
      "text":"SHLR8 Rn ",
      "description":"Rn>>8 → Rn "
   },
   "description":"Rn>>8 → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4028",
   "text":"SHLL16 Rn ",
   "spec":{
      "instructionCode":"0100nnnn00101000",
      "text":"SHLL16 Rn ",
      "description":"Rn<<16 → Rn "
   },
   "description":"Rn<<16 → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4029",
   "text":"SHLR16 Rn ",
   "spec":{
      "instructionCode":"0100nnnn00101001",
      "text":"SHLR16 Rn ",
      "description":"Rn>>16 → Rn "
   },
   "description":"Rn>>16 → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8b00",
   "text":"BF label ",
   "spec":{
      "instructionCode":"10001011dddddddd",
      "text":"BF label ",
      "description":"If T = 0, disp × 2 + PC → PC; if T = 1, nop",
      "targetMultiplier":2
   },
   "description":"If T = 0, disp × 2 + PC → PC; if T = 1, nop"
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8f00",
   "text":"BF/S label ",
   "spec":{
      "instructionCode":"10001111dddddddd",
      "text":"BF/S label ",
      "description":"Delayed branch, if T = 0, disp × 2 + PC → PC; if T = 1, nop",
      "targetMultiplier":2
   },
   "description":"Delayed branch, if T = 0, disp × 2 + PC → PC; if T = 1, nop"
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8900",
   "text":"BT label ",
   "spec":{
      "instructionCode":"10001001dddddddd",
      "text":"BT label ",
      "description":"If T = 1, disp × 2 + PC → PC; if T = 0, nop",
      "targetMultiplier":2
   },
   "description":"If T = 1, disp × 2 + PC → PC; if T = 0, nop"
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"ff"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"8d00",
   "text":"BT/S label ",
   "spec":{
      "instructionCode":"10001101dddddddd",
      "text":"BT/S label ",
      "description":"Delayed branch, if T = 1, disp × 2 + PC → PC; if T = 0, nop",
      "targetMultiplier":2
   },
   "description":"Delayed branch, if T = 1, disp × 2 + PC → PC; if T = 0, nop"
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"fff"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"a000",
   "text":"BRA label ",
   "spec":{
      "instructionCode":"1010dddddddddddd",
      "text":"BRA label ",
      "description":"Delayed branch, disp × 2 + PC → PC ",
      "targetMultiplier":2
   },
   "description":"Delayed branch, disp × 2 + PC → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"23",
   "text":"BRAF Rm ",
   "spec":{
      "instructionCode":"0000mmmm00100011",
      "text":"BRAF Rm ",
      "description":"Delayed branch, Rm + PC → PC "
   },
   "description":"Delayed branch, Rm + PC → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"fff"
   },
   "instructionCodeMask":"f000",
   "instructionCode":"b000",
   "text":"BSR label ",
   "spec":{
      "instructionCode":"1011dddddddddddd",
      "text":"BSR label ",
      "description":"Delayed branch, PC → PR, disp × 2 + PC → PC ",
      "targetMultiplier":2
   },
   "description":"Delayed branch, PC → PR, disp × 2 + PC → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"3",
   "text":"BSRF Rm ",
   "spec":{
      "instructionCode":"0000mmmm00000011",
      "text":"BSRF Rm ",
      "description":"Delayed branch, PC → PR, Rm + PC → PC "
   },
   "description":"Delayed branch, PC → PR, Rm + PC → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"402b",
   "text":"JMP @Rm ",
   "spec":{
      "instructionCode":"0100mmmm00101011",
      "text":"JMP @Rm ",
      "description":"Delayed branch, Rm → PC "
   },
   "description":"Delayed branch, Rm → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"400b",
   "text":"JSR @Rm ",
   "spec":{
      "instructionCode":"0100mmmm00001011",
      "text":"JSR @Rm ",
      "description":"Delayed branch, PC → PR, Rm → PC "
   },
   "description":"Delayed branch, PC → PR, Rm → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"b",
   "text":"RTS ",
   "spec":{
      "instructionCode":"0000000000001011",
      "text":"RTS ",
      "description":"Delayed branch, PR → PC "
   },
   "description":"Delayed branch, PR → PC "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"8",
   "text":"CLRT ",
   "spec":{
      "instructionCode":"0000000000001000",
      "text":"CLRT ",
      "description":"0 → T"
   },
   "description":"0 → T"
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"28",
   "text":"CLRMAC ",
   "spec":{
      "instructionCode":"0000000000101000",
      "text":"CLRMAC ",
      "description":"0 → MACH, MACL "
   },
   "description":"0 → MACH, MACL "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"400e",
   "text":"LDC Rm,SR ",
   "spec":{
      "instructionCode":"0100mmmm00001110",
      "text":"LDC Rm,SR ",
      "description":"Rm → SR "
   },
   "description":"Rm → SR "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"401e",
   "text":"LDC Rm,GBR ",
   "spec":{
      "instructionCode":"0100mmmm00011110",
      "text":"LDC Rm,GBR ",
      "description":"Rm → GBR "
   },
   "description":"Rm → GBR "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"402e",
   "text":"LDC Rm,VBR ",
   "spec":{
      "instructionCode":"0100mmmm00101110",
      "text":"LDC Rm,VBR ",
      "description":"Rm → VBR "
   },
   "description":"Rm → VBR "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4007",
   "text":"LDC.L @Rm+,SR ",
   "spec":{
      "instructionCode":"0100mmmm00000111",
      "text":"LDC.L @Rm+,SR ",
      "description":"(Rm) → SR, Rm + 4 → Rm "
   },
   "description":"(Rm) → SR, Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4017",
   "text":"LDC.L @Rm+,GBR ",
   "spec":{
      "instructionCode":"0100mmmm00010111",
      "text":"LDC.L @Rm+,GBR ",
      "description":"(Rm) → GBR, Rm + 4 → Rm "
   },
   "description":"(Rm) → GBR, Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4027",
   "text":"LDC.L @Rm+,VBR ",
   "spec":{
      "instructionCode":"0100mmmm00100111",
      "text":"LDC.L @Rm+,VBR ",
      "description":"(Rm) → VBR, Rm + 4 → Rm "
   },
   "description":"(Rm) → VBR, Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"400a",
   "text":"LDS Rm,MACH ",
   "spec":{
      "instructionCode":"0100mmmm00001010",
      "text":"LDS Rm,MACH ",
      "description":"Rm → MACH "
   },
   "description":"Rm → MACH "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"401a",
   "text":"LDS Rm,MACL ",
   "spec":{
      "instructionCode":"0100mmmm00011010",
      "text":"LDS Rm,MACL ",
      "description":"Rm → MACL "
   },
   "description":"Rm → MACL "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"402a",
   "text":"LDS Rm,PR ",
   "spec":{
      "instructionCode":"0100mmmm00101010",
      "text":"LDS Rm,PR ",
      "description":"Rm → PR "
   },
   "description":"Rm → PR "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4006",
   "text":"LDS.L @Rm+,MACH ",
   "spec":{
      "instructionCode":"0100mmmm00000110",
      "text":"LDS.L @Rm+,MACH ",
      "description":"(Rm) → MACH, Rm + 4 → Rm "
   },
   "description":"(Rm) → MACH, Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4016",
   "text":"LDS.L @Rm+,MACL ",
   "spec":{
      "instructionCode":"0100mmmm00010110",
      "text":"LDS.L @Rm+,MACL ",
      "description":"(Rm) → MACL, Rm + 4 → Rm "
   },
   "description":"(Rm) → MACL, Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4026",
   "text":"LDS.L @Rm+,PR ",
   "spec":{
      "instructionCode":"0100mmmm00100110",
      "text":"LDS.L @Rm+,PR ",
      "description":"(Rm) → PR, Rm + 4 → Rm "
   },
   "description":"(Rm) → PR, Rm + 4 → Rm "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"9",
   "text":"NOP ",
   "spec":{
      "instructionCode":"0000000000001001",
      "text":"NOP ",
      "description":"No operation "
   },
   "description":"No operation "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"2b",
   "text":"RTE ",
   "spec":{
      "instructionCode":"0000000000101011",
      "text":"RTE ",
      "description":"Delayed branch, stack area → PC/SR "
   },
   "description":"Delayed branch, stack area → PC/SR "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"18",
   "text":"SETT ",
   "spec":{
      "instructionCode":"0000000000011000",
      "text":"SETT ",
      "description":"1 → T"
   },
   "description":"1 → T"
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ffff",
   "instructionCode":"1b",
   "text":"SLEEP ",
   "spec":{
      "instructionCode":"0000000000011011",
      "text":"SLEEP ",
      "description":"Sleep 3"
   },
   "description":"Sleep 3"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"2",
   "text":"STC SR,Rn ",
   "spec":{
      "instructionCode":"0000nnnn00000010",
      "text":"STC SR,Rn ",
      "description":"SR → Rn "
   },
   "description":"SR → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"12",
   "text":"STC GBR,Rn ",
   "spec":{
      "instructionCode":"0000nnnn00010010",
      "text":"STC GBR,Rn ",
      "description":"GBR → Rn "
   },
   "description":"GBR → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"22",
   "text":"STC VBR,Rn ",
   "spec":{
      "instructionCode":"0000nnnn00100010",
      "text":"STC VBR,Rn ",
      "description":"VBR → Rn "
   },
   "description":"VBR → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4003",
   "text":"STC.L SR,@–Rn ",
   "spec":{
      "instructionCode":"0100nnnn00000011",
      "text":"STC.L SR,@–Rn ",
      "description":"Rn – 4 → Rn, SR → (Rn) "
   },
   "description":"Rn – 4 → Rn, SR → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4013",
   "text":"STC.L GBR,@–Rn ",
   "spec":{
      "instructionCode":"0100nnnn00010011",
      "text":"STC.L GBR,@–Rn ",
      "description":"Rn – 4 → Rn, GBR → (Rn) "
   },
   "description":"Rn – 4 → Rn, GBR → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4023",
   "text":"STC.L VBR,@–Rn ",
   "spec":{
      "instructionCode":"0100nnnn00100011",
      "text":"STC.L VBR,@–Rn ",
      "description":"Rn – 4 → Rn, VBR → (Rn) "
   },
   "description":"Rn – 4 → Rn, VBR → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"a",
   "text":"STS MACH,Rn ",
   "spec":{
      "instructionCode":"0000nnnn00001010",
      "text":"STS MACH,Rn ",
      "description":"MACH → Rn "
   },
   "description":"MACH → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"1a",
   "text":"STS MACL,Rn ",
   "spec":{
      "instructionCode":"0000nnnn00011010",
      "text":"STS MACL,Rn ",
      "description":"MACL → Rn "
   },
   "description":"MACL → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"2a",
   "text":"STS PR,Rn ",
   "spec":{
      "instructionCode":"0000nnnn00101010",
      "text":"STS PR,Rn ",
      "description":"PR → Rn "
   },
   "description":"PR → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4002",
   "text":"STS.L MACH,@–Rn ",
   "spec":{
      "instructionCode":"0100nnnn00000010",
      "text":"STS.L MACH,@–Rn ",
      "description":"Rn – 4 → Rn, MACH → (Rn) "
   },
   "description":"Rn – 4 → Rn, MACH → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4012",
   "text":"STS.L MACL,@–Rn ",
   "spec":{
      "instructionCode":"0100nnnn00010010",
      "text":"STS.L MACL,@–Rn ",
      "description":"Rn – 4 → Rn, MACL → (Rn) "
   },
   "description":"Rn – 4 → Rn, MACL → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4022",
   "text":"STS.L PR,@–Rn ",
   "spec":{
      "instructionCode":"0100nnnn00100010",
      "text":"STS.L PR,@–Rn ",
      "description":"Rn – 4 → Rn, PR → (Rn) "
   },
   "description":"Rn – 4 → Rn, PR → (Rn) "
},
{
   "masks":{
      "i":"ff",
      "n":"0",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"ff00",
   "instructionCode":"c300",
   "text":"TRAPA #imm ",
   "spec":{
      "instructionCode":"11000011iiiiiiii",
      "text":"TRAPA #imm ",
      "description":"PC/SR → stack area, (imm × 4 + VBR) → PC "
   },
   "description":"PC/SR → stack area, (imm × 4 + VBR) → PC "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f05d",
   "text":"FABS FRn ",
   "spec":{
      "instructionCode":"1111nnnn01011101",
      "text":"FABS FRn ",
      "description":"|FRn| → FRn "
   },
   "description":"|FRn| → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f000",
   "text":"FADD FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0000",
      "text":"FADD FRm,FRn ",
      "description":"FRn + FRm → FRn "
   },
   "description":"FRn + FRm → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f004",
   "text":"FCMP/EQ FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0100",
      "text":"FCMP/EQ FRm,FRn ",
      "description":"(FRn = FRm)? 1:0 → T"
   },
   "description":"(FRn = FRm)? 1:0 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f005",
   "text":"FCMP/GT FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0101",
      "text":"FCMP/GT FRm,FRn ",
      "description":"(FRn > FRm)? 1:0 → T"
   },
   "description":"(FRn > FRm)? 1:0 → T"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f003",
   "text":"FDIV FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0011",
      "text":"FDIV FRm,FRn ",
      "description":"FRn/FRm → FRn"
   },
   "description":"FRn/FRm → FRn"
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f08d",
   "text":"FLDI0 FRn ",
   "spec":{
      "instructionCode":"1111nnnn10001101",
      "text":"FLDI0 FRn ",
      "description":"0x00000000 → FRn "
   },
   "description":"0x00000000 → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f09d",
   "text":"FLDI1 FRn ",
   "spec":{
      "instructionCode":"1111nnnn10011101",
      "text":"FLDI1 FRn ",
      "description":"0x3F800000 → FRn "
   },
   "description":"0x3F800000 → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f01d",
   "text":"FLDS FRm,FPUL ",
   "spec":{
      "instructionCode":"1111mmmm00011101",
      "text":"FLDS FRm,FPUL ",
      "description":"FRm → FPUL "
   },
   "description":"FRm → FPUL "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f02d",
   "text":"FLOAT FPUL,FRn ",
   "spec":{
      "instructionCode":"1111nnnn00101101",
      "text":"FLOAT FPUL,FRn ",
      "description":"(float) FPUL → FRn "
   },
   "description":"(float) FPUL → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f00e",
   "text":"FMAC FR0,FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm1110",
      "text":"FMAC FR0,FRm,FRn ",
      "description":"FR0 × FRm + FRn → FRn "
   },
   "description":"FR0 × FRm + FRn → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f00c",
   "text":"FMOV FRm, FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm1100",
      "text":"FMOV FRm, FRn ",
      "description":"FRm → FRn "
   },
   "description":"FRm → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f006",
   "text":"FMOV.S @(R0,Rm),FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0110",
      "text":"FMOV.S @(R0,Rm),FRn ",
      "description":"(R0 + Rm) → FRn "
   },
   "description":"(R0 + Rm) → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f009",
   "text":"FMOV.S @Rm+,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm1001",
      "text":"FMOV.S @Rm+,FRn ",
      "description":"(Rm) → FRn, Rm+ = 4 "
   },
   "description":"(Rm) → FRn, Rm+ = 4 "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f008",
   "text":"FMOV.S @Rm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm1000",
      "text":"FMOV.S @Rm,FRn ",
      "description":"(Rm) → FRn "
   },
   "description":"(Rm) → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f007",
   "text":"FMOV.S FRm,@(R0,Rn) ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0111",
      "text":"FMOV.S FRm,@(R0,Rn) ",
      "description":"FRm → (R0 + Rn) "
   },
   "description":"FRm → (R0 + Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f00b",
   "text":"FMOV.S FRm,@-Rn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm1011",
      "text":"FMOV.S FRm,@-Rn ",
      "description":"Rn– = 4, FRm → (Rn) "
   },
   "description":"Rn– = 4, FRm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f00a",
   "text":"FMOV.S FRm,@Rn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm1010",
      "text":"FMOV.S FRm,@Rn ",
      "description":"FRm → (Rn) "
   },
   "description":"FRm → (Rn) "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f002",
   "text":"FMUL FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0010",
      "text":"FMUL FRm,FRn ",
      "description":"FRn × FRm → FRn "
   },
   "description":"FRn × FRm → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f04d",
   "text":"FNEG FRn ",
   "spec":{
      "instructionCode":"1111nnnn01001101",
      "text":"FNEG FRn ",
      "description":"–FRn → FRn "
   },
   "description":"–FRn → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f00d",
   "text":"FSTS FPUL,FRn ",
   "spec":{
      "instructionCode":"1111nnnn00001101",
      "text":"FSTS FPUL,FRn ",
      "description":"FPUL → FRn "
   },
   "description":"FPUL → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"f0",
      "d":"0"
   },
   "instructionCodeMask":"f00f",
   "instructionCode":"f001",
   "text":"FSUB FRm,FRn ",
   "spec":{
      "instructionCode":"1111nnnnmmmm0001",
      "text":"FSUB FRm,FRn ",
      "description":"FRn – FRm → FRn "
   },
   "description":"FRn – FRm → FRn "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"f03d",
   "text":"FTRC FRm,FPUL ",
   "spec":{
      "instructionCode":"1111mmmm00111101",
      "text":"FTRC FRm,FPUL ",
      "description":"(long) FRm → FPUL "
   },
   "description":"(long) FRm → FPUL "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"406a",
   "text":"LDS Rm,FPSCR ",
   "spec":{
      "instructionCode":"0100mmmm01101010",
      "text":"LDS Rm,FPSCR ",
      "description":"Rm → FPSCR "
   },
   "description":"Rm → FPSCR "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"405a",
   "text":"LDS Rm,FPUL ",
   "spec":{
      "instructionCode":"0100mmmm01011010",
      "text":"LDS Rm,FPUL ",
      "description":"Rm → FPUL "
   },
   "description":"Rm → FPUL "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4066",
   "text":"LDS.L @Rm+, FPSCR ",
   "spec":{
      "instructionCode":"0100mmmm01100110",
      "text":"LDS.L @Rm+, FPSCR ",
      "description":"@Rm → FPSCR, Rm+ = 4 "
   },
   "description":"@Rm → FPSCR, Rm+ = 4 "
},
{
   "masks":{
      "i":"0",
      "n":"0",
      "m":"f00",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4056",
   "text":"LDS.L @Rm+, FPUL ",
   "spec":{
      "instructionCode":"0100mmmm01010110",
      "text":"LDS.L @Rm+, FPUL ",
      "description":"@Rm → FPUL, Rm+ = 4 "
   },
   "description":"@Rm → FPUL, Rm+ = 4 "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"6a",
   "text":"STS FPSCR, Rn ",
   "spec":{
      "instructionCode":"0000nnnn01101010",
      "text":"STS FPSCR, Rn ",
      "description":"FPSCR → Rn "
   },
   "description":"FPSCR → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"5a",
   "text":"STS FPUL,Rn ",
   "spec":{
      "instructionCode":"0000nnnn01011010",
      "text":"STS FPUL,Rn ",
      "description":"FPUL → Rn "
   },
   "description":"FPUL → Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4062",
   "text":"STS.L FPSCR,@-Rn ",
   "spec":{
      "instructionCode":"0100nnnn01100010",
      "text":"STS.L FPSCR,@-Rn ",
      "description":"Rn– = 4, FPSCR → @Rn "
   },
   "description":"Rn– = 4, FPSCR → @Rn "
},
{
   "masks":{
      "i":"0",
      "n":"f00",
      "m":"0",
      "d":"0"
   },
   "instructionCodeMask":"f0ff",
   "instructionCode":"4052",
   "text":"STS.L FPUL,@-Rn ",
   "spec":{
      "instructionCode":"0100nnnn01010010",
      "text":"STS.L FPUL,@-Rn ",
      "description":"Rn– = 4, FPUL → @Rn"
   },
   "description":"Rn– = 4, FPUL → @Rn"
}
]