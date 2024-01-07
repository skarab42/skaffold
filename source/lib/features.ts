export const features = ['bin', 'test', 'coverage', 'release'] as const;

export type Features = typeof features;
export type Feature = Features[number];
