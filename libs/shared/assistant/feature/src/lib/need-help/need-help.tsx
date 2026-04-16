import { Button, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { toggleAssistantOpen } from '../assistant-store/assistant-store'

export interface NeedHelpProps {
  className?: string
}

export function NeedHelp({ className }: NeedHelpProps) {
  return (
    <Button
      size="xs"
      color="brand"
      variant="surface"
      className={twMerge('w-fit items-center gap-1', className)}
      onClick={toggleAssistantOpen}
    >
      <Icon iconName="circle-question" iconStyle="regular" className="p-0.5 text-xs" />
      <span>Need help here?</span>
    </Button>
  )
}

export default NeedHelp
