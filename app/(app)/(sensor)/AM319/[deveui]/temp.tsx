import { useState, useEffect, useCallback } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { ScrollView, RefreshControl, Text } from 'react-native';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';
import { DetailCardGroup, LastUpdated } from '../../../../../components/details/detailCard';
import { PMVtoFavor, ValueBetweenToAQIColor, ValueBetweenToTempColor } from '../../../../../components/toFavor';
import CalculatePMV from '../../../../../components/calculatePMV';

export default function AM319Temperature() {
  const localSearchParams = useLocalSearchParams();
  const { deveui } = localSearchParams;
  const searchLink = `/AM319/${deveui}/details?searchParams=`

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
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
  }`

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
          range: { interval: "30d" }
        }
      }
    }) as any).data.getDownsampledAM319Data;
    setError(temp.error);
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
    setError(temp.error);
    setCurrentData(temp.result[0] && temp.result[0].time.length > 0 ? temp : data);
    setIsCurrentDataLoading(false);
    setIsFirstCurrentDataLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchCurrentData();
    const fetchInterval = setInterval(() => { fetchCurrentData() }, 60000);

    return clearInterval(fetchInterval);
  }, [setData, setIsDataLoading, setIsFirstDataLoading, setCurrentData, setIsCurrentDataLoading, setIsFirstCurrentDataLoading]);

  const onRefresh = useCallback(() => {
    fetchData();
    fetchCurrentData();
  }, [setData, setIsDataLoading, setIsFirstDataLoading, setCurrentData, setIsCurrentDataLoading, setIsFirstCurrentDataLoading])

  const PMVData = (() => {
    const r = []
    if (data.result != undefined) for (let i = 0; i < data.result[0].timestamp.length; i++) {
      r.push({
        value: Math.round(CalculatePMV(
          data.result[0].temperature[i],
          data.result[0].temperature[i],
          0,
          data.result[0].humidity[i],
          1.2,
          0.57).pmv
          * 1e2) / 1e2,
        timestamp: data.result[0].timestamp[i],
        frontColor: PMVtoFavor(data.result[0].temperature[i], data.result[0].humidity[i]).color?.substring(0, 7)
      })
    }

    return r;
  })();

  const currentDataNotExist = currentData.result == undefined;

  return (
    <>
      {!isUserLoading && !user && <Redirect href='/' />}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isDataLoading || isCurrentDataLoading} onRefresh={onRefresh} />}
      >
        {!isFirstDataLoading && !isFirstCurrentDataLoading &&
          (error ? <Text>{error}</Text> :
            <>
              <DetailCardGroup
                title="Predicted Mean Vote"
                data={PMVData}
                value={currentDataNotExist  ? "-" : Math.round(CalculatePMV(
                  data.result[0].temperature[0],
                  data.result[0].temperature[0],
                  0,
                  data.result[0].humidity[0],
                  1.2,
                  0.57).pmv
                  * 1e2) / 1e2}
                color={currentDataNotExist ? undefined : PMVtoFavor(currentData.result[0].temperature[0], currentData.result[0].humidity[0]).color}
                unit=""
                detailSearchLink={`${searchLink}pmv`}
                sectionCount={Math.ceil(Math.max(Math.abs(Math.min(PMVData.reduce((prev, curr) => prev.value < curr.value ? prev : curr).value, -2)), Math.max(PMVData.reduce((prev, curr) => prev.value > curr.value ? prev : curr).value, 2)))}
                chartMin={Math.min(PMVData.reduce((prev, curr) => prev.value < curr.value ? prev : curr).value, -2)}
                chartMax={Math.max(PMVData.reduce((prev, curr) => prev.value > curr.value ? prev : curr).value, 2)}
              />
              <DetailCardGroup
                title="Temperature"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].temperature[i] * 1e1) / 1e1,
                      timestamp: data.result[0].timestamp[i],
                      frontColor: ValueBetweenToTempColor(data.result[0].temperature[i], [21, 20, 19, 18, 17], [27, 28, 29, 30, 31])?.substring(0, 7)
                    })
                  }

                  return r;
                })()}
                value={currentDataNotExist ? "-" : currentData.result[0].temperature[currentData.result[0].temperature.length - 1]}
                unit="degrees Celsius"
                detailSearchLink={`${searchLink}temperature`}
                color={currentDataNotExist ? undefined : ValueBetweenToTempColor(currentData.result[0].temperature[currentData.result[0].temperature.length - 1], [21, 20, 19, 18, 17], [27, 28, 29, 30, 31])}
                chartMax={30}
                yOffset={10}
                sectionCount={10}
              />
              <DetailCardGroup
                title="Relative Humidity"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].humidity[i] * 1e1) / 1e1,
                      timestamp: data.result[0].timestamp[i],
                      frontColor: ValueBetweenToAQIColor(data.result[0].humidity[i], [40, 35, 30, 25, 20], [60, 65, 70, 75, 80])?.substring(0, 7)
                    })
                  }

                  return r;
                })()}
                value={currentDataNotExist ? "-" : currentData.result[0].humidity[currentData.result[0].humidity.length - 1]}
                unit="percent"
                detailSearchLink={`${searchLink}humidity`}
                color={currentDataNotExist ? undefined : ValueBetweenToTempColor(currentData.result[0].humidity[currentData.result[0].humidity.length - 1], [40, 35, 30, 25, 20], [60, 65, 70, 75, 80])}
                chartMax={100}
                sectionCount={10}
                yAxisSuffix="%"
              />
              <LastUpdated time={new Date(currentDataNotExist ? undefined : currentData.result[0].timestamp[currentData.result[0].timestamp.length - 1])} brand={currentDataNotExist ? "" : currentData.result[0].brand} model={currentDataNotExist ? "" : currentData.result[0].model} />

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