/**
 * VisionQuery Dashboard Logic
 * Handles upload, classification, search, and history
 */

let currentUserId = null;
let currentUserEmail = null;

// Initialize dashboard
async function initDashboard() {
    // Check authentication
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user info
    try {
        const user = await api.getCurrentUser();
        currentUserId = user.id;
        currentUserEmail = user.email;
        document.getElementById('userEmail').textContent = user.email;
    } catch (error) {
        console.error('Failed to load user info:', error);
        // If unauthorized, redirect to login
        if (error.message.includes('Unauthorized')) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Attach event handlers
    setupEventHandlers();
}

// Setup all event handlers
function setupEventHandlers() {
    // Logout button
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    
    // Upload button
    document.getElementById('uploadButton').addEventListener('click', handleUpload);
    
    // Classify button
    document.getElementById('classifyButton').addEventListener('click', handleClassify);
    
    // Search button
    document.getElementById('searchButton').addEventListener('click', handleSearch);
    document.getElementById('searchQuery').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Load history button
    document.getElementById('loadHistoryButton').addEventListener('click', loadHistory);
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        removeToken();
        window.location.href = 'index.html';
    }
}

// Handle image upload
async function handleUpload() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    const uploadStatus = document.getElementById('uploadStatus');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const imageIdDisplay = document.getElementById('imageIdDisplay');
    
    if (!file) {
        showStatus(uploadStatus, 'Please select an image file', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showStatus(uploadStatus, 'Please select a valid image file', 'error');
        return;
    }
    
    // Show loading
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';
    showStatus(uploadStatus, 'Uploading image...', '');
    
    try {
        const response = await api.uploadImage(file);
        
        // Show success
        showStatus(uploadStatus, 'Image uploaded successfully!', 'success');
        
        // Show preview
        const imageUrl = `http://127.0.0.1:8000/${response.filepath.replace(/\\/g, '/')}`;
        previewImage.src = imageUrl;
        imagePreview.style.display = 'block';
        imageIdDisplay.textContent = `Image ID: ${response.id}`;
        
        // Pre-fill classify input
        document.getElementById('classifyImageId').value = response.id;
        
        // Clear file input
        fileInput.value = '';
    } catch (error) {
        showStatus(uploadStatus, error.message || 'Upload failed', 'error');
        imagePreview.style.display = 'none';
    } finally {
        uploadButton.disabled = false;
        uploadButton.textContent = 'Upload Image';
    }
}

// Handle image classification
async function handleClassify() {
    const imageIdInput = document.getElementById('classifyImageId');
    const imageId = parseInt(imageIdInput.value.trim());
    const classificationResult = document.getElementById('classificationResult');
    const classificationLabel = document.getElementById('classificationLabel');
    const classificationConfidence = document.getElementById('classificationConfidence');
    
    if (!imageId || isNaN(imageId)) {
        showStatus(document.getElementById('uploadStatus'), 'Please enter a valid Image ID', 'error');
        return;
    }
    
    const classifyButton = document.getElementById('classifyButton');
    classifyButton.disabled = true;
    classifyButton.textContent = 'Classifying...';
    classificationResult.style.display = 'none';
    
    try {
        const response = await api.classifyImage(imageId);
        
        classificationLabel.textContent = response.classification;
        classificationConfidence.textContent = (response.confidence * 100).toFixed(1);
        classificationResult.style.display = 'block';
    } catch (error) {
        showStatus(document.getElementById('uploadStatus'), error.message || 'Classification failed', 'error');
    } finally {
        classifyButton.disabled = false;
        classifyButton.textContent = 'Classify Image';
    }
}

// Handle semantic search
async function handleSearch() {
    const searchQuery = document.getElementById('searchQuery').value.trim();
    const topK = parseInt(document.getElementById('topK').value) || 5;
    const searchStatus = document.getElementById('searchStatus');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchQuery) {
        showStatus(searchStatus, 'Please enter a search query', 'error');
        return;
    }
    
    const searchButton = document.getElementById('searchButton');
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
    searchResults.innerHTML = '';
    showStatus(searchStatus, 'Searching...', '');
    
    try {
        const response = await api.searchImages(searchQuery, topK);
        
        if (response.results && response.results.length > 0) {
            showStatus(searchStatus, `Found ${response.total_results} result(s)`, 'success');
            displaySearchResults(response.results);
        } else {
            showStatus(searchStatus, 'No results found', '');
            searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No images found matching your query.</p>';
        }
    } catch (error) {
        showStatus(searchStatus, error.message || 'Search failed', 'error');
        searchResults.innerHTML = '';
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = 'Search';
    }
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    
    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const imageUrl = `http://127.0.0.1:8000/${result.filepath.replace(/\\/g, '/')}`;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${result.filename}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect fill=\\'%23ddd\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext fill=\\'%23999\\' font-family=\\'sans-serif\\' font-size=\\'14\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3EImage%3C/text%3E%3C/svg%3E'">
            <div class="result-card-info">
                <div class="result-card-filename">${escapeHtml(result.filename)}</div>
                <div class="result-card-score">Similarity: ${(result.similarity_score * 100).toFixed(1)}%</div>
            </div>
        `;
        
        // Add click handler to pre-fill classify
        card.addEventListener('click', () => {
            document.getElementById('classifyImageId').value = result.image_id;
            // Scroll to classify section
            document.querySelector('.classify-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        searchResults.appendChild(card);
    });
}

// Load search history
async function loadHistory() {
    if (!currentUserId) {
        showStatus(document.getElementById('searchStatus'), 'User ID not available', 'error');
        return;
    }
    
    const loadButton = document.getElementById('loadHistoryButton');
    const historyList = document.getElementById('historyList');
    
    loadButton.disabled = true;
    loadButton.textContent = 'Loading...';
    historyList.innerHTML = '';
    
    try {
        const history = await api.getSearchHistory(currentUserId);
        
        if (history && history.length > 0) {
            history.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const date = new Date(item.searched_at);
                const formattedDate = date.toLocaleString();
                
                historyItem.innerHTML = `
                    <div class="history-query">"${escapeHtml(item.query_text)}"</div>
                    <div class="history-meta">
                        <span>${item.results_count} result${item.results_count !== 1 ? 's' : ''}</span>
                        <span>${formattedDate}</span>
                    </div>
                `;
                
                // Add click handler to pre-fill search
                historyItem.addEventListener('click', () => {
                    document.getElementById('searchQuery').value = item.query_text;
                    document.getElementById('searchQuery').focus();
                });
                
                historyList.appendChild(historyItem);
            });
        } else {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No search history yet.</p>';
        }
    } catch (error) {
        historyList.innerHTML = `<p style="color: var(--error); padding: 1rem;">Error loading history: ${error.message}</p>`;
    } finally {
        loadButton.disabled = false;
        loadButton.textContent = 'Load History';
    }
}

// Show status message
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status-message';
    if (type === 'success') {
        element.classList.add('success');
    } else if (type === 'error') {
        element.classList.add('error');
    }
    element.style.display = message ? 'block' : 'none';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
