import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ImageBackground,
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CircularProgress } from "react-native-circular-progress";
import EStyleSheet from "react-native-extended-stylesheet";
import CalculateAQI from "../../../../../components/calculateAQI";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import calculateHeatIndex from "../../../../../components/calculateHeatIndex";
import { calculatePMVBasic } from "../../../../../components/calculatePMV";
import { useCallback, useEffect, useState } from "react";

import InfoModal from "../../../../../components/infoModal";
import AQIInfo from "../../../../../assets/information/aqi.json";
import TemperatureInfo from "../../../../../assets/information/temperature.json";
import HumidityInfo from "../../../../../assets/information/relative_humidity.json";
import ApparentTemperatureInfo from "../../../../../assets/information/apparent_temperature.json";
import PMInfo from "../../../../../assets/information/pm.json";
import CO2Info from "../../../../../assets/information/co2.json";
import TVOCInfo from "../../../../../assets/information/tvoc.json";

import IndoorBounds from "../../../../../assets/bounds/indoorBounds.json";
import IndoorParamsFavor from "../../../../../components/indoorParamsFavor";
import { DownsampledMSD18Data } from "../../../../graphql/API";
import { QueryAll } from "../../../../graphql/customQueries";
import Graph24h from "../../../../../components/graph24h";
import Bubble7d from "../../../../../components/bubble7d";

