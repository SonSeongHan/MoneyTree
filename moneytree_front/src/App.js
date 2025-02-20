import axios from 'axios';
import { Provider } from "react-redux";
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import { AuthProvider } from './AuthContext';
import store from "./store"; // store 경로 확인

axios.defaults.withCredentials = true;  // 모든 Axios 요청에 대해 쿠키 전송 활성화

function App() {
  return (
      <Provider store={store}>
    <AuthProvider>
      <RouterProvider router={root} />
    </AuthProvider>
      </Provider>
  );
}

export default App;