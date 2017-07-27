/*
 * Carousel Component
 */

// Vendor agnostic access to the Fullscreen API:
// https://github.com/rafrex/fscreen
import fscreen from 'fscreen';

import {getTransitionEndEventName, getTransformPropertyName} from './utils';

class Component {

    constructor(element) {
        // component configuration
        this.config = {
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
            element.classList.add('is-enhanced');
        } else return;

        // component properties
        this.root = element;
        this.buttonNext = this.root.querySelector('[data-carousel-next]');
        this.buttonPrevious = this.root.querySelector('[data-carousel-previous]');
        this.buttonClose = this.root.querySelector('[data-carousel-close]');
        this.list = this.root.querySelector('[data-carousel-list]');
        this.items = [].slice.call(this.root.querySelectorAll(this.config.itemSelector));
        this.anchors = [].slice.call(this.root.querySelectorAll(this.config.anchorSelector));
        this.images = [].slice.call(this.root.querySelectorAll('[data-carousel-img]'));
        this.transitionEventName = getTransitionEndEventName();
        this.transformPropertyName = getTransformPropertyName();
        this.firstImage = this.images[0];
        this.sizesAttribute = this.firstImage.sizes; // assuming all images have the same sizes attribute
        this.itemWidth = null;
        this.itemTranslateX = null;
        this.touchStartX = null;
        this.resizeTimer = null;
        this.isFullscreen = false;
        this.DIRECTION = {LEFT: -1, INITIAL: 0, RIGHT: 1};

        // bind functions to component context
        this.getItemWidthAndTranslateZ = this.getItemWidthAndTranslateZ.bind(this);
        this.onAnchorClick = this.onAnchorClick.bind(this);
        this.animate = this.animate.bind(this);
        this.closeFullscreen = this.closeFullscreen.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.panItem = this.panItem.bind(this);

        // bind to events
        window.addEventListener('resize', () => {
            // clear timer when resize event has fired before the timer has finished
            clearTimeout(this.resizeTimer);

            // throttle getting item properties on each resize event
            this.resizeTimer = setTimeout(function () {
                this.getItemWidthAndTranslateZ();
            }.bind(this), 100)
        });

        this.root.addEventListener('click', (event) => {
            const isOverlayClicked = event.target.hasAttribute('data-carousel');

            if (this.isFullscreen && isOverlayClicked) {
                this.closeFullscreen();
            }
        });

        this.root.addEventListener('keydown', (event) => {

            if (this.isFullscreen) {
                switch (event.which) {
                    case 27: // escape
                        this.closeFullscreen();
                        break;
                    case 37: // arrow left
                        this.animate(this.DIRECTION.RIGHT);
                        break;
                    case 39: // arrow right
                        this.animate(this.DIRECTION.LEFT);
                        break;
                    case 9: // tab
                        // trap focus inside fullscreen overlay
                        this.focusElement(event);
                        break;
                }
            }
        });

        this.items.forEach(item => {
            // bind to events for touch enabled devices
            item.addEventListener('touchstart', this.onTouchStart);
            item.addEventListener('touchend', this.onTouchEnd);
            item.addEventListener('touchmove', this.onTouchMove, {passive: true});
            // bind to mouse events to allow dragging on non-touch devices
            item.addEventListener('mousedown', this.onMouseDown(item));
            item.addEventListener('mouseup', this.onMouseUp(item));
        });

        this.anchors.forEach(anchor => {
            anchor.addEventListener('click', this.onAnchorClick);
        });

        // we only get the properties of the first item, assuming that the other
        // images have the same dimensions
        this.firstImage.addEventListener('load', this.getItemWidthAndTranslateZ);

        this.buttonNext.addEventListener('click', () => this.animate(this.DIRECTION.LEFT));
        this.buttonPrevious.addEventListener('click', () => this.animate(this.DIRECTION.RIGHT));
        this.buttonClose.addEventListener('click', this.closeFullscreen);

        fscreen.addEventListener('fullscreenchange', () => {
            // exited native fullscreen (e.g. using Escape)
            if (fscreen.fullscreenElement === null) {
                this.closeFullscreen();
            }
        }, false);
    }

