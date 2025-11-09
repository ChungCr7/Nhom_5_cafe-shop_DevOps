import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageLoading from "@/components/shared/PageLoading";

export default function EditProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Lấy thông tin user hiện tại khi load trang
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/api/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const u = data.user || data;
        setForm({
          name: u.name || "",
          mobileNumber: u.mobileNumber || "",
          email: u.email || "",
          address: u.address || "",
          city: u.city || "",
          state: u.state || "",
          pincode: u.pincode || "",
        });
      })
      .catch((err) => console.error("❌ Lỗi tải thông tin:", err));
  }, [token]);

  // ✅ Cập nhật giá trị input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, value as string)
    );
    if (image) formData.append("img", image); // ✅ đúng key backend UserController

    try {
      const res = await fetch("http://localhost:8080/api/user/profile/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Cập nhật thông tin thành công!");
        await refreshUser(); // 🟢 cập nhật lại dữ liệu user toàn app
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setMessage("❌ Lỗi: " + (data.error || "Không thể cập nhật."));
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setMessage("❌ Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-100 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">
          Cập nhật thông tin tài khoản
        </h2>

        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="border p-3 rounded-lg w-full"
            required
          />
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="border p-3 rounded-lg w-full"
          />
          <input
            name="email"
            value={form.email}
            disabled
            className="border p-3 rounded-lg w-full bg-gray-100 text-gray-500"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Địa chỉ"
            className="border p-3 rounded-lg w-full"
          />
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Thành phố"
            className="border p-3 rounded-lg w-full"
          />
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Tỉnh / Quận"
            className="border p-3 rounded-lg w-full"
          />
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="Mã bưu điện"
            className="border p-3 rounded-lg w-full"
          />

          {/* Ảnh đại diện */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">
              Ảnh đại diện:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all"
          >
            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>

      <PageLoading show={loading} />
    </div>
  );
}
