import * as React from 'react';

export default class EditorRoot extends React.Component {

  render() {
    return <div className="root root-editor">
      <div className="panel toolbar">
        <button className="btn btn-select"></button>
        <button className="btn btn-draw"></button>
        <button className="btn btn-erase"></button>
        <button className="btn btn-pick"></button>
        <button className="btn btn-props"></button>
        <button className="btn btn-5"></button>
      </div>
    </div>;
  }
}