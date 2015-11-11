/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function GetMafScaler() {
    if (GetMafScaler.prototype.instance === undefined) {
        GetMafScaler.prototype.instance = new MafScaler(); 
    }
    return GetMafScaler.prototype.instance;
}

var MafScaler = function() {
    this.Reset();  
    this.colorMap = new Colormap($("#colormap").html());
};


MafScaler.prototype.ActivateTab = function() {
    var _this = this;
    var complete = function() {

        $("#maf-viewer-help").hide();
        $(".maf-viewer-controls").show();
        _this.RenderFuelingView();
    };
    if (GetLogView().LogsLoaded() && GetMapEdit().mapLoaded) {        
        _this.perInjectorCompensationTable = GetMapEdit().LoadTable("Per Injector Pulse Width Compensation A");
        _this.mrpTable = GetMapEdit().LoadTable(Options.mrpTaleName);
        if (_this.mrpTable !== undefined && _this.mrpTable.address === undefined) {
            GetMapEdit().CachedTableList(GetMapEdit().map).done(function() {
                _this.mrpTable = GetMapEdit().LoadTable(_this.BestTable(Options.mrpTaleName));
                complete();
            });
        } else {
            complete();
        }
        
    } else {
        $(".maf-viewer-controls").hide();
        $("#maf-viewer-help").show();
    }
    
    GetGui().Ready();
};

MafScaler.prototype.Reset = function() {
    if (this.rendered) {
        $("#maf-chart").empty();
        $("#maf-error-scatter-chart").empty();
        $("#fueling-error-scatter-chart").empty();
        $("#maf-table-placeholder").empty();
        $("#corrected-maf-table-placeholder").empty();
        $("#injector-scale-placeholder").empty();
    }
    this.rendered = false;
    this.smoothed = false;
    this.fuelingTargetColumnName = "Primary Open Loop Fueling Target";
    this.fuelingErrorColumnName = "Open Loop Fueling Error (%)";
    this.closedLoopFuelingErrorColumnName = "Closed Loop Fueling Error (%)";
    this.fuelCCColumnName = "Fuel CC";
    this.calcFuelCCColumnName = "Calculated Fuel CC";
    this.calculatedClosedLoopFuelingTargetColumnName = "Calculated Closed Loop Fueling Target";
    this.estimatedAFRColumnName = "Estimated AFR";
    this.scatterData = [];
    this.loadCompScatterData = [];
    this.perInjectorScatterData = [];
    this.fuelCCScatterData = [];
    this.buckets = {};
    this.loadCompBuckets = {};
    this.loadCompAverages = {};
    this.perInjectorBuckets = {};
    this.perInjectorAverages = {};
    this.averages = [];
    this.loadCompensationMaxRpm = 4700;
};

function log10(val) {
  return Math.log(val) / Math.LN10;
}

MafScaler.prototype.RenderMafChart = function(tables) {

    var data = [];

    for (var t in tables) {
        var dataPoints = [];

        for (var d in tables[t].data) {
            dataPoints.push(
                {   
                    //x: log10(parseFloat(tables[t].yAxis.data[d].display)),
                    //y: log10(parseFloat(tables[t].data[d].display))
                    x: parseFloat(tables[t].yAxis.data[d].display),
                    y: parseFloat(tables[t].data[d].display)
                });
        }
        data.push({ 
            type: "line",
            markerType: "none",
            showInLegend: true,
            name: tables[t].name,
            dataPoints : dataPoints
        });
    }


    var chart = new CanvasJS.Chart("maf-chart",
    {
      zoomEnabled: true,
      title : {
           
      },
      axisX:{
        title: tables[0].yAxis.name + " (" + tables[0].yAxis.scaling.units + ")"
      },
      
      axisY :{
        title: tables[0].scaling.units,
        includeZero:false
      },
      
      data: data,
      
    });

    chart.render();  
};

MafScaler.prototype.RenderErrorScatter = function(id, nameX, nameY, points, averages, positiveDeviation, negativeDeviation) {

    var config = {
            title:{
                //text: "Import Cost Impact on Business",      
                //fontFamily: "arial black",
                //fontColor: "DarkSlateGrey"
            },
            axisX: {
                title: nameX,
                titleFontSize: 14,
                labelFontSize: 12
                //titleFontFamily: "arial"

            },
            axisY:{
                title: nameY,
                //titleFontFamily: "arial",
                //valueFormatString:"0 USD",
                titleFontSize: 14,
                labelFontSize: 12
            },

            data: [
                {        
                    type: "scatter",  
                    dataPoints: points
                },
                {        
                    type: "line",  
                    markerType: "none",
                    dataPoints: averages
                }
            ]
        };
        
    if (typeof(positiveDeviation) != "undefined") {
        config.data.push(
            {        
                type: "line",  
                markerType: "none",
                dataPoints: positiveDeviation
            });
    }
    
    if (typeof(negativeDeviation) != "undefined") {
    config.data.push(
        {        
            type: "line",  
            markerType: "none",
            dataPoints: negativeDeviation
        });
    }
    
    var chart = new CanvasJS.Chart(id, config);
        

    chart.render();
};

MafScaler.prototype.GetTableIndex = function(table, x) {
    for (var i in table.yAxis.data) {
        if (table.yAxis.data[i].display == x) {
            return i;
        }
    }

    return undefined;
};


