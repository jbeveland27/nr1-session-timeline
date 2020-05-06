import { startCase } from 'lodash'

export default {
  searchAttribute: 'userId',
  event: 'BrowserInteraction',
  groupingAttribute: 'session',
  linkingAttribute: 'browserInteractionId',
  duration: ' SINCE 1 month ago',
  timelineEventTypes: ['BrowserInteraction', 'AjaxRequest', 'JavaScriptError'],
}
