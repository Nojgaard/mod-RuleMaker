import Graph from './graph'
import LabelData from './label'

class Span {
    L: Graph;
    K: Graph;
    R: Graph;

    constructor(containerLeft, containerMiddle, containerRight) {
        let self = this;
        let edgeHandleOpts = {
            edgeParams(sourceNode, targetNode, i) {
                let labelData = null;
                if (sourceNode.data('type') === LabelData.TYPE.CREATE ||
                    targetNode.data('type') === LabelData.TYPE.CREATE) {
                    labelData = new LabelData('/-', 'edge');
                } else if (
                    sourceNode.data('type') === LabelData.TYPE.REMOVE ||
                    targetNode.data('type') === LabelData.TYPE.REMOVE) {
                    labelData = new LabelData('-/', 'edge');
                } else {
                    labelData = new LabelData('-', 'edge');
                }
                return {
                    group: 'edges',
                    data: {
                        source: sourceNode.id(),
                        target: targetNode.id(),
                        label: '-',
                        type: labelData.type,
                        chemview: self.K.showChemView,
                        labelData: labelData,
                    }
                }
            },
            addEles(cy, eles) {
                let gcy = self.L;
                self.graphs().forEach(g => {
                    if (g.cy === cy) { gcy = g; }
                })
                return gcy.ur.do("add", eles);
            },
            complete: function (sourceNode: cytoscape.NodeSingular, targetNode, addedEles) {
                console.log(`adding edge: src=${sourceNode.id()}, tar=${targetNode.id()}`)
                let edge = addedEles[0];

                self.graphs().forEach(g => {
                    if (sourceNode.cy() === g.cy) { return; }
                    g.ur.do("add", {
                        group: 'edges',
                        data: {
                            id: edge.id(),
                            source: sourceNode.id(),
                            target: targetNode.id(),
                            label: edge.data("label"),
                            type: edge.data("type"),
                            chemview: edge.data("chemview")
                        },
                    });
                });
            },
        };

        let onMouseMove = function (pos) {
            self.graphs().forEach(g => {
                g.cy["mouseX"] = pos.x;
                g.cy["mouseY"] = pos.y;
            });
        };
        console.log("Creating DPO Span");
        this.L = new Graph(containerLeft, {
            style: [
                {
                    selector: '[type="CREATE"]',
                    style: {
                        'visibility': 'hidden'
                    }
                }
            ],

            label: function (data) {
                if (data.type === LabelData.TYPE.CREATE) { return ""; }

                return data.labelData.left.toHTML();
            },

            edgeHandleOpts: edgeHandleOpts,

            dblclick: function (pos) {
                self.graphs().forEach(g => {
                    g.addNode("C/", pos).select();
                });
            },

            mousepos: onMouseMove,

        });
        this.K = new Graph(containerMiddle,  {
            style: [
                {
                    selector: '[type="CREATE"],[type="REMOVE"]',
                    style: {
                        'visibility': 'hidden'
                    }
                }
            ],

            label: function (data) {
                if (data.type === LabelData.TYPE.CREATE || data.type === LabelData.TYPE.REMOVE) { return ""; }

                return data.labelData.toHTML();
            },

            edgeHandleOpts: edgeHandleOpts,

            dblclick: function (pos) {
                self.graphs().forEach(g => {
                    g.addNode("C", pos).select();
                });
            },

            mousepos: onMouseMove,
        });

        this.R = new Graph(containerRight, {
            style: [
                {
                    selector: '[type="REMOVE"]',
                    style: {
                        'visibility': 'hidden'
                    }
                }
            ],
            label: function (data) {
                if (data.type === LabelData.TYPE.REMOVE) { return ""; }
                return data.labelData.right.toHTML();
            },

            edgeHandleOpts: edgeHandleOpts,

            dblclick: function (pos) {
                self.graphs().forEach(g => {
                    g.addNode("/C", pos).select();
                });
            },

            mousepos: onMouseMove,
        });

        this.on("drag", function (event) {
            event.cy.nodes(":grabbed").forEach(node => {
                ["L", "K", "R"].forEach(T => {
                    let id = node.id();
                    self[T].cy.getElementById(id).position(node.position());
                })
            });
        });

        let viewportLocked = false;
        this.on("viewport", function (event) {
            if (viewportLocked) { return; }
            viewportLocked = true;
            var zoom = event.cy.zoom();
            var pan = event.cy.pan();

            ["L", "K", "R"].forEach(T => {
                self[T].cy.zoom(zoom, pan);
                self[T].cy.pan(pan);
            });
            viewportLocked = false;
        });

        this.on("select unselect", function (event) {
            var sel = "#" + String(event.target.id());
            if (event.target.group() == "edges") {
                var src = event.target.source().id();
                var tar = event.target.target().id();
                sel = "[source = \"" + src + "\"][target = \"" + tar + "\"]";
            }
            if (event.target.selected()) {
                self.L.cy.elements(sel).select();
                self.K.cy.elements(sel).select();
                self.R.cy.elements(sel).select();
            } else {
                self.L.cy.elements(sel).unselect();
                self.K.cy.elements(sel).unselect();
                self.R.cy.elements(sel).unselect();
            }
        });


        //this.nodeId = this.K.cy.nodes().length;
        self.graphs().forEach(g => {
            g.id = this.K.cy.nodes().length;
        });
    }

