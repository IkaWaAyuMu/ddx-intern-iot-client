import { Auth, Hub } from 'aws-amplify';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, ImageBackground } from 'react-native';
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
    <ImageBackground source={require("../../assets/images/landing.jpg")} style={styles.container}>
      <Text style={styles.landingText}>Please log in</Text>
      <User/>
    </ImageBackground>
  );

  return <Stack screenOptions={{headerShown: false}}/>;
}

const styles = EStyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landingText: {
    fontFamily: 'UberMove-Bold',
    fontSize: 40,
    color: '#40ff40',
  }
});