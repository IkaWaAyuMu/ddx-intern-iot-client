import { useState, useEffect, useCallback } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';

export default function AM319Temperature() {
  const localSearchParams = useLocalSearchParams();
  const { deveui } = localSearchParams;

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [isFirstDataLoading, setIsFirstDataLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const [data, setData] = useState<any>({error: "No data"});

  const query = `
  query GetDownsampledAM319Data($args: GetDataArgs) {
    getDownsampledAM319Data(args: $args) {
      statusCode
      result {
        NextToken
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

  useEffect(() => {
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

    setInterval(() => { fetchData() }, 60000);
  }, [setData, setIsDataLoading, setIsFirstDataLoading]);

  const onRefresh = useCallback(() => {
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
            !data.result[0] ? <View /> : <Text>{JSON.stringify(data)}</Text>
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
  }
});