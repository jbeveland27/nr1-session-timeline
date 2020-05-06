import { Icon } from 'nr1'

const groups = [
  {
    name: 'DOWNLOAD',
    eventDisplay: {
      class: 'timeline-item-type-download',
      icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__DOWNSTREAM_DEPLOYMENT,
      label: 'Download',
      color: '#01355c',
    },
    timelineDisplay: {
      color: '#add7f7',
      label: 'Download',
    },
    actionNames: ['DOWNLOAD'],
  },
  {
    name: 'INTERACTION',
    eventDisplay: {
      class: 'timeline-item-type-interaction',
      icon: Icon.TYPE.INTERFACE__OPERATIONS__SELECTION,
      label: 'Interaction',
      color: '#9C5400',
    },
    timelineDisplay: {
      color: '#fcdd77',
      label: 'Interaction',
    },
    actionNames: ['BrowserInteraction'],
  },
  {
    name: 'AJAX',
    eventDisplay: {
      class: 'timeline-item-type-ajax',
      icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__DOWNSTREAM_CONNECTION,
      label: 'Ajax',
      color: '#a752d5',
    },
    timelineDisplay: {
      color: '#cea3e6',
      label: 'Ajax',
    },
    actionNames: ['AjaxRequest'],
  },
  {
    name: 'ERROR',
    eventDisplay: {
      class: 'timeline-item-type-error',
      icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR,
      label: 'Error',
      color: '#bf0015',
    },
    timelineDisplay: {
      color: '#bf0015',
      label: 'Error',
    },
    actionNames: ['JavaScriptError'],
  },
]

const defaultGroup = {
  name: 'GENERAL',
  eventDisplay: {
    class: 'timeline-item-type-general',
    icon: Icon.TYPE.INTERFACE__INFO__INFO,
    label: 'General',
    color: '#00496b',
  },
  timelineDisplay: {
    color: '#00496b',
    label: 'General',
  },
  actionNames: [],
}

const eventGroup = event => {
  const found = groups.filter(group => {
    return group.actionNames.includes(event)
  })
  if (found.length > 0) return found[0]
  else return defaultGroup
}

export default eventGroup
