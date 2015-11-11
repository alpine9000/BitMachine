/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

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
        frameBuffer: []
    },
    vblank: false,
    time: 0,
    audio: {
        numChannels: 16,
        currentChannel: 0,
        context: new window.webkitAudioContext(),
        channels: []
    },
    file: undefined
};

function FileSystemRead(fd, filename)
{
    var deferred = new $.Deferred();
    
    if (filename[0] !== "/") {
        filename = "/" + filename;
    }
    
    if (filename.indexOf(io.file.localMount) === 0) {
        var fs = new FileSystem().done(function() {
            var localFilename = filename.replace(io.file.localMount, io.file.localMountPoint);
            this.read(localFilename, false).done(function(fileData) {
                   deferred.resolve(fileData, fd);
               }).fail(function() {
                   deferred.reject(fd);
               }); 
        });
    } else {
        var gdfs = new GDFileSystem().done(function() {
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
            } else {
               
                this.read("/BitFS"+filename, false).done(function(fileData) {
                   deferred.resolve(fileData, fd);
               }).fail(function() {
                   deferred.reject(fd);
               });
            }
        });
    }
    
    return deferred.promise();
}


function FileSystemStat(filename)
{

    
    console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemStat - " + filename, 'color: blue', 'color: black');
    
    function checksum(s)
    {
      var i;
      var chk = 0x12345678;
    
      for (i = 0; i < s.length; i++) {
        chk += (s.charCodeAt(i) * (i + 1));
      }
    
      return chk;
    }
    
    if (filename.indexOf(io.file.localMount) === 0) {
            var fs = new FileSystem().done(function(o) {
            var localFilename = filename.replace(io.file.localMount, io.file.localMountPoint);            
            this.stat(localFilename).done(function(file) {
                if (io.file.statStruct !== undefined && io.file.statStruct !== 0) {
                    cpu.Write16(io.file.statStruct+2, Math.pow(2, 32)*Math.random()); // st_ino checksum is not valid a valid inode
                    
                    //#define         _IFMT   0170000 /* type of file */
                    //#define         _IFDIR  0040000 /* directory */
                    //#define         _IFCHR  0020000 /* character special */
                    //#define         _IFBLK  0060000 /* block special */
                    //#define         _IFREG  0100000 /* regular */
                    //#define         _IFLNK  0120000 /* symbolic link */
                    //#define         _IFSOCK 0140000 /* socket */
                    //#define         _IFIFO  0010000 /* fifo */
                    
                    if (file.isDirectory) {
                        cpu.Write32(io.file.statStruct+4, 040000 );
                    } else if (file.isFile) {
                        cpu.Write32(io.file.statStruct+4, 0100000 );
                    }
                }
               io.file.stat[filename].status = 0;
           }).fail(function() {
               io.file.stat[filename].status = -1;
           });
        });
    } else {
        var gdfs = new GDFileSystem().done(function(o) {
                        
            this.stat("/BitFS"+filename).done(function(file) {
                if (io.file.statStruct !== undefined && io.file.statStruct !== 0) {
                    cpu.Write16(io.file.statStruct+2, checksum(file.id) ); // st_ino checksum is not valid a valid inode
                    
                    //#define         _IFMT   0170000 /* type of file */
                    //#define         _IFDIR  0040000 /* directory */
                    //#define         _IFCHR  0020000 /* character special */
                    //#define         _IFBLK  0060000 /* block special */
                    //#define         _IFREG  0100000 /* regular */
                    //#define         _IFLNK  0120000 /* symbolic link */
                    //#define         _IFSOCK 0140000 /* socket */
                    //#define         _IFIFO  0010000 /* fifo */
                    
                    if (file.mimeType == "application/vnd.google-apps.folder") {
                        cpu.Write32(io.file.statStruct+4, 040000 );
                    } else {
                        cpu.Write32(io.file.statStruct+4, 0100000 );
                    }
                }
               io.file.stat[filename].status = 0;
           }).fail(function() {
               io.file.stat[filename].status = -1;
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
 
    console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemOpendir - " + filename , 'color: blue', 'color: black');
    
    io.file.dirs[dp] = {status: 0, filename: filename};
    
    if (filename.indexOf(io.file.localMount) === 0) {
        var localFilename = filename.replace(io.file.localMount, io.file.localMountPoint);
        var fs = new FileSystem().done(function(o) {
            this.list(localFilename).done(function(results) {
               io.file.dirs[dp].entries = results;
               io.file.dirs[dp].status = 1;
               io.file.dirs[dp].index = 0;
               console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemOpendir - " + io.file.dirs[dp].entries , 'color: blue', 'color: black');
            }).fail(function() {
                io.file.dirs[dp].status = -1;
            });
        });        
    } else {
        var gdfs = new GDFileSystem().done(function(o) {
            this.stat("/BitFS"+filename).done(function(file) {
                if (file.mimeType == "application/vnd.google-apps.folder") {
                    //io.file.dirs[dp].status = 1;
                    this.list("/BitFS"+filename).done(function(results) {
                       io.file.dirs[dp].entries = results;
                       io.file.dirs[dp].status = 1;
                       io.file.dirs[dp].index = 0;
                       console.log("[%c" + ToHex(simulator.address) + "%c] FileSystemOpendir - " + io.file.dirs[dp].entries , 'color: blue', 'color: black');
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
    io.video.scaling = scaling;
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
        console.log("[%c" + ToHex(simulator.address) + "%c]  ", 'color: blue', 'color: black');
    });
}

function AudioExecute(index) {
    var audio = io.audio;
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
        channel.gain.gain.exponentialRampToValueAtTime(channel.volume, audio.context.currentTime + (channel.ramp / 1000));
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

function CreateFrameBuffer(index, w, h) {
    var canvas, ctx, imageData;
    if (index === 0) {
        canvas = document.getElementById("disa-display");
        canvas.width = w * io.video.scaling;
        canvas.height = h * io.video.scaling;
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
    
    imageData = ctx.createImageData(w, h);
    
    return {
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
            imageData: imageData
    };
}

function ResetVideo() {
    io.video.scaling = 1.0;
    var w = 640, h = 480;
    //for (var i = 0; i < 4; i++) {
    io.video.frameBuffer[0] = CreateFrameBuffer(0, w, h);
    //}
}

function ResetFile() {
     io.file = {
        fd: undefined,
        files: [],
        dp: undefined,
        dirs: {},
        stat: {},
        statFilename: undefined,
        statStruct: undefined,
        mkdirs: [],
        localMount: "/usr/local/",
        localMountPoint: "/bitfs/"
    };
}

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
    
   
    video.ctx.drawImage(src.canvas,
        video.blt.src.x * iv.scaling * video.blt.src.scale, video.blt.src.y * iv.scaling * video.blt.src.scale,
        video.blt.src.w * iv.scaling * video.blt.src.scale, video.blt.src.h * iv.scaling * video.blt.src.scale,
        video.blt.dest.x * iv.scaling * video.blt.dest.scale, video.blt.dest.y * iv.scaling * video.blt.dest.scale,
        video.blt.src.w * iv.scaling * video.blt.dest.scale, video.blt.src.h * iv.scaling * video.blt.dest.scale);
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
        //var args = ["'" + io.consoleBuffer.join('') + "'"].concat(io.consoleColors);
        //val("console.log(" + args.join(",") + ")");
        //console.log(ToHex(simulator.address) + " " + io.consoleBuffer.join(''));
        console.log("[%c" + ToHex(simulator.address) + "%c] " + io.consoleBuffer.join(''), 'color: blue', 'color: black');
        io.consoleBuffer = [];
        //io.consoleColors = [];
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
        console.log("[%c" + ToHex(simulator.address) + "%c] DirReadDir - Read" + io.file.dp , 'color: blue', 'color: black');
        if (io.file.dp !== undefined) {
            var dirent = io.file.dirs[io.file.dp];
            if (dirent !== undefined) {
              if (dirent.entries !== undefined && dirent.index < dirent.entries.length) {
                  if (dirent.entries[dirent.index] != undefined) {
                      var name = dirent.entries[dirent.index++].title;
                      console.log("[%c" + ToHex(simulator.address) + "%c] DirReadDir - " + name , 'color: blue', 'color: black');
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
        console.log("[%c" + ToHex(simulator.address) + "%c] DirReadDir - Write" + data , 'color: blue', 'color: black');
         io.file.dp = data;
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
        if (pathname.indexOf(io.file.localMount) === 0) {
            if (io.file.mkdirs[pathname] === undefined) {
                io.file.mkdirs[pathname] = 1;
                var fs = new FileSystem().done(function() {
                 this.mkdir(pathname.replace(io.file.localMount, io.file.localMountPoint)).done(function() {
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

function FileOpen(data) {
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
    
    console.log("[%c" + ToHex(simulator.address) + "%c] FileOpen["+io.file.fd+"] - " + filename, 'color: blue', 'color: black');
    
    if (filename == "/dev/pipe") {
        io.file.files[io.file.fd] = {status : 1, filename: filename, pipe : []};
    } else {
        io.file.files[io.file.fd] = {status : 0, filename: filename};
    }
}

function FileStatStruct(data) {
    io.file.statStruct = data;   
};



function FileStat(data, bitLength) {
    if (bitLength === undefined) { //Write
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
    }
}

function FileFlags(data) {
    
    console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags["+io.file.fd+"] - " + data, 'color: blue', 'color: black');
    
    if (io.file.files[io.file.fd] !== undefined && io.file.files[io.file.fd].pipe !== undefined) {
        return;
    }
    
    
    function fail(fd) {
        console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags[" + fd + "] failed",  'color: blue', 'color: black');
        io.file.files[fd] = undefined;
    }
    
    if (data & 0x8000) { //O_NOCTTY
        data = (ToUnsigned(~0x8000)) & 0x8000;
    }
    
    if (data === 0) { // O_RDONLY
        function process(fileData, fd) {
            if (fileData === null || fileData === undefined) {
                fail(fd);
            } else {
                console.log("[%c" + ToHex(simulator.address) + "%c] FileFlags[" + fd + "] success",  'color: blue', 'color: black');
                io.file.files[fd].data = fileData;
                io.file.files[fd].dataView = new DataView(io.file.files[fd].data);
                io.file.files[fd].fp = 0;
                io.file.files[fd].status = 1;
            }
        }
        
        FileSystemRead(io.file.fd, io.file.files[io.file.fd].filename).done(process).fail(fail);
    } else if ((data & 0xFF) === 1 ) { // O_WRONLY
        if (data & 0x200) { //O_CREAT
            io.file.files[io.file.fd].data = new ArrayBuffer(0);
            io.file.files[io.file.fd].fp = 0;
            io.file.files[io.file.fd].status = 1;
        }  else {
            fail(io.file.fd);
        }
    } else if ((data&0xFF) === 2) { //O_RDWR
        if (data & 0x200) { //O_CREAT
            io.file.files[io.file.fd].data = new ArrayBuffer(0);
            io.file.files[io.file.fd].fp = 0;
            io.file.files[io.file.fd].status = 1;
        } else {
            fail(io.file.fd);
        }
    } else {
        fail(io.file.fd);
    }
}

function FileFD(data) {
    io.file.fd = data;
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
            io.file.files[io.file.fd] = undefined;
            return -1;
        } else {
            return -2; // Pipe blocked;
        }
    } else {
        var fp = file.fp;
        
        if (fp >= file.data.byteLength) {
            //console.log("[%c" + ToHex(simulator.address) + "%c] FileRead - EOF " + file.filename, 'color: blue', 'color: black');
            return -1;
        } else {
            //console.log("[%c" + ToHex(simulator.address) + "%c] FileRead - " + file.filename, 'color: blue', 'color: black');
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
        console.log("[%c" + ToHex(simulator.address) + "%c] FileWrite - " + file.filename, 'color: blue', 'color: black');
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
}

function FilePosition() {
      var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return -1;
    }
    
    return file.fp;
}

function FileClose() {
    var file = io.file.files[io.file.fd];
    
    if (file !== undefined) {
        console.log("[%c" + ToHex(simulator.address) + "%c] FileClose - " + file.filename, 'color: blue', 'color: black');
        if (file.modified) {
            var filename = file.filename;
            if (filename[0] !== "/") {
                filename = "/" + filename;
            }
            if (filename.indexOf(io.file.localMount) === 0) {
                var fs = new FileSystem().done(function() {
                 this.save(filename.replace(io.file.localMount, io.file.localMountPoint), file.data, function() {
                       console.log("[%c" + ToHex(simulator.address) + "%c] FileClose - " + file.filename + " Saved...", 'color: blue', 'color: black');
                    }); 
                });
            } else {
                var gdfs = new GDFileSystem().done(function() {
                    if (filename.indexOf("/dev/id/") === 0) {
                        //TODO
                    } else {
                      
                        this.save("/BitFS"+filename, file.data, function() {
                           console.log("[%c" + ToHex(simulator.address) + "%c] FileClose - " + file.filename + " Saved...", 'color: blue', 'color: black');
                        });
                    }
                });
            }
        }
        
        if (file.pipe !== undefined && file.pipe.closed === undefined) {
            file.pipe.closed = true;
        } else {
            io.file.files[io.file.fd] = undefined;
        }
        return 0;
    } else {
        
        console.log("[%c" + ToHex(simulator.address) + "%c] FileClose - fd " + io.file.fd + " does not exist  ", 'color: blue', 'color: black');
        
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

function FileElfLoad(fd) {
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1) {
        return 0;
    }
    
    file.elf = new Elf32(file.data, true);
}

function FileElfRelocate(address)
{
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
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1 || file.elf === undefined) {
        return 0;
    } else {
        return file.elf.imageSize;
    }
}
function FileElfEntry() {
    var file = io.file.files[io.file.fd];
    if (file === undefined || file.status != 1 || file.elf === undefined) {
        return 0;
    } else {
        return file.elf.entry;
    }
}

function GetMouseX() {
    return io.mouse.x/io.video.scaling;
}

function GetMouseY() {
    return io.mouse.y/io.video.scaling;
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
    
    io.peripheral.push(FileStatStruct);
    
    io.peripheral.push(FileStat);
    
    io.peripheral.push(FileStatus);
    
    io.peripheral.push(FileRead);
    
    io.peripheral.push(FileWriteAddress);
    
    io.peripheral.push(FileWriteLength);
    
    io.peripheral.push(FileClose);
    
    io.peripheral.push(FileSize);
    
    io.peripheral.push(FileSeekDirection);
    
    io.peripheral.push(FileSeek);
    
    io.peripheral.push(FilePosition);
    
    io.peripheral.push(FileElfLoad);
    
    io.peripheral.push(FileElfSize);
    
    io.peripheral.push(FileElfRelocate);
    
    io.peripheral.push(FileElfEntry);
    
    io.peripheral.push(DirOpenDirStruct);
    
    io.peripheral.push(DirOpenDir);
    
    io.peripheral.push(DirReadDir);
    
    io.peripheral.push(DirMakeDir);
    
    io.peripheral.push(GetMouseX);
    
    io.peripheral.push(GetMouseY);
    
    io.peripheral.push(GetMouseButton);
    
    for (var fb = 0; fb < 10; fb++) {
        SetupVideoPeripheral(fb);
    }
    
}

SetupPeripheral();

function Unzip(gfilename, dest)
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
                    console.log("mkdir " +  dest + dirname);
                    localFS.mkdir( dest + BuildPath(element)).done(function() {
                        deferred.resolve(index+1);
                    });
                }
            } else {
                element.getBlob("", function(x) { 
                    var fileReader = new FileReader();
                    fileReader.onload = function() {
                        console.log("extract " + dest + BuildPath(element));
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
                    index = newIndex;
                    Extract();
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
                    //console.log("mkdir " + dirname);
                    elements.push(element);
                }
                for (var c in element.children) {
                    ProcessElement(element.children[c]);
                }
            } else {
                //element.getBlob("", function(x) { 
                    //var fileReader = new FileReader();
                    //fileReader.onload = function() {
                        
                      //  console.log("extract " + BuildPath(element));
                    //    console.log(x);
                     //   console.log(this.result)
                    //};
                    //fileReader.readAsArrayBuffer(x);
                    
            //    }, false)
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
            var fs = new GDFileSystem().done(function() {
                this.read(gfilename,false).done(function(data) {
                    _this.zipper = new zip.fs.FS();
                    zip.workerScriptsPath = "external/zip/";
                    _this.zipper.importBlob(new Blob([data]), function () { ZipLoaded() }, function () { ZipError() });
                })
                
            });
        });
    
    });
}