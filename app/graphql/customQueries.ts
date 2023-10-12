import { GetDataArgs } from "./API";
import { getDownsampledAM319Data, getDownsampledMSD18Data } from "./queries";
import { API } from '@aws-amplify/api'

export async function QueryAll(sensor: string, 
  args: GetDataArgs
  ){
  switch (sensor) {
    case "AM319": 
      return (await API.graphql({ query: getDownsampledAM319Data, variables:{ args }}) as any).data.getDownsampledAM319Data;
    case "MSD18": 
      return (await API.graphql({ query: getDownsampledMSD18Data, variables:{ args }}) as any).data.getDownsampledMSD18Data;
    default: return {error: "Incorrect sensor"};
  }
}