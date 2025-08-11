"use client"

import { useEffect, useState } from 'react'
import { Button } from './ui'

function getInitial(): boolean {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  // system prefers
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function DarkModeToggle() {
  const [dark, setDark] = useState(getInitial())

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <Button onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
      {dark ? 'Light mode' : 'Dark mode'}
    </Button>
  )
}
