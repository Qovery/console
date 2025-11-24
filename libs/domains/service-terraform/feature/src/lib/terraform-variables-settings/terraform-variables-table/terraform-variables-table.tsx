import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropdownVariable } from '@qovery/domains/variables/feature'
import { Badge, Button, Checkbox, Icon, LoaderSpinner, PasswordShowHide, Tooltip, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { TfvarsFilesPopover } from '../terraform-tfvars-popover/terraform-tfvars-popover'
import { type UIVariable, useTerraformVariablesContext } from '../terraform-variables-context'
import { formatSource, getSourceBadgeColor, isCustomVariable, isVariableChanged } from '../terraform-variables-utils'

const VariableRow = ({ variable }: { variable: UIVariable }) => {
  const { updateKey, updateValue, toggleSecret, revertValue, isRowSelected, selectRow, hoveredRow, errors } =
    useTerraformVariablesContext()
  const { environmentId = '' } = useParams()
  const [isVariablePopoverOpen, setIsVariablePopoverOpen] = useState(false)
  const [isCellHovered, setIsCellHovered] = useState(false)
  const [focusedCell, setFocusedCell] = useState<string | undefined>(undefined)
  const isCellFocused = useCallback((cell: 'key' | 'value') => focusedCell === cell, [focusedCell])

  return (
    <div className="w-full border-b border-neutral-250">
      <div
        className={twMerge(
          'grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center',
          hoveredRow ? (hoveredRow === variable.source ? 'bg-neutral-100' : 'bg-white') : 'bg-white',
          isRowSelected(variable.id) && 'bg-neutral-150 hover:bg-neutral-150'
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
            (isCellFocused('key') || isRowSelected(variable.id)) && 'bg-neutral-150 hover:bg-neutral-150'
          )}
        >
          <div
            className={twMerge(
              'flex h-full w-full items-center border border-transparent',
              errors.get(variable.id) && 'border-red-500'
            )}
          >
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
            {errors.get(variable.id) && (
              <Tooltip content={errors.get(variable.id)}>
                <div className="mr-4">
                  <Icon iconName="circle-exclamation" iconStyle="regular" className="text-red-500" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        {/* Variable value cell */}
        <div
          className="group relative flex h-full cursor-text items-center border-r border-neutral-250"
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
          {/* Background */}
          <div
            className={twMerge(
              'pointer-events-none absolute bottom-0 left-0 right-0 top-0 h-full w-full transition-all duration-100 group-hover:bg-neutral-100',
              isCellFocused('value') && 'bg-neutral-150 group-hover:bg-neutral-150'
            )}
          />
          {/* Cell content */}
          <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full">
            {variable.secret ? (
              <PasswordShowHide
                value=""
                isSecret={true}
                defaultVisible={false}
                className="h-full w-full px-4 text-sm text-neutral-400 outline-none"
              />
            ) : (
              <input
                name="value"
                value={variable.value}
                onChange={(e) => {
                  updateValue(variable.id, e.target.value)
                }}
                onFocus={() => setFocusedCell('value')}
                onBlur={() => setFocusedCell(undefined)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                className="h-full w-full bg-transparent px-4 text-sm text-neutral-400 outline-none"
                spellCheck={false}
                placeholder="Variable value"
              />
            )}
            <div
              className={twMerge(
                'absolute right-0 top-0 mr-4 flex h-full translate-x-1 items-center gap-2 pl-3 opacity-0 transition-all duration-100 group-hover:bg-neutral-100',
                isCellFocused('value') && 'bg-neutral-150 group-hover:bg-neutral-150',
                isCellHovered && 'translate-x-0 opacity-100',
                isVariablePopoverOpen && 'bg-white'
              )}
            >
              {!variable.secret && (
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

              {isVariableChanged(variable) && (
                <button
                  type="button"
                  onClick={() => revertValue(variable.id)}
                  className="px-1 text-neutral-350 hover:text-neutral-400"
                >
                  <Icon iconName="rotate-left" iconStyle="regular" />
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Source badge */}
        <div className="flex h-full items-center border-r border-neutral-250 px-4">
          <Badge color={getSourceBadgeColor(variable)} variant="surface" className="text-xs">
            <Truncate text={formatSource(variable)} truncateLimit={40} />
          </Badge>
        </div>
        {/* Secret toggle */}
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
      <div className="grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center border-b border-neutral-250 bg-neutral-100">
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
