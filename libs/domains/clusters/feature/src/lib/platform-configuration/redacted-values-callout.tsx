import { Callout, Icon } from '@qovery/shared/ui'
import { formatCatalogKey } from '@qovery/shared/util-js'

export interface RedactedValuesCalloutProps {
  className?: string
  componentKeys: string[]
}

export function RedactedValuesCallout({ className, componentKeys }: RedactedValuesCalloutProps) {
  if (componentKeys.length === 0) return null

  return (
    <Callout.Root color="yellow" className={className}>
      <Callout.Icon>
        <Icon iconName="eye-slash" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>Some values are hidden</Callout.TextHeading>
        <Callout.TextDescription>
          Re-enter them in {componentKeys.map(formatCatalogKey).join(', ')} to save, or reload later.
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}
