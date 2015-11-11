var fpu = {
   /* NORM: "NORM",
    PZERO: "PZERO",
    NZERO: "NZERO",
    PINF: "PINF",
    NINF: "NINF",
    qNaN: "qNaN",
    sNaN: "sNaN",
    EQ: "EQ",
    GT: "GT",
    NOTGT: "NOTGT",
    UO: "UO",
    INVALID: "INVALID",*/
    
    NORM: 1,
    PZERO: 2,
    NZERO: 3,
    PINF: 4,
    NINF: 5,
    qNaN: 6,
    sNaN: 7,
    EQ: 8,
    GT: 9,
    NOTGT: 10,
    UO: 11,
    INVALID: 12,

    CAUSE_V: 0x10000,
    CAUSE_Z: 0x08000,
    FLAG_V: 0x00040,
    FLAG_Z: 0x00020,
    ENABLE_V: 0x00800,


    N_INT_RANGE: 0xCF000000,
    /* 01.000000 * 2^16 */
    P_INT_RANGE: 0x47FFFFFF, /* 1.fffffe * 2^30 */
    FPSCR_MASK: 0x00018C60
};

fpu.ClearCauseVZ = function() {
    cpu.SetFPSCR(cpu.GetFPSCR() & (~fpu.CAUSE_V & ~fpu.CAUSE_Z));
};

fpu.SetV = function() {
    cpu.SetFPSCR(cpu.GetFPSCR() | (fpu.CAUSE_V | fpu.FLAG_V));
};

fpu.SetZ = function() {
    cpu.SetFPSCR(cpu.GetFPSCR() | (fpu.CAUSE_Z | fpu.FLAG_Z));
};

fpu.FRsign = function(n) {
    //AssertRegisterValidRegisterValid(n);
    //return cpu.GetFR(n) >>> 31;
    return simulator.registers.fr[n] >>> 31;
};

fpu.FRsignValue = function(v) {
    //AssertRegisterValidRegisterValid(n);
    //return cpu.GetFR(n) >>> 31;
    return v >>> 31;
};

fpu.Sign = function(n) {
    //AssertRegisterValidRegisterValid(n);
    return n >>> 31;
};


fpu.FRzero = function(n, sign) {
    //AssertRegisterValidRegisterValid(n);
    if (sign === 0) cpu.SetFR(n, 0x00000000);
    else cpu.SetFR(n, 0x80000000);
};

fpu.FRinf = function(n, sign) {
    //AssertRegisterValidRegisterValid(n);
    if (sign === 0) cpu.SetFR(n, 0x7f800000);
    else cpu.SetFR(n, 0xff800000);
};

fpu.FRqNaN = function(n) {
    //AssertRegisterValidRegisterValid(n);
    cpu.SetFR(n, 0x7fbfffff);
};

fpu.FRinvalid = function(n) {
    //AssertRegisterValidRegisterValid(n);
    fpu.SetV();
    if ((cpu.GetFPSCR() & fpu.ENABLE_V) === 0) {
        fpu.FRqNaN(n);
    }
};

fpu.FRdz = function(n, sign) {
    //AssertRegisterValidRegisterValid(n);
    fpu.SetZ();
    if ((cpu.GetFPSCR() & fpu.ENABLE_V) === 0) {
        fpu.FRinf(n, sign);
    }
};

fpu.FtrcTypeOf = function(n) {
    //AssertRegisterValidRegisterValid(n);
    var abs;
    abs = n & 0x7FFFFFF;
    if (fpu.FRsign(n) === 0) {
        if (abs > 0x7F800000) return (fpu.NINF); /* NaN*/
        else if (abs > fpu.P_INT_RANGE) return (fpu.PINF); /* out of range,+INF */
        else return (fpu.NORM); /* +0,+fpu.NORM */
    } else {
        if (n > fpu.N_INT_RANGE) return (fpu.NINF); /* out of range ,+INF,NaN*/
        else return (fpu.NORM); /* -0,-fpu.NORM*/
    }
};


fpu.FtrcInvalid = function(sign) {
    fpu.SetV();
    if ((cpu.GetFPSCR() & fpu.ENABLE_V) === 0) {
        if (sign === 0) cpu.SetFPUL(0x7FFFFFFF);
        else cpu.SetFPUL(0x80000000);
    }
};

