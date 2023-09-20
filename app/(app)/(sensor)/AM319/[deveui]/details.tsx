import { useState, useEffect } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import {
  Text,
  ScrollView,
  Button,
  View,
  Pressable,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Auth } from "aws-amplify";
import { API } from "@aws-amplify/api";
import EStyleSheet from "react-native-extended-stylesheet";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { LongGraph } from "../../../../../components/details/longGraph";
import CalculatePMV from "../../../../../components/calculatePMV";

export default function AM319Details() {
  const localSearchParams = useLocalSearchParams();
  const { deveui, searchParams } = localSearchParams;

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const [dataPointWidthMultiplier, setDataPointWidthMultiplier] =
    useState<number>(1);
  const [propOpen, setPropOpen] = useState(false);
  const [propValues, setPropValues] = useState<ValueType[]>(
    searchParams ? [searchParams as string] : []
  );

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(
    new Date(new Date(0).setHours(0, 0, 0, 0))
  );
  const [isStartDateShow, setIsStartDateShow] = useState<boolean>(false);
  const [isStartTimeShow, setIsStartTimeShow] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(
    new Date(new Date(0).setSeconds(0, 0))
  );
  const [isEndDateShow, setIsEndDateShow] = useState<boolean>(false);
  const [isEndTimeShow, setIsEndTimeShow] = useState<boolean>(false);

  const interval = calculateInterval(
    new Date(
      startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)
    ),
    new Date(endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0))
  );

  const [propItems, setPropItems] = useState<ItemType<string>[]>([
    { label: "Predicted Mean Vote", value: "pmv" },
    { label: "Temperature", value: "temperature" },
    { label: "Relative humidity", value: "humidity" },
    { label: "Particulate Matter 2.5", value: "pm2_5" },
    { label: "Particulate Matter 10", value: "pm10" },
    { label: "Carbon Dioxide", value: "co2" },
    { label: "Formaldehyde", value: "hcho" },
    { label: "Total Volatile Organic Compounds", value: "tvoc" },
    { label: "Light Level", value: "light_level" },
  ]);

  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const frequencyItems: ItemType<string>[] = [
    ...(!(interval < 3e4 || interval > 1.08e7)
      ? [
          {
            label: "1 minute",
            value: "1m",
            disabled: interval < 3e4 || interval > 1.08e7,
          },
        ]
      : []),
    ...(!(interval < 6e5 || interval > 8.64e7)
      ? [
          {
            label: "5 minutes",
            value: "5m",
            disabled: interval < 6e5 || interval > 8.64e7,
          },
        ]
      : []),
    ...(!(interval < 1.2e6 || interval > 1.728e7)
      ? [
          {
            label: "10 minutes",
            value: "10m",
            disabled: interval < 1.2e6 || interval > 1.728e7,
          },
        ]
      : []),
    ...(!(interval < 1.8e6 || interval > 2.592e7)
      ? [
          {
            label: "15 minutes",
            value: "15m",
            disabled: interval < 1.8e6 || interval > 2.592e7,
          },
        ]
      : []),
    ...(!(interval < 3.6e6 || interval > 2.592e7)
      ? [
          {
            label: "30 minutes",
            value: "30m",
            disabled: interval < 3.6e6 || interval > 2.592e7,
          },
        ]
      : []),
    ...(!(interval < 7.2e6 || interval > 6.048e8)
      ? [
          {
            label: "1 hour",
            value: "1h",
            disabled: interval < 7.2e6 || interval > 6.048e8,
          },
        ]
      : []),
    ...(!(interval < 2.16e7 || interval > 1.814e9)
      ? [
          {
            label: "3 hours",
            value: "3h",
            disabled: interval < 2.16e7 || interval > 1.814e9,
          },
        ]
      : []),
    ...(!(interval < 4.32e7 || interval > 3.629e9)
      ? [
          {
            label: "6 hours",
            value: "6h",
            disabled: interval < 4.32e7 || interval > 3.629e9,
          },
        ]
      : []),
    ...(!(interval < 5.76e7 || interval > 4.838e9)
      ? [
          {
            label: "8 hours",
            value: "8h",
            disabled: interval < 5.76e7 || interval > 4.838e9,
          },
        ]
      : []),
    ...(!(interval < 8.64e7 || interval > 9.667e9)
      ? [
          {
            label: "12 hours",
            value: "12h",
            disabled: interval < 8.64e7 || interval > 9.667e9,
          },
        ]
      : []),
    ...(!(interval < 1.728e8)
      ? [{ label: "1 day", value: "1d", disabled: interval < 1.728e8 }]
      : []),
    ...(!(interval < 6.048e8)
      ? [{ label: "3 days", value: "3d", disabled: interval < 6.048e8 }]
      : []),
    ...(!(interval < 1.814e9)
      ? [{ label: "1 week", value: "1w", disabled: interval < 1.814e9 }]
      : []),
    ...(!(interval < 2.592e9)
      ? [{ label: "15 days", value: "15d", disabled: interval < 2.592e9 }]
      : []),
    ...(!(interval < 5.184e9)
      ? [{ label: "30 days", value: "30d", disabled: interval < 5.184e9 }]
      : []),
    { label: "custom", value: "custom" },
  ];
  const [frequencyValue, setFrequencyValue] = useState<ValueType>(
    frequencyItems[0].value!
  );

  const [frequencyPrefix, setFrequencyPrefix] = useState("1");
  const [frequencySuffixOpen, setFrequencySuffixOpen] = useState(false);
  const [frequencySuffixValue, setFrequencySuffixValue] =
    useState<ValueType>("h");
  const [frequencySuffixItems, setFrequencySuffixItems] = useState<
    ItemType<string>[]
  >([
    { label: "minute", value: "m" },
    { label: "hour", value: "h" },
    { label: "day", value: "d" },
    { label: "week", value: "w" },
  ]);

  const [data, setData] = useState<any>({ error: "No data" });

  // Check for existing authentication
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((e) => console.log(e))
      .finally(() => setIsUserLoading(false));
  }, [setUser, setIsUserLoading]);

  // Fetch the data
  const fetchData = async () => {
    setIsDataLoading(true);
    let tempQuery = propValues;
    if (tempQuery.includes("pmv")) {
      tempQuery.push("temperature");
      tempQuery.push("humidity");
      tempQuery = tempQuery.filter((e) => e != "pmv");
    }
    let temp: any;
    let NextToken: string | undefined = undefined;
    let result: any[] = [];
    do {
      temp = (
        (await API.graphql({
          query: `
          query GetDownsampledAM319Data($args: GetDataArgs) {
            getDownsampledAM319Data(args: $args) {
              statusCode
              NextToken
              result {
                deveui
                brand
                model
                time
                timestamp
                ${tempQuery.join("\n")}
              }
              error
              __typename
            }
          }
        `,
          variables: {
            args: {
              NextToken,
              deveui,
              frequency:
                frequencyValue == "custom"
                  ? frequencyPrefix + frequencySuffixValue
                  : frequencyValue,
              range: {
                startTime: new Date(
                  startDate.setHours(
                    startTime.getHours(),
                    startTime.getMinutes(),
                    0,
                    0
                  )
                ).toISOString(),
                endTime: new Date(
                  endDate.setHours(
                    endTime.getHours(),
                    endTime.getMinutes(),
                    0,
                    0
                  )
                ).toISOString(),
              },
            },
          },
        })) as any
      ).data.getDownsampledAM319Data;
      if (temp.error) setError(temp.error);
      else if (!temp.NextToken && temp.result.length <= 0)
        temp.error = "No data";
      else {
        setError(undefined);
        result.push(temp.result[0]);
        NextToken = temp.NextToken;
      }
    } while (!temp.error && NextToken != undefined);
    if (!temp.error) {
      const mergedObjects = result.reduce(
        (accumulator: any, currentObject: any) => {
          const existingObject = accumulator.find(
            (obj: any) => obj.deveui === currentObject.deveui
          );

          if (existingObject) {
            existingObject.time = [
              ...existingObject.time,
              ...currentObject.time,
            ];
            existingObject.timestamp = [
              ...existingObject.timestamp,
              ...currentObject.timestamp,
            ];
            if (tempQuery.includes("temperature"))
              existingObject.temperature = [
                ...existingObject.temperature,
                ...currentObject.temperature,
              ];
            if (tempQuery.includes("humidity"))
              existingObject.humidity = [
                ...existingObject.humidity,
                ...currentObject.humidity,
              ];
            if (tempQuery.includes("pm2_5"))
              existingObject.pm2_5 = [
                ...existingObject.pm2_5,
                ...currentObject.pm2_5,
              ];
            if (tempQuery.includes("pm10"))
              existingObject.pm10 = [
                ...existingObject.pm10,
                ...currentObject.pm10,
              ];
            if (tempQuery.includes("co2"))
              existingObject.co2 = [
                ...existingObject.co2,
                ...currentObject.co2,
              ];
            if (tempQuery.includes("hcho"))
              existingObject.hcho = [
                ...existingObject.hcho,
                ...currentObject.hcho,
              ];
            if (tempQuery.includes("tvoc"))
              existingObject.tvoc = [
                ...existingObject.tvoc,
                ...currentObject.tvoc,
              ];
            if (tempQuery.includes("light_level"))
              existingObject.light_level = [
                ...existingObject.light_level,
                ...currentObject.light_level,
              ];
          } else {
            if (currentObject) accumulator.push(currentObject);
          }

          return accumulator;
        },
        []
      );
      setData(
        temp.error || mergedObjects[0].time.length <= 0
          ? { error: "No data" }
          : mergedObjects
      );
    }
    setIsDataLoading(false);
  };

  const MakeData = (prop: string, decimalDigit: number) => {
    const r = [];
    const exponent = Math.pow(10, decimalDigit);
    for (let i = 0; i < data[0].timestamp.length; i++) {
      r.push({
        value:
          Math.round(
            (data[0][prop][i] / (prop == "tvoc" ? 100 : 1)) * exponent
          ) / exponent,
        timestamp: data[0].timestamp[i],
      });
    }

    return r;
  };

  return (
    <>
      {!isUserLoading && !user && <Redirect href="/" />}
      <ScrollView contentContainerStyle={styles.container}>
        {!isDataLoading && data.error == "No data" && (
          <>
            {isStartDateShow && (
              <DateTimePicker
                value={startDate}
                mode={"date"}
                onChange={(event, date) => {
                  setIsStartDateShow(false);
                  if (event.type != "dismissed") {
                    setIsStartTimeShow(true);
                    setStartDate(
                      new Date((date ?? new Date()).setHours(0, 0, 0, 0))
                    );
                  }
                }}
                maximumDate={endDate}
              />
            )}
            {isStartTimeShow && (
              <DateTimePicker
                value={startTime}
                mode={"time"}
                onChange={(event, date) => {
                  setIsStartTimeShow(false);
                  if (event.type != "dismissed") {
                    setStartTime(
                      new Date(
                        new Date(0).setHours(
                          date?.getHours() ?? 0,
                          date?.getMinutes() ?? 0,
                          0,
                          0
                        )
                      )
                    );
                  }
                }}
              />
            )}
            {isEndDateShow && (
              <DateTimePicker
                value={endDate}
                mode={"date"}
                onChange={(event, date) => {
                  setIsEndDateShow(false);
                  if (event.type != "dismissed") {
                    setIsEndTimeShow(true);
                    setEndDate(
                      new Date((date ?? new Date()).setHours(0, 0, 0, 0))
                    );
                    if ((date ?? new Date()).valueOf() < startDate.valueOf())
                      setStartDate(
                        new Date(
                          (date ?? new Date()).setDate(
                            (date?.getDate() ?? 0) - 1
                          )
                        )
                      );
                  }
                }}
                maximumDate={new Date()}
              />
            )}
            {isEndTimeShow && (
              <DateTimePicker
                value={endTime}
                mode={"time"}
                onChange={(event, date) => {
                  setIsEndTimeShow(false);
                  if (event.type != "dismissed") {
                    setEndTime(
                      new Date(
                        new Date(0).setHours(
                          date?.getHours() ?? 0,
                          date?.getMinutes() ?? 0,
                          0,
                          0
                        )
                      )
                    );
                    if (
                      new Date(
                        endDate.setHours(
                          date?.getHours() ?? 0,
                          date?.getMinutes() ?? 0,
                          0,
                          0
                        ) ?? 0
                      ).valueOf() <
                      new Date(
                        startTime.setHours(
                          startTime.getHours(),
                          startTime.getMinutes(),
                          0,
                          0
                        )
                      ).valueOf()
                    ) {
                      setStartDate(
                        new Date(startDate.setDate((date?.getDate() ?? 0) - 1))
                      );
                      setStartTime(
                        new Date(
                          new Date(0).setHours(
                            date?.getHours() ?? 0,
                            date?.getMinutes() ?? 0,
                            0,
                            0
                          )
                        )
                      );
                    }
                  }
                }}
              />
            )}
            <View>
              <Text style={styles.label}>Property</Text>
              <View style={styles.spacer0_5rem} />
              <DropDownPicker
                open={propOpen}
                value={propValues}
                items={propItems}
                setOpen={setPropOpen}
                setValue={setPropValues}
                setItems={setPropItems}
                theme="LIGHT"
                multiple
                mode="SIMPLE"
                listMode="MODAL"
                searchable
                searchPlaceholder="Search..."
                containerStyle={{
                  paddingHorizontal: 10,
                }}
                labelStyle={styles.dropdownLabel}
                listParentLabelStyle={styles.dropdownParentLabel}
              />
            </View>
            <View>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.spacer0_5rem} />
              <View style={styles.intervalInputContainer}>
                <DropDownPicker
                  open={frequencyOpen}
                  value={frequencyValue}
                  items={frequencyItems}
                  setOpen={setFrequencyOpen}
                  setValue={setFrequencyValue}
                  // setItems={setFrequencyItems}
                  onClose={() => {
                    if (frequencyValue != "custom")
                      setFrequencySuffixOpen(false);
                  }}
                  theme="LIGHT"
                  mode="SIMPLE"
                  listMode="MODAL"
                  containerStyle={{
                    flex: 3,
                  }}
                  labelStyle={styles.dropdownLabel}
                  listParentLabelStyle={styles.dropdownParentLabel}
                  />
                {frequencyValue == "custom" && (
                  <TextInput
                    onChangeText={setFrequencyPrefix}
                    value={frequencyPrefix}
                    placeholder="value"
                    keyboardType="numeric"
                    onEndEditing={(e) => {
                      if (
                        isNaN(parseFloat(e.nativeEvent.text)) ||
                        parseFloat(e.nativeEvent.text) <= 0
                      )
                        setFrequencyPrefix("1");
                    }}
                    style={{
                      flex: 1,
                      textAlign: "right",
                      paddingHorizontal: 5,
                      backgroundColor: "#ffffff",
                      borderColor: "#000000",
                      borderWidth: 1,
                      borderRadius: 10,
                    }}
                  />
                )}
                {frequencyValue == "custom" && (
                  <DropDownPicker
                    open={frequencySuffixOpen}
                    value={frequencySuffixValue}
                    items={frequencySuffixItems}
                    setOpen={setFrequencySuffixOpen}
                    setValue={setFrequencySuffixValue}
                    setItems={setFrequencySuffixItems}
                    theme="LIGHT"
                    mode="SIMPLE"
                    listMode="MODAL"
                    containerStyle={{
                      flex: 2,
                    }}
                    labelStyle={styles.dropdownLabel}
                    listParentLabelStyle={styles.dropdownParentLabel}
                    />
                )}
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Pressable
                style={{ flex: 1, backgroundColor: "#00a0ff", borderRadius: 2 }}
                onPress={() => setIsStartDateShow(true)}
              >
                <Text style={{ textAlign: "center", color: "#ffffff" }}>
                  Start
                </Text>
              </Pressable>
              <Text style={{ flex: 1 }}>
                {new Date(
                  startDate.setHours(
                    startTime.getHours(),
                    startTime.getMinutes(),
                    0,
                    0
                  )
                ).toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Pressable
                style={{ flex: 1, backgroundColor: "#00a0ff", borderRadius: 2 }}
                onPress={() => setIsEndDateShow(true)}
              >
                <Text style={{ textAlign: "center", color: "#ffffff" }}>
                  End
                </Text>
              </Pressable>
              <Text style={{ flex: 1 }}>
                {new Date(
                  endDate.setHours(
                    endTime.getHours(),
                    endTime.getMinutes(),
                    0,
                    0
                  )
                ).toLocaleString()}
              </Text>
            </View>
            <Button
              title={"OK"}
              onPress={fetchData}
              disabled={
                propValues[0] == undefined ||
                !(
                  new Date(
                    startDate.setHours(
                      startTime.getHours(),
                      startTime.getMinutes(),
                      0,
                      0
                    )
                  ).valueOf() <
                  new Date(
                    endDate.setHours(
                      endTime.getHours(),
                      endTime.getMinutes(),
                      0,
                      0
                    )
                  ).valueOf()
                ) ||
                (frequencyValue != "custom" &&
                  frequencyItems.find((e) => e.value == frequencyValue) ==
                    undefined)
              }
            />
          </>
        )}
        {isDataLoading && <Text>Loading...</Text>}
        {!(!isDataLoading && data.error == "No data") &&
          (data.error || error ? (
            <Text>
              {(data.error ?? error) == "No data" ? "" : data.error ?? error}
            </Text>
          ) : (
            <>
              <Button
                title={"CANCEL"}
                onPress={() => setData({ error: "No data" })}
              />
              <View>
                <Text>Zoom({dataPointWidthMultiplier.toFixed(2)}x)</Text>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={0.1}
                  value={dataPointWidthMultiplier}
                  onSlidingComplete={setDataPointWidthMultiplier}
                  step={0.1}
                  maximumValue={3}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                />
              </View>
              {propValues.includes("pmv") &&
                data[0].temperature &&
                data[0].humidity && (
                  <LongGraph
                    title="Predicted Mean Vote"
                    data={(() => {
                      const r = [];
                      for (let i = 0; i < data[0].timestamp.length; i++) {
                        r.push({
                          value:
                            Math.round(
                              CalculatePMV(
                                data[0].temperature[i],
                                data[0].temperature[i],
                                0,
                                data[0].humidity[i],
                                1.2,
                                0.57
                              ).pmv * 1e2
                            ) / 1e2,
                          timestamp: data[0].timestamp[i],
                        });
                      }

                      return r;
                    })()}
                    unit=""
                    dataPointWidthMultiplier={dataPointWidthMultiplier}
                    sectionCount={3}
                    chartMin={-3}
                    chartMax={3}
                  />
                )}
              {propValues.includes("temperature") && data[0].temperature && (
                <LongGraph
                  title="Temperature"
                  data={MakeData("temperature", 1)}
                  unit="degrees Celsius"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                  yAxisSuffix="°C"
                />
              )}
              {propValues.includes("humidity") && data[0].humidity && (
                <LongGraph
                  title="Relative Humidity"
                  data={MakeData("humidity", 1)}
                  unit="percent"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                  yAxisSuffix="%"
                />
              )}
              {propValues.includes("pm2_5") && data[0].pm2_5 && (
                <LongGraph
                  title="Particulate Matter 2.5"
                  data={MakeData("pm2_5", 0)}
                  unit="micrograms per cubic meter"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
              {propValues.includes("pm10") && data[0].pm10 && (
                <LongGraph
                  title="Particulate Matter 10"
                  data={MakeData("pm10", 0)}
                  unit="micrograms per cubic meter"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
              {propValues.includes("co2") && data[0].co2 && (
                <LongGraph
                  title="Carbon Dioxide"
                  data={MakeData("co2", 0)}
                  unit="parts per million"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
              {propValues.includes("hcho") && data[0].hcho && (
                <LongGraph
                  title="Formaldehyde"
                  data={MakeData("hcho", 2)}
                  unit="parts per billion"
                  chartMax={0.1}
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
              {propValues.includes("tvoc") && data[0].tvoc && (
                <LongGraph
                  title="Total Volatile Organic Compounds"
                  data={MakeData("tvoc", 2)}
                  unit="IAQ Rating"
                  chartMin={1}
                  chartMax={2}
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
              {propValues.includes("light_level") && data[0].light_level && (
                <LongGraph
                  title="Light Level"
                  data={MakeData("light_level", 1)}
                  unit=""
                  chartMin={0}
                  chartMax={5}
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
            </>
          ))}
      </ScrollView>
    </>
  );
}

const styles = EStyleSheet.create({
  container: {
    paddingVertical: "2rem",
    paddingHorizontal: "0.63rem",
    gap: "1.25rem",
  },
  intervalInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "0.63rem",
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: "UberMoveText-Medium",
    color: "$textColor",
    fontSize: "1rem",
  },
  dropdownLabel: {
    fontFamily: "UberMoveText-Light",
    color: "$textColor",
    fontSize: "1rem",
  },
  dropdownParentLabel: {
    fontFamily: "UberMoveText-Light",
    color: "$textColor",
    fontSize: "0.75rem",
  },
  spacer0_5rem: {
    height: "0.5rem",
  },
});

const calculateInterval = (startTime: Date, endTime: Date) =>
  Math.abs(startTime.valueOf() - endTime.valueOf());
