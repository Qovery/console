import { type RowSelectionState } from '@tanstack/react-table'
import { Button, DropdownMenu, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'

export interface ServiceListActionBarProps {
  rowSelection: RowSelectionState
  resetRowSelection: () => void
}

export function ServiceListActionBar({ rowSelection, resetRowSelection }: ServiceListActionBarProps) {
  const selectedRowIndexes = Object.keys(rowSelection)

  return (
    <div className="sticky bottom-4">
      <div className="relative">
        <div
          className={twMerge(
            'absolute w-[520px] bottom-4 left-1/2 -translate-x-1/2',
            Boolean(selectedRowIndexes.length) ? '' : 'overflow-hidden h-0'
          )}
        >
          <div
            className={twMerge(
              'flex items-center justify-between h-12 bg-neutral-500 shadow-xl text-white font-medium pl-5 pr-2 rounded',
              Boolean(selectedRowIndexes.length) ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
            )}
          >
            <span className="text-sm">
              {selectedRowIndexes.length} selected {pluralize(selectedRowIndexes.length, 'service')}
            </span>
            <button className="h-8 px-3 text-xs underline" type="button" onClick={() => resetRowSelection()}>
              Clear selection
            </button>
            <div className="flex gap-2">
              <Button color="brand" size="md" className="items-center gap-1">
                Deploy selected <Icon name={IconAwesomeEnum.PLAY} />
              </Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button color="neutral" size="md" className="items-center gap-1">
                    More <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.ROTATE_RIGHT} />}>
                    Restart selected
                  </DropdownMenu.Item>
                  <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.CIRCLE_STOP} />}>
                    Stop selected
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item color="red" icon={<Icon name={IconAwesomeEnum.TRASH} />}>
                    Delete environment
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ServiceListActionBar
