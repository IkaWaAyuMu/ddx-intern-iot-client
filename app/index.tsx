// import { useState, useMemo, useEffect } from 'react';
// import * as WebBrowser from 'expo-web-browser';
// import { Redirect } from 'expo-router';
// import { useAuthRequest, exchangeCodeAsync, revokeAsync, ResponseType, AccessTokenRequestConfig, TokenResponse } from 'expo-auth-session';
// import { StyleSheet, Button, View, Text, Alert } from 'react-native';
// import authParams from './auth-params'
// import * as AuthStorage from '../components/authStorage';
// import jwt_decode from "jwt-decode";

// WebBrowser.maybeCompleteAuthSession();

// export default function App() {
//   const [authTokens, setAuthTokens] = useState<TokenResponse | null>(null);
//   const [name, setName] = useState<string | null>(null);
//   const { clientId, redirectUri, endpoint, authRequestConfig } = authParams
//   const discoveryDocument = useMemo(() => endpoint, []);

//   const [request, response, promptAsync] = useAuthRequest(
//     authRequestConfig,
//     discoveryDocument
//   );

//   // Exchange code for token
//   useEffect(() => {
//     const exchangeFn = async (exchangeTokenReq: AccessTokenRequestConfig) => {
//       try {
//         const exchangeTokenResponse: TokenResponse = await exchangeCodeAsync(
//           exchangeTokenReq,
//           discoveryDocument
//         );
//         setAuthTokens(exchangeTokenResponse);
//         setName((jwt_decode(exchangeTokenResponse.idToken!) as any).name);
//         await AuthStorage.setAsync(exchangeTokenResponse);
//       } catch (error) {
//         console.log(error);
//         Alert.alert(JSON.stringify(error));
//       }
//     };
//     if (response) {
//       if (response.type !== 'success') {
//         console.log(response);
//         return;
//       }
//       else {
//         exchangeFn({
//           clientId,
//           code: response.params.code,
//           redirectUri,
//           extraParams: {
//             code_verifier: request?.codeVerifier ? request.codeVerifier : ''
//           },
//         });
//       }
//     }
//   }, [discoveryDocument, request, response]);

//   //Check for existing log in
//   useEffect(() => {
//     const getAuth = async () => {
//       const authTokens: TokenResponse | null = await AuthStorage.getAsync();
//       if (authTokens) {
//         setAuthTokens(authTokens);
//         setName((jwt_decode(authTokens.idToken!) as any).name);
//       }
//     }
//     getAuth();
//   }, []);

//   return (
//     <View style={styles.container}>
//       {authTokens && <Redirect href='/home' />}
//       <Button disabled={!request} title="Login" onPress={() => promptAsync()} />
//     </View>);
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Redirect } from 'expo-router';
import { StyleSheet, Button, View, Text, Alert } from 'react-native';
import { Auth, Hub } from 'aws-amplify';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});