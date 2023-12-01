import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { BlockContent, Button, Icon, IconAwesomeEnum, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export interface ValuesOverrideYamlSettingProps {
  source: HelmRequestAllOfSource
}

export function ValuesOverrideYamlSetting({ source }: ValuesOverrideYamlSettingProps) {
  const { openModal, closeModal } = useModal()
  const { environmentId = '' } = useParams()

  return (
    <BlockContent title="Raw YAML">
      <div className="text-center my-4 px-5">
        <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
        <p className="text-neutral-350 font-medium text-xs mt-1 mb-3">No override defined.</p>
        <Button
          type="button"
          size="md"
          onClick={() => {
            openModal({
              content: (
                <ValuesOverrideYamlModal
                  environmentId={environmentId}
                  source={source}
                  onClose={closeModal}
                  onSubmit={(value: string) => {
                    console.log(value)
                  }}
                />
              ),
              options: {
                width: 0,
                fullScreen: true,
              },
            })
          }}
        >
          Create override <Icon name={IconAwesomeEnum.PEN} className="ml-2" />
        </Button>
      </div>
    </BlockContent>
  )
}

export default ValuesOverrideYamlSetting
