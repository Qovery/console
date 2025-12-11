import { createRootRoute, createRouter } from '@tanstack/react-router'

export const rootRoute = createRootRoute()

const routeTree = rootRoute.addChildren([])

export const router = createRouter({
  routeTree,
})
