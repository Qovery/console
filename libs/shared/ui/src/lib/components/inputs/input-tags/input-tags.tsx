import { useState } from 'react'
import { WithContext as Tags } from 'react-tag-input'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

export interface TagInterface {
  id: string
  text: string
}

export interface InputTagsProps {
  label: string
  tags: TagInterface[]
  placeholder?: string
}

const removeComponent = (props: any) => {
  const { onRemove } = props

  return (
    <div onClick={onRemove} className="absolute right-2 text-xs">
      <Icon name={IconAwesomeEnum.CROSS} />
    </div>
  )
}

export function InputTags(props: InputTagsProps) {
  const { label, tags, placeholder = 'Add new tag' } = props

  const [currentTags, setCurrentTags] = useState(tags)
  const [focused, setFocused] = useState(false)

  const hasFocus = focused
  const hasLabelUp = hasFocus || currentTags.length > 0 ? 'input--label-up' : ''

  const inputActions = hasFocus ? 'input--focused' : ''

  const handleDelete = (i: number) => {
    setCurrentTags(currentTags.filter((tag: TagInterface, index: number) => index !== i))
  }

  const handleAddition = (tag: TagInterface) => {
    setCurrentTags([...currentTags, tag])
  }

  const handleDrag = (tag: TagInterface, currPos: number, newPos: number) => {
    const newTags = currentTags.slice()

    newTags.splice(currPos, 1)
    newTags.splice(newPos, 0, tag)

    setCurrentTags(newTags)
  }

  return (
    <div
      className={`input ${inputActions} ${hasLabelUp} ${currentTags.length > 0 ? '!pb-1' : ''}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <label className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>{label}</label>
      <Tags
        tags={currentTags}
        classNames={{
          tags: `${focused || currentTags.length > 0 ? 'pt-3' : ''}`,
          tag: 'relative inline-flex items-center rounded-[33px] bg-element-light-lighter-200 hober:bg-element-ligth-ligther-300 border border-element-light-lighter-600 pl-3 pr-7 h-7 mr-1 mt-1 text-sm text-text-600',
          tagInput: 'inline-flex',
          selected: 'inline',
          tagInputField: `${
            focused || currentTags.length > 0
              ? 'inline-flex text-text-600 text-ssm'
              : 'absolute top-0 left-0 w-full h-full bg-transparent'
          }`,
        }}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleDrag={handleDrag}
        removeComponent={removeComponent as any}
        inputFieldPosition="bottom"
        placeholder={focused ? placeholder : ''}
        autocomplete
        autofocus={focused}
      />
    </div>
  )
}

export default InputTags
