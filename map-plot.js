function GetMapPlot() {

    if (GetMapPlot.prototype.instance == undefined) {
        GetMapPlot.prototype.instance = new MapPlot(); 
    }
    return GetMapPlot.prototype.instance;
}

function MapPlot() {

}

MapPlot.prototype.ActivateTab = function() {
    this.log2d = false;
    var _this = this;
    var table = GetMapEdit().CurrentTable();
    $("#table-graph-placeholder").html("");
    $("#table-graph-placeholder").off("click")
    $("#table-graph-placeholder").on("click", function() {
        if (table.type == "2D") {
            _this.log2d = !_this.log2d;
            _this.Graph2d(table); 
        }
    })
    if (table.type == "3D") {    
        this.Graph3d(table);    
    } else if (table.type == "2D") {
        this.Graph2d(table); 
    }         
}

MapPlot.prototype.Graph2d = function(table) {

    var data = [];

    data.push({ 
        type: "line",
        dataPoints : []
    });
    
    
    for (var d in table.data) {
        if (this.log2d) {
            data[0].dataPoints.push(
            {   
                x: log10(parseFloat(table.yAxis.data[d].display)),
                y: log10(parseFloat(table.data[d].display))
            });
        } else {
            data[0].dataPoints.push(
            {   
                x: parseFloat(table.yAxis.data[d].display),
                y: parseFloat(table.data[d].display)
            });
        }
    }


    var chart = new CanvasJS.Chart("table-graph-placeholder",
    {
      zoomEnabled: true,
      title : {
           
      },
      axisX:{
        title: table.yAxis.name + " (" + table.yAxis.scaling.units + ")"
      },
      
      axisY :{
        title: table.scaling.units,
        includeZero:false
      },
      
      data: data,
      
    });

    chart.render();  
}

MapPlot.prototype.Graph3d = function(table) {
    var numRows = table.xAxis.elements;
    var numCols = table.yAxis.elements;

    var tooltipStrings = new Array();

    var data = {
        values: [],
        getNumberOfRows: function () {
            return numRows;
        },
        getNumberOfColumns: function () {
            return numCols;
        },
        getFormattedValue: function (i, j) {
            return this.values[i][j];
        }
    };

    var d = 360 / numRows;
    var idx = 0;

    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;

    for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numCols; j++) {
            var value = table.data[j][i].value;
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
    }
 
    for (var i = 0; i < numRows; i++) {
        data.values.push([]);
        for (var j = 0; j < numCols; j++) {            
            var value = table.data[numCols - j - 1][i].value;            
            data.values[i].push((value - min) / (max - min));
            tooltipStrings[idx] = value;
            idx++;
        }
    }

    greg.ross.visualisation.JSSurfacePlot.DEFAULT_SCALE = 300;
    greg.ross.visualisation.JSSurfacePlot.DEFAULT_Z_OFFSET = -0.1;
    var surfacePlot = new greg.ross.visualisation.SurfacePlot(document.getElementById("table-graph-placeholder"));
    

    // Don't fill polygons in IE. It's too slow.
    var fillPly = true;

    // Define a colour gradient.
    var colour1 = { red: 0, green: 0, blue: 255 };
    var colour2 = { red: 0, green: 255, blue: 255 };
    var colour3 = { red: 0, green: 255, blue: 0 };
    var colour4 = { red: 255, green: 255, blue: 0 };
    var colour5 = { red: 255, green: 0, blue: 0 };
    var colours = [colour1, colour2, colour3, colour4, colour5];

    //colours = _colorMap.map2

    // Axis labels.
    var xAxisHeader = "X";
    var yAxisHeader = "Y";
    var zAxisHeader = "Z";

    var options = {
        xPos: 0, yPos: 0, width: $("#table-graph-placeholder").width(), height: parseInt($("#table-graph-placeholder").width()*0.75), colourGradient: colours,
        fillPolygons: fillPly, tooltips: tooltipStrings, xTitle: xAxisHeader,
        yTitle: yAxisHeader, zTitle: zAxisHeader, restrictXRotation: false
    };

    surfacePlot.draw(data, options);
}
