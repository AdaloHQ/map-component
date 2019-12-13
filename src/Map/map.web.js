import GoogleMapReact from 'google-map-react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { markerWidth, markerHeight } from './config'
import defaultMarker from './marker.png'

const additionalStyles = StyleSheet.create({
    markerView: {
        marginLeft: -75,
        marginTop: -markerHeight,
        transform: [
          { translateY: '-100%' },
        ],
    },
    markerImage: {
        position: 'absolute',
        top: -markerHeight,
        left: -markerWidth / 2,
    }
})

export const getMap = (apiKey, zoom, options, styles, markerType, center, markerTitle, markerSubtitle, onPress, markerCollection) => {
    const isSimple = markerType === 'simple'
    const viewCenter = isSimple? center : {
        lat: 41.850033,
        lng: -87.6500523
    }
    return (
        <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={viewCenter}
            defaultZoom={zoom}
            options={options}
        >
            {
                isSimple ?
                <View
                    lat={center.lat}
                    lng={center.lng}
                    onClick={onPress}
                >
                    <Image
                        resizeMode="contain"
                        source={{uri: "https://s3.amazonaws.com/proton-uploads-production/499cb11629f511ada5c83ac84b4f026ee345a9bd3b17bdf6a7b06f3198052c3b.png"}}
                        style={[styles.markerImage, additionalStyles.markerImage]}
                    />
                    <View
                        style={[styles.markerView, additionalStyles.markerView]}
                    >
                        <Text
                            style={styles.markerTitle}
                        >
                            {markerTitle}
                        </Text>
                        <Text
                            style={styles.markerSubtitle}
                        >
                            {markerSubtitle}
                        </Text>
                    </View>
                </View> :
                markerCollection && markerCollection.map((marker, index) => (
                    <View
                        lat={marker.markers_list.lat}
                        lng={marker.markers_list.lng}
                        key={`marker ${index}`}
                        onClick={marker.markers_list.onPress}
                    >
                        <Image
                            resizeMode="contain"
                            source={marker.markers_list.markerImage? {uri: marker.markers_list.markerImage.uri} : defaultMarker}
                            style={[styles.markerImage, additionalStyles.markerImage]}
                        />
                        <View
                            style={[styles.markerView, additionalStyles.markerView]}
                        >
                            <Text
                                style={styles.markerTitle}
                            >
                                {marker.markers_list.markerTitle}
                            </Text>
                            <Text
                                style={styles.markerSubtitle}
                            >
                                {marker.markers_list.markerSubtitle}
                            </Text>
                        </View>
                    </View>
                ))
            }
        </GoogleMapReact>
    )
}
