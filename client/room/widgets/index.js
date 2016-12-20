import Test from './test'
import widgetize from './widgetize'

export default [Test].map(w => widgetize(w))
