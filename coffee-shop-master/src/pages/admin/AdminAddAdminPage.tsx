import { useState } from "react";

export default function AdminAddAdminPage() {
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    cpassword: "",
  });
  const [img, setImg] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.cpassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (img) formData.append("img", img);

    try {
      const res = await fetch("${import.meta.env.VITE_API_BASE}/api/admin/add-admin", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Lỗi khi thêm quản trị viên");

      setMessage({ type: "success", text: "Thêm quản trị viên thành công!" });
      setForm({
        name: "",
        mobileNumber: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        password: "",
        cpassword: "",
      });
      setImg(null);
    } catch (err) {
      setMessage({ type: "error", text: "Không thể thêm quản trị viên!" });
      console.error(err);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Thêm Quản Trị Viên
        </h2>

        {/* Hiển thị thông báo */}
        {message && (
          <div
            className={`mb-4 text-center font-semibold ${
              message.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Họ và Tên</label>
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Số Điện Thoại</label>
              <input
                required
                type="number"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Địa Chỉ</label>
              <input
                required
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Thành Phố</label>
              <input
                required
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Tỉnh</label>
              <input
                required
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Mã Bưu Điện</label>
              <input
                required
                type="number"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Mật Khẩu</label>
              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Xác Nhận Mật Khẩu</label>
              <input
                required
                type="password"
                name="cpassword"
                value={form.cpassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Ảnh Hồ Sơ</label>
            <input
              type="file"
              onChange={(e) => setImg(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 hover:file:bg-blue-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Đăng Ký
          </button>
        </form>
      </div>
    </section>
  );
}
