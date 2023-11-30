import { BlockContent, Button, Icon, IconAwesomeEnum, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export function ValuesOverrideAsYamlSetting() {
  const { openModal, closeModal } = useModal()

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
              content: <ValuesOverrideYamlModal onClose={closeModal} />,
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

export default ValuesOverrideAsYamlSetting
