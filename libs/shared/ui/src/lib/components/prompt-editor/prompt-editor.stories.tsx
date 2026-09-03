import type { Meta } from '@storybook/react-webpack5'
import { PromptEditor } from './prompt-editor'

const Story: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  title: 'PromptEditor',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', maxWidth: 640, padding: '2em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  args: {
    label: 'Instructions',
    name: 'prompt',
    placeholder: 'Tell your agent what to do…',
    value: 'Review the pull request and notify {{SLACK_CHANNEL}} using {{SECRET}}.',
    onChange: () => undefined,
  },
}

export const WithSuggestions = {
  args: {
    ...Primary.args,
    suggestions: [
      { label: 'SECRET', detail: 'Environment variable' },
      { label: 'SLACK_CHANNEL', detail: 'Environment variable' },
    ],
  },
}

export default Story
