/*
 * Copyright © Enable Software Pty Ltd 2013 - All rights reserved
 */

var Options = {   
        targetFuelingMap: "Primary Open Loop Fueling",
        engineLoadColumnName: "Engine Load (4-Byte)* (g/rev)",
        afrColumnName: "Innovate Wideband AFR (AFR Gasoline)",
        oemAfrColumnName: "A/F Sensor #1 (AFR)",
        engineSpeedColumnName: "Engine Speed (rpm)",
        throttleColumnName: "Throttle Opening Angle (%)",
        mafSensorVoltageColumnName: "Mass Airflow Sensor Voltage (V)",
        mafColumnName: "Mass Airflow (g/s)",
        intakeAirTempColumnName: "Intake Air Temperature (C)",
        afLearningColumnName: "A/F Learning #1 (%)",
        afCorrectionColumnName: "A/F Correction #1 (%)",
        afLearning3ColumnName: "A/F Learning #3 (%)",
        afCorrection3ColumnName: "A/F Correction #3 (%)",
        closedLoopFuelingTargetColumnName: "Closed Loop Fueling Target (4-byte)* (estimated AFR)",        
        manifoldPressureRelativeColumnName: "Manifold Relative Pressure (Corrected) (psi)",
        clOlFuelingColumnName: "CL/OL Fueling* (status)",
        tipInThrottleColumnName: "Tip-in Throttle* (%)",
        coolantTempColumnName: "Coolant Temperature (C)",
        pulseWidthColumnName: "Fuel Injector #1 Pulse Width (4-byte)* (ms)",
        injectorDutyCycleColumnName: "Injector Duty Cycle (%)",
        latencyColumnName: "Fuel Injector #1 Latency (4-byte)* (ms)",
        
        mafTableName: "MAF Sensor Scaling",
        mrpTaleName: "Engine Load Compensation Cruise (MP)",
        mafSmoothAbove: 3.1,
        errorSmoothingFactor: 10,
        smoothingFactor: 10,
        loadCompensationMinSamples: 100,
        minCoolantTemp: 80,
        maxInletAirTemp: 45,
        //googleDriveFolderId: '0B-PSYTJK8InmalJNZmFValRrS28',
        googleDriveDefinitionsFolderId: '0B-PSYTJK8InmQU1SenN5V2I5Wjg'
};

var OptionsFilename = "/options.v16.json";

function GetSetupView() {
    if (GetSetupView.prototype.instance === undefined) {
        GetSetupView.prototype.instance = new SetupView(); 
    }
    return GetSetupView.prototype.instance;
}



function SetupView() {

}

SetupView.prototype.ActivateTab = function () {
    this.RenderOptions();
    GetGui().Ready();
};

SetupView.prototype.RenderOptions = function () {    
    var source = $("#options-template").html();
    var template = Handlebars.compile(source);
    var html = template(Options);
    $("#options-list-placeholder").html(html);

    $("#save-options").off("click").on("click", function (e) {
        e.preventDefault();
        $(".options-editor-value").each(function () {
            Options[$(this).data("name")] = $(this).val();
        });
        new FileSystem().done(function () {
            this.save(OptionsFilename, JSON.stringify(Options));
        });
    });
};

$(document).ready(function () {
    new FileSystem().done(function () {
        this.read(OptionsFilename, true).done(function (e) {
            console.log("Options.document.ready: Options loaded.")
            eval("Options = " + e);
        });
    });
});
