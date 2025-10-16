import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputSelectSmall, type InputSelectSmallProps } from './input-select-small'

export default {
  component: InputSelectSmall,
  title: 'Inputs/InputSelectSmall',
} as Meta

const Template: StoryFn<InputSelectSmallProps> = (args) => <InputSelectSmall {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Type of use',
  name: 'type',
  items: [
    {
      label: 'Personal',
      value: 'personal',
    },
    {
      label: 'Work',
      value: 'work',
    },
    {
      label: 'School',
      value: 'school',
    },
  ],
}
