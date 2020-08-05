class DPOSpan {
    constructor(containerLeft, containerMiddle, containerRight) {
        console.log("Creating DPO Span");
        this.L = new ModGraph(containerLeft, [
            {
                selector: '[type="CREATE"]',
                style: {
                    'visibility': 'hidden'
                }
            }
        ]);
        this.K = new ModGraph(containerMiddle, [
            {
                selector: '[type="CREATE"],[type="REMOVE"]',
                style: {
                    'visibility': 'hidden'
                }
            }
        ]);
        this.R = new ModGraph(containerRight, [
            {
                selector: '[type="REMOVE"]',
                style: {
                    'visibility': 'hidden'
                }
            }
        ]);


        this.L.cy.nodes(":selectable").forEach(node => {
            console.log(node.position());
        });

        var self = this;

        this.eh = [];
        ["L", "K", "R"].forEach(T => {
            let defaults = {
                edgeParams(sourceNode, targetNode, i) {

                    if (sourceNode.data('type') === LabelType.CREATE ||
                        targetNode.data('type') === LabelType.CREATE) {
                        var parsedLabel = new Label('/-');
                    } else if (
                        sourceNode.data('type') === LabelType.REMOVE ||
                        targetNode.data('type') === LabelType.REMOVE) {
                        var parsedLabel = new Label('-/');
                    } else {
                        var parsedLabel = new Label('-');
                    }
                    return {
                        group: 'edges',
                        data: {
                            source: sourceNode.id(),
                            target: targetNode.id(),
                            label: '-',
                            type: parsedLabel.type
                        }
                    }
                },
                complete: function (sourceNode, targetNode, addedEles) {
                    console.log(`adding edge: src=${sourceNode.id()}, tar=${targetNode.id()}`)
                    var edge = addedEles[0];
                    // edge.data("color", LabelType.STATIC.color);
                    // edge.data("label", "-");
                    var src = sourceNode.id();
                    var tar = targetNode.id();
                    ["L", "K", "R"].forEach(U => {
                        if (T === U) { return; }
                        var ns = self[U].cy.nodes(`#${src}, #${tar}`);
                        if (ns.length < 2) {
                            return;
                        }
                        var classes = [];
                        if (ns[0].hasClass("ghost-elem") || ns[1].hasClass("ghost-elem")) {
                            classes.push("ghost-elem")
                        }


                        self[U].cy.add({
                            group: 'edges',
                            data: {
                                id: edge.id(),
                                source: sourceNode.id(),
                                target: targetNode.id(),
                                label: edge.data("label"),
                                type: edge.data("type")
                            },
                            classes: classes
                        });

                    });
                }
            };
            self[T].eh.destroy();
            var eh = self[T].cy.edgehandles(defaults);
            self.eh.push(eh);
        });

        var onDrag = function (event) {

            event.cy.nodes(":grabbed").forEach(node => {
                ["L", "K", "R"].forEach(T => {
                    var id = node.id();
                    self[T].cy.nodes("#" + String(id)).forEach(Tnode => {
                        Tnode.position(node.position());
                    })
                })
            });
        }

        this.L.cy.on("drag", onDrag);
        this.K.cy.on("drag", onDrag);
        this.R.cy.on("drag", onDrag);

        this.viewportLocked = false;

        var onViewport = function (event) {
            if (self.viewportLocked) { return; }
            self.viewportLocked = true;
            var zoom = event.cy.zoom();
            var pan = event.cy.pan();

            ["L", "K", "R"].forEach(T => {
                self[T].cy.zoom(zoom, pan);
                self[T].cy.pan(pan);
            });
            self.viewportLocked = false;
        }

        this.L.cy.on("viewport", onViewport);
        this.K.cy.on("viewport", onViewport);
        this.R.cy.on("viewport", onViewport);

        var onSelect = function (event) {
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
        }
        this.L.cy.on("select", onSelect);
        this.K.cy.on("select", onSelect);
        this.R.cy.on("select", onSelect);
        this.L.cy.on("unselect", onSelect);
        this.K.cy.on("unselect", onSelect);
        this.R.cy.on("unselect", onSelect);

        this.L.cy.removeListener("tap");
        this.K.cy.removeListener("tap");
        this.R.cy.removeListener("tap");

        var tappedBefore = null;
        var tappedTimeout;
        var onTap = function (event) {
            var tar = event.target;
            if (tar !== self.L.cy && tar !== self.K.cy && tar !== self.R.cy) {
                return;
            }
            var tappedNow = event.cyTarget;
            if (tappedTimeout && tappedBefore) {
                clearTimeout(tappedTimeout);
            }
            if (tappedBefore === tappedNow) {
                tappedBefore = null;
                var pos = event.renderedPosition;
                if (tar === self.L.cy) {
                    self.addNode("C/", pos)
                } else if (tar === self.R.cy) {
                    self.addNode("/C", pos);
                } else {
                    self.addNode("C", pos);
                }
                // ["L", "K", "R"].forEach(T => {
                //     var n = self[T].addNode("C", pos);
                //     n.select();
                // });

            } else {
                tappedTimeout = setTimeout(function () { tappedBefore = null; }, 300);
                tappedBefore = tappedNow;
            }
        };

        this.L.cy.on("tap", onTap);
        this.K.cy.on("tap", onTap);
        this.R.cy.on("tap", onTap);




        this.nodeId = this.K.cy.nodes().length;
    }

    addNode(rawLabel, pos) {
        var label = new Label(rawLabel);
        var self = this

        this.graphs().forEach(g => {
            var nodeLabel = label.toString();
            var n = g.cy.add({
                group: "nodes",
                data: {
                    label: label.toString(),
                    id: this.nodeId,
                    type: label.type,
                },
                renderedPosition: pos
            });
        });
        this.nodeId = this.nodeId + 1;

    }

    renameSelected(rawLabel) {
        var self = this;
        var label = new Label(rawLabel);
        this.graphs().forEach(g => {
            g.cy.elements(":selected").forEach(e => {
                var eLabel = label.toString();
                e.data("label", eLabel);
                e.data("type", label.type);
            });
        });

        this.graphs().forEach(g => {
            g.cy.edges().forEach(e => {
                var srcT = e.source().data("type");
                var tarT = e.target().data("type");
                var eT = e.data("type");
                if (srcT === LabelType.CREATE || tarT === LabelType.CREATE) {
                    e.data("type", LabelType.CREATE);
                } else if (srcT === LabelType.REMOVE || tarT === LabelType.REMOVE) {
                    e.data("type", LabelType.REMOVE);
                }
            });
        });
    }

    clear() {
        this.graphs().forEach(g => {
            g.cy.elements().remove();
        });
    }

    removeSelected() {
        console.log("removing selected ", this.K.cy.elements(":selected").length);
        this.graphs().forEach(g => {
            g.cy.elements(":selected").remove();
        });
    }

    graphs() {
        return [this.L, this.K, this.R];
    }

    prepareContextLabels() {
        this.K.cy.elements().forEach(e => {
            var type = e.data("type");
            var label = e.data("label");
            if (type === LabelType.CREATE && label.slice(0,1) !== "/") {

                label = "/" + label;
            } else if (type === LabelType.REMOVE && label.slice(-1) !== "/") {
                label = label + "/";
            }
            e.data("label", label);
        });
    }

    toGMLGraph() {
        this.prepareContextLabels();
        return this.K.toGMLGraph();
    }

    toGMLRule() {
        console.log("DPOSpan: toGMLRule()");
        this.prepareContextLabels();

        return this.K.toGMLRule();
    }

    readJsonGraph(jsonGraph) {
        console.log("DPOSPan: Reading JSON Graph");
        //this.clear();
        this.graphs().forEach(g => {
            g.readJsonGraph(jsonGraph);
        });
        this.nodeId = this.K.cy.nodes().length;
    }

    readJsonRule(jsonRule) {
        this.graphs().forEach(g => {
            g.readJsonRule(jsonRule);
        })
        this.nodeId = this.K.cy.nodes().length;
    }

    readModGraph(modgraph) {
        this.nodeId =  modgraph.cy.nodes().length + 1;
        this.graphs().forEach(g => {
            g.clear();
            g.cy.add(modgraph.cy.elements(":selectable"));
            g.cy.fit();
        });

    }

    destroy() {
        this.graphs().forEach(g => {
            g.cy.destroy();
        });
    }
}