import { Controller, useFormContext } from 'react-hook-form'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { ExternalLink, Icon, InputText, InputToggle, Tooltip } from '@qovery/shared/ui'

export interface GkeKmsKeyProps {
  fromDetail?: boolean
}

export function GkeKmsKey({ fromDetail }: GkeKmsKeyProps) {
  const { control, clearErrors, watch } = useFormContext<ClusterGeneralData>()
  const watchGkeKmsKeyEnabled = watch('gke_kms_key.enabled')
  const watchGkeKmsKeyValue = watch('gke_kms_key.value')

  if (fromDetail) {
    return (
      <div className="mt-5">
        <InputToggle
          small
          align="top"
          value={!!watchGkeKmsKeyValue}
          title={
            <span className="flex items-center gap-1">
              GKE KMS key
              {watchGkeKmsKeyValue && (
                <Tooltip content={`Your configured KMS key: ${watchGkeKmsKeyValue}`}>
                  <button
                    type="button"
                    aria-label="More information"
                    data-testid="input-toggle-tooltip-trigger"
                    className="shrink-0 text-sm font-normal text-neutral-subtle"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Icon iconName="info-circle" iconStyle="regular" />
                  </button>
                </Tooltip>
              )}
            </span>
          }
          description="Encrypt node boot disks, etcd data, storage buckets and persistent volumes"
          disabled={!watchGkeKmsKeyValue}
        />
      </div>
    )
  }

  return (
    <div className="mb-3 flex flex-col gap-4 rounded border border-neutral bg-surface-neutral-subtle p-4">
      <Controller
        name="gke_kms_key.enabled"
        control={control}
        render={({ field }) => (
          <InputToggle
            small
            align="top"
            value={field.value}
            onChange={(value) => {
              field.onChange(value)
              if (!value) {
                clearErrors('gke_kms_key.value')
              }
            }}
            title="GKE KMS key"
            description="Encrypt node boot disks, etcd data, storage buckets and persistent volumes"
          />
        )}
      />
      {watchGkeKmsKeyEnabled && (
        <Controller
          name="gke_kms_key.value"
          control={control}
          rules={{
            required: 'Please enter a KMS key.',
            pattern: {
              value:
                /^projects\/[a-z][a-z0-9-]*[a-z0-9]\/locations\/[a-z][a-z0-9-]*[a-z0-9]\/keyRings\/[a-zA-Z0-9_-]+\/cryptoKeys\/[a-zA-Z0-9_-]+$/,
              message:
                'Invalid KMS key format. Expected: projects/{project}/locations/{location}/keyRings/{keyRing}/cryptoKeys/{key}',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={(field.value as string) ?? ''}
              label="KMS Key"
              placeholder="projects/{project}/locations/{location}/keyRings/{keyRing}/cryptoKeys/{key}"
              error={error?.message}
            />
          )}
        />
      )}
      <ExternalLink size="xs" href="https://www.qovery.com/docs/configuration/integrations/kubernetes/gke/overview">
        Documentation link
      </ExternalLink>
    </div>
  )
}

export default GkeKmsKey
