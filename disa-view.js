function GetDisaView() {
    if (DisaView.prototype.promise == undefined) {
        var deferred = $.Deferred();
        DisaView.prototype.promise = deferred.promise();
        GetDisa().done(function() {
            DisaView.prototype.instance = new DisaView(this);
            deferred.resolveWith(DisaView.prototype.instance);
        });
    }
    return DisaView.prototype.promise;
}

var DisaView = function (disa) {
    this.disa = disa;
    this.SetupEvents();
    var source = $("#disa-line").html();
    this.lineTemplate = Handlebars.compile(source);
    this.disassemblyLineHeight = 20;
    //this.lines = this.disa.Disassemble(0, this.disa.map.mapData.byteLength);
    this.CreateDisassemblyWindow();
    if (this.disa.map != undefined) {
        this.GotoAddress(simulator.address);
    }
};


DisaView.prototype.ActivateTab = function() {
    if (!this.rendered) {
        this.Render();
        this.rendered = true;
        GetGui().Ready();
    }
};

DisaView.prototype.RenderDisassembleLine = function(address) {
    var d = this.disa;
    //var lines = [this.lines[address]];
    var lines = this.disa.Disassemble(address, 1);

    for (var l in lines) {
        if (lines[l].address == simulator._push_address) {
            lines[l].simulatorNextInstruction = true;                
        }

        if (simulator.breakpoints !== undefined) {
            if (simulator.breakpoints[lines[l].address] == true) {
                lines[l].breakpoint = true;
            }
    
            if (lines[l].address == simulator._push_address && simulator.breakpoints[simulator._push_address] == true) {
                lines[l].currentBreakpoint = true;   
            }
        }
    }

    var html = $(this.lineTemplate(lines[0]));
    html.find(".disa-undefined-symbol").after($("#disa-add-symbol-template").text());

    return html.html();
}

DisaView.prototype.RenderDisassemblyWindow = function(address) {
    //Slow
    //return
    var container = $("#disa-disassembly");
    if (address === undefined) {
        if (this.renderDisassemblyWindowAddress === undefined) {
            this.renderDisassemblyWindowAddress = address = 0;
        } else  {
            address = this.renderDisassemblyWindowAddress;
        }
    } else {
        this.renderDisassemblyWindowAddress = address;
    }
    container.empty();
    var end = address + (800/this.disassemblyLineHeight);
    for (; address < end; address += 2) {
        container.append(this.RenderDisassembleLine(address));
    }
};

DisaView.prototype.CreateDisassemblyWindow = function() {
    var _this = this;
    /*this.disassemblyList = new VirtualList({
    h: 400, //TODO
    itemHeight: this.disassemblyLineHeight,
    totalRows: this.disa.map.mapData.byteLength/this.disa.instructionSize,
    generatorFn: function(row) {
      var el = document.createElement("div");
      //el.innerHTML = "<p>ITEM " + row + "</p>";
      var address = row*_this.disa.instructionSize;
      el.innerHTML = _this.RenderDisassembleLine(address);
      return el;
    },
    onScroll: function(index) {
      $("#disa-tabs li.dynamic-tab.active a").data("current-index", index);
    }
  });

  this.disassemblyList.container.classList.add("disassembly-container");
  //document.body.appendChild(list.container)
  $("#disa-disassembly").append($(this.disassemblyList.container));*/
  
  $("#disa-disassembly").bind('mousewheel', function(e){
      e.preventDefault();
      e.stopPropagation();
        if(e.originalEvent.wheelDelta  > 0) {
            _this.RenderDisassemblyWindow(_this.renderDisassemblyWindowAddress-2);
        } else {
            _this.RenderDisassemblyWindow(_this.renderDisassemblyWindowAddress+2);
        }
        return false;
    });
};


DisaView.prototype.RefreshDisassembly = function() {
   // this.disassemblyList.refresh();
    if (this.disa.map != undefined) {
        this.RenderDisassemblyWindow();
    }
};

DisaView.prototype.GotoAddress = function(address) {
    var _this = this;
    /*$(".disassembly-container").show();
    
    window.setTimeout(function() {
        $(".disassembly-container").scrollTop((address/_this.disa.instructionSize)*_this.disassemblyLineHeight);
    }, 0);*/
    
    this.RenderDisassemblyWindow(address);
};

