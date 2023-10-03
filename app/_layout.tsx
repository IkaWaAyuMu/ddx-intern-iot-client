//@ts-nocheck

import EStyleSheet from 'react-native-extended-stylesheet';
import * as WebBrowser from "expo-web-browser";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import { setStatusBarTranslucent } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';

import 'react-native-gesture-handler';

const isLocalHost = Boolean(__DEV__);
const [productionRedirectSignIn, localRedirectSignIn] = awsconfig.oauth.redirectSignIn.split(",");
const [productionRedirectSignOut, localRedirectSignOut] = awsconfig.oauth.redirectSignOut.split(",");

const urlOpener = async (url, redirectUrl) => {
  const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(
    url,
    redirectUrl
  );

  if (type === "success" && Platform.OS === "ios") {
    WebBrowser.dismissBrowser();
    return Linking.openURL(newUrl);
  }
}

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: isLocalHost ? localRedirectSignIn : productionRedirectSignIn,
    redirectSignOut: isLocalHost ? localRedirectSignOut : productionRedirectSignOut,
    urlOpener,
  }
});

EStyleSheet.build({
  $backgroundColor: '#c5c5c5',
  $transparent: '#00000000',
  $textColor: '#fff',
  $infinity: '999rem',

  $black: '#000',
  $black_80: '#000000cc',
  $black_50: '#00000080',
  $black_20: '#00000033',
  $gray900: '#282828',
  $gray800: '#4b4b4b',
  $gray700: '#5e5e5e',
  $gray600: '#626262',
  $gray500: '#868686',
  $gray400: '#a6a6a6',
  $gray400_half: '#a6a6a680',
  $gray300: '#bbbbbb',
  $gray200: '#dddddd',
  $gray100: '#e8e8e8',
  $white: '#fff',

  $black_overlay: '#000000bf',
  $black_lighter_overlay: '#00000040',

  $aqi_1_good: '#00ff19',
  $aqi_2_moderate: '#ffd600',
  $aqi_3_sensitive: '#ff8b1e',
  $aqi_4_unhealthy: '#fe2222',
  $aqi_5_very_unhealthy: '#d53fff',
  $aqi_6_hazardous: '#c72e5c',
});

export default function Root() {
  setStatusBarTranslucent(true);

  const [fontsLoaded] = useFonts({
    'UberMove-Medium': require('../assets/fonts/UberMoveMedium.otf'),
    'UberMove-Bold': require('../assets/fonts/UberMoveBold.otf'),
    'UberMoveMono-Medium': require('../assets/fonts/UberMoveMono-Medium.ttf'),
    'UberMoveText-Light': require('../assets/fonts/UberMoveTextLight.otf'),
    'UberMoveText-Regular': require('../assets/fonts/UberMoveTextRegular.otf'),
    'UberMoveText-Medium': require('../assets/fonts/UberMoveTextMedium.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{flex:1}}><Stack screenOptions={{headerShown: false}}/></SafeAreaView>
  );
}