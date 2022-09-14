import { Cluster } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { Value } from '@qovery/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, InputSelect, InputText } from '@qovery/shared/ui'
import { environmentModeValues } from '@qovery/shared/utils'

export interface PageSettingsGeneralProps {
  onSubmit: () => void
  clusters: Cluster[]
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { clusters, onSubmit } = props
  const { control, formState } = useFormContext()

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
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="h5 text-text-700 mb-2">General</h2>
          </div>
        </div>
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
                  options={environmentModeValues}
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
                  options={clustersList}
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
          <div className="flex justify-end">
            <Button
              className="mb-6 btn--no-min-w"
              disabled={!formState.isValid}
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
            >
              Save
            </Button>
          </div>
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
