/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

Handlebars.registerHelper('axisValue', function(axis, index) {
    return axis.data[index].display;
});


Handlebars.registerHelper('hex', function(x, n) {

    if (typeof(n) != "object") {
        return sprintf("%0" + parseInt(n, 10) + "X", parseInt(x, 10));
    } else {
        return ToHex(x);
        //return x;
    }
});

Handlebars.registerHelper('clean', function(str) {
    return str.replace(/[^A-Za-z0-9]*/g, '');
});

Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});

Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error('Handlebars Helper equal needs 2 parameters');
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

Handlebars.registerHelper('toLowerCase', function(value) {
    if (value) {
        return new Handlebars.SafeString(value.toLowerCase());
    } else {
        return '';
    }
});

Handlebars.registerHelper('prettyCamel', function(str) {
    var out = str.replace(/^\s*/, ""); // strip leading spaces
    out = out.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
        if (offset == 0) {
            return (str.toUpperCase());
        } else {
            return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
        }
    });
    return (out);
});


function RenderTemplate(templateName, context, id) {
    var source = $(templateName).html();
    var template = Handlebars.compile(source);
    $(id).html(template(context));
}

function GetMapEdit() {
    if (GetMapEdit.prototype.instance === undefined) {
        console.log("GetMapEdit: Creating MapEdit...");
        GetMapEdit.prototype.instance = new MapEdit();
    }
    return GetMapEdit.prototype.instance;
}

function MapEdit() {
    this.cachedTables = {};
    this.mapLoaded = false;
    this.colorMap = new Colormap($("#colormap").html());
    this.currentTable = undefined;
    this.maps = {};
    this.map = undefined;
}

MapEdit.prototype.CurrentTable = function() {
    return this.cachedTables[this.currentTable];
};

MapEdit.prototype.ClearRenderedTable = function() {
    $("#table-placeholder").html("");
    $("#table-heading").html("");
};

MapEdit.prototype.RenderTable = function(table) {
    var templates = {
        "1D": "#table-1D-template",
        "2D": "#table-2D-template",
        "3D": "#table-template"
    };
    //var table = this.CurrentTable();
    RenderTemplate(templates[table.type], table, "#table-placeholder");
    $("#table-heading").html(table.name);
    $("#table-description").html(table.description);
    this.colorMap.Apply(table);
    RenderTemplate($("#table-definition-template"), {
        table: table,
        scalings: this.map.ScalingList(),
        unassociatedTables: this.map.UnassociatedTableList(),
        categories: Object.keys(this.categories)
    }, "#table-definition-placeholder");
};

MapEdit.prototype.ResetAllCaches = function() {
    var deferred = $.Deferred();
    this.ResetTableCache(this.map).always(function() {
        new FileSystem().done(function() {
            var fs = this;
            fs.rm("cache.hex").always(function() {
                fs.rm("last.txt").always(function() {
                    deferred.resolve();
                });
            });
        });
    });
    return deferred.promise();
};

MapEdit.prototype.ResetTableCache = function(map) {
    var deferred = $.Deferred();
    var folder = "/" + map.romid.internalidstring;
    var filename = folder + "/tablelist.json";
    new FileSystem().done(function() {
        var fs = this;
        fs.rm(filename).always(function() {
            deferred.resolve();
        });
    });
    return deferred.promise();
};

MapEdit.prototype.CachedTableList = function(map, noCache) {
    var deferred = $.Deferred();
    var _this = this;
    var folder = "/" + map.romid.internalidstring;
    var filename = folder + "/tablelist.json";

    new FileSystem().done(function() {
        var fs = this;
        var loadFromDefs = function() {
            _this.tables = map.TableList();
            fs.save(filename, JSON.stringify(_this.tables)).fail(function() {
                gui.error("MapEdit.CachedTableList: Failed to save table cache [" + filename + "]");
            });

            deferred.resolve([_this.tables]);
        };

        if (noCache) {
            loadFromDefs();
        } else {
            fs.mkdir(folder).done(function() {
                fs.read(filename, true).done(function(tablelist) {
                    _this.tables = JSON.parse(tablelist);
                    deferred.resolve([_this.tables]);
                }).fail(loadFromDefs);
            });
        }
    });


    return deferred.promise();
};

MapEdit.prototype.ClickOnTable = function(name) {
    $("#map-edit-tab").click();
    $(".table-list-element a[data-name='" + name + "'").click();

};

MapEdit.prototype.RenderTableList = function(map, noCache) {
    var deferred = $.Deferred();
    var _this = this;
    this.CachedTableList(map, noCache).done(function() {
        _this.categories = {};
        for (var t in _this.tables) {
            var category = _this.tables[t].category;
            if (_this.categories[category] === undefined) {
                _this.categories[category] = [];
            }
            _this.categories[category].push(_this.tables[t]);
        }

        var source = $("#table-list-template").html();
        var template = Handlebars.compile(source);
        var html = template({
            romid: map.romid,
            categories: _this.categories
        });
        $("#table-list-placeholder").html(html);
        $("#rom-information-link").click();
        _this.tableListRendered = true;
        deferred.resolve();
    });

    return deferred.promise();
};

MapEdit.prototype.DefinitionNotFound = function() {
    GetGui().Ready();
    //$("#definition-not-found-dialog").modal();
    gui.error("Definition not found");
};

MapEdit.prototype.LoadTable = function(name) {
    var t = this.cachedTables[name];
    if (t !== undefined && t.dirty !== true) {
        return t;
    }
    var table = this.map.LoadTable(name);
    this.cachedTables[name] = table;
    return table;
};

MapEdit.prototype.RefreshTable = function(name) {
    this.cachedTables[name].dirty = true;
    this.LoadTable(name);
};

MapEdit.prototype.ActivateTab = function() {
    if (!this.tableListRendered && this.map !== undefined) {
        this.RenderTableList(this.map);
        $("#rom-information-link").click();
        GetGui().Ready();
    }
};

MapEdit.prototype.LoadMap = function(filename, data) {
    var _this = this;
    var deferred = $.Deferred();
    new Map(filename, data, function(map) {
        _this.mapLoaded = true;
        _this.maps[filename] = _this.map = map;
        $("#map-edit-tab").html(filename.replace(".hex", ""));
        deferred.resolveWith(this);
    }, function(map) {
        _this.maps[filename] = _this.map = map;
        if (map.ecuInfo.id !== "") {
            _this.DefinitionNotFound(); 
        }
        deferred.resolveWith(this);
    });

    return deferred.promise();
};

MapEdit.prototype.LoadFromGdfs = function(gdfs, fileId) {
    var deferred = $.Deferred();

    var _this = this;
    //try {

    gdfs.readId(fileId, false).done(function(file, fileData) {
        if (file.title.indexOf(".elf") != -1) {
            _this.LoadElfFile(deferred, file.title, fileData);
        } else if (file.title.indexOf(".csv") == -1) {
            _this.LoadMap(file.title, fileData).done(function() {
                deferred.resolve();
            }).fail(function() {
                deferred.resolve();
            });
        } else {
            common.toString(fileData).done(function(data) {
                GetLogView().LoadCSV(file.title, data);
                deferred.resolve();
            });
        }
    });
    //});

    //} catch (e) {
    //  console.log("MapEdit.LoadFromGdfs: Failed to load map.", e);
    //}

    return deferred.promise();
};

MapEdit.prototype.LoadLastMap = function(success) {
    var _this = this;
    try {
        new FileSystem().done(function() {
            var fs = this;
            fs.read("last.txt", true).done(function(filename) {
                fs.read("cache.hex", false).done(function(x) {
                    _this.map = new Map(filename, x, function() {
                        _this.mapLoaded = true;
                        _this.maps[filename] = _this.map;
                        $("#map-edit-tab").html(filename.replace(".hex", ""));
                        if (typeof(success) != "undefined") {
                            success();
                        }
                    }, _this.DefinitionNotFound);
                }).fail(function() {
                    $(".bitmachine-header button").removeAttr("disabled");
                    $("#bitmachine-loading-container").hide();
                });
            }).fail(function() {
                $(".bitmachine-header button").removeAttr("disabled");
                $("#bitmachine-loading-container").hide();
            });
        });

    } catch (e) {
        gui.error("MapEdit.LoadLastMap: Failed to load cached map.", e);
    }
};

