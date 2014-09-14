define(function () {

    // private hash table used for multiple instances of 
    // CanvasSelect
    var _data = {};

    /**
     * @private
     */
    function _get (hash, key) {
        return data[hash][key];
    }

    /**
     * @private
     */
    function _set (key, value) {
        if ( ! _data[this.id] ) { throw "Previously destroyed"; }
        else {
            _data[this.id][key] = value;
        }
    }

    /** 
     * @private
     */
    function makeDiv () {
        return document.createElement("div");
    }

    /**
     * @private
     */
    function emptyEl (el) {
        while ( el.lastChild ) {
            el.removeChild( el.lastChild );
        }
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

        for ( var c in corner )  {
            corner[c].classList.add("corner");
        }
        for ( var b in border )  {
            border[b].classList.add("border");
        }
        containerEl.classList.add("canvas-select");


        var hash = Date.now();
        _data[hash] = {};
        Object.defineProperty(this, "id", {
            __proto__: null,
            enumerable: false, 
            writable: false,
            configurable: false,
            value: hash
        });

        _set.call(this, "containerEl", containerEl);
        _set.call(this, "border", border);
        _set.call(this, "corner", corner);
        _set.call(this, "canvas", canvas);
        _set.call(this, "ctx", ctx);
    }

    CanvasSelect.prototype.render = function (element) {
        if ( ! element instanceof Element ) { return null; }
        else {
            emptyEl(element);
            element.appendChild(_get.call(this, "containerEl"));
        }
    };

    CanvasSelect.prototype.destroy = function () {      
        var that = this;
        for ( var key in this ) {
            if ( typeof this[key] === "function" ) {
                this[key] = 1;
            }
            (function () {
                delete that[key];
            })();
        }
        delete _data[this.id];
        return null;
    };

    return CanvasSelect;
});
