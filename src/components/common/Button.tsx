import React from 'react';
import { Link } from 'react-router-dom';
import { Button as MuiButton, type ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'button' | 'a' | 'link';
  to?: string;
  gradient?: boolean;
}

// Styled button with modern design
const StyledButton = styled(MuiButton)<{
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
  gradient?: boolean;
}>(({ theme, buttonVariant = 'primary', buttonSize = 'medium', gradient = false }) => {
  const variants = {
    primary: {
      backgroundColor: gradient 
        ? 'transparent'
        : theme.palette.primary.main,
      background: gradient 
        ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
        : theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      border: `2px solid ${theme.palette.primary.main}`,
      '&:hover': {
        backgroundColor: gradient 
          ? 'transparent'
          : theme.palette.primary.dark,
        background: gradient
          ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
          : theme.palette.primary.dark,
        border: `2px solid ${theme.palette.primary.dark}`,
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
      },
    },
    secondary: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      border: `2px solid ${theme.palette.secondary.main}`,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
        border: `2px solid ${theme.palette.secondary.dark}`,
        transform: 'translateY(-1px)',
      },
    },
    success: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.contrastText,
      border: `2px solid ${theme.palette.success.main}`,
      '&:hover': {
        backgroundColor: theme.palette.success.dark,
        border: `2px solid ${theme.palette.success.dark}`,
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
      },
    },
    danger: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      border: `2px solid ${theme.palette.error.main}`,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
        border: `2px solid ${theme.palette.error.dark}`,
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
      },
    },
    warning: {
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.warning.contrastText,
      border: `2px solid ${theme.palette.warning.main}`,
      '&:hover': {
        backgroundColor: theme.palette.warning.dark,
        border: `2px solid ${theme.palette.warning.dark}`,
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
      },
    },
    info: {
      backgroundColor: theme.palette.info.main,
      color: theme.palette.info.contrastText,
      border: `2px solid ${theme.palette.info.main}`,
      '&:hover': {
        backgroundColor: theme.palette.info.dark,
        border: `2px solid ${theme.palette.info.dark}`,
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)',
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      border: `2px solid ${theme.palette.primary.main}`,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      border: '2px solid transparent',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-1px)',
      },
    },
  };

  const sizes = {
    small: {
      padding: '0.5rem 1rem',
      fontSize: '0.8125rem',
      minHeight: '32px',
    },
    medium: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      minHeight: '40px',
    },
    large: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      minHeight: '48px',
    },
  };

  return {
    ...variants[buttonVariant],
    ...sizes[buttonSize],
    borderRadius: '0.75rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
      '&:hover': {
        transform: 'none',
        boxShadow: 'none',
      },
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };
});

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  as = 'button',
  to,
  gradient = false,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const content = (
    <>
      {isLoading && (
        <CircularProgress 
          size={16} 
          color="inherit" 
          sx={{ mr: 1 }}
        />
      )}
      {!isLoading && leftIcon && (
        <span style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
          {rightIcon}
        </span>
      )}
    </>
  );

  const buttonProps = {
    buttonVariant: variant,
    buttonSize: size,
    gradient,
    disabled: isDisabled,
    fullWidth,
    ...rest,
  };

  if (as === 'link' && to) {
    return (
      <Link to={to} style={{ textDecoration: 'none' }}>
        <StyledButton
          {...buttonProps}
        >
          {content}
        </StyledButton>
      </Link>
    );
  } else if (as === 'a') {
    return (
      <StyledButton
        component="a"
        {...buttonProps}
      >
        {content}
      </StyledButton>
    );
  }

  return (
    <StyledButton {...buttonProps}>
      {content}
    </StyledButton>
  );
};

export default Button;