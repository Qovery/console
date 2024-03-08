import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ExternalLink, InputSelect, InputText } from '@qovery/shared/ui'

export function GCPVpcFeature() {
  const { control, watch } = useFormContext()

  const watchVpcMode = watch('gcp_existing_vpc.vpc_mode')
  const [openOptions, setOpenOptions] = useState(false)

  return (
    <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250">
      <div className="flex justify-between">
        <div>
          <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
          <p className="text-neutral-350 text-sm mb-2">In your VPC settings, you must enable the DNS hostnames.</p>
          <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/" className="mb-4">
            How to configure existing VPC
          </ExternalLink>
        </div>
      </div>
      <Controller
        name="gcp_existing_vpc.vpc_project_id"
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
          <InputText
            className="mb-3"
            label="VPC Name"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="gcp_existing_vpc.vpc_mode"
        defaultValue="AUTOMATIC"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            className="mb-3"
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
      {watchVpcMode === 'CUSTOM' && (
        <Controller
          name="gcp_existing_vpc.subnetwork_name"
          rules={{ required: true }}
          control={control}
          render={({ field }) => (
            <InputText label="Subnetwork range name" name={field.name} value={field.value} onChange={field.onChange} />
          )}
        />
      )}
      {!openOptions && (
        <Button
          type="button"
          className="justify-center"
          variant="outline"
          size="md"
          onClick={() => setOpenOptions(!openOptions)}
        >
          Set additional ranges
        </Button>
      )}
      {openOptions && (
        <>
          <hr className="my-4" />
          <h4 className="text-neutral-400 text-sm font-medium mb-4">Additional ranges (optional)</h4>
          <Controller
            name="gcp_existing_vpc.ip_range_pods_name"
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <InputText
                className="mb-4"
                label="Pod IPv4 address range name (optional)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="gcp_existing_vpc.additional_ip_range_pods_names"
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <InputText
                className="mb-4"
                label="Cluster Pod IPv4 ranges names (additional) (optional)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="gcp_existing_vpc.ip_range_services_name"
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <InputText
                label="IPv4 service range name (optional)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </>
      )}
    </div>
  )
}

export default GCPVpcFeature
