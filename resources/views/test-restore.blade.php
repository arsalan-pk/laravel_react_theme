<!DOCTYPE html>
<html>
<head>
    <title>Test Restore Upload</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Test Restore Upload</h1>
    
    <form id="testForm">
        @csrf
        <input type="file" id="fileInput" accept=".zip" required>
        <button type="submit">Test Upload</button>
    </form>
    
    <div id="result" style="margin-top: 20px; padding: 10px; border: 1px solid #ccc;"></div>

    <script>
        document.getElementById('testForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            const formData = new FormData();
            formData.append('backup_file', file);
            formData.append('_token', document.querySelector('input[name="_token"]').value);
            
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Uploading...';
            
            try {
                const response = await fetch('/test-simple-restore', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<pre>Error: ' + error.message + '</pre>';
            }
        });
    </script>
</body>
</html>
