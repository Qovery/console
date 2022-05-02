import { IconEnum } from '@console/shared/enums'
import { ButtonIcon, ButtonIconStyle, Header, HeaderProps, Icon, Tag } from '@console/shared/ui'
import { Meta, Story } from '@storybook/react'

export default {
  component: Header,
  title: 'Header',
} as Meta

const buttons = (
  <>
    <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
    <ButtonIcon icon="icon-solid-scroll" style={ButtonIconStyle.STROKED} />
    <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} />
  </>
)

const actions = (
  <>
    <Tag className="bg-brand-50 text-brand-500">PROD</Tag>
    <div className="border border-element-light-lighter-400 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium gap-2">
      <Icon name={IconEnum.AWS} width="16" />
      <p className="max-w-[54px] truncate">community-test</p>
    </div>
    <Tag className="bg-element-light-lighter-300 gap-2">
      <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
      <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
    </Tag>
  </>
)

const Template: Story<HeaderProps> = (args) => <Header {...args} />

export const Primary = Template.bind({})
Primary.args = {
  title: 'Environments',
  icon: IconEnum.ENVIRONMENT,
  buttons: buttons,
  actions: actions,
}
