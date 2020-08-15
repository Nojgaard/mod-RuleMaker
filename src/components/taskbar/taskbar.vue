<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="#">MØDviz</a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <!-- FILE DROPDOWN-->
        <file-dropdown ref="file"/>

        <!-- EDIT DROPDOWN-->
        <edit-dropdown ref="edit"/>

        <!-- LAYOUT DROPDOWN-->
        <layout-dropdown ref="layout"/>

        <!-- VIEWER DROPDOWN-->
        <viewer-dropdown ref="viewer"/>
      </ul>
    </div>
  </nav>
</template>

<script>
import fileDropDown from "./file.vue";
import editDropdown from "./edit.vue";
import layoutDropdown from "./layout.vue";
import viewerDropdown from "./viewer.vue";
export default {
  components: {
    "file-dropdown": fileDropDown,
    "edit-dropdown": editDropdown,
    "layout-dropdown": layoutDropdown,
    "viewer-dropdown": viewerDropdown,
  },

  mounted() {
  }
};
</script>

<style>
</style>
