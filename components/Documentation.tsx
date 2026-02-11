
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
              <h4 className="font-bold text-slate-800 mb-2">Analytics Engine</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Multi-timeframe sales bucketing</li>
                <li>• Real-time employee leaderboard</li>
                <li>• Individual performance drill-down</li>
                <li>• Dynamic chart re-scaling (Recharts)</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-800 mb-2">Data Integrity</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Real-time stock validation</li>
                <li>• JSON-based persistence</li>
                <li>• Automated status updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 border-l-4 border-blue-500 pl-4">Reporting SQL Schemas</h2>
        <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl font-mono text-xs overflow-x-auto shadow-2xl">
          <pre>{`
-- Aggregating Sales by Employee & Month
SELECT 
    u.username,
    SUM(o.total_amount) as gross_sales,
    COUNT(o.id) as volume,
    AVG(o.total_amount) as ticket_size
FROM users u
JOIN sales_orders o ON u.id = o.user_id
WHERE o.status = 'APPROVED'
GROUP BY u.username, DATE_TRUNC('month', o.created_at);

-- Identifying Top Performers
SELECT 
    username, 
    SUM(total_amount) as total
FROM sales_orders
WHERE status = 'APPROVED'
GROUP BY username
ORDER BY total DESC
LIMIT 1;
          `}</pre>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 border-l-4 border-blue-500 pl-4">Interview Readiness</h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-2 text-sm italic">Performance Analytics Logic:</h4>
            <p className="text-sm text-slate-600">
              "The system implements a complex aggregation engine. It filters 'APPROVED' orders and uses high-order JS functions to bucket data into Daily, Weekly, and Monthly timeframes. This simulates high-performance SQL window functions and aggregations directly in the client layer."
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-2 text-sm italic">Data Reliability:</h4>
            <p className="text-sm text-slate-600">
              "To ensure chart accuracy, the reporting engine only processes orders with a 'FINALIZED' status (APPROVED). This prevents projections or pending leads from skewing actual corporate revenue figures."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
