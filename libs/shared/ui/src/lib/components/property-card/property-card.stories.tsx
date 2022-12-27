import { ComponentMeta, ComponentStory } from '@storybook/react'
import PropertyCard from './property-card'

export default {
  component: PropertyCard,
  title: 'PropertyCard',
  argTypes: {
    value: {
      control: { type: 'text' },
    },
  },
} as ComponentMeta<typeof PropertyCard>

const Template: ComponentStory<typeof PropertyCard> = (args) => <PropertyCard {...args} />

export const Primary = Template.bind({})
Primary.args = {
  value: 'Every minute',
  isLoading: false,
  name: 'Frequency',
  helperText: 'This is a helper text',
}
