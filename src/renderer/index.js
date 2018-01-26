import './style.css';
// FIXME: These should available already
window.WEBGL_RENDERER = true;
window.CANVAS_RENDERER = true;
// FIXME: MUST be imported this way so the fix above will work
require('./game');
