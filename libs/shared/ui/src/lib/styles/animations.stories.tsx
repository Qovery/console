import type { Meta } from '@storybook/react'

const Story: Meta = {
  title: 'Animation',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-brand-500 w-24 flex items-center justify-center text-white animate-slidein-up-faded">
        slidein-up-faded
      </div>
      <div className="bg-brand-500 w-24 flex items-center justify-center text-white animate-slidein-right-faded">
        slidein-right-faded
      </div>
      <div className="bg-brand-500 w-24 flex items-center justify-center text-white animate-slidein-down-faded">
        slidein-down-faded
      </div>
      <div className="bg-brand-500 w-24 flex items-center justify-center text-white animate-slidein-left-faded">
        slidein-left-faded
      </div>
      <div className="bg-brand-500 w-24 flex items-center justify-center text-white animate-fade-in">fade-in</div>
      <div className="bg-brand-500 w-24 flex items-center justify-center text-white animate-fade-out">fade-out</div>
    </div>
  ),
}
export default Story
