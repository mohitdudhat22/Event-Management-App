import { useState } from 'react';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
    };

    return (
        <Box sx={{ maxWidth: 300, margin: 'auto', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" component="h1" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="dense"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="dense"
                        size="small"
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} size="small">
                        Login
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

export default Login;