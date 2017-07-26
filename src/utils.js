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

export {getTransitionEndEventName, getTransformPropertyName};
