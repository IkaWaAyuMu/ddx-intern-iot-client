import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitleStyle: {
          color: '#fff',
          fontFamily: 'UberMoveText-Medium'
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}/>
  );
}