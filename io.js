/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var kernel = {
    init: function(ramcheck) {
    	if (typeof(this.threadMax) !== "undefined") {
    		return;
    	}
        this.threadMax = 5;
        this.threadMaxSymbol = this.GetElfSymbol("_kernel_threadMax");
        if (this.threadMaxSymbol !== undefined) {
            this.threadMax = cpu.ReadRam32(this.threadMaxSymbol.st_value);
        }
        this.threadTable = this.GetThreadTable();
        this.currentThreadAddress = this.GetElfSymbol("_currentThread").st_value;
        this.stack = {};
       
        simulator.instructionProcessors[107] = this.instruction1011dddddddddddd;
	simulator.instructionProcessors[108] = this.instruction0000mmmm00000011;
        simulator.instructionProcessors[110] = this.instruction0100mmmm00001011;
        simulator.instructionProcessors[111] = this.instruction0000000000001011;
        
        this.save = {};
        this.save.ReadRam32 = cpu.ReadRam32;
        this.save.ReadRam16 = cpu.ReadRam16;
        this.save.ReadRam8 = cpu.ReadRam8;
        this.save.WriteRam32 = cpu.WriteRam32; 
        this.save.WriteRam16 = cpu.WriteRam16; 
        this.save.WriteRam8 = cpu.WriteRam8; 
        
        this.CheckRam(typeof(ramcheck) != "undefined");
    }, 
    
    CheckRam : function(on) {
    	if (on) {
	    	cpu.ReadRam32 = this.CheckReadRam32;
		cpu.ReadRam16 = this.CheckReadRam16;
		cpu.ReadRam8 = this.CheckReadRam8;
		cpu.WriteRam32 = this.CheckWriteRam32;
		cpu.WriteRam16 = this.CheckWriteRam16;
		cpu.WriteRam8 = this.CheckWriteRam8;
    	} else {
    		cpu.ReadRam32 = this.save.ReadRam32;
		cpu.ReadRam16 = this.save.ReadRam16;
		cpu.ReadRam8 = this.save.ReadRam8;
		cpu.WriteRam32 = this.save.WriteRam32;
		cpu.WriteRam16 = this.save.WriteRam16;
		cpu.WriteRam8 = this.save.WriteRam8;
    	}
    	this.checkRam = on;
    },
    
    Checking : function() {
    	return this.checkRam;
    },
    
    ValidateWrite: function(address, data) {
    	var currentPid = kernel.CurrentPid();
        
        if (currentPid != 0 && currentPid != 1) {
            var pid, startAddress, length;
            var allocation = kernel.FindAllocation(address);
            if (allocation != undefined) {
            	pid = allocation.pid;
            	startAddress = allocation.address;
            	length = allocation.length;
            }
            if (pid != 0 && pid != 1 && pid != undefined && pid != currentPid && !kernel.IsImageAddress(currentPid, address) && !kernel.IsArgvAddress(currentPid, address)) {
                console.log("[%c" + ToHex(simulator.address) + "%c] Bad Write: currentPid:" + currentPid + " -> address:" + ToHex(address) + " ownerPid: " + pid + " alloc start: " + FullHex(startAddress) + " (" + length + ") bytes", 'color: blue', 'color: black');
                kernel.DumpStack()
            }
        }
    }, 
    
    ValidateRead: function(address) {
    	var currentPid = kernel.CurrentPid();
        
        if (currentPid != 0 && currentPid != 1) {
            var pid, startAddress, length;
            var allocation = kernel.FindAllocation(address);
            if (allocation != undefined) {
            	pid = allocation.pid;
            	startAddress = allocation.address;
            	length = allocation.length;
            }
            if (pid != 0 && pid != 1 && pid != undefined && pid != currentPid && !kernel.IsImageAddress(currentPid, address) && !kernel.IsArgvAddress(currentPid, address)) {
                console.log("[%c" + ToHex(simulator.address) + "%c] Bad read: currentPid:" + currentPid + " -> address:" + ToHex(address) + " ownerPid: " + pid + " str: " + kernel.ReadRamString(address) + " alloc start: " + FullHex(startAddress) + " (" + length + ") bytes", 'color: blue', 'color: black');
                kernel.DumpStack()
            }
        }
    },
    
    CheckReadRam32 : function(address) {
        kernel.ValidateRead(address);
        return simulator.ram[(address - cpu.ramStart) >>> 2];
    },
    
    CheckReadRam16 : function(address, bitLength) {
	kernel.ValidateRead(address);
	var alignedAddress = ((address >>> 0) & 0xFFFFFFFC) >>> 0;
	
	var offset = address - alignedAddress;
	var data = simulator.ram[(alignedAddress - cpu.ramStart) >>> 2];
	
	if (offset === 0) {
	return data >>> 16;
	} else {
	return data & 0xFFFF;
	}
    },

    CheckReadRam8 : function(address) {
    	kernel.ValidateRead(address);
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
    },
    
    CheckWriteRam32 : function(address, data) {
    	kernel.ValidateWrite(address, data);
    	simulator.ram[(address - cpu.ramStart) >>> 2] = data;
    },
    
    
    CheckWriteRam16 : function(address, data) {
    	kernel.ValidateWrite(address, data);
	var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
	var existingData = simulator.ram[(alignedAddress - cpu.ramStart) >>> 2];
	var offset = address - alignedAddress;
	var existing = ____dv;
	existing.setUint32(0, existingData, false);
	existing.setUint16(offset, data, false);
	simulator.ram[(alignedAddress - cpu.ramStart) >>> 2] = existing.getUint32(0, false);
	return;
    },


    CheckWriteRam8 : function(address, data) {
    	kernel.ValidateWrite(address, data);
	var alignedAddress = (((address >>> 0) >>> 2) << 2) >>> 0;
	var index = (alignedAddress - cpu.ramStart) >>> 2;
	var existingData = simulator.ram[index];
	var offset = address - alignedAddress;
	var existing = ____dv;
	existing.setUint32(0, existingData, false);
	existing.setUint8(offset, data, false);
	simulator.ram[index] = existing.getUint32(0, false);
    },

    ReadRam32: function(address) {
         return simulator.ram[(address- cpu.ramStart) >>> 2]
    },
    
    ReadRam8 : function(address) {
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
    },
    
    Read: function(index, offset) {
        return kernel.ReadRam32((index*(kernel.threadTable.st_size/kernel.threadMax))+kernel.threadTable.st_value+(offset*4))
    },
    
    Address: function(index, offset) {
       return (index*(kernel.threadTable.st_size/kernel.threadMax))+kernel.threadTable.st_value+(offset*4);
   },
   
   ReadRamString: function(address)
    {
        var baseAddress = address;
        var data = "", c;
        
        for (; c !== 0 && (address-baseAddress) < 1024; address++) {
            c = kernel.ReadRam8(address);
            if (c !== 0) {
                data += String.fromCharCode(c);
            }
        }
        return data;
    },

    CurrentPid : function()
    {
        return kernel.Read(kernel.ReadRam32(this.currentThreadAddress), 0);
    },
    
    PidState : function(pid)
    {
    	for (var i = 0; i < kernel.threadMax; i++) {
    	    if (kernel.Read(i, 0) == pid) {
    		return kernel.Read(i, 1);	
    	    }
    	}
    	
    	return 0;
    },
    
    PidArgv : function(pid)
    {
    	for (var i = 0; i < kernel.threadMax; i++) {
    	    if (kernel.Read(i, 0) == pid) {
        	var argv = [];
        	var state = kernel.Read(i, 1);
	        if (state != 0 && kernel.Read(i, 6) > 0) {
                   	for (var c = 0; kernel.ReadRam32(kernel.Read(i, 7)+(c*4)) != 0; c++) {
                    		argv.push(kernel.ReadRamString(kernel.ReadRam32(kernel.Read(i, 7)+(c*4))));
	                }
	        }
    		return argv.join(" ");	
    	    }
    	}
    	
    	return 0;
    },
    
    IsImageAddress: function(pid, address)
    {
        for (var i = 0; i < kernel.threadMax; i++) {
            if (kernel.Read(i, 0) == pid) {
                var image = kernel.Read(i, 5);
                var imageSize = kernel.Read(i, 8);         
                return address >= image && address < (image+imageSize);
            }
        }
       
       return false;
    },

    

    IsArgvAddress: function(pid, address)
    {
        for (var i = 0; i < kernel.threadMax; i++) {
            var state = kernel.Read(i, 1) ;
            if (/*kernel.Read(i, 0) == pid &&*/ state != 0) {
                 var argv = [];
                for (var c = 0; kernel.ReadRam32(kernel.Read(i, 7)+(c*4)) != 0; c++) {
                    if (address == (kernel.Read(i, 7)+(c*4))) {
                        return true;
                    }
                    var a = start = kernel.ReadRam32(kernel.Read(i, 7)+(c*4));
                    var data = kernel.ReadRam8(a);
                    while (data != 0) {
                        data = kernel.ReadRam8(++a);
                        if (a-start > 1024) {
                            console.log("kernel.IsArgvAddress: bailing out");
                            return false;
                        }
                    }
                    var end = a;
                    if (address >= start && address <= end) {
                        return true;
                    }
                }
                
                for (var c = 9; c < 11; c++) {
                	if (kernel.Read(i, c) == address) {
                		console.log("FDS!");
                		return true;
                	}
                }
                
                
              //  return false;
            
            }
        }
       
       return false;
    },
    
    GetElfSymbol: function(name)
    {
        return _.find(simulator.disa.elf.symbols, function(x) { return x.name == name;})
    },

    GetThreadTable: function ()
    {
        return cpu.threadTable = this.GetElfSymbol("_threadTable");;
    },

    PrintThreadTable: function ()
    {
        var table = [];
     
       for (var i = 0; i < kernel.threadMax; i++) {
            var _pid = kernel.Read(i, 0);
            var state = kernel.Read(i, 1);
            var image = kernel.Read(i, 5);
            var imageSize = kernel.Read(i, 8);
            var stack = kernel.Read(i, 4);
            var argv = [FullHex(kernel.Read(i, 7)) + " "], cwd = "", argv_addr = [];
            if (state != 0 && kernel.Read(i, 6) > 0) {
                for (var c = 0; kernel.ReadRam32(kernel.Read(i, 7)+(c*4)) != 0; c++) {
                    argv.push(kernel.ReadRamString(kernel.ReadRam32(kernel.Read(i, 7)+(c*4))) + "(" + FullHex(kernel.ReadRam32(kernel.Read(i, 7)+(c*4))) + ")");
                }
                
                cwd = kernel.ReadRamString(kernel.Address(i, 12));
            }
        
            table.push({pid: _pid, state: state, image: ToHex(image), imageEnd: ToHex(image+imageSize), stack: ToHex(stack), argv: argv.join(" "), cwd: cwd});
        }
    
        console.table(table);
    },
    
    FindAllocation: function (address)
    {
        return _.find(io.malloc.alloc, function(a) {
           return address >= a.address && address < a.address+a.size;
        });
    },
    
    PushStack: function (address, opcode) 
    {
    	var currentPid = kernel.CurrentPid();
    	if (this.stack[currentPid] === undefined) {
    		this.stack[currentPid] = [];
    	}
    	this.stack[currentPid].push({address: address, from: cpu.GetPR(), opcode: opcode, pid: kernel.CurrentPid()});
    	if (0 && this.stack[currentPid].length > 1000) {
    		this.stack[currentPid].shift();
    	}
    },
    
    PopStack: function (opcode) 
    {
    	if (1) {
	    	var currentPid = kernel.CurrentPid();
	    
	    	if (this.stack[currentPid] !== undefined) {
	    		this.stack[currentPid].pop();
	    	} else {
	    		console.log("kernel.PopStack: empty stack for pid " + currentPid);
	    	}
    	} else {
	    	var currentPid = 0;//kernel.CurrentPid();
	    	if (this.stack[currentPid] === undefined) {
	    		this.stack[currentPid] = [];
	    	}
	    	this.stack[currentPid].push({address: cpu.GetPR(), opcode: opcode, from: cpu.GetPC(), pid: kernel.CurrentPid()});
	    	if (this.stack[currentPid].length > 1000) {
	    		this.stack[currentPid].shift();
	    	}
    	}
    },
    
    DumpStack: function(all)
    {
    	var _this = this;
    	_.each(this.stack, function(stack, pid) {
    		if (typeof(all) != "undefined" || kernel.PidState(pid) != 0) {
    		
	    		console.log("PID: " + pid + " " + _this.PidArgv(pid));
		    	_.each(stack, function(a) {
		    		console.log("    " + FullHex(a.address) + "   " + a.opcode + " " + FullHex(a.from) + " " + (simulator.disa.symbols.byAddress[a.address] != undefined ? simulator.disa.symbols.byAddress[a.address].name : "unknown"));
		    	});
    		}
    	});
    },
    
    instruction0000000000001011: function(instruction) {
    	// RTS 
    	// Delayed branch, PR ? PC 
    	var result = (cpu.RtsHook(), cpu.GetPR());
    	kernel.PopStack("RTS");
    	cpu.DelayedBranch(result);
    },
    
    instruction1011dddddddddddd : function(instruction) {
    	// BSR label 
    	// Delayed branch, PC ? PR, disp × 2 + PC ? PC 
    	var result = (cpu.SubroutineHook(), cpu.GetPC());
    	cpu.SetPR(result);
    	
        var result = ((((cpu.SignExtendAddressComponent(instruction, 'd') << 1) + cpu.GetPC())>>1)<<1);
        kernel.PushStack(result, "BSR");
    	cpu.DelayedBranch(result);
    },
    
    instruction0000mmmm00000011 : function(instruction) {
    	// BSRF Rm 
    	// Delayed branch, PC ? PR, Rm + PC ? PC 
    	var result = (cpu.SubroutineHook(), cpu.GetPC());
    	cpu.SetPR(result);
	
        var result = (cpu.GetR(instruction.m) + cpu.GetPC());
        kernel.PushStack(result, "BSRF");
	cpu.DelayedBranch(result);
    },

    instruction0100mmmm00001011 : function(instruction) {
    	// JSR @Rm 
    	// Delayed branch, PC ? PR, Rm ? PC 
    	var result = (cpu.SubroutineHook(), cpu.GetPC());
    	cpu.SetPR(result);
	
        var result = (cpu.GetR(instruction.m));
        kernel.PushStack(result, "JSR");
	cpu.DelayedBranch(result);
    }
}

