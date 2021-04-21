import GoogleMapReact from 'google-map-react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { markerWidth, markerHeight } from './config'
import defaultMarker from './assets/marker.png'

const additionalStyles = StyleSheet.create({
  markerImage: {
    position: 'absolute',
    top: -markerHeight,
    left: -markerWidth / 2,
  },
})

export const addNativeEvent = (apiKey) => {
  // Do nothing in case of web
}

export const getMap = (
  apiKey,
  zoom,
  options,
  styles,
  markerType,
  addresses,
  currentLocation,
  onPress,
  markerCollection,
  markerImage,
  markerSource
) => {
  const isSimple = markerType === 'simple'
  const defaultCenter = {
    lat: 40.7831,
    lng: -73.9712,
  }
  const viewCenter =
    addresses.length > 0
      ? { lat: addresses[0].location.lat, lng: addresses[0].location.lng }
      : defaultCenter

  return (
    <GoogleMapReact
      bootstrapURLKeys={{ key: apiKey }}
      defaultCenter={viewCenter}
      defaultZoom={zoom}
      options={options}
      onGoogleApiLoaded={({ map, maps }) => {
        if (!isSimple && addresses.length > 1) {
          const bounds = new google.maps.LatLngBounds()
          for (let i = 0; i < addresses.length; i++) {
            const marker = addresses[i]
            const newPoint = new google.maps.LatLng(
              marker.location.lat,
              marker.location.lng
            )
            bounds.extend(newPoint)
          }
          map.fitBounds(bounds)
        }
      }}
    >
      {isSimple ? (
        <View
          lat={addresses.length > 0 ? addresses[0].location.lat : null}
          lng={addresses.length > 0 ? addresses[0].location.lng : null}
          onClick={onPress}
        >
          <Image
            resizeMode="contain"
            source={
              markerImage && markerSource === 'custom'
                ? markerImage
                : defaultMarker
            }
            style={[styles.markerImage, additionalStyles.markerImage]}
          />
        </View>
      ) : (
        markerCollection &&
        markerCollection.map((marker, index) => (
          <View
            lat={addresses.length > 0 ? addresses[index].location.lat : null}
            lng={addresses.length > 0 ? addresses[index].location.lng : null}
            key={`marker ${index}`}
            onClick={marker.markers_list.onPress}
          >
            <Image
              resizeMode="contain"
              source={
                marker.markers_list.listMarkerImage &&
                marker.markers_list.markerSource === 'custom'
                  ? marker.markers_list.listMarkerImage
                  : defaultMarker
              }
              style={[styles.markerImage, additionalStyles.markerImage]}
            />
          </View>
        ))
      )}
    </GoogleMapReact>
  )
}
