import React, { useState } from 'react';

const UploadBox = ({ onUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        ...styles.container,
        ...(dragging && styles.dragging),
        ...(uploading && styles.uploading),
      }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={styles.input}
        id="file-upload"
        disabled={uploading}
      />
      <label htmlFor="file-upload" style={styles.label}>
        {uploading ? (
          <>Uploading...</>
        ) : (
          <>
            <div style={styles.icon}>📷</div>
            <div>Click or drag image here to upload</div>
          </>
        )}
      </label>
    </div>
  );
};

const styles = {
  container: {
    border: '2px dashed #ccc',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: '#f9f9f9',
  },
  dragging: {
    borderColor: '#667eea',
    background: '#f0f0ff',
  },
  uploading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  input: {
    display: 'none',
  },
  label: {
    cursor: 'pointer',
    display: 'block',
    fontSize: '16px',
    color: '#666',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
};

export default UploadBox;
