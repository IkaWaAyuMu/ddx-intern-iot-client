import { useState, useEffect, useCallback } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Text, ScrollView, RefreshControl } from 'react-native';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';
import { DetailCardGroup, LastUpdated } from '../../../../../components/home/components/detailCard';

export default function AM319Misc() {
  const localSearchParams = useLocalSearchParams();
  const { deveui } = localSearchParams;

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
        light_level
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
                title="Light Level"
                data={(() => {
                  const r = []

                  for (let i = 0; i < data.result[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(data.result[0].light_level[i] * 1e1) / 1e1,
                      timestamp: data.result[0].timestamp[i]
                    })
                  }

                  return r;
                })()}
                value={currentData.result[0].light_level[currentData.result[0].light_level.length - 1]}
                unit=""
                detailSearchLink={`/AM319/${deveui}/details?searchParams=light_level`}
                chartMax={5}
                sectionCount={5}
              />
              <LastUpdated time={new Date(currentData.result[0].timestamp[currentData.result[0].timestamp.length - 1])} brand={currentData.result[0].brand} model={currentData.result[0].model} />
            </>)}
      </ScrollView>
    </>);
}

const styles = EStyleSheet.create({
  container: {
    paddingVertical: '2rem',
    paddingHorizontal: '0.63rem',
    gap: '1.25rem',
  }
});