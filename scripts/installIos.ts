import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'
import { backupFile, getMapsApiKey, insertLineAfterString } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string
const projectName = Deno.env.get('ADALO_APP_PROJECT_NAME') as string

const apiKey = await getMapsApiKey(projectPath)

const podfilePath = join(projectPath, `ios/Podfile`)

await backupFile(podfilePath)

let podfileContent = await Deno.readTextFile(podfilePath)

// Add Google Maps pods at the target level
if (!podfileContent.includes('react-native-google-maps')) {
  const targetBlockStart = podfileContent.indexOf("target 'AdaloApp' do")
  if (targetBlockStart !== -1) {
    const insertionPoint = podfileContent.indexOf('use_react_native!', targetBlockStart)
    if (insertionPoint !== -1) {
      const newContent = [
        podfileContent.slice(0, insertionPoint),
        "  # react-native-maps dependencies",
        "  pod 'GoogleMaps'",
        "  pod 'Google-Maps-iOS-Utils'",
        "  pod 'react-native-google-maps', :path => '../node_modules/react-native-maps'",
        "  ",
        podfileContent.slice(insertionPoint)
      ].join('\n')

      await Deno.writeTextFile(podfilePath, newContent)
      console.log('Successfully updated Podfile with Google Maps dependencies')
    }
  }
}

// 2. Handle AppDelegate modifications
const appDelegatePath = join(projectPath, `ios/${projectName}/AppDelegate.mm`)
await backupFile(appDelegatePath)

let appDelegateContent = await Deno.readTextFile(appDelegatePath)

// Add GoogleMaps import
if (!appDelegateContent.includes('<GoogleMaps/GoogleMaps.h>')) {
  appDelegateContent = insertLineAfterString(
    appDelegateContent,
    '#import <React/RCTBridgeDelegate.h>',
    '#import <GoogleMaps/GoogleMaps.h>',
    { insertAfter: true }
  )
}

// Add API key initialization
if (!appDelegateContent.includes('GMSServices provideAPIKey')) {
  appDelegateContent = insertLineAfterString(
    appDelegateContent,
    'RCTAppSetupPrepareApp(application)',
    `  [GMSServices provideAPIKey:@"${apiKey}"];`,
    { insertAfter: true }
  )
}

await Deno.writeTextFile(appDelegatePath, appDelegateContent)
console.log('Successfully updated AppDelegate.mm with Google Maps configuration')