var io = {
    ktrace: undefined,
    consoleBuffer: [],
    consoleColors: [],
    consoleKeyboardBuffer: [],
    keyState: [],
    mouse: {
        x:0,
        y:0,
        button: 0
    },
    video: {
        scaling: 1,
        videoRamIndex: 0,
        frameBuffer: [],
        pcgFrameBufferSelect: 0
    },
    vblank: false,
    time: 0,
    audio: {
        numChannels: 16,
        currentChannel: 0,
        context:  window.AudioContext ? new window.AudioContext() : window.webkitAudioContext ? new window.webkitAudioContext() : undefined,
        channels: []
    },
    file: undefined,
    malloc: { size: undefined, alloc: []},
    rename: undefined,
    unlink: undefined,
    devicePixelRatio : window.devicePixelRatio
    
};


function FileSystemRead(fd, filename)
{
    var deferred = new $.Deferred();
    
    if (filename[0] !== "/") {
        filename = "/" + filename;
    }
    
    //if (filename.indexOf(io.file.localMount) === 0) {
    var fstype = FilesystemGetType(filename);
    var remoteFilename = FilesystemGetRemoteName(filename);
    if (fstype === "local") {
        var fs = new FileSystem().done(function() {
            //var localFilename = filename.replace(io.file.localMount, io.file.localMountPoint);
            this.read(remoteFilename, false).done(function(fileData) {
                   deferred.resolve(fileData, fd);
               }).fail(function() {
                   deferred.reject(fd);
               }); 
        });
    } else if (fstype === "gdfsid") {
        var devgdfs = new GDFileSystem().done(function() {
            if (filename.indexOf("/dev/id/") === 0) {
                var parts = filename.split("/");
                if (parts.length == 5) {
                    this.readParentId(parts[3], parts[4], false).done(function(fileData) {
                        deferred.resolve(fileData, fd);
                    }).fail(function() {
                        deferred.reject(fd);
                        });
                } else if (parts.length == 4) {
                    this.readId(parts[3], false).done(function(file, fileData) {
                        deferred.resolve(fileData, fd);
                    }).fail(function() {
                        deferred.reject(fd);
                    });
                }
            } 
        });
    } else if (fstype === "gdfs") {
         var gdfs = new GDFileSystem().done(function() {
            this.read(remoteFilename, false).done(function(fileData) {
               deferred.resolve(fileData, fd);
           }).fail(function() {
               deferred.reject(fd);
           });
            
        });
        
    } else if (fstype === "web") {
         var web = new WebFileSystem().done(function() {
            this.read(remoteFilename, false).done(function(fileData) {
               deferred.resolve(fileData, fd);
           }).fail(function() {
               deferred.reject(fd);
           });
            
        });
    }
    
    return deferred.promise();
}


function FileSystemStat(sd)
{

    var filename = io.file.stat[sd].filename;
    //console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemStat["+sd+"] - " + filename, 'color: blue', 'color: black');
    
    function checksum(s)
    {
      var i;
      var chk = 0x12345678;
    
      for (i = 0; i < s.length; i++) {
        chk += (s.charCodeAt(i) * (i + 1));
      }
    
      return chk;
    }
    
    var fstype = FilesystemGetType(filename);
    var remoteFilename = FilesystemGetRemoteName(filename);
    if (fstype === "local") {
            var fs = new FileSystem().done(function(o) {
            var localFilename = remoteFilename;
            this.stat(localFilename).done(function(file) {
                if (io.file.stat[sd].struct !== undefined && io.file.stat[sd].struct !== 0) {
                    cpu.Write16(io.file.stat[sd].struct+2, Math.pow(2, 32)*Math.random()); // st_ino checksum is not valid a valid inode
                    
                    //#define         _IFMT   0170000 /* type of file */
                    //#define         _IFDIR  0040000 /* directory */
                    //#define         _IFCHR  0020000 /* character special */
                    //#define         _IFBLK  0060000 /* block special */
                    //#define         _IFREG  0100000 /* regular */
                    //#define         _IFLNK  0120000 /* symbolic link */
                    //#define         _IFSOCK 0140000 /* socket */
                    //#define         _IFIFO  0010000 /* fifo */
                    
                    if (file.isDirectory) {
                        cpu.Write32(io.file.stat[sd].struct+4, 040644 ); // st_mode
                    } else {//if (file.isFile) {
                        cpu.Write32(io.file.stat[sd].struct+4, 0100644 ); // st_mode
                    }
                    
                    if (file.size === undefined) {
                        file.size = 0;
                    }
                    cpu.Write32(io.file.stat[sd].struct+16, file.size); // st_size
                    cpu.Write32(io.file.stat[sd].struct+28, ((file.lastModified-(new Date().getTimezoneOffset()*60000))/1000)) ; // st_mtime
                }
               io.file.stat[sd].status = 0;
           }).fail(function() {
               io.file.stat[sd].status = -1;
           });
        });
    } else {
        var gdfs = new GDFileSystem().done(function(o) {
                   // TODO: implement the extra stuff done for local filesystem above     
            this.stat(remoteFilename).done(function(file) {
                if (io.file.stat[sd].struct !== undefined && io.file.stat[sd].struct !== 0) {
                    cpu.Write16(io.file.stat[sd].struct+2, checksum(file.id) ); // st_ino checksum is not valid a valid inode
                    
                    //#define         _IFMT   0170000 /* type of file */
                    //#define         _IFDIR  0040000 /* directory */
                    //#define         _IFCHR  0020000 /* character special */
                    //#define         _IFBLK  0060000 /* block special */
                    //#define         _IFREG  0100000 /* regular */
                    //#define         _IFLNK  0120000 /* symbolic link */
                    //#define         _IFSOCK 0140000 /* socket */
                    //#define         _IFIFO  0010000 /* fifo */
                    
                    if (file.mimeType == "application/vnd.google-apps.folder") {
                        cpu.Write32(io.file.stat[sd].struct+4, 040000 );
                    } else {
                        cpu.Write32(io.file.stat[sd].struct+4, 0100000 );
                    }
                    
                    if (file.fileSize === undefined) {
                        file.fileSize = 0;
                    }
                    cpu.Write32(io.file.stat[sd].struct+16, parseInt(file.fileSize)); // st_size
                    var modifiedTime = new Date(file.modifiedDate).getTime();
                    cpu.Write32(io.file.stat[sd].struct+28, (modifiedTime-new Date().getTimezoneOffset()*60000)/1000); // st_mtime
                }
               io.file.stat[sd].status = 0;
           }).fail(function() {
               io.file.stat[sd].status = -1;
           });
        });
    }
}

