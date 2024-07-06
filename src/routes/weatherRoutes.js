const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const weatherController = require('../controllers/weatherController');

const router = express.Router();
 
const schema = buildSchema(`
  type Weather {
    id: ID!
    city: String!
    temperature: Float!
    description: String
    icon: String
    date: String!
    error:String
  }

  type Query {
    getWeather(city: String!): Weather
    getHistoricalWeather(city: String!, from: String!, to: String!): [Weather]
  }

  input WeatherInput {
    city: String!
    temperature: Float!
    description: String
    icon: String
  }

  type Mutation {
    addWeather(input: WeatherInput!): Weather
  }
`);

const root = {
  getWeather: weatherController.getWeather,
  getHistoricalWeather: weatherController.getHistoricalWeather,
  addWeather: weatherController.addWeather,
};

router.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

module.exports = router;
