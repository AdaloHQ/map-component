import { useRef } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Dimensions, Platform, View } from 'react-native'
import { defaultZoom } from './config'
import { Image as SvgImage, Svg } from 'react-native-svg'

const { height, width } = Dimensions.get('window')

const getMarkerSize = (style) => {
  const originalWidth = style?.width || 40
  const originalHeight = style?.height || 40

  const size = Math.max(originalWidth, originalHeight)

  return { width: size, height: size }
}

const pickNearestImageByStyles = (images, style) => {
  if (!images) return null

  if (!Array.isArray(images)) return images

  const targetWidth = style.width || style.minWidth || 24
  const targetHeight = style.height || style.minHeight || 24

  const nearest = images.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.width - targetWidth) + Math.abs(prev.height - targetHeight)
    const currDiff = Math.abs(curr.width - targetWidth) + Math.abs(curr.height - targetHeight)
    return currDiff < prevDiff ? curr : prev
  })

  return nearest
}

const MapWrapper = ({
  options,
  styles,
  currentLocation,
  filteredMarkers = [],
  viewCenter,
}) => {
  const mapType =
    options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId

  const LATITUDE_DELTA = Math.exp(Math.log(360) - (defaultZoom + 1) * Math.LN2)
  const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

  const mapRef = useRef(null)
  const markerSize = getMarkerSize(styles.markerImage)

  return (
    <MapView
      style={styles.container}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: viewCenter.lat,
        longitude: viewCenter.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }}
      showsUserLocation={currentLocation}
      mapType={mapType}
      customMapStyle={options.styles || []}
      ref={mapRef}
      onMapReady={() => {
        if (!mapRef.current) {
          return
        }

        if (filteredMarkers.length > 1) {
          if (Platform.OS === 'android') {
            // This is a hack inspired by this issue:
            // https://github.com/react-native-maps/react-native-maps/issues/4531
            // It may be that future versions of react-native-maps will fix this issue
            setTimeout(() => {
              mapRef.current.fitToElements(true)
            }, 50)

            return
          }

          mapRef.current.fitToElements(true)
        }
      }}
    >
      {filteredMarkers &&
        filteredMarkers.map(marker => (
          <Marker
            coordinate={{
              latitude: marker && marker.lat,
              longitude: marker && marker.lng,
            }}
            style={{ alignItems: 'center', justifyContent: 'center' }}
            key={marker.key}
            onPress={marker.onPress}
          >
            <View style={{ ...styles.markerImage, ...markerSize }}>
              <Svg width="100%" height="100%" viewBox="0 0 24 24">
                <SvgImage
                  x={0}
                  y={0}
                  width="100%"
                  height="100%"
                  href={pickNearestImageByStyles(marker.image, styles.markerImage)}
                  preserveAspectRatio="xMidYMid meet"
                />
              </Svg>
            </View>
          </Marker>
        ))}
    </MapView>
  )
}

export default MapWrapper
