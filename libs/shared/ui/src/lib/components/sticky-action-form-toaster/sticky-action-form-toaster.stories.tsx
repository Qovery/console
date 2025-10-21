import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { StickyActionFormToaster } from './sticky-action-form-toaster'

export default {
  component: StickyActionFormToaster,
  title: 'StickyActionFormToaster',
} as Meta<typeof StickyActionFormToaster>

const Template: StoryFn<typeof StickyActionFormToaster> = (args) => <StickyActionFormToaster {...args} />

export const Primary = Template.bind({})
Primary.args = {
  description: 'Warning, there are still unsaved changes!',
  resetLabel: '',
  submitLabel: 'Save modifications',
  disabledValidation: false,
}
