import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { BlockContent, Button, CodeEditor, Icon, IconAwesomeEnum, useModal } from '@qovery/shared/ui'
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
      },
    })
  }

  return (
    <BlockContent
      title="Raw YAML"
      classNameContent="p-0"
      headRight={
        content && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={openModalValuesOverrideYaml}
            className="hover:text-neutral-400"
          >
            <Icon name={IconAwesomeEnum.PEN} />
          </Button>
        )
      }
    >
      {content ? (
        <CodeEditor value={content} readOnly height="300px" language="yaml" />
      ) : (
        <div className="text-center my-4 py-5 px-10">
          <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
          <p className="text-neutral-350 font-medium text-xs mt-1 mb-3">No override defined.</p>
          <Button type="button" size="md" onClick={openModalValuesOverrideYaml}>
            Create override <Icon name={IconAwesomeEnum.PEN} className="ml-2" />
          </Button>
        </div>
      )}
    </BlockContent>
  )
}

export default ValuesOverrideYamlSetting