function FileSystemOpendir(filename)
{
    var dp = io.file.dp;                    
    if (dp === undefined || dp === 0) {
        throw "FileSystemOpendir: no dp";
    }    
    if (filename[0] !== "/") {
       filename = "/" + filename;
    }
 
    //console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemOpendir - " + filename , 'color: blue', 'color: black');
    
    io.file.dirs[dp] = {status: 0, filename: filename};
    
    var fstype = FilesystemGetType(filename);
    var remoteFilename = FilesystemGetRemoteName(filename);
    //if (filename.indexOf(io.file.localMount) === 0) {
    if (fstype === "local") {
        //var localFilename = filename.replace(io.file.localMount, io.file.localMountPoint);
        var localFilename = remoteFilename;
        var fs = new FileSystem().done(function(o) {
            this.list(localFilename).done(function(results) {
               io.file.dirs[dp].entries = results;
               io.file.dirs[dp].status = 1;
               io.file.dirs[dp].index = 0;
               //console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemOpendir - " + io.file.dirs[dp].entries , 'color: blue', 'color: black');
            }).fail(function() {
                io.file.dirs[dp].status = -1;
            });
        });        
    } else {
        var gdfs = new GDFileSystem().done(function(o) {
            //this.stat("/BitFS"+filename).done(function(file) {
            this.stat(remoteFilename).done(function(file) {
                if (file.mimeType == "application/vnd.google-apps.folder") {
                    //io.file.dirs[dp].status = 1;
                    //this.list("/BitFS"+filename).done(function(results) {
                    this.list(remoteFilename).done(function(results) {
                       io.file.dirs[dp].entries = results;
                       io.file.dirs[dp].status = 1;
                       io.file.dirs[dp].index = 0;
                       //console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemOpendir - " + io.file.dirs[dp].entries , 'color: blue', 'color: black');
                    }).fail(function() {
                        io.file.dirs[dp].status = -1;
                    });
                } else {
                  io.file.dirs[dp].status = -1;
                }
           }).fail(function() {
               io.file.dirs[dp].status = -1;
           });
        });
    }
}

function SetVideoResolution(fb, data) {
    var w = ((data & 0xFFFF0000) >> 16);
    var h = ((data & 0xFFFF));
    io.video.frameBuffer[fb] = CreateFrameBuffer(fb, w, h);
}

function SetVideoAlpha(fb, alpha) {
    var video = io.video.frameBuffer[fb];
    video.ctx.globalAlpha = alpha/255;
}

function SetVideoScaling(scaling) {
    io.video.scaling = scaling * io.devicePixelRatio;
}

function GetDevicePixelRatio() {
    return io.devicePixelRatio;
}

function CreateAudioChannel() {
    return {
        type: "sine",

        volume: 1,

        frequency: 60000,
        ramp: 25,
        hold: 150,
        decay: 20,

        address: undefined,
        length: undefined,

        buffer: undefined,
        oscillator: undefined,
        gain: undefined,
        bufferSource: undefined
    };
}

function ResetAudio() {
    io.audio.channels = [];
    for (var i = 0; i < io.audio.numChannels; i++) {
        io.audio.channels.push(CreateAudioChannel());
    }
}

function Beep(channel) {
    AudioChannelSelect(channel);
    AudioSetChannelType(0);
    AudioSetRamp(5);
    AudioSetDecay(5);
    AudioSetHold(50);
    AudioSetFrequency(250000);
    AudioExecute(channel);
}

function AudioChannelSelect(channel) {
    io.audio.currentChannel = channel;
}


function AudioSetFrequency(frequency) {
    var a = io.audio;
    a.channels[a.currentChannel].frequency = frequency;
}

function AudioSetRamp(ramp) {
    var a = io.audio;
    a.channels[a.currentChannel].ramp = ramp;
}

function AudioSetDecay(decay) {
    var a = io.audio;
    a.channels[a.currentChannel].decay = decay;
}

function AudioSetHold(hold) {
    var a = io.audio;
    a.channels[a.currentChannel].hold = hold;
}

function AudioSetChannelType(type) {
    var types = ["sine", "sawtooth", "square", "triangle", "buffer"];
    var a = io.audio;
    a.channels[a.currentChannel].type = types[type];
}

function AudioSetBufferAddress(address) {
    var a = io.audio;
    a.channels[a.currentChannel].address = address;
}

function AudioSetBufferLength(length) {
    var a = io.audio;
    var channel = a.channels[a.currentChannel];
    channel.length = length;

    a.context.decodeAudioData(cpu.DMARead(channel.address, channel.address + channel.length), function(buffer) {
        channel.buffer = buffer;
    }, function() {
        //console.log("[%c" + ToHex(simulator.address) + "%c]  ", 'color: blue', 'color: black');
    });
}

function AudioExecute(index) {
    var audio = io.audio;
    if (audio.context !== undefined) {
        
        var channel = audio.channels[index];
    
        if (channel.type !== "buffer") {
            if (channel.oscillator !== undefined) {
                channel.oscillator.stop(0);
                channel.oscillator.disconnect(channel.gain);
                channel.gain.disconnect(audio.context.destination);
            }
    
            channel.gain = audio.context.createGain();
            channel.oscillator = audio.context.createOscillator();
            channel.gain.connect(audio.context.destination);
            channel.gain.gain.setValueAtTime(0, audio.context.currentTime);
            channel.gain.gain.exponentialRampToValueAtTime(channel.volume, parseInt(audio.context.currentTime + (channel.ramp / 1000)));
            channel.gain.gain.linearRampToValueAtTime(channel.volume, audio.context.currentTime + ((channel.ramp + channel.hold) / 1000));
            channel.gain.gain.linearRampToValueAtTime(0, audio.context.currentTime + ((channel.hold + channel.ramp + channel.decay) / 1000));
    
            channel.oscillator.frequency.value = channel.frequency / 1000;
            channel.oscillator.type = channel.type;
            channel.oscillator.connect(channel.gain);
            channel.oscillator.start(0);
        } else if (channel.buffer !== undefined) {
            channel.bufferSource = audio.context.createBufferSource();
            channel.bufferSource.buffer = channel.buffer;
            channel.bufferSource.connect(audio.context.destination);
            channel.bufferSource.start(0);
        }
    }
}

function CreateFrameBuffer(index, w, h) {
    var canvas, ctx, imageData;
    if (index === 0) {
        canvas = document.getElementById("disa-display");
        canvas.width = w * io.video.scaling;
        canvas.height = h * io.video.scaling;
        canvas.style.width = (canvas.width/io.devicePixelRatio)+"px";
        canvas.style.height = (canvas.height/io.devicePixelRatio)+"px";
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, w * io.video.scaling, h * io.video.scaling);
        ctx.fillStyle = "#000";
    } else {
        canvas = document.createElement('canvas');
        canvas.width = w * io.video.scaling;
        canvas.height = h * io.video.scaling;
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFF";
        ctx.fillStyle = "#000";
    }
    
    //ctx.scale(2,2);

    imageData = ctx.createImageData(w, h);
    
    var fb = {
            x: 0,
            y: 0,
            w: w,
            h: h,
            color: undefined,
            blt: {
                src: {
                    x: 0,
                    y: 0,
                    fb: 0,
                    scale: 1,
                },
                dest: {
                    x: 0,
                    y: 0,
                    fb: 0,
                    scale: 1,
                },
                size: {
                    x: 0,
                    y: 0
                }
            },
            ctx : ctx,
            canvas : canvas,
            imageData: imageData,
            pcg: {
               name: "Monaco,Menlo,Consolas,'Courier New',monospace",
               size: 12*io.devicePixelRatio,
               x:0,
               y:0,
               color: "#000"
            }
    };
    
    fb.ctx.textBaseline = "top";
    fb.ctx.font = fb.pcg.size + "px " + fb.pcg.name;
    return fb;
}

function ResetVideo() {
    io.video.scaling = 1.0 * io.devicePixelRatio;
    //var w = 640, h = 480;
    var w = 1140, h = 768;
    //for (var i = 0; i < 4; i++) {
    io.video.frameBuffer[0] = CreateFrameBuffer(0, w, h);
    //}
}

