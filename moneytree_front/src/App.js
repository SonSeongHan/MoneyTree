import axios from 'axios';

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import { AuthProvider } from './AuthContext';


axios.defaults.withCredentials = true;  // 모든 Axios 요청에 대해 쿠키 전송 활성화

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={root} />
        </AuthProvider>
    );
}

export default App;
