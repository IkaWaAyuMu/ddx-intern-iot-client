import CalculatePMV from "./calculatePMV";

export const ValueBetweenToAQIColor = (value: number, min: number[], max: number[]) => {
  while (min.length < 5) min.push(min[min.length - 1]);
  while (max.length < 5) max.push(max[max.length - 1]);
  return (
    value >= min[0] && value <= max[0] ? undefined :
    value >= min[1] && value <= max[1] ? "#ffff0080" :
    value >= min[2] && value <= max[2] ? "#ff7e0080" :
    value >= min[3] && value <= max[3] ? "#ff000080" :
    value >= min[4] && value <= max[4] ? "#8f3f9780" :
    "#7e002380"
  )
}
export const ValueBetweenToTempColor = (value: number, min: number[], max: number[]) => {
  while (min.length < 5) min.push(min[min.length - 1]);
  while (max.length < 5) max.push(max[max.length - 1]);
  return (
    value < min[4] ? "#000ed480" : value > max[4] ? "#d4270080" :
    value < min[3] ? "#0012d480" : value > max[3] ? "#d44e0080" :
    value < min[2] ? "#003cd480" : value > max[2] ? "#d49b0080" :
    value < min[1] ? "#0086d480" : value > max[1] ? "#d4cd0080" :
    value < min[0] ? "#00c6d480" : value > max[0] ? "#91d40080" :
    undefined
  )
}
export const ValueIncrementToAQIColor = (value: number, max: number[]) => {
  while(max.length < 5) max.push(max[max.length - 1]);
  return (
    value <= max[0] ? undefined :
    value <= max[1] ? "#ffff0080" :
    value <= max[2] ? "#ff7e0080" :
    value <= max[3] ? "#ff000080" :
    value <= max[4] ? "#8f3f9780" :
    "#7e002380"
  )
}

export const PMVtoFavor = (temperature: number, humidity: number): {pmv: number, desc: string, color?: string} => {
  const PMV = CalculatePMV(temperature, temperature, 0, humidity, 1.2, 0.57).pmv
  const favor = (
    Math.abs(PMV) <= 0.2 ? {desc:"Very good", color:undefined} :
    Math.abs(PMV) <= 0.5 ? PMV > 0 ? {desc:"Good", color:"#91d40080"} : {desc:"Good", color:"#00c6d480"} :
    Math.abs(PMV) <= 0.7 ? PMV > 0 ? {desc:"Comfort", color:"#d4cd0080"} : {desc:"Comfort", color:"#0086d480"} :
    Math.abs(PMV) <= 1.0 ? PMV > 0 ? {desc:"Slightly warm", color:"#d49b0080"} : {desc:"Slightly cool", color:"#003cd480"} :
    Math.abs(PMV) <= 1.5 ? PMV > 0 ? {desc:"Warm", color:"#d44e0080"} : {desc:"Cool", color:"#0012d480"} :
    PMV > 0 ? {desc:"Hot", color:"#d4270080"} : {desc:"Cold", color:"#000ed480"}
  );
  return {pmv: PMV, ...favor}
}

export const PMVValuetoFavor = (pmv: number): {pmv: number, desc: string, color?: string} => {
  const PMV = pmv;
  const favor = (
    Math.abs(PMV) <= 0.2 ? {desc:"Very good", color:undefined} :
    Math.abs(PMV) <= 0.5 ? PMV > 0 ? {desc:"Good", color:"#91d40080"} : {desc:"Good", color:"#00c6d480"} :
    Math.abs(PMV) <= 0.7 ? PMV > 0 ? {desc:"Comfort", color:"#d4cd0080"} : {desc:"Comfort", color:"#0086d480"} :
    Math.abs(PMV) <= 1.0 ? PMV > 0 ? {desc:"Slightly warm", color:"#d49b0080"} : {desc:"Slightly cool", color:"#003cd480"} :
    Math.abs(PMV) <= 1.5 ? PMV > 0 ? {desc:"Warm", color:"#d44e0080"} : {desc:"Cool", color:"#0012d480"} :
    PMV > 0 ? {desc:"Hot", color:"#d4270080"} : {desc:"Cold", color:"#000ed480"}
  );
  return {pmv: PMV, ...favor}
}

export const IAQtoFavor = (pm2_5: number, pm10: number, co2: number, hcho: number, tvoc: number): {desc: string, color?: string} => {
  return (
    pm2_5 > 55.5 || pm10 > 255 || co2 > 5000 || hcho > 0.5 || tvoc > 5 ? {desc:"Very bad", color:"#8f3f97"} :
    pm2_5 > 35.5 || pm10 > 155 || co2 > 2500 || hcho > 0.3 || tvoc > 4 ? {desc:"Bad", color:"#ffa0a0"} :
    pm2_5 > 15 || pm10 > 50 || co2 > 1200 || hcho > 0.25 || tvoc > 3 ? {desc:"Moderate", color:"#ff7e80"} :
    pm2_5 > 12 || pm10 > 30 || co2 > 900 || hcho > 0.1 || tvoc > 2 ? {desc:"Good", color:"#ffff80"} :
    {desc:"Very good", color: "#80b080"}
  )
}

export const ValueBetweenToAQIColorDashboard = (value: number, min: number[], max: number[]) => {
  while (min.length < 5) min.push(min[min.length - 1]);
  while (max.length < 5) max.push(max[max.length - 1]);
  return (
    value >= min[0] && value <= max[0] ? "#00ff00" :
    value >= min[1] && value <= max[1] ? "#ffff00" :
    value >= min[2] && value <= max[2] ? "#ff7e00" :
    value >= min[3] && value <= max[3] ? "#ff4040" :
    value >= min[4] && value <= max[4] ? "#8f3f97" :
    "#7e0023"
  )
}
export const ValueIncrementToAQIColorDashboard = (value: number, max: number[]) => {
  while(max.length < 5) max.push(max[max.length - 1]);
  return (
    value <= max[0] ? "#00ff00" :
    value <= max[1] ? "#ffff00" :
    value <= max[2] ? "#ff7e00" :
    value <= max[3] ? "#ff4040" :
    value <= max[4] ? "#8f3f97" :
    "#7e0023"
  )
}