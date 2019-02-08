import React, { Component, PropTypes } from 'react'
import Immutable, { Set } from 'immutable'

import RaisedButton from 'material-ui/lib/raised-button'
// import memoize from 'memoize-one'
// import { debounce } from 'debounce'
import selectn from 'selectn'
import provide from 'react-redux-provide'
// import Paper from 'material-ui/lib/paper'
// import ListUI from 'material-ui/lib/lists/list'
// import ListItem from 'material-ui/lib/lists/list-item'
// import Checkbox from 'material-ui/lib/checkbox'
// import withToggle from 'views/hoc/view/with-toggle'
// import IntlService from 'views/services/intl'
import NavigationHelpers from 'common/NavigationHelpers'
import StringHelpers from 'common/StringHelpers'
// const FiltersWithToggle = withToggle()

@provide
export default class DialectCategoryList extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    facets: PropTypes.array.isRequired,
    onFacetSelected: PropTypes.func.isRequired,
    facetField: PropTypes.string.isRequired,
    appliedFilterIds: PropTypes.instanceOf(Set),
    styles: PropTypes.object,
    pushWindowPath: PropTypes.func.isRequired,
    splitWindowPath: PropTypes.any, // TODO: set appropriate propType
  }

  static defaultProps = {
    facets: [],
  }

  _css = 'CategoryList'
  categoriesSorted = []
  // intl = IntlService.instance
  title = ''

  styleListItemParent = {
    fontSize: '13px',
    fontWeight: 'normal',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: '10px',
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center',
  }

  styleListItemCheckbox = {
    position: 'relative',
    top: 0,
    left: 0,
  }

  styleListItemChild = {
    fontSize: '13px',
    fontWeight: 'normal',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center',
  }

  uidUrl = {}

  constructor(props, context) {
    super(props, context)

    this.state = {
      disableAll: false,
    }

    if (props.facets.length > 0) {
      this.categoriesSorted = this._sortCategories(props.facets)
      this.listItems = this._generateListItems(this.categoriesSorted)
    }

    this.title = props.title
    ;['_generateUidUrlPaths', '_sortCategories', '_setUidUrlPath', '_sortByTitle'].forEach(
      (method) => (this[method] = this[method].bind(this))
    )
  }

  componentDidMount() {
    if (this.props.facets.length > 0) {
      this.categoriesSorted = this._sortCategories(this.props.facets)
      this.listItems = this._generateListItems(this.categoriesSorted)
    }
  }

  componentDidUpdate(prevProps) {
    const prevAppliedFilterIds = prevProps.appliedFilterIds
    const currentAppliedFilterIds = this.props.appliedFilterIds

    if (prevProps.facets.length !== this.props.facets.length) {
      this.categoriesSorted = this._sortCategories(this.props.facets)
      this.listItems = this._generateListItems(this.categoriesSorted)
      this.setState({ update: Math.random() + Math.random() }) // TODO: TEMP HACK
    }

    if (prevAppliedFilterIds.equals(currentAppliedFilterIds) === false) {
      // console.time('componentDidUpdate _generateListItems')
      this.listItems = this._generateListItems(this.categoriesSorted)
      // console.timeEnd('componentDidUpdate _generateListItems')
    }
    if (prevProps.title !== this.props.title) {
      this.title = this.props.title
    }
  }

  render() {
    const appliedFilterIdCount = this.props.appliedFilterIds.count()
    return (
      <div>
        <h2>Categories</h2>
        <ul>{this.listItems}</ul>
      </div>
    )
  }

  _generateUidUrlPaths(categories) {
    const _splitWindowPath = [...this.props.splitWindowPath]
    const lastPath = _splitWindowPath.pop()

    if (lastPath === 'words' || lastPath === 'phrases') {
      _splitWindowPath.push(lastPath)
      _splitWindowPath.push('categories')
    }
    const path = _splitWindowPath.join('/')

    categories.forEach((category) => {
      this._setUidUrlPath(category, path)
      const children = selectn('contextParameters.children.entries', category)
      if (children.length > 0) {
        children.forEach((categoryChild) => {
          this._setUidUrlPath(categoryChild, path)
        })
      }
    })
    return this.uidUrl
  }
  _setUidUrlPath(category, path) {
    // TODO: map encodeUri title to uid for friendly urls
    // this.uidUrl[category.uid] = encodeURI(category.title)

    // TODO: temp using uid in url
    this.uidUrl[category.uid] = `${path}/${encodeURI(category.uid)}`
  }

  _generateListItems = (categories) => {
    this._generateUidUrlPaths(categories)

    const { appliedFilterIds } = this.props
    const _categories = categories.map((category) => {
      const childrenItems = []
      // const childrenUids = []
      const children = selectn('contextParameters.children.entries', category)
      if (children.length > 0) {
        children.forEach((categoryChild) => {
          const uidChild = categoryChild.uid
          // childrenUids.push(uidChild)
          const childActiveClass = appliedFilterIds.includes(uidChild) ? `${this._css}ItemActive` : ''
          const childHref = `/${this.uidUrl[uidChild]}`
          const childListItem = (
            <li key={uidChild} className={`${this._css}Item`}>
              <a
                className={`${this._css}Link ${childActiveClass}`}
                href={childHref}
                onClick={(e) => {
                  // e.preventDefault()
                  // NavigationHelpers.navigate(childHref, this.props.pushWindowPath, false)
                }}
                title={categoryChild.title}
              >
                {categoryChild.title}
              </a>
            </li>
          )
          childrenItems.push(childListItem)
        })
      }

      const uidParent = category.uid
      const parentActiveClass = appliedFilterIds.includes(uidParent) ? `${this._css}ItemActive` : ''
      const parentHref = `/${this.uidUrl[uidParent]}`
      const parentListItem = (
        <li key={uidParent} className={`${this._css}Item ${parentActiveClass}`}>
          <a
            className={`${this._css}Link`}
            href={parentHref}
            onClick={(e) => {
              // e.preventDefault()
              // NavigationHelpers.navigate(parentHref, this.props.pushWindowPath, false)
            }}
            title={category.title}
          >
            {category.title}
          </a>
          {childrenItems.length > 0 ? <ul>{childrenItems}</ul> : null}
        </li>
      )

      return parentListItem
    })

    return _categories
  }
  _sortByTitle(a, b) {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  }

  _sortCategories(categories) {
    const _categories = [...categories]
    // Sort root level
    _categories.sort(this._sortByTitle)
    const _categoriesSorted = _categories.map((category) => {
      // Sort children
      const children = selectn('contextParameters.children.entries', category)
      if (children.length > 0) {
        children.sort(this._sortByTitle)
      }
      return category
    })
    return _categoriesSorted
  }
}
