# Progressive Carousel

A mobile friendly and progressive enhanced image carousel

[Demo](http://www.reinout.com/progressive-carousel)

![Screenshot](/screenshot.jpg?raw=true)

## Features

* Responsive and mobile-friendly
* Fullscreen mode
* Touch gestures and mouse dragging
* Accessible with keyboard and screen reader
* Clean and semantic HTML
* Works with images of any size
* Hardware accelerated animations (using CSS transform)
* Lightweight (x kb minified)
* No JQuery dependency
* Browser support
  * Browsers supporting [classList](http://caniuse.com/#search=classList) and [CSS transforms](http://caniuse.com/#search=css%20transition): basically *IE10+* and all modern browsers.
  * On older browsers (and while JavaScript is loading), the browser will render an ordinary grid of images. Clicking an image will open the high resolution image.

## About

Progressive Carousel has a **consistent user experience** across different screen sizes, and on portrait/landscape orientation. There is no predefined amount of images for each breakpoint. 

On smaller screens, a tiny bit of the next and previous image is visible. This gives the user a hint that he can swipe the images left and right. 

On larger screens, more images are visible in the image strip. Although the carousel can be nested in a single column layout, it is recommended to show the images on full width of the page, maximizing available screen space.

The next/previous buttons and the first image in the strip are focusable with the keyboard (`TAB` key). Opening the first image with the keyboard will toggle fullscreen mode. While in fullscreen mode, users can press `ESC` to exit and the arrow keys (`← →`) to cycle through the images.

The carousel uses the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API). For [browsers not supporting the Fullscreen API](http://caniuse.com/#search=fullscreen), the carousel will be shown in 100% width/height of the browser window.
   
## Requirements

* A build system that can transpile ES6 and bundle modules. If you don't have this yet, I recommend the [rollup bundle and watch recipe](https://github.com/voorhoede/front-end-tooling-recipes/tree/master/rollup-bundle-and-watch) from [De Voorhoede](https://www.voorhoede.nl). 
* Minimum of 5 images 
* Images must have identical aspect ratio

## Installation

Get started by adding the following HTML to your page. 

* Data-attributes (e.g. `data-carousel`) are used by JavaScript to interact with the DOM. Keep them.
* Classes are only used for styling. Customize them as you like.

### HTML

```html
<div class="carousel" data-carousel>
    <button class="carousel-close" 
            data-carousel-close>Close</button>
    <button class="carousel-previous" 
            data-carousel-previous>Previous</button>
    <ul class="carousel-list" 
        data-carousel-list>
        <li class="carousel-item" data-carousel-item>
            <a class="carousel-anchor" 
               href="image-xl.jpg"
               data-carousel-anchor>
                <img class="carousel-img" 
                     src="image-m.jpg"
                     srcset="image-s.jpg 300w,
                             image-m 600w,
                             image-l.jpg 968w,
                             image-xl.jpg 1920w"
                     sizes="(min-width: 1170px) 968px, 85vw"
                     alt="Example image 1"
                     data-carousel-img>
            </a>
        </li>
        <!-- <li>'s for remaining images here -->
    </ul>
    <button class="carousel-next"
            data-carousel-next>Next</button>
</div>
```
Explanation:

* `<a>`
  * `href`: _url_ of high resolution image.
  
     This allows the user to navigate to the high resolution image when the carousel is not enhanced with JavaScript. When? While JavaScript is loading, on browsers not meeting the minimum criteria or when JavaScript is disabled. [Everyone has Javascript, right](https://kryogenix.org/code/browser/everyonehasjs.html)? 
* `<img>`
  *  `src`: _url_ of the fallback image for browsers [not supporting 'srcset'](http://caniuse.com/#search=srcset).
     * In fullscreen mode, the carousel will replace the `src` value with the url of the image with the highest resolution (as specified in `srcset`). This allows browsers not supporting `srcset` to still show high resultion images in fullscreen mode. 
  *  `srcset`: list of responsive images and their natural width, so that browsers can choose the appropriate image ([srcset and sizes explanation](https://jakearchibald.com/2015/anatomy-of-responsive-images/#varying-size-and-density)). 
      * The example lists 4 images, but any number works. The browser will choose to load an image based on resolution and device-pixel-ratio. Providing enough images can save the user precious time and bandwidth.
      * The example lists `300w`, `600w`, `968w` and `1920w` as natural widths, but the carousel accepts images with any natural width.     
  *  `sizes`: width of the image when the condition matches.
      * In the example we tell the browser to show each image at `85vw` width, except for breakpoints above `1170px`, in which case the browser should render the image at `968px` width. This means you don't have to configure the exact number of visible images per breakpoint.      
      * In fullscreen mode, the carousel will set the `sizes` attribute value to `100vw`, so that the browser can choose the appropriate fullscreen image. When fullscreen is closed, the sizes attribute is restored to the original value.

### CSS

You can find boilerplate CSS [here](./demo/index.css) to get you started. 

Typical things you may want to customize:

- the speed and type of animations
- next/previous/close button styles
- layout of the thumbnails when the carousel is not enhanced with JavaScript.

### JavaScript

> 
> * NPM module coming soon  (for now, find the JavaScript [here](https://github.com/reinoute/progressive-carousel/blob/master/src/carousel.js))
>

## Future

- Simplify markup with listbox aria-attributes (a la Bootstrap Carousel)?
- Lazy loading of images
- Loading indicator (in particular in fullscreen)

Not planned:

- Captions
- Breadcrumbs / circles / progress indicators

 



