import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  AWS_MARKETPLACE_MESSAGE_MAX_LENGTH,
  type AwsMarketplace,
  type AwsMarketplaceRequest,
  BillingError,
  isTrustedAwsMarketplaceOfferUrl,
  isValidAwsAccountId,
} from '@qovery/shared/billing-kit'
import { useUserRole } from '@qovery/shared/iam/feature'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Icon,
  InputText,
  InputTextArea,
  Skeleton,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { useAwsMarketplace, useRequestAwsMarketplaceOffer } from '../../hooks/use-aws-marketplace/use-aws-marketplace'

export const AWS_MARKETPLACE_FEATURE_FLAG = 'billing-aws-marketplace'

// TODO: use useCanManageBilling from @qovery/shared/iam/feature once the billing access change is merged.
// Exact match on the role claim: only owner, admin and billing (Billing Manager) can manage billing.
function useHasBillingRole(organizationId: string) {
  const { roles, isQoveryAdminUser } = useUserRole()
  if (isQoveryAdminUser) return true
  return ['owner', 'admin', 'billing'].some((role) => roles?.includes(`organization:${organizationId}:${role}`))
}

/** AWS consoles show the id with dashes or spaces: keep the digits the API expects. */
export const normalizeAwsAccountId = (value: string) => value.replace(/[\s-]/g, '')

interface OfferRequestFormValues {
  aws_account_id: string
  message: string
}

const requestErrorMessage = (error: unknown) =>
  match(error instanceof BillingError ? error.code : undefined)
    .with('INVALID_AWS_ACCOUNT_ID', () => 'Enter the 12-digit ID of the AWS account that will accept the offer.')
    .with('MESSAGE_TOO_LONG', () => `The message is ${AWS_MARKETPLACE_MESSAGE_MAX_LENGTH} characters at most.`)
    .with('ALREADY_ON_AWS_MARKETPLACE', () => 'This organization already pays through AWS Marketplace.')
    .with(
      'BILLING_ROLE_REQUIRED',
      'NOT_AN_ORGANIZATION_MEMBER',
      () => 'Only Owners, Admins and Billing Managers can request a private offer.'
    )
    .with('TOO_MANY_REQUESTS', () => 'Too many requests today. Try again tomorrow, or contact your account manager.')
    .otherwise(() => 'The request could not be sent. Try again in a few minutes.')

