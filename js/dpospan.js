class DPOSpan {
    constructor(containerLeft, containerMiddle, containerRight) {
        console.log("Creating DPO Span");
        this.L = new ModGraph(containerLeft);
        this.K = new ModGraph(containerMiddle);
        this.R = new ModGraph(containerRight);

        this.L.cy.nodes(":selectable").forEach(node => {
            console.log(node.position());
        });

        var self = this;

        this.eh = [];
        ["L", "K", "R"].forEach(T => {
            let defaults = {
                complete: function (sourceNode, targetNode, addedEles) {
                    console.log(`adding edge: src=${sourceNode.id()}, tar=${targetNode.id()}`)
                    var edge = addedEles[0];
                    edge.data("color", LabelType.STATIC.color);
                    edge.data("label", "-");
                    var src = sourceNode.id();
                    var tar = targetNode.id();
                    ["L", "K", "R"].forEach(U => {
                        if (T == U) { return; }
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
                                source: sourceNode.id(),
                                target: targetNode.id(),
                                label: "-",
                                color: LabelType.STATIC.color,
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
                if (tar === self.L.cy){
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

        if (label.type === LabelType.STATIC) {
            ["L", "K", "R"].forEach(T => {
                var n = self[T].cy.add({
                    group: "nodes",
                    data: {
                        label: rawLabel,
                        id: this.nodeId,
                        color: label.type.color,
                        parsedLabel: label
                    },
                    renderedPosition: pos
                });
            });

        } else {
            var n = this.K.cy.add({
                group: "nodes",
                data: {
                    label: rawLabel,
                    id: this.nodeId,
                    color: label.type.color,
                    parsedLabel: label
                },
                classes: ["ghost-elem"],
                renderedPosition: pos
            });
            console.log(n);
            if (label.type === LabelType.REMOVE) {
                var n = this.L.cy.add({
                    group: "nodes",
                    data: {
                        label: label.left,
                        id: this.nodeId,
                        color: label.type.color,
                        parsedLabel: label
                    },
                    renderedPosition: pos
                });
            } else if (label.type === LabelType.CREATE) {
                var n = this.R.cy.add({
                    group: "nodes",
                    data: {
                        label: label.right,
                        id: this.nodeId,
                        color: label.type.color,
                        parsedLabel: label
                    },
                    renderedPosition: pos
                });
            } else {
                var n = this.L.cy.add({
                    group: "nodes",
                    data: {
                        label: label.left,
                        id: this.nodeId,
                        color: label.type.color,
                        parsedLabel: label
                    },
                    renderedPosition: pos
                });
                var n = this.R.cy.add({
                    group: "nodes",
                    data: {
                        label: label.right,
                        id: this.nodeId,
                        color: label.type.color,
                        parsedLabel: label
                    },
                    renderedPosition: pos
                });
            }
        }
        this.nodeId = this.nodeId + 1;

    }
}