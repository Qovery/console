import { TooltipProvider } from '@radix-ui/react-tooltip'
import { type Preview } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import '../src/lib/styles/main.scss'

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <TooltipProvider>
          <Story />
        </TooltipProvider>
      </MemoryRouter>
    ),
  ],
}

export default preview
