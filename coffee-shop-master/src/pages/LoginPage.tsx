import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLoading from "@/components/shared/PageLoading";
import Title1 from "@/components/shared/typo/Title1";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("${import.meta.env.VITE_API_BASE}/api/home/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sai email hoặc mật khẩu");
      }

      // ✅ Tạo đối tượng user có token + role
      const loggedInUser = {
        id: data.id || data.userId, // ✅ thêm dòng này
        name: data.username || data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      };


      // ✅ Lưu vào AuthContext + điều hướng
      login(loggedInUser, "/");

      // ✅ Nếu là admin thì điều hướng về trang admin
      if (data.role === "ROLE_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-screen bg-primary p-4">
        <div className="flex flex-col w-full max-w-md bg-gray-100 rounded-3xl p-10 mx-auto shadow-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 mx-auto">
            <img
              src="/images/app-logo.svg"
              alt="App Logo"
              className="w-20 h-20 rounded-full object-cover"
            />
            <p className="text-primary">
              <span className="block text-xl font-thin">Coffee</span>
              <span className="block text-2xl font-semibold">Shop</span>
            </p>
          </div>

          <Title1 className="text-primary text-center">Đăng nhập</Title1>
          <p className="text-gray-500 font-medium mt-2 text-center">
            Hãy đăng nhập để tiếp tục hành trình cà phê của bạn ☕
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-10">
            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error}
              </p>
            )}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
              required
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition-all"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-4">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      <PageLoading show={isLoading} />
    </>
  );
}
