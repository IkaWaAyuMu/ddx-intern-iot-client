/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type GetDevicesArgs = {
  latitude: number,
  longitude: number,
};

export type GetDevicesMessage = {
  __typename: "GetDevicesMessage",
  statusCode: number,
  result?:  Array<Device > | null,
  error?: string | null,
};

export type Device = {
  __typename: "Device",
  uid: string,
  type: string,
  name: string,
  image?: string | null,
  distance: number,
};

export type GetDevicesFromUIDsArgs = {
  latitude: number,
  longitude: number,
  uids: Array< string >,
};

export type GetDataArgs = {
  ClientToken?: string | null,
  NextToken?: string | null,
  deveui?: string | null,
  range: TimeRangeArgs,
  frequency?: string | null,
  id?: string | null,
};

export type TimeRangeArgs = {
  interval?: string | null,
  startTime?: string | null,
  endTime?: string | null,
};

export type DownsampledAM319Message = {
  __typename: "DownsampledAM319Message",
  statusCode: number,
  NextToken?: string | null,
  result?:  Array<DownsampledAM319Data | null > | null,
  error?: string | null,
};

export type DownsampledAM319Data = {
  __typename: "DownsampledAM319Data",
  NextToken?: string | null,
  deveui: string,
  brand: string,
  model: string,
  time: Array< number | null >,
  timestamp: Array< string | null >,
  pm2_5?: Array< number | null > | null,
  humidity?: Array< number | null > | null,
  co2?: Array< number | null > | null,
  light_level?: Array< number | null > | null,
  pir?: Array< number | null > | null,
  tvoc?: Array< number | null > | null,
  temperature?: Array< number | null > | null,
  pressure?: Array< number | null > | null,
  pm10?: Array< number | null > | null,
  hcho?: Array< number | null > | null,
};

export type DownsampledMSD18Message = {
  __typename: "DownsampledMSD18Message",
  statusCode: number,
  NextToken?: string | null,
  result?:  Array<DownsampledMSD18Data | null > | null,
  error?: string | null,
};

export type DownsampledMSD18Data = {
  __typename: "DownsampledMSD18Data",
  NextToken?: string | null,
  id: string,
  brand: string,
  model: string,
  time: Array< number | null >,
  timestamp: Array< string | null >,
  pm2_5?: Array< number | null > | null,
  humidity?: Array< number | null > | null,
  co2?: Array< number | null > | null,
  tvoc?: Array< number | null > | null,
  temperature?: Array< number | null > | null,
  pm10?: Array< number | null > | null,
};

export type GetDevicesQueryVariables = {
  args?: GetDevicesArgs | null,
};

export type GetDevicesQuery = {
  getDevices?:  {
    __typename: "GetDevicesMessage",
    statusCode: number,
    result?:  Array< {
      __typename: "Device",
      uid: string,
      type: string,
      name: string,
      image?: string | null,
      distance: number,
    } > | null,
    error?: string | null,
  } | null,
};

export type GetDevicesFromUIDsQueryVariables = {
  args?: GetDevicesFromUIDsArgs | null,
};

export type GetDevicesFromUIDsQuery = {
  getDevicesFromUIDs?:  {
    __typename: "GetDevicesMessage",
    statusCode: number,
    result?:  Array< {
      __typename: "Device",
      uid: string,
      type: string,
      name: string,
      image?: string | null,
      distance: number,
    } > | null,
    error?: string | null,
  } | null,
};

export type GetDownsampledAM319DataQueryVariables = {
  args?: GetDataArgs | null,
};

export type GetDownsampledAM319DataQuery = {
  getDownsampledAM319Data?:  {
    __typename: "DownsampledAM319Message",
    statusCode: number,
    NextToken?: string | null,
    result?:  Array< {
      __typename: "DownsampledAM319Data",
      NextToken?: string | null,
      deveui: string,
      brand: string,
      model: string,
      time: Array< number | null >,
      timestamp: Array< string | null >,
      pm2_5?: Array< number | null > | null,
      humidity?: Array< number | null > | null,
      co2?: Array< number | null > | null,
      light_level?: Array< number | null > | null,
      pir?: Array< number | null > | null,
      tvoc?: Array< number | null > | null,
      temperature?: Array< number | null > | null,
      pressure?: Array< number | null > | null,
      pm10?: Array< number | null > | null,
      hcho?: Array< number | null > | null,
    } | null > | null,
    error?: string | null,
  } | null,
};

export type GetDownsampledMSD18DataQueryVariables = {
  args?: GetDataArgs | null,
};

export type GetDownsampledMSD18DataQuery = {
  getDownsampledMSD18Data?:  {
    __typename: "DownsampledMSD18Message",
    statusCode: number,
    NextToken?: string | null,
    result?:  Array< {
      __typename: "DownsampledMSD18Data",
      NextToken?: string | null,
      id: string,
      brand: string,
      model: string,
      time: Array< number | null >,
      timestamp: Array< string | null >,
      pm2_5?: Array< number | null > | null,
      humidity?: Array< number | null > | null,
      co2?: Array< number | null > | null,
      tvoc?: Array< number | null > | null,
      temperature?: Array< number | null > | null,
      pm10?: Array< number | null > | null,
    } | null > | null,
    error?: string | null,
  } | null,
};
