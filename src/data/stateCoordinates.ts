// Geographic center coordinates for Nigerian states (lat/lng)
// Used for accurate map positioning

export interface StateCoordinate {
  name: string;
  lat: number;
  lng: number;
}

export const stateCoordinates: StateCoordinate[] = [
  { name: "Abia", lat: 5.4527, lng: 7.5248 },
  { name: "Adamawa", lat: 9.3265, lng: 12.3984 },
  { name: "Akwa Ibom", lat: 5.0377, lng: 7.9128 },
  { name: "Anambra", lat: 6.2209, lng: 7.0670 },
  { name: "Bauchi", lat: 10.7761, lng: 9.9992 },
  { name: "Bayelsa", lat: 4.7719, lng: 6.0699 },
  { name: "Benue", lat: 7.3369, lng: 8.7404 },
  { name: "Borno", lat: 11.8846, lng: 13.1520 },
  { name: "Cross River", lat: 5.8702, lng: 8.5988 },
  { name: "Delta", lat: 5.7040, lng: 5.9339 },
  { name: "Ebonyi", lat: 6.2649, lng: 8.0137 },
  { name: "Edo", lat: 6.6342, lng: 5.9304 },
  { name: "Ekiti", lat: 7.7190, lng: 5.3110 },
  { name: "Enugu", lat: 6.5364, lng: 7.4356 },
  { name: "Federal Capital Territory", lat: 9.0765, lng: 7.3986 },
  { name: "Gombe", lat: 10.2897, lng: 11.1673 },
  { name: "Imo", lat: 5.5720, lng: 7.0588 },
  { name: "Jigawa", lat: 12.2280, lng: 9.5616 },
  { name: "Kaduna", lat: 10.3764, lng: 7.7095 },
  { name: "Kano", lat: 11.7471, lng: 8.5247 },
  { name: "Katsina", lat: 12.9816, lng: 7.6223 },
  { name: "Kebbi", lat: 11.4942, lng: 4.2333 },
  { name: "Kogi", lat: 7.7337, lng: 6.6906 },
  { name: "Kwara", lat: 8.9669, lng: 4.3874 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Nasarawa", lat: 8.4999, lng: 8.1997 },
  { name: "Niger", lat: 9.9309, lng: 5.5983 },
  { name: "Ogun", lat: 7.1600, lng: 3.3500 },
  { name: "Ondo", lat: 6.9149, lng: 5.1478 },
  { name: "Osun", lat: 7.5629, lng: 4.5200 },
  { name: "Oyo", lat: 8.1574, lng: 3.6147 },
  { name: "Plateau", lat: 9.2182, lng: 9.5175 },
  { name: "Rivers", lat: 4.8396, lng: 6.9112 },
  { name: "Sokoto", lat: 13.0533, lng: 5.2476 },
  { name: "Taraba", lat: 7.9994, lng: 10.7740 },
  { name: "Yobe", lat: 12.2939, lng: 11.4390 },
  { name: "Zamfara", lat: 12.1222, lng: 6.2236 }
];

export function getStateCoordinate(stateName: string): StateCoordinate | undefined {
  return stateCoordinates.find(s => s.name.toLowerCase() === stateName.toLowerCase());
}
