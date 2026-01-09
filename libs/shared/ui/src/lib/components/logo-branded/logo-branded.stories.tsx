import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { LogoBrandedIcon } from './logo'

const meta: Meta<typeof LogoBrandedIcon> = {
  component: LogoBrandedIcon,
  title: 'Logo',
}

export default meta

type Story = StoryObj<typeof LogoBrandedIcon>

export const Primary: Story = {
  render: () => <LogoBrandedIcon />,
}
