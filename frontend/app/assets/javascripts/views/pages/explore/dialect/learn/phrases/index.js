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
import React, { PropTypes } from "react"
import Immutable, { Set, Map } from "immutable"
import classNames from "classnames"
import provide from "react-redux-provide"
import selectn from "selectn"

import PromiseWrapper from "views/components/Document/PromiseWrapper"

import ProviderHelpers from "common/ProviderHelpers"

import AuthorizationFilter from "views/components/Document/AuthorizationFilter"
import PageDialectLearnBase from "views/pages/explore/dialect/learn/base"
import PhraseListView from "views/pages/explore/dialect/learn/phrases/list-view"

import RaisedButton from "material-ui/lib/raised-button"

import FacetFilterList from "views/components/Browsing/facet-filter-list"
import { getDialectClassname } from "views/pages/explore/dialect/helpers"
import { isMobile } from "react-device-detect"
import IntlService from "views/services/intl"

import { SearchDialect } from "views/components/SearchDialect"
import { SEARCH_DEFAULT } from "views/components/SearchDialect/constants"

const intl = IntlService.instance

/**
 * Learn phrases
 */
@provide
export default class PageDialectLearnPhrases extends PageDialectLearnBase {
  static propTypes = {
    windowPath: PropTypes.string.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    fetchDocument: PropTypes.func.isRequired,
    computeDocument: PropTypes.object.isRequired,
    computeLogin: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    fetchPortal: PropTypes.func.isRequired,
    computePortal: PropTypes.object.isRequired,
    fetchCategories: PropTypes.func.isRequired,
    computeCategories: PropTypes.object.isRequired,
    overrideBreadcrumbs: PropTypes.func.isRequired,
    updatePageProperties: PropTypes.func.isRequired,
    routeParams: PropTypes.object.isRequired,
    hasPagination: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context)

    const initialCategories = props.routeParams.category ? new Set([props.routeParams.category]) : new Set()

    let filterInfo = new Map({
      currentCategoryFilterIds: initialCategories,
      currentAppliedFilter: new Map({
        categories: props.routeParams.category
          ? " AND " +
            ProviderHelpers.switchWorkspaceSectionKeys("fv-phrase:phrase_books", props.routeParams.area) +
            '/* IN ("' +
            props.routeParams.category +
            '")'
          : "",
      }),
    })

    // If no filters are applied via URL, use props
    const pagePropertiesFilterInfo = selectn([[this._getPageKey()], "filterInfo"], props.properties.pageProperties)

    if (filterInfo.get("currentCategoryFilterIds").isEmpty() && pagePropertiesFilterInfo) {
      filterInfo = pagePropertiesFilterInfo
    }

    this.state = {
      filterInfo,
      searchTerm: "",
      searchByCulturalNotes: false,
      searchByDefinitions: true,
      searchByTitle: true,
      searchNxqlQuery: "",
      searchNxqlSort: {},
    }

