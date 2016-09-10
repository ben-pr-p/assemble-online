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

const solarized = {
  base03: '#002b36',
  base02: '#073642',
  base01: '#586e75',
  base00: '#657b83',
  base0: '#839496',
  base1: '#93a1a1',
  base2: '#eee8d5',
  base3: '#fdf6e3',
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900'
}

const grayScale = {
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

const solarizedDarkPalette = {
  primary1Color: solarized.base2,
  primary2Color: fade(solarized.base2, 0.3),
  primary3Color: fade(solarized.base2, 0.5),
  accent1Color: solarized.base1,
  accent2Color: fade(solarized.base1, 0.3),
  accent3Color: fade(solarized.base1, 0.5),
  textColor: solarized.base1,
  alternateTextColor: solarized.base01,
  canvasColor: solarized.base03,
  borderColor: fade(solarized.base1, 0.3),
  disabledColor: fade(solarized.base1, 0.3),
  pickerHeaderColor: fade(solarized.base1, 0.3),
  clockCircleColor: fade(solarized.base1, 0.3)
}

const solarizedLightPalette = {
  primary1Color: solarized.green,
  primary2Color: solarized.green,
  primary3Color: solarized.green,
  accent1Color: solarized.yellow,
  accent2Color: solarized.yellow,
  accent3Color: solarized.yellow,
  textColor: solarized.base03,
  alternateTextColor: solarized.base02,
  canvasColor: solarized.base3,
  borderColor: fade(solarized.base03, 0.3),
  disabledColor: fade(solarized.base03, 0.3),
  pickerHeaderColor: fade(solarized.base03, 0.3),
  clockCircleColor: fade(solarized.base03, 0.3)
}

const solarizedDark = {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: solarizedDarkPalette,
  inversePalette: solarizedLightPalette
}

const solarizedLight = {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: solarizedLightPalette,
  inversePalette: solarizedDarkPalette
}

export {solarizedDark, solarizedLight, grayScale, solarized}

