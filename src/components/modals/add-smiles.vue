<template>
  <div class="modal" id="modalSmiles" ref="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add SMILES</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <input
            ref="input"
            class="form-control"
            type="text"
            id="txtSmiles"
            v-on:keyup.enter="addSmiles"
          />
        </div>
        <div class="modal-footer">
          <button v-on:click="addSmiles" type="button" class="btn btn-primary">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mod_service } from "../../js/mod_service";
import modgraphGML from "../../js/grammars/modgraph-gml";
import $ from "jquery";

export default {
  methods: {
    addSmiles: function (event) {
      var data = {
        type: "smiles",
        data: document.getElementById("txtSmiles").value,
      };
      mod_service.send("getGraphCoords", data, function (response) {
        try {
          console.log(response);
          var gRule = modgraphGML.parse(response.graphGML);
          console.log(gRule);
        } catch (e) {
          console.log(e);
          return;
        }
        // readRuleJson(cy, jRule);
        modviz.addJsonGraph(gRule);
        document.querySelector("#btnRuleCoord").click();
        $("#modalSmiles").modal("hide");
      });
    },

    focusInput: function () {
      this.$refs.input.focus();
    },
  },
  mounted() {
    console.log(this.$refs.modal);
    console.log(this.$refs.input);
    $(this.$refs.modal).on("shown.bs.modal", this.focusInput);
  },
};
</script>

<style scoped>
</style>