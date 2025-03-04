const escapeCSV = (text: string): string => {
  return `"${text.replace(/"/g, '""')}"`;
};

const formatKeywords = (keywords: string[]): string => {
  return keywords.join(', ');
};

export function generateCSVData(images: ImageResult[]): string {
  const completedImages = images.filter(img => 
    img.status === 'completed' && img.output
  );
  
  if (completedImages.length === 0) {
    throw new Error("No completed descriptions to download");
  }

  // Prepare CSV content
  const headers = ["Filename", "Description", "Keywords"];
  const rows = [
    headers,
    ...completedImages.map(img => [
      img.file.name,
      img.output?.description || '',
      formatKeywords(img.output?.keywords || [])
    ])
  ];

  // Convert to CSV format
  return rows
    .map(row => row.map(escapeCSV).join(','))
    .join('\n');
}
