/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function GetHexView() {

    if (GetHexView.prototype.instance == undefined) {
        GetHexView.prototype.instance = new HexView(); 
    }
    return GetHexView.prototype.instance;
}

var HexView = function () {
    
};

HexView.prototype.ActivateTab = function() {
    //if ($.trim($("#hex-viewer-placeholder").html()) == "") {
        this.Render(GetMapEdit().map);
    //}
}

HexView.prototype.Render = function (map) {
    var address = 0;
    var length = map.GetMapSize();
    var rowSize = 16;
    var rows = length / rowSize;
    var html = "";

    for (var r = 0; r < rows; r++) {
        var rowHtml = sprintf("%06X   ", address);
        
        for (var c = 0; c < rowSize; c++) {
            rowHtml += sprintf("%02X ", map.GetMapByte(address++));
        }
        
        html = html + rowHtml + "\n";        
    }    

    $("#hex-viewer-placeholder").html(html);
}