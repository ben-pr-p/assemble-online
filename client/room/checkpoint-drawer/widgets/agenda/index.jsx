import widgetify from '../widgetify'

export default widgetify({
  spatial: false,
  allowance: 1
})(class Agenda extends Component {
  state = {
    agenda: [],
    active: -1
  }

})
