import { Dimensions } from "react-native";
import { View, Text } from "react-native"
import { Orientation, OrientationChangeEvent, addOrientationChangeListener, getOrientationAsync, removeOrientationChangeListener } from "expo-screen-orientation";
import EStyleSheet from "react-native-extended-stylesheet"
import { BarChart } from "react-native-gifted-charts";
import { useEffect, useState } from "react";
import { Link } from "expo-router";

export function DetailCardGroup(props: {
  title: string,
  value: string | number,
  unit: string,
  color?: string,
  detailSearchLink?: string
  yAxisPrefix?: string,
  yAxisSuffix?: string,
  data: {
    value: number,
    timestamp: string,
    frontColor?: string,
  }[]
  chartMax?: number,
  chartMin?: number,
  yOffset?: number,
  sectionCount?: number,
}) {

  const [orientation, setOrientation] = useState<Orientation>(Orientation.UNKNOWN);
  const isPotrait = orientation === Orientation.PORTRAIT_UP || orientation === Orientation.PORTRAIT_DOWN;

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

  const data = props.data.slice(isPotrait ? -7 : 0);
  const minValue = data.reduce((prev, curr) => curr.value < prev.value ? curr : prev).value;
  const maxValue = data.reduce((prev, curr) => curr.value > prev.value ? curr : prev).value;
  
  const chartData = data.map((e) => { return { 
    value: e.value,
    label: isPotrait ? dayOfWeek(new Date(e.timestamp).getDay()) : new Date(e.timestamp).getDate().toString(),
    frontColor: e.frontColor,
    topLabelComponent: () => (
      <Text style={{fontFamily: 'UberMoveMono-Medium', color: e.value === maxValue ? '#ff0000' : e.value === minValue ? '#0000ff' : '#808080', fontSize: isPotrait ? 8 : 5}}>{Math.abs(e.value)}</Text>
    ),
  }})

 

  return (
    <View style={styles.cardGroup}>
      <View style={{ ...styles.background, backgroundColor: props.color ?? "#999999"}}/>
      <View style={styles.spacer1rem} />
      <Text style={{ ...styles.cardText, ...styles.cardTitle }}>{props.title}</Text>
      <View style={styles.spacerp75rem} />
      <Text style={{ ...styles.cardText, ...styles.cardValue }}>{props.value}</Text>
      <Text style={{ ...styles.cardText, ...styles.cardUnit }}>{props.unit}</Text>
      <View style={styles.spacerp75rem} />
      {props.detailSearchLink && <View style={styles.seeMoreButtonParent}><Link href={props.detailSearchLink} style={styles.seeMoreButton}><Text style={styles.seeMoreText}>See more</Text></Link></View>}
      <View style={styles.spacer1rem} />
      <View style={{backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden'}}>
        <BarChart 
          data={chartData}
          height={150 / ((props.chartMin ?? 0) < 0 ? 2 : 1)}
          frontColor='#888'
          initialSpacing={Dimensions.get("window").width / (isPotrait ? 30 : 80 ) }
          spacing={Dimensions.get("window").width / (isPotrait ? 40 : 95 ) }
          barWidth={Dimensions.get("window").width / (isPotrait ? 17 : 55 ) }
          xAxisLabelTextStyle={{ fontFamily: 'UberMoveMono-Medium',  fontSize: 10, left: Dimensions.get("window").width / (isPotrait ? 50 : 150 )}}
          xAxisIndicesWidth={Dimensions.get("window").width / (isPotrait ? 50 : 150 )}
          showFractionalValues
          yAxisLabelWidth={20}
          yAxisTextStyle={{ fontFamily: 'UberMoveMono-Medium',  fontSize: 6}}
          yAxisLabelPrefix={props.yAxisPrefix}
          yAxisLabelSuffix={props.yAxisSuffix}
          autoShiftLabels
          noOfSections={props.sectionCount ?? 5}
          minValue={props.chartMin}
          maxValue={props.chartMax}
          yAxisOffset={props.yOffset}
        />
      </View>
      <View style={styles.spacerp75rem} />
    </View>
  )
}

// 0-6 to 3 letter day of week
const dayOfWeek = (day: number) => {
  switch (day) {
    case 0: return "Sun";
    case 1: return "Mon";
    case 2: return "Tue";
    case 3: return "Wed";
    case 4: return "Thu";
    case 5: return "Fri";
    case 6: return "Sat";
    default: return "err";
  }
} 

export function LastUpdated(props: { time: Date, brand: string, model: string }) {
  return (
    <Text style={styles.lastUpdate}>Last update {props.time.toLocaleString()}.{"\n"}Update data from {props.brand} {props.model} Sensor.</Text>
  )
}

const styles = EStyleSheet.create({
  background: {
    position: "absolute",
    width: "$infinity",
    height: "$infinity",
  },
  seeMoreButtonParent: {
    alignItems: 'center',
  },
  seeMoreButton: {
    backgroundColor: '$gray',
    borderRadius: '0.875rem',
    borderColor:'#888',
    borderWidth: 1,
    height: '1.75rem',
    paddingTop: '0.6rem',
    paddingHorizontal: '0.5rem',
  },
  seeMoreText: {
    fontFamily: 'UberMoveText-Medium',
    fontSize: '0.75rem',
    lineHeight: '0.75rem',
  },
  cardGroup: {
    borderWidth: 2,
    borderColor: '$gray',
    borderRadius: '0.75rem',
    paddingHorizontal: '1rem',
    marginHorizontal: '1.25rem',
    overflow: 'hidden',
  },
  cardText: {
    color: '$darkTextColor',
    width: '100%',
    textAlign: 'center',
  },
  cardTitle: {
    fontFamily: 'UberMove-Bold',
    fontSize: '1.5rem',
    lineHeight: '2rem',
  },
  cardValue: {
    fontSize: '2.25rem',
    fontFamily: 'UberMoveMono-Medium',
    lineHeight: '2.25rem',
  },
  cardUnit: {
    fontSize: '1rem',
    fontFamily: 'UberMoveText-Light',
    lineHeight: '1.5rem',
  },
  lastUpdate: {
    fontSize: '0.625rem',
    fontFamily: 'UberMoveText-Light',
    lineHeight: '0.625rem',
    textAlign: 'center',
  },
  spacer1rem: {
    height: '1rem',
    width: '100%'
  },
  spacerp75rem: {
    height: '1rem',
    width: '100%'
  },
  spacer1p25rem: {
    height: '1.25rem',
    width: '100%'
  },
});