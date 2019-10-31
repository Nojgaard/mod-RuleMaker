
function initCyGraph() {
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

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
                    'background-color': 'data(color)',
    //                 "color": "#fff",
    //                 "text-outline-color": "black",
    //                 "text-outline-width": 1,
                    "text-valign": "center",
      "text-halign": "center"

                }
            },

            {
                selector: 'edge[label]',
                style: {
                    'curve-style': 'bezier',
                    'label': function (label) { return (label.data().label + "\n \u2060")},
                    // 'text-margin-y': '0px',
                    // 'text-margin-x': '0px',
                    'text-wrap': 'wrap',
                    'line-color': 'data(color)',
                    "edge-text-rotation": "autorotate"
                    // "color": "#fff",
                    // "text-outline-color": "black",
                    // "text-outline-width": 1
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
        ],

        elements: {
            nodes: [
                { data: { id: 0, label: '/C', color: LabelType.CREATE.color } },
                { data: { id: 1, label: 'C', color: LabelType.STATIC.color } },
            ],
            edges: [
                { data: { source: 0, target: 1, label: "=", color: LabelType.STATIC.color } }
            ]
        },
    });

    let defaults = {
        complete: function (sourceNode, targetNode, addedEles) {
            edge = addedEles[0];
            edge.data("color", LabelType.STATIC.color);
            edge.data("label", "-");
        }
    };

    cy.id = cy.nodes(":selectable").length
    var eh = cy.edgehandles(defaults);

    return cy;
}

function readJson(cy, jsonEles) {
    cy.elements().remove();
    cy.add(jsonEles.elements)
    cy.id = 0;
    cy.nodes(":selectable").forEach(node => {
        var id = parseInt(node.data("id"));
        if (id >= cy.id) {
            cy.id = id + 1;
        }
    })

    cy.$(":selectable").forEach(ele => {
        var lbl = getLabel(ele.data("label"));
        ele.data("color", lbl.type.color);
    })
}

function readGML(cy, jsonGML) {
    var nodes = new Map();
    var edges = new Map();
    var id = 0;
    ["left", "context", "right"].forEach(T => {
        jsonGML[T].nodes.forEach(node => {
            if (node.id >= id) { id = node.id + 1; }
            nodes.set(node.id, { id: node.id, left: "", right: "" });
        });
        jsonGML[T].edges.forEach(edge => {
            edges.set([edge.src, edge.tar].join(","), { src: edge.src, tar: edge.tar, left: "", right: "" });
        });
    });
    jsonGML.left.nodes.forEach(node => {
        var id = node.id;
        nodes.get(id).left = node.label;
    });
    jsonGML.right.nodes.forEach(node => {
        var id = node.id;
        nodes.get(id).right = node.label;
    });
    jsonGML.context.nodes.forEach(node => {
        var id = node.id;
        nodes.get(id).left = node.label;
        nodes.get(id).right = node.label;
    });

    jsonGML.left.edges.forEach(edge => {
        var id = [edge.src, edge.tar].join(",");
        edges.get(id).left = edge.label;
    });
    jsonGML.right.edges.forEach(edge => {
        var id = [edge.src, edge.tar].join(",");
        edges.get(id).right = edge.label;
    });
    jsonGML.context.edges.forEach(edge => {
        var id = [edge.src, edge.tar].join(",");
        edges.get(id).left = edge.label;
        edges.get(id).right = edge.label;
    });
    cy.elements().remove();
    cy.id = id;

    nodes.forEach(function (node, key) {
        var id = node.id;
        var strLbl = node.left + "/" + node.right;
        if (node.left === node.right) {
            strLbl = node.left;
        }
        var lbl = getLabel(strLbl);
        cy.add({
            group: 'nodes',
            data: {
                label: strLbl,
                id: id,
                color: lbl.type.color
            }
        });
    });

    edges.forEach(function (edge, key) {
        var src = edge.src;
        var tar = edge.tar;
        var strLbl = edge.left + "/" + edge.right;
        if (edge.left === edge.right) {
            strLbl = edge.left;
        }
        var lbl = getLabel(strLbl);
        cy.add({
            group: 'edges',
            data: {
                source: src,
                target: tar,
                label: strLbl,
                color: lbl.type.color
            }
        });
    });


    var lay = cy.layout({ name: 'circle' });
    lay.run();
}

