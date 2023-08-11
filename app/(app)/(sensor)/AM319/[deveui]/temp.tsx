import { useState, useEffect, useCallback } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';
import { DetailCardGroup } from '../../../../../components/home/components/detailCard';
import { PMVtoFavor, ValueBetweenToTempColor } from '../../../../../components/toFavor';
import CalculatePMV from '../../../../../components/calculatePMV';

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
        humidity
        temperature
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
                title="Predicted Mean Vote"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(CalculatePMV(
                        data.result[0].temperature[i],
                        data.result[0].temperature[i],
                        0,
                        data.result[0].humidity[i],
                        1.2,
                        0.57).pmv
                      * 1e2) / 1e2,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={ Math.round(CalculatePMV(
                  data.result[0].temperature[0],
                  data.result[0].temperature[0],
                  0,
                  data.result[0].humidity[0],
                  1.2,
                  0.57).pmv
                * 1e2) / 1e2}
                unit=""
                chartUnit=""
                color={PMVtoFavor(currentData.result[0].temperature[0], currentData.result[0].humidity[0]).color}
                decimalPlaces={2}
              />
              <DetailCardGroup
                title="Temperature"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].temperature[i] * 1e1) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].temperature[currentData.result[0].temperature.length - 1]}
                unit="degree Celsius"
                chartUnit="°C"
                color={ValueBetweenToTempColor(currentData.result[0].temperature[currentData.result[0].temperature.length - 1], [21, 20, 19, 18, 17], [27, 28, 29, 30, 31])}
                decimalPlaces={1}
                />
                <DetailCardGroup
                title="Relative Humidity"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].humidity[i] * 1e1) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }
                  
                  return r;
                })()}
                value={currentData.result[0].humidity[currentData.result[0].humidity.length - 1]}
                unit="percent"
                chartUnit="%"
                color={ValueBetweenToTempColor(currentData.result[0].humidity[currentData.result[0].humidity.length - 1], [40, 35, 30, 25, 20], [60, 65, 70, 75, 80])}
                decimalPlaces={1}
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