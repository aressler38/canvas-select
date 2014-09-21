define(function () {

    if ( typeof Number.isNaN !== "function" ) {
        Number.isNaN = window.isNaN;
    }

    // private table used for multiple instances of 
    // CanvasSelect
    var _data = {};

    /** 
     * @private
     */
    function makeDiv () {
        return document.createElement("div");
    }

    /**
     * @private
     * @deprecated
     */
    function emptyEl (el) {
        while ( el.lastChild ) {
            el.removeChild( el.lastChild );
        }
    }

    function safeParseInt(str, val) {
        if ( val === undefined ) { val = 0; }
        var int = parseInt(str);
        return Number.isNaN(int) ? val : int ;
    }

    /**
     * Context {this} should be a CanvasSelect instance.
     * @private
     */
    function updatePositions () {
        var el = _data[this.id].containerEl;
        var canvas = _data[this.id].canvas;
        var corners = _data[this.id].corners;
        var borders = _data[this.id].borders;
        // borders' styles
        var topStyle = window.getComputedStyle(borders.top);
        var rightStyle = window.getComputedStyle(borders.right);
        var bottomStyle = window.getComputedStyle(borders.bottom);
        var leftStyle = window.getComputedStyle(borders.left);

        // assume all corners have the same dimensions (width, height)
        var cStyle = window.getComputedStyle(corners.bottomRight); 
        var cW = cStyle.width;
        var cH = cStyle.height;

        // calculate offsets // TODO: optimize 
        var topTopOffset = parseInt(topStyle.height) - parseInt(cH)/2;
        var rightLeftOffset = parseInt(rightStyle.width) + parseInt(cW)/2;
        var bottomTopOffset = parseInt(bottomStyle.height) + parseInt(cH)/2;
        var leftLeftOffset = parseInt(leftStyle.width) - parseInt(cW)/2;

        // position corners
        corners.topLeft.style.top = topTopOffset + "px";
        corners.topLeft.style.left = leftLeftOffset + "px";

        corners.topRight.style.top = topTopOffset + "px";
        corners.topRight.style.left = "calc( 100% - " + rightLeftOffset + "px)";

        corners.bottomRight.style.top = "calc( 100% - " + bottomTopOffset + "px)";
        corners.bottomRight.style.left = "calc( 100% - " + rightLeftOffset + "px)";

        corners.bottomLeft.style.top = "calc( 100% - " + bottomTopOffset + "px)";
        corners.bottomLeft.style.left = leftLeftOffset + "px";
        
        // position borders
        borders.right.style.top = topTopOffset + parseInt(cH)/2 + "px";
        borders.left.style.top = topTopOffset + parseInt(cH)/2 + "px";

        borders.right.style.bottom = bottomTopOffset - parseInt(cH)/2 + "px";
        borders.left.style.bottom = bottomTopOffset - parseInt(cH)/2 + "px";
    }

    /**
     * Context {this} should be a CanvasSelect instance.
     * @private
     */
    function bindEvents () {
        var that = this;
        var el = _data[this.id].containerEl;
        var corners = _data[this.id].corners;
        var borders = _data[this.id].borders;
        var elStyle = window.getComputedStyle(el); // don't resize this
        var maxWidth = parseInt(elStyle.width);
        var maxHeight = parseInt(elStyle.height);

        var c0 = null; // initial corner;
        var x0 = null; // initial clientX;
        var y0 = null; // initial clientY;

        var topH0 = null;
        var rightW0 = null;
        var bottomH0 = null;
        var leftW0 = null;

        var currentCornerCallback = null;
        var cornerMoveCallbacks = {
            topLeft: function (dw, dh) {
                var height = Math.min(maxHeight - bottomH0, topH0 + dh);
                var width = Math.min(maxWidth - rightW0, leftW0 + dw);
                borders.top.style.height = height + "px";
                borders.left.style.width = width + "px";
            },
            topRight: function (dw, dh) {
                var height = Math.min(maxHeight - bottomH0, topH0 + dh);
                var width = Math.min(maxWidth - leftW0, rightW0 - dw);
                borders.top.style.height = height + "px";
                borders.right.style.width = width + "px";
            },
            bottomRight: function (dw, dh) {
                var height = Math.min(maxHeight - topH0, bottomH0 - dh);
                var width = Math.min(maxWidth - leftW0, rightW0 - dw);
                borders.bottom.style.height = height + "px";
                borders.right.style.width = width + "px";
            },
            bottomLeft: function (dw, dh) {
                var height = Math.min(maxHeight - topH0, bottomH0 - dh);
                var width = Math.min(maxWidth - rightW0, leftW0 + dw);
                borders.bottom.style.height = height + "px";
                borders.left.style.width = width + "px";
            }
        };

        for ( var c in corners ) {
            corners[c].addEventListener("mousedown", _startMouseDragging);
        }

        function _startMouseDragging (event) {
            c0 = event.currentTarget || event.target;
            x0 = event.clientX;
            y0 = event.clientY;

            // borders' styles
            var topStyle = window.getComputedStyle(borders.top);
            var rightStyle = window.getComputedStyle(borders.right);
            var bottomStyle = window.getComputedStyle(borders.bottom);
            var leftStyle = window.getComputedStyle(borders.left);

            topH0 = parseInt(topStyle.height);
            rightW0 = parseInt(rightStyle.width);
            bottomH0 = parseInt(bottomStyle.height);
            leftW0 = parseInt(leftStyle.width);

            console.log(c0.dataset.corner);

            currentMoveCallback = cornerMoveCallbacks[c0.dataset.corner];

            document.addEventListener("mouseup", _stopMouseDragging);
            document.addEventListener("mousemove", _mouseDrag);
        }

        function _stopMouseDragging (event) {
            document.removeEventListener("mouseup", _stopMouseDragging);
            document.removeEventListener("mousemove", _mouseDrag);
            c0 = null; // reset
            x0 = null;
            y0 = null;
        }

        function _mouseDrag (event) {
            var dw = event.clientX - x0;    
            var dh = event.clientY - y0;    
            console.log(dw, dh);
            currentMoveCallback(dw, dh);
            updatePositions.call(that);
        }



    }

    /**
     * @constructor
     */
    function CanvasSelect (config) {

        var containerEl = makeDiv();

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var borders = {
            top: makeDiv(),
            bottom: makeDiv(),
            left: makeDiv(),
            right: makeDiv()
        };
        var corners = {
            topLeft: makeDiv(),
            topRight: makeDiv(),
            bottomLeft: makeDiv(),
            bottomRight: makeDiv()
        };

        // Make an immutable id property
        Object.defineProperty(this, "id", {
            __proto__: null,
            writable: false,
            enumerable: false, 
            configurable: false,
            value: (Math.random() * Date.now()).toString(16)
        });

        for ( var c in corners )  {
            corners[c].classList.add("corner");
            corners[c].classList.add(c);
        }
        for ( var b in borders )  {
            borders[b].classList.add("border");
            borders[b].classList.add(b);
        }
        containerEl.classList.add("canvas-select");


        _data[this.id] = { };
        _data[this.id].containerEl = containerEl;
        _data[this.id].borders = borders;
        _data[this.id].corners = corners;
        _data[this.id].canvas = canvas;
        _data[this.id].ctx = ctx;


        if ( config instanceof Element ) {
            this.loadImage(config);
        }

        return this;
    }

    /**
     * Load an image into the cropper.
     * @param {Element} imgEl An <img> element that has been loaded already.
     */
    CanvasSelect.prototype.loadImage = function (imgEl) {
        var canvas = _data[this.id].canvas;
        var ctx = _data[this.id].ctx;

        window.ctx = ctx;
        var imgStyle = window.getComputedStyle(imgEl);
        var nWidth = imgEl.naturalWidth;
        var nHeight = imgEl.naturalHeight;
        var paddingWidth = safeParseInt(imgStyle.paddingLeft) + safeParseInt(imgStyle.paddingRight);
        var paddingHeight = safeParseInt(imgStyle.paddingTop) + safeParseInt(imgStyle.paddingBottom);
        var imgWidth =  imgEl.clientWidth - paddingWidth;
        var imgHeight = imgEl.clientHeight - paddingHeight;

        // now default all the dimension info
        var sx = 0;
        var sy = 0;
        var sw = nWidth;
        var sh = nHeight;
        var dx = 0;
        var dy = 0;
        var dw = imgWidth;
        var dh = imgHeight;

        // finally query the various pixel ratios
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                                ctx.mozBackingStorePixelRatio ||
                                ctx.msBackingStorePixelRatio ||
                                ctx.oBackingStorePixelRatio ||
                                ctx.backingStorePixelRatio || 1;

        var ratio = devicePixelRatio / backingStoreRatio;

        canvas.width = imgWidth;
        canvas.height = imgHeight;

        // upscale the canvas if the two ratios don't match
        if ( devicePixelRatio !== backingStoreRatio ) {
            var oldWidth = canvas.width;
            var oldHeight = canvas.height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            ctx.scale(ratio, ratio);
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh);

    };
    
    /**
     * This method allows the user to supply any element to render the thing within,
     * but the canvas select's container will always be positioned absolutely.
     * @method
     * @param {Element} element
     */
    CanvasSelect.prototype.render = function (element) {
        if ( ! element instanceof Element ) { 
            element = document.body;
        }

        var el = _data[this.id].containerEl;
        var canvas = _data[this.id].canvas;
        var corners = _data[this.id].corners;
        var borders = _data[this.id].borders;

        emptyEl(el);
        element.appendChild(el);
        el.appendChild(canvas);

        for ( var border in borders ) {
            el.appendChild(borders[border])
        }
        for ( var corner in corners ) {
            el.appendChild(corners[corner])
            corners[corner].dataset.corner = corner;
        }

        bindEvents.call(this);
        updatePositions.call(this)
    };

    CanvasSelect.prototype.destroy = function () {      
        delete _data[this.id];
        return null;
    };

    return CanvasSelect;
});
