import { BlockContent } from '../block-content/block-content'
import { Button } from '../button/button'
import { CodeEditor } from '../code-editor/code-editor'
import { Icon } from '../icon/icon'

export interface CodeEditorInlineSettingProps {
  title: string
  emptyStateText: string
  addButtonLabel: string
  language: string
  height?: string
  content?: string
  onOpenModal: () => void
}

export function CodeEditorInlineSetting({
  title,
  emptyStateText,
  addButtonLabel,
  language,
  height = '200px',
  content,
  onOpenModal,
}: CodeEditorInlineSettingProps) {
  return (
    <BlockContent
      title={title}
      classNameContent="p-0"
      headRight={
        content && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={onOpenModal}
            className="aspect-square justify-center p-0 hover:text-neutral-400"
          >
            <Icon iconName="pen" />
          </Button>
        )
      }
    >
      {content ? (
        <CodeEditor value={content} readOnly height={height} language={language} />
      ) : (
        <div className="my-4 px-10 py-5 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">{emptyStateText}</p>
          <Button type="button" size="md" variant="outline" onClick={onOpenModal}>
            <Icon iconName="plus" className="mr-2" />
            {addButtonLabel}
          </Button>
        </div>
      )}
    </BlockContent>
  )
}

export default CodeEditorInlineSetting
