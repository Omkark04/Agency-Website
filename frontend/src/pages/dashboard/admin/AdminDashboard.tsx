import React, { useEffect, useState } from 'react';
import KPICard from '../../../components/dashboard/KPICard';
import { listOrders } from '../../../api/orders';
import { listUsers } from '../../../api/users';
import { listServices } from '../../../api/services';
import { listDepartments } from '../../../api/departments';
import { Sidebar } from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [departmentsCount, setDepartmentsCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: orders }, { data: users }, { data: services }, { data: departments }] = await Promise.all([
          listOrders(),
          listUsers({ role: 'client' }),
          listServices(),
          listDepartments()
        ]);
        setOrdersCount(orders.length);
        setClientsCount(users.length);
        setServicesCount(services.length);
        setDepartmentsCount(departments.length);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar isOpen={true} onClose={() => {}} userRole='admin' />
      <div className="flex-1">
        <Header title="Admin Dashboard" onMenuClick={handleMenuClick} />
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard title="Total Orders" value={ordersCount} icon={<feFuncA/>}/>
            <KPICard title="Clients" value={clientsCount} icon={<feFuncA/>} />
            <KPICard title="Services" value={servicesCount} icon={<feFuncA/>} />
            <KPICard title="Departments" value={departmentsCount} icon={<feFuncA/>} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/dashboard/services" className="block p-3 border rounded hover:bg-gray-50">Manage Services</Link>
                <Link to="/dashboard/departments" className="block p-3 border rounded hover:bg-gray-50">Manage Departments</Link>
                <Link to="/dashboard/price-cards" className="block p-3 border rounded hover:bg-gray-50">Manage Price Cards</Link>
                <Link to="/dashboard/users" className="block p-3 border rounded hover:bg-gray-50">Manage Users</Link>
                <Link to="/dashboard/orders" className="block p-3 border rounded hover:bg-gray-50">Manage Orders</Link>
                <Link to="/dashboard/media" className="block p-3 border rounded hover:bg-gray-50">Media Library</Link>
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
              {/* lightweight preview: fetch 5 latest */}
              <RecentOrdersPreview />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const RecentOrdersPreview = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await listOrders({ ordering: '-created_at', page_size: 5 });
        setOrders(res.data);
      } catch (err) { console.error(err); }
    })();
  }, []);
  return (
    <ul className="divide-y">
      {orders.map(o => (
        <li key={o.id} className="py-2 flex justify-between">
          <div>
            <div className="font-medium">{o.title}</div>
            <div className="text-sm text-gray-500">{o.price} • {o.status}</div>
          </div>
          <div className="text-sm text-gray-400">{new Date(o.created_at).toLocaleDateString()}</div>
        </li>
      ))}
      {orders.length === 0 && <li className="py-4 text-sm text-gray-500">No recent orders</li>}
    </ul>
  );
};

export default AdminDashboard;
