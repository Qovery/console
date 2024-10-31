import { type Cluster } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { environmentModeValues } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { BlockContent, Button, InputSelect, InputText, Section } from '@qovery/shared/ui'

export interface PageSettingsGeneralProps {
  onSubmit: () => void
  clusters: Cluster[]
  loading: boolean
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { clusters, onSubmit, loading } = props
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
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="General" />
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
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
                  hint="Cluster cannot be changed. Clone the environment to deploy the same applications on another cluster."
                  disabled
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsGeneral
