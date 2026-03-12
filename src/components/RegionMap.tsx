import { useState } from 'react';
import { Globe } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  color: string;
  hoverColor: string;
}

const regions: Region[] = [
  { id: 'asia', name: 'Asia', color: 'bg-orange-400', hoverColor: 'hover:bg-orange-500' },
  { id: 'europe', name: 'Europe', color: 'bg-red-400', hoverColor: 'hover:bg-red-500' },
  { id: 'americas', name: 'Americas', color: 'bg-yellow-400', hoverColor: 'hover:bg-yellow-500' },
  { id: 'africa', name: 'Africa', color: 'bg-green-400', hoverColor: 'hover:bg-green-500' },
  { id: 'oceania', name: 'Oceania', color: 'bg-blue-400', hoverColor: 'hover:bg-blue-500' },
  { id: 'middle-east', name: 'Middle East', color: 'bg-pink-400', hoverColor: 'hover:bg-pink-500' },
];

interface RegionMapProps {
  onRegionSelect: (region: string) => void;
}

export default function RegionMap({ onRegionSelect }: RegionMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Globe className="text-orange-500 mr-3" size={48} />
          <h2 className="text-4xl font-bold text-gray-900">
            Explore Global Cuisines
          </h2>
        </div>
        <p className="text-xl text-gray-600">
          Select a region to discover authentic recipes from around the world
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onRegionSelect(region.id)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`${region.color} ${region.hoverColor} text-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">{region.name}</h3>
              <div className={`w-16 h-1 bg-white mx-auto rounded-full transform transition-all duration-300 ${
                hoveredRegion === region.id ? 'scale-x-150' : ''
              }`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
