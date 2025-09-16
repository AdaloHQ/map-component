import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'
import { backupFile, getMapsApiKey, insertLineAfterString } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string
const projectName = Deno.env.get('ADALO_APP_PROJECT_NAME') as string

const apiKey = await getMapsApiKey(projectPath)

const podfilePath = join(projectPath, `ios/Podfile`)

await backupFile(podfilePath)

let podfileContent = await Deno.readTextFile(podfilePath)

// Add Google Maps pods at the target level
if (!podfileContent.includes('react-native-maps/Google')) {
  const targetBlockStart = podfileContent.indexOf("target 'AdaloApp' do")
  if (targetBlockStart !== -1) {
    const insertionPoint = podfileContent.indexOf('  config = use_native_modules!', targetBlockStart)
    if (insertionPoint !== -1) {
      const newContent = [
        podfileContent.slice(0, insertionPoint),
        "  # react-native-maps dependencies",
        "  rn_maps_path = '../node_modules/react-native-maps'",
        "  pod 'react-native-maps/Google', :path => rn_maps_path",
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
    '#import <React/RCTBundleURLProvider.h>',
    '#import <GoogleMaps/GoogleMaps.h>',
    { insertAfter: true }
  )
}

// Add API key initialization
if (!appDelegateContent.includes('GMSServices provideAPIKey')) {
  appDelegateContent = insertLineAfterString(
    appDelegateContent,
    'self.initialProps = @{};',
    `  [GMSServices provideAPIKey:@"${apiKey}"];`,
    { insertAfter: true }
  )
}

await Deno.writeTextFile(appDelegatePath, appDelegateContent)
console.log('Successfully updated AppDelegate.mm with Google Maps configuration')
