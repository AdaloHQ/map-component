import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Image } from 'react-native'
import { getMap, addNativeEvent } from './map'
import { markerWidth, markerHeight, geocodeURL } from './config'
import axios from 'axios'
import hybrid from './assets/hybrid.jpg'
import roadmap from './assets/roadmap.jpg'
import satellite from './assets/satellite.jpg'
import terrain from './assets/terrain.jpg'

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
  container: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: markerWidth,
    height: markerHeight,
  },
})

const placeholderImages = {
  hybrid,
  roadmap,
  satellite,
  terrain,
}

export default class Map extends Component {
  state = {
    apiKey: null,
    markerAddress: null,
    addresses: null,
    markerImage: null,
    onPress: null,
    mapStyle: null,
    customStyle: null,
    currentLocation: false,
    errorMessage: null,
    zoom: 13,
    markerType: null,
    mapConfigLoaded: false,
    loaded: false,
  }
  isBrowser = true

  componentDidMount() {
    if (!this.props.editor) {
      this.isBrowser = typeof document !== 'undefined'
      this.fetchMapConfiguration()
    }
  }

  fetchMapConfiguration() {
    const {
      apiKey,
      markerType,
      markers: { markerAddress, markerImage, onPress },
      style: { mapStyle, customStyle, currentLocation },
    } = this.props

    if (!apiKey) {
      return this.setState({
        errorMessage: 'API Key is not set.....',
        mapConfigLoaded: true,
      })
    }

    addNativeEvent(apiKey)

    this.setState({
      apiKey,
      markerType,
      markerAddress,
      onPress,
      mapStyle,
      customStyle,
      currentLocation,
      errorMessage: null,
      mapConfigLoaded: true,
    })
  }

  getMapOptions(maps) {
    return {
      fullscreenControl: false,
      mapTypeId: maps.MapTypeId.ROADMAP,
    }
  }

  loadAddresses = async () => {
    let { loaded } = this.state

    let {
      apiKey,
      markerType,
      markerCollection,
      markers: { markerAddress },
    } = this.props

    let addr =
      markerType === 'simple'
        ? markerAddress
          ? [markerAddress]
          : []
        : markerCollection
        ? markerCollection.map((m) => {
            return m.markers_list.markerAddress
          })
        : []

    if (addr.length > 0 && !loaded) {
      let result = await axios.post(geocodeURL, {
        addresses: addr,
        key: apiKey,
      })

      this.setState({
        addresses: result.data,
      })

      if (
        markerType === 'simple' ||
        (markerType !== 'simple' && markerCollection)
      ) {
        this.setState({
          loaded: true,
        })
      }
    }
  }

  render() {
    let {
      apiKey,
      markerType,
      editor,
      markerCollection,
      markers: { onPress, markerImage, markerSource },
    } = this.props

    let {
      addresses,
      mapStyle,
      customStyle,
      currentLocation,
      errorMessage,
      mapConfigLoaded,
      loaded,
    } = this.state

    if (editor) {
      return (
        <View style={{ width: '100%', height: '100%' }}>
          <img
            src={placeholderImages[this.props.style.mapStyle]}
            style={{ objectFit: 'cover', width: 'auto', height: '100%' }}
          />
        </View>
      )
    }

    this.loadAddresses()

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
      <View style={{ width: '100%', height: '100%' }}>
        {loaded &&
          getMap(
            apiKey,
            this.state.zoom,
            options,
            styles,
            markerType,
            addresses,
            currentLocation,
            onPress,
            markerCollection,
            markerImage,
            markerSource
          )}
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
