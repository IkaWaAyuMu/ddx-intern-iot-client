import { useState, useEffect, useCallback } from 'react';
import { Redirect } from 'expo-router';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import { getDownsampledAM319Data } from '../../components/graphql/queries';
import EStyleSheet from 'react-native-extended-stylesheet';

export default function App() {
  const [fontsLoaded] = useFonts({
    'UberMove-Medium': require('../../assets/fonts/UberMoveMedium.otf'),
    'UberMove-Bold': require('../../assets/fonts/UberMoveBold.otf'),
    'UberMoveMono-Medium': require('../../assets/fonts/UberMoveMono-Medium.ttf'),
    'UberMoveText-Light': require('../../assets/fonts/UberMoveTextLight.otf'),
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstDataLoading, setIsFirstDataLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const [data, setData] = useState<any>("");

  // Check for existing aithentication
  useEffect(() => {
    const fetchData = async () => { 
      setIsDataLoading(true);
      setData(((await API.graphql({
        query: getDownsampledAM319Data,
        variables: {
          args: {
            deveui: '24e124710c409355',
            frequency: "1m",
            range: {interval: "1m"}
          }
        }
     })) as any).data.getDownsampledAM319Data )
     setIsDataLoading(false);
     setIsFirstDataLoading(false);
    };

    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false))
    setInterval(() => {fetchData()}, 60000);
  }, []);

  const onRefresh = useCallback(() => {
    const fetchData = async () => { 
      setIsDataLoading(true);
      setData(((await API.graphql({
        query: getDownsampledAM319Data,
        variables: {
          args: {
            deveui: '24e124710c409355',
            frequency: "1m",
            range: {interval: "1m"}
          }
        }
     })) as any).data.getDownsampledAM319Data )
     setIsDataLoading(false);
     setIsFirstDataLoading(false);
    };

    fetchData();
  }, [])

  if (!fontsLoaded) return <View style={styles.container}/>

  return (
    <>
      {!isLoading && !user && <Redirect href='/' />}
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        {isDataLoading && <Text>Loading...</Text>}
        {!isFirstDataLoading && data &&
          (data.error ? <Text>{data.error}</Text> :
          !data.result[0] ? <View/> :
          <View style={styles.briefInfo}>
            <Card title="Temperature" value={data.result[0].temperature[0] ?? ""} unit="degree Celsius" />
            <Card title="R.Humidity" value={data.result[0].humidity[0] ?? ""} unit="%" />
            <Card title="PM2.5" value={data.result[0].pm2_5[0] ?? ""} unit="μg/m3" />
            <Card title="PM10" value={data.result[0].pm10[0] ?? ""} unit="μg/m3" />
            <Card title="CO2" value={data.result[0].co2[0] ?? ""} unit="ppm" />
            <Card title="HCHO" value={data.result[0].hcho[0] ?? ""} unit="ppb" />
            <Card title="TVOC" value={(parseFloat(data.result[0].tvoc[0])/100).toPrecision(3).toString() ?? ""} unit="IAQ Rating" />
            <Card title="Light Level" value={data.result[0].light_level[0] ?? ""} unit="" />
            <View style={styles.spacer1rem}/>
            <LastUpdated time={new Date(data.result[0].timestamp[0])} brand={data.result[0].brand} model={data.result[0].model}/>
            <View style={styles.spacer1rem}/>
          </View>)
        }
      </ScrollView>
    </>);
}

function Card(props: {
  title: string,
  value: string,
  unit: string,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.spacer1rem}/>
      <View style={styles.cardFrame}>
      <View>
        <View style={styles.spacerp75rem}/>
        <Text style={{...styles.cardText, ...styles.cardTitle}}>{props.title}</Text>
        <View style={styles.spacerp75rem}/>
      </View>
      <View>
        <View style={styles.spacer1rem}/>
        <Text style={{...styles.cardText, ...styles.cardValue}}>{props.value}</Text>
        <Text style={{...styles.cardText, ...styles.cardUnit}}>{props.unit}</Text>
      </View>
      </View>
      <View style={styles.spacer1rem}/>
    </View>
  )
}

function LastUpdated(props: { time: Date, brand: string, model: string }) {
  return (
    <Text style={styles.lastUpdate}>Last update {props.time.toLocaleString()}.{"\n"}Update data from {props.brand} {props.model} Sensor.</Text>
  )
}

const styles = EStyleSheet.create({
  container: {
    paddingVertical: '2rem',
    paddingHorizontal: '0.63rem',
    backgroundColor: '$backgroundColor',
    alignItems: 'center',
    justifyContent: 'center',
  },
  briefInfo: {
    paddingHorizontal: '1.25rem',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e2e2',
    borderRadius: '0.75rem',
    paddingLeft: '1rem',
    paddingRight: '0.5rem',
  },
  cardFrame: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    color: '$textColor'
  },
  cardTitle: {
    fontFamily: 'UberMove-Bold',
    fontSize: '1.5rem',
    lineHeight: '2rem',
  },
  cardValue: {
    fontSize: '2rem',
    fontFamily: 'UberMoveMono-Medium',
    lineHeight: '2rem',
    textAlign: 'right',
  },
  cardUnit: {
    fontSize: '0.625rem',
    fontFamily: 'UberMoveText-Light',
    lineHeight: '0.625rem',
    textAlign: 'right',
  },
  lastUpdate: {
    fontSize: '0.625rem',
    fontFamily: 'UberMoveText-Light',
    lineHeight: '0.625rem',
    textAlign: 'center',
  },
  spacer1rem: {
    height: '1rem',
    width: '100%'
  },
  spacerp75rem: {
    height: '1rem',
    width: '100%'
  }
});