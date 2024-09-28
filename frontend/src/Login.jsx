import { useEffect, useState } from 'react';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
function Login() {
    const [email, setEmail] = useState('m@gmail.com');
    const [password, setPassword] = useState('m');
    const navigate = useNavigate();
    const getCookie = () => {
        // get the user from session storage
        const user = JSON.parse(sessionStorage.getItem('user'));
        console.log(user);
        return user;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password }, { withCredentials: true });
            console.log(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    useEffect(() => {
        const cookie = getCookie();
        console.log(cookie);
    }, []);

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