import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { LogoBrandedIcon } from './logo-branded'

const meta: Meta<typeof LogoBrandedIcon> = {
  component: LogoBrandedIcon,
  title: 'LogoBranded',
}

export default meta

type Story = StoryObj<typeof LogoBrandedIcon>

export const Primary: Story = {
  render: () => <LogoBrandedIcon />,
}
