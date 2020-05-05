import React from 'react'
import { HeadingText } from 'nr1'

const timeline = props => {
  return (
    <div className="timeline-container">
      <div className="empty-state">
        <HeadingText
          className="empty-state-header"
          type={HeadingText.TYPE.HEADING_3}
        >
          Pick a session to continue
        </HeadingText>
        <div className="empty-state-desc">
          To view the timeline breakdown of a specific session, please click on
          a line item in the chart to the left.
        </div>
      </div>
    </div>
  )
}

export default timeline
