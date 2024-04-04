import { useIntercom } from 'react-use-intercom'
import { Command, type CommandDialogProps, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const { showMessages: showIntercomMessenger } = useIntercom()

  return (
    <Command.Dialog label="Console Spotlight" open={open} onOpenChange={onOpenChange}>
      <Command.Input autoFocus placeholder="What do you need?" />
      <Command.List>
        <Command.Group heading="Help">
          <Command.Item>
            <Icon className="text-brand-500 text-base text-center w-6" name={IconAwesomeEnum.BOOK} />
            Go to documentation
          </Command.Item>
          <Command.Item onSelect={showIntercomMessenger}>
            <Icon className="text-brand-500 text-base text-center w-6" name={IconAwesomeEnum.CIRCLE_QUESTION} />
            Get help
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
