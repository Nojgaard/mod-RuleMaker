<template>
  <!-- Add Constraints Modal-->
  <div ref="modal" class="modal" id="modalConstraints" tabindex="-1" role="dialog">
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
          <div id="containerConstraints" class="container"></div>
          <div class="row" style="margin-top: 5px;">
            <div class="col-sm-8"></div>
            <div class="col-sm-4">
              <button v-on:click="addRowConstraint" type="button" class="btn btn-default">Add Constraint</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-on:click="addConstraints" type="button" class="btn btn-primary">Save changes</button>
          <!-- <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  methods: {
    removeRowConstraints: function () {
      let container = document.getElementById("containerConstraints");
      container.innerHTML = "";
    },
    addRowConstraint: function () {
      let divRow = document.getElementById("constraintRowTemplate");
      let divConstraintsContainer = document.getElementById(
        "containerConstraints"
      );
      divConstraintsContainer.innerHTML += divRow.innerHTML;

      let rows = divConstraintsContainer.getElementsByClassName(
        "btnConstraintRemove"
      );
      for (let i = 0; i < rows.length; i++) {
        rows[i].addEventListener("click", function (event) {
          event.currentTarget.parentNode.parentNode.remove();
        });
      }
    },

    addConstraints: function (event) {
      let container = document.getElementById("containerConstraints");
      let rows = container.getElementsByClassName("row");

      let constraints = [];
      for (let i = 0; i < rows.length; i++) {
        console.log("PARSING CONSTRAINT", i, rows.length);
        let op = rows[i].getElementsByTagName("select")[0].value;

        let inputs = rows[i].getElementsByTagName("input");
        let count = inputs[0].value;
        let nodeLabels = inputs[1].value.split(",");
        let edgeLabels = inputs[2].value.split(",");
        if (nodeLabels.length == 1 && nodeLabels[0] == "") {
          nodeLabels = [];
        }
        if (edgeLabels.length == 1 && edgeLabels[0] == "") {
          edgeLabels = [];
        }

        constraints.push({
          op: op,
          count: count,
          nodeLabels: nodeLabels,
          edgeLabels: edgeLabels,
        });
      }
      console.log("Setting Constraints");
      console.log(constraints);
      modviz.setConstraintsSelected(constraints);
      $(this.$refs.modal).modal("hide");
    },
  },

  mounted() {
    $(this.$refs.modal).on("hidden.bs.modal", this.removeRowConstraints);
    $(this.$refs.modal).on("shown.bs.modal", this.addRowConstraint);
  },
};
</script>

<style scoped>
</style>