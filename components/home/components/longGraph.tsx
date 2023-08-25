import { Dimensions } from "react-native";
import { View, Text } from "react-native"
import { Orientation, OrientationChangeEvent, addOrientationChangeListener, getOrientationAsync, removeOrientationChangeListener } from "expo-screen-orientation";
import EStyleSheet from "react-native-extended-stylesheet"
import { LineChart } from "react-native-gifted-charts";
import { useEffect, useState } from "react";

export function LongGraph(props: {
  title: string,
  unit: string,
  yAxisPrefix?: string,
  yAxisSuffix?: string,
  data: {
    value: number,
    timestamp: string,
  }[]
  dataPointWidthMultiplier: number,
  chartMax?: number,
  chartMin?: number,
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

  const data = props.data;
  const minValue = data.reduce((prev, curr) => curr.value < prev.value ? curr : prev).value;
  const maxValue = data.reduce((prev, curr) => curr.value > prev.value ? curr : prev).value;

  const chartData = data.map((e) => {
    return {
      value: e.value,
      dataPointText: (props.yAxisPrefix ?? "") + e.value.toString() + (props.yAxisSuffix ?? ""),
      labelComponent: () => (
        <Text style={{ fontFamily: 'UberMoveMono-Medium', color: '#808080', fontSize: 5, transform: [{rotate: '90deg'}], width: 40}}>{new Date(e.timestamp).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}</Text>
      ),
    }
  })



  return (
    <View style={styles.cardGroup}>
      <View style={{ ...styles.background, backgroundColor: "#999999"}}/>
      <View style={styles.spacerp75rem} />
      <Text style={{ ...styles.cardText, ...styles.cardTitle }}>{props.title}</Text>
      <Text style={{ ...styles.cardText, ...styles.cardUnit }}>{props.unit}</Text>
      <View style={styles.spacerp75rem} />
      <View style={{backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', paddingVertical: 10}}>
        <LineChart
          //@ts-ignore
          data={chartData}
          height={300 / ((props.chartMin ?? 0) < 0 ? 2 : 1)}
          initialSpacing={Dimensions.get("window").width / (isPotrait ? 30 : 70) * props.dataPointWidthMultiplier}
          spacing={Dimensions.get("window").width / (isPotrait ? 15 : 30) * props.dataPointWidthMultiplier}
          xAxisLabelTextStyle={{ fontFamily: 'UberMoveMono-Medium', fontSize: 10, left: Dimensions.get("window").width / (isPotrait ? 50 : 150), top: -50 }}
          xAxisIndicesWidth={Dimensions.get("window").width / (isPotrait ? 50 : 150)}
          showFractionalValues
          yAxisLabelWidth={20}
          yAxisTextStyle={{ fontFamily: 'UberMoveMono-Medium', fontSize: 6 }}
          yAxisLabelPrefix={props.yAxisPrefix}
          yAxisLabelSuffix={props.yAxisSuffix}
          noOfSections={props.sectionCount ?? 5}
          minValue={props.chartMin}
          maxValue={props.chartMax}
          curved
        />
      </View>
      <View style={styles.spacerp75rem} />
    </View>
  )
}

const styles = EStyleSheet.create({
  background: {
    position: "absolute",
    width: "$infinity",
    height: "$infinity",
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