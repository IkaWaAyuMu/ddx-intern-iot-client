export default function calculateHeatIndex(temperature: number, humidity: number) {
  return (
    - 8.78469475556
    + (1.61139411 * temperature)
    + (2.33854883889 * humidity)
    + (-0.14611605 * temperature * humidity)
    + (-0.012308094 * Math.pow(temperature, 2))
    + (-0.0164248277778 * Math.pow(humidity, 2))
    + (0.002211732 * Math.pow(temperature, 2) * humidity)
    + (0.00072546 * temperature * Math.pow(humidity, 2))
    + (-0.000003582 * Math.pow(temperature, 2) * Math.pow(humidity, 2))
  );
}