/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function Elf32(buffer, relocatable) {
    this.buffer = buffer;
    this.view = new DataView(this.buffer);
    this.ExtractHeader();
    this.ExtractSectionHeaders();
    this.ExtractSectionSymbols();
    this.ExtractProgramHeaders();
    this.ExtractSymbolTable();
    this.ExtractDynSymbolTable();
    this.imageSize = this.ImageSize(relocatable);
    if (relocatable === undefined) {
        this.image = this.CreateImage();
    }
}


Elf32.prototype.OldRelocate = function(targetAddress) {
    
    for (var i = 0, len = this.sheaders.length; i < len; ++i) {
        var h = this.sheaders[i];
        if (h.type === 4) {//SHT_RELA
            for (var a = h.offset; a < h.offset+h.size;) {
                var offset = this.view.getUint32(a, false);
                a+=4;
                var info = this.view.getUint32(a, false);
                a+=4;
                var value = this.view.getUint32(a, false);
                a+=4;
                this.view.setUint32(offset, value+targetAddress, false);   
            }
        }
    }
    this.entry += targetAddress;
    this.image = this.CreateImage(true);
    this.Load(targetAddress);
};

Elf32.prototype.Relocate = function(targetAddress) {
    
    this.entry += targetAddress;
    this.image = this.CreateImage(true);
    

    var romView = new DataView(this.image);
    
    for (var i = 0, len = this.sheaders.length; i < len; ++i) {
        var h = this.sheaders[i];
        if (h.type === 4) {//SHT_RELA
            for (var a = h.offset; a < h.offset+h.size;) {
                var offset = this.view.getUint32(a, false);
                a+=4;
                var info = this.view.getUint32(a, false);
                a+=4;
                var value = this.view.getUint32(a, false);
                a+=4;
                if ((info & 0xFF) == 0xA5) { //R_SH_RELATIVE
                    romView.setUint32(offset, value+targetAddress, false);   
                } else if ((info & 0xFF) == 1) { // R_SH_DIR32
                    var dynSymIndex = info >> 8;
                    romView.setUint32(offset, this.dynSymbols[dynSymIndex].st_value+value+targetAddress, false);   
                }
            }
        }
    }
    
    this.Load(targetAddress);
    
    //console.log("[%cELF%c] BaseAddress - " + ToHex(targetAddress), 'color: blue', 'color: black');
    //console.log("[%cELF%c] EntryAddress - " + ToHex(this.entry), 'color: blue', 'color: black');
    
};

Elf32.prototype.ExtractHeader = function() {
    var header = new DataView(this.buffer.slice(16));
    this.type = header.getUint16(0, false);
    this.machine = header.getUint16(2, false);
    this.version = header.getUint32(4, false);
    this.entry = header.getUint32(8, false);
    this.phoff = header.getUint32(12, false);
    this.shoff = header.getUint32(16, false);
    this.flags = header.getUint32(20, false);
    this.ehsize = header.getUint16(24, false);
    this.phentsize = header.getUint16(26, false);
    this.phnum = header.getUint16(28, false);
    this.shentsize = header.getUint16(30, false);
    this.shnum = header.getUint16(32, false);
    this.shstrndx = header.getUint16(34, false);
    this.pheaders = [];
    this.sheaders = [];

};

Elf32.prototype.ExtractSectionHeaders = function() {
    for (var i = 0; i < this.shnum; i++) {

        var startAddress = this.shoff + (i * this.shentsize);
        var entry = new DataView(this.buffer.slice(startAddress, startAddress + this.shentsize));

        var sh = {};
        sh.namendx = entry.getUint32(0);
        sh.type = entry.getUint32(4);
        sh.flags = entry.getUint32(8);
        sh.addr = entry.getUint32(12);
        sh.offset = entry.getUint32(16);
        sh.size = entry.getUint32(20);
        sh.link = entry.getUint32(24);
        sh.info = entry.getUint32(28);
        sh.addralign = entry.getUint32(32);
        sh.entsize = entry.getUint32(36);
        this.sheaders.push(sh);
    }
};

Elf32.prototype.ExtractSectionSymbols = function() {
    var section = this.sheaders[this.shstrndx];
    var buffer = this.buffer.slice(section.offset, section.offset + section.size);
    var view = new DataView(buffer);

    for (var i = 0, len = this.sheaders.length; i < len; ++i) {
        var sh = this.sheaders[i], start = sh.namendx, end = sh.namendx;

        if (sh.namendx !== 0) {
            while (view.getUint8(end, false) !== 0) {
                ++end;
            }
            sh.name = String.fromCharCode.apply(null, new Uint8Array(buffer.slice(start, end)));
        }
    }
};


