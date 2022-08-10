export interface PlaceholderSettingsProps {
  title: string
  description?: string
  className?: string
  dataTestId?: string
}

export function PlaceholderSettings(props: PlaceholderSettingsProps) {
  return (
    <div
      className="text-center flex flex-col items-center justify-center w-[420px] m-auto mt-10"
      data-testid={props.dataTestId || 'placeholder-settings'}
    >
      <img
        className="w-[48px] pointer-events-none user-none mb-5"
        src="/assets/images/event-placeholder-light.svg"
        alt="Event placeholder"
      />
      <p className="text-text-600 font-medium">{props.title}</p>
      {props.description && (
        <p data-testid="placeholder-settings-description" className="text-sm text-text-400 mt-1">
          {props.description}
        </p>
      )}
    </div>
  )
}

export default PlaceholderSettings
