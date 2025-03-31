import { toast } from 'react-toastify';

export function validateFile(file) {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  if (file.size > 10 * 1024 * 1024) {
    toast.error('File size exceeds 10MB!');
    return false;
  } else if (!allowedTypes.includes(file.type)) {
    toast.error(
      'Invalid file format! Please upload a JPG, PNG, GIF, WebP or SVG.'
    );
    return false;
  }
  return true;
}
