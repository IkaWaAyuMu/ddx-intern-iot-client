import { Orientation, OrientationChangeEvent, addOrientationChangeListener, getOrientationAsync, removeOrientationChangeListener } from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CardGroup, LastUpdated } from '../components/card';
import EStyleSheet from 'react-native-extended-stylesheet';
import calculateHeatIndex from '../../calculateHeatIndex';
import { IAQtoFavor, PMVtoFavor, ValueBetweenToAQIColor, ValueBetweenToAQIColorDashboard, ValueIncrementToAQIColor, ValueIncrementToAQIColorDashboard } from '../../toFavor';
import { DashboardBrief, DashboardCardGroup } from '../components/dashboard';

export default function AM319(props: { deveui: string, data: any }) {
  const { deveui, data } = props;
  const [orientation, setOrientation] = useState<Orientation>(Orientation.UNKNOWN);
  const lastIndex = data.time.length - 1;
  const thermalFavor = PMVtoFavor(data.temperature[lastIndex] ?? 0, data.humidity[lastIndex] ?? 0);
  const iaqFavor = IAQtoFavor(data.pm2_5[lastIndex] ?? 0, data.pm10[lastIndex] ?? 0, data.co2[lastIndex] ?? 0, data.hcho[lastIndex] ?? 0, parseFloat(data.tvoc[lastIndex]) / 100 ?? 0);

  useEffect(() => {
    const checkOrientation = async () => {
      const orientation = await getOrientationAsync();
      setOrientation(orientation);
    };
    const handleOrientationChange = (o: OrientationChangeEvent) => { setOrientation(o.orientationInfo.orientation) };
    const subscription = addOrientationChangeListener(handleOrientationChange);

    checkOrientation();
    return () => removeOrientationChangeListener(subscription);
  }, []);

  return (
    <>
      {(orientation === Orientation.PORTRAIT_UP || orientation === Orientation.PORTRAIT_DOWN) && <View style={styles.briefInfo}>
        <CardGroup title="Thermal"
          description={`${thermalFavor.desc} ${thermalFavor.pmv} (Feels like ${calculateHeatIndex(data.temperature[lastIndex] ?? 0, data.humidity[lastIndex] ?? 0).toFixed(1)}°C)`}
          icon={<></>}
          color={thermalFavor.color}
          grouplink={`/AM319/${deveui}/temp`}
          data={[
            { title: "Temperature", value: data.temperature[lastIndex].toFixed(1) ?? "-", unit: "degree Celsius", color: ValueBetweenToAQIColor(data.temperature[lastIndex] ?? 0, [21, 20, 19, 18, 17], [27, 28, 29, 30, 31]) },
            { title: "R.Humidity", value: data.humidity[lastIndex] ?? "-", unit: "%", color: ValueBetweenToAQIColor(data.humidity[lastIndex] ?? 0, [40, 35, 30, 25, 20], [60, 65, 70, 75, 80]) }
          ]}
        />
        <View style={styles.spacer1p25rem} />
        <CardGroup
          title="Air Quality"
          description={iaqFavor.desc}
          icon={<></>}
          color={iaqFavor.color}
          data={[
            { title: "PM2.5", value: data.pm2_5[lastIndex] ?? "-", unit: "μg/m³", color: ValueIncrementToAQIColor(data.pm2_5[lastIndex] ?? 0, [10, 12, 15, 35.5, 55.5]) },
            { title: "PM10", value: data.pm10[lastIndex] ?? "-", unit: "μg/m³", color: ValueIncrementToAQIColor(data.pm10[lastIndex] ?? 0, [20, 30, 50, 155, 255]) },
            { title: "CO2", value: data.co2[lastIndex] ?? "-", unit: "ppm", color: ValueIncrementToAQIColor(data.co2[lastIndex] ?? 0, [750, 900, 1200, 2500, 5000]) },
            { title: "HCHO", value: data.hcho[lastIndex] ?? "-", unit: "ppb", color: ValueIncrementToAQIColor(data.hcho[lastIndex] ?? 0, [0.05, 0.1, 0.25, 0.3, 0.5]) },
            { title: "TVOC", value: (parseFloat(data.tvoc[lastIndex]) / 100).toPrecision(3).toString() ?? "-", unit: "IAQ Rating", color: ValueIncrementToAQIColor(parseFloat(data.tvoc[lastIndex]) / 100, [1, 2, 3, 4, 5]) }
          ]}
        />
        <CardGroup
          title="Miscellaneous"
          description=""
          icon={<></>}
          data={[
            { title: "Light Level", value: data.light_level[lastIndex] ?? "-", unit: "" }
          ]}
        />
        <LastUpdated time={new Date(data.timestamp[lastIndex])} brand={data.brand} model={data.model} />
        <View style={styles.spacer1rem} />
      </View>}
      {(orientation === Orientation.LANDSCAPE_LEFT || orientation === Orientation.LANDSCAPE_RIGHT) && <View style={styles.dashboard}>
        <View style={{ width: '20%' }}><DashboardBrief description='' /></View>
        <View style={{ width: '80%' }}>
          <DashboardCardGroup
            data={[
              { title: "Temperature", value: data.temperature[lastIndex].toFixed(1) ?? "-", unit: "°C", color: ValueBetweenToAQIColorDashboard(data.temperature[lastIndex] ?? 0, [21, 20, 19, 18, 17], [27, 28, 29, 30, 31]) ?? '#00ff0033', large: true },
              { title: "Relative Humidity", value: data.humidity[lastIndex] ?? "-", unit: "%", color: ValueBetweenToAQIColorDashboard(data.humidity[lastIndex] ?? 0, [40, 35, 30, 25, 20], [60, 65, 70, 75, 80]) ?? '#00ff0033', large: true },
            ]} />
          <DashboardCardGroup
            data={[
              { title: "PM2.5", value: data.pm2_5[lastIndex] ?? "-", unit: "μg/m³", color: ValueIncrementToAQIColorDashboard(data.pm2_5[lastIndex] ?? 0, [10, 12, 15, 35.5, 55.5]) ?? '#00ff0033', large: false },
              { title: "PM10", value: data.pm10[lastIndex] ?? "-", unit: "μg/m³", color: ValueIncrementToAQIColorDashboard(data.pm10[lastIndex] ?? 0, [20, 30, 50, 155, 255]) ?? '#00ff0033', large: false },
              { title: "CO2", value: data.co2[lastIndex] ?? "-", unit: "ppm", color: ValueIncrementToAQIColorDashboard(data.co2[lastIndex] ?? 0, [750, 900, 1200, 2500, 5000]) ?? '#00ff0033', large: false },
              { title: "HCHO", value: data.hcho[lastIndex] ?? "-", unit: "ppb", color: ValueIncrementToAQIColorDashboard(data.hcho[lastIndex] ?? 0, [0.05, 0.1, 0.25, 0.3, 0.5]) ?? '#00ff0033', large: false },
              { title: "TVOC", value: (parseFloat(data.tvoc[lastIndex]) / 100).toPrecision(3).toString() ?? "-", unit: "", color: ValueIncrementToAQIColorDashboard(parseFloat(data.tvoc[lastIndex]) / 100, [1, 2, 3, 4, 5]) ?? '#00ff0033', large: false },
            ]} />
        </View>
      </View>}
    </>
  )
}

const styles = EStyleSheet.create({
  briefInfo: {
    backgroundColor: '$backgroundColor',
    gap: '1.25rem',
  },
  dashboard: {
    backgroundColor: '$backgroundColor',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer1rem: {
    height: '1rem',
    width: '100%'
  },
});