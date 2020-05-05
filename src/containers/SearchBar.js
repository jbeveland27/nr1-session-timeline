import React from 'react'
import PropTypes from 'prop-types'
import { TextField, NerdGraphQuery, Icon } from 'nr1'
import SearchBarDrawer from '../components/search-bar/SearchBarDrawer'
import config from '../config/config'

export default class SearchBar extends React.Component {
  state = {
    loading: true,
    searchTerm: '',
    results: [],
    cachedResults: [],
    selectedItem: '',
  }

  loadData = async searchTerm => {
    console.info('searchBar.loadData')

    const { entity } = this.props
    const { attribute, event, duration } = config
    const nrql = `FROM ${event} SELECT uniques(${attribute}) WHERE entityGuid='${entity.guid}' AND ${attribute} like '%${searchTerm}%' and session is not null ${duration} `

    console.debug('searchBar.loadData nrql', nrql)

    const query = `{
      actor {
        account(id: ${entity.accountId}) {
          nrql(query: "${nrql}") {
            results
          }
        }
      }
    }`

    let queryRunning = true
    let rawData = {}
    let results = []

    while (queryRunning) {
      const { loading, data } = await NerdGraphQuery.query({ query })
      if (!loading) {
        queryRunning = false
        rawData = data
      }
    }

    if (rawData) {
      console.debug('searchBar.loadData rawData', rawData)
      results = rawData.actor.account.nrql.results[0][`uniques.${attribute}`]
    }

    return results
  }

  loadFromCache = async searchTerm => {
    console.info('searchBar.loadFromCache')
    return this.state.cachedResults.filter(result =>
      result.includes(searchTerm)
    )
  }

  onSearchInputChange = async ({ target }) => {
    const { value } = target
    let { loading } = this.state
    let clonedResults = [...this.state.results]
    let clonedCacheResults = [...this.state.cachedResults]

    if (value) {
      if (clonedResults && clonedCacheResults.length > 0)
        clonedResults = await this.loadFromCache(value)
      else {
        clonedResults = await this.loadData(value)
        if (clonedResults.length < 1000) clonedCacheResults = [...clonedResults]
      }
    } else {
      clonedResults = []
      clonedCacheResults = []
      loading = false
    }

    console.debug('searchBar.onChange results', clonedResults)

    this.setState({
      results: clonedResults,
      loading: false,
      cachedResults: clonedCacheResults,
      searchTerm: value,
      selectedItem: '',
    })
  }

  onSelectSearchItem = item => {
    const { selectFilter } = this.props
    selectFilter(item)
    this.setState({
      selectedItem: item,
      searchTerm: '',
      results: [],
      cachedResults: [],
    })
  }

  onRemoveSelectedItem = () => {
    console.debug('removing selected')
    const { clearFilter } = this.props
    clearFilter()
    this.setState({ selectedItem: '' })
  }

  onCloseSearchDrawer = () => {
    this.setState({
      searchTerm: '',
      results: [],
      cachedResults: [],
      selectedItem: '',
    })
  }

  render() {
    const { loading, results, searchTerm, selectedItem } = this.state

    return (
      <div className="search">
        <div className="search__bar">
          <Icon
            className="search__icon"
            type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
          />
          {!selectedItem && (
            <TextField
              className="search__input"
              onChange={this.onSearchInputChange}
              placeholder="Start typing in a session id or user id"
              autoFocus={true}
            />
          )}
          {selectedItem && (
            <div className="search__selected">
              <div className="search__selected-item">{selectedItem}</div>
              <div
                className="search__selected-remove"
                onClick={this.onRemoveSelectedItem}
              >
                X
              </div>
            </div>
          )}
        </div>
        {!selectedItem && searchTerm && (
          <SearchBarDrawer
            loading={loading}
            results={results}
            searchTerm={searchTerm}
            select={this.onSelectSearchItem}
            closeOnClickOutside={this.onCloseSearchDrawer}
          />
        )}
      </div>
    )
  }
}

SearchBar.propTypes = {
  entity: PropTypes.object.isRequired,
  selectFilter: PropTypes.func.isRequired,
  clearFilter: PropTypes.func.isRequired,
}
