import { getDownsampledAM319Data } from "./queries";
import { API } from '@aws-amplify/api'

export async function QueryAllShort(sensor: string, args: any){
  switch (sensor) {
    case "AM319": 
      return (await API.graphql({ query: getDownsampledAM319Data, variables:{ args }}) as any).data.getDownsampledAM319Data;
    default: return {error: "Incorrect sensor"};
  }
}