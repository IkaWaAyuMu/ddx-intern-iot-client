import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import Header from "../../components/header";
import { useEffect, useState } from "react";
import { Orientation, OrientationChangeEvent, addOrientationChangeListener, getOrientationAsync, removeOrientationChangeListener } from "expo-screen-orientation";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'UberMove-Medium': require('../../assets/fonts/UberMoveMedium.otf'),
    'UberMove-Bold': require('../../assets/fonts/UberMoveBold.otf'),
    'UberMoveMono-Medium': require('../../assets/fonts/UberMoveMono-Medium.ttf'),
    'UberMoveText-Light': require('../../assets/fonts/UberMoveTextLight.otf'),
    'UberMoveText-Medium': require('../../assets/fonts/UberMoveTextMedium.otf'),
  });

  const [orientation, setOrientation] = useState<Orientation>(Orientation.UNKNOWN);

  useEffect(() => {
    const checkOrientation = async () => {
      const orientation = await getOrientationAsync();
      setOrientation(orientation);
    };
    const handleOrientationChange = (o: OrientationChangeEvent) => { setOrientation(o.orientationInfo.orientation) };
    const subscription = addOrientationChangeListener(handleOrientationChange);

    checkOrientation();
    return () => removeOrientationChangeListener(subscription);
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

  if (!fontsLoaded) return <></>
  return (
    <>
      <View style={styles.background}/>
      {(orientation === Orientation.PORTRAIT_UP || orientation === Orientation.PORTRAIT_DOWN) && <Header/>}
      <Slot/>
    </>
  )
}

const styles = EStyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '$backgroundColor',
  }
});