    // Bind methods to 'this'
    ;[
      "handleSearch",
      "resetSearch",
      "updateState",
      "_changeFilter",
      "_onNavigateRequest",
      "_handleFacetSelected", // NOTE: Comes from PageDialectLearnBase
      "_handlePagePropertiesChange",
      "_resetURLPagination",
      "_getPageKey",
      "_getURLPageProps",
    ].forEach((method) => (this[method] = this[method].bind(this)))
  }

  render() {
    const { filterInfo, searchByCulturalNotes, searchByTitle, searchByDefinitions, searchTerm } = this.state

    const computeEntities = Immutable.fromJS([
      {
        id: this.props.routeParams.dialect_path,
        entity: this.props.computePortal,
      },
      {
        id: this.props.routeParams.dialect_path + "/Dictionary",
        entity: this.props.computeDocument,
      },
      {
        id: "/api/v1/path/" + this.props.routeParams.dialect_path + "/Phrase Books/@children",
        entity: this.props.computeCategories,
      },
    ])

    const computeDocument = ProviderHelpers.getEntry(
      this.props.computeDocument,
      this.props.routeParams.dialect_path + "/Dictionary"
    )
    const computePortal = ProviderHelpers.getEntry(
      this.props.computePortal,
      this.props.routeParams.dialect_path + "/Portal"
    )
    const computePhraseBooks = ProviderHelpers.getEntry(
      this.props.computeCategories,
      "/api/v1/path/" + this.props.routeParams.dialect_path + "/Phrase Books/@children"
    )

    const computePhraseBooksSize = selectn("response.entries.length", computePhraseBooks) || 0

    const isKidsTheme = this.props.routeParams.theme === "kids"

    const phraseListView = selectn("response.uid", computeDocument) ? (
      <PhraseListView
        controlViaURL
        onPaginationReset={this._resetURLPagination}
        onPagePropertiesChange={this._handlePagePropertiesChange}
        parentID={selectn("response.uid", computeDocument)}
        filter={this.state.filterInfo}
        {...this._getURLPageProps()}
        routeParams={this.props.routeParams}
      />
    ) : (
      <div />
    )

    // Render kids view
    if (isKidsTheme || isMobile) {
      let pageSize = 4 // Items per Kids page

      // Mobile but not Kids
      if (!isKidsTheme && isMobile) {
        pageSize = 10 // Items per page for mobile, but not Kids
      }

      const kidsFilter = this.state.filterInfo.setIn(
        ["currentAppliedFilter", "kids"],
        " AND fv:available_in_childrens_archive=1"
      )

      return (
        <PromiseWrapper renderOnError computeEntities={computeEntities}>
          <div className="row">
            <div className={classNames("col-xs-12", "col-md-8", "col-md-offset-2")}>
              {React.cloneElement(phraseListView, {
                gridListView: true,
                gridCols: 2,
                DEFAULT_PAGE_SIZE: pageSize,
                filter: kidsFilter,
              })}
            </div>
          </div>
        </PromiseWrapper>
      )
    }
    const dialectClassName = getDialectClassname(computeDocument)
    const dialect = selectn("response.contextParameters.ancestry.dialect.dc:title", computePortal) || ""
    const pageTitle = intl.trans("views.pages.explore.dialect.phrases.x_phrases", `${dialect} Phrases`, null, [dialect])

    return (
      <PromiseWrapper renderOnError computeEntities={computeEntities}>
        <div className={classNames("row", "row-create-wrapper")}>
          <div className={classNames("col-xs-12", "col-md-4", "col-md-offset-8", "text-right")}>
            <AuthorizationFilter
              hideFromSections
              routeParams={this.props.routeParams}
              filter={{
                role: ["Record", "Approve", "Everything"],
                entity: selectn("response", computeDocument),
                login: this.props.computeLogin,
              }}
            >
              <RaisedButton
                label={intl.trans(
                  "views.pages.explore.dialect.phrases.create_new_phrase",
                  "Create New Phrase",
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
            className={classNames("col-xs-12", "col-md-3", computePhraseBooksSize === 0 ? "hidden" : null, "PrintHide")}
          >
            <FacetFilterList
              title={intl.trans("phrase_books", "Phrase Books", "words")}
              appliedFilterIds={this.state.filterInfo.get("currentCategoryFilterIds")}
              facetField={ProviderHelpers.switchWorkspaceSectionKeys(
                "fv-phrase:phrase_books",
                this.props.routeParams.area
              )}
              onFacetSelected={this._handleFacetSelected} // NOTE: Comes from PageDialectLearnBase
              facets={selectn("response.entries", computePhraseBooks) || []}
            />
          </div>
          <div className={classNames("col-xs-12", computePhraseBooksSize === 0 ? "col-md-12" : "col-md-9")}>
            <h1>{pageTitle}</h1>

            <SearchDialect
              isSearchingPhrases
              filterInfo={filterInfo}
              handleSearch={this.handleSearch}
              resetSearch={this.resetSearch}
              searchByCulturalNotes={searchByCulturalNotes}
              searchByTitle={searchByTitle}
              searchByDefinitions={searchByDefinitions}
              searchTerm={searchTerm}
              updateAncestorState={this.updateState}
            />

            <div className={dialectClassName}>{phraseListView}</div>
          </div>
        </div>
      </PromiseWrapper>
    )
  }
  // END render

  handleSearch() {
    const { searchTerm, searchNxqlQuery } = this.state
    this._changeFilter(searchTerm, "contains", () => ` AND ${searchNxqlQuery}`)
  }

  resetSearch() {
    // TODO: Should `let newFilter = this.state.filterInfo.deleteIn(..`
    // TODO: just be `this.state.filterInfo.deleteIn(['currentAppliedFilter', 'contains'], null)`?
    let newFilter = this.state.filterInfo.deleteIn(["currentAppliedFilter", "contains"], null)
    newFilter = newFilter.deleteIn(["currentAppliedFiltersDesc", "contains"], null)

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination()
    this.setState({ filterInfo: newFilter })
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
      "/api/v1/path/" + newProps.routeParams.dialect_path + "/Phrase Books/@children",
      newProps.fetchCategories,
      newProps.computeCategories
    )
  }

  _changeFilter(value, type, nxql) {
    let newFilter = this.state.filterInfo.updateIn(["currentAppliedFilter", type], () => {
      return nxql(value)
    })

    newFilter = newFilter.updateIn(["currentAppliedFiltersDesc", type], () => {
      let filterDesc

      switch (type) {
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
          {filterDesc} <strong>{value}</strong>
        </span>
      )
    })

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination()
    this.setState({ filterInfo: newFilter })
  }
  _getPageKey() {
    return this.props.routeParams.area + "_" + this.props.routeParams.dialect_name + "_learn_phrases"
  }
}
