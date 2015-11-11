/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */
 
function GetChecksum() {
    if (GetChecksum.prototype.instance === undefined) {
        GetChecksum.prototype.instance = new Checksum(); 
    }
    return GetChecksum.prototype.instance;
}

function Checksum() 
{
    this.checksumAddresses = [FromHex("FFB80"), FromHex("7FB80")];        
    this.bitMask = FromHex("5AA5A55A");
    this.descriptorSize = 12;
    this.numPages = 16;
}

Checksum.prototype.SumPage = function(map, startAddress, endAddress) {
    var checksum = 0;
        
    for (var i = startAddress; i < endAddress; i+=4) {
        checksum += map.GetInt32(i);
    }

    return parseInt(this.bitMask - checksum, 10);
};

Checksum.prototype.WriteChecksum = function(map) {
    if (map.checksumStartAddress === undefined) {
        return false;
    }

    var endAddress = map.checksumStartAddress + (this.numPages*this.descriptorSize);
    for (var i = map.checksumStartAddress; i < endAddress; i+=this.descriptorSize) {
        var checksum = this.SumPage(map, map.GetUint32(i),  map.GetUint32(i+4));
        map.SetUint32(i+8, checksum);        
    }
};

Checksum.prototype.TestChecksum = function(map, startAddress) {
    var endAddress = startAddress + (this.numPages*this.descriptorSize);
    for (var i = startAddress; i < endAddress; i+=this.descriptorSize) {
        var pageEndAddress = map.GetUint32(i+4);
        if (pageEndAddress >= map.mapData.byteLength) {
            return false;
        }
        checksum = this.SumPage(map, map.GetUint32(i), pageEndAddress) >>> 0;
        savedChecksum = map.GetUint32(i+8, checksum);                
        if (checksum != savedChecksum) {
            return false;
        }
    }

    return true;
};

Checksum.prototype.CheckRomRaiderDisabled = function(map, startAddress) {
    
    var endAddress = startAddress + (this.numPages*this.descriptorSize);
    for (var i = startAddress; i < endAddress; i+=this.descriptorSize) {
        var start = map.GetUint32(i);
        var end = map.GetUint32(i+4);
        if (start != end) {
            return false;
        }
    }

    return true;
};

Checksum.prototype.Valid = function(map) {
    
    var valid = false;

    for (var i in this.checksumAddresses) {
        var startAddress = this.checksumAddresses[i];
        if (this.CheckRomRaiderDisabled(map, startAddress) == true) {
            map.romraiderDisabledChecksum = true;
            return false;
        }
        
        if (this.TestChecksum(map, startAddress)) {
            map.checksumStartAddress = startAddress;
            return true;
        }
    }

    return false;
};