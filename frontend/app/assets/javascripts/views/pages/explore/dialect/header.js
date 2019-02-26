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
import React, { Component, PropTypes } from 'react'

import ConfGlobal from 'conf/local.json'
import selectn from 'selectn'
import classNames from 'classnames'

import FlatButton from 'material-ui/lib/flat-button'
import FontIcon from 'material-ui/lib/font-icon'

import PageStats from 'views/pages/explore/dialect/page-stats'

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter'
import AuthenticationFilter from 'views/components/Document/AuthenticationFilter'

import { EditableComponentHelper } from 'views/components/Editor/EditableComponent'

import IntlService from 'views/services/intl'

const intl = IntlService.instance

/**
 * Header for dialect pages
 */
export default class Header extends Component {
  static propTypes = {
    backgroundImage: PropTypes.string,
    portal: PropTypes.object,
    dialect: PropTypes.object,
    login: PropTypes.object,
    showStats: PropTypes.bool,
    routeParams: PropTypes.object,
  }

  static defaultProps = {
    showStats: false,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      showArchiveInfoMobile: false,
    }
  }

  render() {
    const { portal, login, dialect, routeParams, showStats } = this.props

    const backgroundImage = selectn(
      'response.contextParameters.portal.fv-portal:background_top_image.path',
      portal.compute
    )

    let portalBackgroundImagePath = 'assets/images/cover.png'

    if (backgroundImage && backgroundImage.length > 0) {
      portalBackgroundImagePath = ConfGlobal.baseURL + backgroundImage
    }

    const portalBackgroundStyles = {
      position: 'relative',
      minHeight: '400px',
      backgroundColor: 'transparent',
      backgroundSize: 'cover',
      backgroundImage: 'url("' + portalBackgroundImagePath + '")',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }

    const isSection = routeParams.area === 'sections'

    return (
      <div className="Header row" style={portalBackgroundStyles}>
        <div style={{ position: 'absolute', bottom: '80px', right: 0, width: '442px' }}>
          <div className={classNames('dialect-info-banner')}>
            <div className={classNames('dib-header', 'visible-xs')}>
              <FlatButton
                label={
                  this.state.showArchiveInfoMobile
                    ? intl.trans('info', 'Info', 'first')
                    : intl.trans('info', 'Info', 'first')
                }
                labelPosition="before"
                onTouchTap={(e) => {
                  this.setState({ showArchiveInfoMobile: !this.state.showArchiveInfoMobile })
                  e.preventDefault()
                }}
                icon={
                  <FontIcon className="material-icons">
                    {this.state.showArchiveInfoMobile ? 'info_outline' : 'info'}
                  </FontIcon>
                }
                style={{ float: 'right', lineHeight: 1 }}
              />
            </div>

            <div
              className={classNames('dib-body', { 'hidden-xs': !this.state.showArchiveInfoMobile })}
              style={{ zIndex: this.state.showArchiveInfoMobile ? 99 : 0 }}
            >
              <div className="dib-body-row">
                <strong>{intl.trans('name_of_archive', 'Name of Archive')}: </strong>
                <AuthorizationFilter
                  filter={{ permission: 'Write', entity: selectn('response', dialect.compute) }}
                  renderPartial
                >
                  <EditableComponentHelper
                    isSection={isSection}
                    computeEntity={dialect.compute}
                    updateEntity={dialect.update}
                    property="dc:title"
                    entity={selectn('response', dialect.compute)}
                  />
                </AuthorizationFilter>
              </div>
              <div className="dib-body-row">
                <strong>{intl.trans('country', 'Country')}: </strong>
                <AuthorizationFilter
                  filter={{ permission: 'Write', entity: selectn('response', dialect.compute) }}
                  renderPartial
                >
                  <EditableComponentHelper
                    isSection={isSection}
                    computeEntity={dialect.compute}
                    updateEntity={dialect.update}
                    property="fvdialect:country"
                    entity={selectn('response', dialect.compute)}
                  />
                </AuthorizationFilter>
              </div>
              <div className="dib-body-row">
                <strong>{intl.trans('region', 'Region', 'first')}: </strong>
                <AuthorizationFilter
                  filter={{ permission: 'Write', entity: selectn('response', dialect.compute) }}
                  renderPartial
                >
                  <EditableComponentHelper
                    isSection={isSection}
                    computeEntity={dialect.compute}
                    updateEntity={dialect.update}
                    property="fvdialect:region"
                    entity={selectn('response', dialect.compute)}
                  />
                </AuthorizationFilter>
              </div>
            </div>
          </div>
        </div>

        <AuthenticationFilter login={login} hideFromSections routeParams={routeParams}>
          <div
            className={classNames('hidden-xs', { invisible: !showStats })}
            style={{
              width: '50%',
              background: 'rgba(255, 255, 255, 0.7)',
              margin: '10px 25px',
              borderRadius: '10px',
              padding: '10px',
              position: 'absolute',
              top: '15px',
              right: '0',
            }}
          >
            <PageStats dialectPath={routeParams.dialect_path} />
          </div>
        </AuthenticationFilter>

        {this.props.children}
      </div>
    )
  }
}
