import React from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  {
    id: 1,
    name: 'Full Field',
    image: '/images/full-field.jpg',
    type: 'full',
  },
  {
    id: 2,
    name: 'Small Sided',
    image: '/images/small-sided.jpg',
    type: 'small',
  },
  {
    id: 3,
    name: 'Open Play',
    image: '/images/open-play.jpg',
    type: 'open',
  },
];

const BrowseByCategory = () => {
  const router = useRouter();

  const handleClick = (type) => {
    router.push(`/browse?type=${type}`);
  };

  return (
    <section className="py-10 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {categories.map(({ id, name, image, type }) => (
          <div
            key={id}
            onClick={() => handleClick(type)}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(type)}
            tabIndex={0}
            role="button"
            aria-label={`Browse ${name}`}
            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <img
              src={image}
              alt={name}
              className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-3 text-lg font-semibold group-hover:bg-opacity-70 transition-colors duration-300">
              {name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrowseByCategory;
