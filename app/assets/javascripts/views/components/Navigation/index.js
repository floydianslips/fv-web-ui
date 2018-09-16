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

import React, { Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import selectn from 'selectn';
import ConfGlobal from 'conf/local.json';

import provide from 'react-redux-provide';

import ProviderHelpers from 'common/ProviderHelpers';
import UIHelpers from 'common/UIHelpers';

import Shepherd from 'tether-shepherd';

import {Link} from 'provide-page';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

import TextField from '@material-ui/core/TextField';

import IconMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ActionHelp from '@material-ui/icons/Help';
import Popover from '@material-ui/core/Popover';
import Avatar from '@material-ui/core/Avatar';

import AuthenticationFilter from 'views/components/Document/AuthenticationFilter';

import Login from 'views/components/Navigation/Login';
import AppLeftNav from 'views/components/Navigation/AppLeftNav';

import IntlService from 'views/services/intl';

import NavigationExpandMoreIcon from '@material-ui/icons/ExpandMore';

@provide
export default class Navigation extends Component {

  intl = IntlService.instance;

  static defaultProps = {
    frontpage: false
  }

  static propTypes = {
    windowPath: PropTypes.string.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    replaceWindowPath: PropTypes.func.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    toggleMenuAction: PropTypes.func.isRequired,
    countTotalTasks: PropTypes.func.isRequired,
    computeCountTotalTasks: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    computeLogin: PropTypes.object.isRequired,
    loadNavigation: PropTypes.func.isRequired,
    computeLoadNavigation: PropTypes.object.isRequired,
    //computeLoadGuide: PropTypes.object.isRequired,
    computePortal: PropTypes.object,
    computeDialect2: PropTypes.object,
    routeParams: PropTypes.object,
    frontpage: PropTypes.bool
  };


  constructor(props, context){
    super(props, context);

    this.state = {
      searchBarVisibleInMobile: false,
      guidePopoverOpen: false,
      guidePopoverAnchorEl: null,
      searchContextPopoverOpen: false,
      searchContextPopoverAnchorEl: null,
      searchLocal: true,
      localePopoverOpen: false,
      userRegistrationTasksPath: '/management/registrationRequests/',
      pathOrId: '/' + props.properties.domain + '/' + selectn('routeParams.area', props),
      locale: this.intl.locale
    };

    // Bind methods to 'this'
    ['_handleChangeLocale', '_handleDisplayLocaleOptions', 'handleChangeRequestLeftNav', 'handleRequestChangeList', '_handleNavigationSearchSubmit', '_handleNavigationSearchChange', '_startTour', '_removePopoverUnlessOptionSelected', '_handleOpenMenuRequest'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  _setExplorePath(props = this.props){
    let fetchPath = selectn('routeParams.area', props);

    if (!fetchPath) {
      if (selectn("isConnected", props.computeLogin)) {
        fetchPath = 'Workspaces';
      } else {
        fetchPath = 'sections';
      }
    }

    const pathOrId = '/' + props.properties.domain + '/' + fetchPath;

    this.setState({
      pathOrId: pathOrId
    });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.computeLogin != this.props.computeLogin && newProps.computeLogin.isConnected) {
        this.props.countTotalTasks('count_total_tasks', {
            'query': 'SELECT COUNT(ecm:uuid) FROM TaskDoc, FVUserRegistration WHERE (ecm:currentLifeCycleState = \'opened\' OR ecm:currentLifeCycleState = \'created\')',
            'language': 'nxql',
            'sortOrder': 'ASC'
        });
    }

    const USER_LOG_IN_STATUS_CHANGED = (newProps.computeLogin.isConnected !== this.props.computeLogin.isConnected && newProps.computeLogin.isConnected != undefined && this.props.computeLogin.isConnected != undefined);

    if (USER_LOG_IN_STATUS_CHANGED || newProps.routeParams.area != this.props.routeParams.area) {
      this._setExplorePath(newProps);
    }

    // Remove popover upon navigation
    if (newProps.windowPath != this.props.windowPath) {
      this.setState({
        searchContextPopoverOpen: false
      });
    }
  }

  componentDidMount() {
    this._setExplorePath();

    // Ensure Search Box blur does not remove Popover when focusing on search options (only applies to Dialect pages)
    //document.body.addEventListener('click', this._removePopoverUnlessOptionSelected);
  }

  componentWillUnmount () {
    //document.body.removeEventListener('click', this._removePopoverUnlessOptionSelected);
  }

  _removePopoverUnlessOptionSelected(e) {
    if (this.props.routeParams.hasOwnProperty('dialect_path') && e.target.name !== "searchTarget" && e.target.name !== "searchbox" ) {
      this.setState({
        searchContextPopoverOpen: false
      });
    }
  }

  _onNavigateRequest(path) {
    this.props.pushWindowPath(path);
  }

  handleChangeRequestLeftNav(open) {
    this.setState({
      leftNavOpen: open,
    });
  }

  handleRequestChangeList(event, value) {
    //this.context.router.push(value);
    this.setState({
      leftNavOpen: false,
    });
  }

  _startTour(tourContent) {

      this.setState({guidePopoverOpen: false});

      let newTour = new Shepherd.Tour({
        defaults: {
          classes: 'shepherd-theme-arrows'
        }
      });

      (selectn('properties.fvguide:steps', tourContent) || []).map(function(step, i) {
        newTour.addStep('step' + i, {
          title: this.intl.searchAndReplace(selectn('title', step)),
          text: this.intl.searchAndReplace(selectn('text', step)),
          attachTo: selectn('attachTo', step),
          advanceOn: selectn('advanceOn', step),
          showCancelLink: selectn('showCancelLink', step)
        });
      });

      newTour.start();
  }

  _handleNavigationSearchChange(e) {
    if (e.keyCode === 13) {
      this._handleNavigationSearchSubmit()
    }
  }

  _handleNavigationSearchSubmit(e) {

    // If search bar is not visible, this button should show it
    if (this.navigationSearchFieldRef.offsetParent === null) {
      this.setState({
        searchBarVisibleInMobile: true,
        searchContextPopoverOpen: false
      });

      e.preventDefault();
    } else {

      this.setState({
        searchBarVisibleInMobile: false,
        searchContextPopoverOpen: false
      });

      let searchQueryParam = this.navigationSearchFieldRef.value;
      let path = "/" + this.props.splitWindowPath.join("/");
      let queryPath = "";

      // Do a global search in either the workspace or section
      if(path.includes("/explore/FV/Workspaces/Data")) {
        queryPath = "/explore/FV/Workspaces/Data"
      }
      else if(path.includes("/explore/FV/sections/Data")) {
        queryPath = "/explore/FV/sections/Data"
      }
      else {
        queryPath = "/explore/FV/sections/Data"
      }

      // Do a dialect search
      if (this.props.routeParams.dialect_path && this.state.searchLocal) {
        queryPath = "/explore" + this.props.routeParams.dialect_path;
      }

      // Clear out the input field
      this.navigationSearchFieldRef.value = '';

      if (searchQueryParam && searchQueryParam != '') {
        this.props.replaceWindowPath(queryPath + '/search/' + searchQueryParam);
      }
    }
  }

  _handleDisplayLocaleOptions(e) {
    this.setState({
      localePopoverOpen: true
    });
  }

  _handleChangeLocale(e) {
    const v = e.target.value
    if (v !== this.intl.locale) {
        this.intl.locale = v;
        setTimeout(function () {
            // timeout, such that the select box doesn't freeze in a wierd way (looks bad)
            window.location.reload(true);
        }, 250);
    }
  }

  _handleOpenMenuRequest() {
    
    // Only load navigation once
    if (!this.props.computeLoadNavigation.success) {
      this.props.loadNavigation();
    }

    this.props.toggleMenuAction("AppLeftNav");
  }

  render() {
    const themePalette = this.props.properties.theme.palette.rawTheme.palette;
    const isDialect = this.props.routeParams.hasOwnProperty('dialect_path');
    const isFrontPage = this.props.frontpage;

    const computeCountTotalTasks = ProviderHelpers.getEntry(this.props.computeCountTotalTasks, 'count_total_tasks');
    const computePortal = ProviderHelpers.getEntry(this.props.computePortal, this.props.routeParams.dialect_path + '/Portal');
    const computeDialect = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

    const userTaskCount = selectn('response.entries[0].COUNT(ecm:uuid)', computeCountTotalTasks) || 0;

    //const guideCount = selectn('response.resultsCount', this.props.computeLoadGuide) || 0;

    let portalLogo = selectn('response.contextParameters.portal.fv-portal:logo', computePortal);
    let portalTitle = selectn('response.contextParameters.ancestry.dialect.dc:title', computePortal) || selectn('response.properties.dc:title', computeDialect);

    return <div>
        <AppBar position="static" style={{background: themePalette.primary1Color }}>

          <Toolbar style={{position: 'relative', color: '#fff'}}>
            <IconButton onClick={this._handleOpenMenuRequest} color="inherit">
              <MenuIcon />
            </IconButton>

            <Typography variant="title" style={{flexGrow: 1}}>
              <span className="hidden-xs">
              <img src="/assets/images/logo.png" style={{padding: "0 0 5px 0"}} alt={this.props.properties.title} />
              </span>
            </Typography>

            <Typography variant="title" style={{textTransform: 'uppercase'}}>
              <Link className="nav_link" href={"/explore" + this.state.pathOrId + '/Data'}>{intl.trans('choose_lang', 'Choose a Language', 'first')}</Link>
            </Typography>

            <Login routeParams={this.props.routeParams} label={this.intl.translate({
                key: 'views.pages.users.login.sign_in',
                default: 'Sign In',
                case: 'words'
            })}/>

            <AuthenticationFilter login={this.props.computeLogin} anon={false} routeParams={this.props.routeParams} >
              <span>
                <Badge
                  style={{
                    root: {top: '8px', left: '-15px', padding: '0 0 12px 12px'},
                    badge: {top: '12px',left: '42px', width: '15px', height: '15px', borderRadius: '25%', visibility: (userTaskCount == 0) ? 'hidden' : 'visible'}
                  }}
                  badgeContent={userTaskCount || ''}
                  variant="primary"
                >
                  <IconButton >
                    <NotificationsIcon />
                  </IconButton>
                </Badge>

                {/*<Badge
                  badgeContent={guideCount}
                  style={{top: '8px', left: '-15px', padding: '0 0 12px 12px'}}
                  badgeStyle={{top: '12px',left: '42px', width: '15px', height: '15px', borderRadius: '25%', visibility: (guideCount == 0) ? 'hidden' : 'visible'}}
                  color="primary"
                >
                  <IconButton >
                    <ActionHelp />
                  </IconButton>
                </Badge>*/}
              </span>
            </AuthenticationFilter>

            {/*<Popover
                open={this.state.guidePopoverOpen}
                anchorEl={this.state.guidePopoverAnchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                <div>
                    <div className={classNames('panel', 'panel-default')} style={{marginBottom: 0}}>
                        <div className="panel-heading">
                            <h3 className="panel-title">{this.intl.translate({
                                key: 'views.components.navigation.interactive_guides',
                                default: 'Interactive Guides',
                                case: 'words'
                            })}</h3>
                        </div>
                        <div className="panel-body">
                            <p>{this.intl.translate({
                                key: 'views.components.navigation.learn_how_to_use_this_page',
                                default: 'Learn how to use this page quickly and efficiently',
                                case: 'first',
                                append: ':'
                            })}</p>
                            <table>
                                <tbody>
                                {(selectn('response.entries', this.props.computeLoadGuide) || []).map(function (guide, i) {
                                    return <tr key={'guide' + i}>
                                        <td>{selectn('properties.dc:title', guide)}<br/>{selectn('properties.dc:description', guide)}
                                        </td>
                                        <td><Button variant='raised' onClick={this._startTour.bind(this, guide)}
                                                            primary={false} label={this.intl.translate({
                                            key: 'views.components.navigation.launch_guide',
                                            default: 'Launch Guide',
                                            case: 'words'
                                        })}/></td>
                                    </tr>;
                                }.bind(this))}
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </Popover>*/}

            <div style={{background: themePalette.primary1Color, display: 'inline-block'}} className={classNames({'hidden-xs': !this.state.searchBarVisibleInMobile, 'search-bar-mobile': this.state.searchBarVisibleInMobile})}>
              <TextField style={{marginLeft: (this.state.searchBarVisibleInMobile) ? '15px' : '30px', fontSize: '15px', height: '38px', backgroundColor: '#fff', paddingLeft: '10px', lineHeight: '1', width: (this.state.searchBarVisibleInMobile) ? '214px' : 'inherit', paddingRight: (this.state.searchBarVisibleInMobile) ? '0' : '40px'}} 
                inputRef={el => this.navigationSearchFieldRef = el}
                hintText={this.intl.translate({key: 'general.search', default: 'Search', case: 'first', append: ':'})} 
                onBlur={() => this.setState({searchContextPopoverOpen: (isDialect) ? true : false })} 
                onFocus={(e) => this.setState({searchContextPopoverOpen: true, searchContextPopoverAnchorEl: e.target})} 
                onKeyDown={this._handleNavigationSearchChange} 
                name="searchbox" />
              <Button variant='flat' className={classNames({'hidden': !this.state.searchBarVisibleInMobile})} style={{color: themePalette.alternateTextColor}} onClick={(e) => {this.setState({searchBarVisibleInMobile: false}); e.preventDefault(); }}>
                {this.intl.translate({key: 'general.cancel',default: 'Cancel',case: 'first'})}
              </Button>
            </div>

            <IconButton
                onClick={this._handleNavigationSearchSubmit}
                color="inherit"
                >
                <SearchIcon />
            </IconButton>

            <Popover
            useLayerForClickAway={false}
            open={this.state.searchContextPopoverOpen}
            anchorEl={this.state.searchContextPopoverAnchorEl}
            style={{maxWidth: (isDialect) ? '320px' : '220px', marginTop: '-14px', backgroundColor: 'transparent', boxShadow: 'none'}}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'middle', vertical: 'top'}}>
              <div>
                <img style={{position: 'relative', top: '14px', zIndex: 999999, paddingTop: '14px', left: '80%'}} src="/assets/images/popover-arrow.png" alt="" />
                {(() => {
                if (isDialect) {
                  return <div style={{marginBottom: 0, padding: '10px 10px 1px 10px', backgroundColor: '#fff', fontSize: '0.95em'}}>
                    <p style={{padding: 0}}>{this.intl.translate({
                        key: 'general.select_search_option',
                        default: 'Select Search Option',
                        case: 'words'
                    })}</p>
                    <div>
                        <RadioGroup
                            onChange={() => this.setState({searchLocal: !this.state.searchLocal})}
                            value={this.state.searchLocal ? 'local' : 'all'}
                            name="searchTarget" defaultSelected="local">
                            <FormControlLabel
                                control={<Radio />}
                                value={this.intl.translate({
                                    key: 'general.all',
                                    default: 'all',
                                    case: 'lower'
                                })}
                                label={(
                                    <span style={{fontWeight: '400'}}>FirstVoices.com <br/> <span
                                        style={{
                                            fontWeight: '300',
                                            color: '#959595'
                                        }}>{this.intl.translate({
                                        key: 'views.components.navigation.all_languages_and_words',
                                        default: 'All languages &amp; words',
                                        case: 'words',
                                        append: '.'
                                    })}</span></span>)}
                            />
                            <FormControlLabel
                                control={<Radio />}
                                value="local"
                                label={(<span
                                    style={{fontWeight: '400'}}>{portalTitle || this.intl.translate({
                                    key: 'views.components.navigation.this_dialect',
                                    default: 'This Dialect',
                                    case: 'words'
                                })}<br/> <span
                                    style={{
                                        fontWeight: '300',
                                        color: '#959595'
                                    }}>{this.intl.translate({
                                    key: 'general.words',
                                    default: 'Words',
                                    case: 'first'
                                })}, {this.intl.translate({
                                    key: 'general.phrases',
                                    default: 'Phrases',
                                    case: 'first'
                                })}, {this.intl.translate({
                                    key: 'general.songs_and_stories',
                                    default: 'Songs &amp; Stories',
                                    case: 'words',
                                    append: '.'
                                })}</span></span>)}
                            />
                        </RadioGroup>
                    </div>
                  </div>;
                } else {
                  return <div style={{marginBottom: 0, padding: '10px 10px 1px 10px', backgroundColor: '#fff'}}>
                    <p style={{padding: 0}}>{this.intl.translate({
                        key: 'views.components.navigation.search_all',
                        default: 'Search all languages &amp; words at FirstVoices.com',
                        case: 'first'
                    })}</p>
                  </div>;
                }
                })()}
              </div>
          </Popover>

          <IconButton
            onClick={this._handleDisplayLocaleOptions}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>

          </Toolbar>

          <Toolbar color="inherit" style={{display: (this.state.localePopoverOpen) ? 'flex' : 'none', justifyContent: "flex-end" }}>
              <Typography style={{'color': '#fff', 'padding': '0 15px', 'fontSize':'15px'}}>
                {intl.trans('choose_lang', 'Choose a Language', 'first')}
              </Typography>
              <Select value={this.intl.locale} onChange={this._handleChangeLocale} style={{'color': '#fff' }}>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                {/*<MenuItem value="sp" primaryText="Español" />*/}
              </Select>
          </Toolbar>
        </AppBar>


        <AppLeftNav
          menu={{main: true}}
          open={false}
          //onRequestChangeLeftNav={this.handleChangeRequestLeftNav}
          //onRequestChangeList={this.handleRequestChangeList}
          docked={false} />

        {(() => {
                if (isDialect) {
                  return <div className="row" style={{backgroundColor: themePalette.primary2Color, minHeight: '64px', margin: '0'}}>

                      <div className="col-xs-12">
                        <h2 style={{fontWeight: '500', margin: '0'}}><a style={{textDecoration: 'none', color: '#fff'}} onClick={this._onNavigateRequest.bind(this, '/explore' + this.props.routeParams.dialect_path)}><Avatar src={UIHelpers.getThumbnail(portalLogo, 'Thumbnail')} size={50} style={{marginRight: '10px', marginTop: '8px', marginLeft: '3px'}} /> <span style={{verticalAlign: '-5px'}}>{this.intl.searchAndReplace(portalTitle)}</span></a></h2>
                      </div>

                    </div>;
                }
        })()}

    </div>;
  }
}
