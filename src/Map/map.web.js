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

export const getMap = ({
  apiKey,
  zoom,
  options,
  styles,
  currentLocation,
  filteredMarkers,
}) => {
  const defaultCenter = {
    lat: 40.7831,
    lng: -73.9712,
  }

  const viewCenter =
    filteredMarkers.length > 0
      ? { lat: filteredMarkers[0].lat, lng: filteredMarkers[0].lng }
      : defaultCenter

  return (
    <GoogleMapReact
      bootstrapURLKeys={{ key: apiKey }}
      defaultCenter={viewCenter}
      defaultZoom={zoom}
      options={options}
      onGoogleApiLoaded={({ map, maps }) => {
        if (filteredMarkers.length > 1) {
          const bounds = new google.maps.LatLngBounds()
          for (let i = 0; i < filteredMarkers.length; i++) {
            const marker = filteredMarkers[i]
            const newPoint = new google.maps.LatLng(marker.lat, marker.lng)
            bounds.extend(newPoint)
          }
          map.fitBounds(bounds)
        }
      }}
    >
      {filteredMarkers &&
        filteredMarkers.map((marker) => (
          <View lat={marker.lat} lng={marker.lng} onClick={marker.onPress}>
            <Image
              resizeMode="contain"
              source={marker.image}
              style={[styles.markerImage, additionalStyles.markerImage]}
            />
          </View>
        ))}
    </GoogleMapReact>
  )
}
