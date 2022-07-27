import { Tree } from '@nrwl/devkit'

export default async function (tree: Tree, schema: any) {
  updateIconScss(tree, schema)
  updateAwesomeEnum(tree, schema)
}

function updateIconScss(tree: Tree, schema: any): void {
  const filePath = `libs/shared/ui/src/lib/styles/base/icons.scss`
  let contents = tree.read(filePath, 'utf8')

  let unicode = schema.unicode
  // add a slash to the beginning of schema.unicode if it doesn't have one
  if (unicode[0] !== '\\') {
    unicode = `\\${schema.unicode}`
  }

  contents += `
.icon-${schema.type}-${schema.name}:before {
  content: '${unicode}';
}

`
  tree.write(filePath, contents)
}

function updateAwesomeEnum(tree: Tree, schema: any): void {
  const filePath = `libs/shared/ui/src/lib/components/icon/icon-awesome.enum.tsx`
  let contents = tree.read(filePath, 'utf8')
  const needle = `// schema: favicons name`

  const replacedValue = `${schema.enum.toUpperCase()} = 'icon-${schema.type}-${schema.name}',
  ${needle}`

  contents = contents.replace(needle, replacedValue)
  tree.write(filePath, contents)
}
