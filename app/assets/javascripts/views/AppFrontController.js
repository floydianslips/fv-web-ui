import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';

import provide from 'react-redux-provide';
import selectn from 'selectn';

import classNames from 'classnames';

import ConfGlobal from 'conf/local.json';

import ProviderHelpers from 'common/ProviderHelpers';
import UIHelpers from 'common/UIHelpers';
import StringHelpers from 'common/StringHelpers';

import {Link} from 'provide-page';

import FlatButton from 'material-ui/lib/flat-button';
import Navigation from 'views/components/Navigation';
import KidsNavigation from 'views/components/Kids/Navigation';
import Footer from 'views/components/Navigation/Footer';

import { PageIntro, PageHome, PageTest, PageKidsHome, PageContent, PageExploreDialects, PageExploreArchive, PageExploreFamily, PageExploreLanguage, PageExploreDialect } from 'views/pages';

import { PageDialectLearn, PageDialectMedia, PageDialectPlay, PageDialectGalleryView, PageDialectGalleries, PageDialectReports, PageDialectReportsView, PageDialectUsers, PageBulkImport } from 'views/pages';

import { PageDialectLearnWords, PageDialectLearnPhrases, PageDialectLearnStoriesAndSongs, PageDialectViewDictionaryItem } from 'views/pages';

import { PageDialectViewWord, PageDialectViewPhrase, PageDialectViewBook, PageDialectViewCharacter, PageDialectViewMedia } from 'views/pages';

import { PageDialectViewAlphabet } from 'views/pages';

import { PageJigsawGame, PageColouringBook, PageWordSearch, PagePictureThis, PageConcentration, PageWordscramble, PageQuiz, PageHangman} from 'views/pages';

import { PageGetStarted, PageContribute, PagePlay, PageSearch, PageTasks, PageUsersProfile, PageUsersRegister, PageUserLogin, PageUsersForgotPassword, PageDialectLearnWordsCategories, PageDialectLearnPhrasesCategories } from 'views/pages';

import { PageExploreDialectEdit, PageDialectWordEdit, PageDialectAlphabetCharacterEdit, PageDialectEditMedia, PageDialectGalleryEdit, PageDialectPhraseEdit, PageDialectBookEdit, PageDialectBookEntryEdit } from 'views/pages/edit';
import {
  PageDialectWordsCreate, PageDialectPhrasesCreate, PageDialectStoriesAndSongsCreate,
  PageDialectGalleryCreate, PageDialectCategoryCreate, PageDialectPhraseBooksCreate,
  PageDialectContributorsCreate, PageDialectStoriesAndSongsBookEntryCreate } from 'views/pages/create';

import { ServiceShortURL } from 'views/services';

/**
* Parameter matching class
*/
class paramMatch {
  constructor(id, matcher) {
    this.id = id;
    this.matcher = matcher;
  }
}

// Regex helper
const ANYTHING_BUT_SLASH = new RegExp(ProviderHelpers.regex.ANYTHING_BUT_SLASH);
const WORKSPACE_OR_SECTION = new RegExp(ProviderHelpers.regex.WORKSPACE_OR_SECTION);
const ANY_LANGUAGE_CODE = new RegExp(ProviderHelpers.regex.ANY_LANGUAGE_CODE);
const KIDS_OR_DEFAULT = new paramMatch('theme', RegExp(ProviderHelpers.regex.KIDS_OR_DEFAULT));

const REMOVE_FROM_BREADCRUMBS = ['FV', 'sections', 'Data', 'Workspaces', 'edit', 'search'];

const WORKSPACE_TO_SECTION_REDIRECT = {
  condition: function(params) { return (selectn("isConnected", params.props.computeLogin) === false && params.props.splitWindowPath[2] == 'Workspaces') },
  target: function(params) { return '/' + params.props.splitWindowPath.join('/').replace('Workspaces', 'sections'); }
};

const NOT_CONNECTED_REDIRECT = {
  condition: function(params) { return (selectn("isConnected", params.props.computeLogin) === false) },
  target: function(params) { return '/'; }
};

class Redirecter extends Component {
  constructor(props, context) {
    super (props, context);
  }

  componentDidMount() {
    this.props.redirect();
  }
  

