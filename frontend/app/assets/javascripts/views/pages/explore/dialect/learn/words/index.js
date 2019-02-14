/* Copyright 2016 First People's Cultural Council

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
import Immutable, { Set, Map } from 'immutable'

import classNames from 'classnames'
import { isMobile } from 'react-device-detect'
import provide from 'react-redux-provide'
import selectn from 'selectn'

import GridTile from 'material-ui/lib/grid-list/grid-tile'
import RaisedButton from 'material-ui/lib/raised-button'

import ProviderHelpers from 'common/ProviderHelpers'

import { SearchDialect } from 'views/components/SearchDialect'
import {
  SEARCH_SORT_DEFAULT,
  SEARCH_BY_DEFAULT,
  SEARCH_BY_ALPHABET,
  SEARCH_BY_CATEGORY,
} from 'views/components/SearchDialect/constants'
// import AlphabetListView from 'views/pages/explore/dialect/learn/alphabet/list-view'
// import AlphabetListView from 'views/components/AlphabetListView'
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter'
import DialectCategoryList from 'views/components/DialectCategoryList'
import IntlService from 'views/services/intl'
import PromiseWrapper from 'views/components/Document/PromiseWrapper'
import { getDialectClassname } from 'views/pages/explore/dialect/helpers'
import PageDialectLearnBase from 'views/pages/explore/dialect/learn/base'
import WordListView from 'views/pages/explore/dialect/learn/words/list-view'
import NavigationHelpers from 'common/NavigationHelpers'
import { AlphabetListView } from '../../../../../components/AlphabetListView'
// import ExportDialect from 'views/components/ExportDialect'

const intl = IntlService.instance

/**
 * Learn words
 */
// class AlphabetGridTile extends Component {
//   static defaultProps = {
//     action: () => {},
//   }
//   static propTypes = {
//     action: PropTypes.func,
//     tile: PropTypes.any, // TODO: set appropriate propType
//   }
//   constructor(props) {
//     super(props)
//     const { tile } = this.props
//     this.state = {
//       char: selectn('properties.dc:title', tile),
//       uid: selectn('uid', tile),
//     }
//     ;['_handleClick'].forEach((method) => (this[method] = this[method].bind(this)))
//   }
//   render() {
//     const { char, uid } = this.state
//     return (
//       <GridTile
//         key={uid}
//         className="AlphabetGridTile"
//         style={{
//           height: 'initial',
//         }}
//       >
//         <a onClick={this._handleClick} className="AlphabetGridTileLink">
//           {char}
//         </a>
//       </GridTile>
//     )
//   }
//   _handleClick() {
//     const { char } = this.state

//     this.props.action(char, 'startsWith', (letter) => {
//       const query = ` AND dc:title LIKE '${letter}%'`
//       return query
//     })
//   }
// }

@provide
export default class PageDialectLearnWords extends PageDialectLearnBase {
  static propTypes = {
    computeCategories: PropTypes.object.isRequired,
    computeDocument: PropTypes.object.isRequired,
    computeLogin: PropTypes.object.isRequired,
    computePortal: PropTypes.object.isRequired,
    fetchCategories: PropTypes.func.isRequired,
    fetchDocument: PropTypes.func.isRequired,
    fetchPortal: PropTypes.func.isRequired,
    hasPagination: PropTypes.bool,
    overrideBreadcrumbs: PropTypes.func.isRequired,
    properties: PropTypes.object.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    replaceWindowPath: PropTypes.func.isRequired,
    routeParams: PropTypes.object.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    updatePageProperties: PropTypes.func.isRequired,
    windowPath: PropTypes.string.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    let filterInfo = this._initialFilterInfo()

    // If no filters are applied via URL, use props
    if (filterInfo.get('currentCategoryFilterIds').isEmpty()) {
      const pagePropertiesFilterInfo = selectn([[this._getPageKey()], 'filterInfo'], props.properties.pageProperties)
      if (pagePropertiesFilterInfo) {
        filterInfo = pagePropertiesFilterInfo
      }
    }

    const computeEntities = Immutable.fromJS([
      {
        id: props.routeParams.dialect_path,
        entity: props.computePortal,
      },
      {
        id: `${props.routeParams.dialect_path}/Dictionary`,
        entity: props.computeDocument,
      },
      {
        id: `/api/v1/path/FV/${props.routeParams.area}/SharedData/Shared Categories/@children`,
        entity: props.computeCategories,
      },
    ])

    this.state = {
      filterInfo,
      searchTerm: '',
      searchByAlphabet: '',
      searchByMode: SEARCH_BY_DEFAULT,
      searchingCategory: undefined,
      searchByDefinitions: true,
      searchByTitle: true,
      searchByTranslations: false,
      searchNxqlQuery: '',
      searchNxqlSort: {},
      searchPartOfSpeech: SEARCH_SORT_DEFAULT,
      computeEntities,
      isKidsTheme: props.routeParams.theme === 'kids',
      clickedFilterByCategory: false,
    }

    // Bind methods to 'this'
    ;[
      'changeFilter',
      'clearCategoryFilter',
      'handleAlphabetClick',
      'handleCategoryClick',
      'handleSearch',
      'resetSearch',
      'updateState',
      '_getPageKey',
      '_initialFilterInfo',
      'handleDialectCategoryList', // NOTE: Comes from PageDialectLearnBase
      '_getURLPageProps', // NOTE: Comes from PageDialectLearnBase
      '_handleFacetSelected', // NOTE: Comes from PageDialectLearnBase
      '_handleFilterChange', // NOTE: Comes from PageDialectLearnBase
      '_handlePagePropertiesChange', // NOTE: Comes from PageDialectLearnBase
      '_onNavigateRequest', // NOTE: Comes from PageDialectLearnBase
      '_resetURLPagination', // NOTE: Comes from PageDialectLearnBase
    ].forEach((method) => (this[method] = this[method].bind(this)))
  }