MafScaler.prototype.RenderErrorScatterChart = function() {
    var data = [];
    for (var s in this.scatterData) {
        var b = this.BestBucket(this.scatterData[s].x);        
        if (this.buckets[b].length > Options.loadCompensationMinSamples) {
            if (this.scatterData[s].type == "closedLoop") {
                data.push({ x: this.scatterData[s].x, y: this.scatterData[s].y, markerColor: "rgba(58,135,173, 0.55)"});
            } else {
                data.push({ x: this.scatterData[s].x, y: this.scatterData[s].y, markerColor: "rgba(58,0,173, 0.55)"});
            }
        } else {
            data.push({ x: this.scatterData[s].x, y: this.scatterData[s].y, markerColor: "rgba(255, 0, 0, 0.25)"});
        }
    }
    this.RenderErrorScatter("maf-error-scatter-chart", Options.mafSensorVoltageColumnName, "Fuel Error (%)", data, this.averages);        
};

MafScaler.prototype.RenderFuelingErrorScatterChart = function() {
    var column = $("#fueling-error-scatter-chart-select").val();
    var data = [];
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    for (var s in this.scatterData) {
        var value = parseFloat(this.scatterData[s].row[this.scatterData[s].header.indexOf(column)]);
        if (value > max) {
                max = value;
        }
        if (value < min) {
            min = value;
        }
        data.push({ x: value, y: this.scatterData[s].y, markerColor: "rgba(58,135,173, 0.55)"});
    }
    
    var b, buckets = {};
    
    var step = (max-min)/50;
    
    for (var x = min; x < max; x = x + step) {
        buckets[x] = [];
    }
    
    for (s in this.scatterData) {
        b = this.BestBucket(this.scatterData[s].row[this.scatterData[s].header.indexOf(column)], buckets);        
        buckets[b].push(this.scatterData[s].y);     
    }
    
    var averages = [];
    var positionDeviation = [];
    var negativeDeviation = [];

    for (b in buckets) {
        //average = this.AverageBucket(buckets[b], true);
        var stats = this.BucketStats(buckets[b]);
        if (stats !== undefined) {
            var average = stats.mean;
            if (!isNaN(average)) {
                averages.push( { y: average, x: parseFloat(b)});
            }
            average = stats.mean + stats.deviation;
            if (!isNaN(average)) {
                positionDeviation.push( { y: average, x: parseFloat(b)});
            }
            average = stats.mean - stats.deviation;
            if (!isNaN(average)) {
                negativeDeviation.push( { y: average, x: parseFloat(b)});
            }
        }
    }
    
    this.RenderErrorScatter("fueling-error-scatter-chart", "Randon Column", "Fuel Error (%)", data, averages, positionDeviation, negativeDeviation);        
};

MafScaler.prototype.RenderLoadCompErrorChart = function() {
    if (this.mrpTable !== undefined) {
        var html = "<table class='table table-bordered table-condensed' ><tr><td></td>";       
        this.mrpTable.xAxis.data.forEach(function(x) {
            html += "<td>" + x.display + "</td>";    
        });
         
        html += "</tr>";
    
        var _this = this, x;
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        
        var check = function(axisVal) {                        
            var y = parseFloat(axisVal.display);
            var value = _this.loadCompAverages[x][y];
            if (value > max) {
                    max = value;
            }
            if (value < min) {
                min = value;
            }
        };
        
        for (x in this.loadCompAverages) {
            this.mrpTable.xAxis.data.forEach(check);
        }     
    
    
        var step;
    
        if (Math.abs(max - min) < 0.00000001) {
            step = 1;
        } else {
            step = (this.colorMap.length - 1) / (max - min);
        }
        
        var render = function(axisVal) {            
            y = parseFloat(axisVal.display);
            var alpha = (_this.loadCompBuckets[x][y].length/averageBucketSize);
            var color = 255;
            var value = _this.loadCompAverages[x][y];
            var index = Math.floor((value - min) * step);            
            color = _this.colorMap.map[index];
            var extraClass = "";
            if (_this.loadCompBuckets[x][y].length >= parseInt(Options.loadCompensationMinSamples, 10)) {
            } else {
                extraClass="update-ignore";
            }
            html += "<td class='"+extraClass+"' style='opacity: "+alpha+"; background-color: "+color+"' title='"+_this.loadCompBuckets[x][y].length+" " + alpha + "'>" + sprintf("%0.2f", value) + "</td>";
        };
    
        for (x in this.loadCompAverages) {
            html += "<tr><td>"+x+"</td>";
            this.mrpTable.xAxis.data.forEach(render);
            html += "</tr>";    
       }
       $("#rpm-error-scatter-chart").html(html);
    }
};

MafScaler.prototype.RenderPerInjectorErrorChart = function() {
    if (this.perInjectorCompensationTable !== undefined) {
        var html = "<table class='table table-bordered table-condensed' ><tr><td></td>";       
        this.perInjectorCompensationTable.xAxis.data.forEach(function(x) {
            html += "<td>" + x.display + "</td>";    
        });
         
        html += "</tr>";
    
        var _this = this, x;
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        
        var check = function(axisVal) {                        
            var y = parseFloat(axisVal.display);
            var value = _this.perInjectorAverages[x][y];
            if (value > max) {
                    max = value;
            }
            if (value < min) {
                min = value;
            }
        };
        
        for (x in this.perInjectorAverages) {
            this.perInjectorCompensationTable.xAxis.data.forEach(check);
        }     
    
    
        var step;
    
        if (Math.abs(max - min) < 0.00000001) {
            step = 1;
        } else {
            step = (this.colorMap.length - 1) / (max - min);
        }
        
        var render = function(axisVal) {            
            y = parseFloat(axisVal.display);
            var alpha = (_this.perInjectorBuckets[x][y].length/perInjectorAverageBucketSize);
            var color = 255;
            var value = _this.perInjectorAverages[x][y];
            var index = Math.floor((value - min) * step);            
            color = _this.colorMap.map[index];
            var extraClass = "";
            if (_this.perInjectorBuckets[x][y].length >= parseInt(Options.loadCompensationMinSamples, 10)) {
            } else {
                extraClass="update-ignore";
            }
            html += "<td class='"+extraClass+"' style='opacity: "+alpha+"; background-color: "+color+"' title='"+_this.perInjectorBuckets[x][y].length+" " + alpha + "'>" + sprintf("%0.2f", value) + "</td>";
        };
    
        for (x in this.perInjectorAverages) {
            html += "<tr><td>"+x+"</td>";
            this.perInjectorCompensationTable.xAxis.data.forEach(render);
            html += "</tr>";    
       }
       $("#per-injector-error-scatter-chart").html(html);
    }
};

