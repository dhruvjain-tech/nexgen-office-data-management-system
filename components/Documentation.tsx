
import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 border-l-4 border-blue-500 pl-4">System Architecture</h2>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <p className="text-slate-600 leading-relaxed">
            NexGen Office utilizes a <strong>Service-Oriented Frontend Architecture</strong>. The data management logic is abstracted into a specialized <code>DataService</code>, ensuring UI components remain decoupled from persistence logic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-800 mb-2">Access Control (RBAC)</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Admin-restricted modules</li>
                <li>• Dynamic role assignment</li>
                <li>• Account status toggling</li>
                <li>• Secure password overrides</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-800 mb-2">Data Engine</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Time-series analytics</li>
                <li>• JSON-based persistence</li>
                <li>• CSV/PDF export logic</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-800 mb-2">Core UX</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Contextual Modal flows</li>
                <li>• Multi-state pagination</li>
                <li>• Real-time search indexing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 border-l-4 border-blue-500 pl-4">Enhanced Database Schema</h2>
        <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl font-mono text-xs overflow-x-auto shadow-2xl">
          <pre>{`
-- Users Table: Extended for Management
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX (role, status)
);

-- Inventory Table: Asset Tracking
CREATE TABLE inventory (
    id VARCHAR(50) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INT DEFAULT 0,
    unit_price_inr DECIMAL(15, 2),
    status ENUM('In Stock', 'Low Stock', 'Out of Stock'),
    location VARCHAR(100),
    last_updated TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit Log Concept (Planned)
CREATE TABLE system_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    action_type VARCHAR(50),
    user_id VARCHAR(50),
    description TEXT,
    timestamp DATETIME
);
          `}</pre>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 border-l-4 border-blue-500 pl-4">Management API (Simulated)</h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">GET</span>
              <code className="text-sm font-bold text-slate-800">/api/v1/users</code>
            </div>
            <p className="text-xs text-slate-500">Retrieves full registry of users. Supports query params: <code>?role=ADMIN&status=ACTIVE</code>.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">PATCH</span>
              <code className="text-sm font-bold text-slate-800">/api/v1/users/:id/status</code>
            </div>
            <p className="text-xs text-slate-500">Toggles account access. Payload: <code>{ "{ status: 'INACTIVE' }" }</code>. Triggers session invalidation for targets.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 border-l-4 border-blue-500 pl-4">Resume & Interview FAQ</h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2 italic text-sm">Resume Bullet Point:</h4>
            <p className="text-sm text-slate-600">
              "Engineered a full-scale Administrative User Management module with Role-Based Access Control (RBAC). Implemented features for dynamic role assignment, account lifecycle management (Active/Inactive states), and administrative password recovery, ensuring secure and scalable workforce management."
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">How do you secure user data in this system?</h4>
            <p className="text-sm text-slate-600">
              "In a production environment, we would use bcrypt or Argon2 for password hashing, enforce HTTPS/TLS for all traffic, and implement JWT-based session management with short-lived tokens and refresh rotations."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
