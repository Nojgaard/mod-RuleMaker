<template>
  <li class="nav-item dropdown active">
    <a
      class="nav-link dropdown-toggle"
      id="editDropDown"
      href="#"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >Edit</a>
    <!-- ITEMS -->
    <div class="dropdown-menu" aria-labelledby="editDropDown">
      <button class="dropdown-item" data-toggle="modal" data-target="#modalSmiles">Add SMILES</button>
      <div class="dropdown-divider"></div>
      <button v-on:click="undo" class="dropdown-item">
        Undo
        <span class="pull-right text-muted">(ctrl+z)</span>
      </button>
      <button v-on:click="redo" class="dropdown-item">
        Redo
        <span class="pull-right text-muted">(ctrl+y)</span>
      </button>
      <div class="dropdown-divider"></div>
      <button v-on:click="copy" class="dropdown-item">
        Copy
        <span class="pull-right text-muted">(ctrl+c)</span>
      </button>
      <button v-on:click="paste" class="dropdown-item">
        Paste
        <span class="pull-right text-muted">(ctrl+v)</span>
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-toggle="modal" data-target="#modalRename">
        Rename Selected
        <span class="pull-right text-muted">(ctrl+r)</span>
      </button>
      <button
        class="dropdown-item"
        data-toggle="modal"
        data-target="#modalConstraints"
      >Add Constraints Selected</button>
      <div class="dropdown-divider"></div>
      <button v-on:click="clear" class="dropdown-item">Clear Graph</button>
    </div>
  </li>
</template>

<script>
export default {
  methods: {
    undo: function (event) {
      modviz.undo();
    },

    redo: function (event) {
      modviz.redo();
    },

    copy: function (event) {
      modviz.copySelected();
    },

    paste: function (event) {
      modviz.paste();
    },

    clear: function (event) {
      modviz.clear();
    },
  },
};
</script>

<style lang="">
</style>