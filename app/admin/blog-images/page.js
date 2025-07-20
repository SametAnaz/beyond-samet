import Link from 'next/link';
import BlogImagesManagement from './components/BlogImagesManagement';

export default function AdminBlogImagesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Resim Yönetimi</h1>
        <Link
          href="/admin"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          ← Admin Panel
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BlogImagesManagement />
      </div>
    </div>
  );
}