fpu.FRDataType = function(n) {
    //AssertRegisterValidRegisterValid(n);
    var abs;
    abs = cpu.GetFR(n) & 0x7fffffff;
    if (abs < (0x00800000)) {
        if (fpu.FRsign(n) === 0) return (fpu.PZERO);
        else return (fpu.NZERO);
    } else if (((0x00800000) <= abs) && (abs < (0x7f800000)))
        return (fpu.NORM);
    else if ((0x7f800000) == abs) {
        if (fpu.FRsign(n) === 0) return (fpu.PINF);
        else return (fpu.NINF);
    } else if (0x00400000 & abs) return (fpu.sNaN);
    else return (fpu.qNaN);
};

fpu.FRDataTypeValue = function(v) {
    //AssertRegisterValidRegisterValid(n);
    var abs;
    abs = v & 0x7fffffff;
    if (abs < (0x00800000)) {
        if (fpu.FRsignValue(v) === 0) return (fpu.PZERO);
        else return (fpu.NZERO);
    } else if (((0x00800000) <= abs) && (abs < (0x7f800000)))
        return (fpu.NORM);
    else if ((0x7f800000) == abs) {
        if (fpu.FRsignValue(v) === 0) return (fpu.PINF);
        else return (fpu.NINF);
    } else if (0x00400000 & abs) return (fpu.sNaN);
    else return (fpu.qNaN);
};

fpu.FcmpChk = function(instruction) {
    var m = cpu.GetFR(instruction.m);
    var n = cpu.GetFR(instruction.n);
    var m_dt = fpu.FRDataTypeValue(m);
    var n_dt = fpu.FRDataTypeValue(n);
    
    if ((m_dt == fpu.sNaN) ||
        (n_dt == fpu.sNaN)) return (fpu.INVALID);
    else if ((m_dt == fpu.qNaN) ||
        (n_dt == fpu.qNaN)) return (fpu.UO);

    else switch (m_dt) {
        case fpu.NORM:
            switch (n_dt) {
                case fpu.PINF:
                    return (fpu.GT);
                case fpu.NINF:
                    return (fpu.NOTGT);
                default:
                    break;
            }
            break;
        case fpu.PZERO:
        case fpu.NZERO:
            switch (n_dt) {
                case fpu.PZERO:
                case fpu.NZERO:
                    return (fpu.EQ);
                case fpu.PINF:
                    return (fpu.GT);
                case fpu.NINF:
                    return (fpu.NOTGT);
                default:
                    break;
            }
            break;
        case fpu.PINF:
            switch (n_dt) {
                case fpu.PINF:
                    return (fpu.EQ);
                default:
                    return (fpu.NOTGT);
            }
            break;
        case fpu.NINF:
            switch (n_dt) {
                case fpu.NINF:
                    return (fpu.EQ);
                default:
                    return (fpu.GT);
            }
            break;
    }
    if (n == m) return (fpu.EQ);
    else if (cpu.GetFRFloat32(instruction.n) > cpu.GetFRFloat32(instruction.m)) return (fpu.GT);
    else return (fpu.NOTGT);
};

fpu.FcmpInvalid = function(cmp_flag) {
    fpu.SetV();
    if ((cpu.GetFPSCR() & fpu.ENABLE_V) === 0) cpu.SetT(cmp_flag);
};


fpu.FABS = function(instruction) {
    fpu.ClearCauseVZ();
    var n = cpu.GetFR(instruction.n);
    var n_dt = fpu.FRDataTypeValue(n);
    
    switch (n_dt) {
        case fpu.NORM:
            if (fpu.FRsign(instruction.n) === 0) cpu.SetFR(instruction.n, cpu.GetFR(instruction.n));
            else cpu.SetFRFloat32(instruction.n, -1.0 * cpu.GetFRFloat32(instruction.n));
            break;
        case fpu.PZERO:
        case fpu.NZERO:
            fpu.FRzero(instruction.n, 0);
            break;
        case fpu.PINF:
        case fpu.NINF:
            fpu.FRinf(instruction.n, 0);
            break;
        case fpu.qnan:
            fpu.FRqnan(instruction.n);
            break;
        case fpu.sNan:
            fpu.FRinvalid(instruction.n);
            break;
    }
};

