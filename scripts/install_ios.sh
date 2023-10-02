#!/bin/bash
set -e
set -x

project_path=$(pwd)
name=$PROJECT_NAME

alias react-native="$(pwd)/node_modules/.bin/react-native"

# Dependencies manually added for now

yarn add react-native-maps@0.26.1

# Podfile
cd ios

sed -i.bak '/use_native_modules/a\
  pod "react-native-maps", path: "../node_modules/react-native-maps"\
  pod "react-native-google-maps", path: "../node_modules/react-native-maps"  # Uncomment this line if you want to support GoogleMaps on iOS\
  pod "GoogleMaps"  # Uncomment this line if you want to support GoogleMaps on iOS\
  pod "Google-Maps-iOS-Utils" # Uncomment this line if you want to support GoogleMaps on iOS\
' Podfile

if grep -q post_install Podfile; then
  echo "post_install already exists in Podfile"

  # add it after __apply_Xcode_12_5_M1_post_install_workaround(installer)
  sed -i.bak '/__apply_Xcode_12_5_M1_post_install_workaround(installer)/a\
  \
  installer.pods_project.targets.each do |target|\
    if target.name == "react-native-google-maps"\
      target.build_configurations.each do |config|\
        config.build_settings["CLANG_ENABLE_MODULES"] = "No"\
      end\
    end\
    if target.name == "Google-Maps-iOS-Utils"\
      target.build_configurations.each do |config|\
        config.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "12.4"\
      end\
    end\
    if target.name == "React"\
      target.remove_from_project\
    end\
  end\
  ' Podfile

else
  echo "post_install does not exist in Podfile"

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
fi

# Enabling Google Maps on iOS

{ 
  # OLD REACT NATIVE
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

} || {
  # NEW REACT NATIVE
  sed -i.bak '/@implementation AppDelegate/i\
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
  ' ./${name}/AppDelegate.mm


}

{
  # OLD REACT NATIVE
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

} || {
  # NEW REACT NATIVE
  sed -i.bak '/@implementation AppDelegate/a\
  - (void) receiveNotification:(NSNotification *) notification\
    {\
      if ([[notification name] isEqualToString:@"APIKeyNotification"]) {\
        NSString *apiKey = notification.object;\
        NSLog(@"Here is Google map API Key - %@", apiKey);\
        [GMSServices provideAPIKey:apiKey];\
      }\
    }\
  ' ./${name}/AppDelegate.mm
}

{
  # OLD REACT NATIVE
  sed -i.bak '/initWithDelegate/i\
    [[NSNotificationCenter defaultCenter] addObserver:self\
                                            selector:@selector(receiveNotification:)\
                                                name:@"APIKeyNotification"\
                                              object:nil];\
  ' ./${name}/AppDelegate.m

} || {
  # NEW REACT NATIVE  
  sed -i.bak '/return \[super application:application didFinishLaunchingWithOptions:launchOptions\];/i\
    [[NSNotificationCenter defaultCenter] addObserver:self\
                                            selector:@selector(receiveNotification:)\
                                                name:@"APIKeyNotification"\
                                              object:nil];\
  ' ./${name}/AppDelegate.mm

}

sed -i.bak '/@end/a\
\
#import <React/RCTBridgeModule.h>\
\
@interface KeyModule : NSObject <RCTBridgeModule>\
@end\
' ./${name}/AppDelegate.h

# Re-link react-native-maps

cd ..

echo "react-native-maps configuration completed for iOS."
