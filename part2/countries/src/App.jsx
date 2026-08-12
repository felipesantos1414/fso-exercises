import { useState, useEffect } from 'react'
import axios from 'axios'

const api_key = process.env.REACT_APP_API_KEY

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
    setSelectedCountry(null)
  }

  const handleShow = (country) => {
    setSelectedCountry(country)
  }

  const countriesToShow = filter === ''
    ? []
    : countries.filter(country =>
        country.name.common.toLowerCase().includes(filter.toLowerCase())
      )

  const countryToDisplay = selectedCountry || (countriesToShow.length === 1 ? countriesToShow[0] : null)

  return (
    <div>
      <div>find countries: <input value={filter} onChange={handleFilterChange} /></div>

      {countriesToShow.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : countriesToShow.length === 1 || selectedCountry ? (
        countryToDisplay && <CountryDetail country={countryToDisplay} api_key={api_key} />
      ) : (
        <ul>
          {countriesToShow.map(country => (
            <li key={country.cca3}>
              {country.name.common}
              <button onClick={() => handleShow(country)}>show</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const CountryDetail = ({ country, api_key }) => {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const capital = country.capital ? country.capital[0] : ''
    if (capital && api_key) {
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${api_key}&units=metric`)
        .then(response => {
          setWeather(response.data)
        })
    }
  }, [country, api_key])

  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>capital {country.capital ? country.capital.join(', ') : 'N/A'}</p>
      <p>area {country.area}</p>
      <h3>languages:</h3>
      <ul>
        {country.languages && Object.values(country.languages).map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={`flag of ${country.name.common}`} width="150" />

      {weather && (
        <div>
          <h2>Weather in {country.capital[0]}</h2>
          <p>temperature {weather.main.temp} Celsius</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <p>wind {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  )
}

export default App