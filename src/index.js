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
import fscreen from 'fscreen';

function Carousel(root) {

    // component configuration
    const config = {
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
    const supportsClassList = 'classList' in document.documentElement;
    const supportsTransitions = getTransitionEndEventName();

    if (supportsClassList && supportsTransitions) {
        root.classList.add('is-enhanced');
    } else return;

    // component properties
    const buttonNext = root.querySelector('[data-carousel-next]');
    const buttonPrevious = root.querySelector('[data-carousel-previous]');
    const buttonClose = root.querySelector('[data-carousel-close]');
    const list = root.querySelector('[data-carousel-list]');
    let items = [].slice.call(root.querySelectorAll(config.itemSelector));
    let anchors = [].slice.call(root.querySelectorAll(config.anchorSelector));
    const images = [].slice.call(root.querySelectorAll('[data-carousel-img]'));
    const transitionEventName = getTransitionEndEventName();
    const transformPropertyName = getTransformPropertyName();
    const firstImage = images[0];
    const firstImageLoaded = firstImage.complete && firstImage.naturalWidth !== 0;
    const DIRECTION = {LEFT: -1, INITIAL: 0, RIGHT: 1};
    let sizesAttribute = null;
    let itemWidth = null;
    let itemTranslateX = null;
    let touchStartX = null;
    let resizeTimer = null;
    let isFullscreen = false;

    // bind to events

    window.addEventListener('resize', () => {
        // clear timer when resize event has fired before the timer has finished
        clearTimeout(resizeTimer);

        // throttle getting item properties on each resize event
        resizeTimer = setTimeout(function () {
            getItemWidthAndTranslateZ();
        }.bind(this), 100)
    });

    window.addEventListener('orientationchange', getItemWidthAndTranslateZ);

    root.addEventListener('click', (event) => {
        const isOverlayClicked = event.target === root;

        if (isFullscreen && isOverlayClicked) {
            closeFullscreen();
        }
    });

    root.addEventListener('keydown', (event) => {

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

    items.forEach(item => {
        // bind to events for touch enabled devices
        item.addEventListener('touchstart', onTouchStart);
        item.addEventListener('touchend', onTouchEnd);
        item.addEventListener('touchmove', onTouchMove, {passive: true});
        // bind to mouse events to allow dragging on non-touch devices
        item.addEventListener('mousedown', onMouseDown(item));
        item.addEventListener('mouseup', onMouseUp(item));
    });

    anchors.forEach(anchor => {
        anchor.addEventListener('click', onAnchorClick);
    });

    buttonNext.addEventListener('click', () => animate(DIRECTION.LEFT));
    buttonPrevious.addEventListener('click', () => animate(DIRECTION.RIGHT));
    buttonClose.addEventListener('click', closeFullscreen);

    fscreen.addEventListener('fullscreenchange', () => {
        // exited native fullscreen (e.g. using Escape)
        if (fscreen.fullscreenElement === null) {
            closeFullscreen();
        }
    }, false);

    // we only get the properties of the first image, assuming
    // that the other images have the same dimensions and translateX
    if (firstImageLoaded) {
        // when image has been loaded already, initialize carousel
        initialize();
    } else {
        // ...or when it's still loading, add an event listener to
        // initialize the carousel later
        firstImage.addEventListener('load', () => initialize);
    }

    function initialize() {
        // get item width which is required for panning to work
        getItemWidthAndTranslateZ();
        // saves the sizes attribute which is required when closing fullscreen
        sizesAttribute = firstImage.sizes;
        // make the first visible item in the list focusable
        updateTabindex();
    }

    function getTransitionEndEventName() {
        const element = document.createElement('div');
        const transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

        for (const transition in transitions) {
            if (element.style[transition] !== undefined) {
                return transitions[transition];
            }
        }
    }

    function getTransformPropertyName() {
        const properties = [
            'transform',
            'msTransform',
            'webkitTransform',
            'mozTransform',
            'oTransform'
        ];

        for (let i = 0; i < properties.length; i++) {
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
        const style = window.getComputedStyle(items[0], null).getPropertyValue('transform');
        const matrix = style.replace(/[^0-9\-.,]/g, '').split(',');
        itemTranslateX = parseInt(matrix[12]) || parseInt(matrix[4]);
    }

    function onAnchorClick(event) {
        // prevent navigating to anchor.href
        event.preventDefault();

        // detect if keyboard triggered the 'click' event
        // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
        const isTriggeredByKeyboard = event.detail === 0;

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
        items.forEach(item => item.style[transformPropertyName] = '');

        const minimumMoveDistance = itemWidth / 8;
        const totalDistanceMoved = positionX - touchStartX;
        // Chrome for Android reports a few pixels difference between touchstart
        // and touchend when tapping on the screen.
        const clickDetectedTresshold = 10;

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
            const positionX = event.changedTouches[0].clientX;
            panItem(positionX);
        }
    }

    function panItem(positionX) {
        const distanceMovedX = positionX - touchStartX;
        const offsetXTotal = itemTranslateX + distanceMovedX;
        const newTranslateX = Math.max(
            Math.min(itemTranslateX + itemWidth, offsetXTotal),
            itemTranslateX - itemWidth
        );

        items.forEach(item => item.style[transformPropertyName] = `translateX(${newTranslateX}px)`);
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

        if (touchStartX && !items.some(item => isAnimating(item))) {
            const positionX = event.clientX;
            panItem(positionX);
        }
    }

    function animate(direction) {
        // query items, since the order may have changed after the last animation
        const items = [].slice.call(root.querySelectorAll(config.itemSelector));

        // abort if an animation is still running on an item
        if (items.some(item => isAnimating(item)))
            return;

        items.forEach((item, index) => {
            // add event listener so that class can be removed after CSS transition has ended
            item.addEventListener(transitionEventName, onAnimateEnded(item, index, direction));
            // add class to trigger CSS animation
            item.classList.add(getAnimationClass(direction));
        });
    }

    function isAnimating (item) {
        const animatingClasses = [
            config.animateLeftClass,
            config.animateRightClass,
            config.animateInitialClass
        ];

        return animatingClasses.some(animatingClass =>
            item.classList.contains(animatingClass)
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
        const handleAnimateEnded = function () {
            item.removeEventListener(transitionEventName, handleAnimateEnded);

            // when the first item has finished animating, append it to the end of the list
            const firstItem = index === 0;

            if (direction === DIRECTION.LEFT && firstItem) {
                list.appendChild(item);
                updateTabindex();
            }

            // ...or if it's the last item, insert it at the beginning of the list
            const lastItem = index === items.length - 1;

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
        const anchors = [].slice.call(root.querySelectorAll(config.anchorSelector));

        anchors.forEach((anchor, index) => {
            const focusableAnchorIndex = Math.abs(itemTranslateX / itemWidth);

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
        const isFirstElementFocused = document.activeElement === buttonClose;
        const isLastElementFocused = document.activeElement === buttonNext;

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
        images.forEach(image => swapFallbackImage(image));
        // show carousel in fullscreen overlay
        root.classList.add(config.fullscreenClass);
        // disable scrolling on body while fullscreen is active
        document.body.classList.add(config.scrollDisabledClass);
        // make image stretch to 100% viewport width
        images.forEach(image => image.sizes = '100vw');
        // item width and translateX have changed: get new values
        getItemWidthAndTranslateZ();
        // anchors around images should not be focusable in fullscreen
        anchors.forEach(anchor => anchor.setAttribute('tabindex', -1));
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
        images.forEach(image => swapFallbackImage(image));
        // hide fullscreen overlay
        root.classList.remove(config.fullscreenClass);
        // enable scrolling on body again
        document.body.classList.remove(config.scrollDisabledClass);
        // restore original sizes attribute
        images.forEach(image => image.sizes = sizesAttribute);
        // item width and translateX have changed: get new values
        getItemWidthAndTranslateZ();
        // update tabindexes for all anchors
        updateTabindex();
        // focus anchor of currently visible image
        const anchor = anchors.filter(anchor => anchor.getAttribute('tabindex') === '0');

        if (anchor && anchor.length > 0) {
            anchor[0].focus();
        }
    }

    function swapFallbackImage(image) {
        const originalSrc = image.getAttribute(config.originalSrcAttribute);

        if (originalSrc) {
            // restore original img src
            image.src = originalSrc;
            image.removeAttribute(config.originalSrcAttribute);
        } else {
            // find the highest resolution image in the `srcset` attribute,
            // and set it as the current `src`
            const srcset = image.getAttribute('srcset').split(',');

            let highResImage = srcset
            // sanitize srcset array
                .map(src => {
                    const srcArray = src.trim().split(' ');

                    return {
                        url: srcArray[0],
                        width: parseInt(srcArray[1].replace('w', ''))
                    };
                })
                // find the image with the highest width
                .reduce((result, src) => src.width > result.width ? src : result, {
                    // use current src as initial result value
                    url: image.src,
                    width: image.naturalWidth
                });

            image.setAttribute(config.originalSrcAttribute, image.src);
            image.src = highResImage.url;
        }
    }
}

const initializeAll = (context = document) => {
    const elements = [].slice.call(context.querySelectorAll('[data-carousel]'));
    return elements.map(element => new Carousel(element));
};

export default { initializeAll };