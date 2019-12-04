import MapView, { Marker,  PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, Image } from 'react-native'

export const getMap = (apiKey, center, zoom, options, styles, markerTitle, markerSubtitle) => {
    const mapType = options.mapTypeId === 'roadmap' ? 'standard' : options.mapTypeId
    console.log(options)
    return (
        <MapView
            style={styles.container}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: center.lat,
              longitude: center.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            mapType={mapType}
            customMapStyle={options.styles? options.styles: []}
            zoomEnabled={true}
        >
            <Marker
                coordinate={{
                    latitude: center.lat,
                    longitude: center.lng,
                }}
                style={{alignItems: 'center', justifyContent: 'center'}}
            >
                <View
                    style={styles.markerView}
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
                <Image
                    resizeMode="contain"
                    source={{uri: "https://s3.amazonaws.com/proton-uploads-production/499cb11629f511ada5c83ac84b4f026ee345a9bd3b17bdf6a7b06f3198052c3b.png"}}
                    style={styles.markerImage}
                />
            </Marker>
        </MapView>
    )
}
