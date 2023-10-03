import { Stack, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ImageBackground,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CircularProgress } from "react-native-circular-progress";
import EStyleSheet from "react-native-extended-stylesheet";
import CalculateAQI from "../../../../../components/calculateAQI";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import calculateHeatIndex from "../../../../../components/calculateHeatIndex";
import calculatePMV from "../../../../../components/calculatePMV";
import { useState } from "react";

import InfoModal from "../../../../../components/infoModal";
import AQIInfo from "../../../../../assets/information/aqi.json";
import TemperatureInfo from "../../../../../assets/information/temperature.json";
import HumidityInfo from "../../../../../assets/information/relative_humidity.json";
import ApparentTemperatureInfo from "../../../../../assets/information/apparent_temperature.json";
import PMInfo from "../../../../../assets/information/pm.json";

import IndoorBounds from "../../../../../assets/indoorBounds.json";
import IndoorParamsFavor from "../../../../../components/indoorParamsFavor";

export default function Page() {
  const headerHeight = useHeaderHeight();

  const localSearchParams = useLocalSearchParams();
  const { deveui, name, image } = localSearchParams;

  return (
    <View style={{ ...styles.overlayContainer, paddingTop: headerHeight + 8 }}>
      <Stack.Screen
        options={{
          title: name?.toString(),
          headerRight: () => (
            <Pressable>
              <Text style={styles.headerRightText}>More</Text>
            </Pressable>
          ),
        }}
      />
      <ImageBackground
        source={{
          uri:
            image?.toString() ??
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/1920px-Question_mark_%28black%29.svg.png",
        }}
        style={styles.containerImageOverlay}
      />
      <View style={styles.containerImageOverlay} />
      <ScrollView style={styles.scrollViewContainer}>
        <OverallAQI />
        <Thermal />
        <AirQuality />
      </ScrollView>
    </View>
  );
}

