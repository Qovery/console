# Test routing

`renderWithProviders` supplies TanStack Router context synchronously for isolated component tests. The legacy `__tests__/utils/setup-jest` renderer uses the same context. Each renderer creates its own React Query client.

For routing behavior, use `renderWithRouter` and opt out of the global router mocks in the test file:

```tsx
import { renderWithRouter, screen } from '@qovery/shared/util-tests'

jest.unmock('@tanstack/react-router')

const { userEvent, router } = await renderWithRouter(<ProjectPage />, {
  path: '/projects/$projectId',
  route: '/projects/project-1?tab=settings',
})
await userEvent.click(screen.getByRole('link', { name: 'Overview' }))
expect(router.state.location.pathname).toBe('/projects/project-1/overview')
```

The default path is `$`, which matches any URL. Supply a path when testing named route parameters. The helper loads the initial route before rendering and returns the regular render utilities, `userEvent`, and the real router. `rerender` preserves the router and query client. Use `router.history.back()` within `act` for history navigation.

Existing isolated tests retain the global hook mocks from `__tests__/mocks.ts`; new routing tests should use the real router rather than adding mocks of navigation behavior.
