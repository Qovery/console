import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { LogoIcon } from './logo'

const meta: Meta<typeof LogoIcon> = {
  component: LogoIcon,
  title: 'Logo',
}

export default meta

type Story = StoryObj<typeof LogoIcon>

export const Primary: Story = {
  render: () => <LogoIcon />,
}