function OverallAQI(props: { pm2_5?: number; pm10?: number }) {
  const { pm2_5, pm10 } = props;
  const aqi = CalculateAQI({ pm2_5, pm10 });

  const [isAQIModalOpen, setIsAQIModalOpen] = useState<boolean>(false);

  return (
    <>
    <InfoModal info={AQIInfo} isOpen={isAQIModalOpen} closeCallback={() => setIsAQIModalOpen(false)}/>
    <View style={styles.elementContainer}>
      <Text style={styles.aqiValueText}>
        {pm2_5 != null || pm10 != null ? aqi.aqi : "-"}
      </Text>
      <View style={styles.aqiLabelContainer}>
        <FontAwesome
          name={
            aqi.aqi <= 50 ? "smile-o" : aqi.aqi <= 100 ? "meh-o" : "frown-o"
          }
          size={25}
          color="#fff"
        />
        <Text style={styles.aqiLabelText}>AQI</Text>
        <Pressable onPress={() => setIsAQIModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
      </View>
      <View
        style={{ ...styles.aqiColorIndicator, backgroundColor: aqi.color }}
      />
    </View>
    </>
  );
}

function Thermal(props: { temperature?: number; humidity?: number }) {
  const { temperature, humidity } = props;

  const [isTemperatureModalOpen, setIsTemperatureModalOpen] = useState<boolean>(false);
  const [isHumidityModalOpen, setIsHumidityModalOpen] = useState<boolean>(false);
  const [isApparentTemperatureModalOpen, setIsApparentTemperatureModalOpen] = useState<boolean>(false);

  const heatIndex =
    temperature != null && humidity != null
      ? calculateHeatIndex(temperature, humidity)
      : NaN;
  const pmv =
    temperature != null && humidity != null
      ? calculatePMV(temperature, temperature, 0, humidity, 1.2, 0.57).pmv
      : 0;

  return (
    <>
      <InfoModal info={TemperatureInfo} isOpen={isTemperatureModalOpen} closeCallback={() => setIsTemperatureModalOpen(false)}/>
      <InfoModal info={HumidityInfo} isOpen={isHumidityModalOpen} closeCallback={() => setIsHumidityModalOpen(false)}/>
      <InfoModal info={ApparentTemperatureInfo} isOpen={isApparentTemperatureModalOpen} closeCallback={() => setIsApparentTemperatureModalOpen(false)}/>
      <View style={styles.thermalContainer}>
        <View style={styles.elementContainer}>
          {/* Temperature */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemHeaderText}>Temperature</Text>
            <Text style={styles.itemValueText}>
              {temperature != null ? temperature.toFixed(0) : "-"}°C
            </Text>
            <Pressable style={styles.infoModalButton} onPress={() => setIsTemperatureModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
          </View>
          {/* Relative Humidity */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemHeaderText}>Relative Humidity</Text>
            <Text style={styles.itemValueText}>
              {humidity != null ? humidity.toFixed(0) : "-"}%
            </Text>
            <Pressable style={styles.infoModalButton} onPress={() => setIsHumidityModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
          </View>
        </View>
        {/* Apparent Temperature */}
        <View style={styles.elementContainer}>
          <View style={styles.itemContainer}>
            <Text style={styles.itemHeaderText}>Apparent Temperature</Text>
            <Text style={styles.itemValueText}>
              {!isNaN(heatIndex) ? heatIndex.toFixed(0) : "-"}°C
            </Text>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              colors={["#1948a3", "#77b71c", "#950f22"]}
              end={{ x: 1, y: 0 }}
              style={styles.pmvIndicatorContainer}
            >
              <View
                style={{
                  ...styles.pmvIndicator,
                  left: `${
                    50 +
                    Math.min(Math.abs(pmv), 3) * (pmv < 0 ? -1 : 1) * (50 / 3)
                  }%`,
                }}
              />
            </LinearGradient>
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>
                {"Haha"}
              </Text>
            </View>
            <Pressable style={styles.infoModalButton} onPress={() => setIsApparentTemperatureModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

function AirQuality(props: { pm2_5?: number; pm10?: number, co2?: number, tvoc?: number, hcho?: number }) {
  const { pm2_5, pm10, co2, tvoc, hcho } = props;

  // TODO: TVOC

  const [isPMModalOpen, setIsPMModalOpen] = useState<boolean>(false);
  const [isCO2ModalOpen, setIsCO2ModalOpen] = useState<boolean>(false);

  const [isHCHOModalOpen, setIsHCHOModalOpen] = useState<boolean>(false);

  const pm2_5favor = IndoorParamsFavor({pm2_5});
  const pm10favor = IndoorParamsFavor({pm10});
  const co2favor = IndoorParamsFavor({co2});

  const hchofavor = IndoorParamsFavor({hcho});

  return (
    <>
      <InfoModal info={PMInfo} isOpen={isPMModalOpen} closeCallback={() => setIsPMModalOpen(false)}/>
      <InfoModal info={PMInfo} isOpen={isCO2ModalOpen} closeCallback={() => setIsCO2ModalOpen(false)}/>

      <InfoModal info={PMInfo} isOpen={isHCHOModalOpen} closeCallback={() => setIsHCHOModalOpen(false)}/>
      <View style={styles.elementContainer}>
        {/* PM 2.5/ PM10 */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemHeaderText}>Particulate Matter</Text>
          <View style={styles.itemValueContainer}>
            {/* PM 2.5 */}
            <Gauge headerText="PM2.5" value={pm2_5} maxValue={IndoorBounds.pm2_5.upperBounds[IndoorBounds.pm2_5.upperBounds.length-1]} unit="μg/m³" color={pm2_5favor.color} favorText={pm2_5favor.level}/>
            {/* PM 10 */}
            <Gauge headerText="PM10" value={pm10} maxValue={IndoorBounds.pm10.upperBounds[IndoorBounds.pm10.upperBounds.length-1]} unit="μg/m³" color={pm10favor.color} favorText={pm10favor.level}/>
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>{"Haha"}</Text>
            </View>
          </View>
          <Pressable style={styles.infoModalButton} onPress={() => setIsPMModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
        </View>
        {/* CO2 */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemHeaderText}>Carbon Dioxide</Text>
          <View style={styles.itemValueContainer}>
            <Gauge headerText="CO2" value={co2} maxValue={IndoorBounds.co2.upperBounds[IndoorBounds.co2.upperBounds.length-1]} unit="ppm" color={co2favor.color} favorText={co2favor.level}/>
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>{"Haha"}</Text>
            </View>
          </View>
          <Pressable style={styles.infoModalButton} onPress={() => setIsCO2ModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
        </View>
        {/* TVOC */}
        {/* HCHO */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemHeaderText}>Formaldehyde</Text>
          <View style={styles.itemValueContainer}>
            <Gauge headerText="HCHO" value={hcho} maxValue={IndoorBounds.hcho.upperBounds[IndoorBounds.hcho.upperBounds.length-1]} unit="ppb" color={hchofavor.color} favorText={hchofavor.level}/>
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>{"Haha"}</Text>
            </View>
          </View>
          <Pressable style={styles.infoModalButton} onPress={() => setIsHCHOModalOpen(true)}><Feather name="info" size={15} color="#fff"/></Pressable>
        </View>
      </View>
    </>
  );
}

function Gauge(props: {headerText?: string, minValue?: number, value?: number, maxValue?: number, unit?: string, color?: string, favorText?: string }) {
  const { headerText, minValue, value, maxValue, unit, color, favorText } = props;
  return (
  <View style={styles.gaugeContainer}>
    <Text style={styles.gaugeHeaderText}>{headerText}</Text>
    <View>
      <CircularProgress
        size={75}
        width={10}
        backgroundWidth={8}
        arcSweepAngle={270}
        rotation={-135}
        tintColor={color}
        backgroundColor="#28282880"
        fill={((value ?? 0)-(minValue ?? 0))/((maxValue ?? 1)-(minValue ?? 0))*100}
      />
      <View style={styles.gaugeValueContainer}>
        <Text style={{...styles.gaugeValueText, color}}>{value != null ? value.toLocaleString() : "-"}</Text>
        <Text style={styles.gaugeUnitText}>{unit}</Text>
      </View>
    </View>
    <Text style={{...styles.gaugeHeaderText, color}}>{favorText}</Text>
  </View>
  )
}
const styles = EStyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: "$backgroundColor",
    alignItems: "stretch",
    justifyContent: "center",
  },
  containerImageOverlay: {
    ...EStyleSheet.absoluteFillObject,
    backgroundColor: "$black_overlay",
  },
  headerRightText: {
    color: "$white",
    fontSize: "1rem",
    fontFamily: "UberMoveText-Light",
  },
  scrollViewContainer: {
    paddingHorizontal: "1rem",
    flex: 1,
    gap: "0.5rem",
  },
  elementContainer: {
    paddingVertical: "0.5rem",
    gap: "0.5rem",
    flex: 1,
  },
  aqiValueText: {
    color: "$white",
    fontSize: "6.25rem",
    fontFamily: "UberMoveMono-Medium",
    textAlign: "center",
  },
  aqiLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  aqiLabelText: {
    color: "$white",
    fontSize: "1.875rem",
    fontFamily: "UberMove-Bold",
    textAlign: "center",
  },
  aqiColorIndicator: {
    height: "0.5rem",
    borderRadius: "$infinity",
    margin: "0.5rem",
  },
  thermalContainer: {
    paddingVertical: "0.5rem",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  pmvIndicatorContainer: {
    height: "0.5rem",
    borderRadius: "$infinity",
    overflow: "hidden",
    paddingRight: "0.5rem",
  },
  pmvIndicator: {
    position: "absolute",
    height: "0.5rem",
    width: "0.5rem",
    borderRadius: "$infinity",
    backgroundColor: "$white",
    borderColor: "$black",
    borderWidth: "0.0625rem",
    overflow: "hidden",
  },
  itemContainer: {
    borderRadius: "0.5rem",
    backgroundColor: "$gray400_half",
    padding: "0.5rem",
    gap: "0.25rem",
    overflow: "hidden",
    flex: 1,
  },
  itemHeaderText: {
    color: "$white",
    fontSize: "0.9375rem",
    fontFamily: "UberMove-Bold",
  },
  itemValueText: {
    color: "$white",
    fontSize: "2.25rem",
    fontFamily: "UberMoveMono-Medium",
    textAlign: "center",
  },
  itemValueDescriptionContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemValueDescriptionText: {
    color: "$white",
    fontSize: "0.625rem",
    fontFamily: "UberMoveText-Light",
  },
  itemValueContainer: {
    flexDirection: "row",
    gap: '0.6rem'
  },
  gaugeContainer: {
    width: 75,
  },
  gaugeValueContainer: {
    ...EStyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeHeaderText: {
    color: "$white",
    fontSize: "0.625rem",
    fontFamily: "UberMoveText-Medium",
    textAlign: "center",
  },
  gaugeValueText: {
    color: "$white",
    fontSize: "1.125rem",
    fontFamily: "UberMoveMono-Medium",
  },
  gaugeUnitText: {
    position: 'absolute',
    bottom: '0.5rem',
    color: "$white",
    fontSize: "0.3125rem",
    fontFamily: "UberMoveText-Light",
  },
  infoModalButton: {
    position: "absolute",
    top: 10,
    right: 8,
  }
});