fpu.AddFrFm = function(n, m) {
    cpu.SetFRFloat32(n, cpu.GetFRFloat32(n) + cpu.GetFRFloat32(m));
};

fpu.SubFrFm = function(n, m) {
    cpu.SetFRFloat32(n, cpu.GetFRFloat32(n) - cpu.GetFRFloat32(m));
};

fpu.MulFrFm = function(n, m) {
    cpu.SetFRFloat32(n, cpu.GetFRFloat32(n) * cpu.GetFRFloat32(m));
};

fpu.DivFrFm = function(n, m) {
    cpu.SetFRFloat32(n, cpu.GetFRFloat32(n) / cpu.GetFRFloat32(m));
};

fpu.FADD = function(instruction) /* FADD FRm,FRn */ {
    fpu.ClearCauseVZ();
    var m = cpu.GetFR(instruction.m);
    var n = cpu.GetFR(instruction.n);
    var m_dt = fpu.FRDataTypeValue(m);
    var n_dt = fpu.FRDataTypeValue(n);
    
    if ((m_dt == fpu.sNaN) ||
        (n_dt == fpu.sNaN)) fpu.FRinvalid(instruction.n);
    else if ((m_dt == fpu.qNaN) ||
        (n_dt == fpu.qNaN)) fpu.FRqNaN(instruction.n);
    else switch (m_dt) {
        case fpu.NORM:
            switch (n_dt) {
                case fpu.PINF:
                    fpu.FRinf(instruction.n, 0);
                    break;
                case fpu.NINF:
                    fpu.FRinf(instruction.n, 1);
                    break;
                default:
                    fpu.AddFrFm(instruction.n, instruction.m);
                    break;
            }
            break;
        case fpu.PZERO:
            switch (n_dt) {
                case fpu.NORM:
                    fpu.AddFrFm(instruction.n, instruction.m);
                    break;
                case fpu.PZERO:
                case fpu.NZERO:
                    fpu.FRzero(instruction.n, 0);
                    break;
                case fpu.PINF:
                    fpu.FRinf(instruction.n, 0);
                    break;
                case fpu.NINF:
                    fpu.FRinf(instruction.n, 1);
                    break;
            }
            break;
        case fpu.NZERO:
            switch (n_dt) {
                case fpu.NORM:
                    fpu.AddFrFm(instruction.n, instruction.m);
                    break;
                case fpu.PZERO:
                    fpu.FRzero(instruction.n, 0);
                    break;
                case fpu.NZERO:
                    fpu.FRzero(instruction.n, 1);
                    break;
                case fpu.PINF:
                    fpu.FRinf(instruction.n, 0);
                    break;

                case fpu.NINF:
                    fpu.FRinf(instruction.n, 1);
                    break;
            }
            break;
        case fpu.PINF:
            switch (n_dt) {
                case fpu.NINF:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRinf(instruction.n, 0);
                    break;
            }
            break;
        case fpu.NINF:
            switch (n_dt) {
                case fpu.PINF:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRinf(instruction.n, 1);
                    break;
            }
            break;
    }
};

fpu.FCMP_EQ = function(instruction) /* FCMP/fpu.EQ FRm,FRn */ {
    fpu.ClearCauseVZ();
    var chk = fpu.FcmpChk(instruction);
    if (chk == fpu.INVALID) {
        fpu.FcmpInvalid(0);
    } else if (chk == fpu.EQ) cpu.SetT(1);
    else cpu.SetT(0);
};


fpu.FCMP_GT = function(instruction) /* FCMP/fpu.GT FRm,FRn */ {
    fpu.ClearCauseVZ();
    var chk = fpu.FcmpChk(instruction);
    if (chk == fpu.INVALID || chk == fpu.UO) {
        fpu.FcmpInvalid(0);
    } else if (chk == fpu.GT) cpu.SetT(1);
    else cpu.SetT(0);
};

