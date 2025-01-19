import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Upload, Image, Space, Typography, Select } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, CameraOutlined } from '@ant-design/icons';
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
  volume: number;
  harga_satuan: number;
  nilai_pekerjaan: number;
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
  harga_satuan: number;
  minggu: string;
}

const ReportDimensions: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DimensionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fotoPanjang, setFotoPanjang] = useState<File | null>(null);
  const [fotoLebar, setFotoLebar] = useState<File | null>(null);
  const [fotoTinggi, setFotoTinggi] = useState<File | null>(null);
  const [previewPanjang, setPreviewPanjang] = useState<string | null>(null);
  const [previewLebar, setPreviewLebar] = useState<string | null>(null);
  const [previewTinggi, setPreviewTinggi] = useState<string | null>(null);
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
    const fetchProgressData = async () => {
      if (!projectId) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/project-progress/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const progressData = Array.isArray(response.data) ? response.data : 
                            response.data.items ? response.data.items : [];
        
        setProjectProgress(progressData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        message.error('Gagal mengambil data progress pekerjaan');
        setProjectProgress([]);
      }
    };

    fetchProgressData();
  }, [projectId]);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
    setFotoPanjang(null);
    setFotoLebar(null);
    setFotoTinggi(null);
    setPreviewPanjang(null);
    setPreviewLebar(null); 
    setPreviewTinggi(null);
    
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

  const calculateNilaiPekerjaan = (volume: number, progress: ProjectProgress | undefined) => {
    if (!progress) return 0;
    return volume * progress.harga_satuan;
  };

  const handleSubmit = async (values: any) => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('Sesi telah berakhir, silakan login kembali');
            return;
        }

        const formData = new FormData();
        
        // Pisahkan item_pekerjaan dan minggu dengan pengecekan null/undefined
        const [itemPekerjaan, minggu] = (values.item_pekerjaan || '').split('|');

        // Cari project yang dipilih untuk mendapatkan nomor kontrak
        const selectedProject = projects.find(p => p.id === values.project_id);
        
        // Cari progress untuk mendapatkan nama item pekerjaan
        const selectedProgress = projectProgress.find(p => 
            p.item_pekerjaan === itemPekerjaan && 
            p.minggu === minggu
        );

        // Validasi data wajib
        if (!values.project_id || !itemPekerjaan || !selectedProject || !selectedProgress) {
            message.error('Project dan item pekerjaan harus diisi');
            return;
        }

        formData.append('project_id', String(values.project_id));
        formData.append('no_kontrak', selectedProject.nomor_kontrak);
        formData.append('id_dimensi', String(values.id_dimensi || ''));
        formData.append('item_pekerjaan', itemPekerjaan);
        formData.append('nama_item_pekerjaan', selectedProgress.nama_item_pekerjaan);
        formData.append('minggu', minggu || '');
        formData.append('panjang_pengukuran', String(values.panjang_pengukuran || 0));
        formData.append('lebar_pengukuran', String(values.lebar_pengukuran || 0));
        formData.append('tinggi_pengukuran', String(values.tinggi_pengukuran || 0));
        
        // Validasi dan tambahkan file foto
        if (!fotoPanjang || !fotoLebar || !fotoTinggi) {
            message.error('Semua foto dokumentasi harus diisi');
            return;
        }

        formData.append('foto_dokumentasi_panjang', fotoPanjang);
        formData.append('foto_dokumentasi_lebar', fotoLebar);
        formData.append('foto_dokumentasi_tinggi', fotoTinggi);

        // Tambahkan lokasi GPS dan waktu
        formData.append('lokasi_gps_panjang', String(values.lokasi_gps_panjang || ''));
        formData.append('lokasi_gps_lebar', String(values.lokasi_gps_lebar || ''));
        formData.append('lokasi_gps_tinggi', String(values.lokasi_gps_tinggi || ''));
        
        formData.append('tanggal_waktu_panjang', moment().format('YYYY-MM-DD HH:mm:ss'));
        formData.append('tanggal_waktu_lebar', moment().format('YYYY-MM-DD HH:mm:ss'));
        formData.append('tanggal_waktu_tinggi', moment().format('YYYY-MM-DD HH:mm:ss'));

        const response = await axios.post(
            'http://localhost:5000/api/dimension-reports',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('Server response:', response.data);
        message.success('Laporan dimensi berhasil ditambahkan');
        setModalVisible(false);
        form.resetFields();
        await fetchData();

    } catch (error: any) {
        console.error('Axios error:', error);
        if (error.response) {
            message.error(error.response.data.message || 'Gagal menambahkan laporan dimensi');
            console.error('Server error response:', error.response.data);
        } else {
            message.error('Gagal menambahkan laporan dimensi');
        }
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
    const [itemPekerjaan, minggu] = value.split('|');
    const selectedProgress = projectProgress.find(p => 
      p.item_pekerjaan === itemPekerjaan && 
      p.minggu === minggu
    );
    
    if (selectedProgress) {
      form.setFieldsValue({
        minggu: selectedProgress.minggu
      });
    }
  };

  const captureImage = async (setFotoFunction: (file: File) => void, setPreviewFunction: (preview: string) => void) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.srcObject = stream;
      await video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      // Hentikan stream kamera
      stream.getTracks().forEach(track => track.stop());

      // Konversi canvas ke file dan preview URL
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFotoFunction(file);
          setPreviewFunction(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
    } catch (error) {
      console.error('Error accessing camera:', error);
      message.error('Gagal mengakses kamera');
    }
  };

  const handleFileChange = (file: File, setFotoFunction: (file: File) => void, setPreviewFunction: (preview: string) => void) => {
    setFotoFunction(file);
    setPreviewFunction(URL.createObjectURL(file));
    return false; // Prevent upload
  };

  const renderMobileCard = (record: DimensionRecord) => {
    const volume = record.panjang_pengukuran * record.lebar_pengukuran * record.tinggi_pengukuran;
    const progress = projectProgress.find(p => p.item_pekerjaan === record.item_pekerjaan);
    const nilai = calculateNilaiPekerjaan(volume, progress);

    return (
      <Card 
        key={`${record.id}-${record.nama_kegiatan}`}
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
          <div style={{ marginTop: '16px' }}>
            <div style={{ color: '#8c8c8c', fontWeight: 'bold' }}>Volume</div>
            <div style={{ fontSize: '16px', color: '#1890ff' }}>{volume.toFixed(2)} m³</div>
            <div style={{ color: '#8c8c8c', fontWeight: 'bold', marginTop: '8px' }}>Nilai Pekerjaan</div>
            <div style={{ fontSize: '16px', color: '#1890ff' }}>
              Rp {new Intl.NumberFormat('id-ID').format(nilai)}
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
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume: number) => volume.toFixed(2)
    },
    {
      title: 'Harga Satuan',
      dataIndex: 'harga_satuan',
      key: 'harga_satuan',
      render: (harga: number) => `Rp ${new Intl.NumberFormat('id-ID').format(harga)}`
    },
    {
      title: 'Nilai Pekerjaan',
      dataIndex: 'nilai_pekerjaan',
      key: 'nilai_pekerjaan',
      render: (nilai: number) => `Rp ${new Intl.NumberFormat('id-ID').format(nilai)}`
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

  const renderProgressOptions = () => {
    const uniqueOptions = new Set();
    
    return projectProgress.map((progress, index) => {
      const optionKey = `${progress.item_pekerjaan}_${progress.minggu}_${index}`;
      
      const optionValue = `${progress.item_pekerjaan}|${progress.minggu}`;
      if (uniqueOptions.has(optionValue)) {
        return null;
      }
      
      uniqueOptions.add(optionValue);
      
      return (
        <Select.Option 
          key={optionKey} 
          value={optionValue}
        >
          {`${progress.nama_item_pekerjaan} - ${progress.minggu}`}
        </Select.Option>
      );
    }).filter(Boolean);
  };

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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Title level={isMobile ? 5 : 4} style={{ 
            color: '#1890ff',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <InfoIcon style={{ fontSize: isMobile ? 28 : 36, color: '#1890ff' }} />
            Laporan Dimensi
          </Title>

          <Select
            style={{ width: isMobile ? '100%' : 200 }}
            placeholder="Filter Nama Kegiatan"
            allowClear
            onChange={(value) => {
              const filteredData = value 
                ? data.filter(item => item.nama_kegiatan === value)
                : data;
              setData(filteredData);
            }}
          >
            {projects.map(project => (
              <Select.Option key={project.id} value={project.nama_kegiatan}>
                {project.nama_kegiatan}
              </Select.Option>
            ))}
          </Select>
        </div>
        
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
            rules={[{ required: true, message: 'Silakan pilih item pekerjaan' }]}
          >
            <Select onChange={handleProgressChange}>
              {renderProgressOptions()}
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
            rules={[{ required: !fotoPanjang, message: 'Foto dokumentasi panjang harus diisi' }]}
          >
            <Space direction="vertical" align="start">
              <Space>
                <Upload
                  beforeUpload={(file) => handleFileChange(file, setFotoPanjang, setPreviewPanjang)}
                  maxCount={1}
                  listType="picture-card"
                  fileList={fotoPanjang ? [{ uid: '-1', name: fotoPanjang.name, status: 'done' }] : []}
                >
                  <Button icon={<UploadOutlined />}>Pilih File</Button>
                </Upload>
                <Button 
                  icon={<CameraOutlined />} 
                  onClick={() => captureImage(setFotoPanjang, setPreviewPanjang)}
                >
                  Ambil Foto
                </Button>
              </Space>
              {previewPanjang && (
                <Image
                  src={previewPanjang}
                  alt="Preview panjang"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                />
              )}
            </Space>
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
            rules={[{ required: !fotoLebar, message: 'Foto dokumentasi lebar harus diisi' }]}
          >
            <Space direction="vertical" align="start">
              <Space>
                <Upload
                  beforeUpload={(file) => handleFileChange(file, setFotoLebar, setPreviewLebar)}
                  maxCount={1}
                  listType="picture-card"
                  fileList={fotoLebar ? [{ uid: '-1', name: fotoLebar.name, status: 'done' }] : []}
                >
                  <Button icon={<UploadOutlined />}>Pilih File</Button>
                </Upload>
                <Button 
                  icon={<CameraOutlined />} 
                  onClick={() => captureImage(setFotoLebar, setPreviewLebar)}
                >
                  Ambil Foto
                </Button>
              </Space>
              {previewLebar && (
                <Image
                  src={previewLebar}
                  alt="Preview lebar"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                />
              )}
            </Space>
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
            rules={[{ required: !fotoTinggi, message: 'Foto dokumentasi tinggi harus diisi' }]}
          >
            <Space direction="vertical" align="start">
              <Space>
                <Upload
                  beforeUpload={(file) => handleFileChange(file, setFotoTinggi, setPreviewTinggi)}
                  maxCount={1}
                  listType="picture-card"
                  fileList={fotoTinggi ? [{ uid: '-1', name: fotoTinggi.name, status: 'done' }] : []}
                >
                  <Button icon={<UploadOutlined />}>Pilih File</Button>
                </Upload>
                <Button 
                  icon={<CameraOutlined />} 
                  onClick={() => captureImage(setFotoTinggi, setPreviewTinggi)}
                >
                  Ambil Foto
                </Button>
              </Space>
              {previewTinggi && (
                <Image
                  src={previewTinggi}
                  alt="Preview tinggi"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                />
              )}
            </Space>
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