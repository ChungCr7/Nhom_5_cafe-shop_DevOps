import { useState } from "react";
import PageLoading from "@/components/shared/PageLoading";
import Title1 from "@/components/shared/typo/Title1";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    img: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm({ ...form, img: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("mobileNumber", form.mobileNumber);
      if (form.img) formData.append("img", form.img);

      const response = await fetch("http:/ - -  -------------home/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(data.message || "Đăng ký thành công!");
      // Chuyển hướng về trang login sau 2 giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-primary p-4">
        <div className="flex flex-col w-full max-w-md bg-gray-100 rounded-3xl p-10 mx-auto shadow-lg">
          <div className="flex items-center gap-3 mb-10 mx-auto">
            <img
              src="/images/app-logo.svg"
              alt="App Logo"
              className="w-20 h-20 rounded-full object-cover"
            />
            <p className="text-primary">
              <span className="block text-xl font-thin">Love</span>
              <span className="block text-2xl font-semibold">Flowers</span>
            </p>
          </div>

          <Title1 className="text-primary text-center">Đăng ký tài khoản</Title1>
          <p className="text-gray-500 font-medium mt-2 text-center">
            Tạo tài khoản để bắt đầu mua sắm hoa tươi cùng chúng tôi
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 text-sm text-center font-medium">
                {success}
              </p>
            )}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Họ và tên"
              className="border p-3 rounded-lg w-full"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-3 rounded-lg w-full"
              required
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="border p-3 rounded-lg w-full"
              required
            />
            <input
              type="text"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              placeholder="Số điện thoại"
              className="border p-3 rounded-lg w-full"
            />
            <input
              type="file"
              name="img"
              accept="image/*"
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            />

            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-700"
            >
              Đăng ký
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-4">
            Đã có tài khoản?{" "}
            <a
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
      <PageLoading show={isLoading} />
    </>
  );
}
