import { getSkillPresetErrorDetail } from '@qovery/domains/skill-presets/data-access'
import { Button, Callout, Icon } from '@qovery/shared/ui'

export interface LoadErrorProps {
  title: string
  error: unknown
  onRetry: () => void
  /** Extra reassurance after the error detail. */
  note?: string
}

/** Failed query with a retry, shared by every skill presets tab. */
export function LoadError({ title, error, onRetry, note }: LoadErrorProps) {
  return (
    <Callout.Root color="red" role="alert">
      <Callout.Icon>
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>{title}</Callout.TextHeading>
        <Callout.TextDescription>
          {getSkillPresetErrorDetail(error) ?? 'Something went wrong on our side.'}
          {note ? ` ${note}` : ''}
        </Callout.TextDescription>
        <Button type="button" className="mt-3" size="md" variant="outline" color="neutral" onClick={onRetry}>
          Try again
        </Button>
      </Callout.Text>
    </Callout.Root>
  )
}
