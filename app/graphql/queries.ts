/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDevices = /* GraphQL */ `
  query GetDevices($args: GetDevicesArgs) {
    getDevices(args: $args) {
      statusCode
      result {
        uid
        type
        name
        image
        distance
        __typename
      }
      error
      __typename
    }
  }
`;
export const getDevicesFromUIDs = /* GraphQL */ `
  query GetDevicesFromUIDs($args: GetDevicesFromUIDsArgs) {
    getDevicesFromUIDs(args: $args) {
      statusCode
      result {
        uid
        type
        name
        image
        distance
        __typename
      }
      error
      __typename
    }
  }
`;
export const getAM319Data = /* GraphQL */ `
  query GetAM319Data($args: GetDataArgs) {
    getAM319Data(args: $args) {
      statusCode
      result {
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
      NextToken
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
export const getDownsampledMSD18Data = /* GraphQL */ `
  query GetDownsampledMSD18Data($args: GetDataArgs) {
    getDownsampledMSD18Data(args: $args) {
      statusCode
      NextToken
      result {
        NextToken
        id
        brand
        model
        time
        timestamp
        pm2_5
        humidity
        co2
        tvoc
        temperature
        pm10
        __typename
      }
      error
      __typename
    }
  }
`;
