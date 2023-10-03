import IndoorBounds from '../assets/indoorBounds.json'

export default function IndoorParamsFavor(data: params ): { index:number, level: string, color: string, recommendation: string } {

  if (data.pmv != null) {
    let index = PMV(data.pmv);
    return {
      index,
      level: IndoorBounds.pmv.label[index],
      color: "#fff",
      recommendation: IndoorBounds.pmv.recommendation[index]
    }
  }
  if (data.pm2_5 != null) {
    let index = PM2_5(data.pm2_5);
    return {
      index,
      level: IndoorBounds.pm2_5.label[index],
      color: IndoorBounds.pm2_5.color[index],
      recommendation: IndoorBounds.pm2_5.recommendation[index]
    }
  }
  if (data.pm10 != null) {
    let index = PM10(data.pm10);
    return {
      index,
      level: IndoorBounds.pm10.label[index],
      color: IndoorBounds.pm10.color[index],
      recommendation: IndoorBounds.pm10.recommendation[index]
    }
  }
  if (data.hcho != null) {
    let index = HCHO(data.hcho);
    return {
      index,
      level: IndoorBounds.hcho.label[index],
      color: IndoorBounds.hcho.color[index],
      recommendation: IndoorBounds.hcho.recommendation[index]
    }
  }
  if (data.co2 != null) {
    let index = CO2(data.co2);
    return {
      index,
      level: IndoorBounds.co2.label[index],
      color: IndoorBounds.co2.color[index],
      recommendation: IndoorBounds.co2.recommendation[index]
    }
  }
  if (data.tvoc != null) {
    let index = TVOC(data.tvoc);
    return {
      index,
      level: IndoorBounds.tvoc.label[index],
      color: IndoorBounds.tvoc.color[index],
      recommendation: IndoorBounds.tvoc.recommendation[index]
    }
  }

  return {
    index: 0,
    level: "",
    color: "#000",
    recommendation: ""
  }

}

type params = {
  pmv?: number,
  pm2_5?: number,
  pm10?: number,
  hcho?: number,
  co2?: number,
  tvoc?: number,
}

function PMV(pmv:number): number{
  for (let i=0; i < IndoorBounds.pmv.upperBounds.length; i++) {
    if (i < IndoorBounds.pmv.upperBounds.length && pmv < IndoorBounds.pmv.upperBounds[i]) return i;
    else if (pmv <= IndoorBounds.pmv.upperBounds[i]) return i;
  }
  return IndoorBounds.pmv.upperBounds.length;
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

