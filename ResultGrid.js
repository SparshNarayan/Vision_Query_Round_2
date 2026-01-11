import React from 'react';

const ResultGrid = ({ results, onClassify }) => {
  if (!results || results.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🔍</div>
        <div>No results found</div>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {results.map((result) => (
        <div key={result.image_id} style={styles.card}>
          <img
            src={`http://localhost:8000/${result.filepath}`}
            alt={result.filename}
            style={styles.image}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
            }}
          />
          <div style={styles.info}>
            <div style={styles.filename}>{result.filename}</div>
            {result.similarity_score !== undefined && (
              <div style={styles.score}>
                Similarity: {(result.similarity_score * 100).toFixed(1)}%
              </div>
            )}
            {result.classification && (
              <div style={styles.classification}>
                {result.classification} ({(result.confidence * 100).toFixed(1)}%)
              </div>
            )}
            {onClassify && !result.classification && (
              <button
                onClick={() => onClassify(result.image_id)}
                style={styles.classifyButton}
              >
                Classify
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  info: {
    padding: '12px',
  },
  filename: {
    fontWeight: 'bold',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#333',
    wordBreak: 'break-word',
  },
  score: {
    fontSize: '12px',
    color: '#667eea',
    marginBottom: '4px',
  },
  classification: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  classifyButton: {
    padding: '6px 12px',
    fontSize: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
};

export default ResultGrid;
