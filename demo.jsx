// import { useEffect } from 'react';
// import axios from 'axios';
// import { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { AuthContext } from './AuthContext'; // Replace with your actual AuthContext import

// const useAxiosSecure = () => {
//     const { logOut } = useContext(AuthContext);
//     const navigate = useNavigate();
//     //   
//     const axiosSecure = axios.create({
//         baseURL: 'your-base-url-here', // Replace with your base URL
//     });
//     useEffect(() => {

//         axiosSecure.interceptors.request.use((config) => {
//             const token = localStorage.getItem('access-token');
//             if (token) {
//                 config.headers['Authorization'] = `Bearer ${token}`;
//             }
//             return config;
//         });

//         axiosSecure.interceptors.response.use(
//             (response) => response,
//             async (error) => {
//                 if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//                     await logOut();
//                     navigate('/login');

//                 }
//                 return Promise.reject(error);
//             }
//         );

//         return axiosSecure;
//     }, [logOut, navigate]);

//     return null;
// };

// export default useAxiosSecure;