DisaView.prototype.RenderTableList = function (bitos) {
    var disa = this.disa;

    
    if (this.disa.map != undefined && this.disa.map.ecuInfo.id != "") {
        var categories = {
            "RAM Variables": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "RAM Variable" }),
            "SSM Parameter": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "SSM Parameter" }),
            "SSM Parameter Table": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "SSM Parameter Table" }),
            "3D Tables": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "3D Table" }),
            "2D Tables": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "2D Table" }),
            "2D Table (static axis)": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "2D Table (static axis)" }),
            "1D Tables": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "1D Table" }),
            "Processor Registers": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "processor symbol" }),
            "User Defined": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "User Defined" }),
            "Program Symbol": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "Program Symbol" }),
        };
    } else {
        var categories = {
            "Processor Registers": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "processor symbol" }),
            "User Defined": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "User Defined" }),
            "Program Symbol": common.reduce(disa.symbols.byAddress, function (s) { return s.type == "Program Symbol" }),
        };
        
    }

    RenderTemplate("#disa-symbol-list-template", { categories: categories }, "#disa-symbol-list-placeholder");
};

DisaView.prototype.RenderBreakpointList = function() {
    var breakpoints = [];
    _.each(simulator.breakpoints, function(v, k) { breakpoints.push(ToHex(parseInt(k, 10)))});
    RenderTemplate("#breakpoint-list-template", breakpoints, "#disa-breakpoint-list");
    this.RefreshDisassembly();
};

DisaView.prototype.Render = function () {
    this.RenderTableList();
};

/*
function DisaReRenderSection(e, addressOffset, lengthOffset) {
    var sourceId = e.data("source-id");
    var address = parseInt(e.data("disa-address"));
    var length = parseInt(e.data("disa-length"));

    if (typeof(sourceId) == "undefined" || sourceId == "") {
        sourceId = "#disa-section-" + address;
    }

    if (typeof(addressOffset) != "undefined") {
        address = address + addressOffset;
    }
    if (typeof(lengthOffset) != "undefined") {
        length = length + lengthOffset;
    }
    console.log("Length: " + length)
    console.log("Address: " + address)
    
    DisaRenderSection(address, length, sourceId);
}

function DisaRenderSection(address, length, sourceId) {
    console.log("DRS " + address + " " + length + "  " + sourceId )
    GetDisa().done(function () {
        var d = this;
        var lines = d.Disassemble(address, length, true);

        for (var l in lines) {
            if (lines[l].address == simulator.address) {
                lines[l].simulatorNextInstruction = true;                
            }

            if (simulator.breakpoints[lines[l].address] == true) {
                lines[l].breakpoint = true;
            }

            if (lines[l].address == simulator.address && simulator.breakpoints[simulator.address] == true) {
                lines[l].currentBreakpoint = true;   
            }
        }

        var source = $("#disa-section").html();
        var template = Handlebars.compile(source);
        var sourceClass = "";
        if (sourceId != undefined) {
            sourceClass = sourceId.replace(".", "")
        }
        var html = $(template({ address: address, length: length, sourceClass: sourceClass, lines: lines }));
        html.find(".disa-undefined-symbol").after($("#disa-add-symbol-template").text());

        var section = $("#disa-section-" + address);

        if (typeof(sourceId) != "undefined" && sourceId != "") {
            section = $(sourceId);
            console.log("using source")
        }
        
        if (section.is(":visible")) {            
            console.log("replace")
            section.replaceWith(html);
        } else {
            $("#disa").append(html);
        }
    });

    //window.location = "#disa-section-" + address;
}*/

DisaView.prototype.AddSymbol = function(symbol) {
     var name = prompt("Enter symbol name for " + symbol.text());
    if (name !== undefined) {
        this.disa.AddSymbol(symbol.data("address"), name, "User Defined");
    }
    this.RefreshDisassembly();
    this.RenderTableList();
    this.disa.SaveSymbols();       
};

DisaView.prototype.ToggleData = function(item) {
    var disa = this.disa;
    if (item.data("is-data") == true) {
        disa.ClearData(FromHex(item.text()), disa.instructionSize);
    } else {
        disa.SetData(FromHex(item.text()), disa.instructionSize);
    }
    this.RefreshDisassembly();
}

DisaView.prototype.AddSymbolView = function(address) {
    if ($("#disa-dynamanic-tab-"+address).length === 0) {
        var write = _.filter(this.disa.references[address], function(e) { return e.type ==  "Reverse Simulator (Write)";}).length > 0;
        $("#disa-tabs").append(Handlebars.compile($("#disa-tab-template").html())({symbol: "#"+ToHex(address), address: address, write: write}));
    } 
};

DisaView.prototype.ShowSymbolView = function(address) {
    this.AddSymbolView(address);
    $("#disa-dynamanic-tab-"+address + " a").click();
    this.GotoAddress(simulator.address);
};

DisaView.prototype.ActivateSymbolView = function(address, item) {
    var scrolledAddress = $(item).data("current-index");
    if (scrolledAddress !== undefined) {
        this.GotoAddress(scrolledAddress*this.disa.instructionSize);
    } else {
        this.GotoAddress(address);
    }
};

