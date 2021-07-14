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

  let filteredMarkers = []

  if (isSimple) {
    filteredMarkers.push({
      lat: addresses.length > 0 ? addresses[0].location.lat : null,
      lng: addresses.length > 0 ? addresses[0].location.lng : null,
      image:
        markerImage && markerSource === 'custom' ? markerImage : defaultMarker,
      onPress,
    })
  } else {
    filteredMarkers = markerCollection.map((marker, index) => {
      return {
        lat:
          addresses.length > 0 && addresses[index]
            ? addresses[index].location.lat
            : null,
        lng:
          addresses.length > 0 && addresses[index]
            ? addresses[index].location.lng
            : null,
        image:
          marker.markers_list.listMarkerImage &&
          marker.markers_list.markerSource === 'custom'
            ? marker.markers_list.listMarkerImage
            : defaultMarker,
        onPress: marker.markers_list.onPress,
      }
    })
  }

  filteredMarkers = filteredMarkers.filter((marker) => marker.lat)

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
        if (!isSimple && filteredMarkers.length > 1) {
          const bounds = new google.maps.LatLngBounds()
          for (let i = 0; i < filteredMarkers.length; i++) {
            const marker = filteredMarkers[i]
            console.log('Marker', marker)
            const newPoint = new google.maps.LatLng(marker.lat, marker.lng)
            bounds.extend(newPoint)
          }
          map.fitBounds(bounds)
        }
      }}
    >
      {filteredMarkers.map((marker) => (
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
