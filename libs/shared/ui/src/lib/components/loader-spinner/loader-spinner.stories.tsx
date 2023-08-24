import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { LoaderSpinner } from './loader-spinner'

export default {
  component: LoaderSpinner,
  title: 'LoaderSpinner',
  argTypes: {
    theme: {
      options: ['dark', 'light'],
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof LoaderSpinner>

const Template: ComponentStory<typeof LoaderSpinner> = (args) => <LoaderSpinner {...args} />

export const Primary = Template.bind({})
Primary.args = {
  className: '',
  classWidth: 'w-16',
  classBorder: 'border-4',
  theme: 'light',
}
