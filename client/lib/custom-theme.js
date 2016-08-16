import {
  cyan700,
  pinkA200,
  pinkA400,
  pinkA100,
  fullWhite,
  grey200,
  grey600
} from 'material-ui/styles/colors'
import {fade} from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: grey200,
    primary2Color: grey200,
    primary3Color: grey600,
    accent1Color: grey600,
    accent2Color: grey600,
    accent3Color: grey600,
    textColor: fullWhite,
    secondaryTextColor: fade(fullWhite, 0.7),
    alternateTextColor: '#303030',
    canvasColor: '#303030',
    borderColor: fade(fullWhite, 0.3),
    disabledColor: fade(fullWhite, 0.3),
    pickerHeaderColor: fade(fullWhite, 0.12),
    clockCircleColor: fade(fullWhite, 0.12)
  }
}
