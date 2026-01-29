import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi login - langsung ke dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(135deg, hsl(210 29% 24%) 0%, hsl(200 60% 45%) 100%)"
    }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Login Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-elegant">
          {/* Brand Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
              <Car className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">E-Parking</h1>
            <p className="text-muted-foreground text-sm mt-1">Sistem Manajemen Parkir</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-elegant"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-elegant pr-12"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 mt-6"
            >
              Login Aplikasi
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2024 E-Parking. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
