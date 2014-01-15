/**
 * User: pisti
 * Date: 2013.11.07.
 */
/*
 define([],
 function () {
 return {
 imp : prezentation
 }
 });
 */ //for require.js
//prototype test
//var prezentation = function ( confOptions ) {
"use strict"
//noinspection FunctionWithInconsistentReturnsJS
function Prezentation(confOptions){

    var self = this;
    this.confOptions = confOptions;
    this.defaults = {
        width             : 1024,
        height            : 576,
        maxScale          : 1,
        minScale          : 0,
        perspective       : 1000,
        transitionDuration: 1000,
        rootContainer     : '',
        reset             : false,
        initStep          : 0,
        canvasClass       : 'canvas'
    };

    // HELPER FUNCTIONS
    /**
     * inserted 2013.10.17.
     * jquery.extend() like function
     * @param target
     * @param source
     * @returns {target}
     */
    this.extend = function ( target, source ) {
        target = target || {};
        for ( var prop in source ) {
            if ( typeof source[prop] === 'object' ) {
                target[prop] = extend( target[prop], source[prop] );
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    };

    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    this.pfx = (function () {

        var style = document.createElement( 'dummy' ).style,
            prefixes = 'Webkit Moz O ms Khtml'.split( ' ' ),
            memory = {};

        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {

                var ucProp = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
                    props = (prop + ' ' + prefixes.join( ucProp + ' ' ) + ucProp).split( ' ' );

                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }

            }

            return memory[ prop ];
        };

    })();
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    this.arrayify = function ( a ) {
        return [].slice.call( a );
    };

    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    this.css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty( key ) ) {
                pkey = self.pfx( key );
                if ( pkey !== null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    };

    // `toNumber` takes a value given as `numeric` parameter and tries to turn
    // it into a number. If it is not possible it returns 0 (or other value
    // given as `fallback`).
    this.toNumber = function ( numeric, fallback ) {
        return isNaN( numeric ) ? (fallback || 0) : Number( numeric );
    };

    // `byId` returns element with given `id` - you probably have guessed that ;)
    this.byId = function ( id ) {
        return document.getElementById( id );
    };

    // `$` returns first element for given CSS `selector` in the `context` of
    // the given element or whole document.
    this.$ = function ( selector, context ) {
        context = context || document;
        return context.querySelector( selector );
    };

    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    this.$$ = function ( selector, context ) {
        context = context || document;
        return this.arrayify( context.querySelectorAll( selector ) );
    };

    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    this.triggerEvent = function ( el, eventName, detail ) {
        var event = document.createEvent( "CustomEvent" );
        event.initCustomEvent( eventName, true, true, detail );
        el.dispatchEvent( event );

    };

    // `translate` builds a translate transform string for given data.
    this.translate = function ( t ) {
        return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
    };

    // `rotate` builds a rotate transform string for given data.
    // By default the rotations are in X Y Z order that can be reverted by passing `true`
    // as second parameter.
    this.rotate = function ( r, revert ) {
        var rX = " rotateX(" + r.x + "deg) ",
            rY = " rotateY(" + r.y + "deg) ",
            rZ = " rotateZ(" + r.z + "deg) ";

        return revert ? rZ + rY + rX : rX + rY + rZ;
    };

    // `scale` builds a scale transform string for given data.
    this.scale = function ( s ) {
        return " scale(" + s + ") ";
    };

    // `perspective` builds a perspective transform string for given data.
    this.perspective = function ( p ) {
        return " perspective(" + p + "px) ";
    };

    // `getElementFromHash` returns an element located by id from hash part of
    // window location.
    this.getElementFromHash = function () {
        // get id from url # by removing `#` or `#/` from the beginning,
        // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
        return this.byId( window.location.hash.replace( /^#\/?/, "" ) );
    };

    this.getElementIdFromHash = function () {
        // get id from url # by removing `#` or `#/` from the beginning,
        // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
        return window.location.hash.replace( /^#\/?/, "" );
    };

    // `computeWindowScale` counts the scale factor between window size and size
    // defined for the presentation in the config.
    /**
     * inserted 2013.10.17.
     * if defaults.rootContainer isn't document.body
     * @param config
     * @returns {number}
     */
    this.computeWindowScale = function ( config ) {
        var win = this.defaults.rootContainer ? document.getElementById( this.defaults.rootContainer ) : window;
        var hScale = this.defaults.rootContainer ? win.clientHeight / config.height : win.innerHeight / config.height,
            wScale = this.defaults.rootContainer ? win.clientWidth / config.width : win.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale;

        if ( config.maxScale && scale > config.maxScale ) {
            scale = config.maxScale;
        }

        if ( config.minScale && scale < config.minScale ) {
            scale = config.minScale;
        }
        return scale;
    };

    /**
     * extend config data
     * eg.: rootContainer isn't document body
     */
    this.extend( this.defaults, this.confOptions );

    // CHECK SUPPORT
    this.body = document.body;
    this.containerElement = this.defaults.rootContainer === '' ? this.body : document.getElementById(this.defaults.rootContainer);
    //this.body
    //containerElement.classList.add( "impress-disabled" );

    var ua = navigator.userAgent.toLowerCase();
    this.impressSupported =
        // browser should support CSS 3D transtorms
        ( this.pfx( "perspective" ) !== null ) &&

            // and `classList` and `dataset` APIs
            ( typeof document.documentElement.classList === 'object') &&
            ( typeof document.documentElement.dataset === 'object') &&

            // but some mobile devices need to be blacklisted,
            // because their CSS 3D support or hardware is not
            // good enough to run impress.js properly, sorry...
            ( ua.search( /(ipod)|(android)/ ) === -1 ); // (iphone)|

    if ( !this.impressSupported ) {
        // we can't be sure that `classList` is supported
        this.body.className += " impress-not-supported ";
        var fMessage = document.getElementsByClassName( 'fallback-message' )[0];
        fMessage.className += ' in';

        document.getElementById( this.defaults.rootContainer ).style.display = 'none';
        setTimeout( function () {
            fMessage.className = fMessage.className.replace( /(?:^|\s)in(?!\S)/, '' );
        }, 5000 );
    } else {
        //this.body
        this.containerElement.classList.remove( "impress-not-supported" );
        this.containerElement.classList.remove( "impress-disabled" );
        //this.body
        this.containerElement.classList.add( "impress-supported" );
        this.containerElement.classList.add( "impress-enabled" );
        var element = document.querySelector(".fallback-message");
        element.parentNode.removeChild(element);
    }

    // First we set up the viewport for mobile devices.
    // For some reason iPad goes nuts when it is not done properly.
    var meta = this.$( "meta[name='viewport']" ) || document.createElement( "meta" );
    meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
    if ( meta.parentNode !== document.head ) {
        meta.name = 'viewport';
        document.querySelector( "head" ).appendChild( meta );
    }

    // GLOBALS AND DEFAULTS

    // This is were the root elements of all impress.js instances will be kept.
    // Yes, this means you can have more than one instance on a page, but I'm not
    // sure if it makes any sense in practice ;)

    this.roots = {};

    this.rootId = '';

    /**
     * reset for reinit impress
     */
    if ( this.defaults.reset ) {
        this.roots = {};
    }

    this.rootId = this.rootId || "impress";

    // if given root is already initialized just return the API
    if ( this.roots["impress-root-" + this.rootId] ) {
        return this.roots["impress-root-" + this.rootId];
    }

    // data of all presentation steps
    this.stepsData = {};

    // element of currently active step
    this.activeStep = null;

    // current state (position, rotation and scale) of the presentation
    this.currentState = null;

    // array of step elements
    this.steps = null;

    // configuration options
    this.config = null;

    // scale factor of the browser window
    this.windowScale = null;

    // root presentation elements
    this.root = this.byId( this.rootId );
    this.canvas = document.createElement( "div" );
    this.canvas.id = this.defaults.canvasClass;
    this.canvas.className = this.defaults.canvasClass;

    this.initialized = false;

    // reference to last entered step
    this.lastEntered = null;

    // STEP EVENTS
    //
    // There are currently two step events triggered by impress.js
    // `impress:stepenter` is triggered when the step is shown on the
    // screen (the transition from the previous one is finished) and
    // `impress:stepleave` is triggered when the step is left (the
    // transition to next step just starts).

    // Simple helper to list any substeps within an element
    this.getSubsteps = function ( element ) {
        return self.$$( ".substep", element );
    };

    this.getPresentSubstep = function ( element ) {
        return self.$( ".present", element );
    };

    // Returns the first substep element marked as future
    // or false if there are no future substeps
    this.getNextSubstep = function ( element ) {
        var result = false;
        var substeps = self.getSubsteps( element );
        if ( substeps.length > 0 ) {
            var futureSubsteps = self.$$( ".future", element );
            if ( futureSubsteps.length > 0 ) {
                result = futureSubsteps[0];
            }
        }
        return result;
    };

    // Returns the last substep element marked as past
    // or false if there are no past substeps
    this.getPreviousSubstep = function ( element ) {
        var result = false;
        var substeps = self.getSubsteps( element );
        if ( substeps.length > 0 ) {
            var pastSubsteps = self.$$( ".past", element );
            if ( pastSubsteps.length > 0 ) {
                result = pastSubsteps[pastSubsteps.length - 1];
            }
        }
        return result;
    };

    // helper for navigation forward a substep
    this.substepForward = function ( element ) {
        if ( self.getPresentSubstep( element ) ) {
            var presentSubstep = self.getPresentSubstep( element );
            presentSubstep.classList.remove( "present" );
            presentSubstep.classList.add( "past" );
            self.triggerEvent( presentSubstep, "impress:substep-exit" );
        }
        var nextSubstep = self.getNextSubstep( element );
        nextSubstep.classList.remove( "future" );
        nextSubstep.classList.add( "present" );
        nextSubstep.classList.add( "active" );
        // trigger events
        self.triggerEvent( nextSubstep, "impress:substep-active" );
        self.triggerEvent( nextSubstep, "impress:substep-enter" );
    };

    // helper for navigation back a substep
    this.substepBackward = function ( element ) {
        var presentSubstep = self.getPresentSubstep( element );
        presentSubstep.classList.remove( "present" );
        presentSubstep.classList.add( "future" );
        presentSubstep.classList.remove( "active" );

        // trigger events
        self.triggerEvent( presentSubstep, "impress:substep-inactive" );
        self.triggerEvent( presentSubstep, "impress:substep-exit" );

        if ( self.getPreviousSubstep( element ) ) {
            var previousSubstep = self.getPreviousSubstep( element );
            previousSubstep.classList.remove( "past" );
            previousSubstep.classList.add( "present" );
            self.triggerEvent( previousSubstep, "impress:substep-enter" );
        }
    };

    // `onStepEnter` is called whenever the step element is entered
    // but the event is triggered only if the step is different than
    // last entered step.
    this.onStepEnter = function ( step ) {
        if ( self.lastEntered !== step ) {
            self.triggerEvent( step, "impress:stepenter" );
            self.triggerEvent( step, 'myobject:valami' );
            self.lastEntered = step;
        }
    };

    // `onStepLeave` is called whenever the step element is left
    // but the event is triggered only if the step is the same as
    // last entered step.
    this.onStepLeave = function ( step ) {
        if ( self.lastEntered === step ) {
            self.triggerEvent( step, "impress:stepleave" );
            self.lastEntered = null;
        }
    };

    // `initStep` initializes given step element by reading data from its
    // data attributes and setting correct styles.
    this.initStep = function ( el, idx ) {

        var data = el.dataset,
            step = {
                translate: {
                    x: self.toNumber( data.x ),
                    y: self.toNumber( data.y ),
                    z: self.toNumber( data.z )
                },
                rotate   : {
                    x: self.toNumber( data.rotateX ),
                    y: self.toNumber( data.rotateY ),
                    z: self.toNumber( data.rotateZ || data.rotate )
                },
                scale    : self.toNumber( data.scale, 1 ),
                el       : el
            };

        if ( !el.id ) {
            el.id = "step-" + (idx + 1);
        }

        self.stepsData["impress-" + el.id] = step;

        self.css( el, {
            position      : "absolute",
            transform     : "translate(-50%,-50%)" +
                self.translate( step.translate ) +
                self.rotate( step.rotate ) +
                self.scale( step.scale ),
            transformStyle: "preserve-3d"
        } );

        // need to prepare substeps with 'future'
        if ( self.getSubsteps( el ).length > 0 ) {
            self.getSubsteps( el ).forEach(
                function ( substep ) {
                    substep.classList.add( "future" );
                }
            );
        }
    };

    // used to reset timeout for `impress:stepenter` event
    this.stepEnterTimeout = null;

    //inserted 2013.10.18.
    // naugtur:
    // `setTransformationCallback` API function - sets a callback that allows passing the current transformations outside, to the editing tool
    this.transformationCallback = null;
    this.setTransformationCallback = function ( callback ) {
        self.transformationCallback = callback;
    }

}

Prezentation.prototype.getStep = function ( step ) {
    // `getStep` is a helper function that returns a step element defined by parameter.
    // If a number is given, step with index given by the number is returned, if a string
    // is given step element with such id is returned, if DOM element is given it is returned
    // if it is a correct step element.
    var self = this;
    if ( typeof step === "number" ) {
        step = step < 0 ? self.steps[ self.steps.length + step] : self.steps[ step ];
    } else if ( typeof step === "string" ) {
        step = self.byId( step );
    }
    return (step && step.id && self.stepsData["impress-" + step.id]) ? step : null;
}

Prezentation.prototype.goto = function ( el, duration ) {


    var self = this;
    if ( !this.initialized || !(el = this.getStep( el )) ) {
        // presentation not initialized or given element is not a step
        return false;
    }

    // Sometimes it's possible to trigger focus on first link with some keyboard action.
    // Browser in such a case tries to scroll the page to make this element visible
    // (even that body overflow is set to hidden) and it breaks our careful positioning.
    //
    // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
    // whenever slide is selected
    //
    // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
    window.scrollTo( 0, 0 );

    var step = this.stepsData["impress-" + el.id];

    if ( this.activeStep ) {
        this.activeStep.classList.remove( "active" );
        this.body.classList.remove( "impress-on-" + this.activeStep.id );
    }
    el.classList.add( "active" );

    this.body.classList.add( "impress-on-" + el.id );

    // compute target state of the canvas based on given step
    var target = {
        rotate   : {
            x: -step.rotate.x,
            y: -step.rotate.y,
            z: -step.rotate.z
        },
        translate: {
            x: -step.translate.x,
            y: -step.translate.y,
            z: -step.translate.z
        },
        scale    : 1 / step.scale
    };

    // naugtur:
    // Running the callback if was registered.
    if ( self.transformationCallback ) {
        self.transformationCallback( {
            scale    : step.scale,
            rotate   : step.rotate,
            translate: step.translate
        } );
    }

    // Check if the transition is zooming in or not.
    //
    // This information is used to alter the transition style:
    // when we are zooming in - we start with move and rotate transition
    // and the scaling is delayed, but when we are zooming out we start
    // with scaling down and move and rotation are delayed.
    var zoomin = target.scale >= this.currentState.scale;

    duration = this.toNumber( duration, this.config.transitionDuration );
    var delay = (duration / 2);

    // if the same step is re-selected, force computing window scaling,
    // because it is likely to be caused by window resize
    if ( el === this.activeStep ) {
        this.windowScale = this.computeWindowScale( this.config );
    }

    var targetScale = target.scale * this.windowScale;

    // trigger leave of currently active element (if it's not the same step again)
    if ( this.activeStep && this.activeStep !== el ) {
        this.onStepLeave( this.activeStep );
    }

    // Now we alter transforms of `root` and `canvas` to trigger transitions.
    //
    // And here is why there are two elements: `root` and `canvas` - they are
    // being animated separately:
    // `root` is used for scaling and `canvas` for translate and rotations.
    // Transitions on them are triggered with different delays (to make
    // visually nice and 'natural' looking transitions), so we need to know
    // that both of them are finished.
    this.css( this.root, {
        // to keep the perspective look similar for different scales
        // we need to 'scale' the perspective, too
        transform         : this.perspective( this.config.perspective / targetScale ) + this.scale( targetScale ),
        transitionDuration: duration + "ms",
        transitionDelay   : (zoomin ? delay : 0) + "ms"
    } );
    this.root.setAttribute( 'data-perspective', this.toNumber(this.config.perspective / targetScale) );
    this.root.setAttribute( 'data-scale', targetScale );

    this.css( this.canvas, {
        transform         : this.rotate( target.rotate, true ) + this.translate( target.translate ),
        transitionDuration: duration + "ms",
        transitionDelay   : (zoomin ? 0 : delay) + "ms"
    } );
    /**
     * inserted 2013.10.25.
     * set transformation data attributes for later handling
     * eg: zoom in/out with mousewheel
     */
    this.canvas.setAttribute( 'data-perspective-x', target.translate.x );
    this.canvas.setAttribute( 'data-perspective-y', target.translate.y );
    this.canvas.setAttribute( 'data-perspective-z', target.translate.z );
    //this.canvas.setAttribute( 'data-scale', targetScale );
    // Here is a tricky part...
    //
    // If there is no change in scale or no change in rotation and translation, it means there was actually
    // no delay - because there was no transition on `root` or `canvas` elements.
    // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
    // and target values to check if delay should be taken into account.
    //
    // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
    // - it's simply comparing all the values.
    if ( this.currentState.scale === target.scale ||
        (this.currentState.rotate.x === target.rotate.x && this.currentState.rotate.y === target.rotate.y &&
            this.currentState.rotate.z === target.rotate.z && this.currentState.translate.x === target.translate.x &&
            this.currentState.translate.y === target.translate.y && this.currentState.translate.z === target.translate.z) ) {
        delay = 0;
    }

    // store current state
    this.currentState = target;
    this.activeStep = el;

    // And here is where we trigger `impress:stepenter` event.
    // We simply set up a timeout to fire it taking transition duration (and possible delay) into account.
    //
    // I really wanted to make it in more elegant way. The `transitionend` event seemed to be the best way
    // to do it, but the fact that I'm using transitions on two separate elements and that the `transitionend`
    // event is only triggered when there was a transition (change in the values) caused some bugs and
    // made the code really complicated, cause I had to handle all the conditions separately. And it still
    // needed a `setTimeout` fallback for the situations when there is no transition at all.
    // So I decided that I'd rather make the code simpler than use shiny new `transitionend`.
    //
    // If you want learn something interesting and see how it was done with `transitionend` go back to
    // version 0.5.2 of impress.js: http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
    window.clearTimeout( this.stepEnterTimeout );
    this.stepEnterTimeout = window.setTimeout( function () {
        self.onStepEnter( self.activeStep );
    }, duration + delay );

    return el;
};

Prezentation.prototype.prev = function () {
    // `prev` API function goes to previous step (in document order)
    // or backs up one stubstep if a present substep is found
    if ( this.getPresentSubstep( this.activeStep ) ) {
        // if this step has a substep in present state
        // substepBackward. This is not exposed in API
        // because substeps cannot be deep linked
        this.substepBackward( this.activeStep );
    } else {
        // when no present substep goto previous step
        var prev = this.steps.indexOf( this.activeStep ) - 1;
        prev = prev >= 0 ? this.steps[ prev ] : this.steps[ this.steps.length - 1 ];
        return this.goto( prev );
    }
};

Prezentation.prototype.next = function () {
    // `next` API function goes to next step (in document order)
    if ( this.getNextSubstep( this.activeStep ) ) {
        // if a future substep is found in this step
        // substepForward.  This is not exposed in API
        // because substeps cannot be deep linked
        this.substepForward( this.activeStep );
    } else {
        // when no future substeps are available goto next step
        var next = this.steps.indexOf( this.activeStep ) + 1;
        next = next < this.steps.length ? this.steps[ next ] : this.steps[ 0 ];
        this.goto( next );
    }
};

Prezentation.prototype.getActiveStep = function () {
    // `getActiveStep` API function to get active step
    return (this.activeStep) ? this.activeStep : document.createElement( 'div' );
};

Prezentation.prototype.initialize = function () {
    var self = this;

    if ( this.initialized ) {
        return false;
    }

    if ( !this.impressSupported ) {
        return false;
    }

    // initialize configuration object
    this.rootData = this.root.dataset;

    this.config = {
        width             : this.toNumber( this.rootData.width, this.defaults.width ),
        height            : this.toNumber( this.rootData.height, this.defaults.height ),
        maxScale          : this.toNumber( this.rootData.maxScale, this.defaults.maxScale ),
        minScale          : this.toNumber( this.rootData.minScale, this.defaults.minScale ),
        perspective       : this.toNumber( this.rootData.perspective, this.defaults.perspective ),
        transitionDuration: this.toNumber( this.rootData.transitionDuration, this.defaults.transitionDuration )
    };

    this.windowScale = this.computeWindowScale( this.config );

    // wrap steps with "canvas" element
    this.arrayify( this.root.childNodes ).forEach( function ( el ) {
        self.canvas.appendChild( el );
    } );

    this.root.appendChild( this.canvas );

    // set initial styles
    document.documentElement.style.height = "100%";

    this.css( this.body, {
        height  : "100%",
        overflow: "hidden"
    } );

    this.rootStyles = {
        position       : "absolute",
        transformOrigin: "top left",
        transition     : "all 0s ease-in-out",
        transformStyle : "preserve-3d"
    };

    this.css( this.root, this.rootStyles );

    this.css( this.root, {
        top      : "50%",
        left     : "50%",
        transform: this.perspective( this.config.perspective / this.windowScale ) + this.scale( this.windowScale )
    } );
    /**
     * inserted 2013.10.25.
     * set transformation data attributes for later handling
     * eg: zoom in/out with mousewheel
     */
    this.root.setAttribute( 'data-perspective', this.config.perspective / this.windowScale );
    this.root.setAttribute( 'data-scale', this.windowScale );

    this.css( this.canvas, this.rootStyles );

    this.body.classList.remove( "impress-disabled" );
    this.body.classList.add( "impress-enabled" );

    // get and init steps
    this.steps = this.$$( ".step", this.root );
    this.steps.forEach( this.initStep );

    // set a default initial state of the canvas
    this.currentState = {
        translate: { x: 0, y: 0, z: 0 },
        rotate   : { x: 0, y: 0, z: 0 },
        scale    : 1
    };

    this.initialized = true;
    this.lastHash = '';

    // Adding some useful classes to step elements.
    //
    // All the steps that have not been shown yet are given `future` class.
    // When the step is entered the `future` class is removed and the `present`
    // class is given. When the step is left `present` class is replaced with
    // `past` class.
    //
    // So every step element is always in one of three possible states:
    // `future`, `present` and `past`.
    //
    // There classes can be used in CSS to style different types of steps.
    // For example the `present` class can be used to trigger some custom
    // animations when step is shown.
    addEventO( this.root, "impress:init", function () {
        // STEP CLASSES
        self.steps.forEach( function ( step ) {
            step.classList.add( "future" );
        } );

        addEventO(self.root, "impress:stepenter", function ( event ) {
            event.target.classList.remove( "past" );
            event.target.classList.remove( "future" );
            event.target.classList.add( "present" );
            window.location.hash = self.lastHash = "#/" + event.target.id;

        }, false, _eventHandlers);

        addEventO(self.root,  "impress:stepleave", function ( event ) {
            event.target.classList.remove( "present" );
            event.target.classList.add( "past" );
        }, false, _eventHandlers);

    }, false, _eventHandlers);

    // Adding hash change support.
    addEventO( this.root, "impress:init", function (event) {

        // last hash detected


        // `#/step-id` is used instead of `#step-id` to prevent default browser
        // scrolling to element in hash.
        //
        // And it has to be set after animation finishes, because in Chrome it
        // makes transtion laggy.
        // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
        addEventO( self.root, "impress:stepenter", function ( event ) {
            window.location.hash = self.lastHash = "#/" + event.target.id;
        }, false, _eventHandlers);

        addEventO( window, "hashchange", function () {
            // When the step is entered hash in the location is updated
            // (just few lines above from here), so the hash change is
            // triggered and we would call `goto` again on the same element.
            //
            // To avoid this we store last entered hash and compare.
            if ( window.location.hash !== self.lastHash ) {
                self.goto( self.getElementFromHash() );
            }
        }, false, _eventHandlers);

        // START
        // by selecting step defined in url or first step of the presentation
        self.goto( self.getElementFromHash() || self.getStep( self.defaults.initStep ), 0 );
    }, false, _eventHandlers);
    // throttling function calls, by Remy Sharp
    // http://remysharp.com/2010/07/21/throttling-function-calls/
    var throttle = function ( fn, delay ) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout( timer );
            timer = setTimeout( function () {
                fn.apply( context, args );
            }, delay );
        };
    };

    // wait for impress.js to be initialized

    addEventO( document, "impress:init", function ( event ) {
        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you
        // need to control the presentation that was just initialized.
        /*
         var api = event.detail.api;
         console.log('impress:init api??')
         console.log(event.detail)
         */
        // KEYBOARD NAVIGATION HANDLERS

        // Prevent default keydown action when one of supported key is pressed.
        addEventO( document, "keydown", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                event.preventDefault();
            }
        }, false , _eventHandlers);

        // Trigger impress action (next or prev) on keyup.

        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
        addEventO( document, "keyup", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                switch ( event.keyCode ) {
                    case 33: // pg up
                    case 37: // left
                    case 38: // up
                        self.prev();
                        break;
                    case 9:  // tab
                    case 32: // space
                    case 34: // pg down
                    case 39: // right
                    case 40: // down
                        self.next();
                        break;
                }

                event.preventDefault();
            }
        }, false, _eventHandlers);
        /*
        // delegated handler for clicking on the links to presentation steps
        addEventO( self.root, "click", function ( event ) {
            // event delegation with "bubbling"
            // check if event target (or any of its parents is a link)
            var target = event.target;
            while ( (target.tagName !== "A") &&
                (target !== document.documentElement) ) {
                target = target.parentNode;
            }

            if ( target.tagName === "A" ) {
                var href = target.getAttribute( "href" );

                // if it's a link to presentation step, target this step
                if ( href && href[0] === '#' ) {
                    target = document.getElementById( href.slice( 1 ) );
                }
            }

            if ( self.goto( target ) ) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }, false, _eventHandlers);

         // delegated handler for clicking on step elements
         self.root.addEventListener("click", function (event) {
         var target = event.target;
         // find closest step element that is not active
         while (!(target.classList.contains("step") && !target.classList.contains("active")) &&
         (target !== document.documentElement))
         {
         target = target.parentNode;
         }

         if (self.goto(target))
         {
         event.preventDefault();
         }
         }, false);
         */
        var rootC = document.getElementById( self.defaults.rootContainer );
        // touch handler to detect swipe left or right
        function swipeStartOnRoot( event ) {
            if(document.getElementById('overviewMode' ).parentNode.classList.contains('active')) return false;
            //alert('event start');
            console.log( 'event' );
            console.log( event );
            if ( event.touches.length === 1 ) {
                //store initial touch location
                window.xTouch = event.touches[0].clientX;
            }
        }
        addEventO(rootC, "touchstart", swipeStartOnRoot, false, _eventHandlers);

        function swipeEndOnRoot( event ) {
            if(document.getElementById('overviewMode' ).parentNode.classList.contains('active')) return false;
            //ensure that a touch starting point was saved and that there is an endtouch point
            alert('event end');
            //return
            console.log(event.changedTouches.length)
            if ( window.xTouch && event.changedTouches.length === 1 ) {
                //calculate the difference between starting point and end touch point
                var difference = window.xTouch - event.changedTouches[0].clientX;
                //round up to better calculate difference and see if it is over the threshold (180px)
                alert(difference)
                if ( Math.abs( difference ) > 180 ) {
                    //if the difference is positive, the swipe was right-to-left. if negative, the swipe was left-to-right
                    if ( difference > 0 ) {
                        self.next();
                    } else {
                        self.prev();
                    }
                }
            }
        }
        addEventO(rootC, "touchend", swipeEndOnRoot, false, _eventHandlers);


        // rescale presentation when window is resized
        addEventO(window, "resize", throttle( function () {
            // force going to active step again, to trigger rescaling
            self.goto( document.querySelector( ".active" ), 500 );
        }, 250 ), false, _eventHandlers);

    }, false, _eventHandlers);

    this.triggerEvent( self.root, "impress:init" );

};

