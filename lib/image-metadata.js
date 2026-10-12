import sharp from 'sharp';
export async function imageDimensions(file) {
  const metadata = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
  if (!['jpeg', 'png', 'gif', 'webp'].includes(metadata.format) || !metadata.width || !metadata.height) throw new Error('Geçerli bir JPG, PNG, GIF veya WebP görseli seçin');
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  return { width: rotated ? metadata.height : metadata.width, height: rotated ? metadata.width : metadata.height };
}
