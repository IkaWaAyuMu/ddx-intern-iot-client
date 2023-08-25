import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Redirect } from 'expo-router';
import { StyleSheet, Button, View, Text, Alert } from 'react-native';
import { Auth, Hub } from 'aws-amplify';

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customState, setCustomState] = useState<string | null>(null);

  // Listen to authentication event and check for existing aithentication
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
      .finally(() => setIsLoading(false))

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      {!isLoading && user && <Redirect href='/home' />}
      <Button disabled={isLoading} title="Login" onPress={() => Auth.federatedSignIn()} />
    </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$backgroundColor',
    alignItems: 'center',
    justifyContent: 'center',
  },
});