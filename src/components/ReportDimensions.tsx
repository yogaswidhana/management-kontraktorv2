import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Upload, Image, Space, Typography, Select } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';

const { Title } = Typography;

interface DimensionRecord {
  id: number;
  no_kontrak: string;
  id_dimensi: string;
  item_pekerjaan: string;
  nama_item_pekerjaan: string;
  nama_kegiatan: string;
  panjang_pengukuran: number;
  foto_dokumentasi_panjang: string;
  lokasi_gps_panjang: string;
  tanggal_waktu_panjang: string;
  lebar_pengukuran: number;
  foto_dokumentasi_lebar: string;
  lokasi_gps_lebar: string;
  tanggal_waktu_lebar: string;
  tinggi_pengukuran: number;
  foto_dokumentasi_tinggi: string;
  lokasi_gps_tinggi: string;
  tanggal_waktu_tinggi: string;
  minggu: string;
}

interface DimensionFormValues {
  project_id: number;
  no_kontrak: string;
  id_dimensi: string;
  item_pekerjaan: string;
  panjang_pengukuran: number;
  lokasi_gps_panjang: string;
  tanggal_waktu_panjang: moment.Moment;
  lebar_pengukuran: number;
  lokasi_gps_lebar: string;
  tanggal_waktu_lebar: moment.Moment;
  tinggi_pengukuran: number;
  lokasi_gps_tinggi: string;
  tanggal_waktu_tinggi: moment.Moment;
  [key: string]: string | number | moment.Moment;
}

interface Project {
  id: number;
  nama_kegiatan: string;
  nomor_kontrak: string;
}

interface ProjectProgress {
  project_id: number;
  item_pekerjaan: string;
  nama_item_pekerjaan: string;
  minggu: string;
}

