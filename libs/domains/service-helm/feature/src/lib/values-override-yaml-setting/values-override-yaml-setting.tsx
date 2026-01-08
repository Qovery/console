import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { CodeEditorInlineSetting, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export interface ValuesOverrideYamlSettingProps {
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  content?: string
}

export function ValuesOverrideYamlSetting({ onSubmit, content, source }: ValuesOverrideYamlSettingProps) {
  const { openModal, closeModal } = useModal()
  const { environmentId = '' } = useParams()

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

export default ValuesOverrideYamlSetting
