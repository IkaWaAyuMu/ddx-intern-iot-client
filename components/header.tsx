import { useState, useEffect } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing, withRepeat, cancelAnimation } from 'react-native-reanimated';
import { Auth, Hub } from 'aws-amplify';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as ReactStatusBar } from 'react-native'
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';


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
    return { transform: [{ rotateZ: `${rotation.value}deg` }] };
  }, [rotation.value]);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 100,
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
          <FontAwesome name='bars' size={30} color='#ffffff' /> 
        </Pressable>
      </View>
      <Animated.View style={[styles.body, menuBodyAnimatedStyle]}>
        <View />
        <View style={styles.main}>
          <Link href='/home' onPress={() => { leftTranslation.value = leftTranslation.value == 100 ? 0 : 100 }}><Text style={styles.text}>Home</Text></Link>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.bottomText}>You are logging in as {user ? user.attributes.name : "ANONYMOUS"}.</Text>
          <Pressable onPress={() => Auth.signOut()} style={styles.logoutButton}><Text style={styles.bottomText}>Log out</Text></Pressable>
        </View>
      </Animated.View>
      <Animated.Image source={require("../assets/ddx.png")} style={[{ position: 'absolute', top: 5 
      + (ReactStatusBar.currentHeight ?? 0), left: '2%', height: 50, width: 50 }, spin]} />
    </>);
}

const styles = EStyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#595959',
    paddingHorizontal: 10,

    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  body: {
    top: 60 + (ReactStatusBar.currentHeight ?? 0),
    bottom: 0,
    backgroundColor: '#595959',
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
