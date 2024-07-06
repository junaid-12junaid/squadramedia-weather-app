const axios = require('axios');
const { z } = require('zod');
const client = require('../db/db');

const getWeather = async ({ city }) => {
    const validationSchema = z.object({
        city: z.enum(['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh']),
    });

    const validationResult = validationSchema.safeParse({ city });

    if (!validationResult.success) {
        return {
            city: "",
            temperature: 0,
            description: null,
            icon: null,
            date: '',
            error: 'Please provide a valid city from the list: Delhi, Moscow, Paris, New York, Sydney, Riyadh'
        };
    }

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
        const weather = response.data;

        return {
            city: weather.name,
            temperature: weather.main.temp,
            description: weather.weather[0].description,
            icon: weather.weather[0].icon,
            date: new Date().toISOString(),
            error: null,
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            city: "",
            temperature: 0,
            description: null,
            icon: null,
            date: '',
            error: 'Unable to fetch weather data. Please try again later.',
        };
    }
};

const getHistoricalWeather = async ({ city, from, to }) => {
    const validationSchema = z.object({
        city: z.enum(['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh']),
        from: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format for 'from' date" }),
        to: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format for 'to' date" }),
    }).refine(data => {
        const fromDate = new Date(data.from);
        const toDate = new Date(data.to);
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    }, {
        message: "Date range should not be more than 30 days",
        path: ["to"], 
    });


  validationSchema.safeParse({ city, from, to });

  const res = await client.query(
    'SELECT * FROM weather WHERE city = $1 AND date BETWEEN $2 AND $3',
    [city, from, to]
  );

 
  return res.rows;
};

const addWeather = async ({ input }) => {
  const validationSchema = z.object({
    city: z.enum(['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh']),
    temperature: z.number(),
    description: z.string().optional(),
    icon: z.string().optional(),
  });

  validationSchema.safeParse(input);

  const res = await client.query(
    'INSERT INTO weather(city, temperature, description, icon) VALUES($1, $2, $3, $4) RETURNING *',
    [input.city, input.temperature, input.description, input.icon]
  );

  let data=res.rows[0]
  data.date=new Date(data.date).toISOString()
  return data
};

module.exports = {
  getWeather,
  getHistoricalWeather,
  addWeather,
};
