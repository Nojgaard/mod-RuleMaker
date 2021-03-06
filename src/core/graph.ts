import jquery from 'jquery'
import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import undoRedo from 'cytoscape-undo-redo'
import clipboard from 'cytoscape-clipboard'
import popper from 'cytoscape-popper';
import nodeHtmlLabel from 'cytoscape-node-html-label';
import $ from 'jquery'

import LabelData from './label'
import defaultStyles from './default-styles'

cytoscape.use(edgehandles);
cytoscape.use(popper)
cytoscape.use(undoRedo);
clipboard(cytoscape, jquery);
nodeHtmlLabel(cytoscape);

// declare module cytoscape {
//     interface Core {
//         id?: number;
//         mouseX?: number;
//         mouseY?: number;
//     }
// }

class Graph {
    cy: cytoscape.Core;
    id: number;
    showChemView: boolean;
    showConstraints: boolean;
    eh: any;
    cb: any;
    ur: any;
    poppers: {popper: any, handle: any, node: any}[];

    constructor(container, opts: any = {}) {
        let self = this;

        const defaults = {
            label: function (data) {
                return data.labelData.toHTML();
            },

            style: [],

            edgeHandleOpts: {
                preview: true,
                edgeParams: function (source, target, t) {
                    console.log("adding edge: (", source.id(), ",", target.id(), ")");
                    var srcT = source.data("type");
                    var tarT = target.data("type");
                    if (srcT === LabelData.TYPE.CREATE || tarT === LabelData.TYPE.CREATE) {
                        var rawLabel = '/-';
                    } else if (srcT === LabelData.TYPE.REMOVE || tarT === LabelData.TYPE.REMOVE) {
                        var rawLabel = '-/';
                    } else {
                        var rawLabel = '-';
                    }
                    return self.cyEdge(rawLabel, source.id(), target.id());
                },
                addEles: function (cy, eles) {
                    return self.ur.do("add", eles);
                }
            },

            dblclick: function (pos) {
                self.addNode("C", pos).select();
            },

            mousepos: function (pos) {
                self.cy["mouseX"] = pos.x;
                self.cy["mouseY"] = pos.y;
            },
        };
        opts = $.extend(defaults, opts);

        this.cy = cytoscape({
            container: container,

            layout: {
                name: 'grid',
                rows: 2,
                cols: 2
            },

            style: defaultStyles.concat(opts.style),

            elements: {
                nodes: [
                    {
                        data: {
                            id: "0", type: "STATIC", labelData: new LabelData("C"),
                            constraints: [
                                { op: ">", count: 2, nodeLabels: ["C"], edgeLabels: [] },
                                { op: ">", count: 2, nodeLabels: ["C"], edgeLabels: [] }
                            ]
                        }
                    },
                    { data: { id: "1", type: "STATIC", labelData: new LabelData("C") } },
                ],
                edges: [
                    { data: { source: "0", target: "1", label: "=", type: "STATIC", chemview: true, labelData: new LabelData("=") } }
                ]
            },
            // renderer: {
            //     name: 'canvas',
            //     showFps: true
            //   },
        });

        this.eh = this.cy['edgehandles'](opts.edgeHandleOpts);

        let tappedBefore = null;
        let tappedTimeout;
        this.cy.on('tap', function (event) {
            if (event.target !== self.cy) {
                return;
            }
            let tappedNow = event.target;
            if (tappedTimeout && tappedBefore) {
                clearTimeout(tappedTimeout);
            }
            if (tappedBefore === tappedNow) {
                tappedBefore = null;
                let pos = event.renderedPosition;
                // n = addNode(cy, pos);
                opts.dblclick(pos);
            } else {
                tappedTimeout = setTimeout(function () { tappedBefore = null; }, 300);
                tappedBefore = tappedNow;
            }
        });

        this.cy.on('mousemove', function onmousemove(e) {
            let pos = e.position;
            opts.mousepos(pos);
        });

        this.id = this.cy.nodes(":selectable").length
        this.showChemView = true;
        this.showConstraints = true;


        this.cb = this.cy["clipboard"]({
            oldIdToNewId: function (cb) {
                var idMap = new Map();
                cb.nodes.forEach(n => {
                    idMap.set(n.data.id, self.id);
                    self.id += 1;
                });
                return idMap;
            },
        });

        this.ur = this.cy["undoRedo"]({
            isDebug: true,
            // actions: {},// actions to be added
            undoableDrag: false, // Whether dragging nodes are undoable can be a function as well
            stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
            ready: function () { // callback when undo-redo is ready
            }
        });

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

        this.cy["nodeHtmlLabel"]([
            {
                query: 'node[labelData]', // cytoscape query selector
                halign: 'center', // title vertical position. Can be 'left',''center, 'right'
                valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
                halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
                valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
                cssClass: 'html-node', // any classes will be as attribute of <div> container for every title
                tpl(data) {
                    return opts.label(data) // your html template here
                }
            }
        ]);

        this.poppers = [];
        this.updatePoppers();
    }

