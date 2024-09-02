import { clsx } from 'clsx'
import { match } from 'ts-pattern'
import { Icon, Popover } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { type AssistantIcon, AssistantIconKey } from '../assistant-icon/assistant-icon'

export function AssistantIconSwitcher() {
  const [assistantIcon, setAssistantIcon] = useLocalStorage<AssistantIcon>(AssistantIconKey, 'QUESTION_MARK')
  const isQuestionMarkSelected = assistantIcon === 'QUESTION_MARK'
  const isPaperclipSelected = assistantIcon === 'PAPERCLIP'
  return (
    <Popover.Root>
      <Popover.Trigger>
        <button className="relative rounded-full transition hover:bg-neutral-100" type="button">
          {match(assistantIcon)
            .with('PAPERCLIP', () => (
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-neutral-50 shadow-2xl outline-brand-600 transition">
                <Icon iconStyle="regular" iconName="question" className="text-xs" />
              </div>
            ))

            .with('QUESTION_MARK', () => (
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-neutral-50 shadow-2xl outline-brand-600 transition">
                <Icon iconStyle="regular" iconName="question" className="text-xs" />
              </div>
            ))
            .exhaustive()}
          <Icon
            iconName="angle-down"
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-white p-0.5 text-[8px] text-neutral-300"
          />
        </button>
      </Popover.Trigger>
      <Popover.Content side="bottom" className="grid grid-cols-2 gap-2 text-sm text-neutral-350" style={{ width: 212 }}>
        <Popover.Close>
          <div
            className={clsx(
              'max-h-24 max-w-24 cursor-pointer select-none rounded border p-2',
              isQuestionMarkSelected && 'border-brand-500 bg-brand-50',
              !isQuestionMarkSelected && 'border-neutral-250 transition hover:border-neutral-300'
            )}
            onClick={() => setAssistantIcon('QUESTION_MARK')}
          >
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-neutral-50 shadow-2xl outline-brand-600 ">
              <Icon iconStyle="regular" iconName="question" className="text-2xl" />
            </div>
          </div>
        </Popover.Close>
        <Popover.Close>
          <img
            className={clsx(
              'max-h-24 max-w-24 cursor-pointer select-none rounded border p-2',
              isPaperclipSelected && 'border-brand-500 bg-brand-50',
              !isPaperclipSelected && 'border-neutral-250 transition hover:border-neutral-300'
            )}
            width="100%"
            height="100%"
            src="/assets/images/paperclip_emoji.png"
            alt="paperclip"
            onClick={() => setAssistantIcon('PAPERCLIP')}
          />
        </Popover.Close>
      </Popover.Content>
    </Popover.Root>
  )
}

export default AssistantIconSwitcher
