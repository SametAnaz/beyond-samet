import AuthGuard from '../components/AuthGuard';
import AdminLayoutWrapper from '../components/AdminLayoutWrapper';
import GalleryManagement from './components/GalleryManagement';

export const metadata = {
  title: 'Galeri Yönetimi - Admin',
  description: 'Galeri resimlerini yönetin',
};

export default function GalleryAdminPage() {
  return (
    <AuthGuard>
      <AdminLayoutWrapper 
        title="Galeri Yönetimi"
        description="Galeri resimlerini yükleyin, düzenleyin ve silin"
      >
        <GalleryManagement />
      </AdminLayoutWrapper>
    </AuthGuard>
  );
}
