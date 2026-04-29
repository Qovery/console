import type { Meta } from '@storybook/react-webpack5'

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
      <div className="animate-slidein-up-faded flex w-24 items-center justify-center bg-surface-brand-solid text-white">
        slidein-up-faded
      </div>
      <div className="animate-slidein-right-faded flex w-24 items-center justify-center bg-surface-brand-solid text-white">
        slidein-right-faded
      </div>
      <div className="animate-slidein-down-faded flex w-24 items-center justify-center bg-surface-brand-solid text-white">
        slidein-down-faded
      </div>
      <div className="animate-slidein-left-faded flex w-24 items-center justify-center bg-surface-brand-solid text-white">
        slidein-left-faded
      </div>
      <div className="animate-fade-in flex w-24 items-center justify-center bg-surface-brand-solid text-white">
        fade-in
      </div>
      <div className="animate-fade-out flex w-24 items-center justify-center bg-surface-brand-solid text-white">
        fade-out
      </div>
    </div>
  ),
}
export default Story
