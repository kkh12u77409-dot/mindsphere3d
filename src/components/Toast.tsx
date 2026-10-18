import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <div id="toast" className={`show ${type}`}>
      {message}
    </div>
  );
};
