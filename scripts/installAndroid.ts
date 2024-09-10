import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'
import { backupFile, getMapsApiKey, insertLineAfterString } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string

const apiKey = await getMapsApiKey(projectPath)

const manifestFilePath = join(
  projectPath,
  'android/app/src/main/AndroidManifest.xml'
)

await backupFile(manifestFilePath)

const metaTag = `    <meta-data android:name="com.google.android.geo.API_KEY" android:value="GEO_API_KEY" />`
let manifestContent = await Deno.readTextFile(manifestFilePath)

// check if there's already a meta-data tag with the API key
if (manifestContent.includes('com.google.android.geo.API_KEY')) {
  console.log(`AndroidManifest.xml already contains a meta-data tag with the API key`)
} else {
  // insert meta-data tag before the closing </application> tag
  manifestContent = insertLineAfterString(
    manifestContent,
    '</application',
    metaTag,
    { insertBefore: true }
  )

  // replace KEY with the actual key
  manifestContent = manifestContent.replaceAll('GEO_API_KEY', apiKey)

  await Deno.writeTextFile(manifestFilePath, manifestContent)
  console.log(`Finished updating AndroidManifest.xml`)
}

