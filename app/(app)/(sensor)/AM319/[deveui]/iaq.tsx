import { useState, useEffect, useCallback } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';
import { DetailCardGroup } from '../../../../../components/home/components/detailCard';
import { ValueIncrementToAQIColor } from '../../../../../components/toFavor';

export default function AM319Temperature() {
  const localSearchParams = useLocalSearchParams();
  const { deveui } = localSearchParams;

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [isFirstDataLoading, setIsFirstDataLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isFirstCurrentDataLoading, setIsFirstCurrentDataLoading] = useState<boolean>(true);
  const [isCurrentDataLoading, setIsCurrentDataLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const [data, setData] = useState<any>({ error: "No data" });
  const [currentData, setCurrentData] = useState<any>({ error: "No data" });

  const query = `
  query GetDownsampledAM319Data($args: GetDataArgs) {
    getDownsampledAM319Data(args: $args) {
      statusCode
      result {
        deveui
        brand
        model
        time
        timestamp
        pm2_5
        co2
        tvoc
        pm10
        hcho
        __typename
      }
      error
      __typename
    }
  }
`
  // Check for existing authentication
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((e) => console.log(e))
      .finally(() => setIsUserLoading(false));
  }, [setUser, setIsUserLoading]);

  // Fetch the data
  const fetchData = async () => {
    setIsDataLoading(true);
    const temp = (await API.graphql({
      query,
      variables: {
        args: {
          deveui,
          frequency: "1d",
          range: { interval: "8d" }
        }
      }
    }) as any).data.getDownsampledAM319Data;
    setData(temp.result[0] && temp.result[0].time.length > 0 ? temp : data);
    setIsDataLoading(false);
    setIsFirstDataLoading(false);
  };
  const fetchCurrentData = async () => {
    setIsCurrentDataLoading(true);
    const temp = (await API.graphql({
      query,
      variables: {
        args: {
          deveui,
          frequency: "1m",
          range: { interval: "2m" }
        }
      }
    }) as any).data.getDownsampledAM319Data;
    setCurrentData(temp.result[0] && temp.result[0].time.length > 0 ? temp : data);
    setIsCurrentDataLoading(false);
    setIsFirstCurrentDataLoading(false);
  };

  useEffect(() => {
    fetchData();

    setInterval(() => { fetchCurrentData() }, 60000);
  }, [setData, setIsDataLoading, setIsFirstDataLoading, setCurrentData, setIsCurrentDataLoading, setIsFirstCurrentDataLoading]);

  const onRefresh = useCallback(() => {
    fetchData();
    fetchCurrentData();
  }, [setData, setIsDataLoading, setIsFirstDataLoading, setCurrentData, setIsCurrentDataLoading, setIsFirstCurrentDataLoading])
    
  return (
    <>
      {!isUserLoading && !user && <Redirect href='/' />}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isDataLoading || isCurrentDataLoading} onRefresh={onRefresh} />}
      >
        {!isFirstDataLoading && !isFirstCurrentDataLoading &&
          (!data.result[0] ? <View /> : !currentData.result[0] ? <View /> :
            <>
                <DetailCardGroup
                title="Particulate Matter 2.5"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].pm2_5[i] * 1e1 ) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].pm2_5[currentData.result[0].pm2_5.length - 1]}
                unit="microgram per cubic meter"
                chartUnit="μg/m³"
                color={ValueIncrementToAQIColor(currentData.result[0].pm2_5[currentData.result[0].pm2_5.length - 1], [10, 12, 15, 35.5, 55.5])}
                decimalPlaces={0}
                />
                <DetailCardGroup
                title="Carbondioxide"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].pm10[i] * 1e1 ) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].pm10[currentData.result[0].pm10.length - 1]}
                unit="microgram per cubic meter"
                chartUnit="μg/m³"
                color={ValueIncrementToAQIColor(currentData.result[0].pm10[currentData.result[0].pm10.length - 1], [10, 12, 15, 35.5, 55.5])}
                decimalPlaces={0}
                />
                <DetailCardGroup
                title="Carbon dioxide"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].co2[i] * 1e1 ) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].co2[currentData.result[0].pm10.length - 1]}
                unit="part per million"
                chartUnit="ppm"
                color={ValueIncrementToAQIColor(currentData.result[0].co2[currentData.result[0].co2.length - 1], [200, 500, 1000, 2000, 3000])}
                decimalPlaces={0}
                />
                <DetailCardGroup
                title="Formaldehyde"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].hcho[i] * 1e2 ) / 1e2,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].hcho[currentData.result[0].pm10.length - 1]}
                unit="milligram per cubic meter"
                chartUnit="mg/m³"
                color={ValueIncrementToAQIColor(currentData.result[0].hcho[currentData.result[0].hcho.length - 1], [0.05, 0.1, 0.25, 0.3, 0.5])}
                decimalPlaces={2}
                />
                <DetailCardGroup
                title="Carbon dioxide"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].co2[i] * 1e1 ) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].co2[currentData.result[0].pm10.length - 1]}
                unit="part per million"
                chartUnit="ppm"
                color={ValueIncrementToAQIColor(currentData.result[0].co2[currentData.result[0].co2.length - 1], [200, 500, 1000, 2000, 3000])}
                decimalPlaces={0}
                />
                <DetailCardGroup
                title="Total Volatile Organic Compound"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].hcho[i] * 1e2 ) / 1e2,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].hcho[currentData.result[0].pm10.length - 1]}
                unit=""
                chartUnit=""
                color={ValueIncrementToAQIColor(parseFloat(currentData.result[0].hcho[currentData.result[0].hcho.length - 1]) / 100, [1,2,3,4,5])}
                decimalPlaces={2}
                />
            </>
          )
        }
      </ScrollView>
    </>);
}

const styles = EStyleSheet.create({
  container: {
    paddingVertical: '2rem',
    paddingHorizontal: '0.63rem',
    backgroundColor: '$backgroundColor',
    gap: '1.25rem',
  }
});