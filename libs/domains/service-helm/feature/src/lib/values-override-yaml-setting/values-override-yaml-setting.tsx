import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { CodeEditorInlineSetting, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export interface ValuesOverrideYamlSettingBaseProps {
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  content?: string
  environmentId?: string
}

export function ValuesOverrideYamlSettingBase({
  onSubmit,
  content,
  source,
  environmentId = '',
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

export interface ValuesOverrideYamlSettingProps {
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  content?: string
}

export function ValuesOverrideYamlSetting({ onSubmit, content, source }: ValuesOverrideYamlSettingProps) {
  const { environmentId = '' } = useParams()

  return (
    <ValuesOverrideYamlSettingBase
      content={content}
      source={source}
      onSubmit={onSubmit}
      environmentId={environmentId}
    />
  )
}

export default ValuesOverrideYamlSetting
