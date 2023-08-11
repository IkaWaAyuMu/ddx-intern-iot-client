import { Dimensions } from "react-native";
import { View, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { BarChart } from "react-native-chart-kit";

export function DetailCardGroup(props: {
  title: string,
  value: string | number,
  unit: string,
  chartUnit: string,
  color?: string,
  decimalPlaces?: number,
  data: {
    value: number,
    timestamp: string,
  }[]
}) {

  const weekData = props.data.slice(props.data.length - 7, 7);

  return (
    <View style={styles.cardGroup}>
      <View style={{ ...styles.background, backgroundColor: props.color ?? "#999999"}}/>
      <View style={styles.spacer1rem} />
      <Text style={{ ...styles.cardText, ...styles.cardTitle }}>{props.title}</Text>
      <View style={styles.spacerp75rem} />
      <Text style={{ ...styles.cardText, ...styles.cardValue }}>{props.value}</Text>
      <Text style={{ ...styles.cardText, ...styles.cardUnit }}>{props.unit}</Text>
      <View style={styles.spacerp75rem} />
      <BarChart 
        data={{
          labels: weekData.map(e => dayOfWeek(new Date(e.timestamp).getDay())),
          datasets: [{
            data: weekData.map((e) => (e.value)), 
          }],
        }}
        chartConfig={{
          backgroundGradientFromOpacity: 0,
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          decimalPlaces: props.decimalPlaces,
          barPercentage: 0.4,
          style: {
            borderRadius: 16
          },
        }}
        showValuesOnTopOfBars
        width={Dimensions.get("window").width * 0.73}
        height={200}
        yAxisSuffix={props.chartUnit}
        yAxisLabel={""}
        style={{
          backgroundColor: "#ffffff",
          marginBottom: 15,
          borderRadius: 5,
          borderWidth: 2,
          borderColor: '#e8e8e8',
        }}
      />
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