<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
		<a class="navbar-brand" href="#">MØDviz</a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav mr-auto">
				<!-- FILE DROPDOWN-->
				<file-dropdown></file-dropdown>
				
                <!-- EDIT DROPDOWN-->
				<edit-dropdown/>

				<!-- LAYOUT DROPDOWN-->
                <layout-dropdown/>

				<!-- VIEWER DROPDOWN-->
				<li class="nav-item dropdown active">
					<a class="nav-link dropdown-toggle" id="viewerDropDown" href="#" data-toggle="dropdown"
						aria-haspopup="true" aria-expanded="false">Viewer</a>
					<div class="dropdown-menu" aria-labelledby="viewerDropDown">
						<button id="btnChemView" class="dropdown-item active">
							Chem View
						</button>
						<button id="btnConstraintsView" class="dropdown-item active">
							Show Constraints
						</button>
						<div class="dropdown-divider"></div>
						<button id="btnViewerGraph" class="dropdown-item active">
							Single Graph
						</button>
						<button id="btnViewerSpan" class="dropdown-item">
							DPO Span
						</button>
					</div>
				</li>

			</ul>
		</div>
	</nav>
</template>

<script>
import fileDropDown from './file.vue'
import editDropdown from './edit.vue'
import layoutDropdown from './layout.vue'
export default {
    components: {
         'file-dropdown': fileDropDown,
         'edit-dropdown': editDropdown,
         'layout-dropdown': layoutDropdown,
    }
}
</script>

<style>

</style>
