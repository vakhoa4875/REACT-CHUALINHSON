import axios from 'axios';
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import env from '../../../env';

import { cilLockLocked, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import { useRole } from '../../../RoleContext';

const Login = () => {
  const navigate = useNavigate();
  const { role, setRole } = useRole();

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const expiryTime = sessionStorage.getItem('tokenExpiry')
    const now = new Date().getTime()
    if (token && expiryTime && now < expiryTime) {
      navigate('/')
    } else {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('tokenExpiry')
    }
  }, [navigate]);

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu',
        showConfirmButton: true,
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${env.apiUrl}/api/auth/login`, {
        username,
        password,
      })

      const data = response.data.data

      if (data) {
        const decodedToken = jwtDecode(data.token);

        const expiryTime = decodedToken.exp * 1000

        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('tokenExpiry', expiryTime);
        sessionStorage.setItem('user', JSON.stringify(decodedToken));

        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          navigate('/')
        })
      }
    } catch (error) {
      console.error('Login failed:', error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 401 || status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Sai tên đăng nhập hoặc mật khẩu',
            text: data.message || 'Vui lòng kiểm tra lại thông tin đăng nhập.',
            showConfirmButton: true,
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Đã xảy ra lỗi',
            text: data.message || 'Vui lòng thử lại sau.',
            showConfirmButton: true,
          })
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi mạng',
          text: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.',
          showConfirmButton: true,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5} xl={4}>
            <CCard className="p-4 shadow-lg border-0">
              <CCardBody>
                <CForm>
                  <h1 className="text-center mb-4">Đăng Nhập</h1>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Tên đăng nhập"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Mật khẩu"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol xs={12} className="text-center">
                      <CButton
                        color="primary"
                        className="px-5 py-2"
                        onClick={handleLogin}
                        disabled={loading}
                      >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
