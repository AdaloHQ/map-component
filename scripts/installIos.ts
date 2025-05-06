import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'
import { backupFile, getMapsApiKey, insertLineAfterString } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string
const projectName = Deno.env.get('ADALO_APP_PROJECT_NAME') as string

const apiKey = await getMapsApiKey(projectPath)

const podfilePath = join(projectPath, `ios/Podfile`)

await backupFile(podfilePath)

let podfileContent = await Deno.readTextFile(podfilePath)

const appDelegatePath = join(projectPath, `ios/${projectName}/AppDelegate.mm`)

await backupFile(appDelegatePath)

let appDelegateContent = await Deno.readTextFile(appDelegatePath)

// Add `#import <GoogleMaps/GoogleMaps.h>` BEFORE `// MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS`

appDelegateContent = insertLineAfterString(
  appDelegateContent,
  'MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS',
  `#import <GoogleMaps/GoogleMaps.h>`,
  { insertBefore: true }
)

// Add `[GMSServices provideAPIKey:@"GEO_API_KEY"];` AFTER `self.initialProps = @{};`

appDelegateContent = insertLineAfterString(
  appDelegateContent,
  'initialProps = @{}',
  `  [GMSServices provideAPIKey:@"GEO_API_KEY"];`
)

// Replace `GEO_API_KEY` with the value of `key`
appDelegateContent = appDelegateContent.replaceAll('GEO_API_KEY', apiKey)

await Deno.writeTextFile(appDelegatePath, appDelegateContent)
console.log(`Updated AppDelegate.mm with GoogleMaps import and API key`)