export default function Page() {
  const headerHeight = useHeaderHeight();

  const localSearchParams = useLocalSearchParams();
  const { id, name, image } = localSearchParams;

  const [data, setData] = useState<Partial<DownsampledMSD18Data> | null>(null);
  const [data24h, setData24h] = useState<Partial<DownsampledMSD18Data> | null>(
    null
  );
  const [data7d, setData7d] = useState<Partial<DownsampledMSD18Data> | null>(
    null
  );
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  const [is24hShown, setIs24hShown] = useState<boolean>(false);
  const [is7dShown, setIs7dShown] = useState<boolean>(false);

  const fetchData = async () => {
    setIsDataLoading(true);
    const temp = await QueryAll("MSD18", {
      id: id!.toString(),
      frequency: "1m",
      range: {
        interval: "2m",
      },
    });
    setData(
      temp.result[0] && temp.result[0].time.length > 0 ? temp.result[0] : data
    );
    setIsDataLoading(false);
  };

  const fetchData24h = async () => {
    setIsDataLoading(true);
    const temp = await QueryAll("MSD18", {
      id: id!.toString(),
      frequency: "30m",
      range: {
        interval: "25h",
      },
    });
    setData24h(
      temp.result[0] && temp.result[0].time.length > 0 ? temp.result[0] : data
    );
    setIsDataLoading(false);
  };

  const fetchData7d = async () => {
    setIsDataLoading(true);
    const temp = await QueryAll("MSD18", {
      id: id!.toString(),
      frequency: "1d",
      range: {
        interval: "8d",
      },
    });
    setData7d(
      temp.result[0] && temp.result[0].time.length > 0 ? temp.result[0] : data
    );
    setIsDataLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchData24h();
    fetchData7d();
  }, [setData, setIsDataLoading]);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(fetchInterval);
  }, [setData, setIsDataLoading]);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      fetchData24h();
    }, 3600000);
    return () => clearInterval(fetchInterval);
  }, [setData, setIsDataLoading]);

  const onRefresh = useCallback(() => {
    fetchData();
    fetchData24h();
    fetchData7d();
  }, [setData, setIsDataLoading]);

  return (
    <View style={{ ...styles.overlayContainer, paddingTop: headerHeight + 8 }}>
      <Stack.Screen
        options={{
          title: name?.toString(),
          headerRight: () => (
            <Link href={`/MSD18/${id!}/historic?image=${image}&name=${name}`} asChild>
              <Pressable>
                <Text style={styles.headerRightText}>More</Text>
              </Pressable>
            </Link>
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
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollViewContentContainer}
        refreshControl={
          <RefreshControl refreshing={isDataLoading} onRefresh={onRefresh} />
        }
      >
        <OverallAQI
          pm2_5={
            data && data.pm2_5 != null
              ? data.pm2_5.findLast((e) => e != null) ?? undefined
              : undefined
          }
          pm10={
            data && data.pm10 != null
              ? data.pm10!.findLast((e) => e != null) ?? undefined
              : undefined
          }
        />
        <Thermal
          temperature={
            data && data.temperature != null
              ? data.temperature!.findLast((e) => e != null) ?? undefined
              : undefined
          }
          humidity={
            data && data.humidity != null
              ? data.humidity!.findLast((e) => e != null) ?? undefined
              : undefined
          }
        />
        <AirQuality
          pm2_5={
            data && data.pm2_5 != null
              ? data.pm2_5!.findLast((e) => e != null) ?? undefined
              : undefined
          }
          pm10={
            data && data.pm10 != null
              ? data.pm10!.findLast((e) => e != null) ?? undefined
              : undefined
          }
          co2={
            data && data.co2 != null
              ? data.co2!.findLast((e) => e != null) ?? undefined
              : undefined
          }
          tvoc={
            data && data.tvoc != null
              ? data.tvoc!.findLast((e) => e != null) ?? undefined
              : undefined
          }
        />
        <View style={{ height: 8 }} />
        <Pressable
          onPress={() => setIs24hShown(!is24hShown)}
          style={{ flexDirection: "row", gap: 5, alignContent: "center" }}
        >
          <FontAwesome
            name={is24hShown ? "caret-down" : "caret-right"}
            size={20}
            color="#fff"
          />
          <Text
            style={{
              color: "white",
              fontSize: 15,
              fontFamily: "UberMoveText-Regular",
            }}
          >
            Past 24 hours
          </Text>
        </Pressable>
        {is24hShown && <Data24h data24h={data24h} />}
        <View style={{ height: 8 }} />
        <Pressable
          onPress={() => setIs7dShown(!is7dShown)}
          style={{ flexDirection: "row", gap: 5, alignContent: "center" }}
        >
          <FontAwesome
            name={is7dShown ? "caret-down" : "caret-right"}
            size={20}
            color="#fff"
          />
          <Text
            style={{
              color: "white",
              fontSize: 15,
              fontFamily: "UberMoveText-Regular",
            }}
          >
            Past 7 days
          </Text>
        </Pressable>
        {is7dShown && <Data7d data7d={data7d} />}
        <View style={{ height: 16 }} />
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
      <InfoModal
        info={AQIInfo}
        isOpen={isAQIModalOpen}
        closeCallback={() => setIsAQIModalOpen(false)}
      />
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
          <Pressable onPress={() => setIsAQIModalOpen(true)}>
            <Feather name="info" size={15} color="#fff" />
          </Pressable>
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

  const [isTemperatureModalOpen, setIsTemperatureModalOpen] =
    useState<boolean>(false);
  const [isHumidityModalOpen, setIsHumidityModalOpen] =
    useState<boolean>(false);
  const [isApparentTemperatureModalOpen, setIsApparentTemperatureModalOpen] =
    useState<boolean>(false);

  const heatIndex =
    temperature != null && humidity != null
      ? calculateHeatIndex(temperature, humidity)
      : NaN;
  const pmv =
    temperature != null && humidity != null
      ? calculatePMVBasic(temperature, humidity).pmv
      : 0;

  const pmvfavor = IndoorParamsFavor({ pmv });

  return (
    <>
      <InfoModal
        info={TemperatureInfo}
        isOpen={isTemperatureModalOpen}
        closeCallback={() => setIsTemperatureModalOpen(false)}
      />
      <InfoModal
        info={HumidityInfo}
        isOpen={isHumidityModalOpen}
        closeCallback={() => setIsHumidityModalOpen(false)}
      />
      <InfoModal
        info={ApparentTemperatureInfo}
        isOpen={isApparentTemperatureModalOpen}
        closeCallback={() => setIsApparentTemperatureModalOpen(false)}
      />
      <View style={styles.thermalContainer}>
        <View style={styles.elementContainer}>
          {/* Temperature */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemHeaderText}>Temperature</Text>
            <Text style={styles.itemValueText}>
              {temperature != null ? temperature.toFixed(0) : "-"}°C
            </Text>
            <Pressable
              style={styles.infoModalButton}
              onPress={() => setIsTemperatureModalOpen(true)}
            >
              <Feather name="info" size={15} color="#fff" />
            </Pressable>
          </View>
          {/* Relative Humidity */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemHeaderText}>Relative Humidity</Text>
            <Text style={styles.itemValueText}>
              {humidity != null ? humidity.toFixed(0) : "-"}%
            </Text>
            <Pressable
              style={styles.infoModalButton}
              onPress={() => setIsHumidityModalOpen(true)}
            >
              <Feather name="info" size={15} color="#fff" />
            </Pressable>
          </View>
        </View>
        {/* Apparent Temperature */}
        <View style={styles.elementContainer}>
          <View style={styles.itemContainer}>
            <Text style={styles.itemHeaderText}>Apparent Temperature</Text>
            <Text style={styles.itemValueText}>
              {!isNaN(heatIndex) ? heatIndex.toFixed(0) : "-"}°C
            </Text>
            <View style={styles.pmvIndicatorContainer}>
              <FontAwesome name="snowflake-o" size={8} color="#6daafb" />
              <LinearGradient
                start={{ x: 0, y: 0 }}
                colors={["#187bfd", "#5be8f2", "#47ef5a", "#f6e686", "#fe0000"]}
                end={{ x: 1, y: 0 }}
                style={styles.pmvIndicatorGradient}
              >
                <View
                  style={{
                    ...styles.pmvIndicator,
                    left: `${
                      50 +
                      Math.min(Math.abs(pmv), 1.5) *
                        (pmv < 0 ? -1 : 1) *
                        (50 / 1.5)
                    }%`,
                  }}
                />
              </LinearGradient>
              <FontAwesome name="sun-o" size={8} color="#fc7f79" />
            </View>
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>
                {pmvfavor.recommendation}
              </Text>
            </View>
            <Pressable
              style={styles.infoModalButton}
              onPress={() => setIsApparentTemperatureModalOpen(true)}
            >
              <Feather name="info" size={15} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

function AirQuality(props: {
  pm2_5?: number;
  pm10?: number;
  co2?: number;
  tvoc?: number;
}) {
  const { pm2_5, pm10, co2, tvoc } = props;

  const [isPMModalOpen, setIsPMModalOpen] = useState<boolean>(false);
  const [isCO2ModalOpen, setIsCO2ModalOpen] = useState<boolean>(false);
  const [isTVOCModalOpen, setIsTVOCModalOpen] = useState<boolean>(false);

  const pm2_5favor = IndoorParamsFavor({ pm2_5 });
  const pm10favor = IndoorParamsFavor({ pm10 });
  const co2favor = IndoorParamsFavor({ co2 });
  const tvocfavor = IndoorParamsFavor({ tvoc });

  return (
    <>
      <InfoModal
        info={PMInfo}
        isOpen={isPMModalOpen}
        closeCallback={() => setIsPMModalOpen(false)}
      />
      <InfoModal
        info={CO2Info}
        isOpen={isCO2ModalOpen}
        closeCallback={() => setIsCO2ModalOpen(false)}
      />
      <InfoModal
        info={TVOCInfo}
        isOpen={isTVOCModalOpen}
        closeCallback={() => setIsTVOCModalOpen(false)}
      />
      <View style={styles.elementContainer}>
        {/* PM 2.5/ PM10 */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemHeaderText}>Particulate Matter</Text>
          <View style={styles.itemValueContainer}>
            {/* PM 2.5 */}
            <Gauge
              headerText="PM2.5"
              value={pm2_5}
              maxValue={
                IndoorBounds.pm2_5.upperBounds[
                  IndoorBounds.pm2_5.upperBounds.length - 1
                ]
              }
              unit={IndoorBounds.pm2_5.unit}
              color={pm2_5favor.color}
              favorText={pm2_5favor.level}
            />
            {/* PM 10 */}
            <Gauge
              headerText="PM10"
              value={pm10}
              maxValue={
                IndoorBounds.pm10.upperBounds[
                  IndoorBounds.pm10.upperBounds.length - 1
                ]
              }
              unit={IndoorBounds.pm10.unit}
              color={pm10favor.color}
              favorText={pm10favor.level}
            />
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>
                {pm2_5favor.index > pm10favor.index
                  ? pm2_5favor.recommendation
                  : pm10favor.recommendation}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.infoModalButton}
            onPress={() => setIsPMModalOpen(true)}
          >
            <Feather name="info" size={15} color="#fff" />
          </Pressable>
        </View>
        {/* CO2 */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemHeaderText}>Carbon Dioxide</Text>
          <View style={styles.itemValueContainer}>
            <Gauge
              value={co2}
              maxValue={
                IndoorBounds.co2.upperBounds[
                  IndoorBounds.co2.upperBounds.length - 1
                ]
              }
              unit={IndoorBounds.co2.unit}
              color={co2favor.color}
              favorText={co2favor.level}
            />
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>
                {co2favor.recommendation}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.infoModalButton}
            onPress={() => setIsCO2ModalOpen(true)}
          >
            <Feather name="info" size={15} color="#fff" />
          </Pressable>
        </View>
        {/* TVOCs */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemHeaderText}>
            Total Volatile Organic Compounds
          </Text>
          <View style={styles.itemValueContainer}>
            <Gauge
              value={tvoc}
              maxValue={
                IndoorBounds.tvoc.upperBounds[
                  IndoorBounds.tvoc.upperBounds.length - 1
                ]
              }
              unit={IndoorBounds.tvoc.unit}
              color={tvocfavor.color}
              favorText={tvocfavor.level}
            />
            <View style={styles.itemValueDescriptionContainer}>
              <Text style={styles.itemValueDescriptionText}>
                {tvocfavor.recommendation}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.infoModalButton}
            onPress={() => setIsTVOCModalOpen(true)}
          >
            <Feather name="info" size={15} color="#fff" />
          </Pressable>
        </View>
      </View>
    </>
  );
}

function Gauge(props: {
  headerText?: string;
  minValue?: number;
  value?: number;
  maxValue?: number;
  unit?: string;
  color?: string;
  favorText?: string;
}) {
  const { headerText, minValue, value, maxValue, unit, color, favorText } =
    props;
  return (
    <View style={styles.gaugeContainer}>
      {headerText != null && (
        <Text style={styles.gaugeHeaderText}>{headerText}</Text>
      )}
      <View>
        <CircularProgress
          size={60}
          width={10}
          backgroundWidth={8}
          arcSweepAngle={270}
          rotation={-135}
          tintColor={color}
          backgroundColor="#4b4b4b"
          fill={
            (((value ?? 0) - (minValue ?? 0)) /
              ((maxValue ?? 1) - (minValue ?? 0))) *
            100
          }
        />
        <View style={styles.gaugeValueContainer}>
          <Text style={{ ...styles.gaugeValueText, color }}>
            {value != null ? value.toLocaleString() : "-"}
          </Text>
          <Text style={styles.gaugeUnitText}>{unit}</Text>
        </View>
      </View>
      <Text style={{ ...styles.gaugeHeaderText, color }}>{favorText}</Text>
    </View>
  );
}

function Data24h(props: { data24h: Partial<DownsampledMSD18Data> | null }) {
  const { time, temperature, humidity, pm2_5, pm10, co2, tvoc } =
    props.data24h ?? {};
  const timemillis = (time ?? []).map((e) => (e ? e * 1000 : null));

  return (
    <View style={styles.elementContainer}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{TemperatureInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data24h && (
            <Graph24h
              time={timemillis}
              y={[
                temperature?.slice(-49),
                temperature
                  ?.map((e, i) => calculateHeatIndex(e!, humidity![i]!))
                  .slice(-49),
              ]}
              name={["Temperature", "Apparent Temperature"]}
              unit={"°C"}
              decimalPoints={0}
            />
          )}
        </View>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{HumidityInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data24h && (
            <Graph24h
              time={timemillis}
              y={[humidity?.slice(-49)]}
              unit={"%"}
              decimalPoints={0}
            />
          )}
        </View>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>Predicted Mean Vote</Text>
        <View style={styles.itemValueContainer}>
          {props.data24h && (
            <Graph24h
              time={timemillis}
              y={[
                temperature
                  ?.map((e, i) => calculatePMVBasic(e!, humidity![i]!).pmv)
                  .slice(-49),
              ]}
              decimalPoints={1}
              sectionCount={3}
            />
          )}
        </View>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{PMInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data24h && (
            <Graph24h
              time={timemillis}
              y={[pm2_5?.slice(-49), pm10?.slice(-49)]}
              name={["PM2.5", "PM10"]}
              unit={IndoorBounds.pm2_5.unit}
              startFromZero
              decimalPoints={0}
            />
          )}
        </View>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{CO2Info.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data24h && (
            <Graph24h time={timemillis} y={[co2?.slice(-49)]} unit={IndoorBounds.co2.unit} startFromZero />
          )}
        </View>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{TVOCInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data24h && (
            <Graph24h time={timemillis} y={[tvoc?.slice(-49)]} unit={IndoorBounds.tvoc.unit} startFromZero decimalPoints={1}/>
          )}
        </View>
      </View>
    </View>
  );
}

function Data7d(props: { data7d: Partial<DownsampledMSD18Data> | null }) {
  const { time, temperature, humidity, pm2_5, pm10, co2, tvoc } =
    props.data7d ?? {};
  const timemillis = (time ?? []).map((e) => (e ? e * 1000 : null));

  return (
    <View style={styles.elementContainer}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{TemperatureInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d time={timemillis} y={temperature?.slice(-7)} />
          )}
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: degree Celsius
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>Apparent {TemperatureInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d
              time={timemillis}
              y={temperature
                ?.map((e, i) => calculateHeatIndex(e!, humidity![i]!))
                .slice(-7)}
            />
          )}
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: degree Celsius
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{HumidityInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d time={timemillis} y={humidity?.slice(-7)} />
          )}
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: percent
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{PMInfo.topic} 2.5</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d time={timemillis} y={pm2_5?.slice(-7)} />
          )}
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: {IndoorBounds.pm2_5.unitFull}
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{PMInfo.topic} 10</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d time={timemillis} y={pm10?.slice(-7)} />
          )}
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: {IndoorBounds.pm10.unitFull}
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{CO2Info.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d time={timemillis} y={co2?.slice(-7)} />
          )}
          
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: {IndoorBounds.co2.unitFull}
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemHeaderText2}>{TVOCInfo.topic}</Text>
        <View style={styles.itemValueContainer}>
          {props.data7d && (
            <Bubble7d time={timemillis} y={tvoc?.slice(-7)} />
          )}
          
        </View>
        <Text
          style={{ ...styles.itemValueDescriptionText, textAlign: "right" }}
        >
          Unit: {IndoorBounds.tvoc.unitFull}
        </Text>
      </View>
    </View>
  );
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
    backgroundColor: "$black_lighter_overlay",
  },
  headerRightText: {
    color: "$white",
    fontSize: "1rem",
    fontFamily: "UberMoveText-Light",
  },
  scrollViewContainer: {
    paddingHorizontal: "1rem",
    flex: 1,
  },
  scrollViewContentContainer: {
    gap: "0.5rem",
  },
  elementContainer: {
    gap: "0.5rem",
    flex: 1,
  },
  aqiValueText: {
    color: "$white",
    paddingTop: "3rem",
    fontSize: "8.25rem",
    lineHeight: "7rem",
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
    paddingTop: "0.325rem",
    fontSize: "1.875rem",
    lineHeight: "1.5rem",
    fontFamily: "UberMove-Bold",
    textAlign: "center",
  },
  aqiColorIndicator: {
    height: "0.5rem",
    width: "70%",
    alignSelf: "center",
    borderRadius: "$infinity",
    marginBottom: "2rem",
  },
  thermalContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  pmvIndicatorContainer: {
    height: "0.5rem",
    flexDirection: "row",
    gap: "0.5rem",
  },
  pmvIndicatorGradient: {
    flex: 1,
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
    backgroundColor: "$black_50",
    paddingTop: "0.5rem",
    paddingVertical: "1rem",
    paddingHorizontal: "1.5rem",
    gap: "0.25rem",
    overflow: "hidden",
    flex: 1,
  },
  itemHeaderText: {
    color: "$white",
    fontSize: "0.9375rem",
    fontFamily: "UberMoveText-Regular",
    paddingBottom: "0.5rem",
    paddingRight: "0.75rem",
  },
  itemHeaderText2: {
    color: "$white",
    fontSize: "0.75rem",
    fontFamily: "UberMoveText-Regular",
    paddingBottom: "0.5rem",
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
    gap: "0.6rem",
    alignItems: "flex-start",
  },
  gaugeContainer: {
    width: 60,
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
    fontSize: "0.75rem",
    fontFamily: "UberMoveMono-Medium",
  },
  gaugeUnitText: {
    position: "absolute",
    bottom: "0.5rem",
    color: "$white",
    fontSize: "0.4rem",
    fontFamily: "UberMoveText-Light",
  },
  infoModalButton: {
    position: "absolute",
    top: 10,
    right: 16,
  },
});
