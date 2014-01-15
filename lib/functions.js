/**
 * User: pisti
 * Date: 2013.11.18.
 * Time: 14:51
 * To change this template use File | Settings | File Templates.
 */

/**
 * is touchenabled device
 * @returns {boolean}
 */
var isTouchEnabled = (function() {
    var el = document.createElement('div');
    el.setAttribute('ontouchstart', 'return;');
    return (typeof el.ontouchstart == "function") ? true: false
})();

/**
 * UUID generator
 * @returns {string} xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function uuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * localstorage is supprted?
 * @returns {boolean}
 */
function isSupported() {
    return localStorage ? true : false;
}

/**
 * indexOf function for IE
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
        if (fromIndex == null) {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for (var i = fromIndex, j = this.length; i < j; i++) {
            if (this[i] === obj)
                return i;
        }
        return -1;
    };
}

/**
 * convert js array to js object
 * @param arr
 * @returns {{}}
 */
function toObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        rv[i] = arr[i];
    return rv;
}

/**
 * convert php returned NULL to ''
 * @param x
 * @returns {string}
 */
function clearNULL(x) {
    return x == null ? '' : x;
}

/**
 * cross-browser event handling
 * @type {{}}
 * @private
 */
var _eventHandlers = {};
//register/unregister attached events to nodes
function addEventO(node, event, handler, capture, _eventHandlers) {
    if (node == '')
        return false;
    if (!(node in _eventHandlers))
        _eventHandlers[node] = {};
    if (!(event in _eventHandlers[node]))
        _eventHandlers[node][event] = [];
    _eventHandlers[node][event].push([node, handler, capture]);
    if (node.addEventListener)
        node.addEventListener(event, handler, capture);
    else
        node.attachEvent('on' + event, handler, capture);
}

function removeEventByNode(node, event, handler, _eventHandlers) {
    if (node in _eventHandlers) {
        var handlers = _eventHandlers[node];
        for (var property in handlers){
            if(property === event){
                if (node.removeEventListener)
                    node.removeEventListener(event, handler);
                else
                    node.detachEvent('on' + event, handler);

                delete _eventHandlers[node][event];
            }
        }
    }
}

function removeAllEventsByNode(node, event, _eventHandlers) {
    if (node in _eventHandlers) {
        var handlers = _eventHandlers[node];
        if (event in handlers) {
            var eventHandlers = handlers[event];
            for (var i = eventHandlers.length; i--;) {
                var handler = eventHandlers[i];
                if (node.removeEventListener)
                    node.removeEventListener(event, handler[0], handler[1]);
                else
                    node.detachEvent('on' + event, handler[0], handler[1]);
            }
        }
    }
}

function removeAllEventsByEvent(event, _eventHandlers) {
    for (node in _eventHandlers) {
        var handlers = _eventHandlers[node];
        for (event in handlers) {
            var eventHandlers = handlers[event];
            for (var i = eventHandlers.length; i--;) {
                var handler = eventHandlers[i];
                if (handler[0].removeEventListener)
                    handler[0].removeEventListener(event, handler[1], handler[2]);
                else
                    handler[0].detachEvent('on' + event, handler[1], handler[2]);
            }
        }
    }
}

/**
 * scroll object to top
 * @param object
 */
function scrollToWorkingArea (object){
    $('html, body').animate({
        scrollTop: object.offset().top
    }, 1000);
}
/**
 * fullscreen handling
 * @param el
 */
function cancelFullscreen(el) {
    var requestMethod = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullscreen;
    if (requestMethod) { // cancel full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        /*
         var wscript = new ActiveXObject("WScript.Shell");
         if (wscript !== null) {
         wscript.SendKeys("{F11}");
         }
         */
    };
}

function requestFullscreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
//alert(requestMethod)
    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
        $('#gotoFullscreen').removeClass('hiddenClass').attr('data-type', 'screen').text('Exit fullscreen');
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        $('#gotoFullscreen').addClass('hiddenClass');
        /*
         var wscript = new ActiveXObject("WScript.Shell");
         if (wscript !== null) {
         wscript.SendKeys("{F11}");
         } else {
         alert('Csak manuálisan válthat teljes képernyős üzemmódra');
         }
         */
    };
}

function toggleFullscreen() {
    var elem = document.body; // Make the body go full screen.
    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen);
    console.log('inFull? '+ isInFullScreen)
    if (isInFullScreen) {
        cancelFullscreen(document);
        $('#gotoFullscreen').attr('data-type', 'fullscreen').text('Fullscreen');
    } else {
        requestFullscreen(elem);
        $('#gotoFullscreen').removeClass('hiddenClass').attr('data-type', 'screen').text('Exit fullscreen');
    }

    return false;
}

/**
 *
 * @param obj
 * @returns {string}
 */
function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}