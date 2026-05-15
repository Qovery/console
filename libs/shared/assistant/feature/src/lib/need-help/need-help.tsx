import { Button, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useToggleAssistantOpen } from '../assistant-context/assistant-context'

export interface NeedHelpProps {
  className?: string
}

export function NeedHelp({ className }: NeedHelpProps) {
  const toggleAssistantOpen = useToggleAssistantOpen()

  return (
    <Button
      size="xs"
      color="brand"
      variant="surface"
      className={twMerge('w-fit items-center', className)}
      onClick={toggleAssistantOpen}
    >
      <Icon data-align="prefix" iconName="circle-question" iconStyle="regular" className="p-0.5 text-xs" />
      <span>Need help here?</span>
    </Button>
  )
}

export default NeedHelp
