'use client'

import { createContext, useContext, ReactNode } from 'react'
import { theme, Theme } from '@autorestock/ui-kit'

interface ThemeContextType {
  theme: Theme
  // Future: theme overrides, dark mode, etc.
}

const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value: ThemeContextType = {
    theme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
