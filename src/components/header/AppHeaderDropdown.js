import React, { useState, useRef, useEffect } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CFormInput
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { jwtDecode } from 'jwt-decode'
import Swal from "sweetalert2";
import env from '../../env';
import axios from 'axios';


const logOut = () => {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('tokenExpiry')
  sessionStorage.removeItem('user')
  window.location.href = '/login'
}

const AppHeaderDropdown = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [iduser, setIdUser] = useState();
  const [avatarUrl, setAvatarUrl] = useState(`${env.apiUrl}/api/file/get-img?userId=${iduser}&t=${Date.now()}`)
  const fileInputRef = useRef(null)


  // dùng để cập nhật ảnh nhỏ khi vào trang chủ
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;
        setIdUser(userId);
  
        const response = await fetch(`${env.apiUrl}/api/users/get_thong_tin_doan_sinh?user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.data);
        } else {
          console.error('Failed to load profile');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    // Gọi hàm fetchUserProfile khi component được mount
    fetchUserProfile();
  }, []); // Thêm một mảng rỗng để chỉ chạy một lần khi component mount

  const handleProfileClick = async () => {
    setModalVisible(true);

    try {
      const token = sessionStorage.getItem('token');
      // Giải mã token để lấy user_id
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;
      setIdUser(userId);

      const response = await fetch(`http://103.15.222.65:8888/api/users/get_thong_tin_doan_sinh?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {

      const validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];

      // Kiểm tra định dạng file
      if (!validExtensions.includes(file.type)) {
        Swal.fire({
          title: "Thông báo từ hệ thống!",
          text: "Đây không phải file ảnh, vui lòng chọn lai.",
          icon: "warning"
        });
        return; // Dừng nếu định dạng không hợp lệ
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        axios.post(`${env.apiUrl}/api/file/upload-img?userId=${iduser}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Thêm Authorization header
          }
        })
          .then(response => {
            let timerInterval;
            Swal.fire({
              title: "Thông báo từ hệ thống!",
              html: "Đang cập nhật hình ảnh<b></b>s",
              timer: 2500,
              timerProgressBar: true,
              didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                  timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
              },
              willClose: () => {
                clearInterval(timerInterval);
              }
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
                const newAvatarUrl = `${env.apiUrl}/api/file/get-img?userId=${iduser}&t=${Date.now()}`;
                setAvatarUrl(newAvatarUrl); // Giả sử bạn có hàm `setAvatarUrl` để cập nhật avatar
                Swal.fire({
                  title: "Thông báo từ hệ thông!",
                  text: "Cập nhật ảnh thành công",
                  icon: "success"
                });
              }
            });
          })
          .catch(error => {
            Swal.fire({
              title: "Thông báo từ hệ thống!",
              text: "Cập nhật ảnh thất bại.",
              icon: "error"
            });
          });
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-1" caret={false}>
          <div class="avatar">
            <img class="avatar-img" src={`${env.apiUrl}/api/file/get-img?userId=${iduser}&t=${Date.now()}`} style={{ width: '50px', height: '35px', borderRadius: '50%', cursor: 'pointer' }} />
          </div>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Tài khoản</CDropdownHeader>
          <CDropdownItem href="#" onClick={handleProfileClick}>
            <CIcon icon={cilUser} className="me-2" />
            Hồ sơ của bạn
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem href="#" onClick={logOut}>
            <CIcon icon={cilLockLocked} className="me-2" />
            Đăng xuất
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <CModal visible={modalVisible} onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>Hồ sơ người dùng</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {userProfile ? (
            <>
              <div className="text-center mb-3">
                <img
                  src={`${env.apiUrl}/api/file/get-img?userId=${iduser}&t=${Date.now()}`}
                  alt="User Avatar"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer' }}
                  onClick={handleAvatarClick}
                />
                <CFormInput
                  type="file"
                  className="mb-3"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                />
              </div>
              <CFormInput
                type="text"
                label="Họ tên"
                value={userProfile.hoTen}
                disabled
                className="mb-3"
              />
              <CFormInput
                type="text"
                label="Pháp Danh"
                value={userProfile.phapDanh}
                disabled
                className="mb-3"
              />
              <CFormInput
                type="text"
                label="Giới tính"
                value={userProfile.gioiTinh ? "Nam" : "Nữ"}
                disabled
                className="mb-3"
              />
              <CFormInput
                type="email"
                label="Email"
                value={userProfile.email}
                disabled
                className="mb-3"
              />
              <CFormInput
                type="tel"
                label="Số điện thoại"
                value={userProfile.sdt}
                disabled
                className="mb-3"
              />
              <CFormInput
                type="text"
                label="Địa chỉ"
                value={userProfile.diaChi}
                disabled
                className="mb-3"
              />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="outline-secondary" onClick={handleCloseModal}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AppHeaderDropdown