//edit helper functions
Prezentation.prototype.zoomOverview = function ( status ) {
    var self = this;


    /**
     *
     * @type {{button: HTMLElement, overviewStep: HTMLElement, data: DOMStringMap, stepData: {}, scale: (*|stepsData.scale|mouseOriginal.target.dataset.scale|Function)}}
     */
    var _this = {
        button      : document.getElementById( 'impressHome' ),
        overviewStep: document.getElementById( 'overview' ),
        data        : document.getElementById( 'overview' ).dataset,
        canvas      : document.getElementById( this.defaults.canvasClass ),
        canvasData  : document.getElementById( this.defaults.canvasClass ).dataset,
        stepData    : {},
        init        : function(){} || {},
        scale       : document.getElementById( 'overview' ).dataset.scale
    };


    (function () {

        _this.stepData = {
            translate: {
                x: self.toNumber( _this.data.x ),
                y: self.toNumber( _this.data.y ),
                z: self.toNumber( _this.data.z )
            },
            rotate   : {
                x: self.toNumber( _this.data.rotateX ),
                y: self.toNumber( _this.data.rotateY ),
                z: self.toNumber( _this.data.rotateZ || _this.data.rotate )
            },
            scale    : self.toNumber( _this.data.scale, 1 ),
            el       : _this.overviewStep
        };


        addEventO(_this.button, 'click', function ( e ) {
            e.preventDefault();
//alert('zümmm');
            self.stepsData['impress-overview'].scale = _this.scale;
            _this.overviewStep.setAttribute( 'data-scale', _this.stepData.scale );
            //window.location.hash.replace(/^#\/?/,"overview");
            if( document.getElementById( 'overview' ) )
                self.goto( 'overview' );
            else
alert('overview slide is missing');

        }, false, _eventHandlers);

    })();

    function handleData( delta, event, target ) {
        var s;
        if(isTouchEnabled)
            s=delta < 1 ? -.1 : .1;
        else
            s=delta < 0 ? -1 : 1;

        //var overviewStep = document.getElementById( 'overview' );
        //var canvas = document.getElementById(self.defaults.canvasClass);
        var step = {
                translate: {
                    x: self.toNumber( _this.data.x ),
                    y: self.toNumber( _this.data.y ),
                    z: self.toNumber( _this.data.z )
                },
                rotate   : {
                    x: self.toNumber( _this.data.rotateX ),
                    y: self.toNumber( _this.data.rotateY ),
                    z: self.toNumber( _this.data.rotateZ || _this.data.rotate )
                },
                scale    : self.toNumber( _this.data.scale, 1 ),
                el       : _this.overviewStep
            };

        //target is #impress container
        var currentScale = target.dataset.scale;// self.root.dataset.scale;
        //update scale data of impress container
        currentScale = self.toNumber(currentScale) + s*0.01;
        if(currentScale < 0.005 || currentScale > 1) return false;

        target.setAttribute( 'data-scale', currentScale )
        self.css( target, {
            transform: self.perspective( target.dataset.perspective ) + self.scale( currentScale )
        } );

        _this.overviewStep.setAttribute( 'data-scale', 1/currentScale );
        self.css( _this.overviewStep, {
            position      : "absolute",
            transform     : "translate(-50%,-50%)" +
                self.translate( step.translate ) +
                self.rotate( step.rotate ) +
                self.scale( 1/currentScale ),
            transformStyle: "preserve-3d"
        } );

        //update stepsData
        self.stepsData['impress-overview'].scale = 1 / currentScale;

        //self.goto( document.querySelector( ".active" ), 50 );
    }

    function wheel( event ) {
        console.log(event.target.classList)
        if ( self.getElementIdFromHash() === 'overview' &&
            ( (event.target.id === self.defaults.rootContainer) || (event.target.classList.contains('future')) )
        ) {} else return false;

        if(document.getElementById('slideEditorMode' ).parentNode.classList.contains('active')) return false;
        var target = self.root,
            delta = 0;
        if ( !event ) {
            event = window.event;
        }
        if ( event.wheelDelta ) {
            delta = event.wheelDelta / 120;
        } else if ( event.detail ) {
            delta = -event.detail / 3;
        } else if (event.scale)
            delta =  event.scale;

        if ( delta ) {
            handleData( delta, event, target );
        }
        if ( event.preventDefault ) {
            event.preventDefault();
        }
        event.preventDefault();//event.returnValue = false;
    }

    var actionName = isTouchEnabled ? 'gesturechange' : 'mousewheel';
    addEventO( document.getElementById( self.defaults.rootContainer ), actionName, wheel, false, _eventHandlers );
};

