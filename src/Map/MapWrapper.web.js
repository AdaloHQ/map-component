import { useMemo } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import GoogleMapReact from 'google-maps-react-markers'
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
  const markers = useMemo(() => {
    if (!filteredMarkers) {
      return []
    }

    return filteredMarkers.map(marker => (
      <View lat={marker.lat} lng={marker.lng} onClick={marker.onPress} key={marker.key}>
        <Image
          resizeMode="contain"
          source={marker.image}
          style={[styles.markerImage, additionalStyles.markerImage]}
        />
      </View>
    ))
  }, [filteredMarkers])

  const mapOptions = useMemo(() => {
    return {
      ...options,
      // disable the ability to switch map type (e.g. map, satellite, hybrid etc.)
      mapTypeControl: false,
      // disable the ability to switch into Street View
      streetViewControl: false,
      // disables the ability to click on various landmarks, shops etc. that Google Maps shows
      clickableIcons: false,
    }
  }, [options])

  return (
    <GoogleMapReact
      apiKey={apiKey}
      defaultCenter={viewCenter}
      defaultZoom={defaultZoom}
      options={mapOptions}
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
      {markers}
    </GoogleMapReact>
  )
}

export default MapWrapper
