import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export function DeploymentSetting() {
  const { control } = useFormContext()

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Controller
          name="arguments"
          control={control}
          defaultValue={`["--wait"]`}
          rules={{
            required: 'Please enter an command.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              label="Helm arguments"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <p className="text-xs text-neutral-350 ml-4 mt-1">
          Specify the helm arguments to be used during the helm install/upgrade. Expected format: ["-h", "0.0.0.0"]
          <br />
          <ExternalLink size="xs" href="https://helm.sh/docs/helm/helm_install/" className="mt-0.5">
            See documentation
          </ExternalLink>
        </p>
      </div>
      <Controller
        name="timeout_sec"
        control={control}
        defaultValue={600}
        rules={{
          required: 'Please enter a timeout.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            label="Helm timeout"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
          />
        )}
      />
      <Controller
        name="auto_preview"
        control={control}
        render={({ field }) => (
          <InputToggle
            title="Allow cluster-wide resources"
            description="Allow this chart to deploy resources outside of this environment namespace (including CRDs or non-namespaced resources)."
            className="mt-2"
            value={field.value}
            onChange={field.onChange}
            forceAlignTop
            small
          />
        )}
      />
    </div>
  )
}

export default DeploymentSetting
