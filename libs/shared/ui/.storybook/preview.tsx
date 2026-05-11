import { TooltipProvider } from '@radix-ui/react-tooltip'
import { withThemeByClassName } from '@storybook/addon-themes'
import { type Decorator, type Preview } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createHashHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import '../src/lib/styles/main.scss'

document.body.classList.add('overflow-auto')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const RouterDecorator: Decorator = (Story) => {
  const Root = createRootRoute({
    component: () => (
      <TooltipProvider>
        <div className="min-h-96 w-full bg-background">
          <Story />
        </div>
      </TooltipProvider>
    ),
  })
  const HomeRoute = createRoute({
    getParentRoute: () => Root,
    path: '/',
  })
  const routeTree = Root.addChildren([HomeRoute])
  const hashHistory = createHashHistory()
  const router = createRouter({
    routeTree,
    history: hashHistory,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

const preview: Preview = {
  globalTypes: {
    darkMode: {
      defaultValue: false, // Enable dark mode by default on all stories
    },
  },

  decorators: [
    RouterDecorator,
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],

  tags: ['autodocs'],
}

export default preview