MapEdit.prototype.SaveLocalMap = function(map) {
    var _this = this;
    new FileSystem().done(function() {
        var fs = this;
        fs.save("cache.hex", _this.map.mapData).done(function() {
            fs.save("last.txt", _this.map.filename);
        });
    });
};

MapEdit.prototype.Reset = function() {
    $("#table-heading").text("");
    $(".table-component").hide();
    $("#rom-information-placeholder").hide();
    this.cachedTables = {};
    this.ClearRenderedTable();
};

MapEdit.prototype.RescaleAxisSection = function(axis, start) {
    var min = axis[start],
        max, end;

    for (var i = start + 1; i < axis.length; ++i) {
        if (!_.isNaN(axis[i])) {
            max = axis[i];
            end = i;
            break;
        }
    }

    var step = (max - min) / (end - start);

    var val = min;
    for (i = start + 1; i < end; ++i) {
        val = val + step;
        axis[i] = val;
    }

    return {
        axis: axis,
        end: end
    };
}

MapEdit.prototype.RescaleAxis = function(axis) {
    if ((axis[0] === "" || axis[axis.length - 1] === "")) {
        return undefined;
    }

    for (var i = 0; i < axis.length; ++i) {
        if (!_.isNaN(axis[i])) {
            start = i;
        } else if (start !== undefined) {
            result = this.RescaleAxisSection(axis, start);
            axis = result.axis;
            start = undefined;
            i = result.end - 1;
        }
    }

    return axis;
}

MapEdit.prototype.RescaleCurrentTable = function() {
    var xaxis = $(".xaxis-edit");
    var yaxis = $(".yaxis-edit");

    var xaxisValues = [],
        yaxisValues = [];

    xaxis.each(function() {
        xaxisValues.push(parseFloat($(this).val()));
    });

    yaxis.each(function() {
        yaxisValues.push(parseFloat($(this).val()));
    });


    xaxisValues = this.RescaleAxis(xaxisValues);
    yaxisValues = this.RescaleAxis(yaxisValues);

    if (xaxisValues === undefined || yaxisValues === undefined) {
        return;
    }


    this.RescaleTable(this.currentTable, xaxisValues, yaxisValues);
    this.GuiLoadTable(this.currentTable);
};

MapEdit.prototype.RescaleTable = function(name, xaxis, yaxis) {
    var t = this.LoadTable(name);
    var x, y;

    for (x = 0; x < t.xAxis.elements; x++) {
        for (y = 0; y < t.yAxis.elements; y++) {
            value = this.map.Get3D(t, xaxis[x], yaxis[y]);
            this.map.UpdateTable3D(t, x, y, value);
        }
    }

    for (x = 0; x < t.xAxis.elements; x++) {
        this.map.UpdateAxisValue(t.xAxis, x, xaxis[x]);
    }

    for (y = 0; y < t.yAxis.elements; y++) {
        this.map.UpdateAxisValue(t.yAxis, y, yaxis[y]);
    }

    this.RefreshTable(name);

};

/*
MapEdit.prototype.RescaleTable = function(name, xMin, xMax, yMin, yMax) {
    var t = this.LoadTable(name);
    
    var xStep = (xMax-xMin)/(t.xAxis.elements-1);
    var yStep = (yMax-yMin)/(t.yAxis.elements-1);
    
    for (var x = 0; x < t.xAxis.elements;  x ++) {
        for (var y = 0; y < t.yAxis.elements; y++) {
            value = this.map.Get3D(t, (x*xStep)+xMin, (y*yStep)+yMin);
            this.map.UpdateTable3D(t, x, y, value);
        }
    }
    
    for (x = 0; x < t.xAxis.elements;  x ++) {
        this.map.UpdateAxisValue(t.xAxis, x, (x*xStep)+xMin);
    }
            
    for (var y = 0; y < t.yAxis.elements; y++) {
        console.log((y*yStep)+yMin);
        this.map.UpdateAxisValue(t.yAxis, y, (y*yStep)+yMin);
    }
    
    this.RefreshTable(name);
    
}*/

