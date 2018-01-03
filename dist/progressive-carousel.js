(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Carousel = factory());
}(this, (function () { 'use strict';

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lib = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var key = {
  fullscreenEnabled: 0,
  fullscreenElement: 1,
  requestFullscreen: 2,
  exitFullscreen: 3,
  fullscreenchange: 4,
  fullscreenerror: 5
};

var webkit = ['webkitFullscreenEnabled', 'webkitFullscreenElement', 'webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitfullscreenchange', 'webkitfullscreenerror'];

var moz = ['mozFullScreenEnabled', 'mozFullScreenElement', 'mozRequestFullScreen', 'mozCancelFullScreen', 'mozfullscreenchange', 'mozfullscreenerror'];

var ms = ['msFullscreenEnabled', 'msFullscreenElement', 'msRequestFullscreen', 'msExitFullscreen', 'MSFullscreenChange', 'MSFullscreenError'];

// so it doesn't throw if no window or document
var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};

var vendor = 'fullscreenEnabled' in document && Object.keys(key) || webkit[0] in document && webkit || moz[0] in document && moz || ms[0] in document && ms || [];

exports.default = {
  requestFullscreen: function requestFullscreen(element) {
    return element[vendor[key.requestFullscreen]]();
  },
  requestFullscreenFunction: function requestFullscreenFunction(element) {
    return element[vendor[key.requestFullscreen]];
  },
  get exitFullscreen() {
    return document[vendor[key.exitFullscreen]].bind(document);
  },
  addEventListener: function addEventListener(type, handler, options) {
    return document.addEventListener(vendor[key[type]], handler, options);
  },
  removeEventListener: function removeEventListener(type, handler, options) {
    return document.removeEventListener(vendor[key[type]], handler, options);
  },
  get fullscreenEnabled() {
    return Boolean(document[vendor[key.fullscreenEnabled]]);
  },
  set fullscreenEnabled(val) {},
  get fullscreenElement() {
    return document[vendor[key.fullscreenElement]];
  },
  set fullscreenElement(val) {},
  get onfullscreenchange() {
    return document[('on' + vendor[key.fullscreenchange]).toLowerCase()];
  },
  set onfullscreenchange(handler) {
    return document[('on' + vendor[key.fullscreenchange]).toLowerCase()] = handler;
  },
  get onfullscreenerror() {
    return document[('on' + vendor[key.fullscreenerror]).toLowerCase()];
  },
  set onfullscreenerror(handler) {
    return document[('on' + vendor[key.fullscreenerror]).toLowerCase()] = handler;
  }
};
});

var fscreen = unwrapExports(lib);

/*
 *  progressive-carousel
 *
 *  https://github.com/reinoute/progressive-carousel
 *
 *  Author: Reinout Eppinga (reinout@reinout.com)
 *  Website: http://www.reinout.com
 */

