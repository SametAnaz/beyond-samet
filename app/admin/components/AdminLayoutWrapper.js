'use client';

import AdminSidebar from './AdminSidebar';

export default function AdminLayoutWrapper({ children, title, description, actions }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-content">
        {(title || description || actions) && (
          <div className="admin-header">
            <div className="admin-title">
              {title && <h1>{title}</h1>}
              {description && <p>{description}</p>}
            </div>
            {actions && (
              <div className="admin-actions">
                {actions}
              </div>
            )}
          </div>
        )}
        
        <div className="admin-main">
          {children}
        </div>
      </div>
    </div>
  );
}
