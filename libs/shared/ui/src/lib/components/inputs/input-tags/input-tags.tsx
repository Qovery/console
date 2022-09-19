import { useEffect, useState } from 'react'
import { WithContext as Tags } from 'react-tag-input'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

export interface TagInterface {
  id: string
  text: string
}

export interface InputTagsProps {
  label: string
  tags: string[]
  placeholder?: string
  onChange?: (value: string[]) => void
}

const removeComponent = (props: any) => {
  return (
    <div
      onClick={props.onRemove}
      className="flex items-center justify-center w-4 h-4 rounded-full absolute top-[6px] right-1 text-xs cursor-pointer hover:bg-element-light-lighter-400 transition-background ease-out duration-200 "
    >
      <Icon name={IconAwesomeEnum.CROSS} />
    </div>
  )
}

const transformValues = (tags: string[]) => {
  return tags?.length > 0 ? tags.map((tag) => ({ id: tag, text: tag })) : []
}

export function InputTags(props: InputTagsProps) {
  const { label, tags, placeholder = 'Add new tag', onChange } = props

  const [currentTags, setCurrentTags] = useState(transformValues(tags) || [])
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (tags?.length > 0) setCurrentTags(transformValues(tags))
  }, [tags, setCurrentTags])

  const hasFocus = focused
  const hasLabelUp = hasFocus || currentTags?.length > 0 ? 'input--label-up' : ''

  const inputActions = hasFocus ? 'input--focused' : ''

  const handleDelete = (i: number) => {
    const newTags = currentTags.filter((tag: TagInterface, index: number) => index !== i)
    setCurrentTags(newTags)
    onChange && onChange(newTags.map((tag) => tag.id))
  }

  const handleAddition = (tag: TagInterface) => {
    const newTags = [...currentTags, tag]
    setCurrentTags(newTags)
    onChange && onChange(newTags.map((tag) => tag.id))
  }

  const handleDrag = (tag: TagInterface, currPos: number, newPos: number) => {
    const newTags = currentTags.slice()

    newTags.splice(currPos, 1)
    newTags.splice(newPos, 0, tag)

    setCurrentTags(newTags)
  }

  return (
    <div
      className={`input ${inputActions} ${hasLabelUp} ${focused || currentTags?.length > 0 ? '!pb-1' : ''}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <label className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>{label}</label>
      <Tags
        tags={currentTags}
        classNames={{
          tags: `${focused || currentTags?.length > 0 ? 'pt-3' : ''}`,
          tag: 'relative inline-flex items-center rounded-[33px] bg-element-light-lighter-200 border border-element-light-lighter-600 pl-3 pr-7 h-7 mr-1 mt-1 text-sm text-text-600',
          tagInput: 'inline-flex',
          selected: 'inline',
          tagInputField: `${!focused ? 'text-transparent' : ''} ${
            focused || currentTags?.length > 0
              ? 'inline-flex text-text-600 text-ssm'
              : 'absolute top-0 left-0 w-full h-full bg-transparent'
          }`,
        }}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleDrag={handleDrag}
        removeComponent={removeComponent as any}
        inputFieldPosition="bottom"
        placeholder={currentTags?.length > 0 ? placeholder : ''}
        autocomplete
        autofocus={focused}
      />
    </div>
  )
}

export default InputTags
