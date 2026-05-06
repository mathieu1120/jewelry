export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-sm">Admin</span>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Products</a>
          <a href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900">Orders</a>
        </div>
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← View shop</a>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
