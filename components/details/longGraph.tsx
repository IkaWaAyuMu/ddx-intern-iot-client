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
  const min = data.findLast((e) => e.value == minValue);
  const maxValue = data.reduce((prev, curr) => curr.value > prev.value ? curr : prev).value;
  const max = data.findLast((e) => e.value == maxValue);
  const meanValue = data.reduce((prev, curr) => prev + curr.value, 0) / data.length;

  let significantNumber = Math.floor(Math.log10(Math.max(Math.abs(minValue == 0 ? 0.01 : minValue), (Math.abs(maxValue == 0 ? 0.01 : maxValue)))))
  if (significantNumber <= 0) significantNumber = 0;

  const chartData = data.map((e) => {
    return {
      value: e.value,
      dataPointLabelComponent: () => 
      <View style={{transform: [{rotate: '-90deg'}, {translateX: 10 * (props.dataPointWidthMultiplier > 1 ? props.dataPointWidthMultiplier * 1.5 : 1) }, {translateY: 10 * (props.dataPointWidthMultiplier > 1 ? 0.1 / props.dataPointWidthMultiplier  : 1)}]}}>
        <Text style={{fontFamily: 'UberMoveMono-Medium', color: e.value == maxValue ? '#ff0000' : (e.value == minValue ? '#0000ff' : '#404040'), fontSize: 5 * (props.dataPointWidthMultiplier > 1 ? props.dataPointWidthMultiplier : 1)}}>
          {`${(props.yAxisPrefix ?? "")}${e.value.toString()}${(props.yAxisSuffix ?? "")}`}
        </Text>
        <Text style={{fontFamily: 'UberMoveMono-Medium', color: '#808080', fontSize: 3 * (props.dataPointWidthMultiplier > 1 ? props.dataPointWidthMultiplier : 1)}}>
          {`${
          new Date(e.timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}`}
        </Text>
      </View>,
    }
  })



  return (
    <View style={styles.cardGroup}>
      <View style={{ ...styles.background, backgroundColor: "#404040"}}/>
      <View style={styles.spacerp75rem} />
      <Text style={{ ...styles.cardText, ...styles.cardTitle }}>{props.title}</Text>
      <Text style={{ ...styles.cardText, ...styles.cardUnit }}>{props.unit}</Text>
      <View style={styles.spacerp75rem} />
      <View style={{backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', paddingTop: 15*props.dataPointWidthMultiplier}}>
        <LineChart
          areaChart
          hideDataPoints={props.dataPointWidthMultiplier < 0.4}
          //@ts-ignore
          data={chartData}
          showReferenceLine1
          referenceLine1Position={meanValue - (props.chartMin == undefined ? Math.max(0, minValue - (Math.pow(10, significantNumber) / 4)) : 0)}
          //@ts-ignore
          referenceLine1Config={{
            color: "#000000",
          }}
          showReferenceLine2
          referenceLine2Position={minValue - (props.chartMin == undefined ? Math.max(0, minValue - (Math.pow(10, significantNumber) / 4)) : 0)}
          //@ts-ignore
          referenceLine2Config={{
            color: "#0000ff",
          }}
          showReferenceLine3
          referenceLine3Position={maxValue - (props.chartMin == undefined ? Math.max(0, minValue - (Math.pow(10, significantNumber) / 4)) : 0)}
          //@ts-ignore
          referenceLine3Config={{
            color: "#ff0000",
          }}
          height={300 / ((props.chartMin ?? 0) < 0 ? 2 : 1)}
          initialSpacing={5 + Dimensions.get("window").width / (isPotrait ? 30 : 70) * props.dataPointWidthMultiplier}
          spacing={Dimensions.get("window").width / (isPotrait ? 15 : 30) * props.dataPointWidthMultiplier}
          xAxisLabelTextStyle={{ fontFamily: 'UberMoveMono-Medium', fontSize: 10, left: Dimensions.get("window").width / (isPotrait ? 50 : 150), top: -50 }}
          xAxisIndicesWidth={Dimensions.get("window").width / (isPotrait ? 50 : 150)}
          showFractionalValues
          startFillColor='#ff8080'
          startOpacity={0.5}
          endFillColor='#80c0ff'
          endOpacity={0.5}
          yAxisLabelWidth={20}
          yAxisTextStyle={{ fontFamily: 'UberMoveMono-Medium', fontSize: 6 }}
          yAxisLabelPrefix={props.yAxisPrefix}
          yAxisLabelSuffix={props.yAxisSuffix}
          noOfSections={props.sectionCount ?? 5}
          yAxisOffset={props.chartMin == undefined ? Math.max(0, minValue - (Math.pow(10, significantNumber) / 4)) : undefined}
          minValue={props.chartMin}
          maxValue={Math.max((maxValue - minValue + (Math.pow(10, significantNumber) / 4) > 1 ? Math.ceil(maxValue - minValue + (Math.pow(10, significantNumber) / 4)) : (maxValue - minValue + (Math.pow(10, significantNumber) / 4) )), props.chartMax ?? 0 ) }
        />
      </View>
      <View style={styles.spacerp75rem} />
      <View>
        <Text style={{ ...styles.cardText, ...styles.cardValue }}>Max : {props.yAxisPrefix}{max!.value}{props.yAxisSuffix} at {new Date(max!.timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}</Text>
        <Text style={{ ...styles.cardText, ...styles.cardValue }}>Mean: {props.yAxisPrefix}{meanValue.toFixed(2)}{props.yAxisSuffix}</Text>
        <Text style={{ ...styles.cardText, ...styles.cardValue }}>Min : {props.yAxisPrefix}{min!.value}{props.yAxisSuffix} at {new Date(min!.timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}</Text>
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
    fontSize: '0.75rem',
    fontFamily: 'UberMoveMono-Medium',
    lineHeight: '0.75rem',
    textAlign: 'left',
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