import React from 'react';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import { AuthProvider } from './AuthContext';

function App() {
    return (

        <AuthProvider>
                <RouterProvider router={root} />
            </AuthProvider>

    );
}

export default App;
