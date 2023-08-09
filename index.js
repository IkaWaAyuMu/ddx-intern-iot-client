import 'expo-router/entry';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as WebBrowser from "expo-web-browser";
import { Amplify } from "aws-amplify";
import awsconfig from "./app/aws-exports";

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
  $infinity: '999rem',
  $backgroundColor: '#fff',
  $textColor: '#000',
  $darkTextColor: '#fff',
  $gray: "#e8e8e8"
});