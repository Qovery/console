import { getSkillPresetErrorDetail, getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/data-access'
import { Button, Callout, Icon } from '@qovery/shared/ui'

export interface LoadErrorProps {
  title: string
  error: unknown
  onRetry: () => void
  /** A second sentence: what still works while this page cannot load. */
  note?: string
}

/**
 * Failed query with a retry, shared by every skill presets tab. Our sentences stay clean: the
 * server's own detail goes on a separate muted line.
 */
export function LoadError({ title, error, onRetry, note }: LoadErrorProps) {
  const status = getSkillPresetErrorStatus(error)
  const detail = getSkillPresetErrorDetail(error)
  const cause =
    status === undefined
      ? 'Qovery could not reach the server.'
      : status >= 500
        ? 'The server encountered an error.'
        : 'The server refused the request.'

  return (
    <Callout.Root color="red" role="alert">
      <Callout.Icon>
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text className="flex flex-col gap-1">
        <Callout.TextHeading>{title}</Callout.TextHeading>
        <Callout.TextDescription>
          {cause}
          {note ? ` ${note}` : ''}
        </Callout.TextDescription>
        {(status !== undefined || detail) && (
          <p className="text-xs text-neutral-subtle">
            Details: {[status && `HTTP ${status}`, detail].filter(Boolean).join(', ')}
          </p>
        )}
      </Callout.Text>
      <Button type="button" size="md" variant="outline" color="neutral" className="self-center" onClick={onRetry}>
        <Icon iconName="rotate-right" iconStyle="regular" />
        Try again
      </Button>
    </Callout.Root>
  )
}
