<template>
  <div>
    <task-bar />

    <!-- Rename Nodes Modal-->
    <script></script>
    <div class="modal" id="modalRename" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rename Selected Elements</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <input class="form-control" type="text" id="txtRelabel" />
          </div>
          <div class="modal-footer">
            <button id="btnRelabel" type="button" class="btn btn-primary">Save changes</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Smiles Modal-->
    <script></script>

	<modal-add-smiles/>

    <!-- Add Constraints Modal-->
    <div class="modal" id="modalConstraints" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Constraints for Selected Nodes</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row form-group" style="margin-top: 5px;">
              <div class="col-sm-2 font-weight-bold">Operation</div>
              <div class="col-sm-2 font-weight-bold">Count</div>
              <div class="col-sm-3 font-weight-bold">Node Labels</div>
              <div class="col-sm-3 font-weight-bold">Edge Labels</div>
            </div>
            <div id="constraintRowTemplate" style="display: none;">
              <div class="row form-group">
                <div class="col-sm-2">
                  <select data-width="fit">
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="=">=</option>
                    <option value=">=">&gt;=</option>
                    <option value=">">&gt;</option>
                  </select>
                </div>
                <div class="col-sm-2">
                  <input class="form-control" type="text" id="txtContraintCount" />
                </div>
                <div class="col-sm-3">
                  <input class="form-control" type="text" id="txtConstraintNodes" />
                </div>
                <div class="col-sm-3">
                  <input class="form-control" type="text" id="txtConstraintEdges" />
                </div>
                <div class="col-sm-2">
                  <button
                    type="button"
                    class="btn btn-default btnConstraintRemove"
                    aria-label="Left Align"
                  >
                    <i class="fa fa-times fa-lg" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
            <div id="containerConstraints" class="container">
              <!-- <div class="row">
							<div class="col-sm-2">
								<select class="selectpicker" data-width="fit">
									<option value="<">&lt;</option>
									<option value="<=">&lt;=</option>
									<option value="=">=</option>
									<option value=">=">&gt;=</option>
									<option value=">">&gt;</option>
								</select>
							</div>
							<div class="col-sm-2">
								<input class="form-control" type="text" id="txtContraintCount" />
							</div>
							<div class="col-sm-3">
								<input class="form-control" type="text" id="txtConstraintNodes" />
							</div>
							<div class="col-sm-3">
								<input class="form-control" type="text" id="txtConstraintEdges" />
							</div>
							<div class="col-sm-2">
								<button type="button" class="btn btn-default btnConstraintRemove"
									aria-label="Left Align">
									<i class="fa fa-times fa-lg" aria-hidden="true"></i>
								</button>
							</div>
              </div>-->
            </div>
            <div class="row" style="margin-top: 5px;">
              <div class="col-sm-8"></div>
              <div class="col-sm-4">
                <button
                  id="btnConstraintAddRow"
                  type="button"
                  class="btn btn-default"
                >Add Constraint</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="btnAddConstraints" type="button" class="btn btn-primary">Save changes</button>
            <!-- <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> -->
          </div>
        </div>
      </div>
    </div>
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
window.addEventListener("load", function () {
    console.log("CONTRAINER", document.getElementById('cy'))
	var modviz = window.modviz = new MODviz.Graph(document.getElementById('cy'));
});

import taskbar from "./taskbar/taskbar.vue";
import modalAddSmiles from "./modals/add-smiles.vue";
export default {
  components: {
	"task-bar": taskbar,
	"modal-add-smiles": modalAddSmiles
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
</style>