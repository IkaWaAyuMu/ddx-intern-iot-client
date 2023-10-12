import { useState } from "react";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { LineChart } from "react-native-gifted-charts";
import { itemType } from "react-native-gifted-charts/src/LineChart/types";

export default function Graph24h(props: {
  time?: (number | null)[], 
  y?: ((number | null)[] | null | undefined)[],
  name?: (string | null)[]
  unit?: string,
  startFromZero?: boolean,
  decimalPoints?: number,
  sectionCount?: number,
}) {
  const { time, y, name, unit, startFromZero, decimalPoints, sectionCount } = props;
  var [containerWidth, setContainerWidth] = useState(0);

  

  const minValue = 
    (!startFromZero && y) ? 
    Math.min(
      ...(y[0] ?? []).map(e => e ? e : 0),
      ...(y[1] ?? []).map(e => e ? e : 0),
      ...(y[2] ?? []).map(e => e ? e : 0),
      ...(y[3] ?? []).map(e => e ? e : 0),
      ...(y[4] ?? []).map(e => e ? e : 0)
      ) 
    : 0;

  const maxValue =
    y ? 
    Math.max(
      ...(y[0] ?? []).map(e => e ? e : 0),
      ...(y[1] ?? []).map(e => e ? e : 0),
      ...(y[2] ?? []).map(e => e ? e : 0),
      ...(y[3] ?? []).map(e => e ? e : 0),
      ...(y[4] ?? []).map(e => e ? e : 0)
      ) 
    : 0;

  return (
  <View 
    style={{
      overflow: "hidden",
      width: "100%",
    }}
    onLayout={(e) => {setContainerWidth(e.nativeEvent.layout.width)}}
  >
    {unit && <Text style={styles.unitText}>{unit}</Text>}
    <LineChart 
      data={(y && y[0]) ? generateData(time, y[0], containerWidth) : undefined}
      data2={(y && y[1]) ? generateData(time, y[1], containerWidth) : undefined}
      data3={(y && y[2]) ? generateData(time, y[2], containerWidth) : undefined}
      data4={(y && y[3]) ? generateData(time, y[3], containerWidth) : undefined}
      data5={(y && y[4]) ? generateData(time, y[4], containerWidth) : undefined}

      showFractionalValues={(decimalPoints ?? 0) > 0}
      roundToDigits={decimalPoints ?? 0}

      mostNegativeValue ={startFromZero ? undefined : (minValue < 0 ? Math.floor((minValue - (Math.abs(maxValue-minValue) * 0.1)) * Math.pow(10, decimalPoints ?? 0)) / Math.pow(10, decimalPoints ?? 0) : undefined)}
      yAxisOffset={startFromZero ? undefined : (minValue > 0 ? Math.floor((minValue - (Math.abs(maxValue-minValue) * 0.1)) * Math.pow(10, decimalPoints ?? 0)) / Math.pow(10, decimalPoints ?? 0) : undefined)}
      maxValue={(Math.ceil((maxValue + (Math.abs(maxValue-minValue) * 0.1)) * Math.pow(10, decimalPoints ?? 0)) / Math.pow(10, decimalPoints ?? 0)) - (startFromZero ? 0 : (minValue > 0 ? Math.floor((minValue - (Math.abs(maxValue-minValue) * 0.1)) * Math.pow(10, decimalPoints ?? 0)) / Math.pow(10, decimalPoints ?? 0) : 0))}
      noOfSections={sectionCount ?? 5}
      noOfSectionsBelowXAxis={(startFromZero ? false : (minValue < 0 ? true : false)) ? sectionCount ?? 5 : undefined }

      textShiftY={-5}

      color1="#ffffff"
      color2="#ff0000"
      color3="#00ff00"
      color4="#0000ff"
      color5="#ffff00"

      xAxisThickness={(startFromZero ? 0 : (minValue < 0 ? 1 : 0))}
      xAxisColor="#ffffff"
      yAxisColor="#ffffff"
      yAxisTextStyle={{
        fontFamily: "UberMoveMono-Medium",
        color: "#ffffff",
        fontSize: 8,
      }}
      rulesColor="#ffffff40"
      hideDataPoints
      verticalLinesThickness={0.5}

      height={128/(startFromZero ? 1 : (minValue < 0 ? 2 : 1))}
      
      width={containerWidth}
      initialSpacing={0}
      spacing={(containerWidth-32)/50}
      endSpacing={0}
      
    />
    <View style={{
      flexDirection: "row",
      alignContent: "center",
      justifyContent: "space-around",
    }}>
      {props.name && props.name[0] && <View style={{
        flexDirection: "row",
        gap: 4,
      }}>
        <View style={{...styles.nameColor, backgroundColor: "#ffffff"}}/>
        <Text style={styles.nameText}>{props.name[0]}</Text>
      </View>}
      {props.name && props.name[1] && <View style={{
        flexDirection: "row",
        gap: 4,
      }}>
        <View style={{...styles.nameColor, backgroundColor: "#ff0000"}}/>
        <Text style={styles.nameText}>{props.name[1]}</Text>
      </View>}
      {props.name && props.name[2] && <View style={{
        flexDirection: "row",
        gap: 4,
      }}>
        <View style={{...styles.nameColor, backgroundColor: "#00ff00"}}/>
        <Text style={styles.nameText}>{props.name[2]}</Text>
      </View>}
      {props.name && props.name[3] && <View style={{
        flexDirection: "row",
        gap: 4,
      }}>
        <View style={{...styles.nameColor, backgroundColor: "#0000ff"}}/>
        <Text style={styles.nameText}>{props.name[3]}</Text>
      </View>}
      {props.name && props.name[4] && <View style={{
        flexDirection: "row",
        gap: 4,
      }}>
        <View style={{...styles.nameColor, backgroundColor: "#ffff00"}}/>
        <Text style={styles.nameText}>{props.name[4]}</Text>
      </View>}
    </View>
  </View>)
}

function generateData(
  time?: (number | null)[], 
  y?: (number | null)[],
  containerWidth?: number,
  ): itemType[] {
    return ( y ?
      y.map((e,i) => {return {
        value: e ?? 0,
        showVerticalLine: (i == 0 ||  i%Math.round((y.length-1)/4) == 0 || i == y.length-1),
        
        labelComponent: () =>
          ((i == 0 ||  i%Math.round((y.length-1)/4) == 0 || i == y.length-1) && time && time[i]) ? 
            <Text style={{transform:[{translateY: -20}, {translateX: i == 0 ? (containerWidth ?? 0)/60 + (containerWidth ?? 0)/70 : i == y.length-1 ? (containerWidth ?? 0)/160 : (containerWidth ?? 0)/28 }, {scale: 4}],fontSize:2, color: "white", overflow: "visible"}}>{new Date(time[i] ?? 0).toLocaleTimeString([], {hour12:false, hour: "2-digit", minute: "2-digit"})}</Text> :
            undefined
      }}) : 
      [{value: 0}]
    )
  }

const styles = EStyleSheet.create({
  unitText: {
    width: "4.5rem",
    textAlign: "center",
    paddingBottom: "0.25rem",
    fontFamily: "UberMoveText-Light",
    fontSize: "0.75rem",
    color: "$white",
  },
  nameColor: {
    height: "0.5rem",
    width: "0.5rem",
  },
  nameText: {
    fontFamily: "UberMoveText-Regular",
    fontSize: "0.5rem",
    color: "$white"
  }
});