import { useState } from 'react'
import './ChipInput.css'

type Props = {
  values: string[]
  onChange: (values: string[]) => void
  suggestions: string[]
  placeholder?: string
}

export default function ChipInput({
  values,
  onChange,
  suggestions,
  placeholder,
}: Props) {
  const [text, setText] = useState('')

  const addChip = (raw: string) => {
    const chip = raw.trim()
    if (!chip || values.includes(chip)) return
    onChange([...values, chip])
    setText('')
  }

  const removeChip = (chip: string) => {
    onChange(values.filter((v) => v !== chip))
  }

  const matches = suggestions.filter(
    (s) =>
      !values.includes(s) &&
      (text.trim().length === 0 ||
        s.toLowerCase().includes(text.trim().toLowerCase())),
  )

  return (
    <div className="chip-input">
      <div className="chip-input__chips">
        {values.map((chip) => (
          <button
            key={chip}
            type="button"
            className="chip"
            onClick={() => removeChip(chip)}
          >
            {chip} ×
          </button>
        ))}
        <input
          className="chip-input__field"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addChip(text)
            }
          }}
        />
      </div>
      {matches.length > 0 && (
        <div className="chip-input__suggestions">
          {matches.map((m) => (
            <button
              key={m}
              type="button"
              className="chip-input__suggestion"
              onClick={() => addChip(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
