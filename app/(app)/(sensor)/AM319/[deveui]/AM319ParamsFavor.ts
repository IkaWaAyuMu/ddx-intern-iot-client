import bounds from './AM319bounds.json'

export default function IndoorParamsFavor(data: params ): { index:number, level: string, color: string, recommendation: string } {

  if (data.tvoc != null) {
    let index = TVOC(data.tvoc);
    return {
      index,
      level: bounds.tvoc.label[index],
      color: bounds.tvoc.color[index],
      recommendation: bounds.tvoc.recommendation[index]
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
  tvoc?: number,
}

function TVOC(tvoc: number): number{
  for (let i=0; i < bounds.tvoc.upperBounds.length; i++) if (tvoc <= bounds.tvoc.upperBounds[i]) return i;
  return bounds.tvoc.upperBounds.length;
}

