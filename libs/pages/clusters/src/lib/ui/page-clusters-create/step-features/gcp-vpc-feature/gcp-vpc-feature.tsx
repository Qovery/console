import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ExternalLink, InputText } from '@qovery/shared/ui'

export function GCPVpcFeature() {
  const { control } = useFormContext()
  const [openOptions, setOpenOptions] = useState(false)

  const pattern = {
    value: /^[a-z0-9-,]+$/i,
    message: 'Invalid name format (lowercase letters, numbers, and dashes only)',
  }

  return (
    <div className="flex flex-col justify-between p-4 rounded border bg-neutral-100 border-neutral-250">
      <div className="flex justify-between">
        <div>
          <h4 className="text-neutral-400 text-sm font-medium mb-1">Deploy on an existing VPC</h4>
          <ExternalLink
            href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#use-existing-vpc"
            className="mb-4"
          >
            How to configure existing VPC
          </ExternalLink>
        </div>
      </div>
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
        name="gcp_existing_vpc.vpc_project_id"
        control={control}
        render={({ field }) => (
          <>
            <InputText
              label="External project id (optional)"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
            />
            <p className="text-neutral-350 text-xs ml-4 mt-1 mb-3">
              By default: the project id used is the one specified in the credentials file
            </p>
          </>
        )}
      />
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
            name="gcp_existing_vpc.subnetwork_name"
            rules={{
              pattern,
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-4"
                label="Subnetwork range name (optional)"
                name={field.name}
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="gcp_existing_vpc.ip_range_pods_name"
            rules={{
              pattern,
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-4"
                label="Pod IPv4 address range name (optional)"
                name={field.name}
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="gcp_existing_vpc.additional_ip_range_pods_names"
            rules={{
              pattern,
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-4"
                label="Additional cluster Pod IPv4 ranges names (separated with a comma) (optional)"
                name={field.name}
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="gcp_existing_vpc.ip_range_services_name"
            rules={{
              pattern,
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="IPv4 service range name (optional)"
                name={field.name}
                value={field.value}
                error={error?.message}
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
