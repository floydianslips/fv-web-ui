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

import React, { Component, PropTypes } from "react"
import classNames from "classnames"
import selectn from "selectn"
// import ConfGlobal from 'conf/local.json'

import provide from "react-redux-provide"

import ProviderHelpers from "common/ProviderHelpers"
import UIHelpers from "common/UIHelpers"

import Shepherd from "tether-shepherd"

import { Link } from "provide-page"

// Components
import AppBar from "material-ui/lib/app-bar"

import TextField from "material-ui/lib/text-field"

// import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from "material-ui/lib/menus/menu-item"
// import SelectField from 'material-ui/lib/select-field'

import ToolbarSeparator from "material-ui/lib/toolbar/toolbar-separator"
import RadioButton from "material-ui/lib/radio-button"
import RadioButtonGroup from "material-ui/lib/radio-button-group"

import Badge from "material-ui/lib/badge"
import DropDownMenu from "material-ui/lib/DropDownMenu"
// import RaisedButton from 'material-ui/lib/raised-button'
import FlatButton from "material-ui/lib/flat-button"

import Toolbar from "material-ui/lib/toolbar/toolbar"
import ToolbarGroup from "material-ui/lib/toolbar/toolbar-group"
import IconButton from "material-ui/lib/icon-button"
// import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert'
import NotificationsIcon from "material-ui/lib/svg-icons/social/notifications"
// import ActionHelp from 'material-ui/lib/svg-icons/action/help'
import Popover from "material-ui/lib/popover/popover"
import Avatar from "material-ui/lib/avatar"

import AuthenticationFilter from "views/components/Document/AuthenticationFilter"

import Login from "views/components/Navigation/Login"
import AppLeftNav from "views/components/Navigation/AppLeftNav"

import IntlService from "views/services/intl"

// import FontIcon from 'material-ui/lib/font-icon'
// import NavigationExpandMoreIcon from 'material-ui/lib/svg-icons/navigation/expand-more'
import ToolbarTitle from "material-ui/lib/toolbar/toolbar-title"

@provide
export default class Navigation extends Component {
  intl = IntlService.instance

  static defaultProps = {
    frontpage: false,
  }

  static propTypes = {
    windowPath: PropTypes.string.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    replaceWindowPath: PropTypes.func.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    toggleMenuAction: PropTypes.func.isRequired,
    // countTotalTasks: PropTypes.func.isRequired,
    // computeCountTotalTasks: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    computeLogin: PropTypes.object.isRequired,
    loadNavigation: PropTypes.func.isRequired,
    computeLoadNavigation: PropTypes.object.isRequired,
    //computeLoadGuide: PropTypes.object.isRequired,
    computePortal: PropTypes.object,
    computeDialect2: PropTypes.object,
    routeParams: PropTypes.object,
    frontpage: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      searchBarVisibleInMobile: false,
      guidePopoverOpen: false,
      guidePopoverAnchorEl: null,
      searchContextPopoverOpen: false,
      searchContextPopoverAnchorEl: null,
      searchLocal: true,
      localePopoverOpen: false,
      userRegistrationTasksPath: "/management/registrationRequests/",
      pathOrId: "/" + props.properties.domain + "/" + selectn("routeParams.area", props),
      locale: this.intl.locale,
    }

