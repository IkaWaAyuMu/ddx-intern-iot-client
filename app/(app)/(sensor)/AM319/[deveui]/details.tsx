import { useState, useEffect } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Text, ScrollView, Button, View, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { LongGraph } from '../../../../../components/details/longGraph';
import CalculatePMV from '../../../../../components/calculatePMV';

export default function AM319Details() {
  const localSearchParams = useLocalSearchParams();
  const { deveui, searchParams } = localSearchParams;

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const [dataPointWidthMultiplier, setDataPointWidthMultiplier] = useState<number>(1);
  const [propOpen, setPropOpen] = useState(false);
  const [propValues, setPropValues] = useState<ValueType[]>([searchParams! as string]);
  const [propItems, setPropItems] = useState([
    { label: 'Predicted Mean Vote', value: 'pmv' },
    { label: 'Temperature', value: 'temperature' },
    { label: 'Relative humidity', value: 'humidity' },
    { label: 'Particulate Matter 2.5', value: 'pm2_5' },
    { label: 'Particulate Matter 10', value: 'pm10' },
    { label: 'Carbon Dioxide', value: 'co2' },
    { label: 'Formaldehyde', value: 'hcho' },
    { label: 'Total Volatile Organic Compounds', value: 'tvoc' },
    { label: 'Light Level', value: 'light_level' },
  ]);

  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setHours(0,0,0,0))); 
  const [isStartDateShow, setIsStartDateShow] = useState<boolean>(false);
  const [isStartTimeShow, setIsStartTimeShow] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setSeconds(0))); 
  const [isEndDateShow, setIsEndDateShow] = useState<boolean>(false);
  const [isEndTimeShow, setIsEndTimeShow] = useState<boolean>(false);

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
    console.log("fetched");
    setIsDataLoading(true);
    let tempQuery = propValues;
    if (tempQuery.includes('pmv')) { tempQuery.push('temperature'); tempQuery.push('humidity'); tempQuery = tempQuery.filter(e => e != 'pmv') }
    let temp: any;
    let nextToken: string | undefined = undefined;
    let result: any[] = [];
    do {
      temp = (await API.graphql({
        query: `
          query GetDownsampledAM319Data($args: GetDataArgs) {
            getDownsampledAM319Data(args: $args) {
              statusCode
              result {
                deveui
                brand
                model
                time
                timestamp
                ${tempQuery.join('\n')}
              }
              error
              __typename
            }
          }
        `,
        variables: {
          args: {
            nextToken,
            deveui,
            frequency: "1d",
            range: { interval: "90d" }
          }
        }
      }) as any).data.getDownsampledAM319Data;
      if (!temp.error) result.push(temp.result[0]);
      if (temp.result[0].nextToken != undefined) nextToken = temp.result[0].nextToken;
    } while (!temp.error && nextToken != undefined);
    const mergedObjects = result.reduce((accumulator: any, currentObject: any) => {
      const existingObject = accumulator.find((obj: any) => obj.deveui === currentObject.deveui);

      if (existingObject) {
        existingObject.time = [...existingObject.time, ...currentObject.time];
        existingObject.timestamp = [...existingObject.timestamp, ...currentObject.timestamp];
        if (tempQuery.includes('temperature')) existingObject.temperature = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('humidity')) existingObject.humidity = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('pm2_5')) existingObject.pm2_5 = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('pm10')) existingObject.pm10 = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('co2')) existingObject.co2 = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('hcho')) existingObject.hcho = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('tvoc')) existingObject.tvoc = [...existingObject.value, ...currentObject.value];
        if (tempQuery.includes('light_level')) existingObject.light_level = [...existingObject.value, ...currentObject.value];
      } else {
        accumulator.push(currentObject);
      }

      return accumulator;
    }, []);
    setError(temp.error);

    setData(temp.error ? { error: "No data" } : mergedObjects);
    setIsDataLoading(false);
  };

  const MakeData = (prop: string, decimalDigit: number) => {
    const r = []
    const exponent = Math.pow(10, decimalDigit);
    for (let i = 0; i < data[0].timestamp.length; i++) {
      r.push({
        value: Math.round(data[0][prop][i] / (prop == 'tvoc' ? 100 : 1) * exponent) / exponent,
        timestamp: data[0].timestamp[i],
      })
    }

    return r;
  }

  console.log(data);
  console.log(propValues);

  return (
    <>
      {!isUserLoading && !user && <Redirect href='/' />}
      <ScrollView
        contentContainerStyle={styles.container}
      >
        {isStartDateShow && <DateTimePicker value={startDate} mode={'date'} onChange={(event, date) => {setStartDate(new Date((date ?? new Date()).setSeconds(0))); setIsStartDateShow(false); if (event.type != 'dismissed') setIsStartTimeShow(true);}} maximumDate={endDate} />}
        {isStartTimeShow && <DateTimePicker value={startDate} mode={'time'} onChange={(event, date) => {setStartDate(new Date((date ?? new Date()).setSeconds(0))); setIsStartTimeShow(false);}} maximumDate={endDate} />}
        {isEndDateShow && <DateTimePicker value={endDate} mode={'date'} onChange={(event, date) => {setEndDate(new Date((date ?? new Date()).setSeconds(0))); if (startDate > new Date((date ?? new Date()).setSeconds(0))) setStartDate(new Date((date ?? new Date()).setSeconds(0))); setIsEndDateShow(false); if (event.type != 'dismissed') setIsEndTimeShow(true);}} maximumDate={new Date()} />}
        {isEndTimeShow && <DateTimePicker value={endDate} mode={'time'} onChange={(event, date) => {setEndDate(new Date((date ?? new Date()).setSeconds(0))); if (startDate > new Date((date ?? new Date()).setSeconds(0))) setStartDate(new Date((date ?? new Date()).setSeconds(0))); setIsEndTimeShow(false);}} maximumDate={new Date()}/>}
        <DropDownPicker
          open={propOpen}
          value={propValues}
          items={propItems}
          setOpen={setPropOpen}
          setValue={setPropValues}
          setItems={setPropItems}

          theme="LIGHT"
          multiple={true}
          mode="SIMPLE"
          listMode="MODAL"
        />
        <View style={{flexDirection: 'row', gap: 5}}><Pressable style={{flex:1, backgroundColor: "#00a0ff", borderRadius: 2}} onPress={() => setIsStartDateShow(true)}><Text style={{textAlign: 'center', color: '#ffffff'}}>Start</Text></Pressable><Text style={{flex:1}}>{startDate.toLocaleString()}</Text></View>
        <View style={{flexDirection: 'row', gap: 5}}><Pressable style={{flex:1, backgroundColor: "#00a0ff", borderRadius: 2}} onPress={() => setIsEndDateShow(true)}><Text style={{textAlign: 'center', color: '#ffffff'}}>End</Text></Pressable><Text style={{flex:1}}>{endDate.toLocaleString()}</Text></View>
        <Button title={"OK"} onPress={propValues[0] != undefined ? fetchData : () => {}} />
        <Text>Zoom</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0.1}
          value={dataPointWidthMultiplier}
          onSlidingComplete={setDataPointWidthMultiplier}
          maximumValue={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        {isDataLoading && <Text>Loading...</Text>}
        {!isDataLoading && data &&
          ((data.error || error) ? <Text>{data.error ?? error}</Text> :
            <>
              {propValues.includes('pmv') && data[0].temperature && data[0].humidity && <LongGraph
                title='Predicted Mean Vote'
                data={(() => {
                  const r = []
                  for (let i = 0; i < data[0].timestamp.length; i++) {
                    r.push({
                      value: Math.round(CalculatePMV(
                        data[0].temperature[i],
                        data[0].temperature[i],
                        0,
                        data[0].humidity[i],
                        1.2,
                        0.57).pmv
                        * 1e2) / 1e2,
                      timestamp: data[0].timestamp[i],
                    })
                  }

                  return r;
                })()}
                unit=""
                dataPointWidthMultiplier={dataPointWidthMultiplier}
                sectionCount={3}
                chartMin={-3}
                chartMax={3}
              />}
              {propValues.includes('temperature') && data[0].temperature && <LongGraph
                title='Temperature'
                data={MakeData('temperature', 1)}
                unit="degrees Celsius"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
                yAxisSuffix='°C'
              />}
              {propValues.includes('humidity') && data[0].humidity && <LongGraph
                title="Relative Humidity"
                data={MakeData('humidity', 1)}
                unit="percent"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
                yAxisSuffix="%"
              />}
              {propValues.includes('pm2_5') && data[0].pm2_5 && <LongGraph
                title="Particulate Matter 2.5"
                data={MakeData('pm2_5', 0)}
                unit="micrograms per cubic meter"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
              />}
              {propValues.includes('pm10') && data[0].pm10 && <LongGraph
                title="Particulate Matter 10"
                data={MakeData('pm10', 0)}
                unit="micrograms per cubic meter"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
              />}
              {propValues.includes('co2') && data[0].co2 && <LongGraph
                title="Carbon Dioxide"
                data={MakeData('co2', 0)}
                unit="parts per million"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
              />}
              {propValues.includes('hcho') && data[0].hcho && <LongGraph
                title="Formaldehyde"
                data={MakeData('hcho', 2)}
                unit="parts per billion"
                chartMax={0.1}
                dataPointWidthMultiplier={dataPointWidthMultiplier}
              />}
              {propValues.includes('tvoc') && data[0].tvoc && <LongGraph
                title="Total Volatile Organic Compounds"
                data={MakeData('tvoc', 2)}
                unit="IAQ Rating"
                chartMin={1}
                chartMax={2}
                dataPointWidthMultiplier={dataPointWidthMultiplier}
              />}
              {propValues.includes('light_level') && data[0].light_level && <LongGraph
                title="Light Level"
                data={MakeData('light_level', 1)}
                unit=""
                chartMin={0}
                chartMax={5}
                dataPointWidthMultiplier={dataPointWidthMultiplier}
              />}
            </>
          )
        }
      </ScrollView>
    </>);
}

const styles = EStyleSheet.create({
  container: {
    paddingVertical: '2rem',
    paddingHorizontal: '0.63rem',
    gap: '1.25rem',
  }
});