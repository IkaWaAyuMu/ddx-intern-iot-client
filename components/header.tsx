import { useState, useEffect } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing, withRepeat, cancelAnimation } from 'react-native-reanimated';
import { Auth, Hub } from 'aws-amplify';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as ReactStatusBar } from 'react-native'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'expo-router';



export default function Header() {
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

  const rotation = useSharedValue(0);
  const spin = useAnimatedStyle(() => {
    return {transform: [{rotateZ: `${rotation.value}deg`}]};
  }, [rotation.value]);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }), -1
    );
    return () => cancelAnimation(rotation);
  }, []);
  
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
          <Link href='/home' onPress={() => { leftTranslation.value = leftTranslation.value == 100 ? 0 : 100 }}><Text style={styles.text}>Home</Text></Link>
          <Link href='/AM319/24e124710c409355/iaq' onPress={() => { leftTranslation.value = leftTranslation.value == 100 ? 0 : 100 }}><Text style={styles.text}>Test</Text></Link>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.bottomText}>You are logging in as {user ? user.attributes.name : "ANONYMOUS"}.</Text>
          <Pressable onPress={() => Auth.signOut()} style={styles.logoutButton}><Text style={styles.bottomText}>Log out</Text></Pressable>
        </View>
      </Animated.View>
      <Animated.Image source={require("../assets/ddx.png")} style={[{position: 'absolute', top: '6%', left: '2%', height: 50, width: 50}, spin]}/>
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