MafScaler.prototype.FindInjectorLine = function() {
    var data = [];
    var results = [];
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;
    
    for (var d in this.fuelCCScatterData) {
        data.push(new Pair(this.fuelCCScatterData[d].x, this.fuelCCScatterData[d].y));            
        if (this.fuelCCScatterData[d].x < min) {
            min = this.fuelCCScatterData[d].x;
        }
        if (this.fuelCCScatterData[d].x > max) {
            max = this.fuelCCScatterData[d].x;
        }
    }

    var result = matf.process_data(data,1);
    var p = result[0];

    for (var x = 0; x < max; x += 0.1) {        
        results.push({x: x, y: matf.regress(x, p)});
    }

    return results;
};


MafScaler.prototype.SmoothAverages = function() {
    var data = [];
    var smoothed = clone(this.averages);

    for (var d in this.averages) {
        data.push(new Pair(this.averages[d].x, this.averages[d].y));            
    }

    var result = matf.process_data(data,parseInt(Options.errorSmoothingFactor, 10));
    var p = result[0];

    for (d in this.averages) {        
        if (this.averages[d].y == 0) {
            smoothed[d].y = 0;   // Not sure about this one                 
        } else {
            smoothed[d].y = matf.regress(this.averages[d].x, p);                    
        }
    }

    return smoothed;
};

MafScaler.prototype.ApplyCorrections = function() {
    
    for (var i in this.averages) {
        var index = this.GetTableIndex(this.correctedMafTable, this.averages[i].x);
        var value = this.correctedMafTable.data[index].value;
        var correction = this.averages[i].y / 100;
        var correctedValue = value + (value * correction); 

        //if (parseFloat(this.selectedMafTable.yAxis.data[i].display) > 1.2) { //TODO: add option
            this.correctedMafTable.data[index].value = correctedValue;
            this.correctedMafTable.data[index].display = sprintf(this.correctedMafTable.scaling.format, correctedValue);
        //}

    }
};

MafScaler.prototype.SmoothCurve = function() {

    var data = [];
    var table = this.correctedMafTable;
    var smoothed = this.smoothedMafTable;

    for (var d in table.data) {
        data.push(new Pair(parseFloat(table.yAxis.data[d].display), parseFloat(table.data[d].display)));
            
    }
    
    var result = matf.process_data(data,parseInt(Options.smoothingFactor, 10));
    var p = result[0];


    for (d in table.data) {
        var x = parseFloat(smoothed.yAxis.data[d].display);
        if (x > parseFloat(Options.mafSmoothAbove)) {
            smoothed.data[d].value = matf.regress(x, p);
            smoothed.data[d].display = sprintf(smoothed.scaling.format, smoothed.data[d].value);
        } else {
            smoothed.data[d].value = table.data[d].value;
            smoothed.data[d].display = table.data[d].display;
        }
    }
};

MafScaler.prototype.RenderMaf = function() {
    RenderTemplate("#table-2D-template", this.selectedMafTable, "#corrected-maf-table-placeholder");
    this.RenderMafChart([this.mafTable, this.selectedMafTable]);
};

MafScaler.prototype.RenderInjectorScalingErrorScatter = function() {

    var injectorLine = this.FindInjectorLine();
    this.RenderErrorScatter("injector-scale-placeholder", "Pulse Width (ms)", "Fuel CC", this.fuelCCScatterData, injectorLine);        
    
    var l = injectorLine.length-1;
    
    var scale = sprintf("%0.2f", ((injectorLine[l].y - injectorLine[0].y)/(injectorLine[l].x - injectorLine[0].x))*1000*60);
    $("#injector-scaling").html(scale);
};

MafScaler.prototype.RenderFuelingView = function() {
    if (GetLogView().LogsLoaded()) {
        var map = GetMapEdit().map;
        if (!this.rendered) {
            this.mafTable = GetMapEdit().LoadTable(Options.mafTableName);
            this.correctedMafTable =  clone(this.mafTable);
            this.correctedMafTable.name += " Corrected";
            this.smoothedMafTable =  clone(this.mafTable);
            this.smoothedMafTable.name += " Corrected (Smoothed)";
            this.selectedMafTable = this.correctedMafTable;
            RenderTemplate("#table-2D-template", this.mafTable, "#maf-table-placeholder");
            this.CollectResults();
            
            this.ApplyCorrections();
            this.SmoothCurve();
            this.RenderMaf();
            this.RenderErrorScatterChart();
            this.RenderLoadCompErrorChart();
            this.RenderPerInjectorErrorChart();
            this.RenderInjectorScalingErrorScatter();
            this.rendered = true;
        }
    } 
};

