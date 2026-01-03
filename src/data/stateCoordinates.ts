// Approximate center coordinates for Nigerian states on the SVG map (1000x812)
// These are rough approximations based on the SVG viewBox

export interface StateCoordinate {
  name: string;
  x: number;
  y: number;
}

export const stateCoordinates: StateCoordinate[] = [
  { name: "Abia", x: 460, y: 510 },
  { name: "Adamawa", x: 680, y: 300 },
  { name: "Akwa Ibom", x: 485, y: 580 },
  { name: "Anambra", x: 420, y: 460 },
  { name: "Bauchi", x: 570, y: 220 },
  { name: "Bayelsa", x: 390, y: 590 },
  { name: "Benue", x: 520, y: 380 },
  { name: "Borno", x: 700, y: 150 },
  { name: "Cross River", x: 510, y: 530 },
  { name: "Delta", x: 370, y: 520 },
  { name: "Ebonyi", x: 480, y: 470 },
  { name: "Edo", x: 360, y: 460 },
  { name: "Ekiti", x: 300, y: 400 },
  { name: "Enugu", x: 450, y: 440 },
  { name: "Federal Capital Territory", x: 430, y: 320 },
  { name: "Gombe", x: 620, y: 240 },
  { name: "Imo", x: 430, y: 510 },
  { name: "Jigawa", x: 540, y: 130 },
  { name: "Kaduna", x: 450, y: 220 },
  { name: "Kano", x: 500, y: 150 },
  { name: "Katsina", x: 440, y: 120 },
  { name: "Kebbi", x: 290, y: 180 },
  { name: "Kogi", x: 400, y: 380 },
  { name: "Kwara", x: 310, y: 340 },
  { name: "Lagos", x: 210, y: 470 },
  { name: "Nasarawa", x: 490, y: 330 },
  { name: "Niger", x: 360, y: 270 },
  { name: "Ogun", x: 230, y: 440 },
  { name: "Ondo", x: 290, y: 450 },
  { name: "Osun", x: 270, y: 410 },
  { name: "Oyo", x: 250, y: 380 },
  { name: "Plateau", x: 540, y: 310 },
  { name: "Rivers", x: 420, y: 560 },
  { name: "Sokoto", x: 330, y: 120 },
  { name: "Taraba", x: 620, y: 350 },
  { name: "Yobe", x: 640, y: 140 },
  { name: "Zamfara", x: 380, y: 160 }
];

export function getStateCoordinate(stateName: string): StateCoordinate | undefined {
  return stateCoordinates.find(s => s.name.toLowerCase() === stateName.toLowerCase());
}
