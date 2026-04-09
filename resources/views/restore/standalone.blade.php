<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Restore Backup - Standalone</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }

        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }

        .upload-area {
            border: 3px dashed #ddd;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            margin-bottom: 20px;
        }

        .upload-area:hover {
            border-color: #667eea;
            background: #f8f9ff;
        }

        .upload-area.dragover {
            border-color: #667eea;
            background: #f0f4ff;
        }

        .upload-icon {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 15px;
        }

        .upload-text {
            color: #333;
            font-size: 16px;
            margin-bottom: 5px;
        }

        .upload-hint {
            color: #999;
            font-size: 13px;
        }

        #fileInput {
            display: none;
        }

        .file-info {
            margin-top: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            display: none;
        }

        .file-info.show {
            display: block;
        }

        .file-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .file-size {
            color: #666;
            font-size: 14px;
        }

        .button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 20px;
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .button:active {
            transform: translateY(0);
        }

        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .progress {
            display: none;
            margin-top: 20px;
        }

        .progress.show {
            display: block;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s ease;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .progress-text {
            text-align: center;
            color: #666;
            font-size: 14px;
        }

        .message {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }

        .message.show {
            display: block;
        }

        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .warning {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.6;
        }

        .warning strong {
            display: block;
            margin-bottom: 5px;
        }

        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.6;
            color: #004085;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">📦</div>
            <h1>Restore Backup</h1>
            <p>Restore your application from a backup file</p>
        </div>

        <div class="warning">
            <strong>⚠️ Important Warning:</strong>
            This will replace all current database data and media files with the backup contents. 
            Make sure you have a current backup before proceeding. This action cannot be undone.
        </div>

        <div class="info-box">
            <strong>📋 Instructions:</strong>
            <ul style="margin-left: 20px; margin-top: 8px;">
                <li>Select or drag & drop your backup ZIP file</li>
                <li>Click "Restore Backup" to begin the restore process</li>
                <li>Wait for the restore to complete (this may take several minutes)</li>
                <li>You will be notified when the restore is complete</li>
            </ul>
        </div>

        <form id="restoreForm">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📁</div>
                <div class="upload-text">Click to select or drag & drop</div>
                <div class="upload-hint">Backup ZIP file (max 50GB)</div>
                <input type="file" id="fileInput" name="backup_file" accept=".zip" required>
            </div>

            <div class="file-info" id="fileInfo">
                <div class="file-name" id="fileName"></div>
                <div class="file-size" id="fileSize"></div>
            </div>

            <button type="submit" class="button" id="restoreBtn" disabled>
                Restore Backup
            </button>
        </form>

        <div class="progress" id="progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Preparing restore...</div>
        </div>

        <div class="message" id="message"></div>
    </div>

    <script>
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const restoreBtn = document.getElementById('restoreBtn');
        const restoreForm = document.getElementById('restoreForm');
        const progress = document.getElementById('progress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const message = document.getElementById('message');

        // Format file size
        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // Handle file selection
        function handleFileSelect(file) {
            if (!file.name.endsWith('.zip')) {
                showMessage('Please select a ZIP file.', 'error');
                return;
            }

            fileName.textContent = file.name;
            fileSize.textContent = formatBytes(file.size);
            fileInfo.classList.add('show');
            restoreBtn.disabled = false;
            hideMessage();
        }

        // Form submission
        restoreForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!fileInput.files.length) {
                showMessage('Please select a backup file.', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('backup_file', fileInput.files[0]);
            formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);

            // Show progress
            restoreBtn.disabled = true;
            progress.classList.add('show');
            progressFill.style.width = '10%';
            progressText.textContent = 'Uploading backup file...';
            hideMessage();

            try {
                const xhr = new XMLHttpRequest();

                // Upload progress
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const uploadPercent = Math.round((e.loaded / e.total) * 50); // 50% for upload
                        progressFill.style.width = uploadPercent + '%';
                    }
                });

                // Load progress
                xhr.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const loadPercent = 50 + Math.round((e.loaded / e.total) * 50); // 50% for processing
                        progressFill.style.width = loadPercent + '%';
                    }
                });

                xhr.addEventListener('load', () => {
                    progressFill.style.width = '100%';
                    progressText.textContent = 'Processing...';

                    try {
                        const response = JSON.parse(xhr.responseText);
                        
                        if (response.success) {
                            progressText.textContent = 'Restore complete!';
                            showMessage(response.message || 'Backup restored successfully! You can now log in to your application.', 'success');
                            
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 3000);
                        } else {
                            throw new Error(response.message || 'Restore failed');
                        }
                    } catch (error) {
                        showMessage('Restore failed: ' + (error.message || 'Unknown error'), 'error');
                        progress.classList.remove('show');
                        restoreBtn.disabled = false;
                    }
                });

                xhr.addEventListener('error', () => {
                    showMessage('Network error. Please try again.', 'error');
                    progress.classList.remove('show');
                    restoreBtn.disabled = false;
                });

                xhr.addEventListener('abort', () => {
                    showMessage('Restore cancelled.', 'error');
                    progress.classList.remove('show');
                    restoreBtn.disabled = false;
                });

                // Send request
                xhr.open('POST', '{{ route("restore.standalone.submit") }}');
                xhr.timeout = 7200000; // 2 hours timeout
                xhr.send(formData);

                progressText.textContent = 'Uploading and processing backup...';

            } catch (error) {
                showMessage('Error: ' + error.message, 'error');
                progress.classList.remove('show');
                restoreBtn.disabled = false;
            }
        });

        // Show message
        function showMessage(text, type) {
            message.textContent = text;
            message.className = 'message show ' + type;
            setTimeout(() => {
                message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }

        // Hide message
        function hideMessage() {
            message.classList.remove('show');
        }
    </script>
</body>
</html>