  render() {
    const {
      computeEntities,
      filterInfo,
      isKidsTheme,
      searchNxqlSort,
      searchByMode,
      searchByAlphabet,
      searchingCategory,
      searchByDefinitions,
      searchByTitle,
      searchByTranslations,
      searchTerm,
      searchPartOfSpeech,
    } = this.state
    const { routeParams } = this.props
    const computeDocument = ProviderHelpers.getEntry(
      this.props.computeDocument,
      `${routeParams.dialect_path}/Dictionary`
    )

    const computePortal = ProviderHelpers.getEntry(this.props.computePortal, `${routeParams.dialect_path}/Portal`)

    const computeCategories = ProviderHelpers.getEntry(
      this.props.computeCategories,
      `/api/v1/path/FV/${routeParams.area}/SharedData/Shared Categories/@children`
    )
    const computeCategoriesSize = selectn('response.entries.length', computeCategories) || 0

    const wordListView = selectn('response.uid', computeDocument) ? (
      <WordListView
        disableWordClick={false}
        controlViaURL
        DEFAULT_PAGE_SIZE={10}
        filter={filterInfo}
        onPaginationReset={this._resetURLPagination}
        onPagePropertiesChange={this._handlePagePropertiesChange}
        parentID={selectn('response.uid', computeDocument)}
        renderSimpleTable
        routeParams={this.props.routeParams}
        // NOTE: PageDialectLearnBase provides `_getURLPageProps`
        {...this._getURLPageProps()}
        {...searchNxqlSort}
        // DEFAULT_PAGE
        // DEFAULT_PAGE_SIZE
        // DEFAULT_SORT_TYPE
        // DEFAULT_SORT_COL
      />
    ) : (
      <div />
    )

    // Render kids or mobile view
    if (isKidsTheme || isMobile) {
      const pageSize = !isKidsTheme && isMobile ? 10 : 8
      const kidsFilter = filterInfo.setIn(['currentAppliedFilter', 'kids'], ' AND fv:available_in_childrens_archive=1')

      return (
        <PromiseWrapper renderOnError computeEntities={computeEntities}>
          <div className="row" style={{ marginTop: '15px' }}>
            <div className={classNames('col-xs-12', 'col-md-8', 'col-md-offset-2')}>
              {React.cloneElement(wordListView, {
                DEFAULT_PAGE_SIZE: pageSize,
                disablePageSize: true,
                filter: kidsFilter,
                gridListView: true,
              })}
            </div>
          </div>
        </PromiseWrapper>
      )
    }

    const dialectClassName = getDialectClassname(computeDocument)
    // const browseAlphabetically = React.cloneElement(
    //   <AlphabetListView
    //     pagination={false}
    //     routeParams={this.props.routeParams}
    //     dialect={selectn('response', computePortal)}
    //   />,
    //   {
    //     className: dialectClassName,
    //     gridListView: true,
    //     gridViewProps: {
    //       cols: 10,
    //       cellHeight: 25,
    //       action: this.handleAlphabetClick,
    //       style: { overflowY: 'hidden', padding: '10px' },
    //     },
    //     gridListTile: AlphabetGridTile,
    //   }
    // )
    // Note: Following for <ExportDialect>
    // const fvaDialectId = selectn('response.properties.fva:dialect', computeDocument)
    return (
      <PromiseWrapper renderOnError computeEntities={computeEntities}>
        <div className={classNames('row', 'row-create-wrapper')}>
          <div className={classNames('col-xs-12', 'col-md-4', 'col-md-offset-8', 'text-right')}>
            <AuthorizationFilter
              filter={{
                entity: selectn('response', computeDocument),
                login: this.props.computeLogin,
                role: ['Record', 'Approve', 'Everything'],
              }}
              hideFromSections
              routeParams={this.props.routeParams}
            >
              <RaisedButton
                label={intl.trans(
                  'views.pages.explore.dialect.learn.words.create_new_word',
                  'Create New Word',
                  'words'
                )}
                onTouchTap={this._onNavigateRequest.bind(this, 'create')}
                primary
              />
            </AuthorizationFilter>
          </div>
        </div>
        <div className="row">
          <div
            className={classNames('col-xs-12', 'col-md-3', computeCategoriesSize === 0 ? 'hidden' : null, 'PrintHide')}
          >
            <div>
              {/* <ExportDialect dialectId={fvaDialectId} /> */}


              <AlphabetListView
                dialect={selectn('response', computePortal)}
                handleClick={this.handleAlphabetClick}
                routeParams={this.props.routeParams}
                letter={this.state.searchByAlphabet}
              />


              <DialectCategoryList
                // title={intl.trans('categories', 'Categories', 'first')}
                title={intl.trans(
                  'views.pages.explore.dialect.learn.words.find_by_category',
                  'Filter by Category',
                  'words'
                )}
                appliedFilterIds={filterInfo.get('currentCategoryFilterIds')}
                facetField={ProviderHelpers.switchWorkspaceSectionKeys(
                  'fv-word:categories',
                  this.props.routeParams.area
                )}
                handleCategoryClick={this.handleCategoryClick}
                handleDialectCategoryList={this.handleDialectCategoryList} // NOTE: Comes from PageDialectLearnBase
                facets={selectn('response.entries', computeCategories) || []}
                clearCategoryFilter={this.clearCategoryFilter}
              />
            </div>
          </div>
          <div className={classNames('col-xs-12', computeCategoriesSize === 0 ? 'col-md-12' : 'col-md-9')}>
            <h1>
              {`${selectn('response.contextParameters.ancestry.dialect.dc:title', computePortal) || ''} ${intl.trans(
                'words',
                'Words',
                'first'
              )}`}
            </h1>

            <SearchDialect
              filterInfo={filterInfo}
              handleSearch={this.handleSearch}
              resetSearch={this.resetSearch}
              searchByMode={searchByMode}
              searchByAlphabet={searchByAlphabet}
              searchingCategory={searchingCategory}
              searchByTitle={searchByTitle}
              searchByDefinitions={searchByDefinitions}
              searchByTranslations={searchByTranslations}
              searchPartOfSpeech={searchPartOfSpeech}
              searchTerm={searchTerm}
              updateAncestorState={this.updateState}
            />

            <div className={dialectClassName}>{wordListView}</div>
          </div>
        </div>
      </PromiseWrapper>
    )
  }
  // END render
  clearCategoryFilter() {
    this.setState({ filterInfo: this._initialFilterInfo() })
  }

