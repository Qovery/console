import { ScrollArea } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'
import { Command, CommandGroup, CommandItem, CommandList, Command as CommandPrimitive, useCommandState } from 'cmdk'
import { type ComponentPropsWithoutRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { Button } from '../button/button'
import Icon from '../icon/icon'

// Inspired by https://github.com/origin-space/originui/blob/main/app/search/multiselect.tsx
// Missing light mode support, should be updated during navigation migration

export interface Option {
  value: string
  label: string
  description?: string
  disable?: boolean
  subOptions?: Exclude<Option, 'subOptions'>[]
  /** fixed option that can't be removed. */
  fixed?: boolean
  /** Group the options by providing key. */
  [key: string]: string | boolean | Option[] | undefined
}

interface GroupOption {
  [key: string]: Option[]
}

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  /** manually controlled options */
  options?: Option[]
  placeholder?: string
  /** Loading component. */
  loadingIndicator?: React.ReactNode
  /** Empty component. */
  emptyIndicator?: React.ReactNode
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   **/
  triggerSearchOnFocus?: boolean
  /** async search */
  onSearch?: (value: string) => Promise<Option[]>
  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   **/
  onSearchSync?: (value: string) => Option[]
  onChange?: (options: Option[]) => void
  /** Limit the maximum number of selected options. */
  maxSelected?: number
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  /** Group the options base on provided key. */
  groupBy?: string
  className?: string
  badgeClassName?: string
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean
  /** Allow user to have free text input. */
  freeTextInput?: boolean
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>
  /** Props of `CommandInput` */
  inputProps?: Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>, 'value' | 'placeholder' | 'disabled'>
  /** is loading. */
  isLoading?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {}
  }
  if (!groupBy) {
    return {
      '': options,
    }
  }

  const groupOption: GroupOption = {}
  options.forEach((option) => {
    const key = (option[groupBy] as string) || ''
    if (!groupOption[key]) {
      groupOption[key] = []
    }
    groupOption[key].push(option)
  })
  return groupOption
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => {
      // Remove if the option itself is picked
      if (picked.find((p) => p.value === val.value)) {
        return false
      }

      // Remove parent if any of its subOptions are picked
      if (val.subOptions && val.subOptions.length > 0) {
        const hasPickedChild = val.subOptions.some((subOption) => picked.find((p) => p.value === subOption.value))
        if (hasPickedChild) {
          return false
        }
      }

      return true
    })
  }
  return cloneOption
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (value.some((option) => targetOption.find((p) => p.value === option.value))) {
      return true
    }
  }
  return false
}

const CommandEmpty = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  const render = useCommandState((state) => state.filtered.count === 0)

  if (!render) return null

  return (
    <div className={twMerge('px-2 py-4 text-center text-sm', className)} cmdk-empty="" role="presentation" {...props} />
  )
}

interface ItemProps extends ComponentPropsWithoutRef<typeof CommandItem> {
  description?: string
}

const Item = ({ description, className, children, ...props }: ItemProps) => {
  return (
    <CommandItem
      className={twMerge(
        'group flex h-10 cursor-pointer items-center gap-2 p-1.5 hover:bg-neutral-400 data-[selected=true]:bg-neutral-400',
        className
      )}
      {...props}
    >
      <span className="whitespace-nowrap rounded-[4px] bg-neutral-500 p-1 pt-0.5">{children}</span>
      {description && (
        <span className="hidden text-xs text-neutral-300 group-data-[selected=true]:inline">{description}</span>
      )}
    </CommandItem>
  )
}

