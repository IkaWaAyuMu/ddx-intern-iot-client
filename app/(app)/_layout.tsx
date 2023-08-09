import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import Header from "../../components/header";
import { useEffect, useState } from "react";
import { Orientation, OrientationChangeEvent, addOrientationChangeListener, getOrientationAsync, removeOrientationChangeListener } from "expo-screen-orientation";

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

  if (!fontsLoaded) return <></>
  return (
    <>
      {(orientation === Orientation.PORTRAIT_UP || orientation === Orientation.PORTRAIT_DOWN) && <Header/>}
      <Slot/>
    </>
  )
}