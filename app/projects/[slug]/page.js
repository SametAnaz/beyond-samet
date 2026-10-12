import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/projects';
import styles from '@/styles/pages/projects.module.css';
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params; const project = projects.find(project => project.slug === slug);
  return project ? { title: project.title, description: project.description, alternates: { canonical: `/projects/${slug}` } } : { title: 'Proje bulunamadı' };
}
export default async function ProjectPage({ params }) {
  const { slug } = await params; const project = projects.find(project => project.slug === slug);
  if (!project) notFound();
  return <article className={styles.detail}><Link href="/projects">← Tüm projeler</Link><header className={styles.header}><p className={styles.category}>{project.category}</p><h1>{project.title}</h1><p>{project.description}</p><p>{project.role}</p><ul className={styles.tags}>{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul></header><Image src={project.image} alt={project.imageAlt} width={1200} height={720} sizes="(max-width: 1000px) 92vw, 960px" className={styles.detailImage} priority />{[['Problem', project.problem], ['Yaklaşım', project.approach], ['Geliştirme süreci', project.outcome]].map(([title, text]) => <section key={title} className={styles.detailSection}><h2>{title}</h2><p>{text}</p></section>)}<div className={styles.links}><Link href={`/blog/${slug}`}>Geliştirme yazısını oku →</Link>{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}{project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">Demo ↗</a>}</div></article>;
}
