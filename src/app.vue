<template>
  <div>
    <task-bar ref="taskbar" />

    <!-- Rename Nodes Modal-->
    <modal-rename-selected />

    <!-- Smiles Modal-->
    <modal-add-smiles />

    <!-- Add Constraints Modal -->
    <modal-add-constraints />

    <!-- Exception Modal -->
    <modal-exception ref="modalException" />

    <!-- Page Content -->
    <div id="page-content-wrapper" class="container-fluid">
      <div id="cy"></div>

      <div id="cySpan">
        <div id="cySpanLeft" class="cySpanGraph"></div>
        <div class="cyDivider"></div>
        <div id="cySpanMiddle" class="cySpanGraph"></div>
        <div class="cyDivider"></div>
        <div id="cySpanRight" class="cySpanGraph"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {Graph} from "./core"
window.addEventListener("load", function () {
  var modviz = (window.modviz = new Graph(
    document.getElementById("cy")
  ));
});

import taskbar from "./components/taskbar/taskbar.vue";
import modalAddSmiles from "./components/modals/add-smiles.vue";
import modalRenameSelected from "./components/modals/rename-selected.vue";
import modalAddConstraints from "./components/modals/add-constraints.vue";
import modalException from "./components/modals/exception.vue"

import Mousetrap from "mousetrap";
import $ from "jquery";

export default {
  components: {
    "task-bar": taskbar,
    "modal-add-smiles": modalAddSmiles,
    "modal-rename-selected": modalRenameSelected,
    "modal-add-constraints": modalAddConstraints,
    "modal-exception": modalException
  },

  beforeMount() {
    window.modvizApp = this;
  },

  mounted() {

    Mousetrap.bind("del", function (e) {
      modviz.removeSelected();
    });

    Mousetrap.bind("ctrl+r", function (e) {
      e.preventDefault();
      $("#modalRename").modal();
    });

    let taskbar = this.$refs.taskbar;

    Mousetrap.bind("ctrl+c", function (e) {
      e.preventDefault();
      taskbar.$refs.edit.copy();
    });

    Mousetrap.bind("ctrl+v", function (e) {
      e.preventDefault();
      taskbar.$refs.edit.paste();
    });

    Mousetrap.bind("ctrl+z", function (e) {
      e.preventDefault();
      taskbar.$refs.edit.undo();
    });

    Mousetrap.bind("ctrl+y", function (e) {
      e.preventDefault();
      taskbar.$refs.edit.redo();
    });
  },
};
</script>

<style lang="css">
body {
  font-family: helvetica neue, helvetica, liberation sans, arial, sans-serif;
  font-size: 14px;
}

html,
body {
  height: 100%;
  width: 100%;
  margin: 0%;
  overflow: hidden; /* Hide scrollbars */
}

#cy {
  /* border: solid;
			border-width: 2px; */
  height: 100%;
  min-height: 100%;
}

h1 {
  margin-top: 10px;
  opacity: 0.5;
  font-size: 1em;
  font-weight: bold;
}

#page-content-wrapper {
  min-width: 100%;
  padding: 0;
  height: calc(100vh - 56px);
}

#cySpan {
  height: 100%;
  min-height: 100%;
  display: none;
}

.cySpanGraph {
  height: 100%;
  min-height: 100%;
  width: 33%;
}

[x-out-of-boundaries] {
  display: none;
}

/* #cySpanMiddle {
			border-left: 5px solid #343a40;
			border-right: 5px solid #343a40;
		} */

.cyDivider {
  height: 100%;
  width: 5px;
  background-color: #343a40;
}

.table > tbody > tr:first-child > td {
  border: none;
}

.constraintDiv {
  background-color: #343a40;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 10px 20px 0px 20px;
  position: relative;
  z-index: 1;
  margin-top: 5px;
}

.constraintDiv::after {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #343a40 transparent;
}

.html-node {
  padding-bottom: 4px;
  cursor: default;
  color: #343a40;
  /* line-height: 1;
  vertical-align: middle; */
}

sub {
  vertical-align: sub;
  font-size: medium;
}

sup {
  vertical-align: super;
  font-size: small;
  top: 0;
}
</style>