import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputSelect, InputText } from '@qovery/shared/ui'

export function GCPVpcFeature() {
  const { control } = useFormContext()

  return (
    <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250">
      <div className="flex justify-between">
        <div>
          <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
          <p className="text-neutral-350 text-sm mb-4">In your VPC settings, you must enable the DNS hostnames.</p>
          <ExternalLink
            size="xs"
            href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/"
            className="mt-1 ml-4 mb-4"
          >
            How to configure existing VPC
          </ExternalLink>
        </div>
      </div>
      <Controller
        name="gcp_existing_vpc.project_id"
        rules={{ required: true }}
        control={control}
        render={({ field }) => (
          <>
            <InputText label="External project id" name={field.name} value={field.value} onChange={field.onChange} />
            <p className="text-neutral-350 text-xs ml-4 mt-1 mb-3">
              By default: the project id used is the one specified in the credentials file
            </p>
          </>
        )}
      />
      <Controller
        name="gcp_existing_vpc.vpc_name"
        rules={{ required: true }}
        control={control}
        render={({ field }) => (
          <InputText label="VPC Name" name={field.name} value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        name="gcp_existing_vpc.vpc_mode"
        defaultValue="AUTOMATIC"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            onChange={field.onChange}
            value={field.value}
            label="VPC Mode"
            error={error?.message}
            options={[
              {
                label: 'Automatic',
                value: 'AUTOMATIC',
              },
              {
                label: 'Custom',
                value: 'CUSTOM',
              },
            ]}
            portal
          />
        )}
      />
    </div>
  )
}

export default GCPVpcFeature
