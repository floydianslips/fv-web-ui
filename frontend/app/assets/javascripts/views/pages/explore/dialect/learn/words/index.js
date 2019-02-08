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
import React, { Component, PropTypes } from "react"
import Immutable, { Set, Map } from "immutable"

import classNames from "classnames"
import { isMobile } from "react-device-detect"
import provide from "react-redux-provide"
import selectn from "selectn"

import GridTile from "material-ui/lib/grid-list/grid-tile"
import RaisedButton from "material-ui/lib/raised-button"

import ProviderHelpers from "common/ProviderHelpers"

import { SearchDialect } from "views/components/SearchDialect"
import { SEARCH_SORT_DEFAULT } from "views/components/SearchDialect/constants"
import AlphabetListView from "views/pages/explore/dialect/learn/alphabet/list-view"
import AuthorizationFilter from "views/components/Document/AuthorizationFilter"
import DialectCategoryList from "views/components/DialectCategoryList"
import IntlService from "views/services/intl"
import PromiseWrapper from "views/components/Document/PromiseWrapper"
import { getDialectClassname } from "views/pages/explore/dialect/helpers"
import PageDialectLearnBase from "views/pages/explore/dialect/learn/base"
import WordListView from "views/pages/explore/dialect/learn/words/list-view"

// import ExportDialect from 'views/components/ExportDialect'

const intl = IntlService.instance

/**
 * Learn words
 */
