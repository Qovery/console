import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropdownVariable } from '@qovery/domains/variables/feature'
import { Badge, Button, Checkbox, Icon, LoaderSpinner, Tooltip, truncateText } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { TfvarsFilesPopover } from '../terraform-tfvars-popover/terraform-tfvars-popover'
import { SECRET_UNCHANGED_VALUE, type UIVariable, useTerraformVariablesContext } from '../terraform-variables-context'
import {
  formatSource,
  getSourceBadgeClassName,
  isCustomVariable,
  isVariableChanged,
} from '../terraform-variables-utils'

const SourceCell = ({ variable }: { variable: UIVariable }) => {
  const sourceCellRef = useRef<HTMLDivElement>(null)
  const text = formatSource(variable)
  const truncateLimit = 40
  const [doesOverflow, setDoesOverflow] = useState(false)

  const handleResize = () => {
    if (sourceCellRef.current) {
      setDoesOverflow(sourceCellRef.current.scrollWidth > sourceCellRef.current.clientWidth)
    }
  }

  useEffect(() => {
    handleResize()
    // On resize, check if the tooltip should be displayed
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const Wrapper = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      const shouldDisplayTooltip = text.length >= truncateLimit || doesOverflow
      return shouldDisplayTooltip ? <Tooltip content={text}>{children}</Tooltip> : children
    },
    [text, truncateLimit, doesOverflow]
  )

  return (
    <div
      className="no-scrollbar inline-flex h-full items-center overflow-y-auto border-r border-neutral-250 px-2 lg:px-4"
      ref={sourceCellRef}
    >
      <Badge className={twMerge(getSourceBadgeClassName(variable), 'font-medium')} variant="surface">
        <Wrapper>
          <span>
            {truncateText(text, truncateLimit)}
            {text.length > truncateLimit ? '...' : ''}
          </span>
        </Wrapper>
      </Badge>
    </div>
  )
}

