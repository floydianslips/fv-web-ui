import React, { Component, PropTypes } from 'react'
import Immutable, { Set } from 'immutable'
import selectn from 'selectn'
import provide from 'react-redux-provide'
// import StringHelpers from 'common/StringHelpers'
// const FiltersWithToggle = withToggle()

@provide
export default class DialectCategoryList extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    facets: PropTypes.array.isRequired,
    handleCategoryClick: PropTypes.func,
    handleDialectCategoryList: PropTypes.func.isRequired,
    facetField: PropTypes.string.isRequired,
    appliedFilterIds: PropTypes.instanceOf(Set),
    styles: PropTypes.object,
    pushWindowPath: PropTypes.func.isRequired,
    splitWindowPath: PropTypes.array,
  }

  static defaultProps = {
    facets: [],
    handleCategoryClick: () => {},
  }

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
      lastCheckedUid: undefined,
      lastCheckedChildrenUids: [],
      lastCheckedParentFacetUid: undefined,
      listItems: undefined,
    }

    this.title = props.title
    ;['_generateUidUrlPaths', '_handleClick', '_sortCategories', '_setUidUrlPath', '_sortByTitle'].forEach(
      (method) => (this[method] = this[method].bind(this))
    )
  }

  componentDidUpdate(prevProps) {
    const prevAppliedFilterIds = prevProps.appliedFilterIds
    const currentAppliedFilterIds = this.props.appliedFilterIds

    if (prevProps.facets.length !== this.props.facets.length) {
      this.categoriesSorted = this._sortCategories(this.props.facets)
    }

    if (
      prevProps.facets.length !== this.props.facets.length ||
      prevAppliedFilterIds.equals(currentAppliedFilterIds) === false
    ) {
      this._generateListItems(this.categoriesSorted)
    }

    if (prevProps.title !== this.props.title) {
      this.title = this.props.title
    }
  }

  componentWillUnmount() {
    const { lastCheckedUid, lastCheckedChildrenUids, lastCheckedParentFacetUid } = this.state
    // 'uncheck' previous
    if (lastCheckedUid) {
      const unselected = {
        checkedFacetUid: lastCheckedUid,
        childrenIds: lastCheckedChildrenUids,
        parentFacetUid: lastCheckedParentFacetUid,
      }
      this.props.handleDialectCategoryList(this.props.facetField, undefined, unselected)
    }
  }

  render() {
    return (
      <div className="DialectCategoryList">
        <h2>Browse by Category</h2>
        <ul className="DialectCategoryListList">{this.state.listItems}</ul>
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

    let lastCheckedUid = undefined
    let lastCheckedChildrenUids = undefined
    let lastCheckedParentFacetUid = undefined

    const _categories = categories.map((category) => {
      const childrenItems = []
      const childrenUids = []
      const uidParent = category.uid

      const parentIsActive = appliedFilterIds.includes(uidParent)
      const parentActiveClass = parentIsActive ? 'DialectCategoryListLink--active' : ''

      const children = selectn('contextParameters.children.entries', category)
      let hasActiveChild = false
      if (children.length > 0) {
        children.forEach((categoryChild) => {
          const uidChild = categoryChild.uid

          childrenUids.push(uidChild)
          const childIsActive = appliedFilterIds.includes(uidChild)

          let childActiveClass = ''
          if (parentActiveClass) {
            childActiveClass = 'DialectCategoryListLink--activeParent'
          } else if (childIsActive) {
            childActiveClass = 'DialectCategoryListLink--active'
          }

          if (childIsActive) {
            hasActiveChild = true
            lastCheckedUid = uidChild
            lastCheckedChildrenUids = null
            lastCheckedParentFacetUid = uidParent
          }

          const childHref = `/${this.uidUrl[uidChild]}`
          const childListItem = (
            <li key={uidChild}>
              <a
                className={`DialectCategoryListLink DialectCategoryListLink--child ${childActiveClass}`}
                href={childHref}
                onClick={(e) => {
                  e.preventDefault()
                  this._handleClick({
                    href: childHref,
                    checkedFacetUid: uidChild,
                    childrenIds: null,
                    parentFacetUid: uidParent,
                  })
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

      const parentHref = `/${this.uidUrl[uidParent]}`

      if (parentIsActive) {
        lastCheckedUid = uidParent
        lastCheckedChildrenUids = childrenUids
        lastCheckedParentFacetUid = undefined
      }
      const listItemActiveClass = parentIsActive || hasActiveChild ? 'DialectCategoryListItemParent--active' : ''
      const parentListItem = (
        <li key={uidParent} className={`DialectCategoryListItemParent ${listItemActiveClass}`}>
          <div className="DialectCategoryListItemGroup">
            <a
              className={`DialectCategoryListLink DialectCategoryListLink--parent ${parentActiveClass}`}
              href={parentHref}
              onClick={(e) => {
                e.preventDefault()
                this._handleClick({
                  href: parentHref,
                  checkedFacetUid: uidParent,
                  childrenIds: childrenUids,
                  parentFacetUid: undefined,
                })
              }}
              title={category.title}
            >
              {category.title}
            </a>
            {/* {childrenItems.length > 0 && <button className="DialectCategoryListItemToggle">Show subcategories</button>} */}
          </div>
          {childrenItems.length > 0 ? <ul className="DialectCategoryListList">{childrenItems}</ul> : null}
        </li>
      )

      return parentListItem
    })

    // return _categories

    // Save active item/data
    this.setState({
      listItems: _categories,
      lastCheckedUid,
      lastCheckedChildrenUids,
      lastCheckedParentFacetUid,
    })
  }

  _handleClick(obj) {
    const { href, checkedFacetUid, childrenIds, parentFacetUid } = obj

    const { lastCheckedUid, lastCheckedChildrenUids, lastCheckedParentFacetUid } = this.state

    let unselected = undefined

    // 'uncheck' previous
    if (lastCheckedUid) {
      unselected = {
        checkedFacetUid: lastCheckedUid,
        childrenIds: lastCheckedChildrenUids,
        parentFacetUid: lastCheckedParentFacetUid,
      }
    }

    // 'check' new
    this.setState(
      {
        lastCheckedUid: checkedFacetUid,
        lastCheckedChildrenUids: childrenIds,
        lastCheckedParentFacetUid: parentFacetUid,
      },
      () => {
        const selected = {
          checkedFacetUid,
          childrenIds,
        }
        this.props.handleCategoryClick({
          facetField: this.props.facetField,
          selected,
          unselected,
          href,
        })
      }
    )
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