  _initialFilterInfo = () => {
    const routeParamsCategory = this.props.routeParams.category
    const initialCategories = routeParamsCategory ? new Set([routeParamsCategory]) : new Set()
    const currentAppliedFilterCategoriesParam1 = ProviderHelpers.switchWorkspaceSectionKeys(
      'fv-word:categories',
      this.props.routeParams.area
    )
    const currentAppliedFilterCategories = routeParamsCategory
      ? ` AND ${currentAppliedFilterCategoriesParam1}/* IN ("${routeParamsCategory}")`
      : ''

    return new Map({
      currentCategoryFilterIds: initialCategories,
      currentAppliedFilter: new Map({
        categories: currentAppliedFilterCategories,
      }),
    })
  }

  handleSearch() {
    this.changeFilter()
  }

  resetSearch() {
    let newFilter = this.state.filterInfo
    newFilter = newFilter.deleteIn(['currentAppliedFilter', 'categories'], null)
    newFilter = newFilter.deleteIn(['currentAppliedFilter', 'contains'], null)
    newFilter = newFilter.deleteIn(['currentAppliedFilter', 'startsWith'], null)
    newFilter = newFilter.deleteIn(['currentAppliedFiltersDesc', 'categories'], null)
    newFilter = newFilter.deleteIn(['currentAppliedFiltersDesc', 'contains'], null)
    newFilter = newFilter.deleteIn(['currentAppliedFiltersDesc', 'startsWith'], null)

    newFilter = newFilter.set('currentCategoryFilterIds', new Set())

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination()
    this.setState({
      filterInfo: newFilter,
      // searchNxqlSort: 'fv:custom_order',
      searchNxqlSort: 'dc:title',
    })
  }

