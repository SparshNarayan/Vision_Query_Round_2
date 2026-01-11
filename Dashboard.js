import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../components/UploadBox';
import SearchBar from '../components/SearchBar';
import ResultGrid from '../components/ResultGrid';
import HistoryPanel from '../components/HistoryPanel';
import {
  uploadImage,
  classifyImage,
  searchImages,
  getCurrentUser,
} from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (error) {
      navigate('/login');
    }
  };

  const handleUpload = async (file) => {
    try {
      const response = await uploadImage(file);
      alert('Image uploaded successfully!');
      // Refresh or add to images list if needed
    } catch (error) {
      alert(error.response?.data?.detail || 'Upload failed');
    }
  };

  const handleClassify = async (imageId) => {
    try {
      const response = await classifyImage(imageId);
      setSearchResults((prev) =>
        prev.map((img) =>
          img.image_id === imageId
            ? { ...img, classification: response.data.classification, confidence: response.data.confidence }
            : img
        )
      );
    } catch (error) {
      alert(error.response?.data?.detail || 'Classification failed');
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const response = await searchImages(query);
      setSearchResults(response.data.results);
      setActiveTab('results');
    } catch (error) {
      alert(error.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>VisionQuery</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user.username}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.main}>
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'upload' && styles.tabActive) }}
              onClick={() => setActiveTab('upload')}
            >
              Upload
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'search' && styles.tabActive) }}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'results' && styles.tabActive) }}
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'upload' && (
              <div>
                <h2 style={styles.sectionTitle}>Upload Image</h2>
                <UploadBox onUpload={handleUpload} />
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h2 style={styles.sectionTitle}>Search Images</h2>
                <SearchBar onSearch={handleSearch} loading={loading} />
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                <h2 style={styles.sectionTitle}>Search Results</h2>
                <ResultGrid results={searchResults} onClassify={handleClassify} />
              </div>
            )}
          </div>
        </div>

        <aside style={styles.sidebar}>
          <HistoryPanel userId={user.id} />
        </aside>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    background: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoutButton: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '24px',
    padding: '24px 40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  main: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e0e0e0',
  },
  tab: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  tabActive: {
    color: '#667eea',
    borderBottomColor: '#667eea',
  },
  tabContent: {
    minHeight: '400px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '24px',
    color: '#333',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#999',
  },
};

export default Dashboard;
