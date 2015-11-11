/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */
 
function GetLogView() {

    if (GetLogView.prototype.instance === undefined) {
        GetLogView.prototype.instance = new LogView(); 
    }
    return GetLogView.prototype.instance;
}

function LogView () {   
    this.Reset();
}

LogView.prototype.ActivateTab = function() {
    if (!this.loading) {
        this.RenderLogs();
        GetGui().Ready();
    }
};

LogView.prototype.Reset = function() {
    this.csvs = {};
    this.csvsProcessed = {};
    $("#log-tabs-placeholder").empty();
    $("#log-table-placeholder").empty();
};

LogView.prototype.LogsLoaded = function() {
    return Object.keys(this.csvs).length > 0;
};

LogView.prototype.RenderLogTabs = function() {
    var source = $("#log-tabs-template").html();
    var template = Handlebars.compile(source);
    var html = template(this.csvs);
    $("#log-tabs-placeholder").html(html);
};

LogView.prototype.RenderLog = function(csv) {  
    var source = $("#log-view-template").html();
    var template = Handlebars.compile(source);
    return  template(csv);
};

LogView.prototype.NameToId = function(str)
{
    return str.replace(/[^A-Za-z0-9]*/g, '');    
};

LogView.prototype.RenderGrid = function(csv) {
    var _this = this;

    
    require(["external/slickgrid/slick.grid.min.js"], function() {
        var grid;
        var columns = [];    
        var columnFilters = {};
        
        _this.columnSelector = {};
        for (var i in csv.data[0]) {
            columns.push({
                    id: _this.NameToId(csv.data[0][i]), 
                    name: csv.data[0][i], 
                    field: _this.NameToId(csv.data[0][i])                
                });
    
            _this.columnSelector[_this.NameToId(csv.data[0][i])] = {                
                    name: csv.data[0][i], 
                    index: i,
                    selected: false
                };
        }
    
        var _options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            showHeaderRow: true,
            headerRowHeight: 30,
            explicitInitialization: true
        };
    
      var options = {
         enableColumnReorder: false,
        enableCellNavigation: true,
        showHeaderRow: true,
        headerRowHeight: 30,
        explicitInitialization: true
      };
    
        var data = [];
    
        for (var r = 1; r < csv.data.length; r++) {
            var item = { id: r};
            for (var c in columns) {
                item[columns[c].id] = csv.data[r][c];
            }
            data.push(item);
        }
    
        
        function filter(item) {
            for (var columnId in columnFilters) {
              if (columnId !== undefined && columnFilters[columnId] !== "") {
                var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                if (item[c.field] == undefined || item[c.field].indexOf(columnFilters[columnId]) == -1) {
                  return false;
                }
              }
            }
            return true;
        }
    
    
        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#log-table-placeholder", dataView, columns, options);
    
    
        dataView.onRowCountChanged.subscribe(function (e, args) {
          grid.updateRowCount();
          grid.render();
        });
    
        dataView.onRowsChanged.subscribe(function (e, args) {
          grid.invalidateRows(args.rows);
          grid.render();
        });
    
    
        $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
          var columnId = $(this).data("columnId");
          if (columnId != null) {
            columnFilters[columnId] = $.trim($(this).val());
            dataView.refresh();
          }
        });
    
        grid.onHeaderRowCellRendered.subscribe(function(e, args) {
            $(args.node).empty();
            $("<input type='text'>")
               .data("columnId", args.column.id)
               .val(columnFilters[args.column.id])
               .appendTo(args.node);
        });
    
        grid.init();
    
        dataView.beginUpdate();
        dataView.setItems(data);
        dataView.setFilter(filter);
        dataView.endUpdate();
        
        
        
        grid.onHeaderClick.subscribe(function(e,args){                
            if (_this.columnSelector[args.column.id].selected) {
                grid.updateColumnHeader(args.column.id, _this.columnSelector[args.column.id].name, _this.columnSelector[args.column.id].name);
            } else {
                grid.updateColumnHeader(args.column.id, "*"+_this.columnSelector[args.column.id].name, _this.columnSelector[args.column.id].name);
            }
            _this.columnSelector[args.column.id].selected = !_this.columnSelector[args.column.id].selected;        
        });
    });
};

LogView.prototype.GetCsv = function(name) {
    var csv = this.csvs[name];
    if (this.csvsProcessed[name] === undefined) {
        try {
            GetMafScaler().MafScale(GetMapEdit().map,csv);
        } catch (e) {
            
        }
        this.csvsProcessed[name] = true;
    }
    return csv;
}

