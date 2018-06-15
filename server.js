const Influx = require('influx')
const fetch = require('node-fetch')
const halfAnHour = 1800000
const APPID = process.env.APPID

const db = new Influx.InfluxDB({
  host: 'localhost',
  database: 'weather_db'
});

fetchAndStoreWeatherData()
setInterval(fetchAndStoreWeatherData, halfAnHour)

async function fetchAndStoreWeatherData() {
  try {
    const res = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=60.28&lon=25.02&APPID=${APPID}`)
    if(!res.status) {
      throw new Error('Error while retrieving weather data: ' + res.statusText)
    }
    const data = await res.json()
    await record(data)
    console.log(data)
  } catch(err) {
    console.log(err)
  }
}

async function record(data) {
  console.log('writing to database', data)
  return db.writePoints([
    {
      measurement: 'weather_data',
      tags: {
        id: data.id,
        location: data.name
      },
      fields: {
        humidity: data.main.humidity,
        temperature: data.main.temp,
        pressure: data.main.pressure
      }
    }
  ])
}