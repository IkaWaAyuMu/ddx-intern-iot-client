import { Auth, Hub } from 'aws-amplify';
import { Slot, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import User from '../../components/user';

export default function Layout() {

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [customState, setCustomState] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          setUser(data);
          break;
        case "signOut":
          setUser(null);
          break;
        case "customOAuthState":
          setCustomState(data);
          break;
      }
    });

    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));

    return unsubscribe;
  }, []);

  if (isLoading) return null;

  if (!user) return (
    <View style={styles.container}>
      <User />
      <Text>Yang mai dai log in ai sus</Text>
    </View>
  );

  return <Stack screenOptions={{headerShown: false}}/>;
}

const styles = EStyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});