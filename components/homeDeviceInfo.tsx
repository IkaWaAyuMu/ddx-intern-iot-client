import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { DownsampledAM319Data, GetDownsampledAM319DataQuery, GetDownsampledAM319DataQueryVariables } from '../app/graphql/API';
import { API } from 'aws-amplify';
import CalculateAQI from './calculateAQI';

export default function HomeDeviceInfo(uid: string, type: string): [JSX.Element, JSX.Element] {
  switch (type) {
    case 'AM319': return AM319(uid);
  }
  return [<View/>, <View/>];
}

function AM319(uid: string): [JSX.Element, JSX.Element] {
  const [data, setData] = useState<Partial<DownsampledAM319Data> | null>(null);

  const fetchDevices = async () => {
    const temp = await API.graphql({
      query:`
      query GetDownsampledAM319Data($args: GetDataArgs) {
        getDownsampledAM319Data(args: $args) {
          statusCode
          result {
            pm2_5
            humidity
            tvoc
            temperature
            pm10
          }
          error
        }
      }
      `,
      variables: {
        args: ({
          deveui: uid,
          frequency: '1m',
          range: {
            interval: '3m',
          },
        } as GetDownsampledAM319DataQueryVariables)
      }
    });

    const data: Partial<GetDownsampledAM319DataQuery> = (temp as any).data;
    if (data.getDownsampledAM319Data && data.getDownsampledAM319Data.result && data.getDownsampledAM319Data.result.length > 0) setData(data.getDownsampledAM319Data.result[data.getDownsampledAM319Data.result.length-1]);
    else if (data.getDownsampledAM319Data?.error) Alert.alert("Error", data.getDownsampledAM319Data?.error);
  };
  useEffect(() => {
    fetchDevices();
  }, [setData]);

  const aqi = CalculateAQI({
    pm2_5: data != null ? data.pm2_5![0]! : 0,
    pm10: data != null ? data.pm10![0]! : 0,
  })
  
  return [
    <View style={styles.subDataContainer}>
      <Text style={{...styles.dataText, ...styles.subDataText1}}>{data != null ? data.temperature![0]!.toFixed(0) : "-"}°C</Text>
      <Text style={{...styles.dataText, ...styles.subDataText2}}>{data != null ? data.humidity![0]!.toFixed(0) : "-"}%</Text>
    </View>,
    <View style={styles.mainDataContainer}>
      <View style={{...styles.mainDataFavorColor, backgroundColor: aqi.color}}/>
      <Text style={{...styles.dataText, ...styles.mainDataText1}}>{data != null ? aqi.aqi : "-"}</Text>
      <Text style={{...styles.dataText, ...styles.mainDataText2}}>AQI</Text>
    </View>
  ]
}

const styles = EStyleSheet.create({
  dataText: {
    fontFamily: 'UberMoveMono-Medium',
    color: '$white'
  },
  subDataContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  subDataText1: {
    fontSize: '1.25rem'
  },
  subDataText2: {
    fontSize: '0.9375rem'
  },
  mainDataContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    gap: '0.31rem',
  },
  mainDataFavorColor: {
    borderRadius: '$infinity',
    width: '0.3125rem',
  },
  mainDataText1: {
    fontSize: '1.875rem'
  },
  mainDataText2: {
    fontSize: '0.9375rem',
    alignSelf: 'flex-end',
  }
});