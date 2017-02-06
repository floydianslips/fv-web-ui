import React, {Component, PropTypes} from 'react';
import AlloyEditor from 'alloyeditor';

export default class AlloyEditorComponent extends Component {
    componentDidMount() {
        this._editor = AlloyEditor.editable(this.props.container, this.props.alloyEditorConfig);
        this._nativeEditor = this._editor.get('nativeEditor');

        var _this = this;

        this._nativeEditor.on('change', function () {
            _this.props.onContentChange(_this._nativeEditor.getData());
        });
    }

    componentWillUnmount() {
        this._editor.destroy();
    }

    shouldComponentUpdate(newProps) {
        if (newProps.content != this.props.content) {
            return false;
        }

        return true;
    }

    render() {
        return (
            <div id={this.props.container} dangerouslySetInnerHTML={{__html: this.props.content}} className="form-control" style={{minHeight: '100px', height: 'auto'}}></div>
        );
    }
}