export const MultipleSelector = ({
  value,
  onChange,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  options: arrayOptions,
  delay,
  onSearch,
  onSearchSync,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  commandProps,
  inputProps,
  freeTextInput = false,
  isLoading: isLoadingProp = false,
}: MultipleSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [onScrollbar, setOnScrollbar] = useState(false)
  const [isLoading, setIsLoading] = useState(isLoadingProp)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoading(isLoadingProp)
  }, [isLoadingProp])

  useEffect(() => {
    if (inputProps?.autoFocus) {
      inputRef.current?.focus()
      setOpen(true)
    }
  }, [inputProps?.autoFocus])

  const [selected, setSelected] = useState<Option[]>(value || [])
  const [keyShowSubOptions, setKeyShowSubOptions] = useState<string | undefined>()
  const [options, setOptions] = useState<GroupOption>(transToGroupOption(arrayDefaultOptions, groupBy))
  const [inputValue, setInputValue] = useState('')
  const debouncedSearchTerm = useDebounce(inputValue, delay || 500)

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setOpen(false)
      inputRef.current.blur()
      setKeyShowSubOptions(undefined)
    }
  }

  const handleUnselect = useCallback(
    (option: Option) => {
      const newOptions = selected.filter((s) => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)

      if (newOptions.length > 0) {
        setOpen(false)
        inputRef.current?.blur()
      } else {
        setOpen(true)
        inputRef.current?.focus()
      }
    },
    [onChange, selected]
  )

  const handleEditOptionSelected = useCallback(
    (option: Option) => {
      const newOptions = selected.filter((s) => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)

      setInputValue((prev) => {
        return prev + option.value
      })

      setKeyShowSubOptions('')
      inputRef.current?.focus()
    },
    [onChange, selected]
  )

  const handleFreeTextInput = useCallback(() => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && trimmedValue.length > 0) {
      const existingOption = selected.find((s) => s.value === trimmedValue)
      if (!existingOption && selected.length < maxSelected) {
        setInputValue('')
        const newOption = { value: trimmedValue, label: trimmedValue }
        const newOptions = [...selected, newOption]
        setSelected(newOptions)
        onChange?.(newOptions)
        inputRef.current?.focus()
      } else if (existingOption) {
        setInputValue('')
        inputRef.current?.focus()
      } else if (selected.length >= maxSelected) {
        onMaxSelected?.(selected.length)
      }
    }
  }, [inputValue, selected, maxSelected, onChange, onMaxSelected])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && selected.length > 0) {
            const lastSelectOption = selected[selected.length - 1]
            // If last item is fixed, we should not remove it.
            if (!lastSelectOption.fixed) {
              handleUnselect(selected[selected.length - 1])
            }
            inputRef.current?.focus()
          }
        }
        // Handle free text input - create option on Space
        if (freeTextInput && e.key === 'Enter') {
          const selectedItemValue = e.currentTarget.querySelector('[data-selected="true"]')

          // Only handle free text input if no item is selected in the dropdown
          if (!selectedItemValue) {
            handleFreeTextInput()
          }
          // Otherwise, let the event propagate to trigger the item's onSelect
        }
        // This is not a default behavior of the <input /> field
        if (e.key === 'Escape') {
          input.blur()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleUnselect, selected, freeTextInput, handleFreeTextInput]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchend', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    if (value) {
      setSelected(value)
    }
  }, [value])

  useEffect(() => {
    /** If `onSearch` is provided, do not trigger options updated. */
    if (!arrayOptions || onSearch) {
      return
    }
    const newOption = transToGroupOption(arrayOptions || [], groupBy)
    if (JSON.stringify(newOption) !== JSON.stringify(options)) {
      setOptions(newOption)
    }
  }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

  useEffect(() => {
    /** sync search */
    const doSearchSync = () => {
      const res = onSearchSync?.(debouncedSearchTerm)
      setOptions(transToGroupOption(res || [], groupBy))
    }

    const exec = async () => {
      if (!onSearchSync || !open) return

      if (triggerSearchOnFocus) {
        doSearchSync()
      }

      if (debouncedSearchTerm) {
        doSearchSync()
      }
    }

    void exec()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

  useEffect(() => {
    /** async search */
    const doSearch = async () => {
      setIsLoading(true)
      const res = await onSearch?.(debouncedSearchTerm)
      setOptions(transToGroupOption(res || [], groupBy))
      setIsLoading(false)
    }

    const exec = async () => {
      if (!onSearch || !open) return

      if (triggerSearchOnFocus) {
        await doSearch()
      }

      if (debouncedSearchTerm) {
        await doSearch()
      }
    }

    void exec()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

  const CreatableItem = () => {
    if (!creatable) return undefined
    if (
      isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
      selected.find((s) => s.value === inputValue)
    ) {
      return undefined
    }

    const Item = (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onSelect={(value: string) => {
          if (selected.length >= maxSelected) {
            onMaxSelected?.(selected.length)
            return
          }
          setInputValue('')
          const newOptions = [...selected, { value, label: value }]
          setSelected(newOptions)
          onChange?.(newOptions)
          setOpen(false)
          inputRef.current?.blur()
        }}
      >
        {`Create "${inputValue}"`}
      </CommandItem>
    )

    // For normal creatable
    if (!onSearch && inputValue.length > 0) {
      return Item
    }

    // For async search creatable. avoid showing creatable item before loading at first.
    if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
      return Item
    }

    return undefined
  }

  const EmptyItem = useCallback(() => {
    if (!emptyIndicator) return undefined

    // For async search that showing emptyIndicator
    if (onSearch && !creatable && Object.keys(options).length === 0) {
      return (
        <CommandItem value="-" disabled>
          {emptyIndicator}
        </CommandItem>
      )
    }

    return <CommandEmpty>{emptyIndicator}</CommandEmpty>
  }, [creatable, emptyIndicator, onSearch, options])

  const selectables = useMemo<GroupOption>(() => removePickedOption(options, selected), [options, selected])

  const commandFilter = useCallback(() => {
    if (commandProps?.filter) {
      return commandProps.filter
    }

    if (freeTextInput) {
      return (value: string, search: string) => {
        if (value === 'confirm-search') {
          return 2
        }

        return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
      }
    }

    if (creatable) {
      return (value: string, search: string) => {
        return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
      }
    }
    // Using default filter in `cmdk`. We don&lsquo;t have to provide it.
    return undefined
  }, [creatable, commandProps?.filter, freeTextInput])

  return (
    <Command
      ref={dropdownRef}
      {...commandProps}
      onKeyDown={(e) => {
        handleKeyDown(e)
        commandProps?.onKeyDown?.(e)
      }}
      className={twMerge('h-auto overflow-visible bg-transparent', commandProps?.className)}
      shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch} // When onSearch is provided, we don&lsquo;t want to filter the options. You can still override it.
      filter={commandFilter()}
    >
      <div
        className={twMerge(
          clsx(
            'has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 relative h-9 rounded border border-neutral-400 text-sm outline-none transition-colors focus-within:border-neutral-350 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-0 focus-within:outline-neutral-400 hover:border-neutral-350',
            {
              'cursor-text': !disabled && selected.length !== 0,
            },
            className
          )
        )}
        onClick={() => {
          if (disabled) return
          inputRef?.current?.focus()
        }}
      >
        <div className="relative flex h-full w-full pl-11">
          <div className="absolute left-[1px] top-0 flex h-[34px] w-7 items-center justify-end rounded-l bg-neutral-600 after:absolute after:-right-[12px] after:top-0 after:block after:h-full after:w-3 after:bg-neutral-600 after:content-['']">
            {isLoading ? (
              <Icon iconName="loader" iconStyle="regular" className="ml-0.5 mt-[1px] animate-spin text-neutral-250" />
            ) : (
              <Icon iconName="magnifying-glass" iconStyle="regular" className="ml-0.5 mt-[1px] text-neutral-250" />
            )}
          </div>
          <div className="flex w-full items-center gap-1 overflow-scroll">
            {selected.map((option) => {
              return (
                <span
                  role="button"
                  key={option.value}
                  className={twMerge(
                    clsx(
                      'relative inline-flex h-7 cursor-default items-center whitespace-nowrap rounded bg-neutral-500 p-1 pe-6 text-sm text-neutral-50 transition-colors hover:bg-neutral-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                      badgeClassName
                    )
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                  onKeyDown={(e) => {
                    if (disabled) return

                    if (e.key === 'Enter') {
                      handleEditOptionSelected(option)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (disabled) return

                    handleEditOptionSelected(option)
                  }}
                >
                  {option.label}
                  <button
                    className="outline-hidden absolute right-0 top-[3px] flex size-6 items-center justify-center border border-transparent p-0 text-neutral-50 outline-none transition-colors hover:text-neutral-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnselect(option)
                    }}
                    aria-label="Remove"
                  >
                    <Icon iconName="xmark" iconStyle="regular" />
                  </button>
                </span>
              )
            })}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(value) => {
                setInputValue(value)
                inputProps?.onValueChange?.(value)
              }}
              onBlur={(event) => {
                if (!onScrollbar) {
                  setOpen(false)
                }
                inputProps?.onBlur?.(event)
              }}
              onFocus={(event) => {
                setOpen(true)
                if (triggerSearchOnFocus) {
                  onSearch?.(debouncedSearchTerm)
                }
                inputProps?.onFocus?.(event)
              }}
              placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
              className={twMerge(
                clsx(
                  'h-full flex-1 bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-250 disabled:cursor-not-allowed',
                  {
                    'w-full': hidePlaceholderWhenSelected,
                    'pe-3': selected.length === 0,
                    'ml-1': selected.length !== 0,
                  },
                  inputProps?.className
                )
              )}
            />
          </div>
        </div>
        {selected.length > 0 && (
          <div className="absolute right-0 top-0 flex h-[34px] w-6 items-center justify-center rounded-r bg-neutral-600 before:absolute before:-left-7 before:top-0 before:block before:h-full before:w-7 before:bg-gradient-to-r before:from-transparent before:to-neutral-600 before:content-['']">
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded border border-transparent p-0 text-xs text-neutral-250 hover:text-neutral-50 focus:border-neutral-250 focus:text-neutral-50 focus:outline-none"
              onClick={() => {
                setSelected(selected.filter((s) => s.fixed))
                onChange?.(selected.filter((s) => s.fixed))
                setInputValue('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(selected.filter((s) => s.fixed))
                  onChange?.(selected.filter((s) => s.fixed))
                  setInputValue('')
                }
              }}
              aria-label="Clear all"
            >
              <Icon iconName="xmark" iconStyle="regular" />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <div
          className={twMerge(
            clsx(
              'absolute top-2 z-[9999] w-full overflow-hidden',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              !open && 'hidden'
            )
          )}
          data-state={open ? 'open' : 'closed'}
        >
          {open && !isLoading && (
            <CommandList
              className="max-h-none overflow-hidden rounded-md border border-neutral-400 bg-neutral-600 text-sm text-neutral-50 shadow-lg"
              onMouseLeave={() => {
                setOnScrollbar(false)
              }}
              onMouseEnter={() => {
                setOnScrollbar(true)
              }}
              onMouseUp={() => {
                inputRef?.current?.focus()
              }}
            >
              <>
                {EmptyItem()}
                {CreatableItem()}
                {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                {freeTextInput && (
                  <CommandGroup heading="" className="px-0 py-1 pb-0">
                    <CommandItem
                      value="confirm-search"
                      className="flex h-10 cursor-pointer items-center gap-2 rounded-sm p-1.5 pl-2.5 transition-colors hover:bg-neutral-400 data-[selected=true]:bg-neutral-400"
                      onSelect={() => {
                        onChange?.(selected)
                        handleFreeTextInput()
                        setOpen(false)
                        inputRef.current?.focus()
                      }}
                    >
                      <Icon iconName="arrow-turn-down-right" iconStyle="regular" className="relative top-[1px]" />
                      Confirm search
                    </CommandItem>
                  </CommandGroup>
                )}
                {Object.entries(selectables).map(([key, dropdowns]) => (
                  <ScrollArea key={key} className="*:max-h-48 sm:*:max-h-80">
                    <CommandGroup heading={key} className="px-0 py-1">
                      {dropdowns.map((option) => {
                        return (
                          <div key={option.value}>
                            {!keyShowSubOptions && (
                              <Item
                                value={option.value}
                                description={option.description}
                                disabled={option.disable}
                                onMouseDown={(e) => {
                                  console.log('onMouseDown', option.value)
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                onSelect={() => {
                                  if (option.subOptions && option.subOptions.length > 0) {
                                    setKeyShowSubOptions(option.value)
                                    return
                                  }

                                  if (selected.length >= maxSelected) {
                                    onMaxSelected?.(selected.length)
                                    return
                                  }

                                  if (freeTextInput) {
                                    setInputValue(option.value)
                                    inputRef.current?.focus()
                                    return
                                  }

                                  setInputValue('')
                                  const newOptions = [...selected, option]
                                  setSelected(newOptions)
                                  onChange?.(newOptions)
                                  inputRef.current?.focus()
                                }}
                                className={clsx(option.disable && 'pointer-events-none cursor-not-allowed opacity-50')}
                              >
                                {option.label}
                              </Item>
                            )}
                            {option.subOptions &&
                              option.subOptions.length > 0 &&
                              keyShowSubOptions === option.value && (
                                <div>
                                  {option.subOptions.map((subOption) => (
                                    <Item
                                      key={subOption.value}
                                      value={subOption.value}
                                      description={subOption.description}
                                      disabled={subOption.disable}
                                      onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                      }}
                                      onSelect={() => {
                                        if (selected.length >= maxSelected) {
                                          onMaxSelected?.(selected.length)
                                          return
                                        }
                                        setInputValue('')
                                        setKeyShowSubOptions(undefined)
                                        const newOptions = [...selected, subOption]
                                        setSelected(newOptions)
                                        onChange?.(newOptions)
                                        inputRef.current?.focus()
                                      }}
                                      className={clsx(
                                        subOption.disable && 'pointer-events-none cursor-not-allowed opacity-50'
                                      )}
                                    >
                                      {subOption.label}
                                    </Item>
                                  ))}
                                </div>
                              )}
                          </div>
                        )
                      })}
                    </CommandGroup>
                  </ScrollArea>
                ))}
              </>
            </CommandList>
          )}
        </div>
      </div>
    </Command>
  )
}

MultipleSelector.displayName = 'MultipleSelector'
export default MultipleSelector
