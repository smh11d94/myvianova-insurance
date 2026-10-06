// Business details shown across the site.
// TODO: replace every placeholder below with the real values before launch.
export const site = {
  brand: 'MyVianova Insurance',
  shortBrand: 'MyVianova',
  licenseLabel: 'LLQP-licensed life & health insurance advisor',
  licenseNumber: 'XXXXXXX',
  licensedProvinces: ['BC'],
  phone: '+1 (778) 922-7470',
  phoneHref: 'tel:+17789227470',
  email: 'hello@myvianova.ca',
  city: 'Vancouver, BC',
  url: 'https://www.myvianova.ca',
} as const;

export const provinces = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
] as const;
export type Province = (typeof provinces)[number];
