import Agenda from './widgets/agenda'
import Queue from './widgets/queue'
import Browser from './widgets/browser'
import widgetize from './widgetize'

export default [Agenda, Browser, Queue].map(w => widgetize(w))
