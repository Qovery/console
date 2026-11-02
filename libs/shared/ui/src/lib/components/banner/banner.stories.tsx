import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { useState } from 'react'
import { Banner, BannerNavigation } from './banner'

export default {
  component: Banner,
  title: 'Banner',
  argTypes: {
    color: {
      control: {
        type: 'select',
      },
    },
  },
} as Meta<typeof Banner>

const children = <p>Hello Banner my old friend</p>
const Template: StoryFn<typeof Banner> = (args) => <Banner {...args} />

export const Primary = Template.bind({})
Primary.args = {
  children,
  color: 'yellow',
  buttonLabel: 'Click me',
  buttonIconRight: 'rotate-right',
}

export const Multiple: StoryFn<typeof Banner> = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const messages = ['Extended credentials required', 'This cluster needs to be redeployed']

  return (
    <Banner color="yellow" className="px-28">
      <span className="min-w-0 truncate">{messages[currentIndex]}</span>
      <BannerNavigation
        currentIndex={currentIndex}
        count={messages.length}
        onPrevious={() => setCurrentIndex((index) => (index - 1 + messages.length) % messages.length)}
        onNext={() => setCurrentIndex((index) => (index + 1) % messages.length)}
      />
    </Banner>
  )
}
