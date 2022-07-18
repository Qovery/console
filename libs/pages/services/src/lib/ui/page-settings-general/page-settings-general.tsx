import { Cluster } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, InputSelect, InputText } from '@console/shared/ui'
import { Value } from '@console/shared/interfaces'

export interface PageSettingsGeneralProps {
  onSubmit: () => void
  clusters: Cluster[]
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { clusters, onSubmit } = props
  const { control, formState } = useFormContext()

  const modeSelection = [
    {
      label: 'Development',
      value: 'DEVELOPMENT',
    },
    {
      label: 'Production',
      value: 'PRODUCTION',
    },
    {
      label: 'Staging',
      value: 'STAGING',
    },
    {
      label: 'Preview',
      value: 'PREVIEW',
    },
  ]

  const clustersList: Value[] = clusters
    ? clusters?.map((cluster) => {
        const item = {
          label: cluster.name,
          value: cluster.id,
        }
        return item
      })
    : []

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 w-[580px]">
        <form onSubmit={onSubmit}>
          <BlockContent title="General informations">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter a environment name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label="Environment name"
                  className="mb-3"
                />
              )}
            />
            <Controller
              name="mode"
              control={control}
              rules={{ required: 'Please select a mode' }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Mode"
                  items={modeSelection}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  className="mb-3"
                />
              )}
            />
            <Controller
              name="cluster_id"
              control={control}
              rules={{ required: 'Please select a cluster' }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Cluster"
                  items={clustersList}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  className="mb-1"
                  disabled
                />
              )}
            />
            <p className="text-xs text-text-400 ml-4">Clusters cannot be changed at this time.</p>
          </BlockContent>
          <Button
            className="mb-6"
            disabled={!formState.isValid}
            size={ButtonSize.NORMAL}
            style={ButtonStyle.BASIC}
            type="submit"
          >
            Save
          </Button>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/',
            linkLabel: 'How to configure my environment',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsGeneral
