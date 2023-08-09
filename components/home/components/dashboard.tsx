import { useEffect, useState } from "react";
import { View, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

export function DashboardBrief(props: { description: string }) {

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const interval = setInterval(() => { setCurrentTime(new Date()) }, 1000);
    return () => clearInterval(interval);
  }, [setCurrentTime]);

  return (
    <View style={styles.dashboardBrief}>
      <Text style={styles.timeText}>{zeroPad(currentTime.getHours(), 2)}:{zeroPad(currentTime.getMinutes(),2)}</Text>
      <Text style={styles.dateText}>{currentTime.toLocaleDateString(undefined,{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</Text>
    </View>
  )
}

export function DashboardCardGroup(props: { data: { title: string, value: string | number, unit: string, color?: string, large: boolean }[] }) {
  return (
    <View style={styles.dashboardCardGroup}>
      {props.data.map((item, index) => (<DashboardCard data={item} key={index} />))}
    </View>
  )
}

export function DashboardCard(props: {data: { title: string, value: string | number, unit: string, color?: string, large: boolean }}) {
  return (
    <View style={props.data.large ? styles.dashboardCardLarge : styles.dashboardCardSmall}>
      <View style={{backgroundColor: props.data.color, ...styles.dashboardCardHeader}}><Text style={styles.dashboardCardHeaderText}>{props.data.title}</Text></View>
      <View style={{backgroundColor: props.data.color, ...styles.dashboardCardBody}}>
        <Text style={props.data.large ? styles.dashboardCardBodyTextLarge : styles.dashboardCardBodyTextSmall}>{props.data.value}</Text>
        <Text style={props.data.large ? styles.dashboardCardUnitTextLarge : styles.dashboardCardUnitTextSmall}>{props.data.unit}</Text>
      </View>
    </View>
  )
}
const styles = EStyleSheet.create({
  dashboardBrief: {
    alignItems: 'center',
  },
  timeText: {
    fontFamily: 'UberMoveText-Medium',
    fontSize: '3rem',
  },
  dateText: {
    fontFamily: 'UberMoveText-Medium',
    fontSize: '0.75rem',
  },
  dashboardCardGroup: {
    padding: "0.63rem",
    flexWrap: 'wrap',
    flexDirection: 'row',
    rowGap: '0.9rem',
    columnGap: '0.5rem',
  },
  dashboardCardLarge: {
    flex: 0,
    height: '7.81rem',
    width: '12rem',
    borderWidth: '0.125rem',
    borderColor: '#808080',
    overflow: 'hidden',
  },
  dashboardCardSmall: {
    flex: 0,
    height: '7.81rem',
    width: '5.75rem',
    borderWidth: '0.125rem',
    borderColor: '#808080',
    overflow: 'hidden',
  },
  dashboardCardHeader: {
    height: '1.875rem',
    marginBottom: '0.3rem',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardCardHeaderText: {
    fontFamily: 'UberMoveText-Medium',
    fontSize: '1.25rem',
    lineHeight: '2rem',
  },
  dashboardCardBody: {
    height: '5.625rem',
    marginBottom: '0.3rem',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardCardBodyTextLarge: {
    fontFamily: 'UberMoveMono-Medium',
    fontSize: '3rem',
    lineHeight: '3rem',
  },
  dashboardCardUnitTextLarge: {
    fontFamily: 'UberMoveText-Light',
    fontSize: '1.25rem',
    lineHeight: '1.5rem',
  },
  dashboardCardBodyTextSmall: {
    fontFamily: 'UberMoveMono-Medium',
    fontSize: '1.5rem',
    lineHeight: '1.5rem',
  },
  dashboardCardUnitTextSmall: {
    fontFamily: 'UberMoveText-Light',
    fontSize: '0.625rem',
    lineHeight: '1rem',
  }
})