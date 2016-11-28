const solarized = {
  darks: [
    '#002b36',
    '#073642',
    '#586e75',
    '#657b83',
  ],
  lights: [
    '#fdf6e3',
    '#eee8d5',
    '#93a1a1',
    '#839496',
  ],
  colors: {
    yellow: '#b58900',
    orange: '#cb4b16',
    red: '#dc322f',
    magenta: '#d33682',
    violet: '#6c71c4',
    blue: '#268bd2',
    cyan: '#2aa198',
    green: '#859900'
  }
}

const solarizedDark = {
  id: 'sd',
  base: solarized.darks,
  fore: solarized.lights,
  colors: solarized.colors
}

const solarizedLight = {
  id: 'sl',
  base: solarized.lights,
  fore: solarized.darks,
  colors: solarized.colors
}

const propAccess = {
  canvasColor: theme => theme.base[0],
  gridColor: theme => theme.fore[0],
  iconColor: theme => theme.base[1],
  textColor: theme => theme.fore[2],
  materialColor: theme => theme.base[2]
}

class ThemeManager {
  themes = { solarizedDark, solarizedLight }
  current = solarizedDark

  setTheme = (str) => this.current = this.theme[str]

  get = (key) => this.current.colors[key]
    ? this.current.colors[key]
    : propAccess[key](this.current)
}

export default new ThemeManager()
