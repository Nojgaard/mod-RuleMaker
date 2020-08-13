<template>
  <div class="modal" ref="modal" id="modalRename" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Rename Selected Elements</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <input ref="input" class="form-control" type="text" v-on:keyup.enter="renameSelected" />
        </div>
        <div class="modal-footer">
          <button v-on:click="renameSelected" type="button" class="btn btn-primary">Save changes</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";

export default {
  methods: {
    renameSelected: function (event) {
      let rawLabel = this.$refs.input.value;
      modviz.renameSelected(rawLabel);
      $(this.$refs.modal).modal("hide");
    },

    focusInput: function () {
      this.$refs.input.focus();
    },
  },
  mounted() {
    $(this.$refs.modal).on("shown.bs.modal", this.focusInput);
  },
};
</script>

<style scoped>
</style>