    addNode(rawLabel, pos) {
        this.graphs().forEach(g => {
            g.addNode(rawLabel, pos);
        });
        //this.nodeId = this.nodeId + 1;
        // var label = new Label(rawLabel);
        // var self = this

        // this.graphs().forEach(g => {
        //     var nodeLabel = label.toString();
        //     var n = g.cy.add({
        //         group: "nodes",
        //         data: {
        //             label: label.toString(),
        //             id: this.nodeId,
        //             type: label.type,
        //         },
        //         renderedPosition: pos
        //     });
        // });
        // this.nodeId = this.nodeId + 1;

    }

    renameSelected(rawLabel) {
        var self = this;
        this.L.renameSelected(rawLabel, function (lbl) {
            if (lbl.type === LabelData.TYPE.RENAME) {
                return lbl.left.toString();
            } else {
                return lbl.toString();
            };

        });
        this.K.renameSelected(rawLabel);
        this.R.renameSelected(rawLabel, function (lbl) {
            if (lbl.type === LabelData.TYPE.RENAME) {
                return lbl.right.toString();
            } else {
                return lbl.toString();
            };
        });

    }

    copySelected() {
        var self = this;
        this.graphs().forEach(g => {
            g.copySelected(g === self.R);
        });
    }

    paste() {
        var self = this;
        console.log("NODE ID ", this.K.id);
        this.graphs().forEach(g => {
            //g.cy.id = self.nodeId;
            g.paste();
        });
        //this.nodeId = this.K.cy.id;
    }

    clear() {
        this.graphs().forEach(g => {
            g.clear();
        });
    }

    undo() {
        this.graphs().forEach(g => {
            g.undo();
        });
    }

    redo() {
        this.graphs().forEach(g => {
            g.redo();
        });
    }

    on(action, fun) {
        this.graphs().forEach(g => {
            g.cy.on(action, fun);
        });
    }

    removeSelected() {
        console.log("removing selected ", this.K.cy.elements(":selected").length);
        this.graphs().forEach(g => {
            g.removeSelected();
        });
    }

    graphs() {
        return [this.L, this.K, this.R];
    }

    prepareContextLabels() {
        this.K.cy.elements().forEach(e => {
            var type = e.data("type");
            var label = e.data("label");
            if (type === LabelData.TYPE.CREATE && label.slice(0, 1) !== "/") {

                label = "/" + label;
            } else if (type === LabelData.TYPE.REMOVE && label.slice(-1) !== "/") {
                label = label + "/";
            }
            e.data("label", label);
        });
    }

    toGMLGraph() {
        // this.prepareContextLabels();
        return this.K.toGMLGraph();
    }

    toGMLRule() {
        // console.log("DPOSpan: toGMLRule()");
        //this.prepareContextLabels();

        return this.K.toGMLRule();
    }

    addJsonGraph(jsonGraph) {
        console.log("DPOSPan: Adding JSON Graph");
        //this.clear();
        var self = this;
        this.graphs().forEach(g => {
            //g.cy.id = self.nodeId;
            g.addJsonGraph(jsonGraph);
        });
        //this.nodeId = this.K.cy.id;
    }

    readJsonGraph(jsonGraph) {
        console.log("DPOSPan: Reading JSON Graph");
        //this.clear();
        this.graphs().forEach(g => {
            g.readJsonGraph(jsonGraph);
        });
       // this.nodeId = this.K.cy.id;
    }

    readJsonRule(jsonRule) {
        console.log("DPOSpan.readJsonRule()")
        this.L.readJsonRule(jsonRule, function (lbl) {
            if (lbl.type === LabelData.TYPE.RENAME) {
                return lbl.left.toString();
            } else {
                return lbl.toString();
            }
        });
        this.K.readJsonRule(jsonRule);
        this.R.readJsonRule(jsonRule, function (lbl) {
            if (lbl.type === LabelData.TYPE.RENAME) {
                return lbl.right.toString();
            } else {
                return lbl.toString();
            }
        });
        // this.graphs().forEach(g => {
        //     g.readJsonRule(jsonRule);
        // })
        // this.nodeId = this.K.cy.id;
    }

    readModGraph(modgraph: Graph) {
        // this.nodeId = modgraph.cy.id;
        this.graphs().forEach(g => {
            g.cy.remove(g.cy.elements());
            g.cy.add(modgraph.cy.elements(":selectable"));
            g.cy.fit();
            g.showChemView = modgraph.showChemView;
            g.showConstraints = modgraph.showConstraints;
            g.updatePoppers();
            g.id = modgraph.id;
        });

        this.L.cy.edges("[labelData]").forEach(e => {
            let lbl = e.data("labelData");
            if (lbl.type === LabelData.TYPE.RENAME) {
                e.data("label", lbl.left.toString());
            }
        });

        this.R.cy.edges("[labelData]").forEach(e => {
            var lbl = e.data("labelData");
            if (lbl.type === LabelData.TYPE.RENAME) {
                e.data("label", lbl.right.toString());
            }
        });
    }

    setConstraintsSelected(constraints) {
        this.L.setConstraintsSelected(constraints);
        this.K.setConstraintsSelected(constraints);
        this.R.setConstraintsSelected(constraints);
    }


    toggleChemView() {
        this.L.toggleChemView();
        this.K.toggleChemView();
        this.R.toggleChemView();
    }

    toggleShowConstraints() {
        this.L.toggleShowConstraints();
        this.K.toggleShowConstraints();
        this.R.toggleShowConstraints();
    }

    destroy() {
        this.graphs().forEach(g => {
            g.cy.destroy();
            g.poppers.forEach(p => {
                p.popper.destroy();
            });
        });
    }
}

export default Span;