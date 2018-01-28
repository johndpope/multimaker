const path = require('path');
const { argv } = require('electron').remote.process;
const React = require('react');
const ReactDOM = require('react-dom');
const { AppContainer } = require('react-hot-loader');

// FIXME: These should available already
window.WEBGL_RENDERER = true;
window.CANVAS_RENDERER = true;
// FIXME: MUST be imported this way so the fix above will work
const { default: Game } = require('./game');

const game = new Game(
  path.resolve(argv[2]),
  document.getElementById('game-root')
);

const render = () => {
  const { default: EditorRoot } = require('./editor/containers/EditorRoot');
  ReactDOM.render(
    <AppContainer><EditorRoot game={game} /></AppContainer>,
    document.getElementById('editor-root')
  );
}

render();
if (module.hot) {
  module.hot.accept(render);
}
