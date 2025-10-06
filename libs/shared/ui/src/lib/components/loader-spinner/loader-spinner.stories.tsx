import type { Meta, StoryFn } from '@storybook/react-webpack5'
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
} as Meta<typeof LoaderSpinner>

const Template: StoryFn<typeof LoaderSpinner> = (args) => <LoaderSpinner {...args} />

export const Primary = Template.bind({})
Primary.args = {
  className: '',
  classWidth: 'w-16',
  classBorder: 'border-4',
  theme: 'light',
}
