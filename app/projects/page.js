import ProjectCards from '@/components/ProjectCards';
import styles from '@/styles/pages/projects.module.css';
export const metadata = { title: 'Projeler', description: 'Backend, AI ve IoT projelerimin geliştirme süreçleri.', alternates: { canonical: '/projects' } };
export default function ProjectsPage() {
  return <section className={styles.page}><header className={styles.header}><p className={styles.category}>Fikirden uygulamaya</p><h1>Projelerim</h1><p>Çözdüğüm problemler, teknik kararlar ve geliştirme süreçlerinden seçilmiş çalışmalar.</p></header><ProjectCards /></section>;
}
