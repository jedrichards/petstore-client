import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { Field } from './Field'
import { Input } from './Input'
import { TagInput } from './TagInput'

describe('Field', () => {
  it('connects the label, hint and error to its control', () => {
    const { rerender } = render(
      <Field label="Name" hint="As shown in the store" required>
        <Input />
      </Field>,
    )

    const input = screen.getByLabelText(/Name/)

    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription('As shown in the store')
    expect(input).not.toHaveAttribute('aria-invalid')

    rerender(
      <Field label="Name" hint="As shown in the store" error="Give the pet a name." required>
        <Input />
      </Field>,
    )

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Give the pet a name.')
    expect(screen.getByRole('alert')).toHaveTextContent('Give the pet a name.')
  })
})

describe('TagInput', () => {
  function Harness() {
    const [tags, setTags] = useState<string[]>(['calm'])

    return (
      <Field label="Tags">
        <TagInput value={tags} onValueChange={setTags} />
      </Field>
    )
  }

  it('adds tags on Enter and comma, skips repeats, and removes on Backspace', async () => {
    const user = userEvent.setup()

    render(<Harness />)

    const input = screen.getByLabelText('Tags')

    await user.type(input, 'friendly{Enter}calm,small,')

    expect(screen.getByRole('button', { name: 'Remove friendly' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove small' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Remove/ })).toHaveLength(3)

    await user.keyboard('{Backspace}')

    expect(screen.queryByRole('button', { name: 'Remove small' })).not.toBeInTheDocument()
  })
})
