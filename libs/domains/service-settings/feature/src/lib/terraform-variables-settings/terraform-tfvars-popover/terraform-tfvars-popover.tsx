import { type CheckedState } from '@radix-ui/react-checkbox'
import { Reorder } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { type TfVarsFile, useTerraformVariablesContext } from '@qovery/domains/service-terraform/feature'
import {
  Button,
  Checkbox,
  Icon,
  Indicator,
  InputTextSmall,
  LoaderSpinner,
  Popover,
  ScrollShadowWrapper,
  Skeleton,
  Tooltip,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

const TfvarItem = ({
  file,
  index,
  onIndexChange,
}: {
  file: TfVarsFile
  index: number
  onIndexChange: (file: TfVarsFile, index: number) => void
}) => {
  const { tfVarFiles, setTfVarFiles, setHoveredRow } = useTerraformVariablesContext()
  const [currentIndex, setCurrentIndex] = useState<string | undefined>(index.toString())

  const onCheckedChange = useCallback(
    (checked: CheckedState) => {
      const newFiles = [...tfVarFiles]
      const fileIndex = newFiles.findIndex((tfVarFile) => tfVarFile.source === file.source)
      if (fileIndex !== -1) {
        newFiles[fileIndex] = { ...newFiles[fileIndex], enabled: checked ? true : false }
      }

      setTfVarFiles(newFiles)
    },
    [tfVarFiles, file.source, setTfVarFiles]
  )

  useEffect(() => {
    setCurrentIndex(index.toString())
  }, [index])

  return (
    <div
      className="grid w-full grid-cols-[1fr_70px] items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0 "
      onMouseEnter={() => setHoveredRow(file.source)}
      onMouseLeave={() => setHoveredRow(undefined)}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          name={file.source}
          id={file.source}
          checked={file.enabled}
          onCheckedChange={onCheckedChange}
          className="ml-1 cursor-pointer"
        />
        <label className="flex cursor-pointer flex-col gap-0.5 text-sm" htmlFor={file.source}>
          <span className="text-neutral">{file.source}</span>
          <span className="text-xs text-neutral-subtle">{Object.keys(file.variables).length} variables</span>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <Icon iconName="grip-lines" iconStyle="regular" className="text-neutral-subtle" />
        <div className="flex items-center gap-1.5">
          <span className="text-md leading-3 text-neutral-subtle">#</span>
          <InputTextSmall
            name="order"
            value={currentIndex}
            onChange={(e) => {
              setCurrentIndex(e.target.value ?? '')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onIndexChange(file, Number(currentIndex ?? 0))
              }
            }}
            onBlur={() => {
              onIndexChange(file, Number(currentIndex ?? 0))
            }}
            dataTestId="index-input"
          />
        </div>
      </div>
    </div>
  )
}

export const TfvarsFilesPopover = () => {
  const {
    tfVarFiles,
    setFileListOrder,
    newPath,
    setNewPath,
    submitNewPath,
    areTfVarsFilesLoading,
    newPathErrorMessage,
    setNewPathErrorMessage,
  } = useTerraformVariablesContext()

  const onIndexChange = useCallback(
    (file: TfVarsFile, newIndex: number) => {
      const currentIndex = tfVarFiles.indexOf(file)
      const newFiles = [...tfVarFiles]
      const element = newFiles[currentIndex]
      newFiles.splice(currentIndex, 1)
      newFiles.splice(newIndex, 0, element)
      setFileListOrder(newFiles.map((file) => file.source))
    },
    [tfVarFiles, setFileListOrder]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPath(e.target.value)
    setNewPathErrorMessage(undefined)
  }

  const onReorder = (newFiles: TfVarsFile[]) => {
    setFileListOrder(newFiles.map((file) => file.source))
  }

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setNewPath('')
      setNewPathErrorMessage(undefined)
    }
  }

  const enabledFilesCount = tfVarFiles.filter((file) => file.enabled).length

  return (
    <Popover.Root onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <div>
          {enabledFilesCount > 0 ? (
            <Indicator
              align="start"
              side="left"
              content={
                <span
                  className="relative right-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-brand-solid text-sm font-bold leading-[0] text-neutralInvert"
                  data-testid="enabled-files-count"
                >
                  {enabledFilesCount}
                </span>
              }
            >
              <Button
                size="md"
                variant="outline"
                className="gap-1.5"
                type="button"
                data-testid="open-tfvars-files-button"
              >
                <Icon iconName="file-lines" iconStyle="regular" />
                .tfvars files
              </Button>
            </Indicator>
          ) : (
            <Button
              size="md"
              variant="solid"
              className="gap-1.5 px-[13px]"
              type="button"
              data-testid="open-tfvars-files-button"
            >
              <Icon iconName="file-lines" iconStyle="regular" />
              .tfvars files
            </Button>
          )}
        </div>
      </Popover.Trigger>
      <Popover.Content side="right" className="flex w-[340px] flex-col rounded-lg border border-neutral p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="px-1 py-1 text-sm font-medium text-neutral">Add and order .tfvars files</span>
          <Popover.Close>
            <Button type="button" iconOnly variant="plain">
              <Icon iconName="xmark" className="text-sm font-normal leading-4 text-neutral-subtle" />
            </Button>
          </Popover.Close>
        </div>
        <div className="flex flex-col gap-2 border-t border-neutral px-4 py-3">
          <div className="relative">
            <InputTextSmall
              name="path"
              value={newPath}
              onChange={onInputChange}
              placeholder="Path of .tfvar file"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitNewPath()
                }
              }}
              inputClassName={newPath.length > 0 ? 'pr-9' : undefined}
              disabled={areTfVarsFilesLoading}
              spellCheck={false}
            />
            {areTfVarsFilesLoading && newPath.length > 0 ? (
              <div className="absolute right-0 top-0 flex h-full w-9 items-center justify-center">
                <LoaderSpinner />
              </div>
            ) : (
              <button
                className="absolute right-0 top-0 flex h-full w-9 items-center justify-center"
                type="button"
                onClick={submitNewPath}
              >
                <Icon iconName="plus" className="text-lg font-normal leading-4 text-neutral-subtle" />
              </button>
            )}
          </div>
          {newPathErrorMessage && <div className="text-xs text-negative">{newPathErrorMessage}</div>}
        </div>
        {!areTfVarsFilesLoading && tfVarFiles.length !== 0 && (
          <div className="flex items-center justify-between border-t border-neutral bg-surface-neutral px-4 py-1">
            <span className="text-xs text-neutral-subtle">File order defines override priority.</span>
            <Tooltip
              classNameContent="max-w-[230px]"
              content="Files higher in the list override variables from lower ones."
              side="left"
            >
              <span className="text-sm text-neutral-subtle">
                <Icon iconName="info-circle" iconStyle="regular" />
              </span>
            </Tooltip>
          </div>
        )}
        <div className="flex flex-col border-t border-neutral">
          {areTfVarsFilesLoading && tfVarFiles.length === 0 ? (
            <>
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex w-full items-center gap-4 border-b border-neutral px-4 py-4">
                  <div className="flex items-center">
                    <Skeleton height={16} width={16} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton height={14} width={200} />
                    <Skeleton height={8} width={90} />
                  </div>
                </div>
              ))}
            </>
          ) : tfVarFiles.length > 0 ? (
            <ScrollShadowWrapper className="max-h-[300px]">
              <Reorder.Group axis="y" values={tfVarFiles} onReorder={onReorder}>
                {tfVarFiles?.map((file, index) => (
                  <Reorder.Item
                    key={file.source}
                    value={file}
                    initial={{ cursor: 'grab' }}
                    exit={{ cursor: 'grab' }}
                    whileDrag={{ cursor: 'grabbing', borderColor: '#642DFF', borderWidth: '2px' }}
                    className={twMerge('flex w-full items-center border-b border-neutral')}
                    data-testid="tfvar-item"
                  >
                    <TfvarItem key={file.source} file={file} index={index} onIndexChange={onIndexChange} />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </ScrollShadowWrapper>
          ) : null}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}
