import { useEffect, useState } from 'react';
import './App.css';


function App() {

//  API key (move to .env file later)
  const apiKey = "52bd10246ea9fc9c8d25119327ee5446";

//  Initialise and Declair "WeatherState" and log it as it changes
    const [ weatherState , setWeatherState ] = useState(null)
    useEffect(() => {
      console.log(weatherState)
    },[weatherState])


//  Fetch Weather object of a country using Openweathermap Weather API and set it's state of 
  async function fetchWeatherObject(country){
    const coordinates = await setCoordinatesOf(country)
    const res =  await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}`)
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
    const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${country}&limit=5&appid=${apiKey}`);
    const data = await res.json();
    return ({ lat : data[0].lat , lon : data[0].lon})
  }


async function handleClick(){
  fetchWeatherObject("London")
}

  return (
    <div className="App">
      <div className="wrapper">
        <button className="fetch-data-btn" onClick={handleClick}>FETCH!</button>
      </div>
    </div>
  );
}

export default App;
