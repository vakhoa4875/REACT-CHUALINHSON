import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
  CRow, CContainer,
  CCol, CFormSelect,
} from '@coreui/react'
import './UserModal.css';
import Swal from 'sweetalert2';
import apiClient from '../../../apiClient';

function AddHuynhTruongModal({ show, handleClose, onAddHuynhTruong }) {
  const [name, setName] = useState('');
  const [role1, setRole1] = useState('');
  const [role2, setRole2] = useState('');
  const [phapdanh, setPhapdanh] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [registered, setRegistered] = useState('');
  const [phone, setPhone] = useState('');
  const [sdtCha, setSdtCha] = useState('');
  const [sdtMe, setSdtMe] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Male');
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [rolesWithDoanId, setRolesWithDoanId] = useState([]);
  const [rolesWithoutDoanId, setRolesWithoutDoanId] = useState([]);
  const fileInputRef = useRef(null);
  const [bacHoc, setBacHoc] = useState(0);
  const [bacHocList, setBacHocList] = useState([]);
  const [ngayKetThucBacHoc, setNgayKetThucBacHoc] = useState('');
  const [capList, setCapList] = useState([]);
  const [capId, setCapId] = useState(0);
  const [ngayKetThucCap, setNgayKetThucCap] = useState('');
  const [traiHuanLuyenList, setTraiHuanLuyenList] = useState([]);
  const [traiHuanLuyenId, setTraiHuanLuyenId] = useState(0);
  const [ngayKetThucTraiHuanLuyen, setNgayKetThucTraiHuanLuyen] = useState('');

  useEffect(() => {
    setRegistered(new Date().toISOString().split('T')[0]);

    const fetchRoles = async () => {
      try {
        // Fetch roles as before
        const response = await apiClient.get(`/api/roles?isHuynhTruong=true`);
        const fetchedRoles = response.data.data;
        const rolesWithDoanId = fetchedRoles.filter((role) => role.doanId !== null);
        const rolesWithoutDoanId = fetchedRoles.filter((role) => role.doanId === null);

        setRolesWithDoanId(rolesWithDoanId);
        setRolesWithoutDoanId(rolesWithoutDoanId);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    // Fetch Bac Hoc
    const fetchBacHoc = async () => {
      try {
        const response = await apiClient.get(`/api/bac-hoc`);
        setBacHocList(response.data.data);
      } catch (error) {
        console.error('Error fetching Bac Hoc:', error);
      }
    };

    const fetchCap = async () => {
      try {
        const response = await apiClient.get(`/api/cap`);
        setCapList(response.data.data);
      } catch (error) {
        console.error('Error fetching Bac Hoc:', error);
      }
    };

    const fetchTraiHuanLuyen = async () => {
      try {
        const response = await apiClient.get(`/api/trai-huan-luyen`);
        setTraiHuanLuyenList(response.data.data);
      } catch (error) {
        console.error('Error fetching Bac Hoc:', error);
      }
    };

    fetchRoles();
    fetchBacHoc();
    fetchCap();
    fetchTraiHuanLuyen();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'role1':
        setRole1(value);
        break;
      case 'role2':
        setRole2(value);
        break;
      case 'phapdanh':
        setPhapdanh(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'birthDate':
        setBirthDate(value);
        break;
      case 'registered':
        setRegistered(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'sdtCha':
        setSdtCha(value);
        break;
      case 'sdtMe':
        setSdtMe(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'bacHoc':
        setBacHoc(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'cap':
        setCapId(value);
        break;
      case 'traiHuanLuyen':
        setTraiHuanLuyenId(value);
        break;
      case 'ngayKetThucBacHoc':
        setNgayKetThucBacHoc(value);
        break;
      case 'ngayKetThucCap':
        setNgayKetThucCap(value);
        break;
      case 'ngayKetThucTraiHuanLuyen':
        setNgayKetThucTraiHuanLuyen(value);
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!name) {
      newErrors.name = 'Họ và tên là bắt buộc';
      isValid = false;
    } if (!birthDate) {
      newErrors.birthDate = 'Ngày sinh là bắt buộc';
      isValid = false;
    } if (!role1 && !role2) {
      newErrors.role = 'Ít nhất một chức vụ phải được chọn';
      isValid = false;
    } if (!phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
      isValid = false;
    }
    if (!gender) {
      newErrors.gender = 'Giới tính là bắt buộc';
      isValid = false;
    }
    // Bắt buộc chọn "Ngày kết thúc bậc học" nếu đã chọn "Bậc học"
    if (bacHoc) {
      if (!ngayKetThucBacHoc) {
        newErrors.ngayKetThucBacHoc = 'Ngày kết thúc bậc học là bắt buộc';
        isValid = false;
      }
    }

    // Bắt buộc chọn "Ngày kết thúc cấp" nếu đã chọn "Cấp"
    if (capId) {
      if (!ngayKetThucCap) {
        newErrors.ngayKetThucCap = 'Ngày kết thúc cấp là bắt buộc';
        isValid = false;
      }
    }

    if (traiHuanLuyenId) {
      if (!ngayKetThucTraiHuanLuyen) {
        newErrors.ngayKetThucTraiHuanLuyen = 'Ngày kết thúc trại huấn luyện là bắt buộc';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSave = async () => {
    if (!validateForm()) return;

    const result = await Swal.fire({
      title: 'Xác nhận!',
      text: 'Bạn có chắc chắn muốn thêm Huynh Trưởng này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, thêm!',
      cancelButtonText: 'Hủy',
    });

    if (result.isDenied || result.isDismissed) return;


    const formData = {
      hoTen: name,
      ngaySinh: birthDate,
      sdt: phone,
      sdtCha: sdtCha,
      sdtMe: sdtMe,
      email: email,
      phapDanh: phapdanh,
      gioiTinh: gender === 'Male', // true for Male, false for Female
      createdDate: registered,
      isHuynhTruong: true,
      updatedDate: new Date().toISOString().split('T')[0], // Current date as string
      diaChi: address,
      isActive: true,
      roleId1: role1 ? { roleId: role1 } : null, // Assume role1 comes from a select input
      roleId2: role2 ? { roleId: role2 } : null, // Assume role2 comes from a select input
      lichSuHocs: bacHoc ? [{
        bacHocId: Number(bacHoc),
        ngayKetThuc: ngayKetThucBacHoc
      }] : null, // Assume bacHoc comes from a select input 
      lichSuCapDTOS: capId ? [{
        capId: Number(capId),
        ngayKetThuc: ngayKetThucCap
      }] : null, // Assume capId comes from a select input
      accountDTO: null,
      lichSuTraiHuanLuyenDTOS: traiHuanLuyenId ? [{
        traiHuanLuyenId: Number(traiHuanLuyenId),
        ngayKetThuc: ngayKetThucTraiHuanLuyen
      }] : null, // Assume traiHuanLuyenId comes from a select input
    };


    // console.log(formData)
    // return;

    try {
      // First API call to add Bac Hoc
      const response = await apiClient.post(`/api/users/create-user`, formData);
      // console.log(response.data.data);
      let data = response.data.data;
      if (selectedFile) {
        try {
          const fileFormData = new FormData();
          fileFormData.append('file', selectedFile);
          const userId = response.data.data.userId
          // console.log(userId);

          // Second API call to upload the file
          await apiClient.post(`/api/files/images/upload?userId=${userId}`, fileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (fileUploadError) {
          console.error('Lỗi khi upload file:', fileUploadError);
          Swal.fire({
            title: 'Thông báo từ hệ thống!',
            text: 'Thêm Huynh Trưởng thất bại do lỗi upload file.',
            icon: 'error',
          });

          return;
        }
      }


      Swal.fire({
        title: 'Thông báo từ hệ thống!',
        text: 'Thêm Huynh Trưởng Thành Công!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
      });
      onAddHuynhTruong();

      setName('');
      setRole1('');
      setRole2('');
      setPhapdanh('');
      setEmail('');
      setBirthDate('');
      setRegistered('');
      setPhone('');
      setSdtCha('');
      setSdtMe('');
      setAddress('');
      setGender('Male');
      setSelectedFile(null);
      setErrors({});
      setRolesWithDoanId([]);
      setRolesWithoutDoanId([]);
      fileInputRef.current.value = null;
      setBacHoc(0);
      setBacHocList([]);
      setNgayKetThucBacHoc('');
      setCapList([]);
      setCapId(0);
      setNgayKetThucCap('');
      setTraiHuanLuyenList([]);
      setTraiHuanLuyenId(0);
      setNgayKetThucTraiHuanLuyen('');
      handleClose();
    } catch (error) {
      // Handle error when adding Bac Hoc
      const errorMessage = error.response?.data?.message || 'Thêm thất bại.';
      Swal.fire({
        title: 'Thông báo từ hệ thống!',
        text: errorMessage,
        icon: 'error',
      });
    }
  };

  return (
    <Modal show={show} scrollable onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="modal-title">Thông Tin Huynh Trưởng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="avatar-container">
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : 'path/to/default/avatar.png'}
            alt="Avatar" className="user-avatar"
          />
          <input
            type="file" style={{ display: 'block', marginTop: '10px' }} ref={fileInputRef}
            onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Họ Và Tên</label>
          <div className="input-group">
            <input
              id="name" name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              type="text" value={name} onChange={handleInputChange} required />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>


          <label htmlFor="role">Chức Vụ</label>
          <CContainer className="px-1">
            <CRow>
              <CCol>
                <CFormSelect
                  name="role1" aria-label="Chức Vụ 1"
                  value={role1} onChange={handleInputChange}
                  className={`${errors.role ? 'is-invalid' : ''}`}
                >
                  <option value="">Chọn chức vụ 1</option>
                  {rolesWithDoanId.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol>
                <CFormSelect
                  name="role2" aria-label="Chức Vụ 2"
                  value={role2} onChange={handleInputChange}
                  className={`${errors.role ? 'is-invalid' : ''}`}
                >
                  <option value="">Chọn chức vụ 2</option>
                  {rolesWithoutDoanId.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            {errors.role && <div className="invalid-feedback d-block">{errors.role}</div>}
          </CContainer>


          <label htmlFor="phapdanh">Pháp Danh</label>
          <input
            name="phapdanh" className="form-control"
            type="text" value={phapdanh}
            onChange={handleInputChange}
          />


          <label htmlFor="bacHoc">Bậc Học</label>
          <CFormSelect
            name="bacHoc"
            aria-label="Chọn bậc học"
            value={bacHoc} // Correctly assign the state value here
            onChange={handleInputChange} // Handle change correctly
          >
            <option value="">Chọn bậc học</option>
            {bacHocList.map((bacHoc) => (
              <option key={bacHoc.bacHocId} value={bacHoc.bacHocId}>
                {bacHoc.tenBacHoc}
              </option>
            ))}
          </CFormSelect>

          <label htmlFor="ngayKetThucBacHoc">Ngày Kết Thúc Bậc Học</label>
          <input
            id="ngayKetThucBacHoc" name="ngayKetThucBacHoc" className={`form-control ${errors.ngayKetThucBacHoc ? 'is-invalid' : ''}`}
            type="date" value={ngayKetThucBacHoc} onChange={handleInputChange} required disabled={bacHoc === 0 || bacHoc === ""}

          />
          {errors.ngayKetThucBacHoc && <div className="invalid-feedback">{errors.ngayKetThucBacHoc}</div>}

          <label htmlFor="cap">Cấp</label>
          <CFormSelect
            name="cap"
            aria-label="Chọn cấp"
            value={capId} // Correctly assign the state value here
            onChange={handleInputChange} // Handle change correctly
          >
            <option value="">Chọn cấp</option>
            {capList.map((cap) => (
              <option key={cap.capId} value={cap.capId}>
                {cap.capName}
              </option>
            ))}
          </CFormSelect>

          <label htmlFor="ngayKetThucCap">Ngày Kết Thúc Cấp</label>
          <input
            id="ngayKetThucCap" name="ngayKetThucCap" className={`form-control ${errors.ngayKetThucCap ? 'is-invalid' : ''}`}
            type="date" value={ngayKetThucCap} onChange={handleInputChange} required disabled={capId === 0 || capId === ""}
          />
          {errors.ngayKetThucCap && <div className="invalid-feedback">{errors.ngayKetThucCap}</div>}

          <label htmlFor="traiHuanLuyen">Trại Huấn Luyện</label>
          <CFormSelect
            name="traiHuanLuyen"
            aria-label="Chọn trại huấn luyện"
            value={traiHuanLuyenId} // Correctly assign the state value here
            onChange={handleInputChange} // Handle change correctly
          >
            <option value="">Chọn trại huấn luyện</option>
            {traiHuanLuyenList.map((trai) => (
              <option key={trai.traiHuanLuyenId} value={trai.traiHuanLuyenId}>
                {trai.tenTraiHuanLuyen}
              </option>
            ))}
          </CFormSelect>

          <label htmlFor="ngayKetThucTraiHuanLuyen">Ngày Kết Thúc Cấp</label>
          <input
            id="ngayKetThucTraiHuanLuyen" name="ngayKetThucTraiHuanLuyen" className={`form-control ${errors.ngayKetThucTraiHuanLuyen ? 'is-invalid' : ''}`}
            type="date" value={ngayKetThucTraiHuanLuyen} onChange={handleInputChange} required disabled={traiHuanLuyenId === 0 || traiHuanLuyenId === ""}
          />
          {errors.ngayKetThucTraiHuanLuyen && <div className="invalid-feedback">{errors.ngayKetThucTraiHuanLuyen}</div>}

          <label htmlFor="email">Email</label>
          <input
            name="email" className="form-control"
            type="email" value={email}
            onChange={handleInputChange}
          />

          <label htmlFor="birthDate">Ngày Sinh</label>
          <input
            id="birthDate" name="birthDate" className={`form-control ${errors.birthDate ? 'is-invalid' : ''}`}
            type="date" value={birthDate} onChange={handleInputChange} required
          />
          {errors.birthDate && <div className="invalid-feedback">{errors.birthDate}</div>}

          <label htmlFor="registered">Ngày Gia Nhập</label>
          <input
            name="registered" className="form-control"
            type="date" value={registered}
            onChange={handleInputChange}
          />

          <label htmlFor="phone">Số Điện Thoại</label>
          <input
            id="phone" name="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            type="text" value={phone} onChange={handleInputChange} required
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}

          <label htmlFor="sdtCha">Số Điện Thoại Cha</label>
          <input
            id="sdtCha" name="sdtCha" className={`form-control ${errors.sdtCha ? 'is-invalid' : ''}`}
            type="text" value={sdtCha} onChange={handleInputChange} required
          />
          {errors.sdtCha && <div className="invalid-feedback">{errors.sdtCha}</div>}

          <label htmlFor="sdtMe">Số Điện Thoại Mẹ</label>
          <input
            id="sdtMe" name="sdtMe" className={`form-control ${errors.sdtMe ? 'is-invalid' : ''}`}
            type="text" value={sdtMe} onChange={handleInputChange} required
          />
          {errors.sdtMe && <div className="invalid-feedback">{errors.sdtMe}</div>}

          <label>Giới Tính</label>
          <div className="radio-group">
            <label className="radio-inline">
              <input type="radio" name="gender"
                value="Male" checked={gender === 'Male'}
                onChange={handleInputChange} required
              />
              Nam
            </label>
            <label className="radio-inline">
              <input
                type="radio" name="gender"
                value="Female" checked={gender === 'Female'}
                onChange={handleInputChange} required
              />
              Nữ
            </label>
          </div>
          {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}

          <label htmlFor="address">Địa Chỉ</label>
          <textarea
            name="address" className="form-control"
            rows="3" value={address} onChange={handleInputChange}
          ></textarea>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="footer-container">
          <div className="form-check form-switch">

          </div>
          <div className="footer-buttons">
            <Button variant="success" onClick={handleSave} >
              Save
            </Button>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AddHuynhTruongModal;
