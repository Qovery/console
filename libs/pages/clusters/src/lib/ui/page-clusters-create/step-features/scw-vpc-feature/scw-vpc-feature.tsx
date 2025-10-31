import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, Icon, InputText } from '@qovery/shared/ui'

export function SCWVpcFeature() {
  const { control } = useFormContext()

  return (
    <div className="flex flex-col justify-between rounded border border-neutral-250 bg-neutral-100 p-4">
      <div className="flex justify-between">
        <div>
          <h4 className="mb-1 text-sm font-medium text-neutral-400">Deploy on an existing VPC</h4>
          <p className="mb-4 text-sm text-neutral-350">
            Configure your Scaleway VPC settings for the cluster deployment.
          </p>
        </div>
      </div>
      <Controller
        name="scw_existing_vpc.vpc_id"
        rules={{ required: true, shouldUnregister: true }}
        control={control}
        render={({ field }) => (
          <>
            <InputText label="VPC ID" name={field.name} value={field.value} onChange={field.onChange} />
            <ExternalLink
              size="xs"
              href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#use-existing-vpc"
              className="mb-4 ml-4 mt-1"
            >
              How to configure your VPC
            </ExternalLink>
          </>
        )}
      />
    </div>
  )
}

export default SCWVpcFeature
