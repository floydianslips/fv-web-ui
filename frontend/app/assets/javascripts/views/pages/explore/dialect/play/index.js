/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import IntlService from 'views/services/intl';
import provide from 'react-redux-provide';
import NavigationHelpers from 'common/NavigationHelpers';

const intl = IntlService.instance;

/**
 * Play games
 */
@provide
export default class Play extends Component {

    static propTypes = {
        routeParams: PropTypes.object,
        splitWindowPath: PropTypes.array.isRequired,
        pushWindowPath: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
    }

    navigate = (event) => {
        event.preventDefault();
        const anchorPath = (event.currentTarget.getAttribute("href"));
        const { splitWindowPath, pushWindowPath } = this.props;
        NavigationHelpers.navigateForward(splitWindowPath, [anchorPath], pushWindowPath);
    }

    render() {

        const isKidsTheme = this.props.routeParams.theme === 'kids';

        const cellStyle = {
            border: '1px solid #000'
        }
        return <div>
            <div className="row">
                <div className="col-xs-12">
                    <h1 className={classNames({ 'hidden': isKidsTheme })}>{intl.trans('games', 'Games', 'first')}</h1>
                    <div className="flex-container">
                        <div className="grid">
                            <div className="cell" style={cellStyle}>
                                <a href="jigsaw" onClick={this.navigate}>
                                    <img src="/assets/games/jigsawassets/images/preview.png"
                                        className="responsive-image" /></a>
                            </div>
                            {/* <div className="cell" style={cellStyle}>
                                <a href="colouringbook" onClick={this.navigate}><img
                                    src="/assets/games/colouring-bookassets/images/preview.png"
                                    className="responsive-image" /></a>
                            </div> */}
                            <div className="cell" style={cellStyle}>
                                <a href="wordsearch" onClick={this.navigate}><img
                                    src="/assets/games/wordsearchassets/images/preview.png"
                                    className="responsive-image" /></a>
                            </div>
                            <div className="cell" style={cellStyle}>
                                <a href="wordscramble" onClick={this.navigate}><img src="assets/images/preview-wordscramble.png"
                                    className="responsive-image" /></a>
                            </div>
                            {/* <div className="cell" style={cellStyle}>
                                <a href="picturethis" onClick={this.navigate}><img
                                    src="/assets/games/picturethisassets/images/preview.png"
                                    className="responsive-image"/></a>
                            </div> */}
                            <div className="cell" style={cellStyle}>
                                <a href="hangman" onClick={this.navigate} ><img src="/assets/games/hangmanassets/images/preview.png"
                                    className="responsive-image" /></a>
                            </div>
                            <div className="cell" style={cellStyle}>
                                <a href="concentration" onClick={this.navigate}><img src="/assets/games/memoryassets/images/preview.png"
                                    className="responsive-image" /></a>
                            </div>
                            <div className="cell" style={cellStyle}>
                                <a href="quiz" onClick={this.navigate}><img src="assets/images/preview-quiz.png"
                                    className="responsive-image" /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}