Elf32.prototype.ExtractProgramHeaders = function() {
    for (var i = 0; i < this.phnum; i++) {
        var startAddress = this.phoff + (this.phentsize * i);

        var entry = new DataView(this.buffer.slice(startAddress, startAddress + this.shentsize));

        var ph = {};
        this.pheaders.push(ph);
        ph.type = entry.getUint32(0);
        ph.offset = entry.getUint32(4);
        ph.vaddr = entry.getUint32(8);
        ph.paddr = entry.getUint32(12);
        ph.filesz = entry.getUint32(16);
        ph.memsz = entry.getUint32(20);
        ph.flags = entry.getUint32(24);
        ph.align = entry.getUint32(28);
    }
};


Elf32.prototype.ExtractSymbolText = function(str, sectionndx, index) {
    var section = this.sheaders[sectionndx];
    var end = section.offset+index;
    while (str.getUint8(end, false) !== 0) {
        ++end;
    }
    
    return  String.fromCharCode.apply(null, new Uint8Array(this.buffer.slice(section.offset+index, end)));
};

Elf32.prototype.ExtractSymbolTable = function() {
    var dataView = new DataView(this.buffer);
    
    this.symbols = [];
    
    for (var s = 0; s < this.sheaders.length; s++) {
        var section = this.sheaders[s];
        if (section.type === 2) {
            
            for (var i = 0; i < (section.size/section.entsize); i++) {
                var startAddress = section.offset+(i*section.entsize);
                var buffer = this.buffer.slice(startAddress,startAddress+section.entsize);
                var entry = new DataView(buffer);
                var symbol = {};
                symbol.st_name = entry.getUint32(0);
                symbol.st_value = entry.getUint32(4);
                symbol.st_size = entry.getUint32(8);
                symbol.st_info = entry.getUint8(12);
                symbol.st_other = entry.getUint8(13);
                symbol.st_shndx = entry.getUint16(14);
                symbol.name = this.ExtractSymbolText(dataView, section.link, symbol.st_name);
                this.symbols.push(symbol);
            }
        }
    }
};

Elf32.prototype.ExtractDynSymbolTable = function() {
    var dataView = new DataView(this.buffer);
    
    this.dynSymbols = [];
    
    for (var s = 0; s < this.sheaders.length; s++) {
        var section = this.sheaders[s];
        if (section.type === 11) {
            
            for (var i = 0; i < (section.size/section.entsize); i++) {
                var startAddress = section.offset+(i*section.entsize);
                var buffer = this.buffer.slice(startAddress,startAddress+section.entsize);
                var entry = new DataView(buffer);
                var symbol = {};
                symbol.st_name = entry.getUint32(0);
                symbol.st_value = entry.getUint32(4);
                symbol.st_size = entry.getUint32(8);
                symbol.st_info = entry.getUint8(12);
                symbol.st_other = entry.getUint8(13);
                symbol.st_shndx = entry.getUint16(14);
                symbol.name = this.ExtractSymbolText(dataView, section.link, symbol.st_name);
                this.dynSymbols.push(symbol);
            }
        }
    }
};

Elf32.prototype.ImageSize = function(loadBSS) {
    var endAddress = 0;
    _.each(this.pheaders, function(p) { 
        var address = p.paddr;
        if (loadBSS !== undefined) {
               address += p.memsz;
        } else {
            address += p.filesz;
        }
        if (address > endAddress) {
            endAddress = address;
        }
    });
    
    
    return ((endAddress >>> 2) << 2)+4;
};

Elf32.prototype.CreateImage = function(loadBSS) {
    var _this = this, c;
    var startAddress = 0;
    var endAddress = 0;
    _.each(this.pheaders, function(p) { 
        var address = p.paddr;
        if (loadBSS !== undefined) {
               address += p.memsz;
        } else {
            address += p.filesz;
        }
        if (address > endAddress) {
            endAddress = address;
        }
    });
    
    
    endAddress = ((endAddress >>> 2) << 2)+4;
    
    var buffer = new ArrayBuffer(endAddress);
    var romView = new DataView(buffer);
    
    _.each(this.pheaders, function(p) { 
        if (p.type == 1) { //PT_LOAD
            for (var i = 0; i < p.filesz; i++) {
                c = _this.view.getUint8(p.offset+i, false);
                romView.setUint8(p.paddr+i, c, false);
            }
            
            if (_this.loadBSS) {
                for (; i < p.memsz; i++) {
                    romView.setUint8(p.paddr+i, 0, false);
                }   
            }
        }
    });
    
    return buffer;
};

Elf32.prototype.Load = function(targetAddress)
{
    var checking = kernel.Checking();
    if (checking) {
        kernel.CheckRam(0)
    }
    var view = new DataView(this.image);
    for (var i = 0; i < this.image.byteLength; i+=4) {
        cpu.Write32(targetAddress+i, view.getUint32(i, false));
    }

    //for (var i = 0; i < this.image.byteLength; i+=2) {
    //   cpu.ExecWrite16(targetAddress+i, view.getUint16(i, false));
    //}
    
    if (checking) {
        kernel.CheckRam(1);
    }
};
