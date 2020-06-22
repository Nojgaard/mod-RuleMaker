#!/usr/bin/bash

pegjs --format globals -e GML_GRAPH gml_graph.pegjs
pegjs --format globals -e GML gml.pegjs
