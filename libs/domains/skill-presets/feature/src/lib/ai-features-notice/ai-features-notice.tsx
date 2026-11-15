import { Callout, Icon } from '@qovery/shared/ui'

export const AI_FEATURES_OFF_TOOLTIP = 'Turn on AI features for this organization to create or change skill presets'

/** Shown at the top of the admin pages when the organization turned AI features off. */
export function AiFeaturesNotice() {
  return (
    <Callout.Root color="sky" data-testid="ai-features-notice">
      <Callout.Icon>
        <Icon iconName="circle-info" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>Skill presets need AI features</Callout.TextHeading>
        <Callout.TextDescription>
          Every preset is reviewed by a model before it reaches members. While AI features are off for this
          organization, presets can’t be created or changed. Existing presets keep working and stay readable.
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}
