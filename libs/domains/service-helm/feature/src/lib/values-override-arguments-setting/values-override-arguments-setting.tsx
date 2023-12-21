import { type GitProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { Heading, Icon, IconAwesomeEnum, Popover, Section } from '@qovery/shared/ui'

export interface HelmValuesArgumentData {
  repository?: string
  provider?: GitProviderEnum
  branch?: string
  paths?: string
  content?: string
}

export interface ValuesOverrideArgumentsSettingProps extends PropsWithChildren {
  methods?: UseFormReturn<HelmValuesArgumentData>
  onSubmit?: () => void
}

export function ValuesOverrideArgumentsSetting({ methods, children, onSubmit }: ValuesOverrideArgumentsSettingProps) {
  return (
    <Section className="items-start">
      <Heading className="mb-2">Value override as arguments</Heading>
      <p className="text-sm text-neutral-350 mb-2">
        Specify each override by declaring the variable name, value and its type.
      </p>
      <Popover.Root>
        <Popover.Trigger>
          <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium mb-5">
            How it works <Icon className="text-xs" name={IconAwesomeEnum.CIRCLE_QUESTION} />
          </span>
        </Popover.Trigger>
        <Popover.Content side="left" className="text-neutral-350 text-sm relative" style={{ width: 440 }}>
          <h6 className="text-neutral-400 font-medium mb-2">How it works</h6>
          <p>
            Specify each override by declaring the variable name, value and its type. These will be passed via the
            --set, --set-string and --set-json helm argument depending on the selected type (Generic, String or Json).
            Values set here have the higher override priority.
          </p>
          <Popover.Close className="absolute top-4 right-4">
            <button type="button">
              <Icon name={IconAwesomeEnum.XMARK} className="text-lg leading-4 text-neutral-400" />
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <form onSubmit={onSubmit} className="w-full">
        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideArgumentsSetting
