!function(){"use strict";function t(){for(var t=["transform","msTransform","webkitTransform","mozTransform","oTransform"],e=0;e<t.length;e++)if(void 0!==document.body.style[t[e]])return t[e];return null}function e(){var t=document.createElement("div"),e={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(var n in e)if(void 0!==t.style[n])return e[n]}var n=function(t){return t&&t.__esModule?t.default:t}(function(t,e){return e={exports:{}},t(e,e.exports),e.exports}(function(t,e){Object.defineProperty(e,"__esModule",{value:!0});var n={fullscreenEnabled:0,fullscreenElement:1,requestFullscreen:2,exitFullscreen:3,fullscreenchange:4,fullscreenerror:5},i=["webkitFullscreenEnabled","webkitFullscreenElement","webkitRequestFullscreen","webkitExitFullscreen","webkitfullscreenchange","webkitfullscreenerror"],s=["mozFullScreenEnabled","mozFullScreenElement","mozRequestFullScreen","mozCancelFullScreen","mozfullscreenchange","mozfullscreenerror"],r=["msFullscreenEnabled","msFullscreenElement","msRequestFullscreen","msExitFullscreen","MSFullscreenChange","MSFullscreenError"],o="undefined"!=typeof window&&void 0!==window.document?window.document:{},l="fullscreenEnabled"in o&&Object.keys(n)||i[0]in o&&i||s[0]in o&&s||r[0]in o&&r||[];e.default={requestFullscreen:function(t){return t[l[n.requestFullscreen]]()},requestFullscreenFunction:function(t){return t[l[n.requestFullscreen]]},get exitFullscreen(){return o[l[n.exitFullscreen]].bind(o)},addEventListener:function(t,e,i){return o.addEventListener(l[n[t]],e,i)},removeEventListener:function(t,e){return o.removeEventListener(l[n[t]],e)},get fullscreenEnabled(){return Boolean(o[l[n.fullscreenEnabled]])},set fullscreenEnabled(t){},get fullscreenElement(){return o[l[n.fullscreenElement]]},set fullscreenElement(t){},get onfullscreenchange(){return o[("on"+l[n.fullscreenchange]).toLowerCase()]},set onfullscreenchange(t){return o[("on"+l[n.fullscreenchange]).toLowerCase()]=t},get onfullscreenerror(){return o[("on"+l[n.fullscreenerror]).toLowerCase()]},set onfullscreenerror(t){return o[("on"+l[n.fullscreenerror]).toLowerCase()]=t}}})),i=function(i){var s=this;this.config={itemSelector:"[data-carousel-item]",anchorSelector:"[data-carousel-anchor]",fullscreenClass:"is-fullscreen",scrollDisabledClass:"scroll-disabled",animateLeftClass:"is-animating-left",animateRightClass:"is-animating-right",animateInitialClass:"is-animating-initial",originalSrcAttribute:"data-carousel-original-src"};var r="classList"in document.documentElement,o=e();r&&o&&(i.classList.add("is-enhanced"),this.root=i,this.buttonNext=this.root.querySelector("[data-carousel-next]"),this.buttonPrevious=this.root.querySelector("[data-carousel-previous]"),this.buttonClose=this.root.querySelector("[data-carousel-close]"),this.list=this.root.querySelector("[data-carousel-list]"),this.items=[].slice.call(this.root.querySelectorAll(this.config.itemSelector)),this.anchors=[].slice.call(this.root.querySelectorAll(this.config.anchorSelector)),this.images=[].slice.call(this.root.querySelectorAll("[data-carousel-img]")),this.transitionEventName=e(),this.transformPropertyName=t(),this.firstImage=this.images[0],this.sizesAttribute=this.firstImage.sizes,this.itemWidth=null,this.itemTranslateX=null,this.touchStartX=null,this.resizeTimer=null,this.isFullscreen=!1,this.DIRECTION={LEFT:-1,INITIAL:0,RIGHT:1},this.getItemWidthAndTranslateZ=this.getItemWidthAndTranslateZ.bind(this),this.onAnchorClick=this.onAnchorClick.bind(this),this.animate=this.animate.bind(this),this.closeFullscreen=this.closeFullscreen.bind(this),this.onTouchStart=this.onTouchStart.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.onMouseDown=this.onMouseDown.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.onMouseMove=this.onMouseMove.bind(this),this.panItem=this.panItem.bind(this),window.addEventListener("resize",function(){clearTimeout(s.resizeTimer),s.resizeTimer=setTimeout(function(){this.getItemWidthAndTranslateZ()}.bind(s),100)}),this.root.addEventListener("click",function(t){var e=t.target.hasAttribute("data-carousel");s.isFullscreen&&e&&s.closeFullscreen()}),this.root.addEventListener("keydown",function(t){if(s.isFullscreen)switch(t.which){case 27:s.closeFullscreen();break;case 37:s.animate(s.DIRECTION.RIGHT);break;case 39:s.animate(s.DIRECTION.LEFT);break;case 9:s.focusElement(t)}}),this.items.forEach(function(t){t.addEventListener("touchstart",s.onTouchStart),t.addEventListener("touchend",s.onTouchEnd),t.addEventListener("touchmove",s.onTouchMove,{passive:!0}),t.addEventListener("mousedown",s.onMouseDown(t)),t.addEventListener("mouseup",s.onMouseUp(t))}),this.anchors.forEach(function(t){t.addEventListener("click",s.onAnchorClick)}),this.firstImage.addEventListener("load",this.getItemWidthAndTranslateZ),this.buttonNext.addEventListener("click",function(){return s.animate(s.DIRECTION.LEFT)}),this.buttonPrevious.addEventListener("click",function(){return s.animate(s.DIRECTION.RIGHT)}),this.buttonClose.addEventListener("click",this.closeFullscreen),n.addEventListener("fullscreenchange",function(){null===n.fullscreenElement&&s.closeFullscreen()},!1))};i.prototype.getItemWidthAndTranslateZ=function(){this.itemWidth=this.items[0].offsetWidth;var t=window.getComputedStyle(this.items[0],null).getPropertyValue("transform").replace(/[^0-9\-.,]/g,"").split(",");this.itemTranslateX=parseInt(t[12])||parseInt(t[4])},i.prototype.onAnchorClick=function(t){t.preventDefault(),0===t.detail&&!this.isFullscreen&&this.openFullscreen()},i.prototype.onTouchStart=function(t){t.preventDefault(),this.touchStartX=t.targetTouches[0].clientX},i.prototype.onTouchEnd=function(){this.handlePointerUp(event.changedTouches[0].clientX)},i.prototype.handlePointerUp=function(t){var e=this;this.items.forEach(function(t){return t.style[e.transformPropertyName]=""});var n=this.itemWidth/5,i=t-this.touchStartX;Math.abs(i)<10?this.isFullscreen?this.animate(this.DIRECTION.LEFT):this.openFullscreen():i<0&&Math.abs(i)>n?this.animate(this.DIRECTION.LEFT):i>n?this.animate(this.DIRECTION.RIGHT):this.animate(this.DIRECTION.INITIAL),this.touchStartX=null},i.prototype.onTouchMove=function(t){if(this.touchStartX){var e=t.changedTouches[0].clientX;this.panItem(e)}},i.prototype.panItem=function(t){var e=this,n=t-this.touchStartX,i=this.itemTranslateX+n,s=Math.max(Math.min(this.itemTranslateX+this.itemWidth,i),this.itemTranslateX-this.itemWidth);this.items.forEach(function(t){return t.style[e.transformPropertyName]="translateX("+s+"px)"})},i.prototype.onMouseDown=function(t){return function(e){e.preventDefault(),this.touchStartX=e.clientX,t.addEventListener("mousemove",this.onMouseMove,{passive:!0})}.bind(this)},i.prototype.onMouseUp=function(t){return function(e){this.handlePointerUp(e.clientX),t.removeEventListener("mousemove",this.onMouseMove)}.bind(this)},i.prototype.onMouseMove=function(t){var e=this,n=this.items.some(function(t){return e.isAnimating(t)});if(this.touchStartX&&!n){var i=t.clientX;this.panItem(i)}},i.prototype.animate=function(t){var e=this,n=[].slice.call(this.root.querySelectorAll(this.config.itemSelector));n.some(function(t){return e.isAnimating(t)})||n.forEach(function(n,i){n.addEventListener(e.transitionEventName,e.onAnimateEnded(n,i,t)),n.classList.add(e.getAnimationClass(t))})},i.prototype.isAnimating=function(t){return[this.config.animateLeftClass,this.config.animateRightClass,this.config.animateInitialClass].some(function(e){return t.classList.contains(e)})},i.prototype.getAnimationClass=function(t){return t===this.DIRECTION.LEFT?this.config.animateLeftClass:t===this.DIRECTION.RIGHT?this.config.animateRightClass:t===this.DIRECTION.INITIAL?this.config.animateInitialClass:null},i.prototype.onAnimateEnded=function(t,e,n){var i=function(){t.removeEventListener(this.transitionEventName,i);var s=0===e;n===this.DIRECTION.LEFT&&s&&(this.list.appendChild(t),this.updateTabindex());var r=e===this.items.length-1;n===this.DIRECTION.RIGHT&&r&&(this.list.insertBefore(t,this.list.firstElementChild),this.updateTabindex()),t.classList.remove(this.getAnimationClass(n))}.bind(this);return i},i.prototype.updateTabindex=function(){var t=this;[].slice.call(this.root.querySelectorAll(this.config.anchorSelector)).forEach(function(e,n){var i=Math.abs(t.itemTranslateX/t.itemWidth);t.isFullscreen?e.setAttribute("tabindex",-1):n===i?e.setAttribute("tabindex",0):e.setAttribute("tabindex",-1)})},i.prototype.focusElement=function(t){var e=document.activeElement===this.buttonClose,n=document.activeElement===this.buttonNext;t.shiftKey&&e?(t.preventDefault(),this.buttonNext.focus()):!t.shiftKey&&n&&(t.preventDefault(),this.buttonClose.focus())},i.prototype.openFullscreen=function(){var t=this;this.isFullscreen=!0,this.images.forEach(function(e){return t.swapFallbackImage(e)}),this.root.classList.add(this.config.fullscreenClass),document.body.classList.add(this.config.scrollDisabledClass),this.images.forEach(function(t){return t.sizes="100vw"}),this.getItemWidthAndTranslateZ(),this.anchors.forEach(function(t){return t.setAttribute("tabindex",-1)}),this.buttonClose.focus(),n.fullscreenEnabled&&n.requestFullscreen(this.root)},i.prototype.closeFullscreen=function(){var t=this;this.isFullscreen=!1,n.fullscreenEnabled&&null!==n.fullscreenElement&&n.exitFullscreen(),this.images.forEach(function(e){return t.swapFallbackImage(e)}),this.root.classList.remove(this.config.fullscreenClass),document.body.classList.remove(this.config.scrollDisabledClass),this.images.forEach(function(e){return e.sizes=t.sizesAttribute}),this.getItemWidthAndTranslateZ(),this.updateTabindex();var e=this.anchors.filter(function(t){return"0"===t.getAttribute("tabindex")});e&&e.length>0&&e[0].focus()},i.prototype.swapFallbackImage=function(t){var e=t.getAttribute(this.config.originalSrcAttribute);if(e)t.src=e,t.removeAttribute(this.config.originalSrcAttribute);else{var n=t.getAttribute("srcset").split(",").map(function(t){var e=t.trim().split(" ");return{url:e[0],width:parseInt(e[1].replace("w",""))}}).reduce(function(t,e){return e.width>t.width?e:t},{url:t.src,width:t.naturalWidth});t.setAttribute(this.config.originalSrcAttribute,t.src),t.src=n.url}};var s=function(t){return!!t&&new i(t)};({enhance:function(){return s(document.querySelector("[data-carousel]"))}}).enhance()}();
