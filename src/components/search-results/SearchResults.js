import React from 'react'
import PropTypes from 'prop-types'
import {
  NrqlQuery,
  Spinner,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1'
import config from '../../config/config'

export default class SearchResults extends React.PureComponent {
  flattenData = data => {
    let flattened = []

    for (let datum of data) {
      const name = datum.metadata.name
      flattened = flattened.concat(
        datum.data.map(item => {
          return { date: name, value: item.session }
        })
      )
    }

    return flattened
  }

  createTable = data => {
    console.debug('searchResults.createTable', data)
    return (
      <Table items={data}>
        <TableHeader>
          <TableHeaderCell className="search-results__header">
            Date
          </TableHeaderCell>
          <TableHeaderCell className="search-results__header">
            Session
          </TableHeaderCell>
        </TableHeader>

        {({ item }) => (
          <TableRow onClick={this.onChooseSession}>
            <TableRowCell className="search-results__row">
              {item.date}
            </TableRowCell>
            <TableRowCell className="search-results__row">
              {item.value}
            </TableRowCell>
          </TableRow>
        )}
      </Table>
    )
  }

  onChooseSession = (evt, { item, index }) => {
    console.debug(`searchResults.onChooseSession`, item)
    const { chooseSession } = this.props
    chooseSession(item.value)
  }

  render() {
    const obj = {
      name: 'one',
      other: 'two',
    }
    const {
      entity: { accountId },
      selected,
    } = this.props
    const { attribute, event, duration } = config
    const query = `FROM ${event} SELECT uniques(session) WHERE ${attribute}='${selected}' ${duration} FACET dateOf(timestamp) `

    console.debug(`searchResults accountId: ${accountId} || query: ${query}`)

    return (
      <div className="search-results">
        <NrqlQuery accountId={accountId} query={query}>
          {({ data, error, loading }) => {
            if (loading) return <Spinner fillContainer />
            if (error) return <BlockText>{error.message}</BlockText>

            if (!data) return <div>No sessions found</div>
            return this.createTable(this.flattenData(data))
          }}
        </NrqlQuery>
      </div>
    )
  }
}

SearchResults.propTypes = {
  entity: PropTypes.object.isRequired,
  selected: PropTypes.string.isRequired,
  chooseSession: PropTypes.func.isRequired,
}
