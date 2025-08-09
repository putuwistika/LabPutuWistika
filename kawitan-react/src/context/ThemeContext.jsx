import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext({ theme: 'light' })

export function ThemeProvider({ children }) {
  const theme = 'light'

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark')
    document.body.classList.add('theme-light')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