class AlphabetGridTile extends Component {
  static defaultProps = {
    action: () => {},
  }
  static propTypes = {
    action: PropTypes.func,
    tile: PropTypes.any, // TODO: set appropriate propType
  }
  constructor(props) {
    super(props)
    const { tile } = this.props
    this.state = {
      char: selectn("properties.dc:title", tile),
      uid: selectn("uid", tile),
    }
    ;["_handleClick"].forEach((method) => (this[method] = this[method].bind(this)))
  }
  render() {
    const { char, uid } = this.state
    return (
      <GridTile
        key={uid}
        className="AlphabetGridTile"
        style={{
          height: "initial",
        }}
      >
        <a onClick={this._handleClick} className="AlphabetGridTileLink">
          {char}
        </a>
      </GridTile>
    )
  }
  _handleClick() {
    const { char } = this.state

    this.props.action(char, "startsWith", (letter) => {
      const query = ` AND dc:title LIKE '${letter}%'`
      return query
    })
  }
}

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
    if (filterInfo.get("currentCategoryFilterIds").isEmpty()) {
      const pagePropertiesFilterInfo = selectn([[this._getPageKey()], "filterInfo"], props.properties.pageProperties)
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
      searchTerm: "",
      searchByAlphabet: false,
      searchByDefinitions: true,
      searchByTitle: true,
      searchByTranslations: false,
      searchNxqlQuery: "",
      searchNxqlSort: {},
      searchPartOfSpeech: SEARCH_SORT_DEFAULT,
      computeEntities,
      isKidsTheme: props.routeParams.theme === "kids",
      clickedFilterByCategory: false,
    }

    // Bind methods to 'this'
    ;[
      "clearCategoryFilter",
      "handleSearch",
      "resetSearch",
      "updateState",
      "_changeFilter",
      "_getPageKey",
      "_handleAlphabetClick",
      "_handleFacetSelected", // NOTE: Comes from PageDialectLearnBase
      "_initialFilterInfo",
      "_getURLPageProps", // NOTE: Comes from PageDialectLearnBase
      "_handleFilterChange", // NOTE: Comes from PageDialectLearnBase
      "_handlePagePropertiesChange", // NOTE: Comes from PageDialectLearnBase
      "_onNavigateRequest", // NOTE: Comes from PageDialectLearnBase
      "_resetURLPagination", // NOTE: Comes from PageDialectLearnBase
    ].forEach((method) => (this[method] = this[method].bind(this)))
  }

  render() {
    const {
      computeEntities,
      filterInfo,
      isKidsTheme,
      searchNxqlSort,
      searchByAlphabet,
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
    const computeCategoriesSize = selectn("response.entries.length", computeCategories) || 0

    const wordListView = selectn("response.uid", computeDocument) ? (
      <WordListView
        disableWordClick={false}
        controlViaURL
        DEFAULT_PAGE_SIZE={10}
        filter={filterInfo}
        onPaginationReset={this._resetURLPagination}
        onPagePropertiesChange={this._handlePagePropertiesChange}
        parentID={selectn("response.uid", computeDocument)}
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
      const kidsFilter = filterInfo.setIn(["currentAppliedFilter", "kids"], " AND fv:available_in_childrens_archive=1")

      return (
        <PromiseWrapper renderOnError computeEntities={computeEntities}>
          <div className="row" style={{ marginTop: "15px" }}>
            <div className={classNames("col-xs-12", "col-md-8", "col-md-offset-2")}>
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
    const browseAlphabetically = React.cloneElement(
      <AlphabetListView
        pagination={false}
        routeParams={this.props.routeParams}
        dialect={selectn("response", computePortal)}
      />,
      {
        className: dialectClassName,
        gridListView: true,
        gridViewProps: {
          cols: 10,
          cellHeight: 25,
          action: this._handleAlphabetClick,
          style: { overflowY: "hidden", padding: "10px" },
        },
        gridListTile: AlphabetGridTile,
      }
    )
    // For <ExportDialect>
    // const fvaDialectId = selectn('response.properties.fva:dialect', computeDocument)
    return (
      <PromiseWrapper renderOnError computeEntities={computeEntities}>
        <div className={classNames("row", "row-create-wrapper")}>
          <div className={classNames("col-xs-12", "col-md-4", "col-md-offset-8", "text-right")}>
            <AuthorizationFilter
              filter={{
                entity: selectn("response", computeDocument),
                login: this.props.computeLogin,
                role: ["Record", "Approve", "Everything"],
              }}
              hideFromSections
              routeParams={this.props.routeParams}
            >
              <RaisedButton
                label={intl.trans(
                  "views.pages.explore.dialect.learn.words.create_new_word",
                  "Create New Word",
                  "words"
                )}
                onTouchTap={this._onNavigateRequest.bind(this, "create")}
                primary
              />
            </AuthorizationFilter>
          </div>
        </div>
        <div className="row">
          <div
            className={classNames("col-xs-12", "col-md-3", computeCategoriesSize === 0 ? "hidden" : null, "PrintHide")}
          >
            <div>
              <h2>Words</h2>
              {/* <ExportDialect dialectId={fvaDialectId} /> */}
              <DialectCategoryList
                // title={intl.trans('categories', 'Categories', 'first')}
                title={intl.trans(
                  "views.pages.explore.dialect.learn.words.find_by_category",
                  "Filter by Category",
                  "words"
                )}
                appliedFilterIds={filterInfo.get("currentCategoryFilterIds")}
                facetField={ProviderHelpers.switchWorkspaceSectionKeys(
                  "fv-word:categories",
                  this.props.routeParams.area
                )}
                onFacetSelected={this._handleFacetSelected} // NOTE: Comes from PageDialectLearnBase
                facets={selectn("response.entries", computeCategories) || []}
                clearCategoryFilter={this.clearCategoryFilter}
              />

              <div style={{ clear: "both" }}>
                <h2>
                  {intl.trans(
                    "views.pages.explore.dialect.learn.words.find_by_alphabet",
                    "Browse Alphabetically",
                    "words"
                  )}
                </h2>
                {browseAlphabetically}
              </div>
            </div>
            {/*
            <hr />
            <div>
            <h3>More in {selectn('response.contextParameters.ancestry.dialect.dc:title', computePortal)}</h3>

            <ul>
            <li>Browse Words</li>
            <li>Browse Phrases</li>
            <li>Browse Songs</li>
            <li>Browse Stories</li>
            <li>View Alphabet</li>
            <li>View Portal Page</li>
            <li>View Language Page</li>
            </ul>
            </div>
            */}
          </div>
          <div className={classNames("col-xs-12", computeCategoriesSize === 0 ? "col-md-12" : "col-md-9")}>
            <h1>
              {`${selectn("response.contextParameters.ancestry.dialect.dc:title", computePortal) || ""} ${intl.trans(
                "words",
                "Words",
                "first"
              )}`}
            </h1>

            <SearchDialect
              filterInfo={filterInfo}
              handleSearch={this.handleSearch}
              resetSearch={this.resetSearch}
              searchByAlphabet={searchByAlphabet}
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
      "fv-word:categories",
      this.props.routeParams.area
    )
    const currentAppliedFilterCategories = routeParamsCategory
      ? ` AND ${currentAppliedFilterCategoriesParam1}/* IN ("${routeParamsCategory}")`
      : ""

    return new Map({
      currentCategoryFilterIds: initialCategories,
      currentAppliedFilter: new Map({
        categories: currentAppliedFilterCategories,
      }),
    })
  }

  handleSearch() {
    this._changeFilter()
  }

  resetSearch() {
    let newFilter = this.state.filterInfo
    newFilter = newFilter.deleteIn(["currentAppliedFilter", "categories"], null)
    newFilter = newFilter.deleteIn(["currentAppliedFilter", "contains"], null)
    newFilter = newFilter.deleteIn(["currentAppliedFilter", "startsWith"], null)
    newFilter = newFilter.deleteIn(["currentAppliedFiltersDesc", "categories"], null)
    newFilter = newFilter.deleteIn(["currentAppliedFiltersDesc", "contains"], null)
    newFilter = newFilter.deleteIn(["currentAppliedFiltersDesc", "startsWith"], null)

    newFilter = newFilter.set("currentCategoryFilterIds", new Set())

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination()
    this.setState({
      filterInfo: newFilter,
      searchNxqlSort: "fv:custom_order",
    })
  }

  updateState(stateObj) {
    this.setState(stateObj)
  }

  // NOTE: PageDialectLearnBase calls `fetchData`
  fetchData(newProps) {
    ProviderHelpers.fetchIfMissing(
      newProps.routeParams.dialect_path + "/Portal",
      newProps.fetchPortal,
      newProps.computePortal
    )
    ProviderHelpers.fetchIfMissing(
      newProps.routeParams.dialect_path + "/Dictionary",
      newProps.fetchDocument,
      newProps.computeDocument
    )
    ProviderHelpers.fetchIfMissing(
      "/api/v1/path/FV/" + newProps.routeParams.area + "/SharedData/Shared Categories/@children",
      newProps.fetchCategories,
      newProps.computeCategories
    )
  }

  _changeFilter() {
    const { searchByAlphabet, searchTerm, searchNxqlQuery } = this.state
    const _searchType = searchByAlphabet ? "startsWith" : "contains"

    let newFilter = this.state.filterInfo

    // Prune old settings
    if (searchByAlphabet) {
      newFilter = newFilter.deleteIn(["currentAppliedFilter", "contains"], null)
      // newFilter = newFilter.deleteIn(['currentAppliedFilter', 'categories'], null)

      newFilter = newFilter.deleteIn(["currentAppliedFiltersDesc", "contains"], null)
      // newFilter = newFilter.deleteIn(['currentAppliedFiltersDesc', 'categories'], null)
    } else {
      newFilter = newFilter.deleteIn(["currentAppliedFilter", "startsWith"], null)

      newFilter = newFilter.deleteIn(["currentAppliedFiltersDesc", "startsWith"], null)
    }

    // Add new search
    newFilter = newFilter.updateIn(["currentAppliedFilter", _searchType], () => ` AND ${searchNxqlQuery}`)

    // Add new description
    newFilter = newFilter.updateIn(["currentAppliedFiltersDesc", _searchType], () => {
      let filterDesc

      switch (_searchType) {
        case "contains":
          filterDesc = "contain the search term"
          break

        case "startsWith":
          filterDesc = "start with the letter "
          break

        case "categories":
          // NOTE: DON'T THINK WE EVER GET HERE!
          debugger
          filterDesc = "have the categories"
          break

        default:
          filterDesc = null
      }

      return (
        <span>
          {filterDesc} <strong>{searchTerm}</strong>
        </span>
      )
    })

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination()
    this.setState({ filterInfo: newFilter, force: Math.random() })
  }

  _handleAlphabetClick(letter) {
    // let newFilter = this.state.filterInfo

    // newFilter = newFilter.set('currentCategoryFilterIds', new Set())
    // newFilter = newFilter.deleteIn(['currentAppliedFilter', 'categories'], null)

    this.setState(
      {
        // filterInfo: newFilter,
        searchTerm: letter,
        searchByAlphabet: true,
        searchByTitle: true,
        searchByDefinitions: false,
        searchByTranslations: false,
        searchPartOfSpeech: SEARCH_SORT_DEFAULT,
      },
      () => {
        this.handleSearch()
      }
    )
  }

  _getPageKey() {
    return `${this.props.routeParams.area}_${this.props.routeParams.dialect_name}_learn_words`
  }
}
