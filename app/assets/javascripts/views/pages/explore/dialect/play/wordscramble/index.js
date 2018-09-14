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
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Immutable, {List, Map} from 'immutable';

import Button from '@material-ui/core/Button';
import TextField from 'material-ui/TextField';
import * as Colors from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from '@material-ui/core/IconButton';
import AVPlayArrow from '@material-ui/icons/PlayArrow';
import AVStop from '@material-ui/icons/Stop';

import classNames from 'classnames';

import ConfGlobal from 'conf/local.json';

import PromiseWrapper from 'views/components/Document/PromiseWrapper';

import ProviderHelpers from 'common/ProviderHelpers';
import StringHelpers from 'common/StringHelpers';
import UIHelpers from 'common/UIHelpers';

import provide from 'react-redux-provide';
import selectn from 'selectn';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
const containerStyle = {
    background: 'url(/assets/games/wordscramble/assets/images/background.png)',
    backgroundSize: 'cover',
    minHeight: '600px',
    padding: '40px 0',
    margin: '0 -15px'
}

const titleStyle = {
    textAlign: 'center',
    color: '#FFF',
    margin: '30px 0',
    textShadow: '1px 1px 1px #000'
}

const titleLogoStyle = {
    display: 'block',
    overflow: 'hidden',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '87px',
    background: 'transparent url(/assets/games/wordscramble/assets/images/word_scramble_title.png) 0 0 no-repeat',
    textIndent: '-9000px',
    backgroundSize: 'contain',
    backgroundPosition: 'center center',
    margin: 'auto'
}

/**
 * Play games
 */
@provide
export default class Wordscramble extends Component {

    static propTypes = {
        fetchPhrases: PropTypes.func.isRequired,
        computePhrases: PropTypes.object.isRequired,
        routeParams: PropTypes.object.isRequired
    }

    /**
     * Constructor
     */
    constructor(props, context) {
        super(props, context);
    }

    /**
     * componentDidMount
     */
    componentDidMount() {
        // Fetch fetch data
        this.fetchData(this.props);
    }

    fetchData(props, pageIndex, pageSize, sortOrder, sortBy) {
        props.fetchPhrases(props.routeParams.dialect_path + '/Dictionary',
            ' AND ' + ProviderHelpers.switchWorkspaceSectionKeys('fv:related_pictures', this.props.routeParams.area) + '/* IS NOT NULL' +
            ' AND ' + ProviderHelpers.switchWorkspaceSectionKeys('fv:related_audio', this.props.routeParams.area) + '/* IS NOT NULL' +
            //' AND fv-word:available_in_games = 1' +
            '&currentPageIndex=' + StringHelpers.randomIntBetween(0, 10) +
            '&pageSize=5' +
            '&sortBy=dc:created' +
            '&sortOrder=DESC'
        );
    }

    /**
     * Render
     */
    render() {

        const computeEntities = Immutable.fromJS([{
            'id': this.props.routeParams.dialect_path + '/Dictionary',
            'entity': this.props.computePhrases
        }])

        const computePhrases = ProviderHelpers.getEntry(this.props.computePhrases, this.props.routeParams.dialect_path + '/Dictionary');

        return <PromiseWrapper renderOnError={true} computeEntities={computeEntities} className="wordscramble-game"
                               style={containerStyle}>
            <h1 style={{...titleStyle, ...titleLogoStyle}}>Word Scramble</h1>
            {(selectn('response.entries', computePhrases) || []).filter((phrase) => selectn('properties.dc:title', phrase).indexOf(' ') > 0).map(function (phrase, i) {
                return <Scramble key={i} sentence={{
                    original: new List(selectn('properties.dc:title', phrase).split(' ')),
                    translation: selectn('properties.fv:definitions[0].translation', phrase),
                    audio: selectn('contextParameters.phrase.related_audio[0].path', phrase),
                    picture: selectn('contextParameters.phrase.related_pictures[0]', phrase)
                }}/>
            })}
        </PromiseWrapper>;
    }

}


/**
 * Word Scramble
 */
export class Scramble extends Component {

    /**
     * Constructor
     */
    constructor(props) {
        super(props)
        this.state = this.getDefaultState();
    }

    /**
     * Get default state (allows for reset)
     */
    getDefaultState() {
        const scrambledSentence = this.props.sentence.original.sortBy(() => Math.random());

        return {
            scrambledSentence: scrambledSentence,
            selected: [],
            complete: false,
            incorrect: false,
            nowPlaying: null
        }
    }

