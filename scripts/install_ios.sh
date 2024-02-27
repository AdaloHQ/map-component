#!/bin/bash
set -e
set -x

project_path=$(pwd)
name=$PROJECT_NAME

key=$("${dir}/get_maps_api_key.js")

cd ios

# Replace `platform :ios, min_ios_version_supported`` with `platform :ios, '13.4'`
sed -i.bak "s/platform :ios, min_ios_version_supported/platform :ios, '13.4'/g" Podfile

# Add `#import <GoogleMaps/GoogleMaps.h>` BEFORE `// MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS`
sed -i.bak '/\/\/ MARKER_REACT_NATIVE_IOS_APP_DELEGATE_IMPORTS/i\
#import <GoogleMaps/GoogleMaps.h>\
' ./${name}/AppDelegate.mm

# Add `[GMSServices provideAPIKey:@"GEO_API_KEY"];` AFTER `self.initialProps = @{};`
sed -i.bak '/self.initialProps = @{};/a\
  [GMSServices provideAPIKey:@"GEO_API_KEY"];\
' ./${name}/AppDelegate.mm

# Replace `GEO_API_KEY` with the value of `key`
sed -i.bak "s/GEO_API_KEY/${key}/g" ./${name}/AppDelegate.mm

echo "react-native-maps configuration completed for iOS."
