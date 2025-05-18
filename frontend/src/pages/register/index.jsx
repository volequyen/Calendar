import React, { useState, useContext } from "react";
import InputBox from "../../components/InputBox";
import BlueButton from "../../components/BlueButton";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authProvider";
import { SiGooglecalendar } from "react-icons/si";
import registerApi from "../../apis/register";

function Register() {
    // Sửa lỗi: Đảm bảo bạn đang sử dụng đúng tên hàm từ AuthContext
    const { login } = useContext(AuthContext); // Thay "register" bằng "login" hoặc tên hàm đúng trong context

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState({
        email: "",
        password: "",
        general: ""
    });

    // Regex kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleEmailBlur = async () => {
        if (!emailRegex.test(email)) {
            setError((prev) => ({
                ...prev,
                email: "Vui lòng nhập email hợp lệ."
            }));
            return;
        }
        setError((prev) => ({ ...prev, email: "" }));
    };

    const handlePasswordBlur = () => {
        if (password.length < 8) {
            setError((prev) => ({
                ...prev,
                password: "Mật khẩu phải có ít nhất 8 ký tự."
            }));
        } else {
            setError((prev) => ({ ...prev, password: "" }));
        }
    };

    const handleInputFocus = (field) => {
        setError((prev) => ({ ...prev, [field]: "" }));
    };

    const handleRegister = async () => {
        setLoading(true);
        setError((prev) => ({ ...prev, general: "" }));
        try {
            const response = await registerApi(email, password);
            setTimeout(() => {
                // Sử dụng hàm "login" từ context thay vì "register"
                login(email, response.id);
                navigate("/");
            }, 1000);
        } catch (error) {
            setError((prev) => ({
                ...prev,
                general: error.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại."
            }));
        } finally {
            setLoading(false);
        }
    };

    const isRegisterDisabled =
        email.trim() === "" ||
        password.length < 8 ||
        Object.values(error).some((e) => e !== "");

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <SiGooglecalendar className="text-emerald-700 w-12 h-12 mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Đăng ký tài khoản</h1>
                    <p className="text-gray-500 text-sm">Tạo tài khoản để quản lý lịch hiệu quả</p>
                </div>
                <div className="space-y-4">
                    <InputBox
                        value="Email"
                        type="text"
                        size={`w-full h-12 ${error.email ? "border-red-500" : ""}`}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={handleEmailBlur}
                        onFocus={() => handleInputFocus("email")}
                    />
                    {error.email && (
                        <span className="block text-xs text-red-500">{error.email}</span>
                    )}
                    <InputBox
                        value="Mật khẩu"
                        type="password"
                        size={`w-full h-12 ${error.password ? "border-red-500" : ""}`}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={handlePasswordBlur}
                        onFocus={() => handleInputFocus("password")}
                    />
                    {error.password && (
                        <span className="block text-xs text-red-500">{error.password}</span>
                    )}
                </div>
                {error.general && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
                        {error.general}
                    </div>
                )}
                <div className="mt-6">
                    <BlueButton
                        name={loading ? "" : "Đăng ký"}
                        isActive={"register"}
                        size={`w-full h-12 flex items-center justify-center rounded-md ${isRegisterDisabled || loading
                            ? "opacity-60 cursor-not-allowed"
                            : "opacity-100 hover:bg-emerald-700"
                            }`}
                        onClick={handleRegister}
                        loading={loading}
                        disabled={isRegisterDisabled || loading}
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
                        Bạn đã có tài khoản?{" "}
                        <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;