import { TooltipProvider } from '@radix-ui/react-tooltip'
import { withThemeByClassName } from '@storybook/addon-themes'
import { type Preview } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import '../src/lib/styles/main.scss'

const preview: Preview = {
  globalTypes: {
    darkMode: {
      defaultValue: false, // Enable dark mode by default on all stories
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <TooltipProvider>
          <Story />
        </TooltipProvider>
      </MemoryRouter>
    ),
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
