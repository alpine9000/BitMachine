/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var io = {
    consoleBuffer: [],
    consoleColors: [],
    consoleKeyboardBuffer: [],
    keyState: [],
    video: {
        resolution: {
            x: 320,
            y: 240
        },
        scaling: 2,
        frameBuffer: 0,
        x: 0,
        y: 0,
        color: [],
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
        ctx: [],
        canvas: [],
        imageData: []
    },
    vblank: false,
    time: 0,
    audio: {
        numChannels: 16,
        currentChannel: 0,
        context: new window.webkitAudioContext(),
        channels: []
    },
    file: {
        fd: undefined,
        files: []
    }
};


function SetVideoResolution(data) {
    io.video.resolution.x = ((data & 0xFFFF0000) >> 16);
    io.video.resolution.y = ((data & 0xFFFF));
    ResetVideo();
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
        console.log("error: failed to decode audio data.");
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

function ResetVideo() {
    io.video.frameBuffer = 0;
    io.video.x = io.video.y = 0;
    io.video.color = [];
    io.video.blt = {
        src: {
            x: 0,
            y: 0,
            fb: 0,
            scale: 1
        },
        dest: {
            x: 0,
            y: 0,
            fb: 0,
            scale: 1
        },
        size: {
            x: 0,
            y: 0
        }
    };
    io.video.ctx = [];
    io.video.canvas = [];

    io.video.canvas[0] = document.getElementById("disa-display");
    io.video.canvas[0].width = io.video.resolution.x * io.video.scaling;
    io.video.canvas[0].height = io.video.resolution.y * io.video.scaling;
    io.video.ctx[0] = io.video.canvas[0].getContext("2d");
    io.video.imageData[0] =  io.video.ctx[0].createImageData(io.video.resolution.x, io.video.resolution.x);

    io.video.ctx[0].fillStyle = "#FFF";
    io.video.ctx[0].fillRect(0, 0, io.video.resolution.x * io.video.scaling, io.video.resolution.y * io.video.scaling);
    io.video.ctx[0].fillStyle = "#000";

    io.video.canvas[1] = document.createElement('canvas');
    io.video.canvas[1].width = io.video.resolution.x * io.video.scaling;
    io.video.canvas[1].height = io.video.resolution.y * io.video.scaling;
    io.video.ctx[1] = io.video.canvas[1].getContext('2d');
    io.video.imageData[1] =  io.video.ctx[1].createImageData(io.video.resolution.x, io.video.resolution.x);

    io.video.ctx[1].fillStyle = "#FFF";
    //io.video.ctx[1].fillRect(0,0,io.video.resolution.x*io.video.scaling,io.video.resolution.y*io.video.scaling);
    io.video.ctx[1].fillStyle = "#000";

    io.video.canvas[2] = document.createElement('canvas');
    io.video.canvas[2].width = io.video.resolution.x * io.video.scaling;
    io.video.canvas[2].height = io.video.resolution.y * io.video.scaling;
    io.video.ctx[2] = io.video.canvas[2].getContext('2d');
    io.video.imageData[2] =  io.video.ctx[2].createImageData(io.video.resolution.x, io.video.resolution.x);

    io.video.ctx[2].fillStyle = "#FFF";
    //io.video.ctx[2].fillRect(0,0,io.video.resolution.x*io.video.scaling,io.video.resolution.y*io.video.scaling);
    io.video.ctx[2].fillStyle = "#000";

}

function SetFrameBuffer(data) {
    io.video.frameBuffer = data;
}

function BltSrc(data) {
    var video = io.video;
    video.blt.src.x = ((data & 0xFFFF0000) >> 16);
    video.blt.src.y = ((data & 0xFFFF));
    var CPU = cpu;
    video.blt.src.x = CPU.ToSigned(CPU.SignExtend(video.blt.src.x, 16));
    video.blt.src.y = CPU.ToSigned(CPU.SignExtend(video.blt.src.y, 16));
}

function BltDest(data) {
    var video = io.video;
    video.blt.dest.x = ((data & 0xFFFF0000) >> 16);
    video.blt.dest.y = (data & 0xFFFF);
    var CPU = cpu;
    video.blt.dest.x = CPU.ToSigned(CPU.SignExtend(video.blt.dest.x, 16));
    video.blt.dest.y = CPU.ToSigned(CPU.SignExtend(video.blt.dest.y, 16));
}

function BltSize(data) {
    var video = io.video;
    video.blt.size.x = ((data & 0xFFFF0000) >> 16);
    video.blt.size.y = (data & 0xFFFF);
}

function SetFrameBufferScaling(data) {
    var video = io.video;
    video.blt.src.scale = ((data & 0xFFFF0000) >> 16);
    video.blt.dest.scale = (data & 0xFFFF);
}

function BltFrameBuffers(data) {
    var video = io.video;
    video.blt.src.fb = (data & 0xFFFF0000) >> 16;
    video.blt.dest.fb = (data & 0xFFFF);
   
    video.ctx[video.blt.dest.fb].drawImage(video.canvas[video.blt.src.fb],
        video.blt.src.x * video.scaling * video.blt.src.scale, video.blt.src.y * video.scaling * video.blt.src.scale,
        video.blt.size.x * video.scaling * video.blt.src.scale, video.blt.size.y * video.scaling * video.blt.src.scale,
        video.blt.dest.x * video.scaling * video.blt.dest.scale, video.blt.dest.y * video.scaling * video.blt.dest.scale,
        video.blt.size.x * video.scaling * video.blt.dest.scale, video.blt.size.y * video.scaling * video.blt.dest.scale);
}

function VideoPixel(data) {
    var video = io.video;
    if (video.color[video.frameBuffer] != data) {
        video.color[video.frameBuffer] = data;
        video.ctx[video.frameBuffer].fillStyle = "rgba(" + ((video.color[video.frameBuffer] & 0xFF0000) >>> 16) + "," +
            ((video.color[video.frameBuffer] & 0xFF00) >>> 8) + "," +
            (video.color[video.frameBuffer] & 0xFF) + "," +
            ((video.color[video.frameBuffer] & 0xFF000000) >>> 24) + ")";
    }

    video.ctx[video.frameBuffer].fillRect(video.x * 2, video.y * 2, 2, 2);
}

function VideoData(data) {
    var video = io.video;
    var pixelArray = video.imageData[video.frameBuffer].data;//(data >>> 8) | ((data & 0xFF)<<24);
    
    var index = ((video.y * video.resolution.x) + video.x) * 4;
    pixelArray[index++] = (data & 0xFF000000) >>> 24;
    pixelArray[index++] = (data & 0xFF0000) >>> 16;
    pixelArray[index++] = (data & 0xFF00) >>> 8;
    pixelArray[index++]  = data & 0xFF;
}

function VideoSaveData(data) {
    var video = io.video;
    var ctx = video.ctx[video.frameBuffer];
    var imageData = video.imageData[video.frameBuffer];
    ctx.putImageData(imageData, 0, 0);
    /*var pixelData = imageData.data;
    for (var i = 0; i < pixelData.length; i+=4) {
        pixelData[i] = 0;
        pixelData[i+1] = 0;
        pixelData[i+2] = 0;
        pixelData[i+3] = 0xFF;
    }*/
}

function VideoLoadData(data) {
    var video = io.video;
    var ctx = video.ctx[video.frameBuffer];
    video.imageData[video.frameBuffer] = ctx.getImageData(0, 0, video.resolution.x, video.resolution.y);
    
}


function VideoRect(data) {
    var video = io.video;
    if (video.color[video.frameBuffer] != data) {
        video.color[video.frameBuffer] = data;
        video.ctx[video.frameBuffer].fillStyle = "rgba(" + ((video.color[video.frameBuffer] & 0xFF0000) >>> 16) + "," +
            ((video.color[video.frameBuffer] & 0xFF00) >>> 8) + "," +
            (video.color[video.frameBuffer] & 0xFF) + "," +
            ((video.color[video.frameBuffer] & 0xFF000000) >>> 24) + ")";
    }

    video.ctx[video.frameBuffer].fillRect(video.x * 2, video.y * 2, video.width * 2, video.height * 2);
}

function VideoAddressX(data) {
    io.video.x = data;
}

function VideoAddressY(data) {
    io.video.y = data;
}

function VideoWidth(data) {
    io.video.width = data;
}

function VideoHeight(data) {
    io.video.height = data;
}

function ConsoleWrite(data) {
    if (c === 0) {
        return;
    }

    c = String.fromCharCode(c);

    if (c !== '\n') {
        io.consoleBuffer.push(c);
    } else {
        var args = ["'" + io.consoleBuffer.join('') + "'"].concat(io.consoleColors);
        eval("console.log(" + args.join(",") + ")");
        io.consoleBuffer = [];
        io.consoleColors = [];
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

function StartStopWatch(data) {
    simulator.swInstructionCount = simulator.instructionCount;
    simulator.swStartTime = new Date().getTime();
}


function StopStopWatch(data) {
    simulator.swStopTime = new Date().getTime();
    var instructions = simulator.instructionCount - simulator.swInstructionCount;
    var elapsed = simulator.swStopTime - simulator.swStartTime;
    console.log("Executed " + instructions + " instructions  in " + elapsed + " ms (" + ((instructions / (elapsed / 1000)) / 1000000) + " MIPS)");
}

function GetStopWatchElapsed() {
    return simulator.swStopTime - simulator.swStartTime;
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
    return io.elapsedTime;
}

function FileOpen(data) {
    var filename = "";
    var c;
    for (var address = data; c !== 0; address++) {
        c = cpu.Read(address, 8);
        if (c !== 0) {
            filename += String.fromCharCode(c);
        }
    }
    
    io.file.files[io.file.fd] = {status : 0};
    var file = io.file.files[io.file.fd];
    
    var gdfs = new GDFileSystem().done(function() {
           this.readId(filename, false).done(function(file, fileData) {
               file.data = fileData;
               file.dataView = new DataView(file.data);
               file.fp = 0;
               file.status = 1;
           });
        });
}

function FileFD(data) {
    io.file.fd = data;
}

function FileStatus() {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return -1;
    } else {
        return file.status;
    }
}

function FileRead() {
    var file = io.file.files[io.file.fd];
    if (file === undefined) {
        return -1;
    }
    
    var fp = file.fp;
    
    if (fp >= file.data.byteLength) {
        return -1;
    } else {
        var c = file.dataView.getUint8(fp++);
        io.file.files[io.file.fd].fp = fp;
        return c>>>0;
    }
}

function FileClose() {
    var file = io.file.files[io.file.fd];
    
    if (file !== undefined) {
        io.file.files[io.file.fd] = undefined;
        return 0;
    } else {
        return -1;
    }
}

function SetupPeripheral() {
    io.peripheral = [];

    // simulator.stop
    io.peripheral.push(SimulatorStop);

    // simulator.yield
    io.peripheral.push(SimulatorYield);

    // startStopWatch
    io.peripheral.push(StartStopWatch);

    // stopStopWatch
    io.peripheral.push(StopStopWatch);

    // simulator,stopWatchElapsed
    io.peripheral.push(GetStopWatchElapsed);

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

    // frameBuffer
    io.peripheral.push(SetFrameBuffer);

    // videoAddressX
    io.peripheral.push(VideoAddressX);

    // videoAddressY
    io.peripheral.push(VideoAddressY);

    // videoWidth
    io.peripheral.push(VideoWidth);

    // videoHeight
    io.peripheral.push(VideoHeight);

    // videoPixel
    io.peripheral.push(VideoPixel);

    // videoRect
    io.peripheral.push(VideoRect);

    // videoData
    io.peripheral.push(VideoData);

    //videoSaveData
    io.peripheral.push(VideoSaveData);

    //videoLoadData
    io.peripheral.push(VideoLoadData);
    
    // bltSrc
    io.peripheral.push(BltSrc);

    // bltDest
    io.peripheral.push(BltDest);

    // bltSize
    io.peripheral.push(BltSize);

    // bltFrameBuffers
    io.peripheral.push(BltFrameBuffers);

    // bltFrameBufferScaling
    io.peripheral.push(SetFrameBufferScaling);

    // vblank
    io.peripheral.push(GetVBlank);

    //videoScaling
    io.peripheral.push(SetVideoScaling);

    // videoResolution
    io.peripheral.push(SetVideoResolution);

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
    
    io.peripheral.push(FileStatus);
    
    io.peripheral.push(FileRead);
    
    io.peripheral.push(FileClose);
    
    
}

SetupPeripheral();