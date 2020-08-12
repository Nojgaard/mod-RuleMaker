import {Graph} from './graph'
import {Span} from './span'
import Mousetrap from 'mousetrap'
import $ from 'jquery'
import {mod_service} from './mod_service'
import modgraphGML  from './grammars/modgraph-gml'
import modruleGML  from './grammars/modrule-gml'
import {saveAs} from 'file-saver'

document.addEventListener('DOMContentLoaded', function () {
    console.log(MODviz)
    var mograph = window.modgraph = new MODviz.Graph(document.getElementById('cy'));


    // document.querySelector('#save').addEventListener('click', function () {
    // 	var blob = new Blob([JSON.stringify(cy.json())], { type: "text/plain;charset=utf-8" });
    // 	saveAs(blob, "cyGraph.json");

    // });

    document.querySelector('#makeRule').addEventListener('click', function () {
        var gmlrule = modgraph.toGMLRule();
        var blob = new Blob([gmlrule], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "rule.gml");
    });

    document.querySelector('#saveModGraph').addEventListener('click', function () {
        var gmlgraph = modgraph.toGMLGraph();
        var blob = new Blob([gmlgraph], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "graph.gml");
    });

    document.querySelector("#btnRelabel").addEventListener("click", function (event) {
        var txtLbl = document.querySelector('#txtRelabel').value;

        modgraph.renameSelected(txtLbl);
        $("#modalRename").modal("hide");
    });

    // document.querySelector('#inputLoadCyGraph').addEventListener('change', function (event) {
    // 	var input = event.target;

    // 	var reader = new FileReader();
    // 	reader.onload = function () {
    // 		var text = reader.result;
    // 		var jsonEles = JSON.parse(text);
    // 		readJson(cy, jsonEles);
    // 	};
    // 	reader.readAsText(input.files[0]);
    // });

    document.querySelector('#inputLoadRule').addEventListener('change', function (event) {
        var input = event.target;

        var reader = new FileReader();
        reader.onload = function () {
            var text = reader.result;
            var data = {
                "type": "ruleGML",
                "data": text
            };
            mod_service.send("getRuleCoords", data, function (response) {
                try {
                    var jRule = modruleGML.parse(response.ruleGML);
                } catch (e) {
                    console.log(e);
                    return;
                }
                // readRuleJson(cy, jRule);
                modgraph.readJsonRule(jRule);
            });
        };
        reader.readAsText(input.files[0]);
    });

    document.querySelector('#inputLoadModGraph').addEventListener('change', function (event) {
        var input = event.target;

        var reader = new FileReader();
        reader.onload = function () {
            var text = reader.result;
            var data = {
                "type": "graphGML",
                "data": text
            };
            mod_service.send("getGraphCoords", data, function (response) {
                try {
                    var jsonGraph = modgraphGML.parse(response.graphGML);
                } catch (e) {
                    console.log(e);
                    return;
                }
                // readModGraph(cy, jsonGraph);
                modgraph.readJsonGraph(jsonGraph);
            });
        };
        reader.readAsText(input.files[0]);
    });

    document.getElementById('btnCopy').addEventListener('click', function (e) {
        modgraph.copySelected();
    });

    document.getElementById('btnPaste').addEventListener('click', function (e) {
        modgraph.paste();
    });

    document.getElementById('btnUndo').addEventListener('click', function (e) {
        modgraph.undo();
    });

    document.getElementById('btnRedo').addEventListener('click', function (e) {
        modgraph.redo();
    });

    document.querySelector('#btnClearGraph').addEventListener('click', function (event) {
        modgraph.clear();
    });

    // document.querySelector('#btnGraphCoord').addEventListener('click', function (event) {
    // 	var graph = new ModGraph(cy);
    // 	var data = {
    // 		"type": "graphGML",
    // 		"data": graph.toString()
    // 	};
    // 	mod_service.send("getGraphCoords", data, function(response) {
    // 		try {
    // 			var jsonGraph = GML_GRAPH.parse(response.graphGML);
    // 		} catch(e) {
    // 			console.log(e);
    // 			return;
    // 		}
    // 		readModGraph(cy, jsonGraph);
    // 	});
    // });


    document.querySelector('#btnRuleCoord').addEventListener('click', function (event) {
        var data = {
            "type": "ruleGML",
            "data": modgraph.toGMLRule()
        };
        mod_service.send("getRuleCoords", data, function (response) {
            try {
                console.log(response);
                var jRule = modruleGML.parse(response.ruleGML);
                console.log(jRule);
            } catch (e) {
                console.log(e);
                return;
            }
            // readRuleJson(cy, jRule);
            modgraph.readJsonRule(jRule);
        });
    });

    document.querySelector('#btnViewerGraph').addEventListener('click', function (event) {


        var divGraph = document.getElementById("cy");
        divGraph.style.display = "flex";
        var divSpan = document.getElementById('cySpan');
        divSpan.style.display = "none";

        var btnGraphViewer = document.getElementById("btnViewerGraph");
        var btnSpanViewer = document.getElementById("btnViewerSpan");
        btnGraphViewer.classList.add("active");
        btnSpanViewer.classList.remove("active");

        var tmp = modgraph;
        modgraph = new Graph(divGraph);
        modgraph.readDPOSPan(tmp);
        tmp.destroy();
    });


    document.querySelector('#btnViewerSpan').addEventListener('click', function (event) {

        var divGraph = document.getElementById("cy");
        divGraph.style.display = "none";
        var divSpan = document.getElementById('cySpan');
        divSpan.style.display = "flex";

        var btnGraphViewer = document.getElementById("btnViewerGraph");
        var btnSpanViewer = document.getElementById("btnViewerSpan");
        btnGraphViewer.classList.remove("active");
        btnSpanViewer.classList.add("active");

        var divL = document.getElementById("cySpanLeft");
        var divK = document.getElementById("cySpanMiddle");
        var divR = document.getElementById("cySpanRight");

        var tmp = modgraph;
        modgraph = new Span(divL, divK, divR);
        modgraph.readModGraph(tmp);
        tmp.destroy();
    });

    //document.querySelector('#btnViewerSpan').click();

    document.getElementById('btnChemView').addEventListener('click', function (event) {
        modgraph.toggleChemView();
        var btn = document.getElementById('btnChemView');
        btn.classList.toggle("active");
    });

    document.getElementById('btnConstraintsView').addEventListener('click', function (event) {
        modgraph.toggleShowConstraints();
        event.srcElement.classList.toggle('active');
    });


    //Rename Nodes Modal
    $("#modalRename").on("shown.bs.modal", function (e) {
        document.getElementById('txtRelabel').focus();
    });

    Mousetrap(document.getElementById('txtRelabel')).bind('enter', function (e) {
        document.getElementById('btnRelabel').click();
    });

    $("#modalSmiles").on("shown.bs.modal", function (e) {
        document.getElementById('txtSmiles').focus();
    });

    // Smiles Modal
    document.getElementById('btnSmiles').addEventListener('click', function (e) {
        var data = {
            "type": "smiles",
            "data": document.getElementById('txtSmiles').value
        };
        mod_service.send("getGraphCoords", data, function (response) {
            try {
                console.log(response);
                var gRule = modgraphGML.parse(response.graphGML);
                console.log(gRule);
            } catch (e) {
                console.log(e);
                return;
            }
            // readRuleJson(cy, jRule);
            modgraph.addJsonGraph(gRule);
            document.querySelector('#btnRuleCoord').click();
            $("#modalSmiles").modal("hide");
        });
    });

    Mousetrap(document.getElementById('txtSmiles')).bind('enter', function(e) {
        document.getElementById('btnSmiles').click();
    });

    //Constraints Modal

    function addRowConstraint() {
        var divRow = document.getElementById('constraintRowTemplate');
        var divConstraintsContainer = document.getElementById("containerConstraints");
        divConstraintsContainer.innerHTML += divRow.innerHTML;

        var rows = divConstraintsContainer.getElementsByClassName("btnConstraintRemove");
        for (var i = 0; i < rows.length; i++) {
            rows[i].addEventListener('click', function (event) {
                event.currentTarget.parentNode.parentNode.remove();
            });
        }

        //console.log(divConstraintsContainer.getElementsByClassName("row")[0]);
        //$('select').selectpicker();
    }

    // document.getElementsByClassName("btnConstraintRemove")[0].addEventListener('click', function (event) {
    // 	event.currentTarget.parentNode.parentNode.remove();
    // });

    document.getElementById("btnConstraintAddRow").addEventListener('click', function (e) {
        addRowConstraint();
    });


    document.getElementById("btnAddConstraints").addEventListener('click', function (e) {
        var container = document.getElementById("containerConstraints");
        var rows = container.getElementsByClassName("row");

        var constraints = []
        for (var i = 0; i < rows.length; i++) {
            console.log("PARSING CONSTRAINT", i, rows.length);
            var op = rows[i].getElementsByTagName('select')[0].value;

            var inputs = rows[i].getElementsByTagName("input");
            var count = inputs[0].value;
            var nodeLabels = inputs[1].value.split(",");
            var edgeLabels = inputs[2].value.split(",");
            if (nodeLabels.length == 1 && nodeLabels[0] == "") {
                nodeLabels = [];
            }
            if (edgeLabels.length == 1 && edgeLabels[0] == "") {
                edgeLabels = [];
            }

            constraints.push({
                op: op,
                count: count,
                nodeLabels: nodeLabels,
                edgeLabels: edgeLabels
            });
        }
        console.log('Setting Constraints');
        console.log(constraints);
        modgraph.setConstraintsSelected(constraints);
        $("#modalConstraints").modal("hide");
    });
    $("#modalConstraints").on("shown.bs.modal", function (e) {
        addRowConstraint()
    });
    $("#modalConstraints").on("hide.bs.modal", function (e) {
        var container = document.getElementById("containerConstraints");
        container.innerHTML = "";
    });

});