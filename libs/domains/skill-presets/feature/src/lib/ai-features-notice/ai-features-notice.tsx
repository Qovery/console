import { useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { getSkillPresetErrorDetail } from '@qovery/domains/skill-presets/data-access'
import { useAuth } from '@qovery/shared/auth'
import { mutations as copilotMutations } from '@qovery/shared/devops-copilot/data-access'
import { CopilotTermsOfService } from '@qovery/shared/devops-copilot/feature'
import { useUserAccount } from '@qovery/shared/iam/feature'
import { Accordion, Button, Callout, Checkbox, Icon, ModalCrud, useModal } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { useEnableAiFeatures } from '../hooks/use-enable-ai-features/use-enable-ai-features'

export const AI_FEATURES_OFF_TOOLTIP = 'Turn on AI for this organization to create or change skill presets'
export const TURN_ON_AI_LABEL = 'Turn on AI'

interface TurnOnAiModalProps {
  organizationId: string
  onClose: () => void
  onEnabled?: () => void
}

/** The Copilot service answers `{ error }`, q-core `{ detail }`. */
function errorDetail(failure: unknown) {
  const data = (failure as { response?: { data?: { error?: string } } })?.response?.data
  return data?.error ?? getSkillPresetErrorDetail(failure)
}

/**
 * One action for two existing switches: the organization's AI features (q-core), then the Copilot
 * (the DevOps Copilot service), read-only and acting as the user, like the Copilot's own opt-in. Each
 * step runs only if needed. If the Copilot step fails, AI features stay on and Retry only redoes it.
 */
export function TurnOnAiModal({ organizationId, onClose, onEnabled }: TurnOnAiModalProps) {
  const methods = useForm<{ hasAcceptedTerms: boolean }>({
    mode: 'onChange',
    defaultValues: { hasAcceptedTerms: false },
  })
  const queryClient = useQueryClient()
  const { mutateAsync: enableAiFeatures } = useEnableAiFeatures()
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const copilot = useCopilotStatus({ organizationId })
  const { data: userAccount } = useUserAccount()
  const { user } = useAuth()
  const [aiTurnedOn, setAiTurnedOn] = useState(false)
  const [error, setError] = useState<{ step: 'ai' | 'copilot'; detail?: string } | null>(null)

  const needsAi = !aiFeaturesEnabled && !aiTurnedOn
  const needsCopilot = !copilot.enabled
  const hasAcceptedTerms = methods.watch('hasAcceptedTerms')
  const copilotFailed = error?.step === 'copilot'

  const submit = methods.handleSubmit(async () => {
    setError(null)
    if (needsAi) {
      try {
        await enableAiFeatures({ organizationId })
        setAiTurnedOn(true)
      } catch (failure) {
        setError({ step: 'ai', detail: errorDetail(failure) })
        return
      }
    }
    if (needsCopilot) {
      try {
        await copilotMutations.updateOrgConfig({
          organizationId,
          enabled: true,
          readOnly: true,
          userEmail: userAccount?.communication_email ?? user?.email,
        })
        posthog.capture('ai-copilot-enabled', { organization_id: organizationId, mode: 'Read-Only' })
      } catch (failure) {
        setError({ step: 'copilot', detail: errorDetail(failure) })
        return
      } finally {
        queryClient.invalidateQueries({ queryKey: queries.devopsCopilot.config({ organizationId }).queryKey })
      }
    }
    onEnabled?.()
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={TURN_ON_AI_LABEL}
        submitLabel={copilotFailed ? 'Retry' : TURN_ON_AI_LABEL}
        submitDisabled={!copilot.ready || (needsCopilot && !hasAcceptedTerms)}
        loading={methods.formState.isSubmitting}
        onClose={onClose}
        onSubmit={submit}
      >
        <div className="flex flex-col gap-4 text-sm text-neutral-subtle" data-testid="turn-on-ai">
          <p className="text-neutral">
            {needsAi && needsCopilot
              ? 'This turns on two things for your organization.'
              : needsCopilot
                ? 'AI features are already on. This turns on the Copilot.'
                : 'The Copilot is already on. This turns on AI features.'}
          </p>
          <ul className="flex flex-col gap-3">
            {needsAi && (
              <li className="flex items-start gap-2">
                <Icon iconName="sparkles" iconStyle="regular" className="mt-0.5 text-brand" aria-hidden="true" />
                <span>
                  <span className="font-medium text-neutral">AI features:</span> the organization’s opt-in to AI. The
                  Copilot and the review of every skill preset use it. Preset text is sent to a model on AWS Bedrock
                  each time a preset is saved.
                </span>
              </li>
            )}
            {needsCopilot && (
              <li className="flex items-start gap-2">
                <Icon iconName="message-bot" iconStyle="regular" className="mt-0.5 text-brand" aria-hidden="true" />
                <span>
                  <span className="font-medium text-neutral">The Copilot:</span> Qovery’s assistant in the Console. It
                  starts read-only and acts as you, with your own permissions. You can change it later on the Copilot
                  page.
                </span>
              </li>
            )}
          </ul>
          {needsCopilot && (
            <div className="flex flex-col gap-2">
              <p>
                The Copilot is an AI service run by Qovery, under the Copilot terms: it acts on your instructions, with
                your permissions.
              </p>
              <Accordion.Root type="single" collapsible className="rounded border border-neutral">
                <Accordion.Item value="terms">
                  <Accordion.Trigger className="min-h-9 w-full px-3 text-sm font-medium text-neutral">
                    Read the Copilot terms
                  </Accordion.Trigger>
                  <Accordion.Content className="px-3 pb-3">
                    <CopilotTermsOfService className="max-h-48" />
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
              <Controller
                name="hasAcceptedTerms"
                control={methods.control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      className="mt-0.5 flex-shrink-0"
                      aria-label="I have read and accept the Copilot Terms of Service"
                    />
                    <span className="text-sm text-neutral">I have read and accept the Copilot Terms of Service</span>
                  </label>
                )}
              />
            </div>
          )}
          {needsCopilot && !hasAcceptedTerms && (
            <p className="text-xs text-neutral-subtle" data-testid="turn-on-ai-hint">
              Accept the terms to continue.
            </p>
          )}
          {error && (
            <Callout.Root color="red" role="alert" data-testid="turn-on-ai-error">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>
                  {error.step === 'copilot'
                    ? 'AI features are on, but the Copilot could not be turned on'
                    : 'AI features could not be turned on'}
                </Callout.TextHeading>
                <Callout.TextDescription>
                  {error.detail ? `${error.detail}. ` : ''}
                  {error.step === 'copilot' ? 'Retry turns on the Copilot only.' : 'Nothing was changed. Try again.'}
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
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
              content: <TurnOnAiModal organizationId={organizationId} onClose={closeModal} onEnabled={onEnabled} />,
            })
          }
        >
          {TURN_ON_AI_LABEL}
        </Button>
      )}
    </Callout.Root>
  )
}
