module.exports = {
  planets: [
    { name: 'Mercury', radius: 42, size: 8, speed: 0.0040, texture: 'textures/mercury.jpg', tint: '#b7b7b7',
      diameter: '4,879 km', orbitalPeriod: '88 days', distance: '57.9 million km', fact: 'Smallest planet; surface temperature swings from −173°C to 427°C.' },
    { name: 'Venus', radius: 68, size: 11, speed: 0.0032, texture: 'textures/venus.jpg', tint: '#d9b38c',
      diameter: '12,104 km', orbitalPeriod: '225 days', distance: '108.2 million km', fact: 'Hottest planet (~465°C) due to runaway greenhouse effect; thick CO₂ atmosphere.' },
    { name: 'Earth', radius: 96, size: 12, speed: 0.0024, texture: 'textures/earth.jpg', tint: '#4f83ff',
      diameter: '12,742 km', orbitalPeriod: '365.25 days', distance: '149.6 million km (1 AU)', fact: 'Only known planet with liquid water and life.' },
    { name: 'Mars', radius: 124, size: 10, speed: 0.0020, texture: 'textures/mars.jpg', tint: '#c1440e',
      diameter: '6,779 km', orbitalPeriod: '687 days', distance: '227.9 million km', fact: 'Olympus Mons is the largest volcano in the Solar System; two moons: Phobos and Deimos.' },
    { name: 'Jupiter', radius: 160, size: 20, speed: 0.0014, texture: 'textures/jupiter.jpg', tint: '#d2b48c',
      diameter: '139,820 km', orbitalPeriod: '11.9 years', distance: '778.5 million km', fact: 'Largest planet; a gas giant with 79+ moons and the Great Red Spot storm.' },
    { name: 'Saturn', radius: 200, size: 18, speed: 0.0011, texture: 'textures/saturn.jpg', tint: '#e3c27a', ring: true, ringTexture: 'textures/saturn_ring.png',
      diameter: '116,460 km', orbitalPeriod: '29.5 years', distance: '1.43 billion km', fact: 'Visible ring system of ice and rock; less dense than water; 82+ moons.' },
    { name: 'Uranus', radius: 238, size: 15, speed: 0.0008, texture: 'textures/uranus.jpg', tint: '#7ad7f0',
      diameter: '50,724 km', orbitalPeriod: '84 years', distance: '2.87 billion km', fact: 'Ice giant; rotates on its side with an axial tilt of 98°; 27 known moons.' },
    { name: 'Neptune', radius: 276, size: 15, speed: 0.0006, texture: 'textures/neptune.jpg', tint: '#4169e1',
      diameter: '49,244 km', orbitalPeriod: '165 years', distance: '4.50 billion km', fact: 'Farthest planet; methane gives it blue color; supersonic winds up to 2,100 km/h.' }
  ],
  preloadAssets: [
    ...['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(p => `textures/${p}.jpg`),
    'textures/saturn_ring.png',
    'images/lebron-sunshine.png',
    'audio/Lebron James flashbang.mp3'
  ]
};
