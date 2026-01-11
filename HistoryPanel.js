import React, { useState, useEffect } from 'react';
import { getSearchHistory } from '../services/api';

const HistoryPanel = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getSearchHistory(userId);
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div style={styles.empty}>
        <div>No search history yet</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Search History</h3>
      <div style={styles.list}>
        {history.map((item) => (
          <div key={item.id} style={styles.item}>
            <div style={styles.query}>"{item.query_text}"</div>
            <div style={styles.meta}>
              {item.results_count} result{item.results_count !== 1 ? 's' : ''} •{' '}
              {new Date(item.searched_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  title: {
    marginTop: 0,
    marginBottom: '16px',
    fontSize: '20px',
    color: '#333',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  query: {
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#333',
  },
  meta: {
    fontSize: '12px',
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    background: 'white',
    borderRadius: '12px',
  },
};

export default HistoryPanel;
