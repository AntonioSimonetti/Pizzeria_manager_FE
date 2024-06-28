import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [confirmationLink, setConfirmationLink] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('https://localhost:7114/api/auth/Register', formData);
      setMessage('User registered successfully. Please check your email for confirmation.');
      if (response.data.confirmationLink) {
        setConfirmationLink(response.data.confirmationLink);
      }

      // Reset form data after successful registration
      setFormData({ email: '', password: '' });
      setConfirmPassword('');
    } catch (error) {
      setMessage('Error registering user');
    }
  };

  const handleConfirmationLinkClick = () => {
    window.open(confirmationLink, '_blank');
  };

  const handleLoginRedirect = () => {
    // Redirect to login page after confirmation link is clicked
    console.log('Redirecting to login...');
    // Implement your own logic for redirection here
  };

  return (
    <div className='main-div'>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message} <a href={confirmationLink} onClick={handleConfirmationLinkClick} target="_blank" rel="noopener noreferrer">Click here to confirm your email</a></p>}
      {confirmationLink && (
        <div>
          <p>Once you've clicked the link above, you can proceed to <a href="/login" onClick={handleLoginRedirect}>login</a>.</p>
        </div>
      )}
    </div>
  );
};

export default Register;
