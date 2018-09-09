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
import Immutable, {List, Map} from 'immutable';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import ConfGlobal from 'conf/local.json';

import ProviderHelpers from 'common/ProviderHelpers';
import StringHelpers from 'common/StringHelpers';
import NavigationHelpers from 'common/NavigationHelpers';

import Preview from 'views/components/Editor/Preview';
import PromiseWrapper from 'views/components/Document/PromiseWrapper';
import MetadataPanel from 'views/pages/explore/dialect/learn/base/metadata-panel';
import MediaPanel from 'views/pages/explore/dialect/learn/base/media-panel';
import PageToolbar from 'views/pages/explore/dialect/page-toolbar';
import SubViewTranslation from 'views/pages/explore/dialect/learn/base/subview-translation';
import TextHeader from 'views/components/Document/Typography/text-header';

import {Link} from 'provide-page';

import Divider from '@material-ui/core/Divider';

import ListUI from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';

import FontIcon from 'material-ui/FontIcon';
import Button from '@material-ui/core/Button';

import Tab from 'material-ui/Tabs/Tab';

import '!style-loader!css-loader!react-image-gallery/build/image-gallery.css';

import withActions from 'views/hoc/view/with-actions';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
const DetailsViewWithActions = withActions(PromiseWrapper, true);

/**
 * View word entry
 */
@provide
export default class View extends Component {

    static propTypes = {
        properties: PropTypes.object.isRequired,
        windowPath: PropTypes.string.isRequired,
        splitWindowPath: PropTypes.array.isRequired,
        pushWindowPath: PropTypes.func.isRequired,
        changeTitleParams: PropTypes.func.isRequired,
        overrideBreadcrumbs: PropTypes.func.isRequired,
        computeLogin: PropTypes.object.isRequired,
        fetchDialect2: PropTypes.func.isRequired,
        computeDialect2: PropTypes.object.isRequired,
        fetchWord: PropTypes.func.isRequired,
        computeWord: PropTypes.object.isRequired,
        deleteWord: PropTypes.func.isRequired,
        computeDeleteWord: PropTypes.object.isRequired,
        publishWord: PropTypes.func.isRequired,
        askToPublishWord: PropTypes.func.isRequired,
        unpublishWord: PropTypes.func.isRequired,
        askToUnpublishWord: PropTypes.func.isRequired,
        enableWord: PropTypes.func.isRequired,
        askToEnableWord: PropTypes.func.isRequired,
        disableWord: PropTypes.func.isRequired,
        askToDisableWord: PropTypes.func.isRequired,
        routeParams: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);

