import { useRef } from 'react'
import { Button, Icon, InputTextSmall, type InputTextSmallProps } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import DropdownVariable from '../dropdown-variable/dropdown-variable'

export interface FieldVariableSuggestionProps {
  environmentId: string
  onChange: (value: string) => void
  inputProps: InputTextSmallProps
  value?: string
  className?: string
}

export function FieldVariableSuggestion({
  environmentId,
  onChange,
  className,
  inputProps,
  value = '',
}: FieldVariableSuggestionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleInsertVariable = (variableKey: string) => {
    const input = inputRef.current
    if (!input) return

    const startPos = input.selectionStart ?? 0
    const endPos = input.selectionEnd ?? 0

    const newValue = value.substring(0, startPos) + `{{${variableKey}}}` + value.substring(endPos)

    onChange(newValue)
  }

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <div className={twMerge('flex w-[calc(100%+36px)]', className)}>
      <InputTextSmall ref={inputRef} {...inputProps} inputClassName="pr-11" />
      <DropdownVariable environmentId={environmentId} onChange={handleInsertVariable}>
        <Button
          size="md"
          type="button"
          color="neutral"
          variant="surface"
          className="relative right-[37px] top-[1px] h-[34px] w-9 justify-center rounded-l-none border-b-0 border-r-0 border-t-0 hover:!border-neutral-250"
        >
          <Icon className="text-sm" iconName="wand-magic-sparkles" />
        </Button>
      </DropdownVariable>
    </div>
  )
}

export default FieldVariableSuggestion
