export const geocodeAddress = async (
  address: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const response = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=6823bfaf7f321173959958evkeb8862`
    );

    if (!response.ok) {
      console.error('Geocode API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data.length) {
      console.warn('No geocode results found');
      return null;
    }

    const { lat, lon } = data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch (error) {
    console.error('Error fetching geocode data:', error);
    return null;
  }
};