        ['_onNavigateRequest'].forEach((method => this[method] = this[method].bind(this)));
    }

    fetchData(newProps) {
        newProps.fetchWord(this._getWordPath(newProps));
        newProps.fetchDialect2(newProps.routeParams.dialect_path);
    }

    // Refetch data on URL change
    componentWillReceiveProps(nextProps) {

        if (nextProps.routeParams.dialect_path !== this.props.routeParams.dialect_path) {
            this.fetchData(nextProps);
        }
        else if (nextProps.routeParams.word !== this.props.routeParams.word) {
            this.fetchData(nextProps);
        }
        // else if (nextProps.computeLogin.success !== this.props.computeLogin.success) {
        //     this.fetchData(nextProps);
        // }
    }

    // Fetch data on initial render
    componentDidMount() {
        this.fetchData(this.props);
    }

    componentDidUpdate(prevProps, prevState) {
        let word = selectn('response', ProviderHelpers.getEntry(this.props.computeWord, this._getWordPath()));
        let title = selectn('properties.dc:title', word);
        let uid = selectn('uid', word);

        if (title && selectn('pageTitleParams.word', this.props.properties) != title) {
            this.props.changeTitleParams({'word': title});
            this.props.overrideBreadcrumbs({find: uid, replace: 'pageTitleParams.word'});
        }
    }

    _getWordPath(props = null) {

        if (props == null) {
            props = this.props;
        }

        if (StringHelpers.isUUID(props.routeParams.word)){
            return props.routeParams.word;
        } else {
            return props.routeParams.dialect_path + '/Dictionary/' + StringHelpers.clean(props.routeParams.word);
        }
    }

    _onNavigateRequest(path) {
        this.props.pushWindowPath(path);
    }

    render() {

        const tabItemStyles = {
            userSelect: 'none'
        }

        const computeEntities = Immutable.fromJS([{
            'id': this._getWordPath(),
            'entity': this.props.computeWord
        }, {
            'id': this.props.routeParams.dialect_path,
            'entity': this.props.computeDialect2
        }])

        const computeWord = ProviderHelpers.getEntry(this.props.computeWord, this._getWordPath());
        const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

        // Photos
        let photos = [];
        let photosThumbnails = [];

        (selectn('response.contextParameters.word.related_pictures', computeWord) || []).map(function (picture, key) {
            let image = {
                original: selectn('views[2].url', picture),
                thumbnail: (selectn('views[0].url', picture) || '/assets/images/cover.png'),
                description: picture['dc:description'],
                key: key,
                id: picture.uid,
                object: picture
            };
            photos.push(image);
            photosThumbnails.push(<img key={picture.uid}
                                       src={(selectn('views[0].url', picture) || '/assets/images/cover.png')}
                                       alt={selectn('title', picture)} style={{margin: '15px', maxWidth: '150px'}}/>);
        })

        // Videos
        let videos = [];
        let videoThumbnails = [];

        (selectn('response.contextParameters.word.related_videos', computeWord) || []).map(function (video, key) {
            let vid = {
                original: ConfGlobal.baseURL + video.path,
                thumbnail: (selectn('views[0].url', video) || '/assets/images/cover.png'),
                description: video['dc:description'],
                key: key,
                id: video.uid,
                object: video
            };
            videos.push(vid);
            videoThumbnails.push(<video key={video.uid} src={ConfGlobal.baseURL + video.path} controls
                                        style={{margin: '15px', maxWidth: '150px'}}/>);
        })

        // Audio
        let audios = [];

        (selectn('response.contextParameters.word.related_audio', computeWord) || []).map(function (audio, key) {
            audios.push(<Preview styles={{
                maxWidth: '350px',
                padding: '0 10px 0 10px',
                borderLeft: '1px solid #efefef',
                marginBottom: '25px'
            }} key={selectn('uid', audio)} expandedValue={audio} type="FVAudio"/>);
        })

        // Phrases
        let phrases = [];
        let theme = this.props.routeParams.theme;

        (selectn('response.contextParameters.word.related_phrases', computeWord) || []).map(function (phrase, key) {

            const phraseDefinitions = selectn('fv:definitions', phrase);
            const phraseLink = <Link key={selectn('uid', phrase)}
                                     href={NavigationHelpers.generateUIDPath(theme, phrase, 'phrases')}>{selectn('dc:title', phrase)}</Link>;

            if (phraseDefinitions.length == 0) {
                phrases.push(<p key={key}>{phraseLink}</p>);
            } else {
                phrases.push(<p key={key}>{phraseLink} <ul>{phraseDefinitions.map(function (groupValue, key) {
                    return (<li>{groupValue['translation']} ({groupValue['language']})</li>);
                })}</ul></p>);
            }
        })

        let tabs = [];

        if (photos.length > 0) {
            tabs.push(<Tab key="pictures" label={intl.trans('pictures', 'Pictures', 'first')}>
                <div style={{maxHeight: '400px'}}>
                    {photosThumbnails}
                </div>
            </Tab>);
        }

        if (videos.length > 0) {
            tabs.push(<Tab key="videos" label={intl.trans('videos', 'Videos', 'first')}>
                <div>
                    {videoThumbnails}
                </div>
            </Tab>);
        }

        if (audios.length > 0) {
            tabs.push(<Tab key="audio" label={intl.trans('audio', 'Audio', 'first')}>
                <div>
                    {audios}
                </div>
            </Tab>);
        }

        if (phrases.length > 0) {
            tabs.push(<Tab key="phrases" label={intl.trans('phrases', 'Phrases', 'first')}>
                <div>
                    {phrases}
                </div>
            </Tab>);
        }

        // Categories
        let categories = [];

        {
            (selectn('response.contextParameters.word.categories', computeWord) || []).map(function (category, key) {
                categories.push(<span key={key}>{selectn('dc:title', category)}</span>);
            })
        }
        ;

        // Cultural notes
        let cultural_notes = [];

        {
            (selectn('response.properties.fv:cultural_note', computeWord) || []).map(function (cultural_note, key) {
                cultural_notes.push(<div key={key}>{intl.searchAndReplace(cultural_note)}</div>);
            })
        }
        ;


        let definitions = selectn('response.properties.fv:definitions', computeWord);
        let literal_translations = selectn('response.properties.fv:literal_translation', computeWord);

        /**
         * Generate definitions body
         */
        return <DetailsViewWithActions
            labels={{single: "word"}}
            itemPath={this._getWordPath()}
            actions={['workflow', 'edit', 'publish-toggle', 'enable-toggle', 'publish']}
            publishAction={this.props.publishWord}
            unpublishAction={this.props.unpublishWord}
            askToPublishAction={this.props.askToPublishWord}
            askToUnpublishAction={this.props.askToUnpublishWord}
            enableAction={this.props.enableWord}
            askToEnableAction={this.props.askToEnableWord}
            disableAction={this.props.disableWord}
            askToDisableAction={this.props.askToDisableWord}
            deleteAction={this.props.deleteWord}
            onNavigateRequest={this._onNavigateRequest}
            computeItem={computeWord}
            permissionEntry={computeDialect2}
            tabs={tabs} computeEntities={computeEntities} {...this.props}>

            <div className="row" style={{marginTop: '15px'}}>
                <div className={classNames('col-xs-12', 'col-md-7')}>

                    <div>

                        <TextHeader title={selectn('response.title', computeWord)} tag="h1"
                                    properties={this.props.properties}/>

                        <hr/>

                        <p>
                            <strong>{intl.trans('part_of_speech', 'Part of Speech')}</strong>: {selectn('response.contextParameters.word.part_of_speech', computeWord)}

                            {(() => {
                                if (categories.length > 0) {
                                    return <span> &nbsp;|&nbsp;
                                        <strong>{intl.trans('categories', 'Categories', 'first')}</strong>: {categories}</span>;
                                }
                            })()}

                        </p>

                        <hr/>

                        {(() => {
                            let pronunciation = selectn('response.properties.fv-word:pronunciation', computeWord);
                            if (pronunciation && pronunciation != '') {
                                return <p>
                                    <strong>{intl.trans('pronunciation', 'Pronunciation', 'first')}</strong>: {pronunciation}
                                </p>;
                            }
                        })()}

                        {(definitions && definitions.length > 0) ? <hr/> : null}

                        <SubViewTranslation group={definitions} groupByElement="language" groupValue="translation">
                            <p><strong>Definitions:</strong></p>
                        </SubViewTranslation>

                        {(literal_translations && literal_translations.length > 0) ? <hr/> : null}

                        <SubViewTranslation group={literal_translations} groupByElement="language"
                                            groupValue="translation">
                            <p>
                                <strong>{intl.trans('views.pages.explore.dialect.learn.words.literal_translations', 'Literal Translations', 'words')}:</strong>
                            </p>
                        </SubViewTranslation>

                        {(() => {
                            if (phrases.length > 0) {
                                return <div>
                                    <hr/>
                                    <p><strong>{intl.trans('related_phrases', 'Related Phrases', 'words')}:</strong></p>
                                    {phrases}
                                </div>;
                            }
                        })()}

                        {(() => {
                            if (cultural_notes.length > 0) {
                                return <div style={{margin: '10px 0'}}>
                                    <hr/>
                                    <p>
                                        <strong>{intl.trans('views.pages.explore.dialect.learn.words.cultural_notes', 'Cultural Notes', 'words')}:</strong>
                                    </p>
                                    {cultural_notes}
                                </div>;
                            }
                        })()}

                        <hr/>

                        {(selectn('response', computeWord)) ?
                            <MetadataPanel properties={this.props.properties}
                                           computeEntity={computeWord}/> : ''}

                    </div>

                </div>

                <div className={classNames('col-xs-12', 'col-md-3')}>

                    <h3>{intl.trans('audio', 'AUDIO', 'upper')}</h3>
                    <div>{(audios.length === 0) ?
                        <span>{intl.trans('views.pages.explore.dialect.learn.words.no_audio_yet', 'No audio is available yet')}.</span> : audios}</div>

                    <MediaPanel label={intl.trans('photo_s', 'PHOTO(S)', 'upper')} type="FVPicture" items={photos}/>
                    <MediaPanel label={intl.trans('video_s', 'VIDEO(S)', 'upper')} type="FVVideo" items={videos}/>

                </div>

            </div>
        </DetailsViewWithActions>;
    }
}