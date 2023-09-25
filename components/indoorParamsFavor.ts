import IndoorBounds from '../assets/indoorBounds.json'

export default function IndoorParamsFavor(data: params ): { level: string, color: string } {

  if (data.pm2_5 != null) {
    let index = PM2_5(data.pm2_5);
    return {
      level: IndoorBounds.pm2_5.label[index],
      color: IndoorBounds.pm2_5.color[index]
    }
  }
  else if (data.pm10 != null) {
    let index = PM10(data.pm10);
    return {
      level: IndoorBounds.pm10.label[index],
      color: IndoorBounds.pm10.color[index]
    }
  }
  else if (data.hcho != null) {
    let index = HCHO(data.hcho);
    return {
      level: IndoorBounds.hcho.label[index],
      color: IndoorBounds.hcho.color[index]
    }
  }
  else if (data.co2 != null) {
    let index = CO2(data.co2);
    return {
      level: IndoorBounds.co2.label[index],
      color: IndoorBounds.co2.color[index]
    }
  }
  else if (data.tvoc != null) {
    let index = TVOC(data.tvoc);
    return {
      level: IndoorBounds.tvoc.label[index],
      color: IndoorBounds.tvoc.color[index]
    }
  }

  return {
    level: "",
    color: "#000"
  }

}

type params = {
  pm2_5?: number,
  pm10?: number,
  hcho?: number,
  co2?: number,
  tvoc?: number,
}

function PM2_5(pm2_5: number): number{
  for (let i=0; i < IndoorBounds.pm2_5.upperBounds.length; i++) if (pm2_5 <= IndoorBounds.pm2_5.upperBounds[i]) return i;
  return IndoorBounds.pm2_5.upperBounds.length;
}

function PM10(pm10: number): number{
  for (let i=0; i < IndoorBounds.pm10.upperBounds.length; i++) if (pm10 <= IndoorBounds.pm10.upperBounds[i]) return i;
  return IndoorBounds.pm10.upperBounds.length;
}

function HCHO(hcho: number): number{
  for (let i=0; i < IndoorBounds.hcho.upperBounds.length; i++) if (hcho <= IndoorBounds.hcho.upperBounds[i]) return i;
  return IndoorBounds.hcho.upperBounds.length;
}

function CO2(co2: number): number{
  for (let i=0; i < IndoorBounds.co2.upperBounds.length; i++) if (co2 <= IndoorBounds.co2.upperBounds[i]) return i;
  return IndoorBounds.co2.upperBounds.length;
}

function TVOC(tvoc: number): number{
  for (let i=0; i < IndoorBounds.tvoc.upperBounds.length; i++) if (tvoc <= IndoorBounds.tvoc.upperBounds[i]) return i;
  return IndoorBounds.tvoc.upperBounds.length;
}

