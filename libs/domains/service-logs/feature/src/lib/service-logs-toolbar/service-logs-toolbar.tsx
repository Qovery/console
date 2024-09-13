import download from 'downloadjs'
import { type RefObject } from 'react'
import { ActionToolbar, Button, Icon } from '@qovery/shared/ui'

export interface ServiceLogsToolbarProps {
  refScrollSection: RefObject<HTMLDivElement>
  logsStringify: string
}

export function ServiceLogsToolbar({ refScrollSection, logsStringify }: ServiceLogsToolbarProps) {
  const forcedScroll = (down?: boolean) => {
    const section = refScrollSection.current
    if (!section) return

    if (down) {
      section.scroll(0, section.scrollHeight)
    } else {
      section.scroll(0, 0)
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => download(logsStringify, `data-${Date.now()}.json`, 'text/json;charset=utf-8')}
        size="sm"
        variant="surface"
        color="neutral"
        className="w-7 justify-center"
      >
        <Icon iconName="file-arrow-down" iconStyle="regular" />
      </Button>
      <ActionToolbar.Root>
        <ActionToolbar.Button
          size="sm"
          variant="surface"
          color="neutral"
          className="w-7 justify-center rounded-l"
          onClick={() => forcedScroll()}
        >
          <Icon iconName="arrow-up-to-line" iconStyle="regular" />
        </ActionToolbar.Button>
        <ActionToolbar.Button
          size="sm"
          variant="surface"
          color="neutral"
          className="w-7 justify-center rounded-r"
          onClick={() => forcedScroll(true)}
        >
          <Icon iconName="arrow-down-to-line" iconStyle="regular" />
        </ActionToolbar.Button>
      </ActionToolbar.Root>
    </div>
  )
}

export default ServiceLogsToolbar
