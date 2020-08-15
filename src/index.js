import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue from 'vue'
import App from './app.vue'


// import 'font-awesome'

document.addEventListener('DOMContentLoaded', function () {
    //	Vue.component("task-bar", MODviz.App);
        new Vue({
            el: '#app',
            render(createElement) {
                return createElement(App);
            }
        });
    });
