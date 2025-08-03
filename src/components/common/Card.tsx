import React from 'react';
import { Card as MuiCard, CardContent, CardActions, CardHeader, CardMedia, Box, IconButton, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  imageHeight?: number;
  actions?: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'glass' | 'gradient';
  hover?: boolean;
  clickable?: boolean;
  showMenu?: boolean;
  badges?: string[];
  className?: string;
  sx?: object;
  onClick?: () => void;
  onMenuClick?: () => void;
}

const StyledCard = styled(MuiCard)<{
  cardVariant?: string;
  clickable?: boolean;
  hover?: boolean;
}>(({ theme, cardVariant = 'elevated', clickable = false, hover = true }) => {
  const variants = {
    elevated: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '&:hover': hover ? {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: 'translateY(-4px)',
      } : {},
    },
    outlined: {
      border: `2px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      '&:hover': hover ? {
        borderColor: theme.palette.primary.main,
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1)',
        transform: 'translateY(-2px)',
      } : {},
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      '&:hover': hover ? {
        background: 'rgba(255, 255, 255, 0.95)',
        transform: 'translateY(-2px)',
      } : {},
    },
    gradient: {
      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      '&:hover': hover ? {
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
        transform: 'translateY(-2px)',
      } : {},
    },
  };

  return {
    borderRadius: '1rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: clickable ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'visible',
    ...variants[cardVariant as keyof typeof variants],
    ...(clickable && {
      '&:active': {
        transform: 'translateY(0)',
      },
    }),
  };
});

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  image,
  imageHeight = 200,
  actions,
  variant = 'elevated',
  hover = true,
  clickable = false,
  showMenu = false,
  badges = [],
  className,
  sx,
  onClick,
  onMenuClick,
}) => {
  return (
    <StyledCard
      cardVariant={variant}
      clickable={clickable}
      hover={hover}
      className={className}
      sx={sx}
      onClick={clickable ? onClick : undefined}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
          }}
        >
          {badges.map((badge, index) => (
            <Chip
              key={index}
              label={badge}
              size="small"
              sx={{
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.75rem',
                backdropFilter: 'blur(10px)',
              }}
            />
          ))}
        </Box>
      )}

      {/* Image */}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={title || 'Card image'}
          sx={{
            borderRadius: '1rem 1rem 0 0',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Header */}
      {(title || subtitle || showMenu) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            showMenu && (
              <IconButton
                aria-label="more actions"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick?.();
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <MoreVertIcon />
              </IconButton>
            )
          }
          sx={{
            '& .MuiCardHeader-title': {
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'text.primary',
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '0.875rem',
              color: 'text.secondary',
            },
          }}
        />
      )}

      {/* Content */}
      {children && (
        <CardContent
          sx={{
            pt: title || subtitle ? 0 : 2,
            '&:last-child': {
              pb: actions ? 2 : 3,
            },
          }}
        >
          {children}
        </CardContent>
      )}

      {/* Actions */}
      {actions && (
        <CardActions
          sx={{
            px: 2,
            pb: 2,
            justifyContent: 'flex-end',
            '& > *': {
              ml: 1,
            },
          }}
        >
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card;