import { match } from 'ts-pattern'

// Below md: pins a settings form's Save/Cancel row to the bottom of the screen. The negative margin spans the 16px page gutter.
export const STICKY_FORM_ACTIONS_CLASS_NAME =
  'max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:mt-6 max-md:border-t max-md:border-neutral max-md:bg-background max-md:px-4 max-md:py-3'

// Primary action of a settings page header: top-right on desktop, under the description below md
export const SETTINGS_HEADER_ACTION_CLASS_NAME = 'shrink-0 max-md:-mt-4 max-md:mb-8 md:absolute md:right-0 md:top-0'

// Deployment history tables keep the date (column id `created_at`) and status (`action_status`) columns below md
export const deploymentListMobileColumnClassName = (columnId: string) =>
  match(columnId)
    .with('created_at', () => 'max-md:!w-[60%] max-md:overflow-hidden')
    .with('action_status', () => 'max-md:!w-[40%]')
    .otherwise(() => 'max-md:hidden')
