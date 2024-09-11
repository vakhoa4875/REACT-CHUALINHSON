import React, { useState, useEffect } from 'react';
import {
  CBadge,
  CTableDataCell,
  CRow,
  CFormInput,
  CButton,
  CCol,
  CImage,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import axios from 'axios';
import '../DoanSinhCss/DanhSach.css';
import Table from '../../table/Table';
import InsertModal from './modalDoanSinh/InsertModal'
import UserModal from './modalDoanSinh/UserModal';
import env from '../../../env';
import Swal from 'sweetalert2';
import CategoryCarousel from "./modalDoanSinh/CategoryCarousel";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DSNganhThanh = () => {
  const [searchName, setSearchName] = useState('');
  const [searchChucVuMatch, setSearchChucVuMatch] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [showInsertModal, setShowInsertModal] = useState(false);

  useEffect(() => {
    const layDuLieu = async () => {
      try {
        const response = await axios.get(`${env.apiUrl}/api/users/getListUserWithIDoan?doanId=5`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        let imageUrl;
        const fetchedData = await Promise.all(response.data.data.map(async (item) => {
          try {
            const imageResponse = await axios.get(`${env.apiUrl}/api/file/get-img?userid=${item.userId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            imageUrl = (imageResponse.data.data)
          } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
          }

          const doanSinhDetails = item.doanSinhDetails || [];
          const lichSuHocs = item.lichSuHocs || [];
          const roleId1 = item.roleId1 || {};
          const roleId2 = item.roleId1 || {};

          return {
            id: item.userId,
            idUX: item.userIdUx,
            name: item.hoTen,
            avatar: imageUrl, // Lưu URL ảnh vào object người dùng
            registered: item.createdDate,
            phapDanh: item.phapDanh,
            ngaysinh: item.ngaySinh,
            phone: item.sdt,
            idchucvu1: roleId1.roleId,
            tenchucvu1: roleId1.roleName,
            idchucvu2: roleId2.roleName,
            tenchucvu2: roleId2.roleName,
            status: item.isActive ? 'Active' : 'Inactive',
            email: item.email,
            gender: item.gioiTinh ? "Male" : "Female",
            address: item.diaChi,
            vaitro: doanSinhDetails[0]?.role,
            sdtgd: item.sdtGd,
            doanSinhDetailId: doanSinhDetails[0]?.doanSinhDetailId,
            ngayGiaNhapDoan: doanSinhDetails[0]?.joinDate,
            ngayRoiDoan: doanSinhDetails[0]?.leftDate,
            mota: doanSinhDetails[0]?.moTa,
            tendoan: doanSinhDetails[0]?.tenDoan,
            tenBacHoc: lichSuHocs[0]?.tenBacHoc,
            bacHocId: lichSuHocs[0]?.bacHocId
          };
        }));
        setUsersData(fetchedData);
        
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    };
    layDuLieu();
  }, []);

  const formatDateToDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Hàm để mở modal
  const handleOpenInsertModal = () => {
    setShowInsertModal(true);
  };

  // Hàm để đóng modal
  const handleCloseInsertModal = () => {
    setShowInsertModal(false);
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Inactive':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const filteredData = usersData.filter((user) => {
    const nameMatch = (user.name || '').toLowerCase().includes(searchName.toLowerCase());

    // Thêm điều kiện lọc cho cả hai trường chức vụ
    const chucVuMatch = (user.tenchucvu1 || '').toLowerCase().includes(searchChucVuMatch.toLowerCase()) ||
      (user.tenchucvu2 || '').toLowerCase().includes(searchChucVuMatch.toLowerCase());

    const roleMatch = (user.vaitro || '').toLowerCase().includes(searchRole.toLowerCase());
    const statusMatch = (user.status || '').toLowerCase().includes(searchStatus.toLowerCase());

    return nameMatch && chucVuMatch && roleMatch && statusMatch;
  });


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


  const renderRow = (user) => (
    <>
      <CTableDataCell>
        <CImage
          src={user.avatar || '/path/to/default/avatar.png'}
          size="md" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
        />
      </CTableDataCell>
      <CTableDataCell>
        <div>{user.name} || {user.phapDanh}</div>
      </CTableDataCell>
      <CTableDataCell>{user.tenchucvu1}</CTableDataCell>
      <CTableDataCell>{user.vaitro}</CTableDataCell>
      <CTableDataCell>
        <CBadge id='custom-badge' className={getBadgeClass(user.status)}>
          {user.status}
        </CBadge>
      </CTableDataCell>
      <CTableDataCell>

        <CDropdown  >
          <CDropdownToggle variant="outline" color="info">Xem</CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem className="custom-dropdown-item" variant="outline" onClick={() => handleShowModal(user)}>
              Thông tin
            </CDropdownItem>
            <CDropdownItem className="custom-dropdown-item"
              onClick={() => handleToggleStatus(user)}
            >
              {user.status === 'Active' ? 'Tắt Trạng Thái' : 'Bật Trạng Thái'}

            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

      </CTableDataCell>
    </>
  );

  const headers = [
    <CTableDataCell width={'5%'} className="fixed-width-column">Ảnh</CTableDataCell>,
    <CTableDataCell width={'25%'} className="fixed-width-column">Tên || Pháp Danh</CTableDataCell>,
    <CTableDataCell width={'25%'} className="fixed-width-column">Chức vụ</CTableDataCell>,
    <CTableDataCell width={'20%'} className="fixed-width-column">Vai trò</CTableDataCell>,
    <CTableDataCell width={'15%'} className="fixed-width-column">Trạng thái</CTableDataCell>,
    <CTableDataCell width={'10%'} className="fixed-width-column">Thao tác</CTableDataCell>,
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
      placeholder="Tìm theo chức vụ"
      value={searchChucVuMatch}
      onChange={(e) => setSearchChucVuMatch(e.target.value)}
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

  return (
    <div className="container-fluid">
      <CategoryCarousel categories={usersData} />
      <CRow className="mb-3 d-flex">
        <CCol className="d-flex align-items-center flex-grow-1">
          <h3>Danh sách Đoàn Sinh</h3>
        </CCol>
        <CCol className="d-flex justify-content-end">
          <CButton variant="outline" color="info" onClick={handleOpenInsertModal}>Thêm</CButton>
        </CCol>
      </CRow>

      <Table
        headers={headers}
        headerCells={headerCells}
        items={filteredData}
        renderRow={renderRow}
        searchCriteria={{ searchName, searchChucVuMatch, searchRole, searchStatus }}
      />

      {selectedUser && (
        <UserModal
          show={showModal}
          handleClose={handleCloseModal}
          user={selectedUser}
        />
      )}

      {showInsertModal && (
        <InsertModal
          show={showInsertModal}
          handleClose={handleCloseInsertModal}
      />
      )}

    </div>
  );
};

export default DSNganhThanh;
