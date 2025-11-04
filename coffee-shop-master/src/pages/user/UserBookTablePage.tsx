import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

// ----------- INTERFACES -----------
interface Table {
  id: number;
  tableName: string;
  position: string;
  capacity: number;
  status: string;
}

interface Product {
  id: number;
  title: string;
  priceSmall: number;
  priceMedium?: number;
  priceLarge?: number;
}

interface Reservation {
  id: number;
  status: string;
  timeStart: string;
  table: Table;
  totalPrice?: number;
  products?: any[];
}

interface SelectedItem {
  qty: number;
  size: "S" | "M" | "L";
}

// ----------- COMPONENT -----------
export default function UserBookTablePage() {
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: SelectedItem }>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy token đăng nhập
  const getToken = () => {
    const data = localStorage.getItem("coffee-shop-auth-user");
    if (!data) return null;
    try {
      return JSON.parse(data).token;
    } catch {
      return null;
    }
  };

  // ✅ Load dữ liệu bàn + menu + đặt bàn
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tableRes, menuRes] = await Promise.all([
        fetch(`${API_BASE}/public/tables/available`),
        fetch(`${API_BASE}/home/products`),
      ]);

      const tableData = await tableRes.json();
      const menuData = await menuRes.json();

      setAvailableTables(tableData.availableTables || []);
      setMenuItems(menuData.products || []);

      const token = getToken();
      if (token) {
        const resvRes = await fetch(`${API_BASE}/user/reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resvRes.ok) {
          const resvData = await resvRes.json();
          setReservations(resvData.reservations || []);
        }
      }
    } catch (e) {
      console.error("❌ Lỗi khi tải dữ liệu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Chọn size
  const handleSizeChange = (productId: number, size: "S" | "M" | "L") => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { qty: 0 }),
        size,
      },
    }));
  };

  // ✅ Chọn số lượng
  const handleQuantityChange = (productId: number, qty: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { size: "M" }),
        qty,
      },
    }));
  };

  // ✅ Tính tổng tạm tính
  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [id, item]) => {
      const product = menuItems.find((p) => p.id === Number(id));
      if (!product) return total;

      let price = 0;
      switch (item.size) {
        case "S":
          price = product.priceSmall ?? 0;
          break;
        case "M":
          price = product.priceMedium ?? product.priceSmall ?? 0;
          break;
        case "L":
          price = product.priceLarge ?? product.priceSmall ?? 0;
          break;
      }
      return total + price * (item.qty || 0);
    }, 0);
  };

  // ✅ Gửi đặt bàn
 // ✅ Gửi đặt bàn
const handleBook = async (tableId: number) => {
  const token = getToken();
  if (!token) {
    alert("⚠️ Bạn cần đăng nhập để đặt bàn!");
    return;
  }

  const items = Object.entries(selectedItems)
    .filter(([_, item]) => item.qty > 0)
    .map(([id, item]) => ({
      productId: Number(id),
      size: item.size,
      quantity: item.qty,
    }));

  if (items.length === 0) {
    alert("⚠️ Vui lòng chọn ít nhất 1 món!");
    return;
  }

  if (!window.confirm("Xác nhận đặt bàn và các món đã chọn?")) return;

  try {
    const res = await fetch(`${API_BASE}/user/reservations/book?tableId=${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // ✅ Gửi đúng định dạng List<OrderItemRequest>
      body: JSON.stringify(items),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Không thể đặt bàn!");

    alert(data.message || "✅ Đặt bàn thành công!");
    setSelectedItems({});
    fetchData();
  } catch (err: any) {
    console.error("❌ Lỗi đặt bàn:", err);
    alert(err.message);
  }
};

  // ✅ Hủy bàn
  const handleCancel = async (id: number) => {
    const token = getToken();
    if (!token) return alert("⚠️ Cần đăng nhập!");

    if (!window.confirm("Bạn có chắc muốn hủy bàn này không?")) return;

    try {
      const res = await fetch(`${API_BASE}/user/reservations/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || data.error || "Đã hủy bàn!");
      fetchData();
    } catch (error) {
      console.error("❌ Lỗi khi hủy bàn:", error);
    }
  };

  // ----------- UI -----------
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-amber-800">
        ☕ Đặt bàn & chọn món theo size
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <>
          {/* --- DANH SÁCH MÓN --- */}
          <h2 className="text-xl font-semibold mb-3 text-amber-700">
            📋 Danh sách món
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {menuItems.map((p) => {
              const item = selectedItems[p.id] || { qty: 0, size: "M" };
              let price = 0;
              switch (item.size) {
                case "S":
                  price = p.priceSmall ?? 0;
                  break;
                case "M":
                  price = p.priceMedium ?? p.priceSmall ?? 0;
                  break;
                case "L":
                  price = p.priceLarge ?? p.priceSmall ?? 0;
                  break;
              }

              return (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 bg-white text-center shadow hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg mb-2">{p.title}</h3>

                  {/* SIZE chọn */}
                  <div className="flex justify-center gap-2 mb-2">
                    {(["S", "M", "L"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(p.id, size)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          item.size === size
                            ? "bg-amber-600 text-black"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    Giá: {price.toLocaleString()}₫
                  </p>

                  {/* Số lượng */}
                  <input
                    type="number"
                    min={0}
                    value={item.qty}
                    onChange={(e) =>
                      handleQuantityChange(p.id, Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-center w-20"
                  />
                </div>
              );
            })}
          </div>

          {/* Tổng tạm tính */}
          <div className="text-right mb-10 font-semibold text-lg text-gray-700">
            Tổng tạm tính:{" "}
            <span className="text-amber-700">
              {calculateTotal().toLocaleString()}₫
            </span>
          </div>

          {/* --- DANH SÁCH BÀN --- */}
          <h2 className="text-xl font-semibold mb-3 text-amber-700">
            🪑 Bàn đang trống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {availableTables.map((table) => (
              <div
                key={table.id}
                className="border rounded-lg shadow p-4 text-center bg-white hover:shadow-lg transition"
              >
                <h3 className="font-bold text-lg mb-1 text-amber-700">
                  {table.tableName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {table.position || "Chưa rõ"} — {table.capacity} người
                </p>
                <button
                  onClick={() => handleBook(table.id)}
                  className="mt-2 inline-flex items-center justify-center px-5 py-2.5 
                    bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 
                    text-black font-semibold rounded-full shadow-md 
                    hover:scale-105 transition-all duration-300"
                >
                  Đặt bàn
                </button>
              </div>
            ))}
          </div>

          {/* --- DANH SÁCH BÀN ĐÃ ĐẶT --- */}
          <h2 className="text-xl font-semibold mb-3 text-amber-700">
            🧾 Bàn bạn đã đặt
          </h2>
          {reservations.length === 0 ? (
            <p className="italic text-gray-500">Bạn chưa đặt bàn nào.</p>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Mã</th>
                  <th className="border p-2">Tên bàn</th>
                  <th className="border p-2">Trạng thái</th>
                  <th className="border p-2">Thời gian</th>
                  <th className="border p-2">Tổng tiền</th>
                  <th className="border p-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td className="border p-2 text-center">{r.id}</td>
                    <td className="border p-2 text-center">
                      {r.table?.tableName || "Không rõ"}
                    </td>
                    <td className="border p-2 text-center">
                      <span
                        className={`px-3 py-1 rounded text-white ${
                          r.status === "BOOKED"
                            ? "bg-blue-500"
                            : r.status === "CANCELED"
                            ? "bg-red-500"
                            : "bg-green-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="border p-2 text-center">
                      {new Date(r.timeStart).toLocaleString("vi-VN")}
                    </td>
                    <td className="border p-2 text-center text-amber-700 font-semibold">
                      {(r.totalPrice ?? 0).toLocaleString()}₫
                    </td>
                    <td className="border p-2 text-center">
                      {r.status === "BOOKED" && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
