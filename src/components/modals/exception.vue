<template>
  <div class="modal" ref="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Exception</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          {{message}}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";

export default {
    data() {
        return {
            message: "",
        }
    },

    methods: {
        showException: function(message) {
            this.message = message;
            console.log("Exception: ", message);
            $(this.$refs.modal).modal("show");
        }
    }
};
</script>

<style scoped>
</style>