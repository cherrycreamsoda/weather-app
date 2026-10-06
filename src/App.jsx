import { useState } from 'react';

import './App.css';


function App() {

  const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;

//  Initialise Input area value
const [inputValue , setInputValue] = useState("")

//  Initialise and declare "WeatherState"
    const [ weatherState , setWeatherState ] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")


//  Fetch Weather object of a country using Openweathermap Weather API and set it's state of 
  async function fetchWeatherObject(country){
    if (!apiKey) {
      throw new Error("Weather service is not configured.");
    }
    const coordinates = await setCoordinatesOf(country)
    const res =  await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`)
    if (!res.ok) {
      throw new Error("Weather data could not be loaded.");
    }
    const data = await res.json();

    //  Setting values
    setWeatherState({
      city: data.name,
      country: data.sys.country,
      group: data.weather[0].main,
      description: data.weather[0].description,
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    });
  }


//  Fetch Cordinates of a Country by its name using Openweathermap Geolocating API, then return it
  async function setCoordinatesOf(country){
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${country}&limit=5&appid=${apiKey}`);
    if (!res.ok) {
      throw new Error("Location search is unavailable right now.");
    }
    const data = await res.json();
    if (!data.length) {
      throw new Error(`We couldn't find "${country}". Check the spelling and try again.`);
    }
    return ({ lat : data[0].lat , lon : data[0].lon})
  }


async function handleFetch(event){
  event?.preventDefault();
  const city = inputValue.trim();
  if (!city) {
    setErrorMessage("Enter a city name to search.");
    return;
  }

  setIsLoading(true);
  setErrorMessage("");

  try {
    await fetchWeatherObject(city);
  } catch (error) {
    setErrorMessage(error.message || "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="App">
      <div className="wrapper">
        <main className="content">
          <p className="eyebrow">Your daily forecast</p>
          <h1 className="appHeader">What&apos;s the weather like?</h1>
          <p className="subtitle">Search any city to see its current conditions.</p>
          <form className="searchArea" onSubmit={handleFetch}>
            <input
              type="text"
              className="cityInput"
              aria-label="City name"
              placeholder="Enter a city name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="fetch-data-btn" type="submit" aria-label={isLoading ? "Loading weather" : "Get weather"} disabled={isLoading}>
              {isLoading ? <span className="loadingSpinner" aria-hidden="true" /> : <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="preview-icon"
                aria-hidden="true"
              >
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>}
            </button>
          </form>
          {errorMessage ? <p className="errorMessage" role="alert">{errorMessage}</p> : null}
          {weatherState ? (
          <div className="weatherCard">
            <div className="location">
              <span className="location-label">Current weather</span>
              <h2>{weatherState.city}, {weatherState.country}</h2>
            </div>
            <div className="weatherSummary">
              <img src={weatherState.iconUrl} alt={weatherState.description} />
              <div>
                <p className="temp">{Math.round(weatherState.temp)}°C</p>
                <p className="condition">{weatherState.group}</p>
                <p className="description">{weatherState.description}</p>
              </div>
            </div>
            <div className="details">
              <p><span>Feels like</span><strong>{Math.round(weatherState.feelsLike)}°C</strong></p>
              <p><span>Humidity</span><strong>{weatherState.humidity}%</strong></p>
              <p><span>Wind</span><strong>{weatherState.windSpeed} m/s</strong></p>
            </div>
          </div>
        ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;
