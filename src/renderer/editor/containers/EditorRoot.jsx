import * as React from 'react';

export default class EditorRoot extends React.Component {

  render() {
    return <div className="root root-editor">
      <div className="panel toolbar">
        <button className="btn"><img src="../assets/editor/pencil.svg" /></button>
      </div>
    </div>;
  }
}