import TestSpatial from './test-spatial'
// import TestNonSpatial from './test-non-spatial'
import widgetize from './widgetize'

export default [TestSpatial].map(w => widgetize(w))

/*
 * TODO
 * Widgets can be collapsed again and moved in their collapsed form
 * Pings with messages, maybe originating from the admin who emitted it
 *
 * User widget shows current number of users or the data is always bound
 * to some place in the room
 */
