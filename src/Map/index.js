import React, { Component } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native'
import MapWrapper from './MapWrapper'
import { markerWidth, markerHeight, geocodeURL } from './config'
import axios from 'axios'
import hybrid from './assets/hybrid.jpg'
import roadmap from './assets/roadmap.jpg'
import satellite from './assets/satellite.jpg'
import terrain from './assets/terrain.jpg'
import defaultMarkerImage from './assets/marker.png'
import userLocationImage from './assets/user.png'

// Matches a comma-separated latitude/longitude coordinate pair: "47.1231231, 179.99999999"
// https://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates
const COORD_REG_EX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/

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

const defaultCenter = {
  lat: 40.7831,
  lng: -73.9712,
}

const StatusMessage = ({ message }) => (
  <View style={stylesStatus.wrapper}>
    <Text style={stylesStatus.text}>{message}</Text>
  </View>
)
export default class Map extends Component {
  state = {
    dataAddresses: [],
    isDataAddressesLoaded: false,
    isDataAddressesLoading: false,
    userLocation: [],
    isUserLocationLoaded: false,
    errorMessage: null,
    currentPosition: null,
    coarseAndroidPosition: null,
  }

  componentDidMount() {
    const {
      editor,
      apiKey,
      style: { currentLocation },
      locationPrecision = 'coarse',
    } = this.props

    if (editor) {
      return
    }

    if (!apiKey) {
      return this.setState({
        errorMessage: 'API Key is not set.....',
      })
    }

    if (!currentLocation) {
      return
    }

    if (Platform.OS === 'web') {
      navigator.geolocation.getCurrentPosition(currentPosition => {
        this.setState({
          currentPosition
        })
      })
      return
    }

    if (Platform.OS === 'android' && locationPrecision === 'coarse') {
      this.fetchApproximateAndroidPosition()
    }

  }

