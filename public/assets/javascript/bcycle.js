/* global $, L, bcycleLayer, moment */

const GBFS_REFRESH_TTL = 20 * 1000
const GBFS_BASE_URL = 'https://gbfs.bcycle.com/bcycle_nashville'

var BCycleIcon = L.Icon.extend({
  options: {
    iconUrl: 'assets/images/bcycle.svg',
    iconSize: [32, 32],
    shadowUrl: null,
  }
})

let stationInfo = {}
let gbfsMarkers = {}

// Main Loop
$.get(GBFS_BASE_URL + '/station_information.json', function (station_information) {
  $(station_information.data.stations).each(function(i) {
    var station = station_information.data.stations[i]
    stationInfo[station.station_id] = station
    gbfsMarkers[station.station_id] = L.marker([station.lat, station.lon], {icon: new BCycleIcon()}).addTo(bcycleLayer)
  })
  updateBCycleMarkers()
})

// Format BCycle Tooltip
const formatBCyclePopup = function (station) {
  return L.Util.template(
    $('#bcycle_popup_template').html(),
    {
      station_name: station.name || 'Not Set',
      station_address: station.address || 'Not Set',
      lat: station.lat || null,
      lon: station.lon || null,
      is_renting: station.status.is_renting == '1' ? 'Yes' : 'No',
      is_returning: station.status.is_returning == '1' ? 'Yes' : 'No',
      num_bikes_available: station.status.num_bikes_available || 'Unknown',
      num_docks_available: station.status.num_docks_available || 'Unknown',
      last_reported: moment.unix(station.status.last_reported).format('h:mm a')
    }
  )
}

// Format BCycle Tooltip
const formatBCycleTooltip = function (station) {
  return L.Util.template(
    $('#bcycle_tooltip_template').html(),
    {
      station_name: station.name || 'Not Set',
      num_bikes_available: station.status.num_bikes_available || 'Unknown',
      num_docks_available: station.status.num_docks_available || 'Unknown'
    }
  )
}

// Update BCycle Markers
const updateBCycleMarkers = function () {
  $.get(GBFS_BASE_URL + '/station_status.json', function (station_status) {
    $(station_status.data.stations).each(function (i) {
      var status = station_status.data.stations[i]
      stationInfo[status.station_id]['status'] = status
      gbfsMarkers[status.station_id].bindPopup(formatBCyclePopup(stationInfo[status.station_id]))
      gbfsMarkers[status.station_id].bindTooltip(formatBCycleTooltip(stationInfo[status.station_id]))
    })
  })
  console.log('refresh called')
  setTimeout(updateBCycleMarkers, GBFS_REFRESH_TTL)
}
