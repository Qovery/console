import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Value } from '@qovery/shared/interfaces'
import { BannerBox, BannerBoxEnum, BlockContent, IconAwesomeEnum, InputSelect } from '@qovery/shared/ui'

export interface SettingsResourcesInstanceTypesProps {
  databaseInstanceTypes?: Value[]
}

export function SettingsResourcesInstanceTypesMemo({
  databaseInstanceTypes = [],
}: SettingsResourcesInstanceTypesProps) {
  const { control } = useFormContext()

  return (
    <BlockContent title="Instance Type">
      <Controller
        name="instance_type"
        control={control}
        rules={{
          required: 'Please select an instance type',
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <InputSelect
              isSearchable
              onChange={field.onChange}
              value={field.value}
              label="Instance type"
              error={error?.message}
              options={databaseInstanceTypes}
            />
            <p className="text-text-400 text-xs my-3">
              The chosen instance type has a direct impact on your cloud provider cost.
            </p>
          </div>
        )}
      />
      <BannerBox
        message="Once started, the upgrade will be managed by your cloud provider. The upgrade might be applied on a different time window and cause service interruption. Have a look at the cloud provider documentation before launching the upgrade."
        type={BannerBoxEnum.WARNING}
        icon={IconAwesomeEnum.CIRCLE_INFO}
      />
    </BlockContent>
  )
}

export const SettingsResourcesInstanceTypes = React.memo(SettingsResourcesInstanceTypesMemo, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.databaseInstanceTypes) === JSON.stringify(nextProps.databaseInstanceTypes)
})

export default SettingsResourcesInstanceTypes
