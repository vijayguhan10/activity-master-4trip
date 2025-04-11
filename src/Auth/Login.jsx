import React, { useState } from "react";
import Footer from "../Shop/components/Footer";
import Header from "../Shop/components/Header";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const LoginComponent = () => {
  const navigate = useNavigate();
  const [isOtpView, setIsOtpView] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [category, setCategory] = useState("Restaurant");

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== "" && index < 3) {
        const nextInput = document.querySelector(
          `input[name='otp-${index + 1}']`
        );
        nextInput?.focus();
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/auth/login`,
        {
          phone_number: phone,
          password,
          role: category,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      console.log("Success:", data);

      if (data.message !== "Invalid phone number or password") {
        if (category === "Restaurant") {
          localStorage.setItem("token_partner_restaurant", data.token);
          localStorage.setItem("id_partner_restaurant", data.user._id);
          navigate("/restaurant");
        } else if (category === "Shop") {
          localStorage.setItem("token_partner_shop", data.token);
          localStorage.setItem("id_partner_shop", data.user._id);
          navigate("/shop");
        } else if (category === "Activities") {
          localStorage.setItem("token_partner_activities", data.token);
          localStorage.setItem("id_partner_activities", data.user._id);
          navigate("/activity");
        }

        setIsOtpView(true);
      } else {
        toast.error("Invalid phone number or password");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex flex-col bg-gradient-to-br from-teal-400 via-blue-400 to-blue-500">
      <Header />
      <ToastContainer />
      <div className="flex-1 flex items-center justify-center p-4 gap-10 h-full w-[80%] max-lg:w-[100%] m-auto">
        <div className="w-[35%] flex flex-col gap-4">
          <div className="text-start mb-8 pl-10 w-full">
            <h1 className="text-4xl font-bold text-teal-600 mb-2">trrip</h1>
            <h2 className="text-2xl text-black font-semibold">
              Connecting You to
              <br />
              More Customers
            </h2>
          </div>

          {/* Icons */}
          <div className="flex flex-1 gap-4 w-full justify-evenly">
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
                <img
                  src="/assets/img1.svg"
                  alt="We bring tourists to you"
                  className="w-6 h-6"
                />
              </div>
              <p className="text-white text-xs w-24">
                We bring tourists to you
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
                <img
                  src="/assets/img2.svg"
                  alt="Your authentic food reaches"
                  className="w-6 h-6"
                />
              </div>
              <p className="text-white text-xs w-24">
                Your authentic food reaches
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
                <img
                  src="/assets/img3.svg"
                  alt="Increase your potential customer"
                  className="w-6 h-6"
                />
              </div>
              <p className="text-white text-xs w-24">
                Increase your potential customer base by 3x
              </p>
            </div>
          </div>
        </div>

        <div className="w-[35%]">
          <div className="bg-white rounded-lg p-6 px-10">
            {!isOtpView ? (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm mb-1">Sign in as</label>
                  <select
                    className="bg-orange-50 outline-none rounded px-3 py-2 w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Shop">Shop</option>
                    <option value="Activities">Activities</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm mb-1">phone number</label>
                  <div className="flex">
                    {/* <select className="bg-orange-50 rounded-l px-2 py-2 border-r">
                        <option>+91</option>
                    </select> */}
                    <div>
                      <div className="bg-orange-50 rounded-l px-3 py-2 w-full border-r">
                        +91
                      </div>
                    </div>
                    <input
                      type="tel"
                      className="bg-orange-50 outline-none rounded-r px-3 py-2 w-full"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm mb-1">password</label>
                  <input
                    type="password"
                    className="bg-orange-50 outline-none rounded px-3 py-2 w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-400 text-white rounded py-2 mb-4 hover:bg-emerald-500"
                >
                  Login
                </button>
                <div className="text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <div
                    onClick={() => {
                      navigate("/signup");
                    }}
                    className="text-emerald-400"
                  >
                    Register
                  </div>
                </div>
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-gray-500 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                <div className="text-center text-sm mb-2">Get OTP via</div>
                <div className="flex justify-center gap-4">
                  <button className="p-2 rounded-sm bg-orange-50">
                    <img
                      src="/assets/mail.svg"
                      alt="Gmail"
                      className="w-6 h-6"
                    />
                  </button>
                  <button className="p-2 rounded-sm bg-orange-50">
                    <img
                      src="/assets/msg.svg"
                      alt="WhatsApp"
                      className="w-6 h-6"
                    />
                  </button>
                  <button className="p-2 rounded-sm bg-orange-50">
                    <img src="/assets/wa.svg" alt="SMS" className="w-6 h-6" />
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm mb-1">
                    What's your Phone number?
                  </label>
                  <div className="flex">
                    <select className="bg-orange-50 rounded-l px-2 py-2 border-r">
                      <option>+91</option>
                    </select>
                    <input
                      type="tel"
                      className="bg-orange-50 rounded-r px-3 py-2 w-full"
                      value={phone}
                      readOnly
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm mb-1">
                    Enter the 4 digit code sent to you at
                  </label>
                  <div className="flex gap-2 mb-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        name={`otp-${index}`}
                        className="w-12 h-12 text-center border rounded bg-orange-50"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                      />
                    ))}
                  </div>
                  <a href="#" className="text-sm text-gray-600">
                    I didn't receive a code. Resend code
                  </a>
                </div>
                <button
                  onClick={() => {
                    navigate("/");
                  }}
                  className="w-full bg-emerald-400 text-white rounded py-2 hover:bg-emerald-500"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginComponent;
