import { Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { Input } from '@/design-system'

import styles from './QuickFind.module.css'

/** Jumps to a pet by id, or searches pets by name. */
export function QuickFind() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()

    const query = value.trim()

    if (query === '') return

    if (/^\d+$/.test(query)) void navigate(`/pets/${query}`)
    else void navigate(`/pets?q=${encodeURIComponent(query)}`)

    setValue('')
  }

  return (
    <form className={styles.form} role="search" onSubmit={onSubmit}>
      <Input
        type="search"
        aria-label="Find a pet by name or ID"
        placeholder="Find a pet by name or ID"
        leading={<Search />}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  )
}
