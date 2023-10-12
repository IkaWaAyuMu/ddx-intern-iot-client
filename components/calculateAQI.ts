import ParamsBounds from "../assets/bounds/outdoorBounds.json"

export default function CalculateAQI(data: AQICalculateableData ): { aqi: number, level: string, color: string } {

  let maxAQI = 0;

  if (data.pm2_5) maxAQI = Math.max(maxAQI, PM2_5AQI(data.pm2_5));
  if (data.pm10) maxAQI = Math.max(maxAQI, PM10AQI(data.pm10));
  if (data.o3_8h) maxAQI = Math.max(maxAQI, O3_8HAQI(data.o3_8h));
  if (data.o3_1h) maxAQI = Math.max(maxAQI, O3_1HAQI(data.o3_1h));
  if (data.co) maxAQI = Math.max(maxAQI, COAQI(data.co));
  if (data.so2) maxAQI = Math.max(maxAQI, SO2AQI(data.so2));
  if (data.no2) maxAQI = Math.max(maxAQI, NO2AQI(data.no2));

  let level = ParamsBounds.aqi.label[0];
  let color = ParamsBounds.aqi.color[0];
  if (maxAQI <= ParamsBounds.aqi.upperBounds[0]) {
    level = ParamsBounds.aqi.label[0];
    color = ParamsBounds.aqi.color[0];
  }
  else if (maxAQI <= ParamsBounds.aqi.upperBounds[1]) {
    level = ParamsBounds.aqi.label[1];
    color = ParamsBounds.aqi.color[1];
  }
  else if (maxAQI <= ParamsBounds.aqi.upperBounds[2]) {
    level = ParamsBounds.aqi.label[2];
    color = ParamsBounds.aqi.color[2];
  }
  else if (maxAQI <= ParamsBounds.aqi.upperBounds[3]) {
    level = ParamsBounds.aqi.label[3];
    color = ParamsBounds.aqi.color[3];
  } 
  else if (maxAQI <= ParamsBounds.aqi.upperBounds[4]) {
    level = ParamsBounds.aqi.label[4];
    color = ParamsBounds.aqi.color[4];
  } 
  else if (maxAQI <= ParamsBounds.aqi.upperBounds[5]) {
    level = ParamsBounds.aqi.label[5];
    color = ParamsBounds.aqi.color[5];
  }
  else {
    level = ParamsBounds.aqi.label[6];
    color = ParamsBounds.aqi.color[6];
  }

  return {
    aqi: maxAQI,
    level,
    color
  }

}

type AQICalculateableData = {
  pm2_5?: number,
  pm10?: number,
  o3_8h?: number,
  o3_1h?: number,
  co?: number,
  so2?: number,
  no2?: number,
}

function calculateIndex(value: number, bpHigh: number, bpLow: number, iHigh: number, iLow: number): number {
  return Math.floor((iHigh - iLow) / (bpHigh - bpLow) * (value - bpLow) + iLow)
}

function PM2_5AQI(value: number): number {
  value = Math.floor(value*1e1)/1e1;
  for (let i=0; i <=5; i++) if (value <= ParamsBounds.aqi.pm2_5.upperBounds[i]) return calculateIndex(value, ParamsBounds.aqi.pm2_5.upperBounds[i], ParamsBounds.aqi.pm2_5.lowerBounds[i], ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[5]+1;
}

function PM10AQI(value: number) : number {
  value = Math.floor(value);
  for (let i=0; i <=5; i++) if (value <= ParamsBounds.aqi.pm10.upperBounds[i]) return calculateIndex(value, ParamsBounds.aqi.pm10.upperBounds[i], ParamsBounds.aqi.pm10.lowerBounds[i], ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[5]+1;
}

function O3_8HAQI(value: number): number {
  value = Math.floor(value*1e3)/1e3;
  for (let i=0; i <=4; i++) if (value <= ParamsBounds.aqi.o3_8h.upperBounds[i]!) return calculateIndex(value, ParamsBounds.aqi.o3_8h.upperBounds[i]!, ParamsBounds.aqi.o3_8h.lowerBounds[i]!, ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[4]+1;

}

function O3_1HAQI(value: number): number {
  value = Math.floor(value*1e3)/1e3;
  if (value <= ParamsBounds.aqi.o3_1h.upperBounds[1]!) return 0;
  for (let i=2; i <=5; i++) if (value <= ParamsBounds.aqi.o3_1h.upperBounds[i]!) return calculateIndex(value, ParamsBounds.aqi.o3_1h.upperBounds[i]!, ParamsBounds.aqi.o3_1h.lowerBounds[i]!, ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[5]+1;
}

function COAQI(value: number): number {
  value = Math.floor(value*1e1)/1e1;
  for (let i=0; i <=5; i++) if (value <= ParamsBounds.aqi.co.upperBounds[i]) return calculateIndex(value, ParamsBounds.aqi.co.upperBounds[i], ParamsBounds.aqi.co.lowerBounds[i], ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[5]+1;
}

function SO2AQI(value: number): number {
  value = Math.floor(value);
  for (let i=0; i <=5; i++) if (value <= ParamsBounds.aqi.so2.upperBounds[i]) return calculateIndex(value, ParamsBounds.aqi.so2.upperBounds[i], ParamsBounds.aqi.so2.lowerBounds[i], ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[5]+1;
}

function NO2AQI(value: number): number {
  value = Math.floor(value);
  for (let i=0; i <=5; i++) if (value <= ParamsBounds.aqi.no2.upperBounds[i]) return calculateIndex(value, ParamsBounds.aqi.no2.upperBounds[i], ParamsBounds.aqi.no2.lowerBounds[i], ParamsBounds.aqi.upperBounds[i], ParamsBounds.aqi.lowerBounds[i]);
  return ParamsBounds.aqi.upperBounds[5]+1;
}