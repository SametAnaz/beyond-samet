// pages/gallery.js
import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import styles from '../styles/Gallery.module.css'

export async function getStaticProps() {
  const imagesDir = path.join(process.cwd(), 'public/assets/images')
  const fileNames = fs
    .readdirSync(imagesDir)
    .filter(name => /\.(png|jpe?g|gif|webp)$/i.test(name))
  const images = fileNames.map(name => `/assets/images/${name}`)

  return {
    props: { images }
  }
}

export default function Gallery({ images }) {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Gallery</h1>
      <div className={styles.grid}>
        {images.map(src => (
          <div key={src} className={styles.card}>
            <Image
              src={src}
              alt={src.split('/').pop()}
              width={300}
              height={200}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