    // Bind methods to 'this'
    ;[
      "_handleChangeLocale",
      "_handleDisplayLocaleOptions",
      "handleChangeRequestLeftNav",
      "handleRequestChangeList",
      "_handleNavigationSearchSubmit",
      "_startTour",
      "_removePopoverUnlessOptionSelected",
      "_handleOpenMenuRequest",
    ].forEach((method) => (this[method] = this[method].bind(this)))
  }

  _setExplorePath(props = this.props) {
    let fetchPath = selectn("routeParams.area", props)

    if (!fetchPath) {
      if (selectn("isConnected", props.computeLogin)) {
        fetchPath = "Workspaces"
      } else {
        fetchPath = "sections"
      }
    }

    const pathOrId = "/" + props.properties.domain + "/" + fetchPath

    this.setState({
      pathOrId: pathOrId,
    })
  }

  componentWillReceiveProps(newProps) {
    // if (newProps.computeLogin != this.props.computeLogin && newProps.computeLogin.isConnected) {
    //     this.props.countTotalTasks('count_total_tasks', {
    //         'query': 'SELECT COUNT(ecm:uuid) FROM TaskDoc, FVUserRegistration WHERE (ecm:currentLifeCycleState = \'opened\' OR ecm:currentLifeCycleState = \'created\')',
    //         'language': 'nxql',
    //         'sortOrder': 'ASC'
    //     });
    // }

    const USER_LOG_IN_STATUS_CHANGED =
      newProps.computeLogin.isConnected !== this.props.computeLogin.isConnected &&
      newProps.computeLogin.isConnected != undefined &&
      this.props.computeLogin.isConnected != undefined

    if (USER_LOG_IN_STATUS_CHANGED || newProps.routeParams.area != this.props.routeParams.area) {
      this._setExplorePath(newProps)
    }

    // Remove popover upon navigation
    if (newProps.windowPath !== this.props.windowPath) {
      this.setState({
        searchContextPopoverOpen: false,
      })
    }
  }

  componentDidMount() {
    this._setExplorePath()

    // Ensure Search Box blur does not remove Popover when focusing on search options (only applies to Dialect pages)
    //document.body.addEventListener('click', this._removePopoverUnlessOptionSelected);

    // Only load navigation once
    if (!this.props.computeLoadNavigation.success) {
      this.props.loadNavigation()
    }
  }

  componentWillUnmount() {
    //document.body.removeEventListener('click', this._removePopoverUnlessOptionSelected);
  }

  _removePopoverUnlessOptionSelected(e) {
    if (
      this.props.routeParams.hasOwnProperty("dialect_path") &&
      e.target.name !== "searchTarget" &&
      e.target.name !== "searchbox"
    ) {
      this.setState({
        searchContextPopoverOpen: false,
      })
    }
  }

  _onNavigateRequest(path) {
    this.props.pushWindowPath(path)
  }

  handleChangeRequestLeftNav(open) {
    this.setState({
      leftNavOpen: open,
    })
  }

  handleRequestChangeList() {
    //this.context.router.push(value);
    this.setState({
      leftNavOpen: false,
    })
  }

  _startTour(tourContent) {
    this.setState({ guidePopoverOpen: false })

    const newTour = new Shepherd.Tour({
      defaults: {
        classes: "shepherd-theme-arrows",
      },
    })

    ;(selectn("properties.fvguide:steps", tourContent) || []).map((step, i) => {
      newTour.addStep("step" + i, {
        title: this.intl.searchAndReplace(selectn("title", step)),
        text: this.intl.searchAndReplace(selectn("text", step)),
        attachTo: selectn("attachTo", step),
        advanceOn: selectn("advanceOn", step),
        showCancelLink: selectn("showCancelLink", step),
      })
    })

    newTour.start()
  }

  _handleNavigationSearchSubmit(e) {
    // If search bar is not visible, this button should show it
    if (this.refs.navigationSearchField._getInputNode().offsetParent === null) {
      this.setState({
        searchBarVisibleInMobile: true,
        searchContextPopoverOpen: false,
      })

      e.preventDefault()
    } else {
      this.setState({
        searchBarVisibleInMobile: false,
        searchContextPopoverOpen: false,
      })

      const searchQueryParam = this.refs.navigationSearchField.getValue()
      const path = "/" + this.props.splitWindowPath.join("/")
      let queryPath = ""

      // Do a global search in either the workspace or section
      if (path.includes("/explore/FV/Workspaces/Data")) {
        queryPath = "/explore/FV/Workspaces/Data"
      } else if (path.includes("/explore/FV/sections/Data")) {
        queryPath = "/explore/FV/sections/Data"
      } else {
        queryPath = "/explore/FV/sections/Data"
      }

      // Do a dialect search
      if (this.props.routeParams.dialect_path && this.state.searchLocal) {
        queryPath = "/explore" + this.props.routeParams.dialect_path
      }

      // Clear out the input field
      this.refs.navigationSearchField.setValue("")

      if (searchQueryParam && searchQueryParam != "") {
        this.props.replaceWindowPath(queryPath + "/search/" + searchQueryParam)
      }
    }
  }

  _handleDisplayLocaleOptions() {
    this.setState({
      localePopoverOpen: true,
    })
  }

  _handleChangeLocale(e, n, v) {
    if (v !== this.intl.locale) {
      this.intl.locale = v
      setTimeout(() => {
        // timeout, such that the select box doesn't freeze in a wierd way (looks bad)
        window.location.reload(true)
      }, 250)
    }
  }

  _handleOpenMenuRequest() {
    // // Only load navigation once
    // if (!this.props.computeLoadNavigation.success) {
    //   console.log('!!!!!!!!!!')
    //   this.props.loadNavigation();
    // }

    this.props.toggleMenuAction("AppLeftNav")
  }

  render() {
    const themePalette = this.props.properties.theme.palette.rawTheme.palette
    const isDialect = this.props.routeParams.hasOwnProperty("dialect_path")
    // const isFrontPage = this.props.frontpage

    const computeCountTotalTasks = ProviderHelpers.getEntry(this.props.computeCountTotalTasks, "count_total_tasks")
    const computePortal = ProviderHelpers.getEntry(
      this.props.computePortal,
      this.props.routeParams.dialect_path + "/Portal"
    )
    const computeDialect = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path)

    const userTaskCount = selectn("response.entries[0].COUNT(ecm:uuid)", computeCountTotalTasks) || 0

    //const guideCount = selectn('response.resultsCount', this.props.computeLoadGuide) || 0;

    const portalLogo = selectn("response.contextParameters.portal.fv-portal:logo", computePortal)
    const portalTitle =
      selectn("response.contextParameters.ancestry.dialect.dc:title", computePortal) ||
      selectn("response.properties.dc:title", computeDialect)

    return (
      <div>
        <AppBar
          title={
            <span className="hidden-xs">
              <img src="assets/images/logo.png" style={{ padding: "0 0 5px 0" }} alt={this.props.properties.title} />
            </span>
          }
          showMenuIconButton={isDialect ? true : true}
          onLeftIconButtonTouchTap={this._handleOpenMenuRequest}
        >
          <ToolbarGroup style={{ position: "relative", color: "#fff" }}>
            <div
              style={{ display: "inline-block", paddingRight: "10px", paddingTop: "15px", textTransform: "uppercase" }}
            >
              <Link className="nav_link" href={"/explore" + this.state.pathOrId + "/Data"}>
                {this.intl.trans("choose_lang", "Choose a Language", "first")}
              </Link>
            </div>

            <Login
              routeParams={this.props.routeParams}
              label={this.intl.translate({
                key: "views.pages.users.login.sign_in",
                default: "Sign In",
                case: "words",
              })}
            />

            <ToolbarSeparator
              className={classNames({ "hidden-xs": this.props.computeLogin.isConnected })}
              style={{ float: "none", marginLeft: 0, marginRight: 0 }}
            />

            <AuthenticationFilter
              login={this.props.computeLogin}
              anon={false}
              routeParams={this.props.routeParams}
              containerStyle={{ display: "inline" }}
            >
              <span>
                <Badge
                  badgeContent={userTaskCount}
                  style={{ top: "8px", left: "-15px", padding: "0 0 12px 12px" }}
                  badgeStyle={{
                    top: "12px",
                    left: "42px",
                    width: "15px",
                    height: "15px",
                    borderRadius: "25%",
                    visibility: userTaskCount == 0 ? "hidden" : "visible",
                  }}
                  primary
                >
                  <IconButton
                    iconStyle={{ fill: "#fff" }}
                    onTouchTap={this._onNavigateRequest.bind(this, "/tasks/")}
                    disabled={userTaskCount == 0 ? true : false}
                  >
                    <NotificationsIcon />
                  </IconButton>
                </Badge>

                {/*<Badge
                  badgeContent={guideCount}
                  style={{top: '8px', left: '-15px', padding: '0 0 12px 12px'}}
                  badgeStyle={{top: '12px',left: '42px', width: '15px', height: '15px', borderRadius: '25%', visibility: (guideCount == 0) ? 'hidden' : 'visible'}}
                  primary={true}
                >
                  <IconButton iconStyle={{fill: '#fff'}} onTouchTap={(e) => this.setState({guidePopoverOpen: !this.state.guidePopoverOpen, guidePopoverAnchorEl: e.target})} disabled={(guideCount == 0) ? true : false}>
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
                                        <td><RaisedButton onTouchTap={this._startTour.bind(this, guide)}
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

            <ToolbarSeparator
              className="search-bar-seperator"
              style={{ float: "none", marginRight: 0, marginLeft: 0 }}
            />

            <div
              style={{ background: themePalette.primary1Color, display: "inline-block" }}
              className={classNames({
                "hidden-xs": !this.state.searchBarVisibleInMobile,
                "search-bar-mobile": this.state.searchBarVisibleInMobile,
              })}
            >
              <TextField
                underlineStyle={{ width: "79%" }}
                style={{
                  marginLeft: this.state.searchBarVisibleInMobile ? "15px" : "30px",
                  fontSize: "15px",
                  height: "38px",
                  backgroundColor: "#fff",
                  paddingLeft: "10px",
                  lineHeight: "1",
                  width: this.state.searchBarVisibleInMobile ? "214px" : "inherit",
                  paddingRight: this.state.searchBarVisibleInMobile ? "0" : "40px",
                }}
                ref="navigationSearchField"
                hintText={this.intl.translate({ key: "general.search", default: "Search", case: "first", append: ":" })}
                onBlur={() => this.setState({ searchContextPopoverOpen: isDialect ? true : false })}
                onFocus={(e) =>
                  this.setState({ searchContextPopoverOpen: true, searchContextPopoverAnchorEl: e.target })
                }
                onEnterKeyDown={this._handleNavigationSearchSubmit}
                name="searchbox"
              />
              <FlatButton
                className={classNames({ hidden: !this.state.searchBarVisibleInMobile })}
                style={{ color: themePalette.alternateTextColor }}
                label={this.intl.translate({ key: "general.cancel", default: "Cancel", case: "first" })}
                onTouchTap={(e) => {
                  this.setState({ searchBarVisibleInMobile: false })
                  e.preventDefault()
                }}
              />
            </div>

            <IconButton
              onTouchTap={this._handleNavigationSearchSubmit}
              iconClassName="material-icons"
              style={{ position: "relative", top: "7px", padding: "0", left: 0 }}
              iconStyle={{ fontSize: "24px", padding: "3px", borderRadius: "20px", color: "#FFFFFF" }}
            >
              search
            </IconButton>

            <Popover
              useLayerForClickAway={false}
              open={this.state.searchContextPopoverOpen}
              anchorEl={this.state.searchContextPopoverAnchorEl}
              style={{
                maxWidth: isDialect ? "320px" : "220px",
                marginTop: "-14px",
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
              anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
              targetOrigin={{ horizontal: "middle", vertical: "top" }}
            >
              <div>
                <img
                  style={{ position: "relative", top: "14px", zIndex: 999999, paddingTop: "14px", left: "80%" }}
                  src="assets/images/popover-arrow.png"
                  alt=""
                />
                {(() => {
                  if (isDialect) {
                    return (
                      <div
                        style={{
                          marginBottom: 0,
                          padding: "10px 10px 1px 10px",
                          backgroundColor: "#fff",
                          fontSize: "0.95em",
                        }}
                      >
                        <p style={{ padding: 0 }}>
                          {this.intl.translate({
                            key: "general.select_search_option",
                            default: "Select Search Option",
                            case: "words",
                          })}
                        </p>
                        <div>
                          <RadioButtonGroup
                            onChange={() => this.setState({ searchLocal: !this.state.searchLocal })}
                            name="searchTarget"
                            defaultSelected="local"
                          >
                            <RadioButton
                              value={this.intl.translate({
                                key: "general.all",
                                default: "all",
                                case: "lower",
                              })}
                              label={
                                <span style={{ fontWeight: "400" }}>
                                  FirstVoices.com <br />{" "}
                                  <span
                                    style={{
                                      fontWeight: "300",
                                      color: "#959595",
                                    }}
                                  >
                                    {this.intl.translate({
                                      key: "views.components.navigation.all_languages_and_words",
                                      default: "All languages & words",
                                      case: "words",
                                      append: ".",
                                    })}
                                  </span>
                                </span>
                              }
                            />
                            <RadioButton
                              value="local"
                              label={
                                <span style={{ fontWeight: "400" }}>
                                  {portalTitle ||
                                    this.intl.translate({
                                      key: "views.components.navigation.this_dialect",
                                      default: "This Dialect",
                                      case: "words",
                                    })}
                                  <br />{" "}
                                  <span
                                    style={{
                                      fontWeight: "300",
                                      color: "#959595",
                                    }}
                                  >
                                    {this.intl.translate({
                                      key: "general.words",
                                      default: "Words",
                                      case: "first",
                                    })}
                                    ,{" "}
                                    {this.intl.translate({
                                      key: "general.phrases",
                                      default: "Phrases",
                                      case: "first",
                                    })}
                                    ,{" "}
                                    {this.intl.translate({
                                      key: "general.songs_and_stories",
                                      default: "Songs &amp; Stories",
                                      case: "words",
                                      append: ".",
                                    })}
                                  </span>
                                </span>
                              }
                            />
                          </RadioButtonGroup>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div style={{ marginBottom: 0, padding: "10px 10px 1px 10px", backgroundColor: "#fff" }}>
                      <p style={{ padding: 0 }}>
                        {this.intl.translate({
                          key: "views.components.navigation.search_all",
                          default: "Search all languages & words at FirstVoices.com",
                          case: "first",
                        })}
                      </p>
                    </div>
                  )
                })()}
              </div>
            </Popover>

            <ToolbarSeparator className="locale-seperator" style={{ float: "none", marginRight: 0, marginLeft: 0 }} />

            <IconButton
              onTouchTap={this._handleDisplayLocaleOptions}
              iconClassName="material-icons"
              style={{ position: "relative", top: "7px", padding: "0", left: 0 }}
              iconStyle={{ fontSize: "24px", padding: "3px", borderRadius: "20px", color: "#FFFFFF" }}
            >
              settings
            </IconButton>
          </ToolbarGroup>
        </AppBar>

        <Toolbar style={{ display: this.state.localePopoverOpen ? "block" : "none" }}>
          <ToolbarGroup firstChild float="right">
            <ToolbarTitle
              style={{ color: "#fff", padding: "0 0 0 15px", fontSize: "15px" }}
              text={this.intl.trans("choose_lang", "Choose a Language", "first")}
            />
            <DropDownMenu value={this.intl.locale} onChange={this._handleChangeLocale} labelStyle={{ color: "#fff" }}>
              <MenuItem value="en" primaryText="English" />
              <MenuItem value="fr" primaryText="Français" />
              {/*<MenuItem value="sp" primaryText="Español" />*/}
            </DropDownMenu>
          </ToolbarGroup>
        </Toolbar>

        <AppLeftNav
          menu={{ main: true }}
          open={false}
          //onRequestChangeLeftNav={this.handleChangeRequestLeftNav}
          //onRequestChangeList={this.handleRequestChangeList}
          docked={false}
        />

        {isDialect && (
          <div className="row" style={{ backgroundColor: themePalette.primary2Color, minHeight: "64px", margin: "0" }}>
            <h2 className="NavigationDialectHeader">
              <a
                className="NavigationDialectLink"
                onTouchTap={this._onNavigateRequest.bind(this, "/explore" + this.props.routeParams.dialect_path)}
              >
                <Avatar src={UIHelpers.getThumbnail(portalLogo, "Thumbnail")} size={50} />
                <span className="NavigationDialectName fontAboriginalSans">
                  {this.intl.searchAndReplace(portalTitle)}
                </span>
              </a>
            </h2>
          </div>
        )}
      </div>
    )
  }
}
