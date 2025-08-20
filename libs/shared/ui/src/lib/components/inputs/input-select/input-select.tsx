import { type ReactNode, useEffect, useId, useMemo, useState } from 'react'
import Select, {
  type GroupBase,
  type MenuListProps,
  type MenuPlacement,
  type MultiValue,
  type MultiValueProps,
  type NoticeProps,
  type OptionProps,
  type Props as SelectProps,
  type SingleValue,
  type SingleValueProps,
  components,
} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { P, match } from 'ts-pattern'
import { type SelectOption, type SelectOptionValue } from '@qovery/shared/interfaces'
import { Icon } from '../../icon/icon'
import { LoaderSpinner } from '../../loader-spinner/loader-spinner'

// Helper function to compare SelectOptionValue types
const isEqualValue = (a: SelectOptionValue, b: SelectOptionValue): boolean => {
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b
  }

  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    // For GitRepository objects, compare by name property
    if ('name' in a && 'name' in b) {
      return a.name === b.name
    }
    // Fallback to JSON comparison for other objects
    return JSON.stringify(a) === JSON.stringify(b)
  }

  return false
}

export interface InputSelectProps {
  className?: string
  label?: string
  value?: SelectOptionValue | SelectOptionValue[]
  options: SelectOption[]
  disabled?: boolean
  hint?: ReactNode
  error?: string
  onChange?: (e: SelectOptionValue | SelectOptionValue[]) => void
  onInputChange?: (e: string) => void
  dataTestId?: string
  isMulti?: true
  portal?: boolean
  isSearchable?: boolean
  isClearable?: boolean
  menuListButton?: {
    label: string
    onClick: () => void
    icon?: ReactNode
    title?: string
  }
  isFilter?: boolean
  autoFocus?: boolean
  placeholder?: string
  menuPlacement?: MenuPlacement
  filterOption?: 'fuzzy' | 'startsWith'
  isCreatable?: boolean
  isLoading?: boolean
  minInputLength?: number
  formatCreateLabel?: ((inputValue: string) => ReactNode) | undefined
  isValidNewOption?: (inputValue: string) => boolean
}

