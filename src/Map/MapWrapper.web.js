import GoogleMapReact from 'google-map-react'
import { View, Image, StyleSheet } from 'react-native'
import { markerWidth, markerHeight, defaultZoom } from './config'

const additionalStyles = StyleSheet.create({
  markerImage: {
    position: 'absolute',
    top: -markerHeight,
    left: -markerWidth / 2,
  },
})

const MapWrapper = ({
  apiKey,
  options,
  styles,
  filteredMarkers = [],
  viewCenter,
}) => {
  return (
    <GoogleMapReact
      bootstrapURLKeys={{ key: apiKey }}
      defaultCenter={viewCenter}
      defaultZoom={defaultZoom}
      options={options}
      onGoogleApiLoaded={({ map }) => {
        if (filteredMarkers.length > 1) {
          const bounds = new google.maps.LatLngBounds()

          for (const marker of filteredMarkers) {
            const { lat, lng } = marker
            const newPoint = new google.maps.LatLng(lat, lng)
            bounds.extend(newPoint)
          }

          map.fitBounds(bounds)
        }
      }}
    >
      {filteredMarkers &&
        filteredMarkers.map(marker => (
          <View lat={marker.lat} lng={marker.lng} onClick={marker.onPress} key={marker.key}>
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

export default MapWrapper
