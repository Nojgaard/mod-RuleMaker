; (function () {
    'use strict';

    // registers the extension on a cytoscape lib ref
    var register = function (cytoscape, $) {

        if (!cytoscape || !$) {
            return;
        } // can't register if cytoscape unspecified


        cytoscape('core', 'clipboard', function (opts) {

            var cy = this;

            //Global variables to hold x and y coordinates in case of pasting
            var mouseX, mouseY;
            // cy.on('mousemove', function onmousemove(e) {
            //     var pos = e.position || e.cyPosition;
            //     mouseX = pos.x;
            //     mouseY = pos.y;
            // });


            var options = {
                beforeCopy: null,
                afterCopy: null,
                oldIdToNewId: null,
                beforePaste: null,
                afterPaste: null
            };

            $.extend(true, options, opts);


            function getScratch() {
                if (!cy.scratch("_clipboard")) {
                    cy.scratch("_clipboard", {});

                }
                return cy.scratch("_clipboard");
            }

            // get the scratchpad reserved for this extension on cy
            var scratchPad = getScratch();

            var counter = 0;

            function guid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }


            function getItemId(last) {
                return last ? "item_" + counter : "item_" + (++counter);
            }

            function getCloneId() {
                return guid();
            }


            var oldIdToNewId = new Map();

            function changeIds(jsons, pasteAtMouseLoc) {
                jsons = $.extend(true, [], jsons);

                for (var i = 0; i < jsons.length; i++) {
                    var jsonFirst = jsons[i];
                    if (oldIdToNewId.has(jsonFirst.data.id)) {
                        var id = oldIdToNewId.get(jsonFirst.data.id);
                    } else {
                        var id = getCloneId();
                        oldIdToNewId.set(jsonFirst.data.id, id);
                    }                  
                    jsonFirst.data.id = id;
                }


                //Paste the elements centered at the mouse location
                var topLeftX, topLeftY;
                var bottomRightX, bottomRightY;
                var centerX, centerY;
                var diffX, diffY;
                //Checks only for nodes
                if (jsons[0] !== undefined && jsons[0].position !== undefined) {
                    topLeftX = jsons[0].position.x;
                    topLeftY = jsons[0].position.y;
                    bottomRightX = jsons[0].position.x;
                    bottomRightY = jsons[0].position.y;

                    for (var k = 1; k < jsons.length; k++) {
                        var ele = jsons[k];

                        if (ele.position.x < topLeftX) {
                            topLeftX = ele.position.x;
                        }
                        if (ele.position.y < topLeftY) {
                            topLeftY = ele.position.y;
                        }
                        if (ele.position.x > bottomRightX) {
                            bottomRightX = ele.position.x;
                        }
                        if (ele.position.y > bottomRightY) {
                            bottomRightY = ele.position.y;
                        }
                    }
                    centerX = (topLeftX + bottomRightX) / 2;
                    centerY = (topLeftY + bottomRightY) / 2;

                    diffX = cy.mouseX - centerX;
                    diffY = cy.mouseY - centerY;
                }

                for (var j = 0; j < jsons.length; j++) {
                    var json = jsons[j];
                    var fields = ["source", "target", "parent"];
                    for (var k = 0; k < fields.length; k++) {
                        var field = fields[k];
                        if (json.data[field] && oldIdToNewId.get(json.data[field]))
                            json.data[field] = oldIdToNewId.get(json.data[field]);

                    }
                    if (json.position !== undefined) {
                        if (pasteAtMouseLoc == false) {
                            json.position.x += 50;
                            json.position.y += 50;

                        }
                        else {
                            json.position.x += diffX;
                            json.position.y += diffY;
                        }
                    }
                }

                return jsons;

            }

            if (!scratchPad.isInitialized) {
                scratchPad.isInitialized = true;
                var ur;
                var clipboard = {};

                scratchPad.instance = {
                    copy: function (eles, _id) {
                        var id = _id ? _id : getItemId();
                        //eles.unselect();
                        var descs = eles.nodes().descendants();
                        var nodes = eles.nodes().union(descs).filter(":selectable");
                        var edges = nodes.edgesWith(nodes).filter(":selectable");

                        if (options.beforeCopy) {
                            options.beforeCopy(nodes.union(edges));
                        }
                        clipboard[id] = { nodes: nodes.jsons(), edges: edges.jsons() };
                        if (options.afterCopy) {
                            options.afterCopy(clipboard[id]);
                        }
                        return id;
                    },
                    paste: function (_id, pasteAtMouseLoc) {
                        var id = _id ? _id : getItemId(true);
                        var res = cy.collection();
                        if (options.beforePaste) {
                            options.beforePaste(clipboard[id]);
                        }
                        if (clipboard[id]) {
                            if (options.oldIdToNewId) {
                                oldIdToNewId = options.oldIdToNewId(clipboard[id]);
                            }
                            var nodes = changeIds(clipboard[id].nodes, pasteAtMouseLoc);
                            var edges = changeIds(clipboard[id].edges);
                            oldIdToNewId = {};
                            cy.batch(function () {
                                res = cy.add(nodes).union(cy.add(edges));
                                res.select();
                            });

                        }
                        if (options.afterPaste) {
                            options.afterPaste(res);
                        }
                        cy.trigger('pasteClonedElements');
                        return res;
                    }
                };

                if (cy.undoRedo) {
                    ur = cy.undoRedo({}, true);
                    ur.action("paste", function (eles) {
                        return eles.firstTime ? scratchPad.instance.paste(eles.id, eles.pasteAtMouseLoc) : eles.restore();
                    }, function (eles) {
                        return eles.remove();
                    });
                }

            }

            return scratchPad.instance; // return the extension instance
        });

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-clipboard', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined' && typeof jQuery !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape, jQuery);
    }

})();
