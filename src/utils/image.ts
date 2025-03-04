export async function createThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > 400) { // Reduced max width/height
        height *= 400 / width;
        width = 400;
      } else if (height > 400) { // Reduced max width/height
        width *= 400 / height;
        height = 400;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.8
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export function getBase64FromBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}