function ResetFile() {
    io.consoleKeyboardBuffer = [];
    io.consoleBuffer = [];
    io.consoleColors = [];
    
    io.file = {
        fd: undefined,
        files: [],
        dp: undefined,
        dirs: {},
        stat: [],
        statSD: undefined,
        mkdirs: [],
        fstab: [ 
            {
                mount: "/dev/id",
                type: "gdfsid"
            },
            {
                mount: "/gdrive",
                remoteMount: "/BitFS",
                type: "gdfs"
            },
            {
                mount: "/web",
                remoteMount: "",
                type: "web"
            },
            {
                mount: "/",
                remoteMount: "/bitfs/",
                type: "local"
            }]
    };
    
    io.rename = {
        index: undefined,
        renames: []
    }
    
    io.unlink = {
        index: undefined,
        unlinks: []
    }
};

function BltSrc(fb, data) {
    var video = io.video.frameBuffer[fb];
    video.blt.src.x = ((data & 0xFFFF0000) >> 16);
    video.blt.src.y = ((data & 0xFFFF));
    var CPU = cpu;
    video.blt.src.x = CPU.ToSigned(CPU.SignExtend(video.blt.src.x, 16));
    video.blt.src.y = CPU.ToSigned(CPU.SignExtend(video.blt.src.y, 16));
}

function BltDest(fb, data) {
    var video = io.video.frameBuffer[fb];
    video.blt.dest.x = ((data & 0xFFFF0000) >> 16);
    video.blt.dest.y = (data & 0xFFFF);
    var CPU = cpu;
    video.blt.dest.x = CPU.ToSigned(CPU.SignExtend(video.blt.dest.x, 16));
    video.blt.dest.y = CPU.ToSigned(CPU.SignExtend(video.blt.dest.y, 16));
}

function BltSrcSize(fb, data) {
    var video = io.video.frameBuffer[fb];
    video.blt.src.w = ((data & 0xFFFF0000) >> 16);
    video.blt.src.h = (data & 0xFFFF);
}

function BltDestSize(fb, data) {
    var video = io.video.frameBuffer[fb];
    video.blt.dest.w = ((data & 0xFFFF0000) >> 16);
    video.blt.dest.h = (data & 0xFFFF);
}

function SetFrameBufferScaling(fb, data) {
    var video = io.video.frameBuffer[fb];
    video.blt.src.scale = ((data & 0xFFFF0000) >> 16);
    video.blt.dest.scale = (data & 0xFFFF);
}

function BltFromSrcWithScaling(fb, data) {
    var iv = io.video;
    var video = iv.frameBuffer[fb];
    var src = iv.frameBuffer[data];
    
    if (video.blt.src.x != -1 && video.blt.dest.x != -1) {
   
        video.ctx.drawImage(src.canvas,
            video.blt.src.x * iv.scaling * video.blt.src.scale, video.blt.src.y * iv.scaling * video.blt.src.scale,
            video.blt.src.w * iv.scaling * video.blt.src.scale, video.blt.src.h * iv.scaling * video.blt.src.scale,
            video.blt.dest.x * iv.scaling * video.blt.dest.scale, video.blt.dest.y * iv.scaling * video.blt.dest.scale,
            video.blt.src.w * iv.scaling * video.blt.dest.scale, video.blt.src.h * iv.scaling * video.blt.dest.scale);
    }
}

function BltFromSrcWithSize(fb, data) {
    var iv = io.video;
    var video = iv.frameBuffer[fb];
    var src = iv.frameBuffer[data];
    
   
    video.ctx.drawImage(src.canvas,
        video.blt.src.x * iv.scaling, video.blt.src.y * iv.scaling,
        video.blt.src.w * iv.scaling, video.blt.src.h * iv.scaling,
        video.blt.dest.x * iv.scaling, video.blt.dest.y * iv.scaling,
        video.blt.dest.w * iv.scaling, video.blt.dest.h * iv.scaling);
}

function VideoPixel(fb, data) {
    var scaling = io.video.scaling;
    var video = io.video.frameBuffer[fb];
    if (video.color != data) {
        video.color = data;
        video.ctx.fillStyle = "rgba(" + ((video.color & 0xFF0000) >>> 16) + "," +
            ((video.color & 0xFF00) >>> 8) + "," +
            (video.color & 0xFF) + "," +
            //"1.0)";
            (((video.color & 0xFF000000) >>> 24))/255.0 + ")";
    }

    video.ctx.fillRect(video.x * scaling, video.y * scaling, scaling, scaling);
}

function VideoData(fb, data) {
    var video = io.video.frameBuffer[fb];
    var pixelArray = video.imageData.data;//(data >>> 8) | ((data & 0xFF)<<24);
    
    var index = ((video.y * video.w) + video.x) * 4;
    pixelArray[index++] = (data & 0xFF000000) >>> 24;
    pixelArray[index++] = (data & 0xFF0000) >>> 16;
    pixelArray[index++] = (data & 0xFF00) >>> 8;
    pixelArray[index++]  = data & 0xFF;
}

function VideoSaveData(fb, data) {
    var video = io.video.frameBuffer[fb];
    var ctx = video.ctx;
    var imageData = video.imageData;
    ctx.putImageData(imageData, 0, 0);
    if (io.devicePixelRatio != 1) {
        ctx.drawImage(ctx.canvas, 0, 0, io.devicePixelRatio*ctx.canvas.width, io.devicePixelRatio*ctx.canvas.height);
    }
    /*var pixelData = imageData.data;
    for (var i = 0; i < pixelData.length; i+=4) {
        pixelData[i] = 0;
        pixelData[i+1] = 0;
        pixelData[i+2] = 0;
        pixelData[i+3] = 0xFF;
    }*/
}

function VideoLoadData(fb, data) {
    io.video.videoRamIndex = fb;
    var video = io.video.frameBuffer[fb];
    video.imageData = video.ctx.getImageData(0, 0, video.w, video.h);
    
}


function VideoRect(fb, data) {
    var scaling = io.video.scaling;
    var video = io.video.frameBuffer[fb];
    if (video.color != data) {
        video.color = data;
        video.ctx.fillStyle = "rgba(" + ((video.color & 0xFF0000) >>> 16) + "," +
            ((video.color & 0xFF00) >>> 8) + "," +
            (video.color & 0xFF) + "," +
            //((video.color & 0xFF000000) >>> 24) + ")";
            (((video.color & 0xFF000000) >>> 24))/255.0 + ")";
            //"1.0)";
    }

    video.ctx.fillRect(video.x * scaling, video.y * scaling, video.width * scaling, video.height * scaling);
}

function VideoAddressX(fb, data) {
    io.video.frameBuffer[fb].x = cpu.ToSigned(data);
}

function VideoAddressY(fb, data) {
    io.video.frameBuffer[fb].y = cpu.ToSigned(data);
}

function VideoWidth(fb, data) {
    io.video.frameBuffer[fb].width = data;
}

function VideoHeight(fb, data) {
    io.video.frameBuffer[fb].height = data;
}

function ConsoleWrite(c) {
    if (c === 0) {
        return;
    }

    c = String.fromCharCode(c);

    if (c !== '\n') {
        io.consoleBuffer.push(c);
    } else {
        console.log("[%c" + ToHex(simulator.address) + "%c] " + io.consoleBuffer.join(''), 'color: blue', 'color: black');
        io.consoleBuffer = [];
    }
}

function ConsoleReadBufferSize(data) {
    return io.consoleKeyboardBuffer.length;
}

function ConsoleRead(data) {
    return io.consoleKeyboardBuffer.shift();
}

function SimulatorStop(data) {
    simulator.stop = true;
}

function SimulatorYield(data) {
    simulator.yield = true;
}

function SimulatorYieldOnRTE(data) {
    simulator.yieldOnRTE = true;
}

function StartStopWatch(data) {
    simulator.swInstructionCount = simulator.instructionCount;
    simulator.swStartTime = new Date().getTime();
}


function StopStopWatch(data) {
    simulator.swStopTime = new Date().getTime();
    var instructions = simulator.instructionCount - simulator.swInstructionCount;
    var elapsed = simulator.swStopTime - simulator.swStartTime;
    ("Executed " + instructions + " instructions  in " + elapsed + " ms (" + ((instructions / (elapsed / 1000)) / 1000000) + " MIPS)");
}

function GetStopWatchElapsed() {
    return simulator.swStopTime - simulator.swStartTime;
}

function KernelEnableTrace(data)
{
    io.ktrace = [];
}

function KernelPrint(data)
{
  var output= "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            output += String.fromCharCode(c);
        }
    }
    
    console.log(output);
    
    return;
}

function KernelTrace(data)
{
    if (data & 0x100) {
        io.ktrace.push({action: "BLOCKED", id: data & 0xFF, time: window.performance.now()});
    } else if (data & 0x1000) {
        io.ktrace.push({action: "NOWAIT", time: window.performance.now()});
    } else {
        io.ktrace.push({action: "SWITCH", id: data & 0xFF, time: window.performance.now()});
    }
}

function ConsoleColor(data) {
    io.consoleBuffer.push("%c");
    io.consoleColors.push("'color: rgb(" +
        ((data & 0xFF0000) >> 16) + "," +
        ((data & 0xFF00) >> 8) + "," +
        (data & 0xFF) + ")'");
}

function GetVBlank() {
    var val = io.vblank;
    if (io.vblank) {
        io.vblank = false;
    }
    return val;
}

function ConsoleSelectKeyState(data) {
    io.keyStateKey = data;
}

function ConsoleGetKeyState() {
    var keyState = io.keyState[io.keyStateKey];
    if (keyState === undefined) {
        keyState = 0;
    }
    return keyState;
}

function GetTimeSeconds() {
    return (io.time / 1000) >>> 0;
}

function GetTimeMicroSeconds() {
    var seconds = (io.time / 1000) >>> 0;
    return (io.time - (seconds * 1000)) * 1000;
}

function GetElapsedMilliSeconds() {
    return io.elapsedTime >>> 0;
}

function DirOpenDirStruct(data)
{
    io.file.dp = data;

}
    
