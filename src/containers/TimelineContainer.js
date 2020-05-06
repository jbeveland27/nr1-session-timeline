import React from 'react'

import { NrqlQuery, HeadingText } from 'nr1'
import { sortBy } from 'lodash'
import EventStream from '../components/timeline/EventStream'
import Timeline from '../components/timeline/Timeline'
import eventGroup from '../components/timeline/EventGroup'
import config from '../config/config'

export default class TimelineContainer extends React.Component {
  state = {
    sessionData: [],
    loading: true,
    legend: [],
  }

  getData = async eventType => {
    const {
      entity: { accountId },
      session,
    } = this.props
    const { groupingAttribute, duration } = config

    const query = `SELECT * from ${eventType} WHERE ${groupingAttribute} = '${session}' ORDER BY timestamp ASC LIMIT 1000 ${duration}`
    console.debug('timelineDetail.query', query)

    const { data } = await NrqlQuery.query({ accountId, query })

    let result = []
    if (data && data.chart.length > 0)
      result = data.chart[0].data.map(datum => {
        datum['eventGroupName'] = eventType
        return datum
      })

    return result
  }

  getLegend = data => {
    const legend = []
    for (let row of data) {
      const group = eventGroup(row.eventGroupName)
      const found = legend.filter(item => item.group.name === group.name)

      if (found.length === 0) {
        legend.push({ group, visible: true })
      }
    }

    return legend
  }

  onClickLegend = legendItem => {
    const legend = [...this.state.legend]

    let hiddenCount = 0

    legend.forEach(item => {
      if (item.group.name !== legendItem.group.name && !item.visible)
        hiddenCount++
    })

    if (legendItem.visible && hiddenCount === 0) {
      legend.forEach(item => {
        if (item.group.name !== legendItem.group.name) item.visible = false
      })
    } else if (legendItem.visible && hiddenCount === legend.length - 1) {
      legend.forEach(item => {
        if (item.group.name !== legendItem.group.name) item.visible = true
      })
    } else {
      for (let item of legend) {
        if (item.group.name === legendItem.group.name) {
          item.visible = !legendItem.visible
          break
        }
      }
    }

    this.setState({ legend })
  }

  async componentDidUpdate(prevProps) {
    const { session } = this.props
    const prevSession = prevProps.session

    if (session && session !== prevSession) {
      const { timelineEventTypes } = config
      let data = []
      for (let eventType of timelineEventTypes) {
        data = data.concat(await this.getData(eventType))
      }

      data = sortBy(data, 'timestamp')

      const legend = this.getLegend(data)
      this.setState({ sessionData: data, loading: false, legend })
    }
  }

  render() {
    const { sessionData, loading, legend } = this.state
    const { session } = this.props

    // console.debug('timelineContainer.sessionData', sessionData)

    return (
      <React.Fragment>
        {!session && (
          <div className="timeline-container">
            <div className="empty-state">
              <HeadingText
                className="empty-state-header"
                type={HeadingText.TYPE.HEADING_3}
              >
                Pick a session to continue
              </HeadingText>
              <div className="empty-state-desc">
                To view the timeline breakdown of a specific session, please
                click on a line item in the chart to the left.
              </div>
            </div>
          </div>
        )}
        {session && (
          <React.Fragment>
            <Timeline
              data={sessionData}
              loading={loading}
              legend={legend}
              legendClick={this.onClickLegend}
            />
            <EventStream data={sessionData} loading={loading} legend={legend} />
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}
