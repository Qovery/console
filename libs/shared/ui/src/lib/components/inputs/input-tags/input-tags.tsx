import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import Icon from '../../icon/icon'

export interface InputTagsProps {
  label: string
  tags: string[]
  placeholder?: string
  onChange?: (value: string[]) => void
  className?: string
  dataTestId?: string
}

export function InputTags(props: InputTagsProps) {
  const { label, tags, placeholder = 'Add new tag', onChange, className = '', dataTestId = 'input-tags' } = props

  const [currentTags, setCurrentTags] = useState(tags || [])
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (tags?.length > 0) setCurrentTags(tags)
  }, [tags, setCurrentTags])

  const ref = useRef<HTMLInputElement>(null)
  const hasFocus = focused
  const hasLabelUp = hasFocus || currentTags?.length > 0 ? 'input--label-up' : ''

  const inputActions = hasFocus ? 'input--focused' : ''

  const handleKeyDown = (event: FormEvent<HTMLInputElement>) => {
    const key = (event as KeyboardEvent<HTMLInputElement>).key
    const target = event.target as HTMLInputElement
    const value = target.value

    // remove tag
    if (key === 'Backspace') {
      value.length === 0 && currentTags.length > 0 && removeTag(currentTags.length - 1)
    }

    // add tag
    if (key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      if (!value.trim()) return
      if (currentTags.find((v) => value.toLowerCase() === v.toLowerCase())) return

      const newTags = [...currentTags, value]
      setCurrentTags(newTags)
      setInputValue('')
      onChange && onChange(newTags)
    }
  }

  const removeTag = (index: number) => {
    const newTags = currentTags.filter((el: string, i: number) => i !== index)
    setCurrentTags(newTags)
    onChange && onChange(newTags)
  }

  return (
    <div
      data-testid={dataTestId}
      className={`input ${inputActions} ${hasLabelUp} ${
        focused || currentTags?.length > 0 ? '!pb-1' : ''
      } ${className}`}
      onClick={() => ref?.current?.focus()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <label className={`${hasFocus ? 'text-xs' : 'translate-y-2 text-sm'}`}>{label}</label>
      <div className={`${focused || currentTags?.length > 0 ? 'pt-3' : ''}`}>
        {currentTags.map((tag, index) => (
          <div
            data-testid={`input-tags-${index}`}
            key={index}
            className="relative mr-1 mt-1 inline-flex h-7 select-none items-center rounded-[33px] border border-neutral-300 bg-neutral-100 pl-3 pr-7 text-sm text-neutral-400"
          >
            <span className="text">{tag}</span>
            <div
              data-testid={`input-tags-remove-${index}`}
              onClick={() => removeTag(index)}
              className="transition-background absolute right-1 top-[6px] flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs duration-200 ease-out hover:bg-neutral-200 "
            >
              <Icon iconName="xmark" />
            </div>
          </div>
        ))}
        <input
          ref={ref}
          data-testid="input-tags-field"
          onKeyDown={handleKeyDown}
          type="text"
          className={`${!focused ? 'text-transparent' : ''} ${
            focused || currentTags?.length > 0 || inputValue.length > 0
              ? 'inline-flex text-ssm text-neutral-400'
              : 'absolute left-0 top-0 h-full w-full bg-transparent'
          }`}
          placeholder={currentTags?.length > 0 ? placeholder : ''}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          value={inputValue}
        />
      </div>
    </div>
  )
}

export default InputTags
