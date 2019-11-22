import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Image, Platform } from 'react-native'
import BackgroundImage from './map.jpg'
import Marker from './marker.png'
import GoogleMapReact from 'google-map-react'

const markerWidth = 30
const markerHeight = 30
const stylesStatus = StyleSheet.create({
  wrapper: {
    backgroundColor: '#d30',
    padding: 16,
    borderRadius: 5,
    marginBottom: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
    height: 233
  },
  image: {
    width: '100%',
    height: '100%',
  },
  markerView: {
    display: 'flex',
    flexDirection: 'column',
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    marginLeft: -75,
    marginTop: -markerHeight,
    paddingLeft: 10,
    paddingRight: 10,
    transform: [
      { translateY: '-100%' },
    ],
  },
  markerTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
  },
  markerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  markerImage: {
    position: 'absolute',
    top: -markerHeight,
    left: -markerWidth / 2,
    width: markerWidth,
    height: markerHeight
  }
})

export default class Map extends Component {
  state = {
    apiKey: null,
    center: {
      lat: null,
      lng: null
    },
    markerTitle: null,
    markerSubtitle: null,
    markerImage: null,
    mapStyle: null,
    customStyle: null,
    errorMessage: null,
    zoom: 11,
    mapConfigLoaded: false
  }
  isBrowser = true

  componentDidMount() {
    if (!this.props.editor) {
      this.isBrowser = typeof document !== 'undefined'
      this.fetchMapConfiguration()
    }
  }

  fetchMapConfiguration() {
    const { apiKey, markers: {lat, lng, markerTitle, markerImage, markerSubtitle}, style: { mapStyle, customStyle } } = this.props
    if (!apiKey) {
      return this.setState({
        errorMessage: "API Key is not set.",
        mapConfigLoaded: true
      })
    }
    if (!lat || !lng) {
      return this.setState({
        errorMessage: "Latitude and Longitude are not set.",
        mapConfigLoaded: true
      })
    }
    console.log(this.props)
    this.setState({
      apiKey,
      center: {lat, lng},
      markerTitle,
      markerSubtitle,
      mapStyle,
      customStyle,
      errorMessage: null,
      mapConfigLoaded: true
    })
  }

  getMapOptions(maps) {
    return {
        // streetViewControl: false,
        // scaleControl: true,
        fullscreenControl: false,
        // styles: [{
        //     featureType: "poi.business",
        //     elementType: "labels",
        //     stylers: [{
        //         visibility: "off"
        //     }]
        // }],
        // gestureHandling: "greedy",
        // disableDoubleClickZoom: true,
        // minZoom: 1,
        // maxZoom: 18,

        // mapTypeControl: true,
        mapTypeId: maps.MapTypeId.ROADMAP,
        // mapTypeControlOptions: {
        //     style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        //     position: maps.ControlPosition.BOTTOM_CENTER,
        //     mapTypeIds: [
        //         maps.MapTypeId.ROADMAP,
        //         maps.MapTypeId.SATELLITE,
        //         maps.MapTypeId.HYBRID,
        //         maps.MapTypeId.TERRAIN
        //     ]
        // },

        // zoomControl: true,
        // clickableIcons: false
    };
  }

  render() {
    let { editor } = this.props
    let { apiKey, markerTitle, markerSubtitle, mapStyle, customStyle, errorMessage, mapConfigLoaded } = this.state

    if (editor) {
      return (
        <View style={styles.wrapper}>
          <Image
            resizeMode="cover"
            source={BackgroundImage}
            style={styles.image}
          />
        </View>
      )
    }

    if (!mapConfigLoaded) {
      return <ActivityIndicator />
    }

    if (errorMessage) {
      return <StatusMessage message={errorMessage} />
    }

    let options = {
      fullscreenControl: false,
      mapTypeId: mapStyle,
    }
    if (customStyle) {
      options.styles = JSON.parse(customStyle)
    }

    return (
      <View style={styles.wrapper}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey }}
          defaultCenter={this.state.center}
          defaultZoom={this.state.zoom}
          options={options}
        >
          <Image
            resizeMode="contain"
            source={{uri: "https://s3.amazonaws.com/proton-uploads-production/499cb11629f511ada5c83ac84b4f026ee345a9bd3b17bdf6a7b06f3198052c3b.png"}}
            lat={this.state.center.lat}
            lng={this.state.center.lng}
            style={styles.markerImage}
          />
          <View
            lat={this.state.center.lat}
            lng={this.state.center.lng}
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
        </GoogleMapReact>
      </View>
    )
  }
}

export class StatusMessage extends Component {
  render() {
    let { message } = this.props

    return (
      <View style={stylesStatus.wrapper}>
        <Text style={stylesStatus.text}>{message}</Text>
      </View>
    )
  }
}
