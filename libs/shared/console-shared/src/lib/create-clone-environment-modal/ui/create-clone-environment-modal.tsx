import { type Environment, EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type FormEvent, useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type ClusterEntity, type Value } from '@qovery/shared/interfaces'
import { ExternalLink, InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CreateCloneEnvironmentModalProps {
  onSubmit: () => void
  environmentToClone?: Environment
  clusters?: ClusterEntity[]
  closeModal: () => void
  loading: boolean
}

export function CreateCloneEnvironmentModal(props: CreateCloneEnvironmentModalProps) {
  const { control } = useFormContext()

  const [environmentModes] = useState<Value[]>([
    { value: 'automatic', label: 'Automatic' },
    { value: EnvironmentModeEnum.DEVELOPMENT, label: 'Development' },
    { value: EnvironmentModeEnum.STAGING, label: 'Staging' },
    { value: EnvironmentModeEnum.PRODUCTION, label: 'Production' },
  ])
  const [clusterItems, setClusterItems] = useState<Value[]>([])

  useEffect(() => {
    if (props.clusters && props.clusters.length) {
      setClusterItems([
        { label: 'Automatic', value: 'automatic' },
        ...props.clusters.map((c) => ({ value: c.id, label: c.name })),
      ])
    }
  }, [setClusterItems, props.clusters])

  return (
    <ModalCrud
      title={props.environmentToClone ? 'Clone Environment' : 'Create Environment'}
      description={
        props.environmentToClone
          ? 'Clone the environment on the same or different target cluster.'
          : 'Create a new environment and deploy your applications.'
      }
      onClose={props.closeModal}
      onSubmit={props.onSubmit}
      loading={props.loading}
      submitLabel={props.environmentToClone ? 'Clone' : 'Create'}
      howItWorks={
        props.environmentToClone ? (
          <>
            <div>
              Create a new environment to deploy your applications. You can create a new environment by defining:
            </div>
            <ol className="list-disc ml-3">
              <li className="mb-2 mt-2">its name</li>
              <li className="mb-2">
                the cluster: you can select one of the existing clusters. If Automatic is selected, the environment will
                be assigned to the oldest cluster of the organisation unless if a project deployment rule is defined and
                matches the environment name. Cluster can’t be changed after the environment creation.
              </li>
              <li className="mb-2">
                the type: it defines the type of environment you are creating among Production, Staging, Development.
              </li>
            </ol>
            <ExternalLink
              className="mt-2"
              href="https://hub.qovery.com/docs/using-qovery/configuration/environment/#create-an-environment"
            >
              Documentation
            </ExternalLink>
          </>
        ) : (
          <>
            <div>
              It creates a new environment having the same configuration of the source environment. All the
              configurations will be copied within the new environment except for the custom domains defined on the
              services. The environment will be cloned on the selected cluster and with the selected type. Once cloned,
              you will be able to deploy it.
            </div>
            <ExternalLink
              className="mt-2"
              href="https://hub.qovery.com/docs/using-qovery/configuration/environment/#clone-environment"
            >
              Documentation
            </ExternalLink>
          </>
        )
      }
    >
      {props.environmentToClone && (
        <InputText
          className="mb-6"
          name="clone"
          value={props.environmentToClone.name}
          label="Environment to clone"
          disabled={true}
        />
      )}

      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a value',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-6"
            name={field.name}
            onChange={(event: FormEvent<HTMLInputElement>) => {
              field.onChange(
                event.currentTarget.value
                  .replace(/[^\w\s\\/]/g, '-') // remove special chars but keep / and \
                  .toLowerCase()
                  .replace(/ /g, '-')
              )
            }}
            value={field.value}
            label={props.environmentToClone?.name ? 'New environment name' : 'Environment name'}
            error={error?.message}
          />
        )}
      />
      <Controller
        name="cluster"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-cluster"
            className="mb-6"
            onChange={field.onChange}
            value={field.value}
            label="Cluster"
            error={error?.message}
            options={clusterItems}
            portal={true}
          />
        )}
      />
      <Controller
        name="mode"
        control={control}
        rules={{
          required: 'Please select a value.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            className="mb-6"
            dataTestId="input-select-mode"
            options={environmentModes}
            onChange={field.onChange}
            value={field.value}
            label="Type"
            portal={true}
          />
        )}
      />
    </ModalCrud>
  )
}

export default CreateCloneEnvironmentModal
