/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function GetGraphView() {

    if (GetGraphView.prototype.instance == undefined) {
        GetGraphView.prototype.instance = new GraphView(); 
    }
    return GetGraphView.prototype.instance;
}

function GraphView() {

}

GraphView.prototype.ActivateTab = function() {
    GetLogView().Graph();
}