MapEdit.prototype.CalculateTiming = function(load, rpm, iat, ect) {
    _base = this.map.Get3D(this.LoadTable("Base Timing Primary Non-Cruise"), load, rpm);
    _kca = this.map.Get3D(this.LoadTable("Knock Correction Advance Max Non-Cruise"), load, rpm)
    _iat = this.map.Get2D(this.LoadTable("Timing Compensation A (IAT)"), iat * (9 / 5) + 32)
    _ect = this.map.Get2D(this.LoadTable("Timing Compensation Imm. Non-Cruise A (ECT)"), ect * (9 / 5) + 32)

    function rnd(num) {
        num = Math.round(num * 2) / 2;
        return num;
    }
    var timing = rnd(_base) + rnd(_kca) + rnd(_iat) + rnd(_ect);
    console.log(timing)
}

MapEdit.prototype.ProcessEdit = function() {
    var _this = this;
    var val = prompt("Enter value");
    if (val !== undefined) {
        $(".editable.selected").each(function() {
            var name = $(this).parents("table").data("name");
            _this.cachedTables[name].dirty = true;
            if (_this.cachedTables[name].type == "3D") {
                var x = $(this).data("x-index");
                var y = $(this).parent().data("y-index");
                $(this).text(_this.map.UpdateTable3D(_this.cachedTables[name], x, y, val));
            } else if (_this.cachedTables[name].type == "2D") {
                var y = $(this).data("y-index");
                $(this).text(_this.map.UpdateTable2D(_this.cachedTables[name], y, val));
            } else if (_this.cachedTables[name].type == "1D") {
                $(this).text(_this.map.UpdateTable1D(_this.cachedTables[name], val));
            }
        });
        $(".editable.selected").addClass("modified");
        for (var t in this.cachedTables) {
            this.LoadTable(t);
        }
    }
};

MapEdit.prototype.RenderRomInformation = function() {

    var information = {
        validChecksum: this.map.validChecksum,
        romraiderDisabledChecksum: this.map.romraiderDisabledChecksum,
        romSize: GetMapEdit().map.mapData.byteLength
    };

    for (var attrname in this.map.romid) {
        information[attrname] = this.map.romid[attrname];
    }

    RenderTemplate("#rom-information-template", information, "#rom-information-placeholder");
    $("#table-heading").text("ROM Information");
    $(".table-component").hide();
    $("#rom-information-placeholder").show();
};

MapEdit.prototype.GuiLoadTable = function(name) {
    var table = this.LoadTable(name);
    this.currentTable = name;
    $("#table-map-select").click();
    $(".table-component").show();
    $("#rom-information-placeholder").hide();
    this.RenderTable(table);
};

MapEdit.prototype.AddTableValue = function(source, dest) {
    var stable = this.LoadTable(source);
    var dtable = this.LoadTable(dest);
    var x, y;

    this.currentTable = dest;

    for (x = 0; x < dtable.xAxis.elements; x++) {
        for (y = 0; y < dtable.yAxis.elements; y++) {
            value = this.map.Get3D(stable, stable.xAxis.data[x].value, stable.yAxis.data[y].value);
            dtable.data[y][x].value += value;
            dtable.data[y][x].display = sprintf(dtable.scaling.format, dtable.data[y][x].value);
        }
    }


    $("#table-map-select").click();
    $(".table-component").show();
    $("#rom-information-placeholder").hide();
    this.RenderTable(dtable);
};

MapEdit.prototype.LoadElfFile = function(deferred, filename, data) {
    var _this = this;
    require(["elf"], function() {
            var elf = new Elf32(data);
            var loaded = Disa.prototype.instance !== undefined;
            _this.LoadMap(filename, elf.image).done(function() {
                GetDisa().done(function() {
                    var disa = this;
                    function _done() {
                        for (var i = 0; i < elf.symbols.length; i++) {
                            if (elf.symbols[i].st_info != 4) {
                                disa.AddSymbol(elf.symbols[i].st_value, elf.symbols[i].name, "Program Symbol");
                            }
                        }
                        GetGui().Ready();
                        $("#disa-viewer-tab").click();
                        $("#disa-simulator-reset").click();
                        deferred.resolve();
                    }
                    if (loaded) {
                        this.Init(_this.map).always(_done);
                    } else {
                        _done();
                    }
    
                });
    
            }).fail(function() {
                deferred.resolve();
            });
            
        });
    
}

