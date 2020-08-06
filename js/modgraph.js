// const LabelType = {
//     STATIC: {
//         color: "#AAAAAA"
//     },
//     REMOVE: {
//         color: "#FF4136"
//     },
//     CREATE: {
//         color: "#2ECC40"
//     },
//     RENAME: {
//         color: "#7FDBFF"
//     }
// }
const LabelType = {
    STATIC: "STATIC",
    REMOVE: "REMOVE",
    CREATE: "CREATE",
    RENAME: "RENAME"
}

class Label {
    constructor(lbl) {
        var splitLbl = lbl.split("/");
        this.left = "";
        this.right = "";
        if (splitLbl.length === 1) {
            this.type = LabelType.STATIC;
            this.left = lbl;
        } else if (splitLbl[0].length === 0) {
            this.type = LabelType.CREATE;
            this.right = splitLbl[1];
        } else if (splitLbl[1].length == 0) {
            this.type = LabelType.REMOVE;
            this.left = splitLbl[0];
        } else {
            this.type = LabelType.RENAME;
            this.left = splitLbl[0];
            this.right = splitLbl[1];
        }
    }

    toString() {
        if (this.left === "") {
            return this.right;
        } else if (this.right === "") {
            return this.left;
        } else {
            return this.left + "/" + this.right;
        }
    }
}



class ModGraph {
    constructor(container, styles = [], addListeners = true) {
        this.cy = cytoscape({
            container: container,

            layout: {
                name: 'grid',
                rows: 2,
                cols: 2
            },

            style: [
                {
                    selector: 'node[label]',
                    style: {
                        'label': 'data(label)',
                        //  'background-color': 'data(color)',
                        "text-valign": "center",
                        "text-halign": "center"

                    }
                },

                {
                    selector: 'edge[label]',
                    style: {
                        'curve-style': 'bezier',
                        'label': function (label) { return (label.data().label + "\n \u2060") },
                        'text-wrap': 'wrap',
                        // 'line-color': 'data(color)',
                        "edge-text-rotation": "autorotate"
                    }
                },
                {
                    selector: 'node[type="STATIC"]',
                    style: {
                        'background-color': '#AAAAAA',

                    }
                },
                {
                    selector: 'node[type="RENAME"]',
                    style: {
                        'background-color': '#7FDBFF',

                    }
                },
                {
                    selector: 'node[type="CREATE"]',
                    style: {
                        'background-color': '#2ECC40',

                    }
                },
                {
                    selector: 'node[type="REMOVE"]',
                    style: {
                        'background-color': '#FF4136',

                    }
                },
                {
                    selector: 'edge[type="STATIC"]',
                    style: {
                        'line-color': '#AAAAAA',

                    }
                },
                {
                    selector: 'edge[type="RENAME"]',
                    style: {
                        'line-color': '#7FDBFF',

                    }
                },
                {
                    selector: 'edge[type="CREATE"]',
                    style: {
                        'line-color': '#2ECC40',

                    }
                },
                {
                    selector: 'edge[type="REMOVE"]',
                    style: {
                        'line-color': '#FF4136',

                    }
                },

                // Some bond styles
                {
                    selector: 'edge[label="-"][?chemview]',
                    style: {
                        'label': ""
                    }
                },
                {
                    selector: 'edge[label="="][?chemview]',
                    style: {
                        'curve-style': 'straight',
                        'label': "",
                        'source-endpoint': '0 25%',
                        'target-endpoint': '0 25%'
                    }
                },
                {
                    selector: 'edge[viz="DBOND"]',
                    style: {
                        'curve-style': 'straight',
                        'label': "",
                        'source-endpoint': '0 -25%',
                        'target-endpoint': '0 -25%'
                    }
                },

                // Some DPO Span Styles
                {
                    selector: '.ghost-elem',
                    style: {
                        'visibility': 'hidden'
                    }
                },


                {
                    selector: 'node:selected',
                    style: {
                        'border-width': '2px',
                        'border-color': '#111111'
                    }
                },
                {
                    selector: 'edge:selected',
                    style: {
                        'line-style': 'dashed'
                    }
                },

                // some style for the extension

                {
                    selector: '.eh-handle',
                    style: {
                        'background-color': '#111111',
                        'width': 12,
                        'height': 12,
                        'shape': 'ellipse',
                        'overlay-opacity': 0,
                        'border-width': 12, // makes the handle easier to hit
                        'border-opacity': 0
                    }
                },

                {
                    selector: '.eh-hover',
                    style: {
                        'background-color': '#111111'
                    }
                },

                {
                    selector: '.eh-source',
                    style: {
                        'border-width': 2,
                        'border-color': '#111111'
                    }
                },

                {
                    selector: '.eh-target',
                    style: {
                        'border-width': 2,
                        'border-color': '#111111'
                    }
                },

                {
                    selector: '.eh-preview, .eh-ghost-edge',
                    style: {
                        'background-color': '#DDDDDD',
                        'line-color': '#DDDDDD',
                        'target-arrow-color': '#DDDDDD',
                        'source-arrow-color': '#DDDDDD'
                    }
                },

                {
                    selector: '.eh-ghost-edge.eh-preview-active',
                    style: {
                        'opacity': 0
                    }
                }
            ].concat(styles),

            elements: {
                nodes: [
                    { data: { id: 0, label: 'C', type: "STATIC" } },
                    { data: { id: 1, label: 'C', type: "STATIC" } },
                ],
                edges: [
                    { data: { source: 0, target: 1, label: "=", type: "STATIC", chemview: true } }
                ]
            },
        });

        var self = this;
        if (addListeners) {
            let defaults = {
                complete: function (sourceNode, targetNode, addedEles) {
                    console.log(`adding edge: src=${sourceNode.id()}, tar=${targetNode.id()}`)
                    var edge = addedEles[0];
                    edge.data("type", LabelType.STATIC);
                    edge.data("label", "-");
                    edge.data("chemview", self.showChemView);
                }
            };
            this.eh = this.cy.edgehandles(defaults);

            var tappedBefore = null;
            var tappedTimeout;
            var self = this;
            this.cy.on('tap', function (event) {
                if (event.target !== self.cy) {
                    return;
                }
                var tappedNow = event.cyTarget;
                if (tappedTimeout && tappedBefore) {
                    clearTimeout(tappedTimeout);
                }
                if (tappedBefore === tappedNow) {
                    tappedBefore = null;
                    var pos = event.renderedPosition;
                    // n = addNode(cy, pos);
                    var n = self.addNode("C", pos);
                    n.select();
                } else {
                    tappedTimeout = setTimeout(function () { tappedBefore = null; }, 300);
                    tappedBefore = tappedNow;
                }
            });

            var onSelect = function (event) {
                var src = event.target.source().id();
                var tar = event.target.target().id();
                var sel = "[source = \"" + src + "\"][target = \"" + tar + "\"]";
                var eles = event.cy.edges(sel);
                if (event.target.selected()) {
                    eles.select();
                } else {
                    eles.unselect();
                }
            }
            this.cy.on("select", "edge", onSelect);
            this.cy.on("unselect", "edge", onSelect);
        }

        this.cy.id = this.cy.nodes(":selectable").length
        this.showChemView = true;
        this.addBondEdges();
    }

