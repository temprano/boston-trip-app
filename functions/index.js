/**
 * Firebase Cloud Functions Index
 * Exports all cloud functions for the Boston Trip App
 */

const getDirections = require('./getDirections')
const getPlaces = require('./getPlaces')
const geocodeAddress = require('./geocodeAddress')

module.exports = {
  ...getDirections,
  ...getPlaces,
  ...geocodeAddress,
}
