import { Text, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

export default function Bubble7d(props: {
  time?: (number | null)[], 
  y?: (number | null)[] | null | undefined,
  decimalPoints?: number,
}) {
  const { time, y, decimalPoints } = props;

  const children = [];

  for (const [i, v] of (y ?? []).entries()) {
    children.push(
    <View key={i}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          {v == null ? "-" : v.toFixed(decimalPoints ?? 0)}
        </Text>
      </View>
      <Text style={styles.timeText}>
        {DoWToText(new Date(time![i] ?? 0))}
      </Text>
    </View>
    )
  }

  return (
    <View style={{
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
    }}>
      {children}
    </View>
  )
}

function DoWToText(date: Date) {
  return date.toLocaleDateString([], {weekday: "short"}).slice(0, 3);
}

const styles = EStyleSheet.create({
  bubble: {
    width: 35,
    height: 35,
    borderRadius: "$infinity",
    backgroundColor: "$gray700",
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleText: {
    fontFamily: "UberMoveMono-Medium",
    textAlign: "center",
    fontSize: 10,
    color: "$white",
  },
  timeText: {
    fontFamily: "UberMoveText-Regular",
    textAlign: "center",
    fontSize: 8,
    color: "$white"
  }
})