    updatePoppers() {

        // console.log("Updating Poppers");
        var self = this;
        this.poppers.forEach(p => {
            p.popper.destroy();
            self.cy.removeListener('position pan zoom resize', p.handle);
        });
        this.poppers = [];
        console.log("NUM LISTENERS ", this.cy["emitter"]().listeners.length);
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
        var self = this;

        this.cy.nodes(":visible[constraints]").forEach(node => {
            console.log("adding popper");
            let popper = node["popper"]({
                content: () => {
                    let div = document.createElement('div');

                    div.innerHTML = makeTable(node.data("constraints"));

                    document.body.appendChild(div);

                    return div;
                },
                popper: {
                    placement: 'bottom',
                    modifiers: {
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: self.cy.container(),
                            padding: 0,
                            escapeWithReference: true
                        },
                        hide: {
                            enabled: true
                        },
                        flip: {
                            enabled: false
                        },

                    },
                    removeOnDestroy: true,
                },
            });

            let update = () => {
                popper.scheduleUpdate();
            };

            node.on('position', update);

            this.cy.on('pan zoom resize', update);

            this.poppers.push({
                popper: popper,
                handle: update,
                node: node
            });
        });

    }

    clear() {
        var eles = this.cy.elements();
        this.ur.do('remove', eles);
        //this.cy.id = 0;
        this.updatePoppers();
    }

    cyNode(rawLabel, pos, useRenderedPosition = true) {
        //var label = new Label(rawLabel);
        let labelData = new LabelData(rawLabel, "node");
        let n = {
            group: 'nodes',
            data: {
                id: this.id,
                type: labelData.type,
                labelData: labelData
            },

        };
        if (!useRenderedPosition) {
            n["position"] = pos;
        } else {
            n["renderedPosition"] = { x: pos.x, y: pos.y };
        }
        this.id = this.id + 1;
        return n;
    }

    cyEdge(rawLabel, src, tar, lblFun = function (lbl) { return lbl.toString(); }) {
        var label = new LabelData(rawLabel, "edge");
        var e = {
            group: 'edges',
            data: {
                source: src,
                target: tar,
                label: lblFun(label),
                type: label.type,
                chemview: this.showChemView,
                labelData: label
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
            var scaledPos = { x: node.position.x * 100, y: node.position.y * 100 };
            var n = self.cyNode(rawLabel, scaledPos, false);
            node.cyNode = n;
            eles.nodes.push(n);
        });

        edges.forEach(function (edge, key) {
            let src = nodes.get(edge.src).cyNode.data.id;
            let tar = nodes.get(edge.tar).cyNode.data.id;
            let strLbl = edge.left + "/" + edge.right;
            if (edge.left === edge.right) {
                strLbl = edge.left;
            }
            let e = self.cyEdge(strLbl, src, tar, lblFun);
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
        console.log("adding node with id: " + String(this.id))
        // var n = this.cy.add(this.cyNode(lbl, pos));
        var n = this.ur.do("add", this.cyNode(lbl, pos));
        return n;
    }

    setConstraintsSelected(constraints) {
        var eles = this.cy.nodes(':selected');
        console.log("WOS", constraints);
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


        let nodeData = new LabelData(rawLabel, "node");
        let edgeData = new LabelData(rawLabel, "edge");
        let nodes = this.cy.nodes(":selected");
        let edges = this.cy.edges(':selected');

        let type = nodeData.type;

        let edgeCreate = this.cy.edges().filter(e => {
            var srcT = e.source().selected() ? type : e.source().data("type");
            var tarT = e.target().selected() ? type : e.target().data("type");
            return srcT === LabelData.TYPE.CREATE || tarT === LabelData.TYPE.CREATE;
        });

        let edgeRemove = this.cy.edges().filter(e => {
            var srcT = e.source().selected() ? type : e.source().data("type");
            var tarT = e.target().selected() ? type : e.target().data("type");
            return srcT === LabelData.TYPE.REMOVE || tarT === LabelData.TYPE.REMOVE;
        });

        var actionList = [
            {
                name: "data", param: {
                    name: "label",
                    eles: edges,
                    data: lblFun(edgeData)
                }
            },
            {
                name: "data", param: {
                    name: "labelData",
                    eles: nodes,
                    data: nodeData
                }
            },
            {
                name: "data", param: {
                    name: "labelData",
                    eles: edges,
                    data: edgeData
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: nodes.merge(edges),
                    data: type
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: edgeCreate,
                    data: LabelData.TYPE.CREATE
                }
            },
            {
                name: "data", param: {
                    name: "type",
                    eles: edgeRemove,
                    data: LabelData.TYPE.REMOVE
                }
            },
        ]

        this.ur.do("batch", actionList);
    }

    addJsonGraph(jsonGraph) {
        console.log("ModGraph.addJsonGraph()");

        var eles = this.jsonGraphToCyEles(jsonGraph);
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
        let self = this;
        var lay = this.cy.layout({
            name: 'preset',
            padding: 50,
            positions: function (nodeid) {
                return self.cy.getElementById(nodeid).position();
            }
        });
        lay.run();
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
        let self = this;
        let lay = this.cy.layout({
            name: 'preset',
            padding: 50,
            positions: function (nodeid) {
                return self.cy.getElementById(nodeid).position();
            }
        });
        lay.run();
        this.updatePoppers();
    }

    prepareLabels() {
        this.cy.elements().forEach(e => {
            var type = e.data("type");
            var label = e.data("label");
            if (type === LabelData.TYPE.CREATE && label.slice(0, 1) !== "/") {

                label = "/" + label;
            } else if (type === LabelData.TYPE.REMOVE && label.slice(-1) !== "/") {
                label = label + "/";
            }
            e.data("rawLabel", label);
        });
    }

    toGMLGraph() {
        // this.prepareLabels();
        var out = [];
        out.push("graph [");
        this.cy.nodes(":selectable").forEach(node => {
            var lbl = node.data("labelData").rawLabel;
            var id = node.data("id");
            out.push("    node [ id " + id + " label \"" + lbl + "\" ]");
        });

        this.cy.edges(":selectable[label]").forEach(edge => {
            var lbl = edge.data("labelData").rawLabel;
            var src = edge.source().data("id");
            var tar = edge.target().data("id");
            out.push("    edge [ source " + src + " target " + tar + " label \"" + lbl + "\" ]");
        });
        out.push("]");
        return out.join("\n");
    }

    toGMLRule() {
        // this.prepareLabels();
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
            let lbl = node.data("labelData");
            let id = node.data("id");

            if (lbl.type === LabelData.TYPE.STATIC) {
                rule.context.nodes.push({ id: id, label: lbl.left.toString() });
            } else if (lbl.type === LabelData.TYPE.CREATE) {
                rule.right.nodes.push({ id: id, label: lbl.right.toString() });
            } else if (lbl.type === LabelData.TYPE.REMOVE) {
                rule.left.nodes.push({ id: id, label: lbl.left.toString() });
            } else if (lbl.type === LabelData.TYPE.RENAME) {
                rule.left.nodes.push({ id: id, label: lbl.left.toString() });
                rule.right.nodes.push({ id: id, label: lbl.right.toString() });
            }
        });

        this.cy.edges(":selectable[labelData]").forEach(edge => {
            let lbl = edge.data("labelData");
            let src = edge.source().data("id");
            let tar = edge.target().data("id");
            if (lbl.type === LabelData.TYPE.STATIC) {
                rule.context.edges.push({ src: src, tar: tar, label: lbl.left.toString() });
            } else if (lbl.type === LabelData.TYPE.CREATE) {
                rule.right.edges.push({ src: src, tar: tar, label: lbl.right.toString() });
            } else if (lbl.type === LabelData.TYPE.REMOVE) {
                rule.left.edges.push({ src: src, tar: tar, label: lbl.left.toString() });
            } else if (lbl.type === LabelData.TYPE.RENAME) {
                rule.left.edges.push({ src: src, tar: tar, label: lbl.left.toString() });
                rule.right.edges.push({ src: src, tar: tar, label: lbl.right.toString() });
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
                let gmlnl:string[] = []
                c.nodeLabels.forEach(l => { gmlnl.push("label \"" + l + "\"") });
                let gmlnlStr = "[ " + gmlnl.join(" ") + " ]";

                let gmlel = []
                c.edgeLabels.forEach(l => { gmlel.push("label \"" + l + "\"") });
                let gmlelStr = "[ " + gmlel.join(" ") + " ]";

                output.push(`constrainAdj [ id ${n.id()} op "${c.op}" count ${c.count} nodeLabels ${gmlnlStr} edgeLabels ${gmlelStr} ]`)
            });

        });
        output.push("]");
        return output.join("\n");
    }

    readDPOSPan(span) {
        this.cy.remove(this.cy.elements());
        this.id = span.K.cy.nodes().length;
        this.cy.add(span.K.cy.elements(":selectable"));
        this.cy.fit();
        this.showChemView = span.K.showChemView;
        this.showConstraints = span.K.showConstraints;
        this.updatePoppers();
    }

    toggleChemView() {

        this.showChemView = !this.showChemView;
        this.cy.edges(":selectable").forEach(e => { e. data('chemview', this.showChemView); })  
    }

    toggleShowConstraints() {
        this.showConstraints = !this.showConstraints;
        this.updatePoppers();
    }

    destroy() {
        this.poppers.forEach(p => {
            p.popper.destroy();
        });
        this.cy.destroy();
    }
}

export default Graph;