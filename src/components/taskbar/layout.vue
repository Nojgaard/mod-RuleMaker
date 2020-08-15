<template>
  <li class="nav-item dropdown active">
    <a
      class="nav-link dropdown-toggle"
      id="layoutDropDown"
      href="#"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >Layout</a>
    <div class="dropdown-menu" aria-labelledby="layoutDropDown">
      <button id="btnRuleCoord" v-on:click="layoutMOD" class="dropdown-item">MØD</button>
      <!-- <button class="dropdown-item" type="button" id="btnGraphCoord">Use MØD Graph Coordinates</button> -->
    </div>
  </li>
</template>

<script>
import {modService, modruleGML} from '../../core';

export default {
  methods: {
    layoutMOD: function (event) {
      var data = {
        type: "ruleGML",
        data: modviz.toGMLRule(),
      };
      modService.send("getRuleCoords", data, function (response) {
        try {
          console.log(response);
          var jRule = modruleGML.parse(response.ruleGML);
          console.log(jRule);
        } catch (e) {
          console.log(e);
          return;
        }
        // readRuleJson(cy, jRule);
        modviz.readJsonRule(jRule);
      });
    },
  },
};
</script>

<style scoped>
</style>