    getItemWidthAndTranslateZ() {
        // now all images are downloaded and the page is fully rendered, we can get the item width
        this.itemWidth = this.items[0].offsetWidth;
        // ...and we can get the translateZ value
        // https://medium.com/building-blocks/how-to-read-out-translatex-translatey-from-an-element-with-translate3d-with-jquery-c15d2dcccc2c
        const style = window.getComputedStyle(this.items[0], null).getPropertyValue('transform');
        const matrix = style.replace(/[^0-9\-.,]/g, '').split(',');
        this.itemTranslateX = parseInt(matrix[12]) || parseInt(matrix[4]);
    }

    onAnchorClick(event) {
        // prevent navigating to anchor.href
        event.preventDefault();

        // detect if keyboard triggered the 'click' event
        // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
        const isTriggeredByKeyboard = event.detail === 0;

        if (isTriggeredByKeyboard && !this.isFullscreen) {
            this.openFullscreen();
        }
    }

    onTouchStart(event) {
        // prevent touch also triggering 'mousedown'
        event.preventDefault();

        this.touchStartX = event.targetTouches[0].clientX;
    }

    onTouchEnd() {
        this.handlePointerUp(event.changedTouches[0].clientX);
    }

    handlePointerUp(positionX) {
        // remove the translateX value that was set on mousemove / touchmove
        this.items.forEach(item => item.style[this.transformPropertyName] = '');

        const minimumMoveDistance = this.itemWidth / 5;
        const totalDistanceMoved = positionX - this.touchStartX;
        // Chrome for Android reports a few pixels difference between touchstart
        // and touchend when tapping on the screen.
        const clickDetectedTresshold = 10;

        if (Math.abs(totalDistanceMoved) < clickDetectedTresshold) {
            // click detected
            this.isFullscreen ? this.animate(this.DIRECTION.LEFT) : this.openFullscreen();
        } else if (totalDistanceMoved < 0 && Math.abs(totalDistanceMoved) > minimumMoveDistance) {
            // swipe left detected
            this.animate(this.DIRECTION.LEFT);
        } else if (totalDistanceMoved > minimumMoveDistance) {
            // swipe right detected
            this.animate(this.DIRECTION.RIGHT);
        } else {
            // swiped less than the required minimum distance:
            // animate back to initial state
            this.animate(this.DIRECTION.INITIAL);
        }

        this.touchStartX = null;
    }

    onTouchMove(event) {

        if (this.touchStartX) {
            const positionX = event.changedTouches[0].clientX;
            this.panItem(positionX);
        }
    }

    panItem(positionX) {
        const distanceMovedX = positionX - this.touchStartX;
        const offsetXTotal = this.itemTranslateX + distanceMovedX;
        const newTranslateX = Math.max(
            Math.min(this.itemTranslateX + this.itemWidth, offsetXTotal),
            this.itemTranslateX - this.itemWidth
        );

        this.items.forEach(item => item.style[this.transformPropertyName] = `translateX(${newTranslateX}px)`);
    }

    onMouseDown(item) {
        return function (event) {
            /* prevent default browser behavior, such as dragging an image to another application */
            event.preventDefault();

            this.touchStartX = event.clientX;
            item.addEventListener('mousemove', this.onMouseMove, {passive: true});
        }.bind(this);
    }

    onMouseUp(item) {
        return function (event) {
            this.handlePointerUp(event.clientX);
            item.removeEventListener('mousemove', this.onMouseMove);
        }.bind(this);
    }

    onMouseMove(event) {
        const isAnimating = this.items.some(item => this.isAnimating(item));

        if (this.touchStartX && !isAnimating) {
            const positionX = event.clientX;
            this.panItem(positionX);
        }
    }

    animate(direction) {
        // query items, since the order may have changed after the last animation
        const items = [].slice.call(this.root.querySelectorAll(this.config.itemSelector));

        // abort if an animation is still running on an item
        if (items.some(item => this.isAnimating(item)))
            return;

        items.forEach((item, index) => {
            // add event listener so that class can be removed after CSS transition has ended
            item.addEventListener(this.transitionEventName, this.onAnimateEnded(item, index, direction));
            // add class to trigger CSS animation
            item.classList.add(this.getAnimationClass(direction));
        });
    }

    isAnimating(item) {
        const animatingClasses = [
            this.config.animateLeftClass,
            this.config.animateRightClass,
            this.config.animateInitialClass
        ];

        return animatingClasses.some(animatingClass =>
            item.classList.contains(animatingClass)
        );
    }

