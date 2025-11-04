import { Outlet, Link } from "react-router-dom";
import {
  HomeIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CubeIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-5 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">☕ Admin Panel</h2>

        <nav className="space-y-2">
          <Link to="/admin" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <HomeIcon className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/admin/add-product" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <Squares2X2Icon className="w-5 h-5" /> Thêm sản phẩm
          </Link>
          <Link to="/admin/products" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <TableCellsIcon className="w-5 h-5" /> Xem sản phẩm
          </Link>
          <Link to="/admin/category" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <Squares2X2Icon className="w-5 h-5" /> Loại sản phẩm
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <CubeIcon className="w-5 h-5" /> Đơn hàng
          </Link>
          <Link to="/admin/users" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <UserIcon className="w-5 h-5" /> Người dùng
          </Link>
          <Link to="/admin/add-admin" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <UserPlusIcon className="w-5 h-5" /> Thêm admin
          </Link>
          <Link to="/admin/admins" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <UsersIcon className="w-5 h-5" /> Danh sách admin
          </Link>
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <Link to="/" className="flex items-center gap-2 text-red-400 hover:text-red-500">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Thoát
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
