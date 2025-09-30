'use client'

import { createContext, useContext, ReactNode } from 'react'

interface Config {
  userApiBase: string
  authToken?: string
}

const ConfigContext = createContext<Config | null>(null)

interface ConfigProviderProps {
  children: ReactNode
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const config: Config = {
    userApiBase: process.env.NEXT_PUBLIC_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app',
    authToken: process.env.NEXT_PUBLIC_AUTH_TOKEN,
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}

