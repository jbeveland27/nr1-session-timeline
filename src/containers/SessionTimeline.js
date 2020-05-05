import React from 'react'
import { Grid, GridItem } from 'nr1'
import SearchBar from './SearchBar'
import SearchResults from '../components/search-results/SearchResults'
// import Timeline from '../components/timeline/Timeline'

export default class SessionTimeline extends React.PureComponent {
  state = {
    filter: '',
  }

  onSelectFilter = filter => {
    console.debug('sessionTimeline filter', filter)
    this.setState({ filter })
  }

  render() {
    const { entity } = this.props
    const { filter } = this.state

    return (
      <Grid
        className="container__grid-template"
        spacingType={[
          Grid.SPACING_TYPE.SMALL,
          Grid.SPACING_TYPE.NONE,
          Grid.SPACING_TYPE.NONE,
          Grid.SPACING_TYPE.NONE,
        ]}
      >
        <GridItem columnStart={1} columnEnd={12}>
          <SearchBar entity={entity} selectFilter={this.onSelectFilter} />
        </GridItem>
        <GridItem columnStart={1} columnSpan={4} collapseGapAfter>
          <SearchResults selected={filter} />
        </GridItem>
        <GridItem columnSpan={8}>
          <div>placeholder</div>
          {/* <Timeline /> */}
        </GridItem>
      </Grid>
    )
  }
}
