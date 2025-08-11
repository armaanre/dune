import { clsx } from 'clsx'
import React from 'react'

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props
  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm disabled:opacity-50',
        'bg-white text-gray-900 border-gray-300 hover:bg-gray-50',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
        className
      )}
    />
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <input
      {...rest}
      className={clsx(
        'w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2',
        'bg-white text-gray-900 border-gray-300 focus:ring-black/20 placeholder:text-gray-400',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:focus:ring-white/20 dark:placeholder:text-gray-400',
        className
      )}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props
  return (
    <textarea
      {...rest}
      className={clsx(
        'w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2',
        'bg-white text-gray-900 border-gray-300 focus:ring-black/20 placeholder:text-gray-400',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:focus:ring-white/20 dark:placeholder:text-gray-400',
        className
      )}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props
  return (
    <select
      {...rest}
      className={clsx(
        'w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2',
        'bg-white text-gray-900 border-gray-300 focus:ring-black/20',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:focus:ring-white/20',
        className
      )}
    />
  )
}