Prezentation.prototype.addStep = function ( idx ) {
    var element = document.createElement( 'div' );
    element.id = idx === null ? 'tempSlide-1' : idx;
    element.className = 'step slide newlyAdded';
    element.style.position = 'absolute';
    element.style.zIndex = '10';
    element.setAttribute( 'data-x', '-500' );
    element.setAttribute( 'data-y', '-500' );
    element.setAttribute( 'data-rotate', '0' );
    element.setAttribute( 'data-scale', '3' );
    element.innerHTML = '<h1>Simple slide</h1>';
    var overview = document.getElementById( 'overview' );
    this.canvas.insertBefore( element, overview )
    this.initStep( element, idx );
    if ( document.getElementById( element.id) ){
        this.steps = this.$$( ".step", this.root );
        return true;
    } else{
        self.canvas.removeChild( document.getElementById( element.id ) );
        return false;
    }
    console.log( this.stepsData );
};

Prezentation.prototype.removeStep = function ( el ) {
    var self = this;
    /**
     * @param: el (dom element id) || domelement object
     * return: delete or false
     */
    var elementId = typeof el === 'object' && el[0].id ? el[0].id : document.getElementById( el );
    if( elementId ){
        self.canvas.removeChild( document.getElementById( elementId ) );
        delete self.stepsData[elementId];
        self.steps = self.$$( ".step", self.root );
        return true;
    } else
        return false;
};

