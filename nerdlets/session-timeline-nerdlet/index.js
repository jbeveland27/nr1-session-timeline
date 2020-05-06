import React from 'react'
import {
  PlatformStateContext,
  NerdletStateContext,
  EntityByGuidQuery,
  HeadingText,
  BlockText,
  Spinner,
} from 'nr1'
import SessionTimeline from '../../src/containers/SessionTimeline'

export default class Wrapper extends React.Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => {
              // make sure the nerdlet has access to this entity
              return (
                <EntityByGuidQuery entityGuid={nerdletUrlState.entityGuid}>
                  {({ data, loading, error }) => {
                    if (loading) {
                      return <Spinner fillContainer />
                    }
                    if (error) {
                      return <BlockText>{error.message}</BlockText>
                    }

                    if (
                      data.entities &&
                      data.entities[0] &&
                      data.entities[0].guid
                    ) {
                      return (
                        <SessionTimeline
                          launcherUrlState={platformUrlState}
                          nerdletUrlState={nerdletUrlState}
                          entity={data.entities[0]}
                        />
                      )
                    } else {
                      return (
                        <div className="message">
                          <HeadingText>
                            Session Timeline is not available
                          </HeadingText>
                          <BlockText>
                            You have access to this entity, but Session Timeline
                            has not been enabled for Browser entities in this
                            account. Please see your Nerdpack Manager to request
                            access.
                          </BlockText>
                        </div>
                      )
                    }
                  }}
                </EntityByGuidQuery>
              )
            }}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    )
  }
}
