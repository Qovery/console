import { type Meta, type StoryFn } from '@storybook/react-webpack5'
import MultipleSelector, { type Option } from './multiple-selector'

export default {
  component: MultipleSelector,
  title: 'Inputs/MultipleSelector',
} as Meta

const options: Option[] = [
  {
    value: 'level:',
    label: 'level:',
    description: '[debug, info, warning, error]',
    subOptions: [
      { value: 'level:error', label: 'level:error' },
      { value: 'level:warning', label: 'level:warning' },
      { value: 'level:info', label: 'level:info' },
      { value: 'level:debug', label: 'level:debug' },
    ],
  },
  {
    value: 'instance:',
    label: 'instance:',
    description: '[instance id]',
  },
  {
    value: 'container:',
    label: 'container:',
    description: '[container name]',
  },
  {
    value: 'version:',
    label: 'version:',
    description: '[version name]',
  },
  {
    value: 'message:',
    label: 'message:',
    description: '[what you want to search for]',
  },
  {
    value: 'nginx:true',
    label: 'nginx:',
    description: '[activate nginx logs]',
  },
]

const groupedOptions: Option[] = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
  { value: 'lettuce', label: 'Lettuce', group: 'Vegetables' },
  { value: 'potato', label: 'Potato', group: 'Vegetables', disable: true },
]

const Template: Story<React.ComponentProps<typeof MultipleSelector>> = (args) => (
  <div className="h-full w-full bg-background p-10">
    <div className="max-w-lg">
      <MultipleSelector {...args} />
    </div>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  options,
  freeTextInput: true,
  placeholder: 'Search logs…',
}

export const WithDefaultSelected = Template.bind({})
WithDefaultSelected.args = {
  options,
  value: [options[0], options[1]],
  placeholder: 'Search logs…',
}

export const Disabled = Template.bind({})
Disabled.args = {
  options,
  placeholder: 'Search logs…',
  disabled: true,
}

export const WithMaxSelected = Template.bind({})
WithMaxSelected.args = {
  options,
  placeholder: 'Select up to 2 fruits',
  maxSelected: 2,
}

export const Grouped = Template.bind({})
Grouped.args = {
  options: groupedOptions,
  groupBy: 'group',
  placeholder: 'Select items',
}

export const Creatable = Template.bind({})
Creatable.args = {
  options,
  placeholder: 'Add or Search logs…',
  creatable: true,
}
