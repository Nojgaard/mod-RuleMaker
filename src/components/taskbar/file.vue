<template>
  <li class="nav-item dropdown active">
    <a
      class="nav-link dropdown-toggle"
      id="fileDropDown"
      href="#"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >File</a>
    <!-- ITEMS -->
    <div class="dropdown-menu" aria-labelledby="fileDropDown">
      <label class="dropdown-item btn-file" style="cursor:pointer">
        Load Graph
        <input v-on:change="loadGraph" type="file" style="display: none;" />
      </label>
      <label class="dropdown-item btn-file" style="cursor:pointer">
        Load Rule
        <input v-on:change="loadRule" type="file" style="display: none;" />
      </label>
      <div class="dropdown-divider"></div>
      <button v-on:click="saveGraph" class="dropdown-item">Save Graph</button>
      <button v-on:click="saveRule" class="dropdown-item">Save Rule</button>
    </div>
  </li>
</template>

<script>
import { modService, modgraphGML, modruleGML } from "../../core";
import { saveAs } from "file-saver";

export default {
  methods: {
    saveRule: function (event) {
      var gmlrule = modviz.toGMLRule();
      var blob = new Blob([gmlrule], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "rule.gml");
    },

    saveGraph: function (event) {
      var gmlgraph = modviz.toGMLGraph();
      var blob = new Blob([gmlgraph], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "graph.gml");
    },

    loadRule: function (event) {
      var input = event.target;

      var reader = new FileReader();
      reader.onload = function () {
        var text = reader.result;
        var data = {
          type: "ruleGML",
          data: text,
        };
        modService.send("getRuleCoords", data, function (response) {
          if (response.hasOwnProperty("error")) {
            modvizApp.$refs.modalException.showException(response.error);
            return;
          }
          try {
            var jRule = modruleGML.parse(response.ruleGML);
          } catch (e) {
            console.log(e);
            return;
          }
          // readRuleJson(cy, jRule);
          modviz.readJsonRule(jRule);
        });
      };
      reader.readAsText(input.files[0]);
    },

    loadGraph: function (event) {
      var input = event.target;

      var reader = new FileReader();
      reader.onload = function () {
        var text = reader.result;
        var data = {
          type: "graphGML",
          data: text,
        };
        modService.send("getGraphCoords", data, function (response) {
          if (response.hasOwnProperty("error")) {
            modvizApp.$refs.modalException.showException(response.error);
            return;
          }
          try {
            var jsonGraph = modgraphGML.parse(response.graphGML);
          } catch (e) {
            console.log(e);
            return;
          }
          // readModGraph(cy, jsonGraph);
          modviz.readJsonGraph(jsonGraph);
        });
      };
      reader.readAsText(input.files[0]);
    },
  },
};
</script>

<style>
</style>