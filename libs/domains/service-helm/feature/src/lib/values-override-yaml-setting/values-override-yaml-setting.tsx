import { useParams } from '@tanstack/react-router'
import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { CodeEditorInlineSetting, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export interface ValuesOverrideYamlSettingProps {
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  content?: string
}

export interface ValuesOverrideYamlSettingBaseProps extends ValuesOverrideYamlSettingProps {
  environmentId: string
  serviceId?: string
}

export function ValuesOverrideYamlSettingBase({
  environmentId,
  serviceId,
  onSubmit,
  content,
  source,
}: ValuesOverrideYamlSettingBaseProps) {
  const { openModal, closeModal } = useModal()

  const openModalValuesOverrideYaml = () => {
    openModal({
      content: (
        <ValuesOverrideYamlModal
          content={content}
          environmentId={environmentId}
          serviceId={serviceId}
          source={source}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      ),
      options: {
        fullScreen: true,
        fakeModal: true,
      },
    })
  }

  return (
    <CodeEditorInlineSetting
      title="Raw YAML"
      emptyStateText="No override defined."
      addButtonLabel="Create override"
      language="yaml"
      height="300px"
      content={content}
      onOpenModal={openModalValuesOverrideYaml}
    />
  )
}

export function ValuesOverrideYamlSetting(props: ValuesOverrideYamlSettingProps) {
  const { environmentId = '', serviceId } = useParams({ strict: false })

  return <ValuesOverrideYamlSettingBase environmentId={environmentId} serviceId={serviceId} {...props} />
}

export default ValuesOverrideYamlSetting
