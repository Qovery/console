import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface ContextBannerProps {
  currentType: string
  currentName: string
  onClose: () => void
}

export function ContextBanner({ currentType, currentName, onClose }: ContextBannerProps) {
  return (
    <div className="absolute top-2.5 flex w-full rounded-t-xl border border-neutral-250 bg-neutral-100 pb-4 pl-2 pr-4 pt-2 text-xs text-neutral-400 dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-250">
      <Tooltip content="Your message uses this current context" classNameContent="z-[1]">
        <span className="flex items-center gap-2">
          <Icon iconName="plug" iconStyle="regular" />
          <span>
            {upperCaseFirstLetter(currentType)}: <span className="font-medium">{currentName}</span>
          </span>
        </span>
      </Tooltip>
      <Button
        type="button"
        variant="plain"
        className="absolute right-2 top-0.5 text-neutral-500 dark:text-white"
        onClick={onClose}
      >
        <Icon iconName="xmark" />
      </Button>
    </div>
  )
}
