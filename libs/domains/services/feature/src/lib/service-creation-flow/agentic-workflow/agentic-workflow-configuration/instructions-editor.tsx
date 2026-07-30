import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'

const placeholder =
  'Give your agent instructions, context on how it should operate, what it should do, and what outcome you expect…'

interface InstructionsEditorProps {
  onChange: (value: string) => void
  value: string
}

export function InstructionsEditor({ onChange, value }: InstructionsEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    content: value,
    contentType: 'markdown',
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Markdown,
    ],
    editorProps: {
      attributes: {
        'aria-label': 'Agent instructions',
        class:
          'min-h-40 text-sm leading-5 text-neutral outline-none [&>*+*]:mt-2 [&_a]:text-brand [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-neutral [&_blockquote]:pl-3 [&_blockquote]:text-neutral-subtle [&_code]:rounded [&_code]:bg-surface-neutral-component [&_code]:px-1 [&_code]:text-xs [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:leading-8 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:leading-7 [&_h3]:text-base [&_h3]:font-medium [&_h3]:leading-6 [&_hr]:border-neutral [&_li>p]:inline [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-surface-neutral-component [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-neutral-subtle [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&.ProseMirror-focused_.is-editor-empty:first-child]:before:hidden',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getMarkdown())
    },
  })

  useEffect(() => {
    if (!editor || editor.getMarkdown() === value) return

    editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
  }, [editor, value])

  return <EditorContent editor={editor} />
}
