import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Importamos tu instancia configurada de Axios
import { User, Hammer, Building2, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'CLIENT'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('auth/register/', formData);
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.email 
        ? "Este correo ya está registrado." 
        : "Error al crear la cuenta. Intenta nuevamente.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 py-10">
      <div className="bg-surface w-full max-w-2xl p-8 rounded-xl shadow-lg border border-neutral-dark/10">
        
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-neutral-dark">
            Únete a FindMy<span className="text-primary">Worker</span>
          </h1>
          <p className="text-neutral-dark/60 mt-2">Elige cómo quieres usar la plataforma</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selección de Rol Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Opción Cliente */}
            <div 
              onClick={() => handleRoleSelect('CLIENT')}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${
                formData.role === 'CLIENT' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-neutral-dark/10 hover:border-primary/50 bg-white'
              }`}
            >
              <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                formData.role === 'CLIENT' ? 'bg-primary text-white' : 'bg-neutral-light text-neutral-dark'
              }`}>
                <User size={20} />
              </div>
              <h3 className="font-bold text-neutral-dark text-sm">Cliente</h3>
              <p className="text-xs text-neutral-dark/60 mt-1">Busco contratar servicios</p>
            </div>

            {/* Opción Trabajador */}
            <div 
              onClick={() => handleRoleSelect('WORKER')}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${
                formData.role === 'WORKER' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-neutral-dark/10 hover:border-primary/50 bg-white'
              }`}
            >
              <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                formData.role === 'WORKER' ? 'bg-primary text-white' : 'bg-neutral-light text-neutral-dark'
              }`}>
                <Hammer size={20} />
              </div>
              <h3 className="font-bold text-neutral-dark text-sm">Trabajador</h3>
              <p className="text-xs text-neutral-dark/60 mt-1">Ofrezco mis habilidades</p>
            </div>

            {/* Opción Empresa */}
            <div 
              onClick={() => handleRoleSelect('COMPANY')}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${
                formData.role === 'COMPANY' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-neutral-dark/10 hover:border-primary/50 bg-white'
              }`}
            >
              <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                formData.role === 'COMPANY' ? 'bg-primary text-white' : 'bg-neutral-light text-neutral-dark'
              }`}>
                <Building2 size={20} />
              </div>
              <h3 className="font-bold text-neutral-dark text-sm">Empresa</h3>
              <p className="text-xs text-neutral-dark/60 mt-1">Gestiono proyectos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Nombre</label>
              <input
                type="text"
                name="first_name"
                required
                className="w-full px-4 py-2 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Apellido</label>
              <input
                type="text"
                name="last_name"
                required
                className="w-full px-4 py-2 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-2 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Creando cuenta...
              </>
            ) : (
              <>
                Crear Cuenta <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-dark/70">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Inicia Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
