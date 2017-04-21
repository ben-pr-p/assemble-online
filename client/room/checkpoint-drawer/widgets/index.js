import Agenda from './widgets/agenda'
import Queue from './widgets/queue'
import widgetize from './widgetize'

export default [Agenda, Queue].map(w => widgetize(w))

/*
 * TODO
 * Widgets can be collapsed again and moved in their collapsed form
 * Pings with messages, maybe originating from the admin who emitted it
 *
 * User widget shows current number of users or the data is always bound
 * to some place in the room
 */
