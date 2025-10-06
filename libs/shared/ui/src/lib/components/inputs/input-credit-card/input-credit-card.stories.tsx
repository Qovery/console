import type { Meta, StoryFn } from '@storybook/react-webpack5'
import InputCreditCard, { type InputCreditCardProps } from './input-credit-card'

export default {
  component: InputCreditCard,
  title: 'Inputs/InputCreditCard',
} as Meta

const Template: StoryFn<InputCreditCardProps> = (args) => <InputCreditCard {...args} />

const defaultProps: InputCreditCardProps = {
  name: 'firstName',
  disabled: false,
  label: 'First name',
}

export const Number = Template.bind({})
Number.args = {
  ...defaultProps,
  type: 'number',
  label: 'First name',
}

export const Expiry = Template.bind({})
Expiry.args = {
  ...defaultProps,
  type: 'expiry',
  label: 'Expiry',
}

export const CVC = Template.bind({})
CVC.args = {
  ...defaultProps,
  type: 'cvc',
  label: 'CVC',
}
