import React from 'react'
import PropTypes from 'prop-types'
import { startCase } from 'lodash'
import { TextField, NerdGraphQuery, Icon, HeadingText } from 'nr1'
import SearchBarDrawer from './SearchBarDrawer'
import config from '../../config/config'

export default class SearchBarContainer extends React.Component {
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
    const { searchAttribute, event, duration } = config
    const nrql = `FROM ${event} SELECT uniques(${searchAttribute}) WHERE entityGuid='${entity.guid}' AND ${searchAttribute} like '%${searchTerm}%' and session is not null ${duration} `

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
      results = rawData.actor.account.nrql.results[0][`uniques.${searchAttribute}`]
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
    const { searchAttribute } = config

    return (
      <div className="search">
        <HeadingText
          className="grid-item__header"
          type={HeadingText.TYPE.HEADING_4}
        >
          Search for {startCase(searchAttribute)}
        </HeadingText>
        <div className="search__bar">
          <Icon
            className="search__icon"
            type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
          />
          {!selectedItem && (
            <TextField
              className="search__input"
              onChange={this.onSearchInputChange}
              placeholder={`Start typing in a ${startCase(searchAttribute)}`}
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

SearchBarContainer.propTypes = {
  entity: PropTypes.object.isRequired,
  selectFilter: PropTypes.func.isRequired,
  clearFilter: PropTypes.func.isRequired,
}