function DirOpenDir (data, bitLength) {
    if (bitLength !== undefined) { //Read
        return io.file.dirs[io.file.dp].status;
    } else {
        var filename = "";
        var c;
        for (var address = data; c !== 0; address++) {
            c = cpu.Read8(address);
            if (c !== 0) {
                filename += String.fromCharCode(c);
            }
        }
        var c = [];
        _.each(filename.split("/"), function(b) { if (b == "..") { c.pop();} else { c.push(b);}});
        filename = c.join("/");
        FileSystemOpendir(filename);
    }
}
    
function DirReadDir(data, bitLength) {
    if (bitLength !== undefined) { //Read
        //console.log("[%c" + ToHex(simulator.address) + "%c] DirReadDir - Read" + io.file.dp , 'color: blue', 'color: black');
        if (io.file.dp !== undefined) {
            var dirent = io.file.dirs[io.file.dp];
            if (dirent !== undefined) {
              if (dirent.entries !== undefined && dirent.index < dirent.entries.length) {
                  if (dirent.entries[dirent.index] != undefined) {
                      var name = dirent.entries[dirent.index++].title;
                      //console.log("[%c" + ToHex(simulator.address) + "%c] DirReadDir - " + name , 'color: blue', 'color: black');
                      for (var i = 0; i < name.length; i++) {
                          cpu.Write8(io.file.dp+i, name[i].charCodeAt(0));
                      }
                      cpu.Write8(io.file.dp+i, 0);
                      return 0;
                  }
              }
            } 
        }
        return -1;
    } else {
        //console.log("[%c" + ToHex(simulator.address) + "%c] DirReadDir - Write" + data , 'color: blue', 'color: black');
         io.file.dp = data;
    }
    
}

function FilesystemGetType(filename) {
    for (var i in io.file.fstab) {
        if (filename.indexOf(io.file.fstab[i].mount) === 0) {
            return io.file.fstab[i].type;
        }
    }
}

function FilesystemGetRemoteName(filename) {
    for (var i in io.file.fstab) {
        if (filename.indexOf(io.file.fstab[i].mount) === 0) {
            return filename.replace(io.file.fstab[i].mount, io.file.fstab[i].remoteMount);
        }
    }
}

function DirMakeDir(data, bitLength) {
    if (bitLength !== undefined) { //Read
        return io.file.mkdirs[io.file.mkdirName];
    } else {
        var pathname = "";
         var c;
        for (var address = data; c !== 0; address++) {
            c = cpu.Read8(address);
            if (c !== 0) {
                pathname += String.fromCharCode(c);
            }
        }
        if (pathname[0] !== "/") {
            pathname = "/" + pathname;
        }
        //if (pathname.indexOf(io.file.localMount) === 0) {
        if (FilesystemGetType(pathname) === "local") {
            if (io.file.mkdirs[pathname] === undefined) {
                io.file.mkdirs[pathname] = 1;
                var fs = new FileSystem().done(function() {
                 //this.mkdir(pathname.replace(io.file.localMount, io.file.localMountPoint)).done(function() {
                 this.mkdir(FilesystemGetRemoteName(pathname)).done(function() {
                       io.file.mkdirs[pathname] = 0;
                    }).fail(function() {
                        io.file.mkdirs[pathname] = -1;
                    });
                });
            } else {
                io.file.mkdirName = pathname;
            }
        }
    }
}

function FileOpen(data, filename) {
    if (filename == undefined) {
        filename = "";
        var c;
        for (var address = data; c !== 0; address++) {
            c = cpu.Read8(address);
            if (c !== 0) {
                filename += String.fromCharCode(c);
            }
        }
    }
    
    var c = [];
    _.each(filename.split("/"), function(b) { if (b == "..") { c.pop();} else { c.push(b);}});
    filename = c.join("/");
    
    //console.log("[%c" + ToHex(simulator.address) + "%c] FileOpen["+io.file.fd+"] - " + filename, 'color: blue', 'color: black');
    
    if (filename == "/dev/pipe") {
        io.file.files[io.file.fd] = {status : 1, filename: filename, pipe : []};
    } else if (filename == "/dev/urandom") {
        io.file.files[io.file.fd] = {status : -1, filename: filename};
    } else {
        io.file.files[io.file.fd] = {status : 0, filename: filename};
    }
}

function FileStatStruct(data) {
    io.file.stat[io.file.statSD].struct = data;
}

function FileStatPath(data) {
    var filename = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            filename += String.fromCharCode(c);
        }
    }
    
    if (filename[0] !== "/") {
        filename = "/" + filename;
    }
    
    var c = [];
    _.each(filename.split("/"), function(b) { if (b == "..") { c.pop();} else { c.push(b);}});
    filename = c.join("/");
    
    io.file.stat[io.file.statSD].filename = filename;
    FileSystemStat(io.file.statSD);
}

function FileStatStatus(date) {
    return io.file.stat[io.file.statSD].status;
}

function FileStat(data, bitLength) {
    if (bitLength === undefined) { //Write
        io.file.statSD = data;
    } else {
         for (var i = 0; io.file.stat[i] !== undefined; i++);
         io.file.stat[i] = {status: -2};
         io.file.statSD = i;
         return i;
    }
    /*if (bitLength === undefined) { //Write
        var filename = "";
        var c;
        for (var address = data; c !== 0; address++) {
            c = cpu.Read8(address);
            if (c !== 0) {
                filename += String.fromCharCode(c);
            }
        }
        
         
        if (filename[0] !== "/") {
            filename = "/" + filename;
        }
        
        var c = [];
        _.each(filename.split("/"), function(b) { if (b == "..") { c.pop();} else { c.push(b);}});
        filename = c.join("/");
        
        io.file.statFilename = filename;
        if (io.file.stat[filename] === undefined) {
            io.file.stat[filename] = {status: -2};
            FileSystemStat(filename);
        }
    } else {
        var status =  io.file.stat[io.file.statFilename].status;
        if (status == 0) {
            io.file.stat[io.file.statFilename] = undefined;
        } 
        return status;
    }*/
    
}

function SafeGetCurrentFilename(fd)
{
    var file = io.file.files[fd];
    if (file !== undefined) {
        return file.filename;
    } else {
        return "NO FILE"
    }
}

function FileFlags(data) {
    var deferred = new $.Deferred();
    //console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags["+io.file.fd+"] - " + data + " " + SafeGetCurrentFilename(io.file.fd), 'color: blue', 'color: black');
    
    if (io.file.files[io.file.fd] !== undefined && io.file.files[io.file.fd].status == -1) {
        deferred.reject();
        return deferred;
    }
    
    if (io.file.files[io.file.fd] !== undefined && io.file.files[io.file.fd].pipe !== undefined) {
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags["+io.file.fd+"] - PIPE -" + data + " " + SafeGetCurrentFilename(io.file.fd), 'color: blue', 'color: black');
        deferred.reject();
        return deferred;
    }
    
    
    function fail(fd) {
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags[" + fd + "] failed - " + SafeGetCurrentFilename() + " io.file.files[" + fd + "] = undefined;",  'color: red', 'color: black');
        io.file.files[fd] = undefined;
        deferred.reject();
    }
    
    if (data & 0x8000) { //O_NOCTTY
        data = (ToUnsigned(~0x8000)) & 0x8000;
    }
    
    if (data === 0) { // O_RDONLY
        function process(fileData, fd) {
            if (fileData === null || fileData === undefined) {
                fail(fd);
            } else {
                //console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags[" + fd + "] success",  'color: blue', 'color: black');
                if (io.file.files[fd] === undefined) {
                    deferred.reject();
                }
                io.file.files[fd].data = fileData;
                io.file.files[fd].dataView = new DataView(io.file.files[fd].data);
                io.file.files[fd].fp = 0;
                io.file.files[fd].write = 0;
                io.file.files[fd].read = 1;
                io.file.files[fd].status = 1;
                deferred.resolve();
            }
        }
        
        FileSystemRead(io.file.fd, io.file.files[io.file.fd].filename).done(process).fail(fail);
    } else if ((data & 0xFF) === 1 ) { // O_WRONLY
        if (data & 0x200) { //O_CREAT
            if (io.file.files[io.file.fd] === undefined) {
                deferred.reject();
            }
            io.file.files[io.file.fd].data = new ArrayBuffer(0);
            io.file.files[io.file.fd].dataView = new DataView(io.file.files[io.file.fd].data);
            io.file.files[io.file.fd].fp = 0;
            io.file.files[io.file.fd].modified = true;
            io.file.files[io.file.fd].write = 1;
            io.file.files[io.file.fd].read = 0;
            io.file.files[io.file.fd].status = 1;
            deferred.resolve();
        }  else {
            fail(io.file.fd);
        }
    } else if ((data & 0x2) === 0x2) { //O_RDWR
        if (data & 0x200) { //O_CREAT
            if (io.file.files[io.file.fd] === undefined) {
                deferred.reject();
            }
            io.file.files[io.file.fd].data = new ArrayBuffer(0);
            io.file.files[io.file.fd].dataView = new DataView(io.file.files[io.file.fd].data);
            io.file.files[io.file.fd].fp = 0;
            io.file.files[io.file.fd].modified = true;
            io.file.files[io.file.fd].write = 1;
            io.file.files[io.file.fd].read = 1;
            io.file.files[io.file.fd].status = 1;
            deferred.resolve();
        } else if (data & 0x0008) { // O_APPEND
         	function processAppend(fileData, fd) {
         		if (fileData === null || fileData === undefined) {
                		fail(fd);
            		} else {
	         		if (io.file.files[fd] === undefined) {
	                    		deferred.reject();
	                	}
		                io.file.files[fd].data = fileData;
		                io.file.files[fd].dataView = new DataView(io.file.files[fd].data);
		                io.file.files[fd].fp = io.file.files[fd].data.byteLength;
		                io.file.files[fd].modified = true;
		                io.file.files[fd].write = 1;
		                io.file.files[fd].read = 1;
		                io.file.files[fd].status = 1;
		                deferred.resolve();
            		}
         	}                
                
                FileSystemRead(io.file.fd, io.file.files[io.file.fd].filename).done(processAppend).fail(fail);
        } else {
             function process(fileData, fd) {
                if (fileData === null || fileData === undefined) {
                    fail(fd);
                } else {
                    //console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags[" + fd + "] success",  'color: blue', 'color: black');
                    if (io.file.files[fd] === undefined) {
                       deferred.reject();
                    }
                    io.file.files[fd].data = fileData;
                    io.file.files[fd].dataView = new DataView(io.file.files[fd].data);
                    io.file.files[fd].fp = 0;
                    io.file.files[fd].modified = false;
                    io.file.files[fd].write = 1;
                    io.file.files[fd].read = 1;
                    io.file.files[fd].status = 1;
                    deferred.resolve();
                }
            }
        
            FileSystemRead(io.file.fd, io.file.files[io.file.fd].filename).done(process).fail(fail);
        }
    } else {
        fail(io.file.fd);
    }
    
    return deferred;
}

