import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useUserRole } from '@qovery/shared/iam/feature'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export interface ClusterGeneralSettingsProps {
  fromDetail?: boolean
}

export function ClusterGeneralSettings(props: ClusterGeneralSettingsProps) {
  const { fromDetail } = props
  const { control, setValue, watch } = useFormContext<ClusterGeneralData>()
  const { isQoveryAdminUser } = useUserRole()
  const isKedaFeatureEnabled = useFeatureFlagVariantKey('keda')

  const metricsEnabled = watch('metrics_parameters.enabled')
  const cloudProvider = watch('cloud_provider')

  return (
    <div>
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            dataTestId="input-name"
            name={field.name}
            onChange={(e) => {
              if (!fromDetail && e.target.value.toLowerCase().includes('prod')) {
                setValue('production', true)
              }
              field.onChange(e)
            }}
            value={field.value}
            label="Cluster name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <InputTextArea
            className={`${!fromDetail ? 'mb-3' : 'mb-5'}`}
            dataTestId="input-description"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
          />
        )}
      />
      <Controller
        name="production"
        control={control}
        render={({ field }) => (
          <div
            className={`${
              !fromDetail
                ? 'mb-3 rounded border border-neutral-250 bg-neutral-100 p-4'
                : 'relative pt-5 before:absolute before:-left-5 before:top-0 before:block before:h-[1px] before:w-[calc(100%+40px)] before:bg-neutral-250 before:content-[""]'
            }`}
          >
            <InputToggle
              dataTestId="input-production-toggle"
              value={field.value}
              onChange={field.onChange}
              title="Production cluster"
              description="Actions on productions clusters will be more restricted"
              forceAlignTop
              small
            />
          </div>
        )}
      />
      {fromDetail && isQoveryAdminUser && (
        <>
          <Controller
            name="metrics_parameters.enabled"
            control={control}
            render={({ field }) => (
              <div className="mt-5">
                <InputToggle
                  value={field.value}
                  onChange={field.onChange}
                  title="Metrics enabled"
                  description="Enable metrics for the cluster (Qovery admin only)"
                  forceAlignTop
                  small
                />
              </div>
            )}
          />
          <Controller
            name="metrics_parameters.configuration.alerting.enabled"
            control={control}
            render={({ field }) => (
              <div className="mt-5">
                <InputToggle
                  value={field.value}
                  onChange={field.onChange}
                  title="Alert enabled"
                  description="Enable alerts for the cluster (requires metrics to be enabled)"
                  forceAlignTop
                  small
                  disabled={!metricsEnabled}
                />
              </div>
            )}
          />
          {cloudProvider === 'AWS' && (
            <Controller
              name="metrics_parameters.configuration.cloud_watch_export_config.enabled"
              control={control}
              render={({ field }) => (
                <div className="mt-5">
                  <InputToggle
                    value={field.value}
                    onChange={field.onChange}
                    title="CloudWatch exporter enabled"
                    description="Monitor AWS managed database (RDS)"
                    forceAlignTop
                    small
                    disabled={!metricsEnabled}
                  />
                </div>
              )}
            />
          )}
        </>
      )}
      {fromDetail && cloudProvider === 'AWS' && isKedaFeatureEnabled && (
        <Controller
          name="keda.enabled"
          control={control}
          render={({ field }) => (
            <div className="mt-5">
              <InputToggle
                value={field.value}
                onChange={field.onChange}
                title="KEDA enabled"
                description="Enable KEDA for the cluster"
                forceAlignTop
                small
              />
            </div>
          )}
        />
      )}
    </div>
  )
}

export default ClusterGeneralSettings
