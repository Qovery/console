import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { CodeEditorInlineSetting, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export interface ValuesOverrideYamlSettingProps {
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  content?: string
}

export interface ValuesOverrideYamlSettingBaseProps extends ValuesOverrideYamlSettingProps {
  environmentId: string
}

export function ValuesOverrideYamlSettingBase({
  environmentId,
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
  const { environmentId = '' } = useParams()

  return <ValuesOverrideYamlSettingBase environmentId={environmentId} {...props} />
}

export default ValuesOverrideYamlSetting