MapEdit.prototype.GuiLoadFiles = function(filename, data) {
    var _this = this;
    var deferred = $.Deferred();

    if (filename.indexOf(".elf") != -1) {
        this.LoadElfFile(deferred, filename, data);
    } else if (filename.indexOf(".sym") != -1) {
        GetDisa().done(function() {
            this.LoadSymFile(data);
            deferred.resolve();
        });
    } else if (filename.indexOf(".csv") == -1 && filename.indexOf(".bin") == -1) {
        GetGui().Loading();
        this.Reset();
        this.map = new Map(filename, data, function() {
            _this.mapLoaded = true;
            $("#map-edit-tab").html(filename.replace(".hex", ""));
            _this.RenderTableList(_this.map);
            _this.maps[filename] = _this.map;
            _this.SaveLocalMap(_this.map);
            GetGui().Ready();
            deferred.resolve();
        }, function() {
            _this.DefinitionNotFound();
            deferred.reject();
        });
    } else if (filename.indexOf(".bin") != -1) {
        this.map.Patch(data);
    } else {
        common.toString(data).done(function(data) {
            GetLogView().LoadCSV(filename, data);
            deferred.resolve();
        });
    }

    return deferred.promise();
};

$(document).ready(function() {

    requirejs.config({
        shim: {
            'external/slickgrid/slick.grid.min.js': ['external/slickgrid/slick.dataview.min.js', 'external/slickgrid/slick.core.min.js', 'external/slickgrid/jquery.event.drag-2.2.min.js'],
            'is_compile': ['is', 'io', 'simulator', 'cpu', 'external/vlist.js'],
            'compiled_is': ['is', 'io', 'simulator', 'cpu', 'external/vlist.js']
        }
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 187) {
            if ($("#map-editor").is(":visible")) {
                GetMapEdit().ProcessEdit();
            }
        }
    });

    $("#rom-information-placeholder").on("click", "#download-definition", function() {
        GetMapEdit().map.DownloadDefinition();
    });

    $("#rescale-current-table").on("click", function() {
        GetMapEdit().RescaleCurrentTable();
    });

    $("#rom-information-placeholder").on("click", "#reset-cache", function() {
        GetMapEdit().ResetAllCaches();
    });

    $("#table-definition-placeholder").on("click", "#table-definition-save", function(e) {
        e.preventDefault();
        var me = GetMapEdit();
        var tableName = me.CurrentTable().name;

        var base = $("#table-base-name").val();

        if (base !== "") {
            me.map.MergeToBase(tableName, base);
        } else {
            me.map.UpdateScaling(tableName, $("#table-scaling").val());
            me.map.UpdateAxisScaling(tableName, $("#table-x-axis-scaling").data("name"), $("#table-x-axis-scaling").val());
            me.map.UpdateAxisScaling(tableName, $("#table-y-axis-scaling").data("name"), $("#table-y-axis-scaling").val());
            me.map.UpdateTableName(tableName, $("#table-name").val());
            me.map.UpdateCategoryName(tableName, $("#table-category").val());
        }

        me.map.SaveDefinition();
        me.ClearRenderedTable();
        me.cachedTables = {};
        me.RenderTableList(me.map, true).done(function() {
            $("#table-search").keyup();
            me.GuiLoadTable(tableName);
        });
    });

    $("#table-list-toggle-button").click(function() {
        $("#table-list-placeholder").toggle();
        if ($("#table-list-placeholder").is(":visible")) {
            $(this).find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
        } else {
            $(this).find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        }
        $("#table-main").toggleClass("col-md-8");
        $("#table-main").toggleClass("col-md-12");
    });

    $("#load").on("click", function(e) {
        e.preventDefault();
        $("#file").click();
    });

    $("#save").on("click", function(e) {
        e.preventDefault();
        GetMapEdit().map.Save("rom.hex");
    });

    $("#save-to-gdfs").on("click", function(e) {
        e.preventDefault();
        GetMapEdit().map.SaveToGdfs().done(function(filename) {
            gui.log("MapEdit.ready: Saved " + filename + " to Google Drive!");
        });
    });

    $("#table-placeholder").on("click", ".editable", function(e) {
        var _this = $(this);
        _this.toggleClass("selected");
        if (_this.hasClass("selected")) {
            _this.data("background-color", _this.css("background-color"));
            _this.css("background-color", "");
        } else {
            _this.css("background-color", _this.data("background-color"));
        }
    });

    $("#disa-disassembly").on("click", ".table-link", function(e) {
        e.preventDefault();
        var name = $(this).data("name");
        var me = GetMapEdit();
        if (!me.tableListRendered) {
            me.RenderTableList(me.map).done(function() {
                me.GuiLoadTable(name);
                $("#map-edit-tab").click();
            });
        } else {
            me.GuiLoadTable(name);
            $("#map-edit-tab").click();
        }
    });

    $("#table-list-placeholder").on("click", ".table-link", function(e) {
        e.preventDefault();
        var name = $(this).data("name");
        if (name != "ROM Information") {
            GetMapEdit().GuiLoadTable(name);
        } else {
            GetMapEdit().RenderRomInformation();
        }
    });

    $("#table-search").on("keyup", function(e) {
        var search = $(this).val();
        if (search == "") {
            $(".table-category").collapse('hide');
            $("#table-list-placeholder .category-panel").show();
            $("#table-list-placeholder").find(".table-list-element").show();
        } else {
            $(".table-category").collapse('show');
            $(".table-category").show();
            $("#table-list-placeholder .category-panel").show();
            $("#table-list-placeholder").find(".table-list-element").hide();
            $("#table-list-placeholder").find(".table-list-element[data-lowercase-name*='" + search.toLowerCase() + "']").show();
            $(".table-category").each(function() {
                var key = $(this).data("key");
                if ($(this).find(".table-list-element").is(":visible")) {
                    $("#panel" + key).show();
                } else {
                    $("#panel" + key).hide();
                }
            });
        }
    });

    $("#file").on("change", function() {
        var fileInput = $(this);
        var files = common.reduce($(this).get(0).files, function(x) {
            return typeof x === "object";
        });
        common.multiDeferred(files, function(f) {
            var deferred = $.Deferred();
            var filename = f.name;
            var reader = new FileReader();
            reader.onload = function(e) {
                fileInput.wrap('<form>').closest('form').get(0).reset();
                fileInput.unwrap();
                GetMapEdit().GuiLoadFiles(filename, e.target.result).done(function() {
                    deferred.resolve();
                });
            };
            reader.onerror = function(e) {
                gui.error("MapEdit.document.ready: Failed to read file: " + e);
                deferred.reject();
            };
            reader.readAsArrayBuffer(f);
            return deferred.promise();
        }).done(function() {
            GetGui().RefreshCurrentTab();
        });

    });

    function getURLParameter(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
        );
    }

    function selectTab() {
        new FileSystem().done(function() {
            this.read("/lastSelectedTab.txt", true).done(function(tabId) {
                $("#" + tabId).click();
            }).fail(function() {
               $("#map-edit-tab").click();
            });
        });
    }

    (function() {
       
	/*var fileIds = getURLParameter("ids");

        if (fileIds !== undefined && fileIds != "null") {
            new GDFileSystem().done(function() {
                var gdfs = this;
                common.multiDeferred(fileIds.split(","), function(id) {
                    return GetMapEdit().LoadFromGdfs(gdfs, id);
                }).done(selectTab);
            });
        } else {
            GetMapEdit().LoadLastMap(selectTab);
        }*/

	var fileIds = getURLParameter("state");

        if (fileIds !== undefined && fileIds != "null") {
            new GDFileSystem().done(function() {
                var gdfs = this;
                common.multiDeferred(JSON.parse(fileIds).ids, function(id) {
                    return GetMapEdit().LoadFromGdfs(gdfs, id);
                }).done(selectTab);
            });
        } else {
            GetMapEdit().LoadLastMap(selectTab);
        }


    })();
});