function OfferRequestForm({
  organizationId,
  request,
  onCancel,
  onSent,
}: {
  organizationId: string
  request?: AwsMarketplaceRequest
  onCancel?: () => void
  onSent?: () => void
}) {
  const { control, handleSubmit } = useForm<OfferRequestFormValues>({
    mode: 'onTouched',
    defaultValues: { aws_account_id: request?.aws_account_id ?? '', message: request?.message ?? '' },
  })
  const { mutateAsync, isLoading, error, reset } = useRequestAwsMarketplaceOffer({ organizationId })

  const onSubmit = handleSubmit(async ({ aws_account_id, message }) => {
    reset()
    const trimmedMessage = message.trim()
    try {
      await mutateAsync({
        aws_account_id: normalizeAwsAccountId(aws_account_id),
        ...(trimmedMessage ? { message: trimmedMessage } : {}),
      })
      onSent?.()
    } catch {
      // Shown below the form
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <Controller
        control={control}
        name="aws_account_id"
        rules={{
          required: 'Enter your AWS account ID.',
          validate: (value) =>
            isValidAwsAccountId(normalizeAwsAccountId(value)) || 'An AWS account ID has 12 digits, like 123456789012.',
        }}
        render={({ field, fieldState }) => (
          <InputText
            name={field.name}
            label="AWS account ID"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint="The account that will accept the offer, usually your AWS Organizations management account."
          />
        )}
      />
      <Controller
        control={control}
        name="message"
        rules={{
          maxLength: {
            value: AWS_MARKETPLACE_MESSAGE_MAX_LENGTH,
            message: `${AWS_MARKETPLACE_MESSAGE_MAX_LENGTH} characters at most.`,
          },
        }}
        render={({ field, fieldState }) => (
          <InputTextArea
            name={field.name}
            label="Message (optional)"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            hint="Plan, term or anything we should know for the offer."
          />
        )}
      />
      {error ? (
        <Callout.Root color="red">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>{requestErrorMessage(error)}</Callout.Text>
        </Callout.Root>
      ) : null}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="plain" color="neutral" size="md" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="md" loading={isLoading}>
          {request ? 'Update request' : 'Request a private offer'}
        </Button>
      </div>
    </form>
  )
}

export function AwsMarketplaceCardContent({
  organizationId,
  awsMarketplace,
}: {
  organizationId: string
  awsMarketplace: AwsMarketplace
}) {
  const [isEditing, setIsEditing] = useState(false)
  const { showChat } = useSupportChat()
  const { billing_channel, request, offer } = awsMarketplace

  if (billing_channel === 'aws_marketplace' || request?.status === 'accepted') {
    return (
      <div className="flex flex-col gap-1 text-sm" data-testid="aws-marketplace-accepted">
        <p className="font-medium text-neutral">You pay through AWS Marketplace.</p>
        <p className="text-neutral-subtle">Your Qovery invoices come from AWS, on your AWS bill.</p>
      </div>
    )
  }

  if (request?.status === 'offer_sent' && offer) {
    const hasTrustedUrl = isTrustedAwsMarketplaceOfferUrl(offer.url)

    return (
      <div className="flex flex-col gap-3 text-sm" data-testid="aws-marketplace-offer-sent">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-neutral">Your private offer is ready</p>
          <p className="text-neutral-subtle">
            For AWS account {request.aws_account_id}
            {offer.expires_at ? `. Accept it before ${dateMediumLocalFormat(offer.expires_at)}.` : '.'}
          </p>
          {offer.note ? <p className="whitespace-pre-line text-neutral">{offer.note}</p> : null}
        </div>
        {hasTrustedUrl ? (
          <ExternalLink as="button" href={offer.url} size="md" className="gap-2 self-start">
            Review and accept in AWS
            <Icon iconName="arrow-up-right-from-square" />
          </ExternalLink>
        ) : (
          <p className="text-neutral-subtle" data-testid="aws-marketplace-contact-us">
            <button type="button" className="font-medium text-brand hover:underline" onClick={() => showChat()}>
              Contact us
            </button>{' '}
            to get the link to your offer.
          </p>
        )}
      </div>
    )
  }

  if (request?.status === 'open' && !isEditing) {
    return (
      <div className="flex items-start justify-between gap-4 text-sm" data-testid="aws-marketplace-open">
        <p className="text-neutral">
          Request sent on {dateMediumLocalFormat(request.requested_at)} for AWS account {request.aws_account_id}. We
          will send your private offer.
        </p>
        <Button type="button" variant="outline" color="neutral" size="md" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
    )
  }

  const editedRequest = request?.status === 'open' ? request : undefined

  return (
    <div className="flex flex-col gap-4 text-sm" data-testid="aws-marketplace-request-form">
      {!editedRequest ? (
        <p className="text-neutral-subtle">
          Pay for Qovery through your AWS bill. The spend counts toward your AWS commitments. Tell us which AWS account
          should receive it and we will send you a private offer on AWS Marketplace.
        </p>
      ) : null}
      <OfferRequestForm
        organizationId={organizationId}
        request={editedRequest}
        onCancel={editedRequest ? () => setIsEditing(false) : undefined}
        onSent={() => setIsEditing(false)}
      />
    </div>
  )
}

function AwsMarketplaceCardLoader({ organizationId }: { organizationId: string }) {
  const { data, isLoading, error } = useAwsMarketplace({ organizationId })

  // Not a billing role or not a member: the card is not for this user
  if (error instanceof BillingError && (error.status === 401 || error.status === 403)) return null

  return (
    <BlockContent title="AWS Marketplace" dataTestId="aws-marketplace-card">
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : data ? (
        <AwsMarketplaceCardContent organizationId={organizationId} awsMarketplace={data} />
      ) : (
        <p className="text-sm text-neutral-subtle">AWS Marketplace details are unavailable right now.</p>
      )}
    </BlockContent>
  )
}

export function AwsMarketplaceCard() {
  const { organizationId = '' } = useParams({ strict: false })
  const isEnabled = useFeatureFlagEnabled(AWS_MARKETPLACE_FEATURE_FLAG) === true
  const hasBillingRole = useHasBillingRole(organizationId)

  if (!isEnabled || !hasBillingRole || !organizationId) return null

  return <AwsMarketplaceCardLoader organizationId={organizationId} />
}

export default AwsMarketplaceCard
