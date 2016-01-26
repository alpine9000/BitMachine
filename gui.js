/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

function GetGui() {

    if (GetGui.prototype.instance === undefined) {
        GetGui.prototype.instance = new Gui(); 
    }
    return GetGui.prototype.instance;
}

gui = GetGui();

function Gui() {
	this.fileSystemOperationsCount = {};
}

Gui.prototype.log = function(message) {
    console.log(message);
    if (message.indexOf(":") != -1) {
        message = $.trim(message.split(":")[1]);
    }
    alertify.log(message);
};

Gui.prototype.error = function(message) {
    console.log(message);
    if (message.indexOf(":") != -1) {
        message = $.trim(message.split(":")[1]);
    }
    alertify.error(message);
};

Gui.prototype.PushFileSystemOperation = function(fs) {
    if (this.fileSystemOperationsCount[fs] === undefined) {
        this.fileSystemOperationsCount[fs] = 0;
    }
    this.fileSystemOperationsCount[fs]++;
    var icon ="#bitmachine-retro-button"
    if (fs == "gdfs") {
        icon = "#bitmachine-gdrive-button";
    } else if (fs == "web") {
        icon = "#bitmachine-web-button";
    }
    $(icon).addClass("rotate-animation");
    if (Gui.prototype.title  == undefined) {
        Gui.prototype.title = window.document.title;
        window.document.title = "Loading...";
    }
};

Gui.prototype.PopFileSystemOperation = function(fs) {
    if (this.fileSystemOperationsCount[fs] === undefined) {
        this.fileSystemOperationsCount[fs] = 0;
    } else {
        this.fileSystemOperationsCount[fs]--;
    }
    
    if (this.fileSystemOperationsCount[fs] <= 0) {
        this.fileSystemOperationsCount[fs] = 0;
        var icon ="#bitmachine-retro-button";
        if (fs == "gdfs") {
            icon = "#bitmachine-gdrive-button";
        } else if (fs == "web") {
            icon = "#bitmachine-web-button";
        }
        $(icon).removeClass("rotate-animation");
        if (Gui.prototype.title != undefined) {
            window.document.title = Gui.prototype.title;
            Gui.prototype.title = undefined;
            //console.log("Ready")
        }
    }
}

Gui.prototype.Loading = function() {
    
    
    $("#bitmachine-loading-container").show();
    $("#bitmachine-main-container").hide();
    //$(".bitmachine-header button").attr("disabled", "disabled")
    $(".bitmachine-header a").addClass("disabled");
};

Gui.prototype.Ready = function() {
    
    $("#bitmachine-loading-container").hide();
    $("#bitmachine-main-container").show();
    $(".bitmachine-header button").removeAttr("disabled");
    $(".bitmachine-header a").removeClass("disabled");
};

Gui.prototype.RefreshCurrentTab = function() {
    eval($("#main-tabs li.active a").data("activate"));
};

$(document).ready(function() {
	$("#bitmachine-retro-button").on("click", function() {
        $("body").toggleClass("retro");
	});
	
	$("body").keyup(function (e) {
		if (e.target == $("body").get(0)) {
			if (e.ctrlKey && e.which == 68) { // ctrl	
			 	$("#load-bitos-from-gdfs").click();
			}
		}
	});
	
	$("#load-bitos-fs").on("click", function(e) {
        e.preventDefault();
        GetDisa().done(function() {
            GetGui().Ready();
            $("#disa-viewer-tab").click();
            InitialiseBitFS("/gdrive/filesystem.zip"); 
        });  
	});
	
	$("#load-bitos-fs-from-web").on("click", function(e) {
        e.preventDefault();
        GetDisa().done(function() {
            GetGui().Ready();
            $("#disa-viewer-tab").click();
            InitialiseBitFS("/web/BitFS/filesystem.zip"); 
        });  
	});

	$("#install-tests-from-web").on("click", function(e) {
        e.preventDefault();
        GetDisa().done(function() {
            GetGui().Ready();
            $("#disa-viewer-tab").click();
            UnzipFile("Install tests?", "/web/BitFS/tests.zip", "/bitfs/usr/local/home/tests"); 
        });  
	});

	$("#install-tests-from-gdfs").on("click", function(e) {
        e.preventDefault();
        GetDisa().done(function() {
            GetGui().Ready();
            $("#disa-viewer-tab").click();
            UnzipFile("Install tests?", "/gdrive/tests.zip", "/bitfs/usr/local/home/tests"); 
        });  
	});
		
	$("#load-bitos-from-local").on("click", function(e) {
        e.preventDefault();
        //$("body").addClass("bitos");
        BootSimulator("/usr/local/src/BitOS/bin/bitos.elf", "kernel"); 
	});
	
	$("#load-bitos-from-gdfs").on("click", function(e) {
        e.preventDefault();
        //$("body").addClass("bitos");
        BootSimulator("/gdrive/bin/bitos.elf", "kernel"); 
	});
	
	$("#load-bitos-from-web").on("click", function(e) {
        e.preventDefault();
        //$("body").addClass("bitos");
        BootSimulator("/web/BitFS/bitos.elf", "kernel"); 
	});

	if (window.location.hostname == "localhost") {
	    $("#load-bitos-from-web").click();
	}

	$("#load-bitos-from-web-torture").on("click", function(e) {
        e.preventDefault();
        //$("body").addClass("bitos");
        BootSimulator("/web/BitFS/bitos.elf", "bsh test 2"); 
	});
	
	
	
	$("#install-drive-app").on("click", function(e) {
        e.preventDefault();
        new GDFileSystem().done(function() {
           this.InstallDriveApp(); 
        });
	});
	
	$("#bitmachine-disa-show-button,#bitmachine-bitos-button").on("click", function() {
        $("body").toggleClass("bitos");
	});
	
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {    
        var activate = $(e.target).data("activate");
        if (activate !== undefined) {
            eval(activate);
        }                   
    });

    $(".options-toggle input").on("change", function(e) {        
        $($(this).data("target")).toggleClass("hidden");                    
    });

    $("#main-tabs a[data-toggle='tab']").on('click', function (e) {
        var id = $(this).attr("id");
        if (id != "graph-view-tab") {
            new FileSystem().done(function () {                                
                this.save("lastSelectedTab.txt", id);                
            });                     
        }
    });

	$('#map-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('#maf-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('#main-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $("#disa-tabs").on("click", "a", function (e) {
        e.preventDefault();
        var activate = $(e.target).data("activate");
        if (activate !== undefined) {
            eval(activate);
        }                   
        $(this).tab('show');
        
    });


    $("#rom-information-placeholder").on("click", "#search-for-undefined", function (e) {
        e.preventDefault();
        FindUndefinedMaps();
    });
   
});
