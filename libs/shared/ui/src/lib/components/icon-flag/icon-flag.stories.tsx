import { Meta, Story } from '@storybook/react'
import IconFlag, { IconFlagProps } from './icon-flag'

export default {
  component: IconFlag,
  title: 'IconFlag',
} as Meta

const Template: Story<IconFlagProps> = (props: IconFlagProps) => (
  <IconFlag code={props.code} className={props.className} />
)

export const Primary = Template.bind({})
Primary.args = {
  code: 'FR',
  className: '',
}
