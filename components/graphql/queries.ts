/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAM319Data = /* GraphQL */ `
  query GetAM319Data($args: GetDataArgs) {
    getAM319Data(args: $args) {
      statusCode
      result {
        NextToken
        deveui
        brand
        model
        time
        timestamp
        pm2_5
        humidity
        co2
        light_level
        pir
        tvoc
        temperature
        pressure
        pm10
        hcho
        __typename
      }
      error
      __typename
    }
  }
`;
export const getDownsampledAM319Data = /* GraphQL */ `
  query GetDownsampledAM319Data($args: GetDataArgs) {
    getDownsampledAM319Data(args: $args) {
      statusCode
      result {
        NextToken
        deveui
        brand
        model
        time
        timestamp
        pm2_5
        humidity
        co2
        light_level
        pir
        tvoc
        temperature
        pressure
        pm10
        hcho
        __typename
      }
      error
      __typename
    }
  }
`;
export const test = /* GraphQL */ `
  query Test($args: GetDataArgs) {
    test(args: $args)
  }
`;
