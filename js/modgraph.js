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
                        'color': '#343a40',
                        //  'background-color': 'data(color)',
                        "text-valign": "center",
                        "text-halign": "center"

                    }
                },

                {
                    selector: 'edge[label]',
                    style: {
                        //  'curve-style': 'bezier',
                        'curve-style': 'haystack',
                        'haystack-radius': '0',
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
                        'curve-style': 'segments',
                        'label': "",
                        'segment-weights': '0 1.02 1.02 -0.02 1 ',
                        'segment-distances': '5 5 -5 -5 -5 -5',
                        //'segment-weights': '1.02 1.02 -0.02 ',
                        //'segment-distances': '5 -5 -5 -5',
                    }
                },
                {
                    selector: 'edge[label=":"][?chemview]',
                    style: {
                        'curve-style': 'segments',
                        'label': "",
                        'segment-weights': '0 1.02 1.02 -0.02 1 ',
                        'segment-distances': '5 5 -5 -5 -5 -5',
                        'line-style': 'dotted'
                    }
                },
                {
                    selector: 'edge[label="#"][?chemview]',
                    style: {
                        'curve-style': 'segments',
                        'label': "",
                        'segment-weights': '0 1.02 1.02 -0.02 -0.02 ',
                        'segment-distances': '5 5 -5 -5 0',
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
                        'border-color': '#343a40'
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
                        'background-color': '#343a40',
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
                        'background-color': '#343a40'
                    }
                },

                {
                    selector: '.eh-source',
                    style: {
                        'border-width': 2,
                        'border-color': '#343a40'
                    }
                },

                {
                    selector: '.eh-target',
                    style: {
                        'border-width': 2,
                        'border-color': '#343a40'
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
                    {
                        data: {
                            id: 0, label: 'C', type: "STATIC",
                            constraints: [
                                { op: ">", count: 2, nodeLabels: ["C"], edgeLabels: [] },
                                { op: ">", count: 2, nodeLabels: ["C"], edgeLabels: [] }
                            ]
                        }
                    },
                    { data: { id: 1, label: 'C', type: "STATIC" } },
                ],
                edges: [
                    { data: { source: 0, target: 1, label: "=", type: "STATIC", chemview: true } }
                ]
            },
            // renderer: {
            //     name: 'canvas',
            //     showFps: true
            //   },
        });

        var self = this;
        if (addListeners) {
            let defaults = {
                edgeParams: function (source, target, t) {
                    console.log("adding edge: (", source.id(), ",", target.id(), ")");
                    var srcT = source.data("type");
                    var tarT = target.data("type");
                    if (srcT === LabelType.CREATE || tarT === LabelType.CREATE) {
                        var rawLabel = '/-';
                    } else if (srcT === LabelType.REMOVE || tarT === LabelType.REMOVE) {
                        var rawLabel = '-/';
                    } else {
                        var rawLabel = '-';
                    }
                    return self.cyEdge(rawLabel, source.id(), target.id());
                },
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

            var i = 1;
            var onDrag = function (event) {

                event.cy.nodes(":grabbed").forEach(node => {
                    node.data("offset", String(i) + "%");
                    i = i + 1;
                });
            }

            this.cy.on('mousemove', function onmousemove(e) {
                var pos = e.position || e.cyPosition;
                self.cy.mouseX = pos.x;
                self.cy.mouseY = pos.y;
            });
        }

        this.cy.id = this.cy.nodes(":selectable").length
        this.showChemView = true;
        this.showConstraints = true;

        var cbOptions = {

            // The following 4 options allow the user to provide custom behavior to
            // the extension. They can be used to maintain consistency of some data
            // when elements are duplicated.
            // These 4 options are set to null by default. The function prototypes
            // are provided below for explanation purpose only.

            // Function executed on the collection of elements being copied, before
            // they are serialized in the clipboard
            beforeCopy: function (eles) { },
            // Function executed on the clipboard just after the elements are copied.
            // clipboard is of the form: {nodes: json, edges: json}
            afterCopy: function (clipboard) { },
            // Function executed on the clipboard right before elements are pasted,
            // when they are still in the clipboard.
            beforePaste: function (clipboard) {
            },
            oldIdToNewId: function (cb) {
                var idMap = new Map();
                cb.nodes.forEach(n => {
                    idMap.set(n.data.id, self.cy.id);
                    self.cy.id += 1;
                });
                return idMap;
            },
            // Function executed on the collection of pasted elements, after they
            // are pasted.
            afterPaste: function (eles) {

            }
        };

        this.cb = this.cy.clipboard(cbOptions);
        this.poppers = [];
        this.updatePoppers();

        var options = {
            isDebug: true, // Debug mode for console messages
            // actions: {},// actions to be added
            undoableDrag: false, // Whether dragging nodes are undoable can be a function as well
            stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
            ready: function () { // callback when undo-redo is ready

            }
        }

        this.ur = this.cy.ur = this.cy.undoRedo(options); // Can also be set whenever wanted.

        this.ur.action("data", function (args) {
            if (args.firstTime) {
                args.backup = new Map();
                args.eles.forEach(e => {
                    args.backup.set(e.id(), e.data(args.name));
                });
            }
            args.eles.data(args.name, args.data);
            return args;
        }, function (args) {
            args.eles.forEach(e => {
                e.data(args.name, args.backup.get(e.id()));
            });
            return args;
        });

    }

    updatePoppers() {

        // console.log("Updating Poppers");
        this.poppers.forEach(p => {
            p.destroy();
        });
        this.poppers = [];

        if (!this.showConstraints) {
            return;
        }

        var makeTable = function (constraints) {
            var out = [];
            out.push("<div class='constraintDiv'><table class='table table-dark'><tbody>");

            constraints.forEach(c => {
                out.push(`
                <tr class="row">
                    <td >${c.op}</td>
                    <td >${c.count}</td>
                    <td >[ ${String(c.nodeLabels)} ]</td>
                    <td >[ ${String(c.edgeLabels)} ]</td>
                </tr>
                `);
            });
            out.push("</tbody></table></div>");
            return out.join("\n");
        }

        this.cy.nodes(":visible[constraints]").forEach(node => {
            console.log("adding popper");
            let popper = node.popper({
                content: () => {
                    let div = document.createElement('div');

                    div.innerHTML = makeTable(node.data("constraints"));

                    document.body.appendChild(div);

                    return div;
                },
                popper: { placement: 'bottom' }
            });

            let update = () => {
                popper.scheduleUpdate();
            };

            node.on('position', update);

            this.cy.on('pan zoom resize', update);

            this.poppers.push(popper);
        });
    }

    clear() {
        var eles = this.cy.elements();
        this.cy.ur.do('remove', eles);
        //this.cy.id = 0;
        this.updatePoppers();
    }

    cyNode(rawLabel, pos, useRenderedPosition = true) {
        var label = new Label(rawLabel);
        var n = {
            group: 'nodes',
            data: {
                label: label.toString(),
                id: this.cy.id,
                type: label.type
            },

        };
        if (!useRenderedPosition) {
            n.position = pos;
        } else {
            n.renderedPosition = { x: pos.x, y: pos.y };
        }
        this.cy.id = this.cy.id + 1;
        return n;
    }

    cyEdge(rawLabel, src, tar) {
        var label = new Label(rawLabel);
        var e = {
            group: 'edges',
            data: {
                source: src,
                target: tar,
                label: label.toString(),
                type: label.type,
                chemview: this.showChemView
            }
        };
        return e;
    }

    jsonGraphToCyEles(jsonGraph) {
        var jid2cyid = new Map();
        var eles = {
            nodes: [],
            edges: []
        };
        jsonGraph.nodes.forEach(node => {
            var scaledPos = { x: node.position.x * 100, y: node.position.y * 100 };
            var cyn = this.cyNode(node.label, scaledPos, false);
            eles.nodes.push(cyn);
            jid2cyid.set(node.id, cyn.data.id);
        });

        jsonGraph.edges.forEach(edge => {
            var src = jid2cyid.get(edge.src);
            var tar = jid2cyid.get(edge.tar);
            var lbl = edge.label
            eles.edges.push(this.cyEdge(lbl, src, tar));
        });

        return eles;
    }

    jsonRuleToCyEles(jsonRule, lblFun = function (lbl) { return lbl.toString() }) {
        var self = this;
        var eles = {
            nodes: [],
            edges: []
        };

        var nodes = new Map();
        var edges = new Map();

        ["left", "context", "right"].forEach(T => {
            jsonRule[T].nodes.forEach(node => {
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

        nodes.forEach(function (node, key) {
            var rawLabel = node.left + "/" + node.right;
            if (node.left === node.right) {
                rawLabel = node.left;
            }
            var n = self.cyNode(rawLabel, { x: node.position.x * 100, y: node.position.y * 100 }, false);
            node.cyNode = n;
            eles.nodes.push(n);
        });

        edges.forEach(function (edge, key) {
            var src = nodes.get(edge.src).cyNode.data.id;
            var tar = nodes.get(edge.tar).cyNode.data.id;
            var strLbl = edge.left + "/" + edge.right;
            if (edge.left === edge.right) {
                strLbl = edge.left;
            }
            var lbl = new Label(strLbl);
            var e = {
                group: 'edges',
                data: {
                    source: src,
                    target: tar,
                    label: lblFun(lbl),
                    type: lbl.type,
                    chemview: self.showChemView
                }
            };
            eles.edges.push(e);
        });

        jsonRule.constraints.forEach(c => {
            var n = nodes.get(c.id).cyNode;
            if (n.data.constraints === undefined) {
                n.data.constraints = [];
            }
            n.data.constraints.push(c);
        });

        return eles;
    }

    addNode(lbl, pos) {
        console.log("adding node with id: " + String(this.cy.id))
        // var n = this.cy.add(this.cyNode(lbl, pos));
        var n = this.ur.do("add", this.cyNode(lbl, pos));
        return n;
    }

    setConstraintsSelected(constraints) {
        var eles = this.cy.nodes(':selected');
        this.ur.do("data", {
            name: "constraints",
            eles: eles,
            data: constraints
        });
        this.updatePoppers();
    }

    copySelected(unselectCopied = true) {
        var id = this.cb.copy(this.cy.elements(':selected'));
        if (unselectCopied) {
            this.cy.elements(':selected').unselect();
        }

    }

    paste() {
        this.ur.do("paste");
        // this.cb.paste();
        this.updatePoppers();
    }

    undo() {
        this.ur.undo();
        this.updatePoppers();
    }

    redo() {
        this.ur.redo();
        this.updatePoppers();
    }

    removeSelected() {
        var eles = this.cy.$(':selected');
        this.ur.do('remove', eles);
        this.updatePoppers();
    }

    renameSelected(rawLabel, lblFun = function (label) { return label.toString(); }) {


        var lbl = new Label(rawLabel);
        var eles = this.cy.elements(':selected');

        var actionList = [
            {
                name: "data", param: {
                    name: "label",
                    eles: eles,
                    data: lblFun(lbl)
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: eles,
                    data: lbl.type
                }
            },
        ]

        var edgeCreate = this.cy.edges().filter(e => {
            var srcT = e.source().selected() ? lbl.type : e.source().data("type");
            var tarT = e.target().selected() ? lbl.type : e.target().data("type");
            return srcT === LabelType.CREATE || tarT === LabelType.CREATE;
        });

        var edgeRemove = this.cy.edges().filter(e => {
            var srcT = e.source().selected() ? lbl.type : e.source().data("type");
            var tarT = e.target().selected() ? lbl.type : e.target().data("type");
            return srcT === LabelType.REMOVE || tarT === LabelType.REMOVE;
        });


        var actionList = [
            {
                name: "data", param: {
                    name: "label",
                    eles: eles,
                    data: lbl.toString()
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: eles,
                    data: lbl.type
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: edgeCreate,
                    data: LabelType.CREATE
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: edgeRemove,
                    data: LabelType.REMOVE
                }
            },
        ]

        this.cy.ur.do("batch", actionList);
        // this.cy.$(':selected').data("type", lbl.type);
        // this.cy.$(':selected').data("label", lbl.toString());

        // this.cy.edges().forEach(e => {
        //     var srcT = e.source().data("type");
        //     var tarT = e.target().data("type");
        //     var eT = e.data("type");
        //     if (srcT === LabelType.CREATE || tarT === LabelType.CREATE) {
        //         e.data("type", LabelType.CREATE);
        //     } else if (srcT === LabelType.REMOVE || tarT === LabelType.REMOVE) {
        //         e.data("type", LabelType.REMOVE);
        //     }
        // });
    }

    addJsonGraph(jsonGraph) {
        console.log("ModGraph.addJsonGraph()");

        var eles = this.jsonGraphToCyEles(jsonGraph);
        //this.cy.add(eles);
        this.ur.do("add", eles);
    }

    readJsonGraph(jsonGraph) {
        console.log("MODGRAPH: readJsonGraph()");

        var removeEles = this.cy.elements();
        //this.clear();
        var addEles = this.jsonGraphToCyEles(jsonGraph);
        // var layoutArgs = {
        //     options: {
        //         name: 'preset',
        //         padding: 50,
        //         positions: function (node) {
        //             return node.position();
        //         }
        //     }
        // };
        this.ur.do("batch", [
            {
                name: "remove", param: removeEles
            },
            {
                name: "add", param: addEles
            }
        ]);
        var lay = this.cy.layout({
            name: 'preset',
            padding: 50,
            positions: function (node) {
                return node.position();
            }
        });
        lay.run();
        this.updatePoppers();
        this.updatePoppers();
    }

    readJsonRule(jsonRule, lblFun = function (lbl) { return lbl.toString() }) {
        var removeEles = this.cy.elements();
        var addEles = this.jsonRuleToCyEles(jsonRule, lblFun);

        // var layoutArgs = {
        //     options: {
        //         name: 'preset',
        //         padding: 50,
        //         positions: function (node) {
        //             return node.position();
        //         }
        //     }
        // };
        this.ur.do("batch", [
            {
                name: "remove", param: removeEles
            },
            {
                name: "add", param: addEles
            },
            // {
            //     name: "layout", eles: addEles, param: layoutArgs
            // }
        ]);
        var lay = this.cy.layout({
            name: 'preset',
            padding: 50,
            positions: function (node) {
                return node.position();
            }
        });
        lay.run();
        this.updatePoppers();
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
        this.cy.nodes("[constraints]").forEach(n => {
            n.data("constraints").forEach(c => {
                var gmlnl = []
                c.nodeLabels.forEach(l => { gmlnl.push("label \"" + l + "\"") });
                gmlnl = "[ " + gmlnl.join(" ") + " ]";

                var gmlel = []
                c.edgeLabels.forEach(l => { gmlel.push("label \"" + l + "\"") });
                gmlel = "[ " + gmlel.join(" ") + " ]";

                output.push(`constrainAdj [ id ${n.id()} op "${c.op}" count ${c.count} nodeLabels ${gmlnl} edgeLabels ${gmlel} ]`)
            });

        });
        output.push("]");
        return output.join("\n");
    }

    readDPOSPan(span) {
        this.clear();
        this.cy.id = span.K.cy.nodes().length;
        this.cy.add(span.K.cy.elements(":selectable"));
        this.cy.fit();
        this.showChemView = span.K.showChemView;
        this.showConstraints = span.K.showConstraints;
        this.updatePoppers();
    }

    toggleChemView() {

        this.showChemView = !this.showChemView;
        this.cy.edges(":selectable").data('chemview', this.showChemView);
    }

    toggleShowConstraints() {
        this.showConstraints = !this.showConstraints;
        this.updatePoppers();
    }

    destroy() {
        this.cy.destroy();
        this.poppers.forEach(p => {
            p.destroy();
        });
    }
}

