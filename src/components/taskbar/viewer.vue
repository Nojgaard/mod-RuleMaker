<template>
  <li class="nav-item dropdown active">
    <a
      class="nav-link dropdown-toggle"
      id="viewerDropDown"
      href="#"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >Viewer</a>
    <div class="dropdown-menu" aria-labelledby="viewerDropDown">
      <button ref="chemview"  v-on:click="toggleChemView" class="dropdown-item active">Chem View</button>
      <button ref="constraintview" v-on:click="toggleConstraintsView" class="dropdown-item active">Show Constraints</button>
      <div class="dropdown-divider"></div>
      <button ref="graphview" v-on:click="setGraphView" class="dropdown-item active">Single Graph</button>
      <button ref="spanview" v-on:click="setSpanView" class="dropdown-item">DPO Span</button>
    </div>
  </li>
</template>

<script>
import {Span} from '../../js/span'
import {Graph} from '../../js/graph'

export default {
  methods: {
    toggleChemView: function (event) {
      modviz.toggleChemView();
      this.$refs.chemview.classList.toggle("active");
    },

    toggleConstraintsView: function (event) {
      modviz.toggleShowConstraints();
      this.$refs.constraintview.classList.toggle("active");
    },

    setGraphView: function (event) {
      if (this.$refs.graphview.classList.contains("active")) {
        return;
      }
      let divGraph = document.getElementById("cy");
      divGraph.style.display = "flex";
      let divSpan = document.getElementById("cySpan");
      divSpan.style.display = "none";

      this.$refs.graphview.classList.add("active");
      this.$refs.spanview.classList.remove("active");

      let tmp = modviz;
      modviz = new Graph(divGraph);
      modviz.readDPOSPan(tmp);
      tmp.destroy();
    },

    setSpanView: function (event) {
      if (this.$refs.spanview.classList.contains("active")) {
        return;
      }
      let divGraph = document.getElementById("cy");
      divGraph.style.display = "none";
      let divSpan = document.getElementById("cySpan");
      divSpan.style.display = "flex";

      this.$refs.graphview.classList.remove("active");
      this.$refs.spanview.classList.add("active");

      let divL = document.getElementById("cySpanLeft");
      let divK = document.getElementById("cySpanMiddle");
      let divR = document.getElementById("cySpanRight");

      let tmp = modviz;
      modviz = new Span(divL, divK, divR);
      modviz.readModGraph(tmp);
      tmp.destroy();
    },
  },
};
</script>

<style scoped>
</style>