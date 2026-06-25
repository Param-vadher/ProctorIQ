import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ className = '', style = {} }) => {
  return (
    <img 
      src="/proctoriq.png" 
      alt="ProctorIQ Logo" 
      className={className} 
      style={style} 
    />
  );
};

export default Logo;