LogView.prototype.RenderLogs = function() {
    var _this = this;
    this.Ready();
    if (this.LogsLoaded()) {
        $("#log-viewer-help").hide();
        this.RenderLogTabs();
        
        $('#log-tabs a').click(function (e) {
            e.preventDefault();
            var name = $(this).data("csv");
            _this.RenderGrid(_this.GetCsv(name));
            $(this).tab('show');
        });

      
        $('#log-tabs a:last').tab('show');

        $('#log-tabs li.active a').click();
    } else {
        $("#log-viewer-help").show();
    }
};

LogView.prototype.GraphData = function(csv, columns) {  
    var data = [];
    var secondary = false;

    for (var c in columns) {
        var d = { 
            type: "line",
            showInLegend: true,
            name: csv.data[0][columns[c]],
            dataPoints : []
        };

        if (secondary) {
            d.axisYType = "secondary";
        }

        secondary = true;

        data.push(d);
    }
    
    for (var r = 1; r < csv.data.length; r++) {
        for (var c in columns) {
            data[c].dataPoints.push(
                {   
                    x: parseInt(csv.data[r][0], 10),
                    y: parseFloat(csv.data[r][columns[c]])
                });
        }
    }

    return data;
};

LogView.prototype.Loading = function() {
    this.loading = true;
    GetGui().Loading();
}

LogView.prototype.Ready = function() {
    this.loading = false;
    GetGui().Ready();
}

LogView.prototype.Graph = function() {
    $("#graph-viewer-help").show();
    $("#graph-placeholder").html("");
    if (this.LogsLoaded()) {
       // var columns = common.unique($(".selectable.selected").datalist("index"))
       var columns = [];
       for (var i in this.columnSelector) {
            if (this.columnSelector[i].selected) {
                columns.push(this.columnSelector[i].index);
            }
       }
        if (columns.length > 0) {
            var data = this.GraphData(this.csvs[$("#log-tabs li.active a").text()], columns);

            var chart = new CanvasJS.Chart("graph-placeholder",
            {
              zoomEnabled: true,
              
              axisX:{
                //interval: 1000
              },
              
              axisY :{
                includeZero:false
              },
              
              data: data,
              
            });

            chart.render();  
            $("#graph-viewer-help").hide();
        }
    }
};

LogView.prototype.LoadCSV = function(filename, data) {
    var csvData = $.csv.toArrays(data);
    
    var filtered = [];
    
    for (var i in csvData) {
        if (i == 0 || !isNaN(csvData[i][0])) {
            filtered.push(csvData[i]);
        }
    }
    
    
    var csv = GetLogView().csvs[filename] = { 
        name: filename, data: filtered
        };
};

$(document).ready(function () {    

    $("#log-table-placeholder").on("click", ".selectable", function () {
        $(this).toggleClass("selected");
    });

    $("#load-log").on("click", function (e) {
        e.preventDefault();
        var fileInput = $("#log-file");
        fileInput.wrap('<form>').closest('form').get(0).reset();
        fileInput.unwrap();
        fileInput.click();
    });

    $("body").on("click", "#graph-selected-logs", function(e) {
       e.preventDefault();
       if (common.reduce(GetLogView().columnSelector, function(x) { return x.selected === true}).length > 0) {
           $("#log-view-content").hide();
           $("#graph-view-content").show();
             GetLogView().Graph();
       }
    });
  
    $("#close-graph-view").on("click", function(e) {
        e.preventDefault();
        $("#log-view-content").show();
        $("#graph-view-content").hide();
        GetLogView().ActivateTab();
    });
  
    $("#log-file").on("change", function () {
        GetLogView().Loading();
        $("#log-viewer-help").hide();
        $("#log-view-tab").tab("show");
        var deferredList = [];
        for (var x = 0; x < $(this).get(0).files.length; x++) {  
            var deferred = $.Deferred();
            deferred.done(function() {
                if (common.reduce(deferredList, function(f) { return f.state() != "resolved"}).length === 0) {
                    GetLogView().RenderLogs();
                }
            });
            deferredList.push(deferred);
        }
        
        for (var x = 0; x < $(this).get(0).files.length; x++) {  
            (function (f, x) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    console.log("LogView.ready: Loading log: " + f.name);
                    _global_csv = GetLogView().csvs[f.name] = { name: f.name, data: $.csv.toArrays(e.target.result) };
                    deferredList[x].resolve();
                };
                reader.readAsText(f);
            })($(this).get(0).files[x], x);
        }
    });
});