    clear() {
        this.cy.elements().remove();
        this.cy.id = 0;
    }

    addNode(lbl, pos) {
        console.log("adding node with id: " + String(this.cy.id))
        var n = this.cy.add({
            group: 'nodes',
            data: {
                label: lbl,
                id: this.cy.id,
                type: LabelType.STATIC
            },
            renderedPosition: { x: pos.x, y: pos.y }
        });
        this.cy.id = this.cy.id + 1;
        return n;
    }

    removeSelected() {
        this.cy.$(':selected').remove();
    }

    renameSelected(rawLabel) {
        // if (rawLabel == "=") {
        //     this.cy.edges('[label != "="]').forEach(e => {
        //         addDoubleBond(modgraph.cy, e);
        //     });
        // }


        var lbl = new Label(rawLabel);
        this.cy.$(':selected').data("type", lbl.type);

        this.cy.$(':selected').data("label", lbl.toString());

        this.cy.edges().forEach(e => {
            var srcT = e.source().data("type");
            var tarT = e.target().data("type");
            var eT = e.data("type");
            if (srcT === LabelType.CREATE || tarT === LabelType.CREATE) {
                e.data("type", LabelType.CREATE);
            } else if (srcT === LabelType.REMOVE || tarT === LabelType.REMOVE) {
                e.data("type", LabelType.REMOVE);
            }
        });

        this.addBondEdges(true);
    }


