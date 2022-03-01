import { Tree } from '@nrwl/devkit'

export default async function (tree: Tree, schema: any) {
  updateIconScss(tree, schema)
  updateIconStorybook(tree, schema)
}

function updateIconScss(tree: Tree, schema: any): void {
  const filePath = `libs/shared/ui/src/lib/styles/base/icons.scss`
  let contents = tree.read(filePath, 'utf8')
  contents += `
.icon-${schema.type}-${schema.name}:before {
  content: '${schema.unicode}';
}

`
  tree.write(filePath, contents)
}

function updateIconStorybook(tree: Tree, schema: any): void {
  const filePath = `libs/shared/ui/src/lib/components/icon/icon.stories.tsx`
  let contents = tree.read(filePath, 'utf8')
  const needle = `// schema: favicons name`

  const replacedValue = `'icon-${schema.type}-${schema.name}',
  ${needle}`

  contents = contents.replace(needle, replacedValue)
  tree.write(filePath, contents)
}
