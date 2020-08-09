document.addEventListener('DOMContentLoaded', function () {
    Mousetrap.bind('del', function (e) {
        modgraph.removeSelected();
    });

    Mousetrap.bind('ctrl+r', function(e) {
        e.preventDefault();
        $("#modalRename").modal();
        document.querySelector('#txtRelabel').value = "";
        document.querySelector('#txtRelabel').focus();
    });

    Mousetrap.bind('ctrl+c', function(e) {
        e.preventDefault();
        document.getElementById('btnCopy').click();
    });

    Mousetrap.bind('ctrl+v', function(e) {
        e.preventDefault();
        document.getElementById('btnPaste').click();
    });
});