function addNode(cy, pos) {
    var n = cy.add({
        group: 'nodes',
        data: {
            label: "C",
            id: cy.id,
            color: LabelType.STATIC.color
        },
        renderedPosition: { x: pos.x, y: pos.y }
    });
    cy.id = cy.id + 1;
    return n;
}

const LabelType = {
    STATIC: {
        color: "#AAAAAA"
    },
    REMOVE: {
        color: "#FF4136"
    },
    CREATE: {
        color: "#2ECC40"
    },
    RENAME: {
        color: "#7FDBFF"
    }
}

function getLabel(lbl) {
    splitLbl = lbl.split("/");

    out = {
        left: "",
        right: "",
        type: LabelType.STATIC
    }

    if (splitLbl.length === 1) {
        out.type = LabelType.STATIC;
        out.left = lbl;
    } else if (splitLbl[0].length === 0) {
        out.type = LabelType.CREATE;
        out.right = splitLbl[1];
    } else if (splitLbl[1].length == 0) {
        out.type = LabelType.REMOVE;
        out.left = splitLbl[0];
    } else {
        out.type = LabelType.RENAME;
        out.left = splitLbl[0];
        out.right = splitLbl[1];
    }
    return out;
}

class Rule {
    constructor(cy) {
        this.left = {
            nodes: [],
            edges: []
        }
        this.context = {
            nodes: [],
            edges: []
        }
        this.right = {
            nodes: [],
            edges: []
        }
        cy.nodes(":selectable").forEach(node => {
            var lbl = getLabel(node.data("label"));
            var id = node.data("id");

            if (lbl.type === LabelType.STATIC) {
                this.context.nodes.push({ id: id, label: lbl.left });
            } else if (lbl.type === LabelType.CREATE) {
                this.right.nodes.push({ id: id, label: lbl.right });
            } else if (lbl.type === LabelType.REMOVE) {
                this.left.nodes.push({ id: id, label: lbl.left });
            } else if (lbl.type === LabelType.RENAME) {
                this.left.nodes.push({ id: id, label: lbl.left });
                this.right.nodes.push({ id: id, label: lbl.right });
            }
        });

        cy.edges(":selectable").forEach(edge => {
            var lbl = getLabel(edge.data("label"));
            var src = edge.source().data("id");
            var tar = edge.target().data("id");
            if (lbl.type === LabelType.STATIC) {
                this.context.edges.push({ src: src, tar: tar, label: lbl.left });
            } else if (lbl.type === LabelType.CREATE) {
                this.right.edges.push({ src: src, tar: tar, label: lbl.right });
            } else if (lbl.type === LabelType.REMOVE) {
                this.left.edges.push({ src: src, tar: tar, label: lbl.left });
            } else if (lbl.type === LabelType.RENAME) {
                this.left.edges.push({ src: src, tar: tar, label: lbl.left });
                this.right.edges.push({ src: src, tar: tar, label: lbl.right });
            }
        });
    }

    toString() {
        var output = [];
        output.push("rule [");
        output.push("  ruleID \"TEST\"");
        ["left", "context", "right"].forEach(T => {
            output.push("  " + T + " [");
            this[T].nodes.forEach(function (node) {
                output.push("    node [ id " + node.id + " label \"" + node.label + "\" ]");
            });
            this[T].edges.forEach(function (edge) {
                output.push("    edge [ source " + edge.src + " target " + edge.tar + " label \"" + edge.label + "\" ]");
            });
            output.push("  ]");
        });
        output.push("]");
        return output.join("\n");
    }
}
