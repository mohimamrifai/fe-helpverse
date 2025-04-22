import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegisterEventOrganizer } from '../../hooks/useAuth';

export function meta() {
  return [
    { title: "Register Event Organizer - Helpverse" },
    { name: "description", content: "Create a new event organizer account" },
  ];
}

export default function RegisterEventOrganizer() {
  const navigate = useNavigate();
  const { register, loading, error } = useRegisterEventOrganizer();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    organizationName: '',
    password: '',
    agreeTerms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username harus diisi';
    }
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Nama lengkap harus diisi';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor telepon harus diisi';
    }
    
    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Nama organisasi harus diisi';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      return;
    }
    
    try {
      console.log('Form data being submitted:', formData);
      await register({
        ...formData,
        role: 'eventOrganizer'
      });
      alert('Event organizer successfully registered!');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      // Error will be handled by the hook and displayed below
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Register Event Organizer</h1>
          <p className="mt-1 text-sm text-gray-600">Create your event organizer account</p>
        </div>
        
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.username}
                onChange={handleChange}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.fullName}
                onChange={handleChange}
              />
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.phone}
                onChange={handleChange}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.organizationName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.organizationName}
                onChange={handleChange}
              />
              {formErrors.organizationName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.organizationName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${formErrors.agreeTerms ? 'border-red-500' : ''}`}
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeTerms" className={`ml-2 block text-sm ${formErrors.agreeTerms ? 'text-red-600' : 'text-gray-700'}`}>
                I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
              </label>
            </div>
            {formErrors.agreeTerms && (
              <p className="mt-1 text-sm text-red-600">{formErrors.agreeTerms}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex cursor-pointer text-secondary justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Create Event Organizer'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="text-center">
          <Link to="/" className="inline-block py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}