Prezentation.prototype.positionChange = function () {
    var self = this;

    var getTransformProperty = function ( element ) {
        var properties = ['transform', 'WebkitTransform', 'msTransform', 'MozTransform', 'OTransform'];
        var p;
        while ( p = properties.shift() ) {
            if ( typeof element.style[p] !== 'undefined' ) {
                return p;
            }
        }
        return 'transform';
    };

    var format = function ( number, dp ) {
        dp = Math.pow( 10, dp );
        return Math.floor( number * dp ) / dp;
    };

    var mouseDown = false,
        mouseMouse = false,
        mouseOriginal = {},
        rotatePattern = /rotateZ\(([-\d]*)deg\)/,
        canvas = document.getElementsByClassName( self.defaults.canvasClass )[0],
        canvasTransformProperty = getTransformProperty( canvas );

    /**
     * functions to manipulate slide position, scale, rotation
     */
    function canvasMouseUp(event){
        mouseDown = false;
        mouseMouse = false;
        event.stopImmediatePropagation();
        var actionName = isTouchEnabled ? 'touchmove' : 'mousemove';
        removeEventByNode( document.getElementById( self.defaults.rootContainer ), actionName, canvasMouseMove, _eventHandlers);
    }

    function canvasMouseDown(event){

        if(document.getElementById('slideEditorMode' ).parentNode.classList.contains('active')) return false;
        event.preventDefault();
        mouseDown = false;
        mouseMouse = false;
        var step = self.getElementFromHash() || '';
        if ( step.id && step.id === 'overview' ) {} else return false;
        var target =  event.target;
//console.log(target);

        while ( !(target.classList.contains( "step" ) && !target.classList.contains( "active" )) &&
            (target !== document.documentElement) ) {
            target = target.parentNode;
            //console.log(target);
        }
console.log(target);
        if ( target.nodeName !== 'BODY' && target.id !== 'statusBar' && target.localName !== 'html' ) {
            mouseDown = true;
            mouseMouse = false;
console.log('mouse down - step');
//console.log(target.dataset.scale);
            mouseOriginal = {
                rotate: ~~target.dataset.rotate,
                scale : (typeof target.dataset.scale == 'undefined') ? 1 : 1 * target.dataset.scale,
                x     : 1 * target.dataset.x,
                y     : 1 * target.dataset.y
            };
        } else if ( event.target.nodeName === 'DIV' && event.target.id == 'content'  ) {
            mouseDown = true;
            mouseMouse = true;
            target = event.target.querySelector('#'+self.defaults.canvasClass);
console.log('mouse down - root');
console.log(target.dataset);
            mouseOriginal = {
                rotate: 0,
                scale : 1,
                x     : 1 * target.dataset.perspectiveX,
                y     : 1 * target.dataset.perspectiveY
            };
        } else {
            mouseDown = false;
            mouseMouse = false;
        }

        mouseOriginal.Ex    = event.pageX;
        mouseOriginal.Ey    = event.pageY;
        mouseOriginal.target= target;

        var actionName = isTouchEnabled ? 'touchmove' : 'mousemove';
        addEventO( document.getElementById( self.defaults.rootContainer ), actionName, canvasMouseMove, false, _eventHandlers);

        //document.getElementById( self.defaults.rootContainer ).addEventListener( "mousemove", canvasMouseMove, false );
    }

    function canvasMouseMove(event){

        var dX = null,
            dY = null,
            canvasRotation = null,
            cosAlpha = null,
            sinAlpha=null,
            overviewStep=null;

        //move, scale, rotate slide in OverviewMode
        if ( mouseDown && !mouseMouse
            && (event.target.nodeName !== 'BODY' && event.target.localName !== 'html')
            && event.target.classList.contains('step') ){
console.log( 'mouseOriginal - on slide' );
console.log( event.target);
//return false;


            //missing operation icons
            if ( event.shiftKey ) {
                //updateMode("Rotating");
                console.log( 'isTouchEnabled rotateing' );
                mouseOriginal.target.dataset.rotate = format( (mouseOriginal.rotate + (event.pageX - mouseOriginal.Ex) / 2) % 360, 2 );
            }
            if ( event.altKey) {
                //updateMode("Scaling");
                console.log( 'isTouchEnabled scale' );
                mouseOriginal.target.dataset.scale = format( mouseOriginal.scale + (event.pageX-mouseOriginal.Ex) / 30, 2 );
            }
            //rotate and/or scale
            if(isTouchEnabled && event.touches.length == 2 && mouseOriginal.target.classList.contains('selected')) {
                mouseOriginal.target.dataset.scale = format( mouseOriginal.scale* (event.scale), 2 );
                mouseOriginal.target.dataset.rotate = format( (mouseOriginal.rotate + (event.rotation) ) , 2 );
            }

            if ( event.ctrlKey ||
                (isTouchEnabled && event.touches.length == 1 && mouseOriginal.target.classList.contains('selected'))) {
                //updateMode("Moving");
console.log('rotatepattern');
console.log(mouseOriginal);
//console.log( canvas.style[canvasTransformProperty].match( rotatePattern ) );
                dX = (event.pageX - mouseOriginal.Ex) * self.stepsData['impress-overview'].scale / mouseOriginal.scale;
                dY = (event.pageY - mouseOriginal.Ey) * self.stepsData['impress-overview'].scale / mouseOriginal.scale;
                canvasRotation = canvas.style[canvasTransformProperty].match( rotatePattern ) == null ? 0 : canvas.style[canvasTransformProperty].match( rotatePattern )[1];
                cosAlpha = Math.cos( (canvasRotation / 180) * Math.PI ); // I hate radians. Seriously.
                sinAlpha = Math.sin( (canvasRotation / 180) * Math.PI );
console.log( 'overview scale' )
//console.log( self.stepsData['impress-overview'].scale / mouseOriginal.scale )
                mouseOriginal.target.dataset.x = format( mouseOriginal.x + (cosAlpha * dX + sinAlpha * dY ) * mouseOriginal.scale, 2 );
                mouseOriginal.target.dataset.y = format( mouseOriginal.y + (cosAlpha * dY - sinAlpha * dX ) * mouseOriginal.scale, 2 );
                console.log( mouseOriginal.target )
            }

            /**
             * store modified data via initStep function
             */
            if ( event.target.nodeName != 'BODY' && event.target.id != 'statusBar' && event.target.id != 'impress' && event.target.className != 'canvas' ){
                self.initStep( mouseOriginal.target, 0 );
            }
        }
        /**/
        //reposition impress -> canvas container
        if ( mouseDown && mouseMouse
            && (event.target.nodeName === 'DIV' && event.target.id !== self.defaults.canvasClass)){

            dX = (event.pageX - mouseOriginal.Ex) * self.stepsData['impress-overview'].scale / mouseOriginal.scale;
            dY = (event.pageY - mouseOriginal.Ey) * self.stepsData['impress-overview'].scale / mouseOriginal.scale;
            canvasRotation = 0;//canvas.style[canvasTransformProperty].match( rotatePattern )[1],
            cosAlpha = Math.cos( (canvasRotation / 180) * Math.PI ); // I hate radians. Seriously.
            sinAlpha = Math.sin( (canvasRotation / 180) * Math.PI );
            overviewStep = document.getElementById('overview');
            mouseOriginal.target.dataset.perspectiveX = format( mouseOriginal.x + (cosAlpha * dX + sinAlpha * dY ) * mouseOriginal.scale, 2 );
            mouseOriginal.target.dataset.perspectiveY = format( mouseOriginal.y + (cosAlpha * dY - sinAlpha * dX ) * mouseOriginal.scale, 2 );

            var data = mouseOriginal.target.dataset,
                el = document.getElementById( self.defaults.canvasClass ),
                step = {
                    translate: {
                        x: self.toNumber( data.perspectiveX ),
                        y: self.toNumber( data.perspectiveY ),
                        z: self.toNumber( 0 )
                    },
                    rotate   : {
                        x: self.toNumber( 0 ),
                        y: self.toNumber( 0 ),
                        z: self.toNumber( 0 )
                    },
                    scale    : self.toNumber( 1 ),
                    el       : el
                },
                ostep = {
                    translate: {
                        x: self.toNumber( data.perspectiveX ),
                        y: self.toNumber( data.perspectiveY ),
                        z: self.toNumber( 0 )
                    },
                    rotate   : {
                        x: self.toNumber( 0 ),
                        y: self.toNumber( 0 ),
                        z: self.toNumber( 0 )
                    },
                    scale    : self.toNumber( self.stepsData['impress-overview'].scale ),
                    el       : overviewStep
                };
            //rotateZ(0deg) rotateY(0deg) rotateX(0deg) translate3d(-3000px, -1500px, 0px)
            //canvasdiv css
            self.css( el, {
                position      : "absolute",
                transform     : "translate(0%,0%)" +
                    self.translate( step.translate ), //+
                    //self.rotate( step.rotate ) +
                    //self.scale( step.scale ),
                transformStyle: "preserve-3d"
            } );
            //overview step
            self.css( overviewStep, {
                position      : "absolute",
                transform     : "translate(0%,0%)" +
                    self.translate( ostep.translate ) + self.scale( ostep.scale )
            } );
            overviewStep.setAttribute('data-x',ostep.translate.x);
            overviewStep.setAttribute('data-y',ostep.translate.y);
        }

    }

    /**
     * attached events to manipulate slide position, scale, rotation
     */
    var actionName = isTouchEnabled ? 'touchstart' : 'mousedown';
    addEventO( document.getElementById( self.defaults.rootContainer ), actionName, canvasMouseDown, false, _eventHandlers);
    actionName = isTouchEnabled ? 'touchend' : 'mouseup';
    addEventO( document.getElementById( self.defaults.rootContainer ), actionName, canvasMouseUp, false, _eventHandlers);

    /* To prevent text highlighting when dragging */
    if(!document.getElementById('impressnoselect')){
        var div = document.createElement( 'div' );
        div.innerHTML = 'x<style id="impressnoselect">*{-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;border:1px solid orange;}</style>';
        document.body.appendChild( div.lastChild );
    }

};

