import Image from 'next/image';
import Link from 'next/link';
import { projects } from '@/lib/projects';
import styles from '@/styles/pages/projects.module.css';
export default function ProjectCards() {
  return <div className={styles.grid}>{projects.map(project => <article key={project.slug} className={styles.card}>
    <Link href={`/projects/${project.slug}`} className={styles.imageLink}><Image src={project.image} alt={project.imageAlt} width={760} height={460} sizes="(max-width: 700px) 92vw, 380px" className={styles.image} /></Link>
    <div className={styles.cardBody}><p className={styles.category}>{project.category}</p><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p><ul className={styles.tags} aria-label="Teknolojiler">{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul><div className={styles.links}><Link href={`/projects/${project.slug}`}>Projeyi incele →</Link>{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}{project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">Demo ↗</a>}</div></div>
  </article>)}</div>;
}