  render() {
    return <div style={{backgroundColor: '#fff', height: '100vh'}}>Redirecting...</div>;
  }
}

@provide
export default class AppFrontController extends Component {
  static propTypes = {
    properties: PropTypes.object.isRequired,
    preferences: PropTypes.object,
    warnings: PropTypes.object.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    windowPath: PropTypes.string.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    replaceWindowPath: PropTypes.func.isRequired,
    computeLogin: PropTypes.object.isRequired,
    changeTheme: PropTypes.func.isRequired,
    loadGuide: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);

    this.state = this._getInitialState();

    // Bind methods to 'this'
    ['_matchPath', '_route', '_updateTitle'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  _getInitialState() {

    const routes = Immutable.fromJS([
      {
        path: [],
        alias: [ANY_LANGUAGE_CODE, 'home'],
        page: <PageHome />,
        title: 'Home',
        breadcrumbs: false,
        frontpage: true,
        redirects: [{
          // For any start page value other than a dialect, simple redirect to that start page
          condition: function(params) {
            return selectn('preferences.start_page', params.props) !== undefined && selectn('preferences.start_page', params.props) !== 'my_dialect' && selectn('preferences.start_page', params.props) !== 'my_kids_dialect';
          },
          target: function(params) {
            return UIHelpers.getPreferenceVal('start_page', params.props.preferences);
          }
        },{
          // Redirecting to a dialect (requires dialect_path to be provided)
          condition: function(params) {
            return selectn('preferences.primary_dialect_path', params.props) !== undefined;
          },
          target: function(params) {
            let start_page = selectn('preferences.start_page', params.props);
            let primary_dialect_path = selectn('preferences.primary_dialect_path', params.props);
            return '/' + (start_page == 'my_kids_dialect' ? 'kids' : 'explore') + selectn('preferences.primary_dialect_path', params.props);
          }
        }]
      },
      {
        path: ['content', new paramMatch('friendly_url', ANYTHING_BUT_SLASH)],
        page: <PageContent area="sections" />,
        title: '{$pageTitle} | Pages',
        breadcrumbs: false
      },
      {
        path: ['content-preview', new paramMatch('friendly_url', ANYTHING_BUT_SLASH)],
        page: <PageContent area="Workspaces" />,
        title: '{$pageTitle} | Pages',
        breadcrumbs: false
      },
      {
        path: ['test'],
        page: <PageTest />
      },
      {
        path: [new paramMatch('theme', new RegExp("kids"))],
        frontpage: true,
        title: 'Kids Home',
        page: <PageKidsHome />
      },
      {
        path: ['play'],
        title: 'Games',
        page: <PagePlay />
      },
      {
        path: ['tasks'],
        title: 'Tasks',
        page: <PageTasks />
      },
      {
        path: ['register'],
        title: 'Register',
        page: <PageUsersRegister />
      },
      {
        path: ['login'],
        title: 'User Login',
        page: <PageUserLogin />
      },
      {
        path: ['profile'],
        title: 'User Profile',
        page: <PageUsersProfile />,
        redirects: [NOT_CONNECTED_REDIRECT]
      },
      {
        path: ['forgotpassword'],
        title: 'Forgot Your Password',
        breadcrumbs: false,
        page: <PageUsersForgotPassword />
      },
      {
        path: [KIDS_OR_DEFAULT],
        page: <PageExploreArchive />,
        redirects: [{
          condition: function(params) { return true; },
          target: function(params) { return '/explore/FV/sections/Data/'; }
        }]
      },
      {
        path: [new paramMatch('area', WORKSPACE_OR_SECTION), new paramMatch('dialectFriendlyName', ANYTHING_BUT_SLASH)],
        title: 'Dialect Short Url',
        page: <ServiceShortURL />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data'],
        title: '{$theme} Dialects',
        page: <PageExploreDialects />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', 'search', new paramMatch('searchTerm', ANYTHING_BUT_SLASH)],
        title: '\'{$searchTerm}\' Search Results',
        page: <PageSearch />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'search', new paramMatch('searchTerm', ANYTHING_BUT_SLASH)],
        title: '\'{$searchTerm}\' Search Results | {$dialect_name} ',
        page: <PageSearch />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'register'],
        title: '{$dialect_name} Registration',
        page: <PageUsersRegister />,
        disableWorkspaceSectionNav: true,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', new paramMatch('language_family', ANYTHING_BUT_SLASH)],
        title: '{$language_family_name} Explore',
        page: <PageExploreFamily />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH ],
        title: '{$language_name} Explore',
        page: <PageExploreLanguage />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        id: 'page_explore_dialect',
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH ],
        title: '{$dialect_name} Home | {$theme}',
        page: <PageExploreDialect />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        warnings: ['multiple_dialects']
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'edit' ],
        title: 'Edit {$dialect_name}',
        page: <PageExploreDialectEdit />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn' ],
        title: 'Learn {$dialect_name}',
        page: <PageDialectLearn />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'media' ],
        title: 'Browse Media | {$dialect_name}',
        page: <PageDialectMedia />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'media', new paramMatch('media', ANYTHING_BUT_SLASH) ],
        title: '{$media} | Media | {$dialect_name}',
        page: <PageDialectViewMedia />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'media', new paramMatch('media', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$media} | Media | {$dialect_name}',
        page: <PageDialectEditMedia />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'alphabet'],
        title: 'Alphabet | {$dialect_name}',
        page: <PageDialectViewAlphabet />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'alphabet', 'print'],
        title: 'Print Alphabet | {$dialect_name}',
        page: <PageDialectViewAlphabet print={true} />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'alphabet', new paramMatch('character', ANYTHING_BUT_SLASH)],
        title: 'Character - {$character} | Alphabet | {$dialect_name}',
        page: <PageDialectViewCharacter />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'alphabet', new paramMatch('character', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$character} Character | Alphabet | {$dialect_name}',
        page: <PageDialectAlphabetCharacterEdit />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play' ],
        title: 'Games | {$dialect_name}',
        page: <PageDialectPlay />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'jigsaw' ],
        title: 'Jigsaw | Games | {$dialect_name}',
        page: <PageJigsawGame />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'wordsearch' ],
        title: 'Word Search | Games | {$dialect_name}',
        page: <PageWordSearch />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'colouringbook' ],
        title: 'Colouring Book | Games | {$dialect_name}',
        page: <PageColouringBook />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'concentration' ],
        title: 'Memory Game | Games | {$dialect_name}',
        page: <PageConcentration />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'picturethis' ],
        title: 'Picture This | Games | {$dialect_name}',
        page: <PagePictureThis />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'hangman' ],
        title: 'Hangman | Games | {$dialect_name}',
        page: <PageHangman />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'wordscramble' ],
        title: 'Word Scramble | Games | {$dialect_name}',
        page: <PageWordscramble />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'play', 'quiz' ],
        title: 'Quiz | Games | {$dialect_name}',
        page: <PageQuiz />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'gallery' ],
        title: 'Galleries | {$dialect_name}',
        page: <PageDialectGalleries />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'gallery', 'create' ],
        title: 'Create Gallery | Galleries | {$dialect_name}',
        page: <PageDialectGalleryCreate />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'gallery', new paramMatch('galleryName', ANYTHING_BUT_SLASH) ],
        title: '{$galleryName} | Galleries | {$dialect_name}',
        page: <PageDialectGalleryView />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'gallery', new paramMatch('gallery', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$gallery} | Galleries | {$dialect_name}',
        page: <PageDialectGalleryEdit />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'reports' ],
        title: 'Reports | {$dialect_name}',
        page: <PageDialectReports />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'reports', new paramMatch('reportName', ANYTHING_BUT_SLASH) ],
        title: '{$reportName} | Reports | {$dialect_name}',
        page: <PageDialectReportsView />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'users' ],
        title: 'Users | {$dialect_name}',
        page: <PageDialectUsers />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'bulk-import' ],
        title: 'Bulk Import | {$dialect_name}',
        page: <PageBulkImport />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'words' ],
        title: 'Words | {$dialect_name}',
        page: <PageDialectLearnWords />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'words', 'categories' ],
        title: 'Categories | Words | {$dialect_name} | {$theme}',
        page: <PageDialectLearnWordsCategories />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'words', 'categories', new paramMatch('category', ANYTHING_BUT_SLASH) ],
        title: 'Category View | Words | {$dialect_name} | {$theme}',
        page: <PageDialectLearnWords />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'words', 'create' ],
        title: 'Create | Words | {$dialect_name}',
        page: <PageDialectWordsCreate />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'words', new paramMatch('word', ANYTHING_BUT_SLASH) ],
        title: '{$word} | Words | {$dialect_name}',
        page: <PageDialectViewWord />,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT],
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'words', new paramMatch('word', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$word} Word | Words | {$dialect_name}',
        page: <PageDialectWordEdit />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrases' ],
        title: 'Phrases | {$dialect_name}',
        page: <PageDialectLearnPhrases />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrases', 'categories' ],
        title: 'Phrase Categories | {$dialect_name} | {$theme}',
        page: <PageDialectLearnPhrasesCategories />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrases', 'categories', new paramMatch('category', ANYTHING_BUT_SLASH) ],
        title: '{$category} | Categories | Phrases | {$dialect_name}',
        page: <PageDialectLearnPhrases />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrases', 'create' ],
        title: 'Create | Phrases | {$dialect_name}',
        page: <PageDialectPhrasesCreate />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrases', new paramMatch('phrase', ANYTHING_BUT_SLASH) ],
        title: '{$phrase} | Phrases | {$dialect_name}',
        page: <PageDialectViewPhrase />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrases', new paramMatch('phrase', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$phrase} Phrase | Phrases | {$dialect_name}',
        page: <PageDialectPhraseEdit />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'stories' ],
        title: 'Stories | {$dialect_name}',
        page: <PageDialectLearnStoriesAndSongs typeFilter="story" typePlural="stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs' ],
        title: 'Songs | {$dialect_name}',
        page: <PageDialectLearnStoriesAndSongs typeFilter="song" typePlural="songs" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs-stories' ],
        title: 'Songs and Stories | {$dialect_name}',
        page: <PageDialectLearnStoriesAndSongs typePlural="Songs and Stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'stories', 'create' ],
        title: 'Create | Stories | {$dialect_name}',
        page: <PageDialectStoriesAndSongsCreate typeFilter="story" typePlural="stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs', 'create' ],
        title: 'Create | Songs | {$dialect_name}',
        page: <PageDialectStoriesAndSongsCreate typeFilter="song" typePlural="songs" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs', new paramMatch('bookName', ANYTHING_BUT_SLASH) ],
        title: '{$bookName} | Songs | {$dialect_name}',
        page: <PageDialectViewBook typeFilter="song" typePlural="songs" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs', new paramMatch('bookName', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$bookName} Book | Songs | {$dialect_name}',
        page: <PageDialectBookEdit typeFilter="song" typePlural="songs" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs', new paramMatch('parentBookName', ANYTHING_BUT_SLASH), 'create' ],
        title: 'Create Entry | {$bookName} Book | Songs | {$dialect_name}',
        page: <PageDialectStoriesAndSongsBookEntryCreate typeFilter="song" typePlural="songs" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'songs', new paramMatch('parentBookName', ANYTHING_BUT_SLASH), new paramMatch('bookName', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit Entry | {$bookName} Book | Songs | {$dialect_name}',
        page: <PageDialectBookEntryEdit typeFilter="song" typePlural="songs" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'stories', new paramMatch('bookName', ANYTHING_BUT_SLASH) ],
        title: '{$bookName} Book | Stories | {$dialect_name}',
        page: <PageDialectViewBook typeFilter="story" typePlural="stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'stories', new paramMatch('bookName', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit {$bookName} Book | Stories | {$dialect_name}',
        page: <PageDialectBookEdit typeFilter="story" typePlural="stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'stories', new paramMatch('parentBookName', ANYTHING_BUT_SLASH), 'create' ],
        title: 'Create Entry | {$bookName} Book | Stories | {$dialect_name}',
        page: <PageDialectStoriesAndSongsBookEntryCreate typeFilter="story" typePlural="stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'stories', new paramMatch('parentBookName', ANYTHING_BUT_SLASH), new paramMatch('bookName', ANYTHING_BUT_SLASH), 'edit' ],
        title: 'Edit Entry | {$bookName} Book | Stories | {$dialect_name}',
        page: <PageDialectBookEntryEdit typeFilter="story" typePlural="stories" />,
        extractPaths: true,
        redirects: [WORKSPACE_TO_SECTION_REDIRECT]
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'categories', 'create' ],
        title: 'Create | Category | {$dialect_name}',
        page: <PageDialectCategoryCreate />,
        extractPaths: true
      },
      {
        path: [KIDS_OR_DEFAULT, 'FV', 'Workspaces', 'Data', ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, ANYTHING_BUT_SLASH, 'learn', 'phrasebooks', 'create' ],
        title: 'Create | Phrase Book | {$dialect_name}',
        page: <PageDialectPhraseBooksCreate />
      }
    ]);

    return {
      routes: routes,
      matchedPage: null,
      matchedRouteParams: {},
      warningsDismissed: false
    };
  }

  /** 
   * Dynamically update title
   */
  _updateTitle() {

    // Title provided from within a component
    let pageTitleParams = this.props.properties.pageTitleParams;

    let title = this.props.properties.title;

    if (this.state.matchedPage && this.state.matchedPage.has('title') && this.state.matchedPage.get('title') && this.state.matchedPage.get('title') != document.title) {
      let combinedRouteParams = Object.assign({}, this.state.matchedRouteParams, pageTitleParams);

      title = this.state.matchedPage.get('title');
      Object.keys(combinedRouteParams).forEach(function(route, k) {
        title = title.replace('{$' + route + '}', StringHelpers.toTitleCase(combinedRouteParams[route]));
      }.bind(this));

      title = title + ' | ' + this.props.properties.title;
    }

    document.title = title;
  }

  /**
  * Conditionally route the parameters.
  * This could normally go into the render method to keep things simple,
  * however redirecting (i.e. updating state), cannot be done inside render.
  */
  _route(props, routesOverride = null) {

    let matchedPage = null
    let matchedRouteParams = {};

    const pathArray = props.splitWindowPath;

    let routes = routesOverride || this.state.routes;

    routes.forEach(function(value, key) {

      let matchTest = this._matchPath(value.get('path'), pathArray);
      let matchAlias = this._matchPath(value.get('alias'), pathArray);

      // If only the alias matched, redirect to the original path
      if (matchAlias.matched && !matchTest.matched) {
        window.location.replace('/' + value.get('path').join());
      }

      if (matchTest.matched) {

        let routeParams = matchTest.routeParams;

        // Extract common paths from URL
        if (value.has('extractPaths') && value.get('extractPaths')) {
          if (pathArray.length >= 7) {
            routeParams['dialect_name'] = decodeURI(pathArray.slice(1, 7)[5]);
            routeParams['dialect_path'] = decodeURI('/' + pathArray.slice(1, 7).join('/'));
          }

          if (pathArray.length >= 6) {
            routeParams['language_name'] = decodeURI(pathArray.slice(1, 6)[4]);
            routeParams['language_path'] = decodeURI('/' + pathArray.slice(1, 6).join('/'));
          }

          if (pathArray.length >= 5) {
            routeParams['language_family_name'] = decodeURI(pathArray.slice(1, 5)[3]);
            routeParams['language_family_path'] = decodeURI('/' + pathArray.slice(1, 5).join('/'));
          }
        }

        matchedPage = value;
        matchedRouteParams = routeParams;

        // Break out of forEach
        return false;
      }
    }.bind(this));

    // Match found
    if (matchedPage !== null) {

      // Redirect if required
      if (matchedPage.has('redirects')) {
        matchedPage.get('redirects').forEach(function(value, key) {

          if (value.get('condition')({props: props})) {

            // Avoid invariant violations during rendering by setting temporary placeholder component as matched page, and 'redirecting' after mount.
            matchedPage = matchedPage.set('page', Immutable.fromJS(React.createElement(Redirecter, {redirect: function () {
                return props.replaceWindowPath(value.get('target')({props: props}));
            }}, matchedPage.get('page'))))
            
            return false;
          }
        }.bind(this));
      }

      // Switch themes based on route params
      if (matchedRouteParams.hasOwnProperty('theme')) {

        let newTheme = matchedRouteParams.theme;

        // Switch to workspace theme if available
        if (((matchedRouteParams.hasOwnProperty('area') && matchedRouteParams.area === 'Workspaces') || matchedPage.get('path').indexOf('Workspaces') !== -1) && matchedRouteParams.theme == 'explore') {
          newTheme = 'workspace';
        }

        if (props.properties.theme.id != newTheme) {
          props.changeTheme(newTheme);
        }
      }
      else {
        props.changeTheme('default');
      }

      let matchReturn = {
        matchedPage: matchedPage,
        matchedRouteParams: matchedRouteParams
      };

      // Load help
      props.loadGuide(props.windowPath, matchReturn);

      this.setState(matchReturn);
    }
  }

  componentWillMount() {
    this._route(this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    
    this._updateTitle();

    if (prevProps.windowPath != this.props.windowPath) {
      // Track page view
      if (window.snowplow) {
        window.snowplow('trackPageView');
      }
    }

    if(selectn('computeLogin.isConnected', this.props) && selectn('computeLogin.isNewLogin', this.props))
    {
      let primary_dialect_path = selectn('primary_dialect_path', this.props.preferences);

      if(primary_dialect_path && prevProps.preferences.primary_dialect_path === undefined)
      {
        primary_dialect_path = '/explore'+ primary_dialect_path;
        this.props.pushWindowPath(primary_dialect_path);
      }
    }

  }

  componentWillReceiveProps(nextProps) {

    let primary_dialect_path = selectn('primary_dialect_path', this.props.preferences);
    let next_primary_dialect_path = selectn('primary_dialect_path', nextProps.preferences);
    
    // Re-route on window path change
    if (nextProps.windowPath != this.props.windowPath) {
      this._route(nextProps);
    }

    // Re-route on login
    else if (nextProps.computeLogin != this.props.computeLogin) {

      this._route(nextProps);

    }

    // Re-route if preferences change
    else if (next_primary_dialect_path !== undefined && next_primary_dialect_path != primary_dialect_path && next_primary_dialect_path.length > 0) {
      this._route(nextProps);
    }

  }

  _renderBreadcrumb(matchedPage, routeParams) {
    let props = this.props;
    let splitPath = props.splitWindowPath;
    let routes = this.state.routes;

    let breadcrumb = splitPath.map(function(path, index) {
      if (path && path != "" && REMOVE_FROM_BREADCRUMBS.indexOf(path) === -1) {
        // Last element (i.e. current page)
        if (index == splitPath.length - 1) {
          return <li key={index} className="active">{decodeURIComponent(path).replace('&amp;', '&')}</li>;
        }
        else {

          let hrefPath = "/" + splitPath.slice(0, index + 1).join('/');

          /**
          * Replace breadcrumb entry with redirect value. Solved some rendering issues. Needs more robust solution though.
          */
          routes.forEach(function(value, key) {

            let matchTest = this._matchPath(value.get('path'), [ path ]);

            if (matchTest.matched) {

              if (value.has('redirects')) {
                value.get('redirects').forEach(function(redirectValue, key) {

                  if (redirectValue.get('condition')({props: props})) {
                    hrefPath = redirectValue.get('target')({props: props});
                    hrefPath = hrefPath.replace('sections', routeParams.area || splitPath[2] || 'sections');

                    return false;
                  }
                }.bind(this));
              }

              // Break out of forEach
              return false;
            }

          }.bind(this));

          return <li key={index}><Link key={index} href={hrefPath}>{decodeURIComponent(path).replace('&amp;', '&')}</Link></li>;
        }
      }
    }.bind(this));

    return breadcrumb;
  }

  _renderWithBreadcrumb(reactElement, matchedPage, props, theme) {

    const themePalette = props.properties.theme.palette.rawTheme.palette;

    return (
      <div>

        <div className="row">
          <div className="clearfix" style={{backgroundColor: themePalette.accent4Color}}>

            {(() => {
              if (selectn("routeParams.area", reactElement.props) && selectn("isConnected", props.computeLogin) && matchedPage.get('disableWorkspaceSectionNav') !== true) {

                return <ul className={classNames('workspace-switcher', 'nav', 'nav-pills', 'pull-right')} style={{"display":"inline-block","verticalAlign":"middle","paddingTop": "10px"}}>
                  <li role="presentation" className={(reactElement.props.routeParams.area == 'Workspaces') ? 'active' : ''}><a href={props.windowPath.replace('sections', 'Workspaces')}>Workspace</a></li> <li className={(reactElement.props.routeParams.area == 'sections') ? 'active' : ''} role="presentation"><a href={props.windowPath.replace('Workspaces', 'sections')}>Public View</a></li>
                </ul>;

              }

            })()}

            <ol className={classNames('breadcrumb', 'pull-left')}><li><Link href="/">Home</Link></li>{this._renderBreadcrumb(matchedPage, reactElement.props.routeParams)}</ol>

          </div>
        </div>

        <div className={'page-' + theme + '-theme'}>{reactElement}</div>

      </div>
    )
  }

  /**
  * Tests to see if current URL matches route.
  * Return object with matched boolean and route params returned
  */
  _matchPath(pathMatchArray, urlPath) {

    // Remove empties from path array, return Immutable list
    const currentPathArray = Immutable.fromJS(urlPath.filter(function(e){ return e; }));

    if (!pathMatchArray) {
      return false;
    }

    if (pathMatchArray.size != currentPathArray.size) {
      return { matched: false, routeParams: {} };
    }

    let matchedRouteParams = {};

    let matched = pathMatchArray.every(function(value, key) {

      if (value instanceof RegExp) {
        return value.test(currentPathArray.get(key));
      }
      else if (value instanceof paramMatch)
      {
        if (value.hasOwnProperty('matcher')) {
          let testMatch = value.matcher.test(currentPathArray.get(key))

          if (testMatch) {
            matchedRouteParams[value.id] = decodeURI(currentPathArray.get(key));
            return true;
          }
        }

        return false;
      }
      else {
        return value === currentPathArray.get(key);
      }
    });

    return { matched: matched, routeParams: matchedRouteParams };
  }

  render() {

    const { matchedPage, matchedRouteParams } = this.state;
    
    const isFrontPage = (!matchedPage) ? false : matchedPage.get('frontpage');
    const hideNavigation = (matchedPage) && matchedPage.has('navigation') && matchedPage.get('navigation') === false;

    let page, navigation = <Navigation frontpage={isFrontPage} routeParams={matchedRouteParams} />;
    let theme = (matchedRouteParams.hasOwnProperty('theme')) ? matchedRouteParams.theme : 'default';
    let print = (matchedPage) ? matchedPage.get('page').get('props').get('print') === true : false;

    let footer = <Footer className={'footer-' + theme + '-theme'} />;

    if (!matchedPage) {
      page = <div><h1>404 - Page Not Found</h1><p>Please report this error via the "Provide Feedback" feature so that we can fix it.</p><p>Include what link or action you took to get to this page.</p><p>Thank you!</p></div>;
    } else {

      let clonedElement = React.cloneElement(matchedPage.get('page').toJS(), { routeParams: matchedRouteParams });

      // For print view return page only
      if (print) {
        return <div style={{margin: '25px'}}>{clonedElement}</div>;
      }

      // Remove breadcrumbs for Kids portal
      // TODO: Make more generic if additional themes are added in the future.
      if (theme == 'kids') {
        page = clonedElement;
        navigation = <KidsNavigation frontpage={isFrontPage} routeParams={matchedRouteParams} />;
      } else {
        // Without breadcrumbs
        if (matchedPage.get('breadcrumbs') === false) {
          page = clonedElement;
        }
        // With breadcrumbs
        else {
          page = this._renderWithBreadcrumb(clonedElement, matchedPage, this.props, theme);
        }
      }

      // Hide navigation
      if (hideNavigation) {
        navigation = footer = '';
      }
    }

    return (
      <div>

        {((matchedPage && matchedPage.hasOwnProperty('warnings')) ? matchedPage.get('warnings') : []).map(function (warning) {
          if (this.props.warnings.hasOwnProperty(warning) && !this.state.warningsDismissed) {
            return <div style={{position: 'fixed', bottom: 0, zIndex: 99999}} className={classNames('alert', 'alert-warning')}>{selectn(warning, this.props.warnings)} <FlatButton label="Dismiss" onTouchTap={() => this.setState({warningsDismissed: true})} /></div>;
          }
        }.bind(this))}

        <div className="row">{navigation}</div>
        {page}
        <div className="row">{footer}</div>
      </div>
    );
  }
}