define([
    "CanvasSelect"
], function (CanvasSelect) {

     if ( document.readyState === "interactive" ||
          document.readyState === "complete" || 
          document.readyState === "ready"
     ) { init(); }
     else { document.addEventListener("DOMContentLoaded", init) }


    function init () {
        console.debug("INIT");
        var containerEl = document.getElementById("container");
        var imgEl = document.getElementById("img");

        window.CanvasSelect = CanvasSelect;

        window.setTimeout(function(){ 
        window.cs = new CanvasSelect(imgEl);
        window.cs.render(containerEl);
        },1000);
    }

});