    /**
     * Reset Scrambled word
     */
    reset() {
        this.setState(this.getDefaultState())
    }

    /**
     * Select a word
     */
    selectWord(word) {
        const selectedWords = [...this.state.selected, word];
        this.setState({selected: selectedWords, incorrect: false});
    }

    /**
     * Unselect a word
     */
    unSelectWord(word, index) {
        const selectedWords = [...this.state.selected];
        selectedWords.splice(index, 1);
        this.setState({selected: selectedWords});
    }

    /**
     * Check if answer is correct
     */
    checkAnswer() {
        if (this.state.selected.join(' ') === this.props.sentence.original.toJS().join(' ')) {
            this.setState({complete: true})
        }
        else {
            this.setState({incorrect: true})
        }
    }

    render() {

        let audioIcon, audioCallback = null;

        let audio = this.props.sentence.audio;

        const containerStyles = {
            padding: '10px',
            display: 'block',
            border: '7px solid #040000',
            background: '#fafafa',
            marginBottom: '20px',
            position: 'relative',
            maxWidth: '700px',
            margin: 'auto'
        }


        if (audio) {

            const stateFunc = function (state) {
                this.setState(state);
            }.bind(this);

            audioIcon = (decodeURIComponent(selectn('src', this.state.nowPlaying)) !== ConfGlobal.baseURL + audio) ?
                <AVPlayArrow style={{marginRight: '10px'}}/> : <AVStop style={{marginRight: '10px'}}/>;

            audioCallback = (decodeURIComponent(selectn('src', this.state.nowPlaying)) !== ConfGlobal.baseURL + audio) ? UIHelpers.playAudio.bind(this, this.state, stateFunc, ConfGlobal.baseURL + audio) : UIHelpers.stopAudio.bind(this, this.state, stateFunc);
        }

        return <div style={{marginTop: '15px'}}>
            <div className="scrambled-sentence" style={containerStyles}>
                <div style={{
                    fontSize: '1.4em',
                    padding: '5px',
                    lineHeight: '244%',
                    fontStyle: 'italic',
                    color: '#3f8b53'
                }}><img style={{marginRight: '10px'}}
                        src={UIHelpers.getThumbnail(this.props.sentence.picture, 'Thumbnail')}/> {this.props.sentence.translation} {(this.state.complete) ?
                    <IconButton onClick={audioCallback}>{audioIcon}</IconButton> : ''}</div>
                <div style={{minHeight: '50px', borderBottom: '1px solid #CCC', marginBottom: '16px'}}>
                    {this.state.selected.map((word, index) => {
                        return <Button variant='raised' key={index} style={{backgroundColor: '#a7fba5'}}
                                             onMouseUp={this.unSelectWord.bind(this, word, index)}>
                                    {word}
                                </Button>
                    })}
                    {this.state.complete ? <FontIcon className="material-icons" style={{
                        color: Colors.greenA200,
                        fontSize: '50px',
                        position: 'absolute',
                        top: '5px',
                        right: '5px'
                    }}>check_box</FontIcon> : false}
                    {this.state.incorrect ? <FontIcon className="material-icons" style={{
                        color: Colors.red600,
                        fontSize: '50px',
                        position: 'absolute',
                        top: '5px',
                        right: '5px'
                    }}>indeterminate_check_box</FontIcon> : false}
                </div>
                {this.state.scrambledSentence.map((word, index) => {
                    let disabled = false;

                    if (this.state.selected.includes(word)) {
                        disabled = true;
                    }
                    return <Button variant='raised' disabled={disabled} key={index}
                                         onMouseUp={this.selectWord.bind(this, word)}>{word}</Button>
                })}
                {this.state.complete ? <Button variant='raised' color="primary"
                                                     onMouseUp={this.reset.bind(this)}>{intl.trans('reset', 'Reset', 'first')}</Button> : false}
                <Button variant='raised'
                              className={classNames({'invisible': this.state.complete})} style={{margin: '0 5px'}}
                              disabled={this.state.complete ? true : false} color="secondary"
                              onMouseUp={this.checkAnswer.bind(this)}>{intl.trans('check', 'Check', 'first')}</Button>
                {this.state.complete ? false :
                    <Button variant='raised' color="primary"
                                  onMouseUp={this.reset.bind(this)}>{intl.trans('reset', 'Reset', 'first')}</Button>}
            </div>
        </div>
    }


}
