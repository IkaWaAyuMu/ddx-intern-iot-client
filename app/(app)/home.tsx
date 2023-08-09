import { useState, useEffect, useCallback } from 'react';
import { Redirect } from 'expo-router';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import { getDownsampledAM319Data } from '../../components/graphql/queries';
import EStyleSheet from 'react-native-extended-stylesheet';
import AM319 from '../../components/home/sensors/AM319';

export default function Home() {

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [isFirstDataLoading, setIsFirstDataLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const [data, setData] = useState<any>({error: "No data"});

  const deveui = '24e124710c409355';

  // Check for existing authentication
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((e) => console.log(e))
      .finally(() => setIsUserLoading(false));
  }, [setUser, setIsUserLoading]);

  // Fetch the latest data
  const fetchData = async () => {
    setIsDataLoading(true);
    const temp = (await API.graphql({
      query: getDownsampledAM319Data,
      variables: {
        args: {
          deveui,
          frequency: "1m",
          range: { interval: "2m" }
        }
      }
    }) as any).data.getDownsampledAM319Data;
    setData(temp.result[0] && temp.result[0].time.length > 0 ? temp : data);
    setIsDataLoading(false);
    setIsFirstDataLoading(false);
  };

  useEffect(() => {
    const fetchInterval = setInterval(() => { fetchData() }, 60000);

    () => clearInterval(fetchInterval);
  }, [setData, setIsDataLoading, setIsFirstDataLoading]);

  const onRefresh = useCallback(() => {
    fetchData();
  }, [setData, setIsDataLoading, setIsFirstDataLoading])

  return (
    <>
      {!isUserLoading && !user && <Redirect href='/' />}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isDataLoading} onRefresh={onRefresh} />}
      >
        {!isFirstDataLoading &&
          (data.error ? <Text>{data.error}</Text> :
            !data.result[0] ? <View /> :
              (data.result[0].model === "AM319" && <AM319 deveui={deveui} data={data.result[0]} />))
        }
      </ScrollView>
    </>);
}

const styles = EStyleSheet.create({
  container: {
    paddingVertical: '2rem',
    paddingHorizontal: '0.63rem',
    backgroundColor: '$backgroundColor',
  }
});