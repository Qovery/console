// The console's pricing client and the calls it mounts live with the billing kit (console-paywall.tsx),
// so every domain (clusters, services) uses the same one.
import { pickConsoleCalls, usePricingClient } from '@qovery/shared/billing-kit'

export { pickConsoleCalls, usePricingClient }

export default usePricingClient
