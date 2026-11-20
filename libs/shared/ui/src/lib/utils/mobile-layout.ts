// Below md: pins a settings form's Save/Cancel row to the bottom of the screen. The negative margin spans the 16px page gutter.
export const STICKY_FORM_ACTIONS_CLASS_NAME =
  'max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:mt-6 max-md:border-t max-md:border-neutral max-md:bg-background max-md:px-4 max-md:py-3'

// Primary action of a settings page header: top-right on desktop, under the description below md
export const SETTINGS_HEADER_ACTION_CLASS_NAME = 'shrink-0 max-md:-mt-4 max-md:mb-8 md:absolute md:right-0 md:top-0'

// Deployment history tables keep the date and status columns below md
export const deploymentListMobileColumnClassName = (index: number) =>
  index === 0 ? 'max-md:!w-[60%] max-md:overflow-hidden' : index === 1 ? 'max-md:!w-[40%]' : 'max-md:hidden'
