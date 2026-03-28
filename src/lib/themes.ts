export type Theme = {
  name: string;
  label: string;
  color: string; // HSL string for the color swatch
};

export const themes: Theme[] = [
  {
    name: 'fanta',
    label: 'Fanta',
    color: 'hsl(24.6 95% 53.1%)',
  },
  {
    name: 'red',
    label: 'Red',
    color: 'hsl(0 84.2% 60.2%)',
  },
  {
    name: 'yellow',
    label: 'Yellow',
    color: 'hsl(47.9 95.8% 53.1%)',
  },
  {
    name: 'blue',
    label: 'Blue',
    color: 'hsl(221.2 83.2% 53.3%)',
  },
  {
    name: 'green',
    label: 'Green',
    color: 'hsl(142.1 76.2% 36.3%)',
  },
  {
    name: 'violet',
    label: 'Violet',
    color: 'hsl(262.1 83.3% 57.8%)',
  },
  {
    name: 'purple',
    label: 'Purple',
    color: 'hsl(270 95% 53.1%)',
  },
  {
    name: 'gold',
    label: 'Gold',
    color: 'hsl(45 95% 53.1%)',
  },
  {
    name: 'pink',
    label: 'Pink',
    color: 'hsl(340.9 95.8% 68.4%)',
  },
];
