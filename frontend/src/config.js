import { styled } from "@mui/material";

const inputStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      '&:hover': {
        backgroundColor: '#333333',
      },
      '&.Mui-focused': {
        backgroundColor: '#333333',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#90caf9',
        },
      },
    },
    '& .MuiOutlinedInput-input': {
      color: '#ffffff',
      '&::placeholder': {
        color: '#999999',
        opacity: 1,
      },
    },
    '& .MuiInputLabel-root': {
      color: '#b0bec5',
      '&.Mui-focused': {
        color: '#90caf9',
      },
    },
    '& .MuiInputAdornment-root': {
      color: '#b0bec5',
    },
    '& .MuiFormHelperText-root': {
      color: '#b0bec5',
    },
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: '50%',
  });

  export { inputStyle, VisuallyHiddenInput };