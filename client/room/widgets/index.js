import TestSpatial from './test-spatial'
// import TestNonSpatial from './test-non-spatial'
import widgetize from './widgetize'

export default [TestSpatial].map(w => widgetize(w))
