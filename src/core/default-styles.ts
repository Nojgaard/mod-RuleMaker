const styles: any[] = [
    {
        selector: 'node',
        style: {
          //  'width': '50'
          //'shape': 'rectangle'
        }
    },

    {
        selector: 'edge[label]',
        style: {
            'curve-style': 'haystack',
            'haystack-radius': 0,
            'label': function (label) { return (label.data().label + "\n \u2060") },
            'text-wrap': 'wrap',
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
]

export default styles;