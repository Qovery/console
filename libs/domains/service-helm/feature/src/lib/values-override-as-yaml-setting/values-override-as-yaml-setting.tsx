import { BlockContent, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export function ValuesOverrideAsYamlSetting() {
  return (
    <BlockContent title="Raw YAML">
      <div className="text-center my-4 px-5">
        <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
        <p className="text-neutral-350 font-medium text-xs mt-1">No override defined.</p>
      </div>
    </BlockContent>
  )
}

export default ValuesOverrideAsYamlSetting
