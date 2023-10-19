import { useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  Text,
  ScrollView,
  Button,
  View,
  Pressable,
  TextInput,
  ImageBackground,
} from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API } from "@aws-amplify/api";
import EStyleSheet from "react-native-extended-stylesheet";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { LongGraph } from "../../../../../components/longgraph";
import CalculatePMV from "../../../../../components/calculatePMV";
import { GetDownsampledAM319DataQueryVariables } from "../../../../graphql/API";

export default function AM319Details() {
  const headerHeight = useHeaderHeight();
  const localSearchParams = useLocalSearchParams();
  const { deveui, searchParams, name, image } = localSearchParams;

  const [error, setError] = useState<string | undefined>(undefined);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

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
    new Date(new Date(0).setHours(new Date().getHours(), new Date().getMinutes(), 0, 0))
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
    { label: "Total Volatile Organic Compounds", value: "tvoc" },
    { label: "Formaldehyde", value: "hcho" },
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
            } as GetDownsampledAM319DataQueryVariables,
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
            (obj: any) => obj.id === currentObject.id
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
            if (tempQuery.includes("tvoc"))
              existingObject.tvoc = [
                ...existingObject.tvoc,
                ...currentObject.tvoc,
              ];
            if (tempQuery.includes("hcho"))
              existingObject.hcho = [
                ...existingObject.hcho,
                ...currentObject.hcho,
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
    <View style={{ ...styles.overlayContainer, paddingTop: headerHeight + 8 }}>
      <Stack.Screen
        options={{
          title: name?.toString(),
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
      {!isDataLoading && data.error == "No data" && (
        <View style={styles.optionContainer}>
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
                        (date ?? new Date()).setDate((date?.getDate() ?? 0) - 1)
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
            <Text style={styles.label}>Data</Text>
            <View style={styles.spacer0_25rem} />
            <DropDownPicker
              open={propOpen}
              value={propValues}
              items={propItems}
              setOpen={setPropOpen}
              setValue={setPropValues}
              setItems={setPropItems}
              theme="DARK"
              multiple
              mode="SIMPLE"
              listMode="MODAL"
              searchable
              searchPlaceholder="Search..."
              containerStyle={{
                paddingVertical: 8,
              }}
              labelStyle={styles.dropdownLabel}
              listParentLabelStyle={styles.dropdownParentLabel}
            />
          </View>
          <View>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.spacer0_25rem} />
            <View style={styles.intervalInputContainer}>
              <DropDownPicker
                open={frequencyOpen}
                value={frequencyValue}
                items={frequencyItems}
                setOpen={setFrequencyOpen}
                setValue={setFrequencyValue}
                // setItems={setFrequencyItems}
                onClose={() => {
                  if (frequencyValue != "custom") setFrequencySuffixOpen(false);
                }}
                theme="DARK"
                mode="SIMPLE"
                listMode="MODAL"
                containerStyle={{
                  flex: 3,
                  paddingVertical: 8,
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
                    color: "#ffffff",
                    backgroundColor: "#404040",
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
                  theme="DARK"
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
          <View style={{flexDirection: "row", gap: 8}}>
            <View style={{ gap: 5, flex:1 }}>
              <Text style={{ textAlign: "center", color: "#ffffff" }}>
                Start
              </Text>
              <Pressable
                style={{ flexDirection: "row", flex: 1, alignItems: "center", backgroundColor: "#20202080", borderRadius: 2, padding: 16}}
                onPress={() => setIsStartDateShow(true)}
              >
                <Text style={{ flex: 1, fontFamily: "UberMoveText-Regular", color: "white", fontSize: 12, textAlign: "center", height: 16 }}>
                  {new Date(
                    startDate.setHours(
                      startTime.getHours(),
                      startTime.getMinutes(),
                      0,
                      0
                    )
                  ).toLocaleString()}
                </Text>
              </Pressable>
            </View>
            <View style={{ gap: 5, flex:1 }}>
              <Text style={{ textAlign: "center", color: "#ffffff" }}>End</Text>
              <Pressable
                style={{ flexDirection: "row", flex: 1, alignItems: "center", backgroundColor: "#20202080", borderRadius: 2, padding: 16}}
                onPress={() => setIsEndDateShow(true)}
              >
                <Text style={{ flex: 1, fontFamily: "UberMoveText-Regular", color: "white", fontSize: 12, textAlign: "center", height: 16 }}>
                  {new Date(
                    endDate.setHours(
                      endTime.getHours(),
                      endTime.getMinutes(),
                      0,
                      0
                    )
                  ).toLocaleString()}
                </Text>
              </Pressable>
            </View>
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
        </View>
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
            <ScrollView contentContainerStyle={styles.container}>
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
              {propValues.includes("tvoc") && data[0].tvoc && (
                <LongGraph
                  title="Total Volatile Organic Compounds"
                  data={MakeData("tvoc", 2)}
                  unit="level"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
              {propValues.includes("hcho") && data[0].hcho && (
                <LongGraph
                  title="Formaldehyde"
                  data={MakeData("hcho", 2)}
                  unit="ppb"
                  dataPointWidthMultiplier={dataPointWidthMultiplier}
                />
              )}
            </ScrollView>
          </>
        ))}
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
  optionContainer: {
    flex: 1,
    paddingHorizontal: "1rem",
    gap: "0.5rem",
  },
  intervalInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.63rem",
  },
  label: {
    fontFamily: "UberMoveText-Medium",
    color: "$white",
    fontSize: "0.9375rem",
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
  spacer0_25rem: {
    height: "0.25rem",
  },
});

const calculateInterval = (startTime: Date, endTime: Date) =>
  Math.abs(startTime.valueOf() - endTime.valueOf());