var fileFD = 5;

function FileFD(data, allocate) {
    if (typeof(allocate) !== "undefined") {
        //for (var i = 5; io.file.files[i] !== undefined; i++);
        var i = fileFD++;   
        io.file.files[i] = "pending";
        return i;    
    } else {
        io.file.fd = data;
    }
}

function FileStatus() {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return 2;
    } else {
        return file.status;
    }
}

function FileRead() {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return -1;
    }
    
    if (file.pipe !== undefined) {
        if (file.pipe.length > 0) {
            return file.pipe.shift()>>>0;
        } else if (file.pipe.length == 0 && file.pipe.closed == true) { // Pipe closed, and empty
            //console.log("[%c" + ToHex(simulator.address) + "%c] FileRead["+io.file.fd+"] - Closed pipe " + file.filename + " io.file.files[" + io.file.fd + "] = undefined", 'color: red', 'color: black');
            io.file.files[io.file.fd] = undefined;
            return -1;
        } else {
            return -2; // Pipe blocked;
        }
    } else {
        var fp = file.fp;
        
        if (fp >= file.data.byteLength) {
            //console.log("[%c" + ToHex(simulator.address) + "%c] FileRead["+io.file.fd+"] - EOF " + file.filename, 'color: blue', 'color: black');
            return -1;
        } else {
            //console.log("[%c" + ToHex(simulator.address) + "%c] FileRead["+io.file.fd+"] - " + file.filename, 'color: blue', 'color: black');
            var c = file.dataView.getUint8(fp++);
            io.file.files[io.file.fd].fp = fp;
            return c>>>0;
        }
    }
}

function FileWriteAddress(address) {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return;
    }
    io.file.files[io.file.fd].address = address;
}

function FileWriteLength(length) {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return;
    }
    
    if (file.pipe !== undefined) {
        for (var i = 0; i < length; i++) {
            file.pipe.push(cpu.Read8(io.file.files[io.file.fd].address+i));
        }
    } else {
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileWrite["+io.file.fd+"] - " + file.filename + " " + length, 'color: blue', 'color: black');
        if (file.fp+length > file.data.byteLength) {
            var data = new ArrayBuffer(file.fp+length);
            var newDataVew =  new DataView(data);
            var l = file.data.byteLength;
            for (var i=0;i<l;i++){
               newDataVew.setUint8(i, file.dataView.getUint8(i));
            }  
            file.data = data;
            file.dataView = new DataView(file.data);
        }
        
        file.modified = true;
        for (var i = 0; i < length; i++) {
            file.dataView.setUint8(file.fp, cpu.Read8(io.file.files[io.file.fd].address+i) & 0xFF);
            file.fp++;
        }
    }
}

function FileSeekDirection(dir) {
    // 0 == SEEK_SET, 1 == SEEK_CUR, 2 = SEEK_END
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return;
    }
    
    file.seekDirection = dir;
}

function FileSeek(pos) {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return;
    }
    
    if (file.seekDirection === 0) { // SEEK_SET
        file.fp = pos;
    } else if (file.seekDirection === 1) { // SEEK_CUR
        file.fp+= pos;
    } else if (file.seekDirection === 2) { // SEEK_END
        file.fp = file.data.byteLength - pos;
    }
    
    //console.log("[%c" + ToHex(simulator.address) + "%c] FileSeek["+io.file.fd+"] - SEEK_SET" + file.filename + " " + file.fp, 'color: blue', 'color: black');
}

function FilePosition() {
      var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return -1;
    }
    
    return file.fp;
}

function FileCloseStatus(data)
{
    var file = io.file.files[io.file.fd];
    
    if (file !== undefined) {
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileCloseStatus["+io.file.fd+"] - " + file.closeStatus, 'color: blue', 'color: black');

        if (file.pipe !== undefined) {
            return 1;
        } else {
            var status = file.closeStatus;
            if (status === 0) {
               //console.log("[%c" + ToHex(simulator.address) + "%c] FileCloseStatus["+io.file.fd+"] - " + file.closeStatus + " io.file.files[" + io.file.fd + "] = undefined", 'color: red', 'color: black');
               io.file.files[io.file.fd] = undefined;
            }
            return status;
        }
    
    } else {
        if (io.file.fd === 0 || io.file.fd === 1 || io.file.fd === 2) { //stdin, stdout, stderr
            return 0;
        }
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileCloseStatus["+io.file.fd+"] - Already closed?", 'color: blue', 'color: black');
        return 0;
    }
}

function FileClose() {
    var file = io.file.files[io.file.fd];
    
    if (file !== undefined) {
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileClose["+io.file.fd+"] - " + file.filename, 'color: blue', 'color: black');
        if (file.modified) {
            var filename = file.filename;
            if (filename[0] !== "/") {
                filename = "/" + filename;
            }
            var remoteFilename = FilesystemGetRemoteName(filename);
            //if (filename.indexOf(io.file.localMount) === 0) {
            if (FilesystemGetType(filename) == "local") {
                file.closeStatus = 1; //Pending
                var fs = new FileSystem().done(function() {
                // this.save(filename.replace(io.file.localMount, io.file.localMountPoint), file.data).done(function() {
                 this.save(remoteFilename, file.data).done(function() {
                       //console.log("[%c" + ToHex(simulator.address) + "%c] FileClosed["+io.file.fd+"]  - " + file.filename + " Saved..." + file.data.byteLength, 'color: blue', 'color: black');
                       file.closeStatus = 0; //Closed
                    }).fail(function() {
                       //console.log("[%c" + ToHex(simulator.address) + "%c] FileClosed["+io.file.fd+"] FAILED  - " + file.filename + " Saved...", 'color: blue', 'color: black');
                       file.closeStatus = -1; //Closed
                    });
                });
            } else {
                file.closeStatus = 1; //Pending
                var gdfs = new GDFileSystem().done(function() {
                    if (filename.indexOf("/dev/id/") === 0) {
                        //TODO
                    } else {
                        file.closeStatus = 1; //Pending
                        this.save(remoteFilename, file.data).done(function() {
                           //console.log("[%c" + ToHex(simulator.address) + "%c] FileClosed["+io.file.fd+"]  - " + file.filename + " Saved...", 'color: blue', 'color: black');
                           file.closeStatus = 0; //Closed
                        }).fail(function() {
                          //console.log("[%c" + ToHex(simulator.address) + "%c] FileClosed["+io.file.fd+"] FAILED - " + file.filename + " Saved...", 'color: blue', 'color: black');
                           file.closeStatus = 0; //Closed
                        });
                    }
                });
            }
        } else {
            file.closeStatus = 0;
        }
        
        if (file.pipe !== undefined && file.pipe.closed === undefined) {
            file.pipe.closed = true;
        }
        /*
        if (file.pipe !== undefined && file.pipe.closed === undefined) {
            file.pipe.closed = true;
        } else {
            io.file.files[io.file.fd] = undefined;
        }*/
        return 0;
    } else {
        
        //console.log("[%c" + ToHex(simulator.address) + "%c] FileClose - fd " + io.file.fd + " does not exist  ", 'color: blue', 'color: black');
        
        return -1;
    }
}

function FileSize() {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return -1;
    }
    
    if (file.pipe !== undefined) {
        return file.pipe.length;
    } else {
        return file.data.byteLength;
    }
}

function ElfKernelLoadFromFile(filename) {
    var fd = FileFD(0, 1);
    FileOpen(0, filename);
    FileFlags(0).done(function() {
        ElfKernelLoad(fd);    
    });
}

function ElfKernelLoad(fd) {
    require(["elf"], function() {
        var file = io.file.files[io.file.fd];
        var elf = new Elf32(file.data);
        var loaded = Disa.prototype.instance !== undefined;
        var mapEdit = GetMapEdit();
        mapEdit.LoadMap(file.filename, elf.image).done(function() {
            GetDisa().done(function() {
                    var disa = this;
                    disa.elf = elf;
                    function _done() {
                        for (var i = 0; i < elf.symbols.length; i++) {
                            if (elf.symbols[i].st_info != 4) {
                                disa.AddSymbol(elf.symbols[i].st_value, elf.symbols[i].name, "Program Symbol");
                            }
                        }
                        GetDisaView().done(function() { this.RenderTableList();})
                        GetGui().Ready();
                        $("#disa-viewer-tab").click();
                        $("#disa-simulator-reset").click();
                        $("#disa-simulator-execute").click();
                    }
                    if (loaded) {
                        this.Init(mapEdit.map).always(_done);
                    } else {
                        _done();
                    }
    
                });
        });
    });
}

