export const uploadToCloudinary = async (file) => {
  const cloudName = 'deb5469ms'; // your Cloudinary cloud name
  const uploadPreset = 'ml_default'; // your unsigned upload preset

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("Cloudinary upload error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.secure_url; // Return the image URL
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return null;
  }
};
