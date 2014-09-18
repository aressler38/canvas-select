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
     * @constructor
     */
    function CanvasSelect (config) {

        var containerEl = makeDiv();

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var border = {
            top: makeDiv(),
            bottom: makeDiv(),
            left: makeDiv(),
            right: makeDiv()
        };
        var corner = {
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

        for ( var c in corner )  {
            corner[c].classList.add("corner");
        }
        for ( var b in border )  {
            border[b].classList.add("border");
        }
        containerEl.classList.add("canvas-select");


        _data[this.id] = { };
        _data[this.id].containerEl = containerEl;
        _data[this.id].border = border;
        _data[this.id].corner = corner;
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
            console.log('here', ratio);

        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh);

    };
/*
    CanvasSelect.prototype.loadImage = function (imgEl) {
        var ctx = _data[this.id].ctx;
        var el = _data[this.id].containerEl;
        var canvas = _data[this.id].canvas;

        if ( ! imgEl instanceof Element ) {
            throw "You need to pass loadImage the reference of a loaded <img> element";
        }

        var imgStyle = window.getComputedStyle(imgEl);

        var nWidth = imgEl.naturalWidth;
        var nHeight = imgEl.naturalHeight;

        var paddingWidth = safeParseInt(imgStyle.paddingLeft) + safeParseInt(imgStyle.paddingRight);
        var paddingHeight = safeParseInt(imgStyle.paddingTop) + safeParseInt(imgStyle.paddingBottom);
        var imgWidth =  imgEl.clientWidth - paddingWidth;
        var imgHeight = imgEl.clientHeight - paddingHeight;

        var scaleX = imgWidth / imgEl.naturalWidth;
        var scaleY = imgHeight / imgEl.naturalHeight;

        el.setAttribute("width", imgWidth+"px");
        el.setAttribute("height", imgHeight+"px");
        canvas.width = imgWidth;
        canvas.height = imgHeight;

        // query the various pixel ratios
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                            ctx.mozBackingStorePixelRatio ||
                            ctx.msBackingStorePixelRatio ||
                            ctx.oBackingStorePixelRatio ||
                            ctx.backingStorePixelRatio || 1;
        var ratio = devicePixelRatio / backingStoreRatio;
console.log(ratio)

        
        _data[this.id].scaleX = scaleX;
        _data[this.id].scaleY = scaleY;
        _data[this.id].nWidth = nWidth;
        _data[this.id].nHeight = nHeight;

        //ctx.scale(1/ratio, 1/ratio);
        window.ctx = ctx;
        window.canvas = canvas;
console.log(imgWidth, imgHeight)

        ctx.drawImage(imgEl, 0, 0, nWidth, imgHeight, 0, 0, imgWidth, imgHeight );
    };
*/
    
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
        emptyEl(el);

        el.appendChild(canvas);
        element.appendChild(el);
    };

    CanvasSelect.prototype.destroy = function () {      
        delete _data[this.id];
        return null;
    };

    return CanvasSelect;
});
