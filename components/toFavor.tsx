import CalculatePMV from "./calculatePMV";

export const ValueBetweenToAQIColor = (value: number, min: number[], max: number[]) => {
  while (min.length < 5) min.push(min[min.length - 1]);
  while (max.length < 5) max.push(max[max.length - 1]);
  return (
    value >= min[0] && value <= max[0] ? undefined :
    value >= min[1] && value <= max[1] ? "#ffff0033" :
    value >= min[2] && value <= max[2] ? "#ff7e0033" :
    value >= min[3] && value <= max[3] ? "#ff000033" :
    value >= min[4] && value <= max[4] ? "#8f3f9733" :
    "#7e002333"
  )
}
export const ValueIncrementToAQIColor = (value: number, max: number[]) => {
  while(max.length < 5) max.push(max[max.length - 1]);
  return (
    value <= max[0] ? undefined :
    value <= max[1] ? "#ffff0033" :
    value <= max[2] ? "#ff7e0033" :
    value <= max[3] ? "#ff000033" :
    value <= max[4] ? "#8f3f9733" :
    "#7e002333"
  )
}

export const PMVtoFavor = (temperature: number, humidity: number): {pmv: number, desc: string, color?: string} => {
  const PMV = CalculatePMV(temperature, temperature, 0, humidity, 1.2, 0.57).pmv
  const favor = (
    Math.abs(PMV) <= 0.2 ? {desc:"Very good", color:undefined} :
    Math.abs(PMV) <= 0.5 ? PMV > 0 ? {desc:"Good", color:"#91d40033"} : {desc:"Good", color:"#00c6d433"} :
    Math.abs(PMV) <= 0.7 ? PMV > 0 ? {desc:"Comfort", color:"#d4cd0033"} : {desc:"Comfort", color:"#0086d433"} :
    Math.abs(PMV) <= 1.0 ? PMV > 0 ? {desc:"Slightly warm", color:"#d49b0033"} : {desc:"Slightly cool", color:"#003cd433"} :
    Math.abs(PMV) <= 1.5 ? PMV > 0 ? {desc:"Warm", color:"#d44e0033"} : {desc:"Cool", color:"#0012d433"} :
    PMV > 0 ? {desc:"Hot", color:"#d4270033"} : {desc:"Cold", color:"#000ed433"}
  );
  return {pmv: PMV, ...favor}
}

export const IAQtoFavor = (pm2_5: number, pm10: number, co2: number, hcho: number, tvoc: number): {desc: string, color?: string} => {
  return (
    pm2_5 > 55.5 || pm10 > 255 || co2 > 5000 || hcho > 0.5 || tvoc > 5 ? {desc:"Very bad", color:"#7e002333"} :
    pm2_5 > 35.5 || pm10 > 155 || co2 > 2500 || hcho > 0.3 || tvoc > 4 ? {desc:"Bad", color:"#6b6a6a"} :
    pm2_5 > 15 || pm10 > 50 || co2 > 1200 || hcho > 0.25 || tvoc > 3 ? {desc:"Moderate", color:"#c4c4c433"} :
    pm2_5 > 12 || pm10 > 30 || co2 > 900 || hcho > 0.1 || tvoc > 2 ? {desc:"Good", color:"#c4c4c433"} :
    {desc:"Very good", color: undefined}
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