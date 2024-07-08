import type { Meta } from '@storybook/react'
import { useXTerm } from 'react-xtermjs'
import Button from '../button/button'

const MyComponent = () => {
  const { instance, ref } = useXTerm()

  instance?.onData((data) => instance?.write(data))

  return (
    <div>
      <Button className="mb-2" onClick={() => instance?.reset()}>
        Clear terminal
      </Button>
      <div ref={ref} />
    </div>
  )
}

const Story: Meta<typeof MyComponent> = {
  component: MyComponent,
  title: 'XTerm',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  args: {},
}

export default Story
