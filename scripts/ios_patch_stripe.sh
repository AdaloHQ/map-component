#!/usr/bin/env bash
set -e

if [[ $# -ne 1 ]]; then
  echo "Usage: ./ios_patch_stripe.sh PROJECT_PATH"
  exit 1
fi

project_path=$1

if [ -d "$project_path/node_modules/@stripe/stripe-react-native" ]; then
  pushd $project_path/node_modules/@stripe/stripe-react-native

  sed -i.bak "s/ios: '12.0'/ios: '13.0'/g" stripe-react-native.podspec
  sed -i.bak "s/'Stripe', '~> 22.0.0'/'Stripe', '~> 22.5'/g" stripe-react-native.podspec
  sed -i.bak "s/'StripeConnections', '~> 22.0.0'/'StripeFinancialConnections', '~> 22.5'/g" stripe-react-native.podspec

  popd
else
  echo "Nothing to patch. Exiting."
fi