    getAnimationClass(direction) {

        if (direction === this.DIRECTION.LEFT) {
            return this.config.animateLeftClass;
        } else if (direction === this.DIRECTION.RIGHT) {
            return this.config.animateRightClass;
        } else if (direction === this.DIRECTION.INITIAL) {
            return this.config.animateInitialClass;
        } else {
            return null;
        }
    }

    onAnimateEnded(item, index, direction) {
        const handleAnimateEnded = function () {
            item.removeEventListener(this.transitionEventName, handleAnimateEnded);

            // when the first item has finished animating, append it to the end of the list
            const firstItem = index === 0;

            if (direction === this.DIRECTION.LEFT && firstItem) {
                this.list.appendChild(item);
                this.updateTabindex();
            }

            // ...or if it's the last item, insert it at the beginning of the list
            const lastItem = index === this.items.length - 1;

            if (direction === this.DIRECTION.RIGHT && lastItem) {
                this.list.insertBefore(item, this.list.firstElementChild);
                this.updateTabindex();
            }

            // remove animation class
            item.classList.remove(this.getAnimationClass(direction));

        }.bind(this);

        return handleAnimateEnded;
    }

    updateTabindex() {
        // query anchors, since the order may have changed after an animation
        const anchors = [].slice.call(this.root.querySelectorAll(this.config.anchorSelector));

        anchors.forEach((anchor, index) => {
            const focusableAnchorIndex = Math.abs(this.itemTranslateX / this.itemWidth);

            if (this.isFullscreen) {
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

    focusElement(event) {
        const isFirstElementFocused = document.activeElement === this.buttonClose;
        const isLastElementFocused = document.activeElement === this.buttonNext;

        if (event.shiftKey && isFirstElementFocused) {
            event.preventDefault();
            this.buttonNext.focus();
        } else if (!event.shiftKey && isLastElementFocused) {
            event.preventDefault();
            this.buttonClose.focus();
        }
    }

    openFullscreen() {
        this.isFullscreen = true;
        // swap the `src` of all images with the high res version, so that browsers not supporting
        // `srcset` show high resolution images in fullscreen mode
        this.images.forEach(image => this.swapFallbackImage(image));
        // show carousel in fullscreen overlay
        this.root.classList.add(this.config.fullscreenClass);
        // disable scrolling on body while fullscreen is active
        document.body.classList.add(this.config.scrollDisabledClass);
        // make image stretch to 100% viewport width
        this.images.forEach(image => image.sizes = '100vw');
        // item width and translateX have changed: get new values
        this.getItemWidthAndTranslateZ();
        // anchors around images should not be focusable in fullscreen
        this.anchors.forEach(anchor => anchor.setAttribute('tabindex', -1));
        // focus close button
        this.buttonClose.focus();
        // toggle native fullscreen when Fullscreen API is supported
        if (fscreen.fullscreenEnabled) {
            fscreen.requestFullscreen(this.root);
        }
    }

    closeFullscreen() {
        this.isFullscreen = false;
        // exit browser fullscreen mode when Fullscreen API is supported
        if (fscreen.fullscreenEnabled && fscreen.fullscreenElement !== null) {
            fscreen.exitFullscreen();
        }
        // revert fallback image src from high res to original src
        this.images.forEach(image => this.swapFallbackImage(image));
        // hide fullscreen overlay
        this.root.classList.remove(this.config.fullscreenClass);
        // enable scrolling on body again
        document.body.classList.remove(this.config.scrollDisabledClass);
        // restore original sizes attribute
        this.images.forEach(image => image.sizes = this.sizesAttribute);
        // item width and translateX have changed: get new values
        this.getItemWidthAndTranslateZ();
        // update tabindexes for all anchors
        this.updateTabindex();
        // focus anchor of currently visible image
        const anchor = this.anchors.filter(anchor => anchor.getAttribute('tabindex') === '0');

        if (anchor && anchor.length > 0) {
            anchor[0].focus();
        }
    }

    swapFallbackImage(image) {
        const originalSrc = image.getAttribute(this.config.originalSrcAttribute);

        if (originalSrc) {
            // restore original img src
            image.src = originalSrc;
            image.removeAttribute(this.config.originalSrcAttribute);
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

            image.setAttribute(this.config.originalSrcAttribute, image.src);
            image.src = highResImage.url;
        }
    }
}

const enhanceElement = (element) =>
    element ? new Component(element) : false;

const enhance = () =>
    enhanceElement(document.querySelector('[data-carousel]'));

export default {enhance};
