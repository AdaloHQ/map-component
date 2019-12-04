import GoogleMapReact from 'google-map-react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { markerWidth, markerHeight } from './config'

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

export const getMap = (apiKey, center, zoom, options, styles, markerTitle, markerSubtitle) => {
    return (
        <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={center}
            defaultZoom={zoom}
            options={options}
        >
            <Image
              resizeMode="contain"
              source={{uri: "https://s3.amazonaws.com/proton-uploads-production/499cb11629f511ada5c83ac84b4f026ee345a9bd3b17bdf6a7b06f3198052c3b.png"}}
              lat={center.lat}
              lng={center.lng}
              style={[styles.markerImage, additionalStyles.markerImage]}
            />
            <View
              lat={center.lat}
              lng={center.lng}
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
        </GoogleMapReact>
    )
}
