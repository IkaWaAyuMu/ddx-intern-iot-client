import { ScrollView, View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CardGroup } from '../../components/home/components/card';

export default function App() {
  const data = {"statusCode":200,"result":[{"NextToken":null,"deveui":"24e124710c409355","brand":"Milesight","model":"AM319","time":[1690950840,1690950960],"timestamp":["2023-08-02T04:34:00.000Z","2023-08-02T04:36:00.000Z"],"pm2_5":[7,7],"humidity":[55.5,55.5],"co2":[1031,1032],"light_level":[1,1],"pir":[1,1],"tvoc":[100,100],"temperature":[25.2,25.2],"pressure":[1003.4,1003.4],"pm10":[7,7],"hcho":[0.03,0.03],"__typename":"DownsampledAM319Data"}],"error":null,"__typename":"DownsampledAM319Message"}
  
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <CardGroup title="thermal" description='very bad' icon={<View style={{backgroundColor:'#000', width: 60, height: 50}} />} data={[
          {title:"PM2.5", value:data.result[0].pm2_5[0] ?? "", unit:"μg/m³"},
          {title:"PM10", value:data.result[0].pm10[0] ?? "", unit:"μg/m³"},
          {title:"CO2", value:data.result[0].co2[0] ?? "", unit:"ppm"},
          {title:"HCHO", value:data.result[0].hcho[0] ?? "", unit:"ppb"},
          {title:"TVOC", value:(parseFloat(data.result[0].tvoc[0].toString()) / 100).toPrecision(3).toString() ?? "", unit:"IAQ Rating"}
        ]}/>
      </ScrollView>
    </>);
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$backgroundColor',
    rowGap: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
  }
});