    readJsonGraph(jsonGraph) {
        console.log("MODGRAPH: readJsonGraph()");
        var cy = this.cy
        var nodes = new Map();
        var edge = new Map();
        var id = jsonGraph.nodes.length;
        var self = this;

        cy.elements().remove();
        cy.id = id;

        jsonGraph.nodes.forEach(node => {
            var id = node.id;
            cy.add({
                group: 'nodes',
                data: {
                    label: node.label,
                    id: id,
                    type: LabelType.STATIC
                },
            });
        });

        jsonGraph.edges.forEach(edge => {
            var src = edge.src;
            var tar = edge.tar;
            var lbl = edge.label
            cy.add({
                group: 'edges',
                data: {
                    source: src,
                    target: tar,
                    label: lbl,
                    type: LabelType.STATIC,
                    chemview: self.showChemView
                }
            });
        });


        var positions = []
        jsonGraph.nodes.forEach(function (node) {
            positions.push({
                x: node.position.x * 100.,
                y: node.position.y * 100.
            })
            // node.position.x = node.position.x * 100.;
            // node.position.y = node.position.y * 100.;

        });

        this.addBondEdges();

        var lay = cy.layout({
            name: 'preset',
            padding: 100,
            positions: function (node) {
                // return jsonGraph.nodes[node.id()].position;
                return positions[node.id()];
            }
        });
        lay.run();
        this.cy.nodes(":selectable").forEach(n => {
            console.log(n.position());
        });
        // this.cy.fit();
    }

    readJsonRule(jsonRule) {
        var cy = this.cy
        var nodes = new Map();
        var edges = new Map();
        var id = 0;
        var self = this;
        //console.log(jsonRule);
        ["left", "context", "right"].forEach(T => {
            jsonRule[T].nodes.forEach(node => {
                if (node.id >= id) { id = node.id + 1; }
                nodes.set(node.id, { id: node.id, left: "", right: "", position: node.position });
            });
            jsonRule[T].edges.forEach(edge => {
                edges.set([edge.src, edge.tar].join(","), { src: edge.src, tar: edge.tar, left: "", right: "" });
            });
        });
        jsonRule.left.nodes.forEach(node => {
            var id = node.id;
            nodes.get(id).left = node.label;
        });
        jsonRule.right.nodes.forEach(node => {
            var id = node.id;
            nodes.get(id).right = node.label;
        });
        jsonRule.context.nodes.forEach(node => {
            var id = node.id;
            nodes.get(id).left = node.label;
            nodes.get(id).right = node.label;
        });

        jsonRule.left.edges.forEach(edge => {
            var id = [edge.src, edge.tar].join(",");
            edges.get(id).left = edge.label;
        });
        jsonRule.right.edges.forEach(edge => {
            var id = [edge.src, edge.tar].join(",");
            edges.get(id).right = edge.label;
        });
        jsonRule.context.edges.forEach(edge => {
            var id = [edge.src, edge.tar].join(",");
            edges.get(id).left = edge.label;
            edges.get(id).right = edge.label;
        });
        cy.elements().remove();
        cy.id = nodes.size;

        var positions = [];
        nodes.forEach(function (node, key) {
            var id = node.id;
            var strLbl = node.left + "/" + node.right;
            if (node.left === node.right) {
                strLbl = node.left;
            }
            var lbl = new Label(strLbl);
            cy.add({
                group: 'nodes',
                data: {
                    label: lbl.toString(),
                    id: id,
                    type: lbl.type
                }
            });
            node.scaledPos = {
                x: node.position.x * 100.,
                y: node.position.y * 100.
            };
            // node.position.x = node.position.x * 100.;
            // node.position.y = node.position.y * 100.;
        });

        edges.forEach(function (edge, key) {
            var src = edge.src;
            var tar = edge.tar;
            var strLbl = edge.left + "/" + edge.right;
            if (edge.left === edge.right) {
                strLbl = edge.left;
            }
            var lbl = new Label(strLbl);
            cy.add({
                group: 'edges',
                data: {
                    source: src,
                    target: tar,
                    label: lbl.toString(),
                    type: lbl.type,
                    chemview: self.showChemView
                }
            });
        });

        this.addBondEdges();

        var nodes_ = nodes;
        var lay = cy.layout({
            name: 'preset',
            padding: 100,
            positions: function (node) {
                return nodes.get(parseInt(node.id())).scaledPos;
                // return positions[node.id()];
            }
        });
        lay.run();
        // var lay = cy.layout({ name: 'circle' });
        // lay.run();
    }

