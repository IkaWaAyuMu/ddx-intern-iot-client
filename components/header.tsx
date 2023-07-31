import { useState, useEffect } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Auth, Hub } from 'aws-amplify';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as ReactStatusBar } from 'react-native'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'



export default function Header() {
  const [fontsLoaded] = useFonts({
    'UberMove-Medium': require('../assets/fonts/UberMoveMedium.otf'),
  });

  const [user, setUser] = useState<any>(null);
  const [customState, setCustomState] = useState<string | null>(null);

  const leftTranslation = useSharedValue(100);
  const menuBodyAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(`${leftTranslation.value}%`, {
        duration: 100,
        easing: Easing.ease,
      }),
    };
  }, []);

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
        .catch((e) => console.log(e));

    return unsubscribe;
  }, []);

  if (!fontsLoaded) return (
    <>
      <StatusBar style='light' />
      <View style={styles.header}>
        <Pressable onPress={() => { leftTranslation.value = leftTranslation.value == 100 ? 0 : 100 }}>
          <FontAwesomeIcon icon={faBars} size={30} color='#fff' />
        </Pressable>
      </View>
      <Animated.View style={[ styles.body, menuBodyAnimatedStyle ]}/>
    </>
  );

  return (
    <>
      <StatusBar style='light' />
      <View style={styles.header}>
        <Pressable onPress={() => { leftTranslation.value = leftTranslation.value == 100 ? 0 : 100 }}>
          <FontAwesomeIcon icon={faBars} size={30} color='#fff' style={{
          }} />
        </Pressable>
      </View>
      <Animated.View style={[ styles.body, menuBodyAnimatedStyle ]}>
        <View />
        <View style={styles.main}>
          <Pressable><Text style={styles.text}>Nothing here (yet)</Text></Pressable>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.bottomText}>You are logging in as {user ? user.attributes.name : "ANONYMOUS"}.</Text>
          <Pressable onPress={() => Auth.signOut()} style={styles.logoutButton}><Text style={styles.bottomText}>Log out</Text></Pressable>
        </View>
      </Animated.View>
    </>);
}

const styles = EStyleSheet.create({
  header: {
    paddingTop: ReactStatusBar.currentHeight,
    height: (ReactStatusBar.currentHeight ?? 0) + 50,
    backgroundColor: '#000',
    paddingHorizontal: 10,

    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  body: {
    top: (ReactStatusBar.currentHeight ?? 0) + 50,
    bottom: 0,
    backgroundColor: '#000',
    position: 'absolute',
    width: '100%',
    zIndex: 1,

    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.62rem'
  },
  // ---- Main ----
  main: {

  },
  text: {
    fontFamily: 'UberMove-Medium',
    fontSize: '1.25rem',
    color: '$darkTextColor'
  },
  // ---- Bottom ----
  bottom: {
    alignItems: 'center',
  },
  bottomText: {
    height: '1.25rem',
    fontFamily: 'UberMove-Medium',
    fontSize: '0.875rem',
    color: '$darkTextColor',
  },
  logoutButton: {
    backgroundColor: '#666',
    paddingHorizontal: '0.5rem',
    paddingVertical: '0.25rem',
    borderRadius: '0.5rem',
  }
});
