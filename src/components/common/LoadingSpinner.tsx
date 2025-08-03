import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { keyframes } from '@mui/material/styles';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'circular' | 'dots' | 'pulse';
}

// Professional loading animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const dotBounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  size = 'medium', 
  message = 'Cargando...',
  variant = 'circular'
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56
  };

  const spinnerSize = sizeMap[size];

  const DotsLoader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 8,
            height: 8,
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            animation: `${dotBounce} 1.4s infinite ease-in-out`,
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </Box>
  );

  const PulseLoader = () => (
    <Box
      sx={{
        width: spinnerSize,
        height: spinnerSize,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, primary.main, primary.light)',
        animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
      }}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      default:
        return (
          <CircularProgress 
            size={spinnerSize} 
            thickness={4}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
        );
    }
  };

  const content = (
    <Fade in timeout={300}>
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center'
        }}
      >
        {renderSpinner()}
        {message && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              animation: variant === 'pulse' ? `${pulseAnimation} 2s ease-in-out infinite` : 'none'
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
  
  // Si es pantalla completa, centrar en la página
  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(250, 250, 250, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {content}
        </Box>
      </Box>
    );
  }
  
  // Si no es pantalla completa, renderizar en línea
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        py: 4 
      }}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;