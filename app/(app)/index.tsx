import { View, Text, Alert, ImageBackground, FlatList, RefreshControl, TextInput, Pressable } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import User from "../../components/user";
import { Device, GetDevicesArgs, GetDevicesQuery } from "../graphql/API";
import { useCallback, useEffect, useState } from "react";
import { API } from "aws-amplify";
import HomeDeviceInfo from "../../components/homeDeviceInfo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack } from "expo-router";
import * as Location from 'expo-location';

export default function Index() {

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<Partial<Device>[] | null>(null);

  const [searchText, setSearchText] = useState<string>("");

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Error", "Permission to access location was denied");
      return Promise.resolve({
        coords: {
          latitude: 13.742650135428862, 
          longitude: 100.54776750828582,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: new Date().valueOf()
      } as Location.LocationObject)
    }
    return await Location.getCurrentPositionAsync({});
  }

  const fetchDevices = async () => {
    setIsDataLoading(true);
    const location = await getLocation();
    const temp = await API.graphql({
      query:`
      query GetDevices($args: GetDevicesArgs) {
        getDevices(args: $args) {
          statusCode
          result {
            uid
            type
            name
            image
            distance
            __typename
          }
          error
          __typename
        }
      }
      `,
      variables: {
        args: ({
          latitude: location.coords.latitude ?? 0, 
          longitude: location.coords.longitude ?? 0        
        } as GetDevicesArgs)
      }
    });

    const data: GetDevicesQuery = (temp as any).data;
    if (data.getDevices && data.getDevices.result && data.getDevices.result.length > 0) setDevices(data.getDevices.result);
    else Alert.alert("Error", data.getDevices?.error ?? "Unknown");
    setIsDataLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, [setDevices, setIsDataLoading]);

  const onRefresh = useCallback(() => {
    fetchDevices();
  }, [setDevices, setIsDataLoading]);
      
  return (
      <View style={styles.overlayContainer}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Air Matter",
            headerTransparent: true,
            headerTitleStyle: {
              color: '#fff',
              fontFamily: 'UberMoveText-Regular',
            },
            headerTintColor: '#fff',
            headerTitleAlign: 'center',
            headerRight: () => (<User isHeader/>)
          }}
        />
        <ImageBackground source={require("../../assets/images/background.jpg")} style={styles.container}>
          <View style={styles.containerImageOverlay} />
          <View style={styles.flatListContainer}>
            <View style={styles.searchBox}>
              <FontAwesome name='search' size={16} color='#fff'/> 
              <TextInput
                style={styles.searchText}
                onChangeText={setSearchText}
                value={searchText}
                
                placeholder='Search'
                placeholderTextColor='#ddd'/>
            </View>
            <FlatList
              refreshControl={<RefreshControl refreshing={isDataLoading} onRefresh={onRefresh} />}
              data={devices ? devices.filter(e => e.name!.toLowerCase().includes(searchText.toLowerCase())).sort((a, b) => (a.name!.toLowerCase().startsWith(searchText.toLowerCase()) ? 1 : -1) - (b.name!.toLowerCase().startsWith(searchText.toLowerCase()) ? 1 : -1)) : []}
              renderItem={({item}) => <DeviceElement device={item}/>}
              keyExtractor={item => item.uid!}
              ItemSeparatorComponent={() => <View style={{height: 8}} />}
            />
            <View style={{height: 8}} />
          </View>
        </ImageBackground>
      </View>
  )
}

function DeviceElement(props: {device: Partial<Device>}) {
  const {name, uid, type, image, distance} = props.device;

  const info = HomeDeviceInfo(uid!, type!);

  return (
    <Link href={`/${type!}/${uid!}?image=${image}&name=${name}`} asChild>
      <Pressable style={deviceStyle.container}>
        <ImageBackground source={{uri: image ?? "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/1920px-Question_mark_%28black%29.svg.png"}} style={deviceStyle.containerImageOverlay}/>
        <View style={deviceStyle.containerImageOverlay} />
        <View style={deviceStyle.topContainer}>
          <Text style={deviceStyle.nameText}>{name}</Text>
          {info[0]}
        </View>
        <View style={deviceStyle.bottomContainer}>
          {info[1]}
          <Text style={deviceStyle.distanceText}>{(Math.round(distance!*1e2)/1e2).toLocaleString()} km</Text>
        </View>
      </Pressable>
    </Link>
  )
}

const styles = EStyleSheet.create({
  searchBox: {
    backgroundColor: '$gray600',
    paddingVertical: '0.5rem',
    paddingHorizontal: '1rem',
    borderRadius: '0.75rem',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '1rem'
  },
  searchText: {
    flex: 1,
    color: '$white',
    fontSize: '0.875rem'
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: '$backgroundColor',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingTop: '5rem',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  containerImageOverlay: {
    ...EStyleSheet.absoluteFillObject,
    backgroundColor: '$black_lighter_overlay',
  },
  flatListContainer: {
    paddingHorizontal: '1rem',
    paddingTop: '1.5rem',
    flex: 1,
    gap: '0.5rem',
  },
});

const deviceStyle = EStyleSheet.create({
  container: {
    borderRadius: '0.75rem',
    overflow: 'hidden',
    paddingVertical: '1.5rem',
    paddingHorizontal: '1rem',
    gap: '2rem',
    justifyContent: 'space-between',
  },
  containerImageOverlay: {
    ...EStyleSheet.absoluteFillObject,
    backgroundColor: '$black_overlay',
  },
  topContainer: {
    flexDirection: 'row',
    height: '3.125rem',
  },
  nameText: {
    fontFamily: 'UberMoveText-Light',
    fontSize: '1.25rem',
    color: '$white',
    flex: 1,
    paddingRight: '3rem',
  },
  bottomContainer: {
    flexDirection: 'row',
    height: '2rem',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  distanceText: {
    fontFamily: 'UberMoveMono-Medium',
    fontSize: '0.5rem',
    color: '$white',
  }
});