function FileElfLoad(fd) {
    //console.log("FileElfLoad: " + io.file.fd);
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1) {
        return 0;
    }
    
    file.elf = new Elf32(file.data, true);
}

function FileElfRelocate(address)
{
    //console.log("FileElfRelocate: " + io.file.fd + " -> " + address );
    
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1 || file.elf === undefined) {
        return 0;
    }
    
    file.elf.Relocate(address);    
    for (var i = 0; i < file.elf.symbols.length; i++) {
        if (file.elf.symbols[i].st_info != 4) {
            Disa.prototype.instance.AddSymbol(address+file.elf.symbols[i].st_value, file.elf.symbols[i].name, "Program Symbol");
        }
    }
}

function FileElfSize() {
    
    //console.log("FileElfSize: " + io.file.fd);
    
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1 || file.elf === undefined) {
        return 0;
    } else {
        return file.elf.imageSize;
    }
}
function FileElfEntry() {
    
    //console.log("FileElfEntry: " + io.file.fd);
    
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1 || file.elf === undefined) {
        return 0;
    } else {
        return file.elf.entry;
    }
}

function RenameOld(data)
{
    var filename = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            filename += String.fromCharCode(c);
        }
    }
    io.rename.renames[io.rename.renames.length-1].oldFilename = filename;
}

function RenameNew(data)
{
    var filename = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            filename += String.fromCharCode(c);
        }
    }
    var index = io.rename.renames.length-1;
    var rename = io.rename.renames[index];
    rename.newFilename = filename;
    
    //console.log("[%c" + ToHex(simulator.address) + "%c] Rename - " + rename.oldFilename + " -> " + rename.newFilename, 'color: blue', 'color: black');
    
    
    if (FilesystemGetType(rename.newFilename) == "local" && FilesystemGetType(rename.oldFilename) == "local") {
    //if (rename.newFilename.indexOf(io.file.localMount) === 0 && rename.oldFilename.indexOf(io.file.localMount) === 0) {
        
        var fs = new FileSystem().done(function() {
            //var src = rename.oldFilename.replace(io.file.localMount, io.file.localMountPoint);
            //var dest = rename.newFilename.replace(io.file.localMount, io.file.localMountPoint);
            var src = FilesystemGetRemoteName(rename.oldFilename);
            var dest = FilesystemGetRemoteName(rename.newFilename);
            this.rename(src, dest).done(function(fileData) {
                   rename.status = 0;
               }).fail(function() {
                   rename.status = -1;
               }); 
        });
    } else {
        console.log("Rename: Cannot rename on GDFS (yet)");
    }
    
}

function RenameStatus(data)
{
    //console.log("[%c" + ToHex(simulator.address) + "%c] RenameStatus - " + io.rename.renames[io.rename.index].status, 'color: blue', 'color: black');
    // 1 waiting
    // 0 success
    // -1 fail
    return io.rename.renames[io.rename.index].status;
}
    
function RenameRename(data, bitLength)
{
    if (bitLength !== undefined) { //Read
        io.rename.renames.push({ oldFilename: undefined, newFilename: undefined, status: 1});
        return io.rename.renames.length-1;
    }
    
    io.rename.index = data;
}

function UnlinkPath(data)
{
    var filename = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            filename += String.fromCharCode(c);
        }
    }
    var index = io.unlink.unlinks.length-1;
    var unlink = io.unlink.unlinks[index];
    unlink.path = filename;
    unlink.status = 1;
    
    //console.log("[%c" + ToHex(simulator.address) + "%c] Rename - " + rename.oldFilename + " -> " + rename.newFilename, 'color: blue', 'color: black');
    
    
    if (FilesystemGetType(unlink.path) === "local") {
    //if (unlink.path.indexOf(io.file.localMount) === 0 ) {
        
        var fs = new FileSystem().done(function() {
            //var path = unlink.path.replace(io.file.localMount, io.file.localMountPoint);
            var path = FilesystemGetRemoteName(unlink.path);
            //console.log("UnlinkPath: FIleSystem ready")
            //console.log(unlink)
            //console.log(this)
            //console.log(fs)
            this.rm(path).done(function(fileData) {
                   unlink.status = 0;
               }).fail(function() {
                   unlink.status = -1;
               }); 
        });
    } else {
        console.log("Unlink: Cannot unlink on GDFS (yet)");
    }
    
}

function UnlinkStatus(data)
{
    //console.log("[%c" + ToHex(simulator.address) + "%c] RenameStatus - " + io.rename.renames[io.rename.index].status, 'color: blue', 'color: black');
    // 1 waiting
    // 0 success
    // -1 fail
    return io.unlink.unlinks[io.unlink.index].status;
}
    
function UnlinkDescriptor(data, bitLength)
{
    if (bitLength !== undefined) { //Read
        io.unlink.unlinks.push({ path: undefined,  status: 1});
        return io.unlink.unlinks.length-1;
    }
    
    io.unlink.index = data;
}

function GetMouseX() {
    return io.mouse.x/(io.video.scaling/io.devicePixelRatio);
}

function GetMouseY() {
    return io.mouse.y/(io.video.scaling/io.devicePixelRatio);
}

function GetMouseButton() {
    return io.mouse.button;
}

function SetupVideoPeripheral(fb) {
    io.peripheral.push(function(d){VideoAddressX(fb, d);});
    io.peripheral.push(function(d){VideoAddressY(fb, d);});
    io.peripheral.push(function(d){VideoWidth(fb, d);});
    io.peripheral.push(function(d){VideoHeight(fb, d);});
    io.peripheral.push(function(d){VideoPixel(fb, d);});
    io.peripheral.push(function(d){VideoRect(fb, d);});
    io.peripheral.push(function(d){VideoData(fb, d);});
    io.peripheral.push(function(d){VideoSaveData(fb, d);});
    io.peripheral.push(function(d){VideoLoadData(fb, d);});
    io.peripheral.push(function(d){BltSrc(fb, d);});
    io.peripheral.push(function(d){BltDest(fb, d);});
    io.peripheral.push(function(d){BltSrcSize(fb, d);});
    io.peripheral.push(function(d){BltDestSize(fb, d);});
    io.peripheral.push(function(d){SetFrameBufferScaling(fb, d);});
    io.peripheral.push(function(d){BltFromSrcWithScaling(fb, d);});
    io.peripheral.push(function(d){BltFromSrcWithSize(fb, d);});
    io.peripheral.push(function(d){SetVideoResolution(fb, d);});
    io.peripheral.push(function(d){SetVideoAlpha(fb, d);});
}


function ResetMalloc() {
    io.malloc = { size: undefined, alloc: []};
}

function MallocAdddress(address, bitLength) {
    if (bitLength === undefined) {
        //var current = _.filter(io.malloc.alloc, function(a) {
        var current = _.find(io.malloc.alloc, function(a) {
             return a.address == address; 
        });
        //if (current.length == 0) {
        if (current === undefined) {
            io.malloc.alloc.push({address: address, pid: io.malloc.pid, size: io.malloc.size});
            //console.log("[%c" + ToHex(simulator.address) + "%c] malloc(" + io.malloc.size + ")" + " = " + ToHex(address) + " pid = " + io.malloc.pid, 'color: blue', 'color: black');
        } else {
            console.log("[%c" + ToHex(simulator.address) + "%c] Duplicate Address - MallocAdddress(" + io.malloc.size + ")" + " = " + ToHex(address) + " pid = " + io.malloc.pid, 'color: blue', 'color: black');
            console.log(current);
            //simulator.stop = true;
            //alert("Duplicate Address")
            MallocFreeAddress(address);
        }
        
    } else {
        if (io.malloc.readIndex !== undefined) {
            var alloc = io.malloc.readAllocs[io.malloc.readIndex++];
            if (alloc !== undefined) {
                return alloc.address;
            } else {
                return 0;
            }
        }
        
        return 0;
    }
}

function MallocPid(pid, bitLength) {
   
    io.malloc.pid = pid;
   
}

function MallocList(pid, bitLength) {
   io.malloc.readIndex = 0;
   io.malloc.readAllocs = _.filter(io.malloc.alloc, function(a) {
       return a.pid == pid; 
   });
  // MallocFreePid(pid);
  //console.log("[%c" + ToHex(simulator.address) + "%c] MallocList(" + pid + ")", 'color: blue', 'color: black');
}
    
function MallocSize(size) {
    io.malloc.size = size;
}
    
function MallocFreeAddress(address) {
    if (address != 0) {
        var newalloc = _.filter(io.malloc.alloc, function(a) {
           return a.address != address; 
        });
        
        if (newalloc.length == io.malloc.alloc.length) {
            console.log("[%c" + ToHex(simulator.address) + "%c] MallocFree(" + ToHex(address) + ") : Free unknown", 'color: blue', 'color: black');
        }
        
        io.malloc.alloc = newalloc;
        //console.log("[%c" + ToHex(simulator.address) + "%c] MallocFreeAddress(" + ToHex(address) + ")", 'color: blue', 'color: black');
    }
}

function MallocFreePid(pid) {
    var newalloc = _.filter(io.malloc.alloc, function(a) {
       return a.pid != pid; 
    });
    if (newalloc.length != io.malloc.alloc.length) {
        console.log("[%c" + ToHex(simulator.address) + "%c] MallocFreePid(" + pid + ") : Found zombie " + newalloc.length + " - " +  io.malloc.alloc.length, 'color: blue', 'color: black');
    }
    io.malloc.alloc = newalloc;
    //console.log("[%c" + ToHex(simulator.address) + "%c] MallocFreePid(" + pid + ")", 'color: blue', 'color: black');
}


function PCGFrameBuffer(data)
{
    io.video.pcgFrameBufferSelect = data;
}
    
