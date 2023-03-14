#!/bin/bash
set -e
set -x

project_path=$(pwd)
name=$PROJECT_NAME

alias react-native="$(pwd)/node_modules/.bin/react-native"

# Dependencies manually added for now

#yarn add react-native-maps -E #@^0.26.1
yarn add react-native-maps@0.26.1
# react-native link react-native-maps

echo "Patching iOS Stripe components..."
$project_path/node_modules/@protonapp/map-component/scripts/ios_patch_stripe.sh $project_path
echo "... patched."

# Podfile
cd ios

# cat <<EOF > /tmp/adalo-maps-podfile
#
# EOF

#sed -i.bak "$(cat /tmp/adalo-maps-podfile)" Podfile
sed -i.bak '/use_native_modules/a\
  pod "react-native-maps", path: "../node_modules/react-native-maps"\
  pod "react-native-google-maps", path: "../node_modules/react-native-maps"  # Uncomment this line if you want to support GoogleMaps on iOS\
  pod "GoogleMaps"  # Uncomment this line if you want to support GoogleMaps on iOS\
  pod "Google-Maps-iOS-Utils" # Uncomment this line if you want to support GoogleMaps on iOS\
' Podfile

# sed -i.bak '/usr_native_modules/a\
#   pod "react-native-maps", path: "../node_modules/react-native-maps\"
# ' Podfile

cat <<EOF >> Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'react-native-google-maps'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ENABLE_MODULES'] = 'No'
      end
    end
    if target.name == 'Google-Maps-iOS-Utils'
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '8.0'
      end
    end
    if target.name == "React"
      target.remove_from_project
    end
  end
end
EOF

pod install

# Enabling Google Maps on iOS

sed -i.bak '/UserNotifications.h/a\
#import <GoogleMaps/GoogleMaps.h>\
#import <React/RCTLog.h>\
\
@implementation KeyModule\
\
RCT_EXPORT_MODULE();\
\
RCT_EXPORT_METHOD(addEvent:(NSString *)apiKey)\
{\
  [[NSNotificationCenter defaultCenter]postNotificationName:@"APIKeyNotification"\
                                                     object:apiKey];\
}\
\
@end\
' ./${name}/AppDelegate.m

sed -i.bak '/didFinishLaunchingWithOptions/i\
- (void) receiveNotification:(NSNotification *) notification\
  {\
    if ([[notification name] isEqualToString:@"APIKeyNotification"]) {\
      NSString *apiKey = notification.object;\
      NSLog(@"Here is Google map API Key - %@", apiKey);\
      [GMSServices provideAPIKey:apiKey];\
    }\
  }\
' ./${name}/AppDelegate.m

sed -i.bak '/initWithDelegate/i\
  [[NSNotificationCenter defaultCenter] addObserver:self\
                                           selector:@selector(receiveNotification:)\
                                               name:@"APIKeyNotification"\
                                             object:nil];\
' ./${name}/AppDelegate.m

sed -i.bak '/@end/a\
#import <React/RCTBridgeModule.h>\
\
@interface KeyModule : NSObject <RCTBridgeModule>\
@end\
' ./${name}/AppDelegate.h

# Re-link react-native-maps

cd ..
# react-native unlink react-native-maps
# react-native link react-native-maps

echo "react-native-maps configuration completed for iOS."
