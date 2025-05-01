'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/components/Pagination.module.css';

export default function Pagination({ totalItems, itemsPerPage, currentPage, path }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to always show 3 pages in the middle
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + 2);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - 2);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Function to create URL for page link
  const createPageURL = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNum.toString());
    return `${path}?${params.toString()}`;
  };
  
  return (
    <div className={styles.pagination}>
      <div className={styles.paginationControls}>
        {/* Previous Page Button */}
        {currentPage > 1 ? (
          <Link href={createPageURL(currentPage - 1)} className={styles.navButton}>
            &laquo; Önceki
          </Link>
        ) : (
          <span className={`${styles.navButton} ${styles.disabled}`}>
            &laquo; Önceki
          </span>
        )}
        
        {/* Page Numbers */}
        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
            ) : (
              <Link
                key={`page-${page}`}
                href={createPageURL(page)}
                className={`${styles.pageLink} ${page === currentPage ? styles.active : ''}`}
              >
                {page}
              </Link>
            )
          ))}
        </div>
        
        {/* Next Page Button */}
        {currentPage < totalPages ? (
          <Link href={createPageURL(currentPage + 1)} className={styles.navButton}>
            Sonraki &raquo;
          </Link>
        ) : (
          <span className={`${styles.navButton} ${styles.disabled}`}>
            Sonraki &raquo;
          </span>
        )}
      </div>
      
      <div className={styles.pageInfo}>
        Toplam {totalItems} blog yazısı ({currentPage}/{totalPages} sayfa)
      </div>
    </div>
  );
} 