function PCGName(data)
{
    var name = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            name += String.fromCharCode(c);
        }
    }
    var fb = io.video.frameBuffer[io.video.pcgFrameBufferSelect];
    fb.pcg.name = name;
    fb.ctx.font = (fb.pcg.size*io.devicePixelRatio)+ "px " + fb.pcg.name;
}
    
function PCGSize(data)
{
    var fb = io.video.frameBuffer[io.video.pcgFrameBufferSelect];
    fb.pcg.size = data;
    fb.ctx.font = (fb.pcg.size*io.devicePixelRatio)+ "px " + fb.pcg.name;
}
    
function PCGX(data)
{
    io.video.frameBuffer[io.video.pcgFrameBufferSelect].pcg.x = data;    

}
    
function PCGY(data)
{
    io.video.frameBuffer[io.video.pcgFrameBufferSelect].pcg.y = data;    
}
    
function PCGColor(data)
{
    var video = io.video.frameBuffer[io.video.pcgFrameBufferSelect];
    if (video.color != data) {
        video.color = data;
        video.ctx.fillStyle = "rgba(" + ((video.color & 0xFF0000) >>> 16) + "," +
            ((video.color & 0xFF00) >>> 8) + "," +
            (video.color & 0xFF) + "," +
            //"1.0)";
            (((video.color & 0xFF000000) >>> 24))/255.0 + ")";
    }
}

function PCGText(data)
{
    var text = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read8(address);
        if (c !== 0) {
            text += String.fromCharCode(c);
        }
    }   
    var fb = io.video.frameBuffer[io.video.pcgFrameBufferSelect];
    var pcg = fb.pcg;
    fb.ctx.fillText(text, pcg.x*io.video.scaling, pcg.y*io.video.scaling);
}

function SetupPeripheral() {
    io.peripheral = [];

    // simulator.stop
    io.peripheral.push(SimulatorStop);

    // simulator.yield
    io.peripheral.push(SimulatorYield);
    
    // simulator.yieldOnRTE
    io.peripheral.push(SimulatorYieldOnRTE);

    // startStopWatch
    io.peripheral.push(StartStopWatch);

    // stopStopWatch
    io.peripheral.push(StopStopWatch);

    // simulator,stopWatchElapsed
    io.peripheral.push(GetStopWatchElapsed);

    io.peripheral.push(KernelTrace);
    
    io.peripheral.push(KernelEnableTrace);
    
    io.peripheral.push(KernelPrint);

    // consoleWrite
    io.peripheral.push(ConsoleWrite);

    // consoleColor
    io.peripheral.push(ConsoleColor);

    // consoleRead
    io.peripheral.push(ConsoleRead);

    // consoleReadBufferSize
    io.peripheral.push(ConsoleReadBufferSize);

    // consoleSelectKeyState
    io.peripheral.push(ConsoleSelectKeyState);

    // consoleKeyState
    io.peripheral.push(ConsoleGetKeyState);

    // vblank
    io.peripheral.push(GetVBlank);

    //videoScaling
    io.peripheral.push(SetVideoScaling);
    
    //GetDevicePixelRatio
    io.peripheral.push(GetDevicePixelRatio);
    
    // simulator.time.seconds
    io.peripheral.push(GetTimeSeconds);

    // simulator.time.microSeconds
    io.peripheral.push(GetTimeMicroSeconds);

    io.peripheral.push(GetElapsedMilliSeconds);

    // audio.channelSelect
    io.peripheral.push(AudioChannelSelect);

    // audio.frequency
    io.peripheral.push(AudioSetFrequency);

    // audio.ramp
    io.peripheral.push(AudioSetRamp);

    // audio.decay
    io.peripheral.push(AudioSetDecay);

    // audio.hold
    io.peripheral.push(AudioSetHold);

    // audio.type
    io.peripheral.push(AudioSetChannelType);

    // audio.address
    io.peripheral.push(AudioSetBufferAddress);

    // audio.length
    io.peripheral.push(AudioSetBufferLength);

    // audio.execute
    io.peripheral.push(AudioExecute);
    
    io.peripheral.push(FileFD);
    
    io.peripheral.push(FileOpen);
    
    io.peripheral.push(FileFlags);

    io.peripheral.push(FileStat);    
    
    io.peripheral.push(FileStatPath);
    
    io.peripheral.push(FileStatStruct);
    
    io.peripheral.push(FileStatStatus);
    
    io.peripheral.push(FileStatus);
    
    io.peripheral.push(FileRead);
    
    io.peripheral.push(FileWriteAddress);
    
    io.peripheral.push(FileWriteLength);
    
    io.peripheral.push(FileClose);
    
    io.peripheral.push(FileCloseStatus);
    
    io.peripheral.push(FileSize);
    
    io.peripheral.push(FileSeekDirection);
    
    io.peripheral.push(FileSeek);
    
    io.peripheral.push(FilePosition);
    
    io.peripheral.push(FileElfLoad);
    
    io.peripheral.push(FileElfSize);
    
    io.peripheral.push(FileElfRelocate);
    
    io.peripheral.push(FileElfEntry);
    
    io.peripheral.push(ElfKernelLoad);
    
    io.peripheral.push(DirOpenDirStruct);
    
    io.peripheral.push(DirOpenDir);
    
    io.peripheral.push(DirReadDir);
    
    io.peripheral.push(DirMakeDir);
    
    io.peripheral.push(RenameOld);
    
    io.peripheral.push(RenameNew);
    
    io.peripheral.push(RenameStatus);
    
    io.peripheral.push(RenameRename);
    
    io.peripheral.push(UnlinkPath);
    
    io.peripheral.push(UnlinkStatus);
    
    io.peripheral.push(UnlinkDescriptor);
    
    io.peripheral.push(GetMouseX);
    
    io.peripheral.push(GetMouseY);
    
    io.peripheral.push(GetMouseButton);
    
    for (var fb = 0; fb < 10; fb++) {
        SetupVideoPeripheral(fb);
    }
    
    io.peripheral.push(MallocAdddress);
    
    io.peripheral.push(MallocSize);
    
    io.peripheral.push(MallocFreeAddress);
    
    io.peripheral.push(MallocPid);
    
    io.peripheral.push(MallocList);
    
    io.peripheral.push(MallocFreePid);
    
    io.peripheral.push(PCGFrameBuffer);
    
    io.peripheral.push(PCGName);
    
    io.peripheral.push(PCGSize);
    
    io.peripheral.push(PCGX);
    
    io.peripheral.push(PCGY);
    
    io.peripheral.push(PCGColor);
    
    io.peripheral.push(PCGText);
    
}

SetupPeripheral();

function Copy(gfilename, dest)
{
   var _this = this;
    new FileSystem().done(function() {
        var localFS = this;
        var fs = new GDFileSystem().done(function() {
            this.read(gfilename,false).done(function(data) {
                localFS.save(dest, data).done(function() {
                    console.log("Done")
                    });
            });
        });
    });  
}

function Unzip(filename, dest)
{
    var _this = this;
    new FileSystem().done(function() {
        var localFS = this;
        var elements = [];
        var index = 0;
        
        function ExtractElement(index)
        {
           var deferred = new $.Deferred();
           var element = elements[index];
           if (element.directory) {
                var dirname = BuildPath(element);
                if (dirname != "") {
                    //console.log("mkdir " +  dest + dirname);
                    localFS.mkdir( dest + BuildPath(element)).done(function() {
                        deferred.resolve(index+1);
                    });
                }
            } else {
                element.getBlob("", function(x) { 
                    var fileReader = new FileReader();
                    fileReader.onload = function() {
                        //console.log("extract " + dest + BuildPath(element));
                        localFS.save( dest + BuildPath(element), this.result).done(function() {
                            deferred.resolve(index+1);    
                        })
                        
                    };
                fileReader.readAsArrayBuffer(x);

               }, false)
                
            }
            return deferred.promise();
        }
        
        function Extract() {
            ExtractElement(index).done(function(newIndex) {
                if (newIndex < elements.length) {
                    $("#bitos-progress").width(((index*100)/elements.length)+"%");
                    index = newIndex;
                    Extract();
                } else {
                    $(".bitos-progress").addClass("hidden");
                }
            });
        }
        
        function BuildPath(element) {
            if (element.parent === undefined) {
                if (element.name == undefined) {
                    return "";
                }
                return element.name;
            }
            
            return BuildPath(element.parent) + "/" + element.name;
        }
        
        function ProcessElement(element) {   
            if (element.directory) {
                var dirname = BuildPath(element);
                if (dirname != "") {
                    elements.push(element);
                }
                for (var c in element.children) {
                    ProcessElement(element.children[c]);
                }
            } else {
                elements.push(element);
            }
        }
        
        function ZipLoaded() {
            ProcessElement(_this.zipper.root);
            Extract();
        }
        function ZipError() {
            console.log("failed to unzip");
        }
        require(["external/zip/zip.min.js"], function() {
            /*var fs = new GDFileSystem().done(function() {
                this.read(gfilename,false).done(function(data) {
                    _this.zipper = new zip.fs.FS();
                    zip.workerScriptsPath = "external/zip/";
                    _this.zipper.importBlob(new Blob([data]), function () { ZipLoaded() }, function () { ZipError() });
                })
                
            })*/
            var fd = FileFD(0, 1);
            FileOpen(0, filename);
            FileFlags(0).done(function() {
                var file = io.file.files[io.file.fd];
                _this.zipper = new zip.fs.FS();
                zip.workerScriptsPath = "external/zip/";
                _this.zipper.importBlob(new Blob([file.data]), function () { ZipLoaded() }, function () { ZipError() });
            });
        });
    
    });
}

function InitialiseBitFS(filename)
{
    new FileSystem().done(function() {
        var _this = this;
        this.rm("/bitfs").always(function() {
            _this.mkdir("/bitfs").always(function() {
                $(".bitos-progress").removeClass("hidden");
                Unzip(filename, "/bitfs/usr/");        
            });
        });
    });
}