    prepareLabels() {
        this.cy.elements().forEach(e => {
            var type = e.data("type");
            var label = e.data("label");
            if (type === LabelType.CREATE && label.slice(0, 1) !== "/") {

                label = "/" + label;
            } else if (type === LabelType.REMOVE && label.slice(-1) !== "/") {
                label = label + "/";
            }
            e.data("rawLabel", label);
        });
    }

    addBondEdges(selectCreated = false) {
        if (!this.showChemView) {
            return;
        }
        this.cy.edges('[viz]').remove();
        var doubleBonds = this.cy.edges(':selectable[label="="]');
        console.log(doubleBonds.length);
        doubleBonds.forEach(edge => {
            var vizedge = this.cy.add({
                group: 'edges',
                data: {
                    source: edge.source().id(),
                    target: edge.target().id(),
                    type: edge.data("type"),
                    viz: "DBOND"
                }
            });
            if (selectCreated) {
                vizedge.select();
            }
        });
    }

    toGMLGraph() {
        this.prepareLabels();
        var out = [];
        out.push("graph [");
        this.cy.nodes(":selectable").forEach(node => {
            var lbl = node.data("rawLabel");
            var id = node.data("id");
            out.push("    node [ id " + id + " label \"" + lbl + "\" ]");
        });

        this.cy.edges(":selectable[label]").forEach(edge => {
            var lbl = edge.data("rawLabel");
            var src = edge.source().data("id");
            var tar = edge.target().data("id");
            out.push("    edge [ source " + src + " target " + tar + " label \"" + lbl + "\" ]");
        });
        out.push("]");
        return out.join("\n");
    }

    toGMLRule() {
        this.prepareLabels();
        var rule = {
            left: {
                nodes: [],
                edges: []
            },
            context: {
                nodes: [],
                edges: []
            },
            right: {
                nodes: [],
                edges: []
            }
        };

        this.cy.nodes(":selectable").forEach(node => {
            var lbl = new Label(node.data("rawLabel"));
            var id = node.data("id");

            if (lbl.type === LabelType.STATIC) {
                rule.context.nodes.push({ id: id, label: lbl.left });
            } else if (lbl.type === LabelType.CREATE) {
                rule.right.nodes.push({ id: id, label: lbl.right });
            } else if (lbl.type === LabelType.REMOVE) {
                rule.left.nodes.push({ id: id, label: lbl.left });
            } else if (lbl.type === LabelType.RENAME) {
                rule.left.nodes.push({ id: id, label: lbl.left });
                rule.right.nodes.push({ id: id, label: lbl.right });
            }
        });

        this.cy.edges(":selectable[label]").forEach(edge => {
            var lbl = new Label(edge.data("rawLabel"));
            var src = edge.source().data("id");
            var tar = edge.target().data("id");
            if (lbl.type === LabelType.STATIC) {
                rule.context.edges.push({ src: src, tar: tar, label: lbl.left });
            } else if (lbl.type === LabelType.CREATE) {
                rule.right.edges.push({ src: src, tar: tar, label: lbl.right });
            } else if (lbl.type === LabelType.REMOVE) {
                rule.left.edges.push({ src: src, tar: tar, label: lbl.left });
            } else if (lbl.type === LabelType.RENAME) {
                rule.left.edges.push({ src: src, tar: tar, label: lbl.left });
                rule.right.edges.push({ src: src, tar: tar, label: lbl.right });
            }
        });

        var output = [];
        output.push("rule [");
        output.push("  ruleID \"TEST\"");
        ["left", "context", "right"].forEach(T => {
            output.push("  " + T + " [");
            rule[T].nodes.forEach(function (node) {
                output.push("    node [ id " + node.id + " label \"" + node.label + "\" ]");
            });
            rule[T].edges.forEach(function (edge) {
                output.push("    edge [ source " + edge.src + " target " + edge.tar + " label \"" + edge.label + "\" ]");
            });
            output.push("  ]");
        });
        output.push("]");
        return output.join("\n");
    }

    readDPOSPan(span) {
        this.clear();
        this.cy.id = span.K.cy.nodes().length;
        this.cy.add(span.K.cy.elements(":selectable"));
        this.cy.fit();
    }

    toggleChemView() {
        if (this.showChemView) {
            this.showChemView = false;
            this.cy.edges('[viz]').remove();

        } else {
            this.showChemView = true;
            this.addBondEdges();
        }

        this.cy.edges(":selectable[^viz]").data('chemview', this.showChemView);
    }

    destroy() {
        this.cy.destroy();
    }
}