export function InputSelect({
  className = '',
  label,
  value,
  options,
  disabled,
  hint,
  error,
  portal,
  onChange,
  onInputChange,
  dataTestId,
  isMulti = undefined,
  isSearchable = false,
  isClearable = false,
  isFilter = false,
  isLoading = false,
  autoFocus = false,
  placeholder,
  menuListButton,
  menuPlacement = 'auto',
  filterOption = 'fuzzy',
  isCreatable = false,
  minInputLength = 0,
  formatCreateLabel,
  isValidNewOption,
}: InputSelectProps) {
  const [focused, setFocused] = useState(false)
  const [selectedItems, setSelectedItems] = useState<MultiValue<SelectOption> | SingleValue<SelectOption>>([])
  const [selectedValue, setSelectedValue] = useState<SelectOptionValue | SelectOptionValue[]>([])

  const selectedWithIconClassName = 'ml-8'

  const hasFocus = focused
  const hasError = error ? 'input--error' : ''

  const handleChange = (items: MultiValue<SelectOption> | SingleValue<SelectOption>) => {
    setSelectedItems(items)

    if (isMulti) {
      const vals = (items as MultiValue<SelectOption>).map((item) => item.value)
      onChange && onChange(vals)
      setSelectedValue(vals)
    } else {
      if (items) {
        onChange && onChange((items as SelectOption).value)
        setSelectedValue((items as SelectOption).value)
      }
    }
  }

  useEffect(() => {
    // TODO [QOV-1072] double check if this is correct / needed
    const items = options.filter((option) => {
      if (isMulti) {
        return (value as SelectOptionValue[])?.some((val) => isEqualValue(val, option.value))
      } else {
        if (Array.isArray(value)) {
          return (value as SelectOptionValue[])?.some((val) => isEqualValue(val, option.value))
        } else {
          return isEqualValue(option.value, value as SelectOptionValue)
        }
      }
    })

    items && setSelectedItems(items)
    if (isMulti) {
      setSelectedValue(items.map((item) => item.value))
    } else {
      if (items && items.length > 0) {
        setSelectedValue(items[0]?.value)
      }
    }
  }, [value, isMulti, options])

  const MenuList = (props: MenuListProps<SelectOption, true, GroupBase<SelectOption>>) => (
    <div role="listbox">
      <components.MenuList {...props}>
        {menuListButton && (
          <div className={`flex h-9 items-start p-1 ${menuListButton.title ? 'justify-between' : 'justify-end'}`}>
            {menuListButton.title && (
              <span className="text-sm font-medium text-neutral-350">{menuListButton.title}</span>
            )}
            <button
              type="button"
              data-testid="input-menu-list-button"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 transition duration-100 hover:text-brand-600"
              onClick={menuListButton.onClick}
            >
              {menuListButton.label}
              <Icon iconName="circle-plus" iconStyle="regular" className="text-xs leading-5" />
            </button>
          </div>
        )}
        {props.children}
      </components.MenuList>
    </div>
  )

  const Option = (props: OptionProps<SelectOption, true, GroupBase<SelectOption>>) => {
    const id = useId()
    return (
      <div role="option" aria-labelledby={id}>
        <components.Option {...props}>
          {isMulti ? (
            <span className="input-select__checkbox">
              {props.isSelected && <Icon iconName="check" className="text-xs" />}
            </span>
          ) : props.isSelected ? (
            <Icon iconName="check" className="text-green-500" />
          ) : props.data.icon ? (
            <div className="flex h-full w-4 items-center justify-center">{props.data.icon}</div>
          ) : (
            <Icon iconName="check" className="opacity-0" />
          )}
          <label id={id} className="ml-2 flex flex-col gap-0.5 truncate text-sm">
            {props.label}
            {props.data.description && <span className="font-normal">{props.data.description}</span>}
          </label>
        </components.Option>
      </div>
    )
  }

  const MultiValue = (props: MultiValueProps<SelectOption, true, GroupBase<SelectOption>>) => (
    <span className="mr-1 flex text-sm text-neutral-400">
      {props.data.label}
      {props.index + 1 !== (selectedItems as MultiValue<SelectOption>).length && ', '}
    </span>
  )

  const SingleValue = (props: SingleValueProps<SelectOption>) => (
    <span className="mr-1 text-sm text-neutral-400">
      {props.data.label}
      {props.data.description ? `: ${props.data.description}` : ''}
    </span>
  )

  const NoOptionsMessage = (props: NoticeProps<SelectOption>) => {
    const value = props.selectProps.inputValue

    if (value.length <= minInputLength) {
      return (
        <components.NoOptionsMessage {...props}>
          <div className="px-3 py-1 text-center">
            <p className="text-xs font-medium text-neutral-350">
              Search input must be at least {minInputLength} characters.
            </p>
          </div>{' '}
        </components.NoOptionsMessage>
      )
    }

    return (
      <components.NoOptionsMessage {...props}>
        <div className="px-3 py-6 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
        </div>
      </components.NoOptionsMessage>
    )
  }

  const LoadingMessage = (props: NoticeProps<SelectOption>) => {
    return (
      <components.LoadingMessage {...props}>
        <div className="flex justify-center">
          <LoaderSpinner className="w-4" />
        </div>
      </components.LoadingMessage>
    )
  }

  // TODO [QOV-1072] double check if this is correct
  const selectedOption = options.find((option) => {
    if (isMulti) {
      return Array.isArray(selectedValue) && selectedValue.some((val) => isEqualValue(option.value, val))
    } else {
      return isEqualValue(option.value, selectedValue as SelectOptionValue)
    }
  })
  const hasIcon = !isMulti && selectedOption?.icon

  const inputActions =
    hasFocus && !disabled
      ? '!border-brand-500 !shadow-[0_2px_2px_rgba(0, 0, 0, 0.05)] input--focused'
      : disabled
        ? '!bg-neutral-100 !border-neutral-250 !pointer-events-none'
        : hasError
          ? 'input--error'
          : ''

  const hasLabelUp = useMemo(() => {
    return hasFocus || selectedOption ? 'input--label-up' : ''
  }, [hasFocus, selectedOption])

  const selectProps: SelectProps<SelectOption, true, GroupBase<SelectOption>> = {
    autoFocus,
    options,
    isMulti,
    components: {
      Option,
      MultiValue,
      SingleValue,
      NoOptionsMessage,
      MenuList,
      LoadingMessage,
    },
    name: label,
    isLoading,
    inputId: label,
    menuPlacement,
    closeMenuOnSelect: !isMulti,
    onChange: handleChange,
    onInputChange,
    classNamePrefix: 'input-select',
    hideSelectedOptions: false,
    isSearchable,
    placeholder,
    isClearable,
    isDisabled: disabled,
    value: selectedItems,
    menuPortalTarget: portal ? document.body : undefined,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    styles: {
      menuPortal: (base) => ({
        ...base,
        pointerEvents: 'auto',
        marginTop: `-${document.body.style.marginTop ? document.body.style.marginTop : 0}`,
      }),
    },
    defaultMenuIsOpen: isFilter ? true : undefined,
    filterOption: match(filterOption)
      .with('fuzzy', () => undefined)
      .with('startsWith', () => ({ value }: SelectOption, inputValue: string) => {
        return match(value)
          .with(P.string, (val) => val?.startsWith(inputValue.toLowerCase()) ?? false)
          .otherwise((val) => JSON.stringify(val).toLowerCase().includes(inputValue.toLowerCase()))
      })
      .exhaustive(),
  }

  const SelectComponent = isCreatable ? CreatableSelect : Select

  return (
    <div className={className}>
      <div
        className={`input input--select ${hasIcon ? 'input--has-icon' : ''} ${inputActions} ${
          disabled ? '!border-neutral-250 !bg-neutral-100' : ''
        } ${isFilter ? 'input--filter' : ''}`}
        data-testid={dataTestId || 'select'}
      >
        {hasIcon && (
          <div
            data-testid="selected-icon"
            className="absolute left-0 top-0 flex h-full w-12 items-center justify-center"
          >
            {selectedOption.icon}
          </div>
        )}
        {label && (
          <label
            htmlFor={label}
            className={
              hasIcon
                ? `!translate-y-0 !text-xs ${selectedWithIconClassName}`
                : `${hasLabelUp ? '!translate-y-0 !text-xs' : 'top-1.5 translate-y-2 text-sm'}`
            }
          >
            {label}
          </label>
        )}
        <SelectComponent
          data-testid="select-react-select"
          {...selectProps}
          isValidNewOption={isValidNewOption}
          formatCreateLabel={formatCreateLabel ?? ((value) => `Select "${value}"`)}
        />

        <input type="hidden" name={label} value={selectedValue.toString()} />

        {!isFilter && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <Icon name="icon-solid-angle-down" className="text-sm text-neutral-400" />
          </div>
        )}
        {selectedOption?.onClickEditable && (
          <div
            data-testid="selected-edit-icon"
            className="absolute right-8 top-[10px] flex h-8 w-8 cursor-pointer items-center justify-center text-sm text-neutral-400 hover:text-brand-500"
            onClick={(event) => {
              event.stopPropagation()
              selectedOption.onClickEditable && selectedOption.onClickEditable()
            }}
          >
            <Icon iconName="pen" />
          </div>
        )}
      </div>
      {hint && <p className="mt-0.5 px-3 text-xs font-normal text-neutral-350">{hint}</p>}
      {error && <p className="mt-0.5 px-3 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

export default InputSelect
