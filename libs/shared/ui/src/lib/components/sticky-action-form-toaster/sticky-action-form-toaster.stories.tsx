import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { StickyActionFormToaster } from './sticky-action-form-toaster'

export default {
  component: StickyActionFormToaster,
  title: 'StickyActionFormToaster',
} as ComponentMeta<typeof StickyActionFormToaster>

const Template: ComponentStory<typeof StickyActionFormToaster> = (args) => <StickyActionFormToaster {...args} />

export const Primary = Template.bind({})
Primary.args = {
  description: 'Warning, there are still unsaved changes!',
  resetLabel: '',
  submitLabel: 'Save modifications',
  disabledValidation: false,
}
