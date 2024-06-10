import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'

export const backupFile = (filePath: string) =>
  Deno.copyFile(filePath, `${filePath}.bak`)

export const insertLineAfterString = (
  multiLineText: string,
  searchString: string,
  lineToInsert: string,
  options?: { insertBefore?: boolean }
): string => {
  const lines = multiLineText.split('\n')

  let insertIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      insertIndex = i
      break
    }
  }

  if (insertIndex !== -1) {
    const insertPosition = options?.insertBefore ? insertIndex : insertIndex + 1
    lines.splice(insertPosition, 0, lineToInsert)
  }

  return lines.join('\n')
}

export const getMapsApiKey = async (projectPath: string) => {
  try {
    const protonBundlePath = join(projectPath, 'proton-bundle.json')

    const { default: protonBundle } = await import(protonBundlePath, {
      with: { type: 'json' },
    })

    const apiKey =
      protonBundle.libraryGlobals['@protonapp/map-component']['Map']['apiKey']

    return apiKey
  } catch (error) {
    console.error(
      'Error looking for maps api key in proton-bundle.json: ',
      error.message
    )
    throw error
  }
}