  updateState(stateObj) {
    this.setState(stateObj)
  }

  // NOTE: PageDialectLearnBase calls `fetchData`
  fetchData(newProps) {
    /*
    ProviderHelpers.fetchIfMissing(
      newProps.routeParams.dialect_path + '/Portal', // key
      newProps.fetchPortal, // action
      newProps.computePortal // reducer
    )
    ProviderHelpers.fetchIfMissing(
      newProps.routeParams.dialect_path + '/Dictionary', // key
      newProps.fetchDocument, // action
      newProps.computeDocument
    )
    ProviderHelpers.fetchIfMissing(
      '/api/v1/path/FV/' + newProps.routeParams.area + '/SharedData/Shared Categories/@children', // key
      newProps.fetchCategories, // action
      newProps.computeCategories
    )
    */

    // action(key);
    newProps.fetchPortal(newProps.routeParams.dialect_path + '/Portal')
    newProps.fetchDocument(newProps.routeParams.dialect_path + '/Dictionary')
    newProps.fetchCategories('/api/v1/path/FV/' + newProps.routeParams.area + '/SharedData/Shared Categories/@children')
  }

  changeFilter(href) {
    const { searchByMode, searchNxqlQuery } = this.state
    let searchType
    let newFilter = this.state.filterInfo

    switch (searchByMode) {
      case SEARCH_BY_ALPHABET: {
        searchType = 'startsWith'

        // Remove other settings
        newFilter = newFilter.deleteIn(['currentAppliedFilter', 'contains'], null)
        newFilter = newFilter.deleteIn(['currentAppliedFilter', 'categories'], null)
        newFilter = newFilter.set('currentCategoryFilterIds', new Set())
        break
      }
      case SEARCH_BY_CATEGORY: {
        searchType = 'categories'

        // Remove other settings
        newFilter = newFilter.deleteIn(['currentAppliedFilter', 'contains'], null)
        newFilter = newFilter.deleteIn(['currentAppliedFilter', 'startsWith'], null)
        break
      }
      default: {
        searchType = 'contains'

        // Remove other settings
        newFilter = newFilter.deleteIn(['currentAppliedFilter', 'startsWith'], null)
        newFilter = newFilter.deleteIn(['currentAppliedFilter', 'categories'], null)
        newFilter = newFilter.set('currentCategoryFilterIds', new Set())
      }
    }

    // Add new search query
    newFilter = newFilter.updateIn(['currentAppliedFilter', searchType], () => ` AND ${searchNxqlQuery}`)
    // NOTE: data-list-view triggers call to fetch new data but only if currentAppliedFilter is different
    // than the last version, hence the following hack...
    // newFilter = newFilter.updateIn(['currentAppliedFilter', `force${Math.random()}`], () => '')

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination()
    this.setState({ filterInfo: newFilter })

    // See about updating url
    if (href) {
      NavigationHelpers.navigate(href, this.props.pushWindowPath, false)
    }
  }

  handleAlphabetClick(letter) {
    this.setState(
      {
        searchTerm: '',
        searchByAlphabet: letter,
        searchByMode: SEARCH_BY_ALPHABET,
        searchByTitle: true,
        searchByDefinitions: false,
        searchByTranslations: false,
        searchPartOfSpeech: SEARCH_SORT_DEFAULT,
      },
      () => {
        let href = undefined
        const _splitWindowPath = [...this.props.splitWindowPath]
        const wordOrPhraseIndex = _splitWindowPath.findIndex((element) => {
          return element === 'words' || element === 'phrases'
        })
        if (wordOrPhraseIndex !== -1) {
          _splitWindowPath.splice(wordOrPhraseIndex + 1)
          href = `/${_splitWindowPath.join('/')}`
        }
        this.changeFilter(href)
      }
    )
  }

  handleCategoryClick(obj) {
    const { facetField, selected, unselected, href } = obj

    this.setState(
      {
        searchTerm: '',
        searchByAlphabet: '',
        searchByMode: SEARCH_BY_CATEGORY,
        searchingCategory: selected.checkedFacetUid,
        searchByTitle: true,
        searchByDefinitions: false,
        searchByTranslations: false,
        searchPartOfSpeech: SEARCH_SORT_DEFAULT,
      },
      () => {
        this.changeFilter(href)

        this.handleDialectCategoryList(facetField, selected, unselected)
      }
    )
  }

  _getPageKey() {
    return `${this.props.routeParams.area}_${this.props.routeParams.dialect_name}_learn_words`
  }
}
