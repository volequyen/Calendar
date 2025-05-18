import React, { useContext, useState } from "react";
import InputBox from "../../components/InputBox";
import BlueButton from "../../components/BlueButton";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authProvider";
import { SiGooglecalendar } from "react-icons/si";
import { loginApi } from "../../apis/login";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoginDisabled = email.trim() === "" || password.length < 8;

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await loginApi(email, password);

      const { email: responseEmail, user_id } = response;

      if (user_id === "null" || responseEmail === "null") {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
        return;
      }

      // Use the responseEmail from the API response
      login(responseEmail, user_id);
      navigate("/");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <SiGooglecalendar className="text-emerald-700 w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập vào Calendar</h1>
          <p className="text-gray-500 text-sm">Quản lý lịch của bạn một cách hiệu quả</p>
        </div>
        <div className="space-y-4">
          <InputBox
            value="Email"
            type="text"
            size="w-full h-12"
            onChange={(e) => setEmail(e.target.value)}
            onClick={() => setError("")}
          />
          <InputBox
            value="Mật khẩu"
            type="password"
            size="w-full h-12"
            onChange={(e) => setPassword(e.target.value)}
            onClick={() => setError("")}
          />
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        <div className="mt-6">
          <BlueButton
            name={loading ? "" : "Đăng nhập"}
            isActive="login"
            size={`w-full h-12 flex items-center justify-center rounded-md ${isLoginDisabled || loading
              ? "opacity-60 cursor-not-allowed"
              : "opacity-100 hover:bg-emerald-700"
              }`}
            onClick={handleLogin}
            disabled={isLoginDisabled || loading}
            loading={loading}
          />
        </div>
        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">HOẶC</span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;