// Import module for vendor agnostic access to the Fullscreen API
// Source: https://github.com/rafrex/fscreen
function Carousel(root) {
    var this$1 = this;


    // component configuration
    var config = {
        itemSelector: '[data-carousel-item]',
        anchorSelector: '[data-carousel-anchor]',
        fullscreenClass: 'is-fullscreen',
        scrollDisabledClass: 'scroll-disabled',
        animateLeftClass: 'is-animating-left',
        animateRightClass: 'is-animating-right',
        animateInitialClass: 'is-animating-initial',
        originalSrcAttribute: 'data-carousel-original-src'
    };

    // Only initialize component when browser meets minimum requirements:
    // 1. ClassList: https://caniuse.com/#feat=classlist
    // 2. CSS3 transitions: http://caniuse.com/#feat=css-transitions
    var supportsClassList = 'classList' in document.documentElement;
    var supportsTransitions = getTransitionEndEventName();

    if (supportsClassList && supportsTransitions) {
        root.classList.add('is-enhanced');
    } else { return; }

    // component properties
    var buttonNext = root.querySelector('[data-carousel-next]');
    var buttonPrevious = root.querySelector('[data-carousel-previous]');
    var buttonClose = root.querySelector('[data-carousel-close]');
    var list = root.querySelector('[data-carousel-list]');
    var items = [].slice.call(root.querySelectorAll(config.itemSelector));
    var anchors = [].slice.call(root.querySelectorAll(config.anchorSelector));
    var images = [].slice.call(root.querySelectorAll('[data-carousel-img]'));
    var transitionEventName = getTransitionEndEventName();
    var transformPropertyName = getTransformPropertyName();
    var firstImage = images[0];
    var DIRECTION = {LEFT: -1, INITIAL: 0, RIGHT: 1};
    var sizesAttribute = firstImage.sizes; // assuming all images have the same sizes attribute
    var itemWidth = null;
    var itemTranslateX = null;
    var touchStartX = null;
    var resizeTimer = null;
    var isFullscreen = false;

    // bind to events

    window.addEventListener('resize', function () {
        // clear timer when resize event has fired before the timer has finished
        clearTimeout(resizeTimer);

        // throttle getting item properties on each resize event
        resizeTimer = setTimeout(function () {
            getItemWidthAndTranslateZ();
        }.bind(this$1), 100);
    });

    window.addEventListener('orientationchange', getItemWidthAndTranslateZ);

    root.addEventListener('click', function (event) {
        var isOverlayClicked = event.target === root;

        if (isFullscreen && isOverlayClicked) {
            closeFullscreen();
        }
    });

    root.addEventListener('keydown', function (event) {

        if (isFullscreen) {
            switch (event.which) {
                case 27: // escape
                    closeFullscreen();
                    break;
                case 37: // arrow left
                    animate(DIRECTION.RIGHT);
                    break;
                case 39: // arrow right
                    animate(DIRECTION.LEFT);
                    break;
                case 9: // tab
                    // trap focus inside fullscreen overlay
                    focusElement(event);
                    break;
            }
        }
    });

    items.forEach(function (item) {
        // bind to events for touch enabled devices
        item.addEventListener('touchstart', onTouchStart);
        item.addEventListener('touchend', onTouchEnd);
        item.addEventListener('touchmove', onTouchMove, {passive: true});
        // bind to mouse events to allow dragging on non-touch devices
        item.addEventListener('mousedown', onMouseDown(item));
        item.addEventListener('mouseup', onMouseUp(item));
    });

    anchors.forEach(function (anchor) {
        anchor.addEventListener('click', onAnchorClick);
    });

    firstImage.addEventListener('load', function () {
        // we only get the properties of the first item, assuming
        // that the other images have the same dimensions
        getItemWidthAndTranslateZ();
        // make the first visible item in the list focusable
        updateTabindex();
    });

    buttonNext.addEventListener('click', function () { return animate(DIRECTION.LEFT); });
    buttonPrevious.addEventListener('click', function () { return animate(DIRECTION.RIGHT); });
    buttonClose.addEventListener('click', closeFullscreen);

    fscreen.addEventListener('fullscreenchange', function () {
        // exited native fullscreen (e.g. using Escape)
        if (fscreen.fullscreenElement === null) {
            closeFullscreen();
        }
    }, false);

    function getTransitionEndEventName() {
        var element = document.createElement('div');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

        for (var transition in transitions) {
            if (element.style[transition] !== undefined) {
                return transitions[transition];
            }
        }
    }

    function getTransformPropertyName() {
        var properties = [
            'transform',
            'msTransform',
            'webkitTransform',
            'mozTransform',
            'oTransform'
        ];

        for (var i = 0; i < properties.length; i++) {
            if (typeof document.body.style[properties[i]] !== 'undefined') {
                return properties[i];
            }
        }

        return null;
    }

    function getItemWidthAndTranslateZ() {
        // now all images are downloaded and the page is fully rendered, we can get the item width
        itemWidth = items[0].offsetWidth;
        // ...and we can get the translateZ value
        // https://medium.com/building-blocks/how-to-read-out-translatex-translatey-from-an-element-with-translate3d-with-jquery-c15d2dcccc2c
        var style = window.getComputedStyle(items[0], null).getPropertyValue('transform');
        var matrix = style.replace(/[^0-9\-.,]/g, '').split(',');
        itemTranslateX = parseInt(matrix[12]) || parseInt(matrix[4]);
    }

    function onAnchorClick(event) {
        // prevent navigating to anchor.href
        event.preventDefault();

        // detect if keyboard triggered the 'click' event
        // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
        var isTriggeredByKeyboard = event.detail === 0;

        if (isTriggeredByKeyboard && !isFullscreen) {
            openFullscreen();
        }
    }

    function onTouchStart(event) {
        // prevent touch also triggering 'mousedown'
        event.preventDefault();

        touchStartX = event.targetTouches[0].clientX;
    }

    function onTouchEnd() {
        handlePointerUp(event.changedTouches[0].clientX);
    }

    function handlePointerUp(positionX) {
        // remove the translateX value that was set on mousemove / touchmove
        items.forEach(function (item) { return item.style[transformPropertyName] = ''; });

        var minimumMoveDistance = itemWidth / 8;
        var totalDistanceMoved = positionX - touchStartX;
        // Chrome for Android reports a few pixels difference between touchstart
        // and touchend when tapping on the screen.
        var clickDetectedTresshold = 10;

        if (Math.abs(totalDistanceMoved) < clickDetectedTresshold) {
            // click detected
            isFullscreen ? animate(DIRECTION.LEFT) : openFullscreen();
        } else if (totalDistanceMoved < 0 && Math.abs(totalDistanceMoved) > minimumMoveDistance) {
            // swipe left detected
            animate(DIRECTION.LEFT);
        } else if (totalDistanceMoved > minimumMoveDistance) {
            // swipe right detected
            animate(DIRECTION.RIGHT);
        } else {
            // swiped less than the required minimum distance:
            // animate back to initial state
            animate(DIRECTION.INITIAL);
        }

        touchStartX = null;
    }

    function onTouchMove(event) {

        if (touchStartX) {
            var positionX = event.changedTouches[0].clientX;
            panItem(positionX);
        }
    }

    function panItem(positionX) {
        var distanceMovedX = positionX - touchStartX;
        var offsetXTotal = itemTranslateX + distanceMovedX;
        var newTranslateX = Math.max(
            Math.min(itemTranslateX + itemWidth, offsetXTotal),
            itemTranslateX - itemWidth
        );

        items.forEach(function (item) { return item.style[transformPropertyName] = "translateX(" + newTranslateX + "px)"; });
    }

    function onMouseDown(item) {
        return function (event) {
            /* prevent default browser behavior, such as dragging an image to another application */
            event.preventDefault();

            touchStartX = event.clientX;
            item.addEventListener('mousemove', onMouseMove, {passive: true});
        }.bind(this);
    }

    function onMouseUp(item) {
        return function (event) {
            handlePointerUp(event.clientX);
            item.removeEventListener('mousemove', onMouseMove);
        }.bind(this);
    }

    function onMouseMove(event) {

        if (touchStartX && !items.some(function (item) { return isAnimating(item); })) {
            var positionX = event.clientX;
            panItem(positionX);
        }
    }

    function animate(direction) {
        // query items, since the order may have changed after the last animation
        var items = [].slice.call(root.querySelectorAll(config.itemSelector));

        // abort if an animation is still running on an item
        if (items.some(function (item) { return isAnimating(item); }))
            { return; }

        items.forEach(function (item, index) {
            // add event listener so that class can be removed after CSS transition has ended
            item.addEventListener(transitionEventName, onAnimateEnded(item, index, direction));
            // add class to trigger CSS animation
            item.classList.add(getAnimationClass(direction));
        });
    }

    function isAnimating (item) {
        var animatingClasses = [
            config.animateLeftClass,
            config.animateRightClass,
            config.animateInitialClass
        ];

        return animatingClasses.some(function (animatingClass) { return item.classList.contains(animatingClass); }
        );
    }

    function getAnimationClass(direction) {

        if (direction === DIRECTION.LEFT) {
            return config.animateLeftClass;
        } else if (direction === DIRECTION.RIGHT) {
            return config.animateRightClass;
        } else if (direction === DIRECTION.INITIAL) {
            return config.animateInitialClass;
        } else {
            return null;
        }
    }

    function onAnimateEnded(item, index, direction) {
        var handleAnimateEnded = function () {
            item.removeEventListener(transitionEventName, handleAnimateEnded);

            // when the first item has finished animating, append it to the end of the list
            var firstItem = index === 0;

            if (direction === DIRECTION.LEFT && firstItem) {
                list.appendChild(item);
                updateTabindex();
            }

            // ...or if it's the last item, insert it at the beginning of the list
            var lastItem = index === items.length - 1;

            if (direction === DIRECTION.RIGHT && lastItem) {
                list.insertBefore(item, list.firstElementChild);
                updateTabindex();
            }

            // remove animation class
            item.classList.remove(getAnimationClass(direction));

        }.bind(this);

        return handleAnimateEnded;
    }

    function updateTabindex() {
        // query anchors, since the order may have changed after an animation
        var anchors = [].slice.call(root.querySelectorAll(config.anchorSelector));

        anchors.forEach(function (anchor, index) {
            var focusableAnchorIndex = Math.abs(itemTranslateX / itemWidth);

            if (isFullscreen) {
                // normally an anchor triggers fullscreen mode, but in fullscreen
                // mode anchors should not be interactive, so don't make them focusable
                anchor.setAttribute('tabindex', -1);
            } else if (index === focusableAnchorIndex) {
                anchor.setAttribute('tabindex', 0);
            } else {
                anchor.setAttribute('tabindex', -1);
            }
        });
    }

    function focusElement(event) {
        var isFirstElementFocused = document.activeElement === buttonClose;
        var isLastElementFocused = document.activeElement === buttonNext;

        if (event.shiftKey && isFirstElementFocused) {
            event.preventDefault();
            buttonNext.focus();
        } else if (!event.shiftKey && isLastElementFocused) {
            event.preventDefault();
            buttonClose.focus();
        }
    }

    function openFullscreen() {
        isFullscreen = true;
        // swap the `src` of all images with the high res version, so that browsers not supporting
        // `srcset` show high resolution images in fullscreen mode
        images.forEach(function (image) { return swapFallbackImage(image); });
        // show carousel in fullscreen overlay
        root.classList.add(config.fullscreenClass);
        // disable scrolling on body while fullscreen is active
        document.body.classList.add(config.scrollDisabledClass);
        // make image stretch to 100% viewport width
        images.forEach(function (image) { return image.sizes = '100vw'; });
        // item width and translateX have changed: get new values
        getItemWidthAndTranslateZ();
        // anchors around images should not be focusable in fullscreen
        anchors.forEach(function (anchor) { return anchor.setAttribute('tabindex', -1); });
        // focus close button
        buttonClose.focus();
        // toggle native fullscreen when Fullscreen API is supported
        if (fscreen.fullscreenEnabled) {
            fscreen.requestFullscreen(root);
        }
    }

    function closeFullscreen() {
        isFullscreen = false;
        // exit browser fullscreen mode when Fullscreen API is supported
        if (fscreen.fullscreenEnabled && fscreen.fullscreenElement !== null) {
            fscreen.exitFullscreen();
        }
        // revert fallback image src from high res to original src
        images.forEach(function (image) { return swapFallbackImage(image); });
        // hide fullscreen overlay
        root.classList.remove(config.fullscreenClass);
        // enable scrolling on body again
        document.body.classList.remove(config.scrollDisabledClass);
        // restore original sizes attribute
        images.forEach(function (image) { return image.sizes = sizesAttribute; });
        // item width and translateX have changed: get new values
        getItemWidthAndTranslateZ();
        // update tabindexes for all anchors
        updateTabindex();
        // focus anchor of currently visible image
        var anchor = anchors.filter(function (anchor) { return anchor.getAttribute('tabindex') === '0'; });

        if (anchor && anchor.length > 0) {
            anchor[0].focus();
        }
    }

    function swapFallbackImage(image) {
        var originalSrc = image.getAttribute(config.originalSrcAttribute);

        if (originalSrc) {
            // restore original img src
            image.src = originalSrc;
            image.removeAttribute(config.originalSrcAttribute);
        } else {
            // find the highest resolution image in the `srcset` attribute,
            // and set it as the current `src`
            var srcset = image.getAttribute('srcset').split(',');

            var highResImage = srcset
            // sanitize srcset array
                .map(function (src) {
                    var srcArray = src.trim().split(' ');

                    return {
                        url: srcArray[0],
                        width: parseInt(srcArray[1].replace('w', ''))
                    };
                })
                // find the image with the highest width
                .reduce(function (result, src) { return src.width > result.width ? src : result; }, {
                    // use current src as initial result value
                    url: image.src,
                    width: image.naturalWidth
                });

            image.setAttribute(config.originalSrcAttribute, image.src);
            image.src = highResImage.url;
        }
    }
}

var initializeAll = function (context) {
    if ( context === void 0 ) context = document;

    var elements = [].slice.call(context.querySelectorAll('[data-carousel]'));
    return elements.map(function (element) { return new Carousel(element); });
};

var index = { initializeAll: initializeAll };

return index;

})));
