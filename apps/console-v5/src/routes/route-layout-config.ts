export interface RouteLayoutOptions {
  fullWidth?: boolean
}

export const routeLayoutConfig: Record<string, RouteLayoutOptions> = {}

export function registerRouteLayout(routeId: string, options: RouteLayoutOptions) {
  routeLayoutConfig[routeId] = options
}
