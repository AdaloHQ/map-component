import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Image } from 'react-native'
import BackgroundImage from './map.jpg'
import Marker from './marker.png'
import { getMap } from './map'
import { markerWidth, markerHeight } from './config'

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
  container: {
    width: '100%',
    height: '100%'
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
    paddingLeft: 10,
    paddingRight: 10,
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
    zoom: 1,
    markerType: null,
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
    const { apiKey, markerType, markers: {lat, lng, markerTitle, markerImage, markerSubtitle}, style: { mapStyle, customStyle } } = this.props
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
    this.setState({
      apiKey,
      markerType,
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
    let { editor, markerCollection } = this.props
    let { apiKey, markerType, markerTitle, markerSubtitle, mapStyle, customStyle, errorMessage, mapConfigLoaded } = this.state

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
        {
          getMap(apiKey,
            this.state.zoom,
            options,
            styles,
            markerType,
            this.state.center,
            markerTitle,
            markerSubtitle,
            markerCollection
          )
        }
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
