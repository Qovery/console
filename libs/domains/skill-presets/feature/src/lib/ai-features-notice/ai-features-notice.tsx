import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { getSkillPresetErrorDetail } from '@qovery/domains/skill-presets/data-access'
import { Button, Callout, Icon, ModalCrud, useModal } from '@qovery/shared/ui'
import { useEnableAiFeatures } from '../hooks/use-enable-ai-features/use-enable-ai-features'

export const AI_FEATURES_OFF_TOOLTIP = 'Turn on AI features for this organization to create or change skill presets'

interface TurnOnAiFeaturesModalProps {
  organizationId: string
  onClose: () => void
  onEnabled?: () => void
}

/** Says plainly what turning AI features on means, then calls q-core. Stays open, with the error, if it fails. */
export function TurnOnAiFeaturesModal({ organizationId, onClose, onEnabled }: TurnOnAiFeaturesModalProps) {
  const methods = useForm()
  const { mutateAsync: enableAiFeatures } = useEnableAiFeatures()
  const [error, setError] = useState<string | null>(null)

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Turn on AI features"
        submitLabel="Turn on AI features"
        loading={methods.formState.isSubmitting}
        onClose={onClose}
        onSubmit={methods.handleSubmit(async () => {
          setError(null)
          try {
            await enableAiFeatures({ organizationId })
            onEnabled?.()
            onClose()
          } catch (failure) {
            setError(getSkillPresetErrorDetail(failure) ?? 'AI features could not be turned on. Try again.')
          }
        })}
      >
        <div className="flex flex-col gap-3 text-sm text-neutral-subtle">
          <p>
            Turning on AI features lets Qovery use AI for this organization, including the model review of every skill
            preset on AWS Bedrock. Preset text is sent to that review each time a preset is saved.
          </p>
          <p>Only organization owners and admins can change this setting.</p>
          {error && (
            <p className="flex items-center gap-1.5 text-negative" role="alert">
              <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export interface AiFeaturesNoticeProps {
  organizationId: string
  /** Owners and admins only: anyone else never sees the button. */
  canEnable: boolean
  onEnabled?: () => void
}

/** Shown when the organization turned AI features off: presets stay readable, writes need them on. */
export function AiFeaturesNotice({ organizationId, canEnable, onEnabled }: AiFeaturesNoticeProps) {
  const { openModal, closeModal } = useModal()

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
      {canEnable && (
        <Button
          type="button"
          size="md"
          className="self-center"
          onClick={() =>
            openModal({
              content: (
                <TurnOnAiFeaturesModal organizationId={organizationId} onClose={closeModal} onEnabled={onEnabled} />
              ),
            })
          }
        >
          Turn on AI features
        </Button>
      )}
    </Callout.Root>
  )
}
