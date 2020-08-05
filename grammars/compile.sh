#!/bin/bash

node_modules/.bin/pegjs --format globals -e GML_GRAPH gml_graph.pegjs
node_modules/.bin/pegjs --format globals -e GML gml.pegjs
