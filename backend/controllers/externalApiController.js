const axios = require('axios');

const externalApiController = {
  // 1. Fetch live APMC rates from open data portal (mocked endpoint for demo)
  async getMandiRates(req, res) {
    try {
      // In production, this calls data.gov.in or similar APMC API
      const mockRates = [
        { id: 'm1', crop: 'Tomato (Hybrid)', mandi: 'Kolar APMC', state: 'Karnataka', price: '₹2,400', change: '+5.2%', up: true, emoji: '🍅' },
        { id: 'm2', crop: 'Paddy (Sona Masuri)', mandi: 'Mandya APMC', state: 'Karnataka', price: '₹2,450', change: '+3.2%', up: true, emoji: '🌾' },
        { id: 'm3', crop: 'Cotton (Medium Staple)', mandi: 'Dharwad APMC', state: 'Karnataka', price: '₹7,150', change: '+4.1%', up: true, emoji: '☁️' },
      ];
      res.json({ success: true, data: mockRates });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch Mandi rates' });
    }
  },

  // 2. Fetch live weather and rain probability from Open-Meteo API
  async getWeatherAdvisory(req, res) {
    try {
      const { lat = 12.9716, lon = 77.5946 } = req.query; // Default to Bangalore coordinates

      // Call free Open-Meteo API
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&hourly=precipitation_probability,weather_code&timezone=auto`
      );

      const data = response.data;
      
      const weatherData = {
        location: 'Bengaluru / Local Region',
        temp: `${data.current.temperature_2m}°C`,
        humidity: `${data.current.relative_humidity_2m}%`,
        rainProbability: `${data.current.precipitation_probability || data.hourly.precipitation_probability[0]}%`,
        condition: data.current.weather_code > 50 ? 'Rain Expected' : 'Clear / Cloudy',
      };

      res.json({ success: true, data: weatherData });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch weather data' });
    }
  }
};

module.exports = externalApiController;