MafScaler.prototype.ProcessLog = function(csv) {
    var errorColumn;
    var closedLoopErrorColumn;
    var mafVoltageColumn;
    var rpmColumn;
    var mprColumn;
    var fuelCCColumn;
    var calcFuelCCColumn;
    var estimatedAFRColumn;
    var pulseWidthColumn;
    var latencyColumn;
    var idcColumn;
    
    
    for (var r in csv.data) {
        if (r == 0) {
            for (var c in csv.data[r]) {
                if (csv.data[r][c] == Options.mafSensorVoltageColumnName) {
                    mafVoltageColumn = c;                    
                }
                if (csv.data[r][c] == this.fuelingErrorColumnName) {
                    errorColumn = c;                    
                }
                if (csv.data[r][c] == this.closedLoopFuelingErrorColumnName) {
                    closedLoopErrorColumn = c;                                        
                }
                if (csv.data[r][c] == Options.manifoldPressureRelativeColumnName) {
                    mprColumn = c;
                }                
                if (csv.data[r][c] == Options.engineSpeedColumnName) {
                    rpmColumn = c;
                }                
                if (csv.data[r][c] == this.fuelCCColumnName) {
                    fuelCCColumn = c;
                }
                if (csv.data[r][c] == this.calcFuelCCColumnName) {
                    calcFuelCCColumn = c;
                }
                if (csv.data[r][c] == this.estimatedAFRColumnName) {
                    estimatedAFRColumn = c;
                }
                if (csv.data[r][c] == Options.pulseWidthColumnName) {
                    pulseWidthColumn = c;
                }
                if (csv.data[r][c] == Options.latencyColumnName) {
                    latencyColumn = c;
                }
                if (csv.data[r][c] == Options.injectorDutyCycleColumnName) {
                    idcColumn = c;
                }
                
                $("#fueling-error-scatter-chart-select").append("<option>" + csv.data[r][c] + "</option>")
            }
            
            
        } else {
            var mafVoltage = csv.data[r][mafVoltageColumn];
            var error = parseFloat(csv.data[r][errorColumn]);            
            var closedLoopError = parseFloat(csv.data[r][closedLoopErrorColumn]);
            var rpm = csv.data[r][rpmColumn];
            var mpr = csv.data[r][mprColumn];
            var fuelCC = parseFloat(csv.data[r][fuelCCColumn]);
            var calcFuelCC = parseFloat(csv.data[r][calcFuelCCColumn]);
            var estimatedAFR = parseFloat(csv.data[r][estimatedAFRColumn]);
            var pulseWidth = parseFloat(csv.data[r][pulseWidthColumn]);
            var latency = latencyColumn !== undefined ? parseFloat(csv.data[r][latencyColumn]) : 0.0;
            var idc = parseFloat(csv.data[r][idcColumn]);
            //var pulseWidth = (idc * 1200) / rpm;
            
            if (!isNaN(error) && !isNaN(closedLoopError) && error != "undefined" && closedLoopError != "undefined") {
                gui.log("MafScaler.ProcessLog: Warning - Found open and closed loop errors in the same row ["+r+"] " + error + " " + closedLoopError);
            }
            if (!isNaN(error) && error !== undefined) {
                this.scatterData.push({x: parseFloat(mafVoltage), y: error, type: "openLoop", row: csv.data[r], header: csv.data[0]});            
            }

            if (!isNaN(closedLoopError) && closedLoopError !== undefined) {
                this.scatterData.push({x: parseFloat(mafVoltage), y: closedLoopError,  type: "closedLoop", row: csv.data[r], header: csv.data[0]});            
                this.loadCompScatterData.push({x: parseFloat(rpm), y: parseFloat(mpr), z: closedLoopError});
                this.perInjectorScatterData.push({x: parseFloat(rpm), y: parseFloat(pulseWidth), z: closedLoopError});                        
            }     
            
            
            if (!isNaN(fuelCC)) {
                this.fuelCCScatterData.push({x: pulseWidth, y: fuelCC});
            }
        }
    }
};

MafScaler.prototype.BestBucket = function(v, buckets) {
    var diff = Number.MAX_VALUE;
    var index = 0;
    
    var _buckets;
    if (typeof(buckets) == "undefined") {
        _buckets = this.buckets;
    } else {
        _buckets = buckets;
    }

    for (var b in _buckets) {
        var d = Math.abs(v - b) ;
        if (d < diff) {
            index = b;
            diff = d;
        }
    }

    return index;
};

MafScaler.prototype.LoadCompBestBucket = function(rpm, mrp) {
    var diff = Number.MAX_VALUE;
    var x = 0, y = 0, d = 0;

    for (var r in this.loadCompBuckets) {
         d = Math.abs(rpm - r) ;
        if (d < diff) {
            x = r;
            diff = d;
        }
    }

    diff = Number.MAX_VALUE;

    for (var m in this.loadCompBuckets[r]) {
        d = Math.abs(mrp - m) ;
        if (d < diff) {
            y = m;
            diff = d;
        }
    }

    return {x: x, y: y};    
};

MafScaler.prototype.PerInjectorBestBucket = function(rpm, pw) {
    var diff = Number.MAX_VALUE;
    var x = 0, y = 0, d = 0;

    for (var r in this.perInjectorBuckets) {
         d = Math.abs(rpm - r) ;
        if (d < diff) {
            x = r;
            diff = d;
        }
    }

    diff = Number.MAX_VALUE;

    for (var m in this.perInjectorBuckets[r]) {
        d = Math.abs(pw - m) ;
        if (d < diff) {
            y = m;
            diff = d;
        }
    }

    return {x: x, y: y};    
};


MafScaler.prototype.AverageBucket = function(bucket, filter) {
    if (filter && bucket.length > 0 && bucket.length < Options.loadCompensationMinSamples) {
        return 0.0;
    } else {
        var total = 0;
        for (var i in bucket) {
            total += bucket[i];
        }
        return total /  bucket.length;
    }
};