DisaView.prototype.SetupEvents = function()
{
    var disa = this.disa;
    var view = this;
    
    $("#disa-viewer").on("click", ".disa-symbol-link", function(e) {
        e.preventDefault();
        var name = $(this).data("name");
        var type = $(this).data("type");
        var symbolAddress = disa.symbols.byName[name];
        if (cpu.IsRomAddress(symbolAddress) || cpu.IsRamAddress(symbolAddress)) {
            view.AddSymbolView(symbolAddress);
        }
        var references = disa.references[symbolAddress];
        for (var i in references) { 
            var address;
            if (type != "SSM Parameter" && type != "SSM Parameter Table") {
                address = references[i].referenceAddress;
            } else {
                address = references[i].address;
            }
            view.AddSymbolView(address);
        }
    });

    function toggleList() {
        if ($("#disa-symbol-list-placeholder").is(":visible")) {
            $("#disa-symbol-list-placeholder").hide();
            $("#disa-symbol-list-toggle-button").find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
            $("#disa-main").removeClass("col-md-8");
            $("#disa-main").addClass("col-md-12");
        } else {
            $("#disa-symbol-list-placeholder").show();
            $("#disa-symbol-list-toggle-button").find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
            $("#disa-main").addClass("col-md-8");
            $("#disa-main").removeClass("col-md-12");
        }
    }

    $("#disa-symbol-list-toggle-button").click(function () {
        toggleList();
    });

    
        
    $("#disa-symbol-search").on("keyup", function (e) {
        var search = $(this).val();
        if (search == "") {
            if ($("#disa-symbol-list-placeholder").is(":visible")) {
                toggleList();     
            }
            $(".disa-symbol-category").collapse('hide');
            $("#disa-symbol-list-placeholder .category-panel").show();
            $("#disa-symbol-list-placeholder").find(".disa-symbol-list-element").show()
        } else {
            if (!$("#disa-symbol-list-placeholder").is(":visible")) {
                toggleList();     
            }
            $(".disa-symbol-category").collapse('show');
            $(".disa-symbol-category").show();
            $("#disa-symbol-list-placeholder .category-panel").show();
            $("#disa-symbol-list-placeholder").find(".disa-symbol-list-element").hide()
            $("#disa-symbol-list-placeholder").find(".disa-symbol-list-element[data-lowercase-name*='" + search.toLowerCase() + "']").show()

            $(".disa-symbol-category").each(function () {
                var key = $(this).data("key");
                if ($(this).find(".disa-symbol-list-element").is(":visible")) {
                    $("#disa-panel" + key).show();
                } else {
                    $("#disa-panel" + key).hide();
                }
            });


        }
    });

   
    $("#disa-disassembly").on("click", ".breakpoint-link", function() {
        simulator.ToggleBreakPoint($(this).data("address"));        
        view.RefreshDisassembly();
    });


    $("#disa-breakpoint-list").on("click", "a.disa-delete-breakpoint", function (e) {
        e.preventDefault();
        simulator.ToggleBreakPoint(FromHex($(this).data("address")));        
        simulator.Render();
    });
    $("#disa-breakpoint-list").on("click", "a.disa-link", function (e) {
        e.preventDefault();
        view.GotoAddress(FromHex($(this).data("address")));
    });

   
    $("#disa-disassembly").on("click", "a.disa-link", function (e) {
        e.preventDefault();
        var address = $(this).data("address");
        //view.AddSymbolView($(this).data("address"));
        
        if (cpu.IsRomAddress(address)) {
            view.AddSymbolView(address);
        } else {
            var references = disa.references[address];
            for (var i in references) { 
                    //address = references[i].referenceAddress;
                address = references[i].referenceAddress;
                view.AddSymbolView(address);
            }
        }
    });


    
    $("#disa-disassembly").on("click", ".disa-address", function (e) {
        e.preventDefault();
        view.ToggleData($(this));
    });



    $("#disa-disassembly").on("click", ".disa-line-help-button", function (e) {
        e.preventDefault();
        $("#" + $(this).data("line-help-id")).toggleClass("visible");
    });

   
    $("#disa-disassembly").on("click", ".disa-add-symbol-button", function (e) {
        e.preventDefault();
        view.AddSymbol($(this).prev());
    });

    $("#disa-analyse").on("click", function (e) {
        e.preventDefault();
        GetDisa().done(function() {
            var disa = this;
            disa.Analyse().done(function() {
                disa.SaveSymbols();
                disa.SaveReferences();
                GetDisaView().done(function() {this.RenderTableList();});
            });
        });
    });
    
    $("#disa-tabs").on("click", ".disa-close-tab", function() {
        $("#disa-dynamanic-tab-" + $(this).data("id")).remove();
    });

    
};