Prezentation.prototype._listeners = function () {
    var self = this;

console.log( 'init: Prezentation.prototype._listeners' );
    /**
     * Initialize slide editor, when stepenter event occurs not on overview slide
     */
    addEventO( self.root, "impress:stepenter", function ( event ) {
        var step = self.getElementFromHash() || '';
        if ( step.id && step.id == 'overview' ) {
console.log( 'addlistener on impress container - stepenter - deinit editor toolbar' );
console.log( 'editorInstance stepenter on overview' );
            document.getElementById('slideEditorMode' ).parentNode.classList.remove('active');
            document.getElementById('overviewMode' ).parentNode.classList.add('active');
            if ( editorInstance instanceof Editor ) {
                editorInstance.destroy();
                editorInstance = null;
alert( 'editor deinit' );
            }
            //remove transitation styles
            //var parent = document.getElementById(step.id ).parentNode;
            self.css( self.root, { transition : 'all 0ms ease-in-out 0ms' } );
            self.css( document.getElementById(self.defaults.canvasClass), { transition : 'all 0ms ease-in-out 0ms' } );
console.log( editorInstance );

        } else if ( step.id && step.id !== 'overview' ) {
console.log( 'addlistener on impress container - stepenter init editor - ' + step.id );
            document.getElementById('slideEditorMode' ).parentNode.classList.add('active');
            document.getElementById('overviewMode' ).parentNode.classList.remove('active');
            if ( !(editorInstance instanceof Editor) ) {
                editorInstance = new Editor();
                editorInstance.init();
            }

console.log( 'editorInstance stepenter' );
console.log( editorInstance );
        }

    }, false, _eventHandlers);

    /**
     * delegated handler for Add new slide to prezentation list
     * with id = tempSlide-1
     */
    function newSlide( event ) {
        event.stopPropagation();
        var step = self.getElementFromHash() || '';
        if ( step.id && step.id !== 'overview' ) {
            alert('adding new slide is only avaliable in overview mode');
            return false;
        }
        if( !self.addStep( uuid() ) )
            alert('new slide can not created');
    };
    addEventO( document.getElementById( 'newSlide' ), "click", newSlide, false, _eventHandlers);

    /**
     * delegated handler for remove selected slide
     */
    function removeSlide(event) {
        event.stopPropagation();
        var selectedSlide = self.root.querySelectorAll('.step.selected' );

        if( selectedSlide.length === 0 || !self.removeStep( selectedSlide ) ){
            alert('nothing selected');
        }
    }
    addEventO( document.getElementById( 'removeSlide' ), "click", removeSlide, false, _eventHandlers);

    /**
     * delegated handler for returning to overview mode

    document.getElementById( 'impressHome' ).addEventListener( "click", function (event) {
        event.stopPropagation();
        if(self.root.querySelector('overview'))
            self.goto( 'overview' );
        else
            alert('overview slide is missing');
    }, false );
    */

    /**
     * delegated handler for clicking on step elements
     */
    function clickOnSlide( event ) {
        var target = event.target;

        // find closest step element that is not active
        while ( !(target.classList.contains( "step" ) && !target.classList.contains( "active" )) &&
            (target !== document.documentElement) ) {
            target = target.parentNode;
        }
//alert('click')
        //add selected class to make possible to edit posotion and contents
        if ( (target.classList.contains( 'selected' )) ) {
            event.preventDefault();
            //if selected, goto slide to edit it
            if(document.getElementById('slideEditorMode' ).parentNode.classList.contains('active')){
                self.goto( target.id );
                target.classList.remove( 'selected' );
            }

        } else {
            var i = self.steps.length;
            while ( i-- ) {
                self.steps[i].classList.remove( 'selected' )
            }
            //if(self.getElementIdFromHash() === 'overview')
                target.classList.add( 'selected' );
        }
    }
    var actionName = isTouchEnabled ? 'touchstart' : 'click';
    addEventO( self.root, actionName, clickOnSlide, false, _eventHandlers);

};