const ReportDimensions = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DimensionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fotoPanjang, setFotoPanjang] = useState<File | null>(null);
  const [fotoLebar, setFotoLebar] = useState<File | null>(null);
  const [fotoTinggi, setFotoTinggi] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([]);
  const [currentTime, setCurrentTime] = useState(moment());

  // Add useEffect for real-time time update
  useEffect(() => {
    const timer = setInterval(() => {
      const now = moment();
      setCurrentTime(now);
      form.setFieldsValue({
        tanggal_waktu_panjang: now,
        tanggal_waktu_lebar: now,
        tanggal_waktu_tinggi: now
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [form]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if ((width <= 768 && !isMobile) || (width > 768 && isMobile)) {
        setIsMobile(width <= 768);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Ambil data laporan dimensi
      const response = await axios.get('http://localhost:5000/api/dimension-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Ambil data progress untuk setiap project_id yang ada
      const formattedData = await Promise.all(response.data.map(async (item: any) => {
        const project = projects.find(p => p.id === item.project_id);
        
        // Ambil data progress untuk project ini
        let progress = null;
        if (project) {
          const progressResponse = await axios.get(
            `http://localhost:5000/api/project-progress/${item.project_id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          progress = progressResponse.data.find(
            (p: ProjectProgress) => p.item_pekerjaan === item.item_pekerjaan
          );
        }

        return {
          ...item,
          nama_kegiatan: project?.nama_kegiatan || 'Tidak ada data',
          nama_item_pekerjaan: progress?.nama_item_pekerjaan || 'Tidak ada data',
          minggu: progress?.minggu || 'Tidak ada data'
        };
      }));

      console.log('Formatted data:', formattedData);
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Gagal mengambil data laporan dimensi');
    } finally {
      setLoading(false);
    }
  }, [projects]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;
      await fetchData();
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  useEffect(() => {
    let mounted = true;

    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !mounted) return;

        const projectResponse = await axios.get('http://localhost:5000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (mounted) {
          setProjects(projectResponse.data);
        }
      } catch (error) {
        if (mounted) {
          message.error('Gagal mengambil data proyek');
        }
      }
    };

    fetchProjectData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProgressData = async () => {
      if (!projectId || !mounted) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/project-progress/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (mounted) {
          setProjectProgress(response.data);
        }
      } catch (error) {
        if (mounted) {
          message.error('Gagal mengambil data progress pekerjaan');
        }
      }
    };

    fetchProgressData();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
    setFotoPanjang(null);
    setFotoLebar(null);
    setFotoTinggi(null);
    
    // Set waktu saat ini untuk semua field tanggal
    form.setFieldsValue({
      tanggal_waktu_panjang: currentTime,
      tanggal_waktu_lebar: currentTime,
      tanggal_waktu_tinggi: currentTime
    });
  };

  const handleEdit = (record: DimensionRecord) => {
    const project = projects.find(p => p.nama_kegiatan === record.nama_kegiatan);
    if (project) {
      setProjectId(project.id);
    }

    form.setFieldsValue({
      ...record,
      project_id: project?.id,
      tanggal_waktu_panjang: currentTime,
      tanggal_waktu_lebar: currentTime,
      tanggal_waktu_tinggi: currentTime
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Sesi telah berakhir, silakan login kembali');
        return;
      }

      await axios.delete(`http://localhost:5000/api/dimension-reports/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('Laporan dimensi berhasil dihapus');
      fetchData();
    } catch (error) {
      message.error('Gagal menghapus laporan dimensi');
    }
  };

  const handleSubmit = async (values: DimensionFormValues) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Sesi telah berakhir, silakan login kembali');
        return;
      }

      // Validasi project dan progress
      if (!values.project_id || !values.item_pekerjaan) {
        message.error('Silakan pilih kegiatan dan item pekerjaan');
        return;
      }

      // Dapatkan data project dan progress yang dipilih
      const project = projects.find(p => p.id === values.project_id);
      const progress = projectProgress.find(p => p.item_pekerjaan === values.item_pekerjaan);

      if (!project || !progress) {
        message.error('Data kegiatan atau item pekerjaan tidak valid');
        return;
      }

      const formData = new FormData();
      
      // Tambahkan nama_kegiatan dan nama_item_pekerjaan ke formData
      formData.append('project_id', String(values.project_id));
      formData.append('no_kontrak', project.nomor_kontrak);
      formData.append('id_dimensi', values.id_dimensi);
      formData.append('item_pekerjaan', values.item_pekerjaan);
      formData.append('nama_kegiatan', project.nama_kegiatan);
      formData.append('nama_item_pekerjaan', progress.nama_item_pekerjaan);
      formData.append('minggu', progress.minggu);
      formData.append('panjang_pengukuran', String(values.panjang_pengukuran));
      formData.append('lebar_pengukuran', String(values.lebar_pengukuran));
      formData.append('tinggi_pengukuran', String(values.tinggi_pengukuran));
      formData.append('lokasi_gps_panjang', values.lokasi_gps_panjang);
      formData.append('lokasi_gps_lebar', values.lokasi_gps_lebar);
      formData.append('lokasi_gps_tinggi', values.lokasi_gps_tinggi);
      formData.append('tanggal_waktu_panjang', currentTime.format('YYYY-MM-DD HH:mm:ss'));
      formData.append('tanggal_waktu_lebar', currentTime.format('YYYY-MM-DD HH:mm:ss'));
      formData.append('tanggal_waktu_tinggi', currentTime.format('YYYY-MM-DD HH:mm:ss'));

      // Append file foto jika ada
      if (fotoPanjang) formData.append('foto_dokumentasi_panjang', fotoPanjang);
      if (fotoLebar) formData.append('foto_dokumentasi_lebar', fotoLebar);
      if (fotoTinggi) formData.append('foto_dokumentasi_tinggi', fotoTinggi);

      const response = await axios({
        method: editingId ? 'put' : 'post',
        url: editingId ? `http://localhost:5000/api/dimension-reports/${editingId}` : 'http://localhost:5000/api/dimension-reports',
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Server response:', response.data);

      if (response.status === 200 || response.status === 201) {
        message.success(`Laporan dimensi berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`);
        setModalVisible(false);
        form.resetFields();
        setFotoPanjang(null);
        setFotoLebar(null);
        setFotoTinggi(null);
        fetchData();
      }
    } catch (error: any) {
      console.error('Error detail:', error.response?.data);
      message.error(error.response?.data?.message || 'Gagal menyimpan laporan dimensi');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filename: string) => {
    return `http://localhost:5000/uploads/dimensi/${filename}`;
  };

  const handleProjectChange = async (value: number) => {
    try {
      console.log('Project changed to:', value);
      setProjectId(value);
      
      // Cari project yang dipilih
      const project = projects.find(p => p.id === value);
      console.log('Found project:', project);
      
      if (project) {
        // Fetch progress data untuk project yang dipilih
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/project-progress/${value}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setProjectProgress(response.data);
      }
      
      // Reset progress selection
      form.setFieldValue('item_pekerjaan', undefined);
    } catch (error) {
      console.error('Error fetching project progress:', error);
      message.error('Gagal mengambil data progress proyek');
    }
  };

  const handleProgressChange = (value: string) => {
    console.log('Progress changed to:', value);
    const progress = projectProgress.find(p => p.item_pekerjaan === value);
    console.log('Found progress:', progress);
  };

  const renderMobileCard = (record: DimensionRecord) => {
    console.log('Rendering card with record:', record);

    return (
      <Card 
        key={record.id}
        style={{ 
          marginBottom: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        actions={[
          <Button 
            type="link" 
            onClick={() => handleEdit(record)}
            style={{ color: '#1890ff' }}
          >
            Edit
          </Button>,
          <Button
            type="link" 
            danger 
            onClick={() => handleDelete(record.id)}
          >
            Hapus
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ 
            color: '#1890ff',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Informasi Dasar
          </Title>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <div style={{ color: '#8c8c8c', fontWeight: 'bold' }}>Nama Kegiatan</div>
              <div style={{ marginTop: '4px' }}>{record.nama_kegiatan}</div>
            </div>
            <div>
              <div style={{ color: '#8c8c8c', fontWeight: 'bold' }}>Nama Item Pekerjaan</div>
              <div style={{ marginTop: '4px' }}>{record.nama_item_pekerjaan}</div>
            </div>
            <div>
              <div style={{ color: '#8c8c8c', fontWeight: 'bold' }}>Minggu Ke</div>
              <div style={{ marginTop: '4px' }}>{record.minggu}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ marginBottom: '8px' }}>Pengukuran</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ color: '#8c8c8c' }}>Panjang</div>
              <div>{record.panjang_pengukuran} m</div>
              <div style={{ color: '#8c8c8c', marginTop: '4px' }}>Lokasi GPS</div>
              <div>{record.lokasi_gps_panjang}</div>
              <div style={{ color: '#8c8c8c', marginTop: '4px' }}>Tanggal & Waktu</div>
              <div>{moment(record.tanggal_waktu_panjang).format('DD/MM/YYYY HH:mm')}</div>
            </div>
            <div>
              <div style={{ color: '#8c8c8c' }}>Lebar</div>
              <div>{record.lebar_pengukuran} m</div>
              <div style={{ color: '#8c8c8c', marginTop: '4px' }}>Lokasi GPS</div>
              <div>{record.lokasi_gps_lebar}</div>
              <div style={{ color: '#8c8c8c', marginTop: '4px' }}>Tanggal & Waktu</div>
              <div>{moment(record.tanggal_waktu_lebar).format('DD/MM/YYYY HH:mm')}</div>
            </div>
            <div>
              <div style={{ color: '#8c8c8c' }}>Tinggi</div>
              <div>{record.tinggi_pengukuran} m</div>
              <div style={{ color: '#8c8c8c', marginTop: '4px' }}>Lokasi GPS</div>
              <div>{record.lokasi_gps_tinggi}</div>
              <div style={{ color: '#8c8c8c', marginTop: '4px' }}>Tanggal & Waktu</div>
              <div>{moment(record.tanggal_waktu_tinggi).format('DD/MM/YYYY HH:mm')}</div>
            </div>
          </div>
        </div>

        <div>
          <Title level={5} style={{ marginBottom: '8px' }}>Foto Dokumentasi</Title>
          <Space wrap>
            {record.foto_dokumentasi_panjang && (
              <Image 
                src={getImageUrl(record.foto_dokumentasi_panjang)}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            {record.foto_dokumentasi_lebar && (
              <Image
                src={getImageUrl(record.foto_dokumentasi_lebar)}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            {record.foto_dokumentasi_tinggi && (
              <Image
                src={getImageUrl(record.foto_dokumentasi_tinggi)}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
          </Space>
        </div>
      </Card>
    );
  };

  const columns: ColumnsType<DimensionRecord> = [
    {
      title: 'Nama Kegiatan',
      dataIndex: 'nama_kegiatan',
      key: 'nama_kegiatan'
    },
    {
      title: 'Item Pekerjaan',
      dataIndex: 'nama_item_pekerjaan',
      key: 'nama_item_pekerjaan'
    },
    {
      title: 'Minggu Ke',
      dataIndex: 'minggu',
      key: 'minggu'
    },
    {
      title: 'Panjang (m)',
      dataIndex: 'panjang_pengukuran',
      key: 'panjang_pengukuran'
    },
    {
      title: 'Lebar (m)',
      dataIndex: 'lebar_pengukuran', 
      key: 'lebar_pengukuran'
    },
    {
      title: 'Tinggi (m)',
      dataIndex: 'tinggi_pengukuran',
      key: 'tinggi_pengukuran'
    },
    {
      title: 'Foto Dokumentasi',
      key: 'photos',
      render: (_: unknown, record: DimensionRecord) => (
        <Space>
          {record.foto_dokumentasi_panjang && (
            <Image 
              src={getImageUrl(record.foto_dokumentasi_panjang)}
              width={50}
              preview={{
                src: getImageUrl(record.foto_dokumentasi_panjang)
              }}
            />
          )}
          {record.foto_dokumentasi_lebar && (
            <Image
              src={getImageUrl(record.foto_dokumentasi_lebar)}
              width={50}
              preview={{
                src: getImageUrl(record.foto_dokumentasi_lebar)
              }}
            />
          )}
          {record.foto_dokumentasi_tinggi && (
            <Image
              src={getImageUrl(record.foto_dokumentasi_tinggi)}
              width={50}
              preview={{
                src: getImageUrl(record.foto_dokumentasi_tinggi)
              }}
            />
          )}
        </Space>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: unknown, record: DimensionRecord) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Hapus</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Kembali
        </Button>
        <Button type="primary" onClick={handleAdd}>
          {isMobile ? '+' : 'Tambah Laporan Dimensi'}
        </Button>
      </div>
      
      <Card>
        <Title level={isMobile ? 5 : 4} style={{ 
          color: '#1890ff',
          fontWeight: 'bold',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <InfoIcon style={{ fontSize: isMobile ? 28 : 36, color: '#1890ff' }} />
          Laporan Dimensi
        </Title>
        
        {isMobile ? (
          <div>
            {data.map((record: DimensionRecord) => renderMobileCard(record))}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: true }}
            pagination={{
              pageSize: 10
            }}
          />
        )}
      </Card>

      <Modal
        title={editingId ? "Edit Laporan Dimensi" : "Tambah Laporan Dimensi"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? '100%' : '600px'}
        style={{ 
          top: isMobile ? 0 : 20,
          margin: isMobile ? 0 : '0 auto',
          maxWidth: '100vw',
          padding: isMobile ? '0' : undefined
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            project_id: projectId,
            id_dimensi: `DIM${Date.now()}`
          }}
        >
          <Form.Item
            name="project_id"
            label="Nama Kegiatan"
            rules={[{ required: true }]}
          >
            <Select onChange={handleProjectChange}>
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.nama_kegiatan}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="id_dimensi"
            label="ID Dimensi"
            rules={[{ required: true }]}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="item_pekerjaan"
            label="Nama Item Pekerjaan" 
            rules={[{ required: true }]}
          >
            <Select onChange={handleProgressChange}>
              {projectProgress.map((item, index) => (
                <Select.Option 
                  key={`${item.project_id}_${item.item_pekerjaan}_${item.minggu}_${index}`} 
                  value={item.item_pekerjaan}
                >
                  {item.nama_item_pekerjaan} ({item.minggu})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="panjang_pengukuran"
            label="Panjang Pengukuran"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="foto_dokumentasi_panjang"
            label="Foto Dokumentasi Panjang"
            rules={[{ required: true }]}
          >
            <Upload
              beforeUpload={(file) => {
                setFotoPanjang(file);
                return false;
              }}
              maxCount={1}
              listType="picture-card"
              fileList={fotoPanjang ? [{ uid: '-1', name: fotoPanjang.name, status: 'done' }] : []}
            >
              <Button icon={<UploadOutlined />}>Pilih Foto</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="lokasi_gps_panjang"
            label="Lokasi GPS Panjang"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tanggal_waktu_panjang"
            label="Tanggal & Waktu Panjang"
            rules={[{ required: true, message: 'Tanggal dan waktu panjang harus diisi' }]}
          >
            <Input value={currentTime.format('DD/MM/YYYY HH:mm:ss')} readOnly />
          </Form.Item>

          <Form.Item
            name="lebar_pengukuran"
            label="Lebar Pengukuran"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="foto_dokumentasi_lebar"
            label="Foto Dokumentasi Lebar"
            rules={[{ required: true }]}
          >
            <Upload
              beforeUpload={(file) => {
                setFotoLebar(file);
                return false;
              }}
              maxCount={1}
              listType="picture-card"
              fileList={fotoLebar ? [{ uid: '-1', name: fotoLebar.name, status: 'done' }] : []}
            >
              <Button icon={<UploadOutlined />}>Pilih Foto</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="lokasi_gps_lebar"
            label="Lokasi GPS Lebar"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tanggal_waktu_lebar"
            label="Tanggal & Waktu Lebar"
            rules={[{ required: true, message: 'Tanggal dan waktu lebar harus diisi' }]}
          >
            <Input value={currentTime.format('DD/MM/YYYY HH:mm:ss')} readOnly />
          </Form.Item>

          <Form.Item
            name="tinggi_pengukuran"
            label="Tinggi Pengukuran"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="foto_dokumentasi_tinggi"
            label="Foto Dokumentasi Tinggi"
            rules={[{ required: true }]}
          >
            <Upload
              beforeUpload={(file) => {
                setFotoTinggi(file);
                return false;
              }}
              maxCount={1}
              listType="picture-card"
              fileList={fotoTinggi ? [{ uid: '-1', name: fotoTinggi.name, status: 'done' }] : []}
            >
              <Button icon={<UploadOutlined />}>Pilih Foto</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="lokasi_gps_tinggi"
            label="Lokasi GPS Tinggi"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tanggal_waktu_tinggi"
            label="Tanggal & Waktu Tinggi"
            rules={[{ required: true, message: 'Tanggal dan waktu tinggi harus diisi' }]}
          >
            <Input value={currentTime.format('DD/MM/YYYY HH:mm:ss')} readOnly />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                {editingId ? 'Update' : 'Submit'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Batal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportDimensions;
