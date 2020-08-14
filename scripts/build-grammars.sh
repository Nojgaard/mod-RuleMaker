#!/bin/bash

npm bin pegjs ../src/js/grammars/modgraph-gml.pegjs -o ../src/js/grammars/modgraph-gml.js
npm bin pegjs ../src/js/grammars/modrule-gml.pegj -o ../src/js/grammars/modrule-gml.js
npm bin pegjs ../src/js/grammars/atom.pegjs -o ../src/js/grammars/atom.js