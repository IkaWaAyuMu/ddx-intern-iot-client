import { useState, useEffect } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Text, ScrollView, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api'
import EStyleSheet from 'react-native-extended-stylesheet';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { PMVtoFavor, ValueBetweenToAQIColor, ValueBetweenToTempColor, ValueIncrementToAQIColor } from '../../../../../components/toFavor';
import { LongGraph } from '../../../../../components/home/components/longGraph';
import CalculatePMV from '../../../../../components/calculatePMV';

export default function AM319Details() {
  const localSearchParams = useLocalSearchParams();
  const { deveui } = localSearchParams;

  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const [dataPointWidthMultiplier, setDataPointWidthMultiplier] = useState<number>(1);
  const [propOpen, setPropOpen] = useState(false);
  const [propValues, setPropValues] = useState<ValueType[]>([]);
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
        value: Math.round(data[0][prop][i] * exponent) / exponent,
        timestamp: data[0].timestamp[i],
      })
    }

    return r;
  }

  return (
    <>
      {!isUserLoading && !user && <Redirect href='/' />}
      <ScrollView
        contentContainerStyle={styles.container}
      >
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
        <Button title={"OK"} onPress={fetchData} />

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0.1}
          value={dataPointWidthMultiplier}
          onValueChange={setDataPointWidthMultiplier}
          maximumValue={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        {!isDataLoading && data &&
          (error ? <Text>{error}</Text> :
            <>
              {propValues.includes('pmv') && <LongGraph
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
                chartMin={3}
                chartMax={-3}
              />}
              {propValues.includes('temperature') && <LongGraph
                title='Temperature'
                data={MakeData('temperature', 1)}
                unit="degrees Celsius"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
                chartMax={50}
                sectionCount={10}
              />}
              {propValues.includes('humidity') && <LongGraph
                title="Relative Humidity"
                data={MakeData('humidity', 1)}
                unit="percent"
                dataPointWidthMultiplier={dataPointWidthMultiplier}
                chartMax={100}
                sectionCount={10}
                yAxisSuffix="%"
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