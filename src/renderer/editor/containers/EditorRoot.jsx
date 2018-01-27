import * as React from 'react';

export default class EditorRoot extends React.Component {

  render() {
    return <div className="editor-root">
      <div className="panel toolbar">
        <button class="btn"><img src="../assets/editor/pencil.svg" /></button>
      </div>
    </div>;
  }
}