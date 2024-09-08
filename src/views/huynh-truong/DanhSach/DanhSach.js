import React, { useState, useEffect } from 'react'
import {
  CBadge,
  CAvatar,
  CTableDataCell,
  CRow,
  CFormInput,
  CButton,
  CCol,
  CDropdownItem,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu ,
} from '@coreui/react'

import './DanhSach.css'
import Table from '../../table/Table'
import CategoryCarousel from "../CategoryCarousel";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import UserModal from './UserModal';
import '../../doan-sinh/DoanSinhCss/DanhSach.css'
import axios from 'axios'
import env from '../../../env'
import apiClient from '../../../apiClient';
import Swal from 'sweetalert2';
import AddHuynhTruongModal from './AddHuynhTruongModal';


const getBadgeClass = (status) => {
  switch (status) {
    case 'Active':
      return 'custom-badge-success';
    case 'Inactive':
      return 'custom-badge-danger';
  }
}

const handleGenderChange = (newGender) => {
  setUser(prevUser => ({
    ...prevUser,
    gender: newGender
  }));
};

const DSNganhThanh = () => {
  const [searchName, setSearchName] = useState('')
  const [searchRegistered, setSearchRegistered] = useState('')
  const [searchRole, setSearchRole] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [usersData, setUsersData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  useEffect(() => {
    const layDuLieu = async () => {
      try {
        const response = await apiClient.get(`/api/users/getListHuyTruong?is_huy_truonng=true`);

        const fetchedData = response.data.data.map(item => {
          const latestBacHoc = item.lichSuHocs.length > 0 ? item.lichSuHocs[0] : null;
          const bacHocId = latestBacHoc ? latestBacHoc.bacHocId : null;
          const tenBacHoc = latestBacHoc ? latestBacHoc.tenBacHoc : '';
          return {
            id: item.userId,
            idUX: item.userIdUx,
            name: item.hoTen,
            avatar: item.avatar,
            registered: item.createdDate,
            role1: item?.roleId1?.roleName,
            role2: item?.roleId2?.roleName,
            idrole1: item?.roleId1?.roleId,
            idrole2: item?.roleId2?.roleId,
            status: item.isActive ? 'Active' : 'Inactive',
            email: item.email,
            gender: item.gioiTinh,
            address: item.diaChi,
            phone: item.sdt,
            birthDate: item.ngaySinh,
            admissionDate: item.ngayGiaNhapDoan,
            group: item.doan ? item.doan.tenDoan : 'N/A',
            phapdanh: item.phapDanh,
            bacHoc: bacHocId ? { bacHocId, tenBacHoc } : null, 
          };
        });
        setUsersData(fetchedData);

      } catch (error) {

        console.error('Lỗi khi gọi API:', error);
      }
    };
    layDuLieu();
  }, []);

  const handleAddHuynhTruong = (newHuynhTruong) => {
    setUsersData((prevData) => [...prevData, newHuynhTruong]);
  };
  
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
  
    // Hiển thị hộp thoại xác nhận
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn có muốn ${newStatus === 'Active' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng này không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, thay đổi nó!',
      cancelButtonText: 'Hủy'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.put(`${env.apiUrl}/api/users/activeUser`, null, {
          params: {
            userId: user.id,
            activeUser: newStatus === 'Active',
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        // Cập nhật trạng thái người dùng trong dữ liệu local state
        setUsersData(prevUsersData => 
          prevUsersData.map(u => 
            u.id === user.id ? { ...u, status: newStatus } : u
          )
        );
  
        // Hiển thị thông báo thành công
        Swal.fire(
          'Thành công!',
          `Trạng thái người dùng đã được cập nhật.`,
          'success'
        );
  
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        // Hiển thị thông báo lỗi
        Swal.fire(
          'Thất bại!',
          'Đã xảy ra lỗi khi cập nhật trạng thái người dùng.',
          'error'
        );
      }
    }
  };


  const formatDateToDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredData = usersData.filter((user) => {
    return (
      (searchName === '' || user.name.toLowerCase().includes(searchName.toLowerCase())) &&
      (searchRegistered === '' || formatDateToDDMMYYYY(user.registered).includes(searchRegistered)) &&
      (searchRole === '' || user.role.toLowerCase().includes(searchRole.toLowerCase())) &&
      (searchStatus === '' || user.status.toLowerCase().includes(searchStatus.toLowerCase()))
    );
  });


  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };



  const headers = [
    <CTableDataCell width={'10%'} className="fixed-width-column">Ảnh</CTableDataCell>,
    <CTableDataCell width={'30%'} className="fixed-width-column">Pháp Danh || Tên</CTableDataCell>,
    <CTableDataCell width={'10%'} className="fixed-width-column">Vai trò 1</CTableDataCell>,
    <CTableDataCell width={'10%'} className="fixed-width-column">Vai trò 2</CTableDataCell>,
    <CTableDataCell width={'20%'} className="fixed-width-column">Trạng thái</CTableDataCell>,
    <CTableDataCell width={'10%'} className="fixed-width-column">Thao tác</CTableDataCell>
  ];
  const headerCells = [
    '',
    <CFormInput className='fixed-width-input'
      type="search"
      placeholder="Tìm theo tên"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
    />,
    <CFormInput className='fixed-width-input'
      type="search"
      placeholder="Tìm theo ngày đăng ký (dd-mm-yyyy)"
      value={searchRegistered}
      onChange={(e) => setSearchRegistered(e.target.value)}
    />,
    <CFormInput className='fixed-width-input'
      type="search"
      placeholder="Tìm theo vai trò"
      value={searchRole}
      onChange={(e) => setSearchRole(e.target.value)}
    />,

    <CFormInput className='fixed-width-input'
      type="search"
      placeholder="Tìm theo trạng thái"
      value={searchStatus}
      onChange={(e) => setSearchStatus(e.target.value)}
    />,

    '',
  ];

  const renderRow = (user) => (
    <>
      <CTableDataCell>
        <CAvatar src={` ${env.apiUrl}/api/file/get-img?userId=${user.id}&t=${Date.now()} `} />
      </CTableDataCell>
      <CTableDataCell>{user.phapdanh} || {user.name}</CTableDataCell>
      <CTableDataCell>{user.role1}</CTableDataCell>
      <CTableDataCell>{user.role2}</CTableDataCell>
      <CTableDataCell>
        <CBadge id='custom-badge' className={getBadgeClass(user.status)}>
          {user.status}
        </CBadge>
      </CTableDataCell>
      <CTableDataCell>

      <CDropdown>
          <CDropdownToggle variant="outline" color="info">Xem</CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem variant="outline" onClick={() => handleShowModal(user)}>
              <CButton>Thông tin</CButton>
            </CDropdownItem>
            <CDropdownItem
              onClick={() => handleToggleStatus(user)}>
              <CButton>{user.status === 'Active' ? 'Tắt Trạng Thái' : 'Bật Trạng Thái'}</CButton>
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>



      </CTableDataCell>
    </>
  );

  return (

    <div className="container-fluid">
      <CategoryCarousel categories={usersData} />
      <br />
      <CRow className="mb-3 d-flex">
        <CCol className="d-flex align-items-center flex-grow-1">
          <h3>Danh sách Huynh Trưởng</h3>
        </CCol>
        <CCol className="d-flex justify-content-end">
          <CButton color="secondary" onClick={handleShowAddModal} >Thêm</CButton>

        </CCol>
      </CRow>

      <Table
        headers={headers}
        headerCells={headerCells}
        items={filteredData}
        renderRow={renderRow}
        searchCriteria={{ searchName, searchRegistered, searchRole, searchStatus }}
      />


      {selectedUser && (
        <UserModal
          show={showModal}
          handleClose={handleCloseModal}
          user={selectedUser}
          handleGenderChange={handleGenderChange}
        />
      )}

      {showAddModal && (
          <AddHuynhTruongModal show={showAddModal} 
          handleClose={handleCloseAddModal}
          onAddHuynhTruong={handleAddHuynhTruong} />
        )}


    </div>
  )
}

export default DSNganhThanh