MafScaler.prototype.BucketStats = function(a) {
    if (a.length === 0 || a.length < Options.loadCompensationMinSamples) {
        return undefined;
    }
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for(var m, s = 0, l = t; l--; s += a[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
}
    
MafScaler.prototype.CollectResults = function() {
    
    var _this = this, x, y, i, s, b, average;
    
    for (var c in GetLogView().csvs) {
        this.ProcessLog(GetLogView().GetCsv(c));
    }

    var t = this.mafTable;

    for (i in this.mafTable.yAxis.data) {        
        this.buckets[parseFloat(this.mafTable.yAxis.data[i].display)] = [];
    }

    if (this.mrpTable !== undefined) {
        this.mrpTable.yAxis.data.forEach(function(yAxisVal) {
            var rpm = parseInt(yAxisVal.display, 10);
            _this.loadCompBuckets[rpm] = {};
            _this.loadCompAverages[rpm] = {};
            _this.mrpTable.xAxis.data.forEach(function(axisVal) {        
                var val = parseFloat(axisVal.display);
                _this.loadCompBuckets[rpm][val] = [];
                _this.loadCompAverages[rpm][val] = 0;
            });        
        });
        
        for (s in this.loadCompScatterData) {        
            x = this.loadCompScatterData[s].x;
            y = this.loadCompScatterData[s].y;
            b = this.LoadCompBestBucket(x, y);        
            this.loadCompBuckets[b.x][b.y].push(this.loadCompScatterData[s].z);     
        }
    }
    
     if (this.perInjectorCompensationTable !== undefined) {
        this.perInjectorCompensationTable.yAxis.data.forEach(function(yAxisVal) {
            var rpm = parseInt(yAxisVal.display, 10);
            _this.perInjectorBuckets[rpm] = {};
            _this.perInjectorAverages[rpm] = {};
            _this.perInjectorCompensationTable.xAxis.data.forEach(function(axisVal) {        
                var val = parseFloat(axisVal.display);
                _this.perInjectorBuckets[rpm][val] = [];
                _this.perInjectorAverages[rpm][val] = 0;
            });        
        });
        
        for (s in this.perInjectorScatterData) {        
            x = this.perInjectorScatterData[s].x;
            y = this.perInjectorScatterData[s].y;
            b = this.PerInjectorBestBucket(x, y);        
            if (this.perInjectorBuckets[b.x][b.y] !== undefined) {
                this.perInjectorBuckets[b.x][b.y].push(this.perInjectorScatterData[s].z);     
            }
        }
    }
    

    for (s in this.scatterData) {
        b = this.BestBucket(this.scatterData[s].x);        
        this.buckets[b].push(this.scatterData[s].y);     
    }

    
    
    for (b in this.buckets) {
        average = this.AverageBucket(this.buckets[b], true);
        if (!isNaN(average)) {
            this.averages.push( { y: average, x: parseFloat(b)});
        }
    }

    averageBucketSize = 0;
    var nonEmptyBuckets = 0;

    for (x in this.loadCompBuckets) {
        for (y in this.loadCompBuckets[x]) {
            average = this.AverageBucket(this.loadCompBuckets[x][y], false);
            
            if (!isNaN(average)) {                   
                if (this.loadCompBuckets[x][y].length > 0) {
                    averageBucketSize += this.loadCompBuckets[x][y].length;
                    nonEmptyBuckets++;
                }
                this.loadCompAverages[x][y] = average;                
            }
        }
    }

    averageBucketSize = averageBucketSize / nonEmptyBuckets;

    perInjectorAverageBucketSize = 0;
    nonEmptyBuckets = 0;

    for (x in this.perInjectorBuckets) {
        for (y in this.perInjectorBuckets[x]) {
            average = this.AverageBucket(this.perInjectorBuckets[x][y], false);
            
            if (!isNaN(average)) {                   
                if (this.perInjectorBuckets[x][y].length > 0) {
                    perInjectorAverageBucketSize += this.perInjectorBuckets[x][y].length;
                    nonEmptyBuckets++;
                }
                this.perInjectorAverages[x][y] = average;                
            }
        }
    }

    perInjectorAverageBucketSize = perInjectorAverageBucketSize / nonEmptyBuckets;

    if (parseInt(Options.errorSmoothingFactor, 10) > 0) {
        this.averages = this.SmoothAverages();    
    }
};

var levenshteinDistance = function(u, v) {        
        var i, j;
        var m = u.length;
        var n = v.length;
        var D = [];
        for(i = 0; i <= m; i++) {
            D.push([]);
            for(j = 0; j <= n; j++) {
                D[i][j] = 0;
            }
        }
        for(i = 1; i <= m; i++) {
            for(j = 1; j <= n; j++) {
                if (j == 0) {
                    D[i][j] = i;
                } else if (i == 0) {
                    D[i][j] = j;
                } else {
                    D[i][j] = [D[i-1][j-1] + (u[i-1] != v[j-1]), D[i][j-1] + 1, D[i-1][j] + 1].sort()[0];
                }
            }
        }
        return D[m][n];
    };

MafScaler.prototype.BestColumn = function(data, name)  { 
    var d = Number.MAX_VALUE, c;
    for (var i in data) {
        var distance = levenshteinDistance(data[i].split(" "), name.split(" "));
        if (distance < d) {
            d = distance;
            c = i;
        }
    }
    
    if (data[c] != name) {
        gui.log("MafScaler.BestColumn: Warning - Guessing " + data[c]  + " for " + name);
    }

    return c;
};

MafScaler.prototype.BestTable = function(name)  { 
    var me = GetMapEdit();

    var d = Number.MAX_VALUE, c;
    for (var i in me.tables) {
        var distance = levenshteinDistance(me.tables[i].name.split(" "), name.split(" "));        
        if (distance < d) {
            d = distance;
            c = i;
        }
    }

    if (me.tables[c].name != name) {
        gui.log("MafScaler.BestTable: Warning - Guessing " + me.tables[c].name  + " for " + name);
    }

    return me.tables[c].name;
};

MafScaler.prototype.MafScale = function(map, csv) {
    var tipInWarning = false, afLearning3Warning = false, afCorrection3Warning = false;
    var table = map.LoadTable(Options.targetFuelingMap);
    
    var afLearningColumn;
    var afCorrectionColumn;
    var afLearning3Column;
    var afCorrection3Column;
    var coolantColumn;
    var loadColumn;    
    var speedColumn;
    var afrColumn;
    var oemAfrColumn;
    var throttleColumn;
    var closedLoopFuelingTargetColumn;
    var clOlColumn;
    var tipInThrottleColumn;
    var fuelingTargetColumn;
    var fuelingErrorColumn;
    var closedLoopFuelingErrorColumn;
    var mafColumn;
    var mafSensorVoltageColumn;
    var iatColumn;
    var fuelCCColumn;
    var pulseWidthColumn;
    var latencyColumn;

    for (var r in csv.data) {
        if (r == 0) { // no === here!
            if (csv.data[r].indexOf(this.fuelingTargetColumnName) == -1) {
                csv.data[r].push(this.fuelingTargetColumnName);
            }
            if (csv.data[r].indexOf(this.fuelingErrorColumnName) == -1) {
                csv.data[r].push(this.fuelingErrorColumnName);
            }
            if (csv.data[r].indexOf(this.closedLoopFuelingErrorColumnName) == -1) {
                csv.data[r].push(this.closedLoopFuelingErrorColumnName);
            }
            if (csv.data[r].indexOf(this.fuelCCColumnName) == -1) {
                csv.data[r].push(this.fuelCCColumnName);
            }
            if (csv.data[r].indexOf(this.fuelCCColumnName) == -1) {
                csv.data[r].push(this.fuelCCColumnName);
            }
            if (csv.data[r].indexOf(this.calcFuelCCColumnName) == -1) {
                csv.data[r].push(this.calcFuelCCColumnName);
            }
            if (csv.data[r].indexOf(this.estimatedAFRColumnName) == -1) {
                csv.data[r].push(this.estimatedAFRColumnName);
            }
            
            for (var c in csv.data[r]) {
                if (csv.data[r][c] == Options.closedLoopFuelingTargetColumnName) {
                    closedLoopFuelingTargetColumn = c;                    
                }
                if (csv.data[r][c] == Options.afCorrectionColumnName) {
                    afCorrectionColumn = c;                    
                }
                if (csv.data[r][c] == Options.afLearningColumnName) {
                    afLearningColumn = c;                    
                }
                if (csv.data[r][c] == Options.engineLoadColumnName) {
                    loadColumn = c;                    
                }
                if (csv.data[r][c] == Options.afCorrection3ColumnName) {
                    afCorrection3Column = c;                    
                }
                if (csv.data[r][c] == Options.afLearning3ColumnName) {
                    afLearning3Column = c;                    
                }
                if (csv.data[r][c] == Options.engineSpeedColumnName) {
                    speedColumn = c;
                }
                if (csv.data[r][c] == Options.afrColumnName) {
                    afrColumn = c;
                }
                if (csv.data[r][c] == Options.oemAfrColumnName) {
                    oemAfrColumn = c;
                }
                 if (csv.data[r][c] == Options.coolantTempColumnName) {
                    coolantColumn = c;
                }
                if (csv.data[r][c] == Options.throttleColumnName) {
                    throttleColumn = c;
                }
                if (csv.data[r][c] == Options.clOlFuelingColumnName) {                    
                    clOlColumn = c;
                }
                if (csv.data[r][c] == Options.tipInThrottleColumnName) {
                    tipInThrottleColumn = c;
                }
                if (csv.data[r][c] == this.fuelingErrorColumnName) {
                    fuelingErrorColumn = c;
                }
                if (csv.data[r][c] == this.closedLoopFuelingErrorColumnName) {
                    closedLoopFuelingErrorColumn = c;
                }
                if (csv.data[r][c] == this.fuelingTargetColumnName) {
                    fuelingTargetColumn = c;
                }
                if (csv.data[r][c] == Options.mafColumnName) {
                    mafColumn = c;
                }
                if (csv.data[r][c] == Options.mafSensorVoltageColumnName) {
                    mafSensorVoltageColumn = c;
                }
                if (csv.data[r][c] == Options.intakeAirTempColumnName) {
                    iatColumn = c;
                }
                if (csv.data[r][c] == Options.pulseWidthColumnName) {
                    pulseWidthColumn = c;
                }
                if (csv.data[r][c] == Options.latencyColumnName) {
                    latencyColumn = c;
                }
                if (csv.data[r][c] == this.fuelCCColumnName) {
                    fuelCCColumn = c;
                }
                if (csv.data[r][c] == this.calcFuelCCColumnName) {
                    calcFuelCCColumn = c;
                }
                if (csv.data[r][c] == this.estimatedAFRColumnName) {
                    estimatedAFRColumn = c;
                }
            }
            
            if ( pulseWidthColumn === undefined) {
                pulseWidthColumn = this.BestColumn(csv.data[r], Options.pulseWidthColumnName);
            }

            if (closedLoopFuelingTargetColumn === undefined) {
                closedLoopFuelingTargetColumn = this.BestColumn(csv.data[r], Options.closedLoopFuelingTargetColumnName);
                //gui.log("MafScaler.MafScale: Warning - Guessing " + csv.data[r][closedLoopFuelingTargetColumnName] + " for CL fueling target");
            }
            if (afCorrectionColumn === undefined) {
                afCorrectionColumn = this.BestColumn(csv.data[r], Options.afCorrectionColumnName);
                //gui.log("MafScaler.MafScale: Warning - Guessing " + csv.data[r][afCorrectionColumn] + " for af correction");
            }
            if (afLearningColumn === undefined) {
                afLearningColumn = this.BestColumn(csv.data[r], Options.afLearningColumnName);
                //gui.log("MafScaler.MafScale: Warning - Guessing " + csv.data[r][afLearningColumn] + " for af learning");
            }
            if (loadColumn === undefined) {
                loadColumn = this.BestColumn(csv.data[r], Options.engineLoadColumnName);
                //gui.log("MafScaler.MafScale: Warning - Guessing " + csv.data[r][loadColumn] + " for engine load");
            }
            if (clOlColumn === undefined) {
                clOlColumn = this.BestColumn(csv.data[r], Options.clOlFuelingColumnName);
                //gui.log("MafScaler.MafScale: Warning - Guessing " + csv.data[r][clOlColumn] + " for CL/OL fueling");
            }
           
        } else {
            if (isNaN(csv.data[r][0])) {
                  gui.log("MafScaler.MafScale: Warning - Log restart detected");
            } else {
                var load = csv.data[r][loadColumn];
                var speed = parseFloat(csv.data[r][speedColumn]);
                var afr = parseFloat(csv.data[r][afrColumn]);
                var oemAfr = parseFloat(csv.data[r][oemAfrColumn]);
                var clOl = csv.data[r][clOlColumn];
                var tipInThrottle = parseFloat(csv.data[r][tipInThrottleColumn]);
                var coolantTemp = parseFloat(csv.data[r][coolantColumn]);
                var maf = parseFloat(csv.data[r][mafColumn]);
                var mafV = parseFloat(csv.data[r][mafSensorVoltageColumn]);
                var iat = parseFloat(csv.data[r][iatColumn]);
    
                var afCorrection = csv.data[r][afCorrectionColumn];
                var afLearning = csv.data[r][afLearningColumn];
                var afCorrection3 = csv.data[r][afCorrection3Column];
                var afLearning3 = csv.data[r][afLearning3Column];
                var closedLoopFuelingTarget = csv.data[r][closedLoopFuelingTargetColumn];
                
                var error, target = parseFloat(map.Get3D(table, load, speed).toFixed(2));
                
                var pulseWidth = parseFloat(csv.data[r][pulseWidthColumn]);
                var latency = latencyColumn !== undefined ? parseFloat(csv.data[r][latencyColumn]) : 0.0;
    
                csv.data[r][fuelingTargetColumn]= sprintf("%.2f", target);
                
                if (isNaN(afCorrection3)) {
                    if (!afCorrection3Warning) {
                        //gui.log("MafScaler.MafScale: Warning - No AF Correction #3 data");
                        afCorrection3Warning = true;
                    }
                    afCorrection3 = 0.0;
                }
                if (isNaN(afLearning3)) {
                    if (!afLearning3Warning) {
                        //gui.log("MafScaler.MafScale: Warning - No AF Learning #3 data");
                        afLearning3Warning = true;
                    }
                    afLearning3 = 0.0;
                }
                if (isNaN(tipInThrottle)) {
                    if (!tipInWarning) {
                        gui.log("MafScaler.MafScale: Warning - No tip in data");
                        tipInWarning = true;
                    }
                    tipInThrottle = 0.0;
                }
    
    
                
                
                if ((Options.minCoolantTemp == 0 && Options.maxInletAirTemp == 0) || coolantTemp > Options.minCoolantTemp && iat < Options.maxInletAirTemp ) 
                {
                    if (clOl == "10"
                    //&&  afr <= 13.0 && afr >= 8.5) {                            
                    && csv.data[r][throttleColumn] >= 30 && afr <= 13.0 && afr >= 8.5) {                            
                    
                        error = 100.0 * ((afr / target) - 1.0);                
                        csv.data[r][fuelingErrorColumn] = sprintf("%.2f", 100 * ((afr / target) - 1.0));
                        csv.data[r][closedLoopFuelingErrorColumn] = undefined;
                    } else { 
                        if (clOl == "8" && tipInThrottle === 0.0 && oemAfr <= 16.0 && oemAfr >= 13.0) 
                        {
                            error = parseFloat(100.0 * ((oemAfr / closedLoopFuelingTarget) - 1.0)) + parseFloat(afCorrection) + parseFloat(afLearning) + parseFloat(afLearning3) + parseFloat(afCorrection3);
                            csv.data[r][closedLoopFuelingErrorColumn] = sprintf("%.2f", error);
                            csv.data[r][fuelingErrorColumn] = undefined;
                            
                
                        }
                    }
                    
                    if (clOl == "8" && oemAfr <= 16.0 && oemAfr >= 13.0 && speed < 4500.0 && maf > 0 && maf < 100 && tipInThrottle === 0.0) { // todo mafv/dt
                         csv.data[r][fuelCCColumn] = (load / 2 / oemAfr * 1000 / 748).toString();
                    } else {
                        csv.data[r][fuelCCColumn] = undefined;
                    }
                    
                }
                
                
                var cc = (950/1000/60) * pulseWidth;
                
                if (clOl == "8" && cc > 0.000001) {
                    csv.data[r][calcFuelCCColumn] = ((950/1000/60) * pulseWidth).toString();
                    csv.data[r][estimatedAFRColumn] = (((100+error)/100)*((load/2)/(cc*748/1000))).toString();
                } else {
                    csv.data[r][estimatedAFRColumn] = "14.7";
                    csv.data[r][calcFuelCCColumn] = "0.0";
                }
            }
        }
    }
    
};


MafScaler.prototype.UpdateMrpMap = function() {
    
    
    var value, map = GetMapEdit().map;
    for (var y in this.mrpTable.yAxis.data) {
        for (var x in this.mrpTable.xAxis.data) {
            
            var _y = parseFloat(this.mrpTable.xAxis.data[x].display, 10);
            var _x = parseFloat(this.mrpTable.yAxis.data[y].display);
            
            
            value = this.loadCompAverages[_x][_y];
                        
            if (value !== undefined) {                            
                if (this.loadCompBuckets[_x][_y].length >= parseInt(Options.loadCompensationMinSamples, 10)) {
                    var old = parseFloat(map.GetTable3D(this.mrpTable, x, y));
                    map.UpdateTable3D(this.mrpTable, x, y, value+old) ;
                }
            }
        }
    }


    GetMapEdit().RefreshTable(Options.mrpTaleName);
    
    gui.log("MafScaler.UpdateMrpMap: Updated Load Compensation table [" + Options.mrpTaleName + "]");
};

MafScaler.prototype.UpdateMap = function() {

    for (var i in this.selectedMafTable.data) {
        //if (this.selectedMafTable.yAxis.data[i].value > 1.7) {
            GetMapEdit().map.UpdateTable2D(this.selectedMafTable, parseInt(i, 10), this.selectedMafTable.data[i].value);
    //    }
    }

     GetMapEdit().RefreshTable(Options.mafTableName);
  
    gui.log("MafScaler.UpdateMrpMap: Updated MAF Sensor Scaling table [" + Options.mafTableName + "]");
};

MafScaler.prototype.GetErrorForVoltage = function(mafVoltage) {
    var bucket = GetMafScaler().BestBucket(mafVoltage);
    var found = false;
    for (var i in this.averages) {
        if (this.averages[i].x == bucket) {
            return this.averages[i].y;
        }
    }
};

MafScaler.prototype.GetErrorForMrpRpm = function(mrp, rpm) {
    var bucket = this.LoadCompBestBucket(rpm, mrp);
    return this.loadCompAverages[bucket.x][bucket.y];
};


MafScaler.prototype.UpdateAFLearing = function() {
    var map = GetMapEdit().map;
    for (var c in GetLogView().csvs) {
        this.UpdateAFLearingToLog(map, GetLogView().GetCsv(c));
    }
    
    this.Reset();
    this.RenderFuelingView();
    
    gui.log("MafScaler.UpdateAFLearing: Updated AF Learning log column!");
};

MafScaler.prototype.UpdateAFLearingToLog = function(map, csv) {
    
    var afLearningColumn, mafSensorVoltageColumn;
    for (var r in csv.data) {

        if (r == 0) { // no === here!
            for (var c in csv.data[r]) {
                if (csv.data[r][c] == Options.afLearningColumnName) {
                    afLearningColumn = c;                    
                }
                if (csv.data[r][c] == Options.mafSensorVoltageColumnName) {
                    mafSensorVoltageColumn = c;
                }
            }
        } else {
            var voltage = csv.data[r][mafSensorVoltageColumn];
            var error = parseFloat(this.GetErrorForVoltage(voltage));
            csv.data[r][afLearningColumn] = (parseFloat(csv.data[r][afLearningColumn]) - error).toString();
        }
    }
    
    this.MafScale(map, csv);
};

MafScaler.prototype.UpdateAFLearingFromLoadComp = function() {
    var map = GetMapEdit().map;
    for (var c in GetLogView().csvs) {
        this.UpdateAFLearingFromLoadCompToLog(map, GetLogView().GetCsv(c));
    }
    
    this.Reset();
    this.RenderFuelingView();
    
    gui.log("MafScaler.UpdateAFLearingFromLoadCompToLog: Updated AF Learning log column!");
};

MafScaler.prototype.UpdateAFLearingFromLoadCompToLog = function(map, csv) {
    
    var afLearningColumn, mprColumn, rpmColumn;
    for (var r in csv.data) {

        if (r == 0) { // no === here!
            for (var c in csv.data[r]) {
                if (csv.data[r][c] == Options.afLearningColumnName) {
                    afLearningColumn = c;                    
                }
                if (csv.data[r][c] == Options.manifoldPressureRelativeColumnName) {
                    mprColumn = c;
                }                
                if (csv.data[r][c] == Options.engineSpeedColumnName) {
                    rpmColumn = c;
                }      
            }
        } else {
            var mrp = csv.data[r][mprColumn];
            var rpm = csv.data[r][rpmColumn];
            if (isNaN(mrp) || isNaN(rpm)) {
                console.log("Weirdness")
            } else {
                var error = parseFloat(this.GetErrorForMrpRpm(mrp, rpm));
                csv.data[r][afLearningColumn] = (parseFloat(csv.data[r][afLearningColumn]) - error).toString();
            }
        }
    }
    
    this.MafScale(map, csv);
};

MafScaler.prototype.ToggleScaling = function(button) {
    this.smoothed = !this.smoothed;
    if (this.smoothed) {
        this.selectedMafTable = this.smoothedMafTable;
        $(button).html("No smoothing");
    } else {
        this.selectedMafTable = this.correctedMafTable;
        $(button).html("Smooth");
    }
    
    this.RenderMaf();
};

$(document).ready(function() {
    
    $("#fueling-error-scatter-chart-select").change(function() {
         GetMafScaler().RenderFuelingErrorScatterChart();
    });
    
    $("#save-maf").click(function(e) {
        e.preventDefault();
        GetMafScaler().UpdateMap();
        GetMapEdit().ClearRenderedTable();
    });
    
    $("#save-mrp-load-compensation").click(function(e) {
        e.preventDefault();
        GetMafScaler().UpdateMrpMap();
        GetMapEdit().ClearRenderedTable();
    });

    $("#smooth-maf").click(function(e) {
        e.preventDefault();        
        GetMafScaler().ToggleScaling(this);        
    });
    
    $("#apply-maf-corrections-to-logs").click(function(e) {
         e.preventDefault();        
         GetMafScaler().UpdateAFLearing();
    });
    
    $("#apply-load-comp-corrections-to-logs").click(function(e) {
         e.preventDefault();        
         GetMafScaler().UpdateAFLearingFromLoadComp();
    });
});