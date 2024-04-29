import { type Meta } from '@storybook/react'
import { IconEnum } from '@qovery/shared/enums'
import Button from '../button/button'
import Icon from '../icon/icon'
import { Section } from '../section/section'
import Tag from '../tag/tag'
import { Header } from './header'

const Story: Meta<typeof Header> = {
  component: Header,
  title: 'Header',
  decorators: [
    (Story) => (
      <Section>
        <Story />
      </Section>
    ),
  ],
}

export default Story

const buttons = (
  <>
    <Button type="button" variant="outline" color="neutral" size="md">
      <Icon iconName="terminal" />
    </Button>
    <Button type="button" variant="outline" color="neutral" size="md">
      <Icon iconName="scroll" />
    </Button>
    <Button type="button" variant="outline" color="neutral" size="md">
      <Icon iconName="clock-rotate-left" />
    </Button>
  </>
)

const actions = (
  <>
    <Tag className="bg-brand-50 text-brand-500">PROD</Tag>
    <div className="border border-neutral-200 bg-white h-6 px-2 rounded text-xs items-center inline-flex font-medium gap-2">
      <Icon name={IconEnum.AWS} width="16" />
      <p className="max-w-[54px] truncate">community-test</p>
    </div>
    <Tag className="bg-neutral-150 gap-2">
      <span className="w-2 h-2 rounded-lg bg-orange-300"></span>
      <span className="w-2 h-2 rounded-lg bg-teal-500"></span>
    </Tag>
  </>
)

export const Primary = {
  args: {
    title: 'Environments',
    icon: IconEnum.ENVIRONMENT,
    buttons: buttons,
    actions: actions,
  },
}
