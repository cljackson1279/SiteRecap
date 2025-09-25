// Open-Meteo weather integration
export async function getCurrentWeather(lat, lon) {
  if (!lat || !lon) {
    return null
  }
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&timezone=auto`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.current_weather) {
      const temp = Math.round(data.current_weather.temperature)
      const code = data.current_weather.weathercode
      
      // Simple weather code to description mapping
      const weatherMap = {
        0: 'Clear',
        1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy',
        51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
        61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
        71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
        80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
        95: 'Thunderstorms', 96: 'Thunderstorms', 99: 'Heavy Thunderstorms'
      }
      
      const description = weatherMap[code] || 'Partly Cloudy'
      
      return {
        temperature: temp,
        description,
        code
      }
    }
    
    return null
  } catch (error) {
    console.error('Weather fetch failed:', error)
    return null
  }
}

// Open-Meteo geocoding
export async function geocodeLocation(city, state, postalCode) {
  try {
    const location = [city, state, postalCode].filter(Boolean).join(', ')
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        lat: result.latitude,
        lon: result.longitude,
        city: result.name,
        state: result.admin1 || state,
        country: result.country
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding failed:', error)
    return null
  }
}