const VariableRow = ({ variable }: { variable: UIVariable }) => {
  const { updateKey, updateValue, toggleSecret, revertValue, isRowSelected, selectRow, hoveredRow, errors } =
    useTerraformVariablesContext()
  const { environmentId = '' } = useParams()
  const [isVariablePopoverOpen, setIsVariablePopoverOpen] = useState(false)
  const [isCellHovered, setIsCellHovered] = useState(false)
  const [focusedCell, setFocusedCell] = useState<string | undefined>(undefined)
  const isCellFocused = useCallback((cell: 'key' | 'value') => focusedCell === cell, [focusedCell])
  const isMultiline = useMemo(() => variable.value.includes('\n') || variable.value.length > 30, [variable.value])
  const textareaValueRef = useRef<HTMLTextAreaElement | null>(null)
  const textareaMinHeight = useMemo(() => {
    return isMultiline ? `${Math.min(Math.max(variable.value.split('\n').length * 20 + 24, 44), 120)}px` : 'auto'
  }, [isMultiline, variable.value])
  const isSecretPlaceholder = useMemo(() => {
    return variable.secret && !isCellFocused('value')
  }, [variable.secret, isCellFocused])

  const focusValueTextarea = useCallback(() => {
    if (textareaValueRef.current) {
      textareaValueRef.current.focus()
    }
  }, [])

  const onValueCellClick = useCallback(() => {
    // If variable is not a secret, focus the textarea.
    // In case of a secret, we want to let the user explicitly click on the edit icon to edit the secret value.
    if (!isSecretPlaceholder) {
      focusValueTextarea()
    }
  }, [isSecretPlaceholder, focusValueTextarea])

  return (
    <div className="w-full border-b border-neutral-250">
      <div
        className={twMerge(
          'grid min-h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_52px] items-center',
          hoveredRow ? (hoveredRow === variable.source ? 'bg-neutral-100' : 'bg-white') : 'bg-white',
          isRowSelected(variable.id) && 'bg-neutral-150 hover:bg-neutral-150',
          isMultiline && 'min-h-auto'
        )}
      >
        <div className="flex h-full items-center justify-center border-r border-neutral-250">
          <Checkbox
            checked={isRowSelected(variable.id)}
            onCheckedChange={() => selectRow(variable.id)}
            disabled={!isCustomVariable(variable)}
          />
        </div>
        {/* Variable name cell */}
        <div
          className={twMerge(
            'h-full border-r border-neutral-250 transition-all duration-100',
            isCustomVariable(variable) && 'hover:bg-neutral-100',
            (isCellFocused('key') || isRowSelected(variable.id)) && 'bg-neutral-150 hover:bg-neutral-150',
            errors.get(variable.id)?.field === 'key' && 'border border-red-500'
          )}
        >
          <div className="flex h-full w-full items-center">
            {variable.isNew ? (
              <input
                name="key"
                value={variable.key}
                onChange={(e) => {
                  updateKey(variable.id, e.target.value)
                }}
                className={twMerge(
                  'peer h-full w-full bg-transparent px-4 text-sm outline-none',
                  isCellFocused('key') && 'bg-neutral-150 hover:bg-neutral-150'
                )}
                onFocus={() => setFocusedCell('key')}
                onBlur={() => setFocusedCell(undefined)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                placeholder="Variable name"
                spellCheck={false}
              />
            ) : (
              <span className="px-4 text-sm text-neutral-350">{variable.key}</span>
            )}
            {variable.description && (
              <Tooltip content={variable.description}>
                <span
                  className="-ml-2 text-neutral-300 hover:text-neutral-400"
                  role="img"
                  aria-label="Variable description"
                  data-tooltip-content={variable.description}
                >
                  <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
                </span>
              </Tooltip>
            )}
            {errors.get(variable.id)?.field === 'key' && (
              <Tooltip content={errors.get(variable.id)?.message}>
                <div className="mr-4">
                  <Icon iconName="circle-exclamation" iconStyle="regular" className="text-red-500" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        {/* Variable value cell */}
        <div
          className={twMerge(
            'group relative flex h-full min-h-[44px] items-center border-r border-neutral-250',
            errors.get(variable.id)?.field === 'value' && 'border border-red-500'
          )}
          onMouseEnter={() => {
            setIsCellHovered(true)
          }}
          onMouseLeave={(e) => {
            if (e.relatedTarget === window) {
              return
            }
            setIsCellHovered(false)
          }}
        >
          <div
            className={twMerge(
              // Ensure the pseudo-element is behind by using after:-z-10
              'relative z-0 flex h-full w-full items-center after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:top-0 after:-z-10 after:h-full after:w-full after:transition-all after:duration-100 group-hover:after:bg-neutral-100',
              isCellFocused('value') && 'after:bg-neutral-150 group-hover:after:bg-neutral-150',
              !isSecretPlaceholder && 'cursor-text'
            )}
            onClick={onValueCellClick}
          >
            {isSecretPlaceholder && (
              <div className="absolute left-0 top-0 flex h-full w-full cursor-default items-center gap-2 bg-white px-4 transition-all duration-100 group-hover:bg-neutral-100">
                <span className="text-xs text-neutral-350" data-testid="hide_value_secret">
                  ● ● ● ● ● ● ● ●
                </span>
              </div>
            )}
            <textarea
              ref={textareaValueRef}
              name="value"
              value={variable.secret && variable.value === SECRET_UNCHANGED_VALUE ? '' : variable.value}
              onChange={(e) => {
                updateValue(variable.id, e.target.value)
              }}
              onFocus={() => setFocusedCell('value')}
              onBlur={() => setFocusedCell(undefined)}
              className={twMerge(
                'vertical-align-middle h-5 w-full resize-none bg-transparent px-4 text-sm text-neutral-400 outline-none',
                isMultiline && 'h-full min-h-5 resize-y py-3'
              )}
              style={{ minHeight: textareaMinHeight }}
              spellCheck={false}
              placeholder="Variable value"
            />
            <div
              className={twMerge(
                'absolute right-0 top-0 mr-4 flex h-full translate-x-1 items-center gap-2 pl-3 opacity-0 transition-all duration-100 group-hover:bg-neutral-100',
                isCellFocused('value') && 'bg-neutral-150 group-hover:bg-neutral-150',
                isCellHovered && 'translate-x-0 opacity-100',
                isVariablePopoverOpen && 'bg-white'
              )}
            >
              {!isSecretPlaceholder && (
                <DropdownVariable
                  environmentId={environmentId}
                  onChange={(val) => {
                    updateValue(variable.id, `{{${val}}}`)
                  }}
                  onOpenChange={(open) => {
                    if (open) {
                      setIsCellHovered(true)
                      setFocusedCell(undefined)
                    } else {
                      setIsCellHovered(false)
                      setFocusedCell(undefined)
                    }
                    setIsVariablePopoverOpen(open)
                  }}
                >
                  <button
                    className={twMerge(
                      'justify-center border-none bg-transparent px-1 text-neutral-350 hover:text-neutral-400'
                    )}
                    type="button"
                  >
                    <Icon className="text-sm" iconName="wand-magic-sparkles" />
                  </button>
                </DropdownVariable>
              )}
              {isSecretPlaceholder && (
                <button
                  type="button"
                  onClick={() => focusValueTextarea()}
                  className="px-1 text-neutral-350 hover:text-neutral-400"
                >
                  <Icon iconName="pen" iconStyle="regular" />
                </button>
              )}
              {isVariableChanged(variable) && (
                <button
                  type="button"
                  onClick={() => revertValue(variable.id)}
                  className="px-1 text-neutral-350 hover:text-neutral-400"
                >
                  <Icon iconName="rotate-left" iconStyle="regular" />
                </button>
              )}
              {errors.get(variable.id)?.field === 'value' && (
                <Tooltip content={errors.get(variable.id)?.message}>
                  <span className="px-1">
                    <Icon iconName="circle-exclamation" iconStyle="regular" className="text-red-500" />
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        {/* Source cell */}
        <SourceCell variable={variable} />
        {/* Secret toggle cell */}
        <button
          className="flex items-center justify-center text-center text-sm text-neutral-400"
          type="button"
          onClick={() => {
            toggleSecret(variable.id)
          }}
        >
          <Icon
            iconName={variable.secret ? 'lock-keyhole' : 'lock-keyhole-open'}
            iconStyle="regular"
            className={variable.secret ? 'text-neutral-400' : 'text-neutral-300'}
          />
        </button>
      </div>
    </div>
  )
}

const TerraformVariablesRows = () => {
  const { vars, selectedRows, setSelectedRows } = useTerraformVariablesContext()
  const customVariables = useMemo(() => vars.filter((v) => isCustomVariable(v)), [vars])
  const isAllSelected = useMemo(
    () => selectedRows.length === customVariables.length && customVariables.length > 0,
    [selectedRows, customVariables]
  )
  const isSelectAllCheckboxEnabled = useMemo(() => customVariables.length > 0, [customVariables])

  const onSelectAllToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(customVariables.map((v) => v.id))
      } else {
        setSelectedRows([])
      }
    },
    [customVariables, setSelectedRows]
  )

  return (
    <div className="flex flex-col items-center justify-center border-t border-neutral-250">
      <div className="grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_52px] items-center border-b border-neutral-250 bg-neutral-100">
        <div className="flex h-full items-center justify-center border-r border-neutral-250">
          <Checkbox
            disabled={!isSelectAllCheckboxEnabled}
            onCheckedChange={onSelectAllToggle}
            checked={isAllSelected}
          />
        </div>
        <div className="flex h-full items-center border-r border-neutral-250">
          <span className="px-4 text-sm text-neutral-400">Variable</span>
        </div>
        <div className="flex h-full items-center border-r border-neutral-250">
          <span className="px-4 text-sm text-neutral-400">Value</span>
        </div>
        <div className="flex h-full items-center border-r border-neutral-250">
          <span className="px-4 text-sm text-neutral-400">Source</span>
        </div>
      </div>

      {vars.map((variable, index) => (
        <VariableRow key={index} variable={variable} />
      ))}
    </div>
  )
}

const TerraformVariablesLoadingState = () => {
  return (
    <div className="flex items-center justify-center border-b border-t border-neutral-250 bg-neutral-100 p-4">
      <div className="flex flex-col items-center gap-4 py-4">
        <LoaderSpinner classWidth="w-6" theme="light" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-center text-sm font-medium text-neutral-350">Fetching .tfvars files...</span>
          <span className="text-center text-sm text-neutral-350">Pulling your Terraform variable definitions.</span>
        </div>
      </div>
    </div>
  )
}

const TerraformVariablesEmptyState = () => {
  return (
    <div className="flex items-center justify-center border-b border-t border-neutral-250 bg-neutral-100 p-4">
      <div className="flex flex-col items-center gap-2 py-4">
        <Icon iconName="key" iconStyle="regular" className="text-lg text-neutral-300" />
        <span className="text-center text-sm text-neutral-350">
          Load a .tfvars file or manually add variables
          <br />
          to configure your Terraform service.
        </span>
      </div>
    </div>
  )
}

export const TerraformVariablesTable = () => {
  const { addVariable, fetchTfVarsFiles, areTfVarsFilesLoading, vars, newPath, selectedRows, deleteSelectedRows } =
    useTerraformVariablesContext()

  useEffect(() => {
    fetchTfVarsFiles()
  }, [])

  const onAddVariable = useCallback(() => {
    addVariable('new_variable', 'value')
  }, [addVariable])

  return (
    <div className="flex flex-col rounded-lg border border-neutral-250">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-neutral-400">Variable configuration</span>
        <TfvarsFilesPopover />
      </div>

      {areTfVarsFilesLoading && newPath.length === 0 ? (
        <TerraformVariablesLoadingState />
      ) : vars.length > 0 ? (
        <TerraformVariablesRows />
      ) : (
        <TerraformVariablesEmptyState />
      )}

      <div
        className={twMerge('flex items-center px-4 py-3', selectedRows.length > 0 ? 'justify-between' : 'justify-end')}
      >
        {selectedRows.length > 0 && (
          <Button size="md" variant="solid" color="red" className="gap-1.5" type="button" onClick={deleteSelectedRows}>
            <Icon iconName="trash-can" iconStyle="regular" />
            Delete selected
          </Button>
        )}
        <Button size="md" variant="surface" className="gap-1.5" type="button" onClick={onAddVariable}>
          Add variable
          <Icon iconName="plus" iconStyle="regular" />
        </Button>
      </div>
    </div>
  )
}
