import { type ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import { BlockContent, InputTextArea } from '@qovery/shared/ui'

export interface ClusterRemoteSettingsProps {
  fromDetail?: boolean
}

export function ClusterRemoteSettings(props: ClusterRemoteSettingsProps) {
  const { fromDetail } = props
  const { control } = useFormContext<ClusterRemoteData>()

  const BlockWrapper = (properties: { children: ReactNode }) => (
    <div>
      {!fromDetail ? properties.children : <BlockContent title="Configured access">{properties.children}</BlockContent>}
    </div>
  )

  return (
    <BlockWrapper>
      <Controller
        name="ssh_key"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            className="mb-3"
            dataTestId="input-ssh"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="SSH Key"
            error={error?.message}
          />
        )}
      />
    </BlockWrapper>
  )
}

export default ClusterRemoteSettings