fpu.FDIV = function(instruction) /* FDIV FRm,FRn */ {
    fpu.ClearCauseVZ();
    //fpu.DivFrFm(instruction.n, instruction.m);
    
    var m = cpu.GetFR(instruction.m);
    var n = cpu.GetFR(instruction.n);
    var m_dt = fpu.FRDataTypeValue(m);
    var n_dt = fpu.FRDataTypeValue(n);
    
    if ((m_dt == fpu.sNaN) ||
        (n_dt == fpu.sNaN)) fpu.FRinvalid(instruction.n);
    else if ((m_dt == fpu.qNaN) ||
        (n_dt == fpu.qNaN)) fpu.FRqNaN(instruction.n);
    else switch (m_dt) {
        case fpu.NORM:
            switch (n_dt) {
                case fpu.PINF:
                case fpu.NINF:
                    fpu.FRinf(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
                default:
                    fpu.DivFrFm(instruction.n, instruction.m);
                    break;
            }
            break;
        case fpu.PZERO:
        case fpu.NZERO:
            switch (n_dt) {
                case fpu.PZERO:
                case fpu.NZERO:
                    fpu.FRinvalid(instruction.n);
                    break;
                case fpu.PINF:
                case fpu.NINF:
                    fpu.FRinf(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
                default:
                    fpu.FRdz(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
            }
            break;
        case fpu.PINF:
        case fpu.NINF:
            switch (n_dt) {
                case fpu.PINF:
                case fpu.NINF:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRzero(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
            }
    }
};


fpu.FLDI0 = function(instruction) /* FLDI0 FRn */ {
    cpu.SetFR(instruction.n, 0x00000000);
};

fpu.FLDI1 = function(instruction) /* FLDI1 FRn */ {
    cpu.SetFR(instruction.n, 0x3F800000);
};

fpu.FLDS = function(instruction) /* FLDS FRm,FPUL */ {
    var result = (cpu.GetFR(instruction.m));
    cpu.SetFPUL(result);
};

fpu.FLOAT = function(instruction) /* FLOAT FRn */ {
    fpu.ClearCauseVZ();
    cpu.SetFRFloat32(instruction.n, ToSigned(cpu.GetFPUL()));
};

fpu.FMAC = function(instruction) /* FMAC FR0,FRm,FRn */ {
    var tmp_FPSCR;
    var tmp_FRm = cpu.GetFR(instruction.m);
    fpu.FMUL({
        m: 0,
        n: instruction.m
    });
    tmp_FPSCR = cpu.GetFPSCR(); /* save cause field for FR0*FRm */
    fpu.FADD(instruction);
    cpu.SetFR(instruction.m, tmp_FRm);
    cpu.SetFPSCR(cpu.GetFPSCR() | tmp_FPSCR); /* reflect cause field for F0*FRm */
};

fpu.FMUL = function(instruction) /* FMUL FRm,FRn */ {
    fpu.ClearCauseVZ();
    var m = cpu.GetFR(instruction.m);
    var n = cpu.GetFR(instruction.n);
    var m_dt = fpu.FRDataTypeValue(m);
    var n_dt = fpu.FRDataTypeValue(n);
    
    if ((m_dt == fpu.sNaN) ||
        (n_dt == fpu.sNaN)) fpu.FRinvalid(instruction.n);
    else if ((m_dt == fpu.qNaN) ||
        (n_dt == fpu.qNaN)) fpu.FRqNaN(instruction.n);
    else switch (m_dt) {
        case fpu.NORM:
            switch (n_dt) {
                case fpu.PINF:
                case fpu.NINF:
                    fpu.FRinf(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
                default:
                    fpu.MulFrFm(instruction.n, instruction.m);
                    break;
            }
            break;
        case fpu.PZERO:
        case fpu.NZERO:
            switch (n_dt) {
                case fpu.PINF:
                case fpu.NINF:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRzero(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
            }
            break;
        case fpu.PINF:
        case fpu.NINF:
            switch (n_dt) {
                case fpu.PZERO:
                case fpu.NZERO:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRinf(instruction.n, fpu.FRsign(instruction.m) ^ fpu.FRsign(instruction.n));
                    break;
            }
            break;
    }
};

fpu.FNEG = function(instruction) /* FNEG FRn */ {
    fpu.ClearCauseVZ();
    var n = cpu.GetFR(instruction.n);
    var n_dt = fpu.FRDataTypeValue(n);
    
    switch (n_dt) {
        case fpu.qNaN:
            fpu.FRqNaN(instruction.n);
            break;
        case fpu.sNaN:
            fpu.FRinvalid(instruction.n);
            break;
        default:
            cpu.SetFRFloat32(instruction.n, -1.0 * cpu.GetFRFloat32(instruction.n));
            break;
    }
};

fpu.FSTS = function(instruction) /* FSTS FPUL,FRn */ {
    var result = (cpu.GetFPUL());
    cpu.SetFR(instruction.n, result);
};


fpu.FSUB = function(instruction) /* FSUB FRm,FRn */ {
    fpu.ClearCauseVZ();
    var m = cpu.GetFR(instruction.m);
    var n = cpu.GetFR(instruction.n);
    var m_dt = fpu.FRDataTypeValue(m);
    var n_dt = fpu.FRDataTypeValue(n);
    
    if ((m_dt == fpu.sNaN) ||
        (n_dt == fpu.sNaN)) fpu.FRinvalid(instruction.n);
    else if ((m_dt == fpu.qNaN) ||
        (n_dt == fpu.qNaN)) fpu.FRqNaN(instruction.n);
    else switch (m_dt) {
        case fpu.NORM:
            switch (n_dt) {
                case fpu.PINF:
                    fpu.FRinf(instruction.n, 0);
                    break;
                case fpu.NINF:
                    fpu.FRinf(instruction.n, 1);
                    break;
                default:
                    fpu.SubFrFm(instruction.n, instruction.m);
                    break;
            }
            break;
        case fpu.PZERO:
            switch (n_dt) {
                case fpu.NORM:
                    fpu.SubFrFm(instruction.n, instruction.m);
                    break;
                case fpu.PZERO:
                    fpu.FRzero(instruction.n, 0);
                    break;
                case fpu.NZERO:
                    fpu.FRzero(instruction.n, 1);
                    break;
                case fpu.PINF:
                    fpu.FRinf(instruction.n, 0);
                    break;
                case fpu.NINF:
                    fpu.FRinf(instruction.n, 1);
                    break;
            }
            break;
        case fpu.NZERO:
            switch (n_dt) {
                case fpu.NORM:
                    fpu.SubFrFm(instruction.n, instruction.m);
                    break;
                case fpu.PZERO:
                case fpu.NZERO:
                    fpu.FRzero(instruction.n, 0);
                    break;
                case fpu.PINF:
                    fpu.FRinf(instruction.n, 0);
                    break;
                case fpu.NINF:
                    fpu.FRinf(instruction.n, 1);
                    break;
            }
            break;
        case fpu.PINF:
            switch (n_dt) {
                case fpu.NINF:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRinf(instruction.n, 1);
                    break;
            }
            break;
        case fpu.NINF:
            switch (n_dt) {
                case fpu.PINF:
                    fpu.FRinvalid(instruction.n);
                    break;
                default:
                    fpu.FRinf(instruction.n, 0);
                    break;
            }
            break;
    }
};

fpu.FTRC = function(instruction) /* FTRC FRm,FPUL */ {
    fpu.ClearCauseVZ();
    switch (fpu.FtrcTypeOf(instruction.m)) {
        case fpu.NORM:
            cpu.SetFPUL(parseInt(cpu.GetFRFloat32(instruction.m), 10));
            break;
        case fpu.PINF:
            fpu.FtrcInvalid(0);
            break;
        case fpu.NINF:
            fpu.FtrcInvalid(1);
            break;
    }
};

fpu.LDS = function(m) /* LDS Rm,FPSCR */
{
    cpu.SetFPSCR(cpu.GetR(m) & fpu.FPSCR_MASK);
};

fpu.LDS_RESTORE = function(m) /* LDS.L @Rm+,FPSCR */
{
    var result = (cpu.Read32(cpu.GetR(m)));
    cpu.SetFPSCR(result & fpu.FPSCR_MASK);
    cpu.SetR(m, cpu.GetR(m) + 4);
};