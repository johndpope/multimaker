import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Game from './game';

import './styles/index.scss';

const game = new Game(
  '/assets/projects/antispace',
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
