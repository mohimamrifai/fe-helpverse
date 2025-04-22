import { useState } from 'react';
import { Link } from 'react-router';

export function meta() {
  return [
    { title: "Register Event Organizer - Helpverse" },
    { name: "description", content: "Create a new event organizer account" },
  ];
}

export default function RegisterEventOrganizer() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organizationName: '',
    password: '',
    agreeTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Register Event Organizer</h1>
          <p className="mt-1 text-sm text-gray-600">Create your event organizer account</p>
        </div>
        
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.organizationName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
              </label>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex cursor-pointer text-secondary justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              Create Event Organizer
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