  async fetchApproximateAndroidPosition() {
    try {
      const { PermissionsAndroid: PA } = require('react-native')
      const result = await PA.request(PA.PERMISSIONS.ACCESS_COARSE_LOCATION)
      if (result !== 'granted') {
        console.warn('[MapComponent] coarse permission not granted:', result)
        return
      }

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        console.warn('[MapComponent] navigator.geolocation not available in this environment')
        return
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          console.warn('[MapComponent] got approximate position:', position?.coords)
          this.setState({ coarseAndroidPosition: position })
        },
        err => {
          console.warn('[MapComponent] geolocation error:', err?.code, err?.message)
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
      )
    } catch (e) {
      console.warn('[MapComponent] fetchApproximateAndroidPosition failed:', e?.message)
    }
  }

  componentDidUpdate() {
    const { editor, apiKey } = this.props
    const { isDataAddressesLoaded, isDataAddressesLoading, isUserLocationLoaded } = this.state

    if (editor || isDataAddressesLoading || !apiKey) {
      return
    }

    /***** ALL PLATFORMS - Manipulates map based on incoming data - ALL PLATFORMS *****/
    if (isDataAddressesLoaded && this.shouldUpdateDataAddresses()) {
      // "un-render" the map so that it can be re-rendered with new data
      this.setState({ isDataAddressesLoaded: false })
    }

    // generate an array of geocoded addresses
    if (!isDataAddressesLoaded) {
      this.loadDataAddresses()
    }
    /**************************************************/

    /***** WEB ONLY - Manipulates map based on device location - WEB ONLY *****/
    if (isUserLocationLoaded && this.shouldUpdateUserAddress()) {
      // "un-render" the map so that it can be re-rendered with the device location
      this.setState({ isUserLocationLoaded: false })
    }

    // generate a single-object array with the device location data
    if (!isUserLocationLoaded) {
      this.loadUserAddress()
    }
    /**************************************************/
  }

  /**
   * WEB ONLY
   * Tells the component whether or not to reload the map based on if the browser's
   * current position is in the final array of addresses that are given to the map
   * @returns {boolean}
   */
  shouldUpdateUserAddress() {
    const { currentPosition, userLocation } = this.state

    if (currentPosition) {
      return !userLocation.length
    }

    return false
  }

  /**
   * ALL PLATFORMS
   * Tells the component whether or not to reload the map based on if the data
   * given to it matches the final array of addresses that are given to the map
   * @returns {boolean}
   */
  shouldUpdateDataAddresses() {
    const { markerType, markerCollection, markers: { markerAddress } } = this.props
    const { dataAddresses } = this.state

    if (markerType === 'simple') {
      return dataAddresses.length ? markerAddress !== dataAddresses[0].name : markerAddress
    }

    return markerCollection && markerCollection.length !== dataAddresses.length
  }

  /**
   * WEB ONLY
   * Populates the user location array with an object the map needs to render the user's current location
   */
  async loadUserAddress() {
    const { currentPosition } = this.state

    const userLocation = []

    if (currentPosition) {
      userLocation.push({
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude,
        image: userLocationImage,
        key: 'user-location',
      })
    }

    this.setState({
      userLocation,
      isUserLocationLoaded: true,
    })
  }

  /**
   * ALL PLATFORMS
   * Geocodes location data
   */
  async loadDataAddresses() {
    const {
      apiKey,
      markerType,
      markerCollection,
      markers: { markerAddress },
    } = this.props
    let locations = []

    if (markerType === 'simple') {
      if (markerAddress) {
        locations = [markerAddress]
      }
    } else {
      if (markerCollection) {
        locations = markerCollection.map(m => m.markers_list.markerAddress)
      }
    }

    // if there are no locations there is nothing to geocode
    if (!locations.length) {
      this.setState({
        dataAddresses: [],
        isDataAddressesLoaded: true,
      })

      return
    }

    // prevents unnecessary state updates in didComponentUpdate
    // while addresses are being geocoded
    this.setState({
      isDataAddressesLoading: true
    })

    const coordinates = []
    const addresses = []

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i]

      if (COORD_REG_EX.test(location.replace(/\s/g, ''))) {
        const [lat, lng] = location.split(',')

        // this matches the shape of the geocoded coordinates below
        coordinates.push({
          name: location,
          location: {
            lat: parseFloat(lat.trim(), 10),
            lng: parseFloat(lng.trim(), 10),
          },
          index: i,
        })
      } else {
        addresses.push(location)
      }
    }

    const { data: geocodedLocations } = await axios.post(geocodeURL, {
      addresses,
      key: apiKey,
    })

    const geocodedCoordinates = geocodedLocations.map(location => ({
      name: location.name,
      location: location.address ? location.address.geometry.location : { lat: null, lng: null },
    }))

    // we need to preserve the original order of string addresses/coordinates
    // because getDataAddresses relies on indexes
    for (const coordinate of coordinates) {
      const { name, location, index } = coordinate

      geocodedCoordinates.splice(index, 0, { name, location })
    }

    this.setState({
      dataAddresses: geocodedCoordinates,
      isDataAddressesLoaded: true,
      isDataAddressesLoading: false,
    })
  }

  /**
   * ALL PLATFORMS
   * Returns an array of objects the map expects to be able to render markers
   * @returns {Object[]}
   */
  getDataAddresses = () => {
    const { dataAddresses } = this.state

    const {
      markerType,
      markerCollection,
      markers: { markerSource, markerImage, onPress },
    } = this.props

    let result = []

    if (!dataAddresses.length) {
      return result
    }

    if (markerType === 'simple') {
      const [simpleAddress] = dataAddresses
      const image = markerImage && markerSource === 'custom' ? markerImage : defaultMarkerImage

      result.push({
        lat: simpleAddress.location.lat,
        lng: simpleAddress.location.lng,
        image,
        onPress,
        key: 'single-address',
      })

    } else if (markerCollection) {
      result = markerCollection.map((marker, index) => ({
        lat: dataAddresses[index] ? dataAddresses[index].location.lat : null,
        lng: dataAddresses[index] ? dataAddresses[index].location.lng : null,
        image:
          marker.markers_list.listMarkerImage &&
          marker.markers_list.markerSource === 'custom'
            ? marker.markers_list.listMarkerImage
            : defaultMarkerImage,
        onPress: marker.markers_list.onPress,
        key: marker.id
      }))
    }

    return result.filter(marker => marker.lat && marker.lng)
  }

  render() {
    const {
      apiKey,
      editor,
      style: { mapStyle, customStyle, currentLocation },
      // 'none' | 'coarse' | 'fine' — Android tier; defaults to 'coarse' (no FINE
      // until the maker explicitly opts in via Publish Settings).
      locationPrecision = 'coarse',
    } = this.props
    const {
      errorMessage,
      isDataAddressesLoaded,
      isUserLocationLoaded,
      userLocation,
      coarseAndroidPosition,
    } = this.state

    if (editor) {
      return (
        <img
          src={placeholderImages[mapStyle]}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      )
    }

    if (errorMessage) {
      return <StatusMessage message={errorMessage} />
    }

    if (!isDataAddressesLoaded || !isUserLocationLoaded) {
      return <ActivityIndicator />
    }

    const filteredMarkers = [
      ...this.getDataAddresses(),
      ...userLocation,
    ]

    const options = {
      fullscreenControl: false,
      mapTypeId: mapStyle,
    }

    if (customStyle) {
      try {
        options.styles = JSON.parse(customStyle)
      }
      catch (e) {}
    }

    const viewCenter =
      filteredMarkers.length
        ? { lat: filteredMarkers[0].lat, lng: filteredMarkers[0].lng }
        : defaultCenter

    const approximateUserPosition =
      coarseAndroidPosition && coarseAndroidPosition.coords
        ? {
            latitude: coarseAndroidPosition.coords.latitude,
            longitude: coarseAndroidPosition.coords.longitude,
            accuracy: coarseAndroidPosition.coords.accuracy,
          }
        : null

    return (
      <View style={{ width: '100%', height: '100%' }}>
        <MapWrapper
          apiKey={apiKey}
          options={options}
          styles={styles}
          currentLocation={currentLocation}
          filteredMarkers={filteredMarkers}
          viewCenter={viewCenter}
          locationPrecision={locationPrecision}
          approximateUserPosition={approximateUserPosition}
        />
      </View>
    )
  }
}
