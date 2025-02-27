import { useState, useEffect } from 'react';

interface GladiatorImagesDB {
  images: Record<string, string>;
}

export function useGladiatorImages() {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // API'den imajları yükle
    fetch('/api/gladiator-images')
      .then(res => res.json())
      .then((data: GladiatorImagesDB) => {
        setImages(data.images);
      })
      .catch(error => {
        console.error('Failed to load gladiator images:', error);
        // Hata durumunda local storage'ı kontrol et
        const storedImages = localStorage.getItem('gladiator-images');
        if (storedImages) {
          setImages(JSON.parse(storedImages));
        }
      });
  }, []);

  const setGladiatorImage = async (address: string, imageUrl: string) => {
    // Önce state'i güncelle
    const updatedImages = {
      ...images,
      [address]: imageUrl
    };
    setImages(updatedImages);

    try {
      // API'ye gönder
      const response = await fetch('/api/gladiator-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update gladiator image');
      }

      // Yedek olarak local storage'a da kaydet
      localStorage.setItem('gladiator-images', JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to update gladiator image:', error);
      // Hata durumunda sadece local storage'a kaydet
      localStorage.setItem('gladiator-images', JSON.stringify(updatedImages));
    }
  };

  const getGladiatorImage = (address: string) => {
    // Önce state'den kontrol et
    if (images[address]) {
      return images[address];
    }

    // State'de yoksa local storage'ı kontrol et
    const storedImages = localStorage.getItem('gladiator-images');
    if (storedImages) {
      const parsedImages = JSON.parse(storedImages);
      if (parsedImages[address]) {
        return parsedImages[address];
      }
    }

    // Hiçbir yerde bulunamazsa varsayılan imajı döndür
    return generateDefaultImage();
  };

  // Varsayılan imaj olarak @gonad.png kullan
  const generateDefaultImage = () => {
    return '/gonad.png';
  };

  return {
    setGladiatorImage,
    getGladiatorImage
  };
} 