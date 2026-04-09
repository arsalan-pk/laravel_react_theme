<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Update</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        :root {
            --bg: linear-gradient(135deg, #eef2ff, #f7fafc);
            --card: #ffffff;
            --border: #e5e7eb;
            --primary: #0f5cf7;
            --primary-dark: #0c4ad1;
            --muted: #6b7280;
            --success: #1b5e20;
            --warning: #e65100;
            --archived: #424242;
            --shadow: 0 12px 30px rgba(15, 92, 247, 0.08);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: var(--bg);
            padding: 32px 24px 42px;
            color: #1f2937;
        }
        .page {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 { margin: 0 0 6px; font-weight: 800; letter-spacing: -0.02em; }
        p.lead { margin: 0 0 20px; color: var(--muted); }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 22px;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 14px;
            box-shadow: var(--shadow);
            padding: 22px 22px 24px;
        }
        .section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        .section-sub { color: var(--muted); font-size: 13px; margin-top: -2px; }
        .version-list { display: flex; flex-direction: column; gap: 10px; }
        .version-card {
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #fff, #f9fbff);
        }
        .version-card.current { border-color: #4caf50; background: #f1fbf3; }
        .version-card.pending { border-color: #ff9800; background: #fff7eb; }
        .version-card.archived { border-color: #d1d5db; background: #f8f9fb; }
        .version-meta { font-size: 13px; color: var(--muted); line-height: 1.5; margin-top: 6px; }
        .status-pill {
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .status-pill.active { background: #c8e6c9; color: var(--success); }
        .status-pill.pending { background: #ffe0b2; color: var(--warning); }
        .status-pill.archived { background: #e5e7eb; color: var(--archived); }
        .btn {
            background: var(--primary);
            color: #fff;
            padding: 11px 18px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
        }
        .btn:hover { background: var(--primary-dark); box-shadow: 0 8px 20px rgba(15, 92, 247, 0.18); transform: translateY(-1px); }
        .btn:disabled { background: #cbd5e1; color: #475569; box-shadow: none; transform: none; cursor: not-allowed; }
        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(260px, 1fr));
            gap: 16px;
        }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-weight: 700; color: #0f172a; font-size: 13px; letter-spacing: 0.01em; }
        input[type="text"], input[type="number"], input[type="password"], select, textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: #fff;
            font-size: 14px;
        }
        textarea { min-height: 80px; resize: vertical; }
        .helper { font-size: 12px; color: var(--muted); }
        .stack { display: flex; flex-direction: column; gap: 14px; }
        .fieldset {
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px;
            background: #fbfcff;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .fieldset-title {
            font-weight: 700;
            margin-bottom: 10px;
            color: #0f172a;
            letter-spacing: 0.01em;
        }
        .result {
            margin-top: 16px;
            padding: 12px 14px;
            border-radius: 10px;
            display: none;
            border: 1px solid var(--border);
        }
        .success { background: #e8f5e9; color: var(--success); border-color: #c8e6c9; }
        .error { background: #fef2f2; color: #b91c1c; border-color: #fecdd3; }
        .loading { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
        @media (max-width: 960px) {
            .grid { grid-template-columns: 1fr; }
            .form-grid { grid-template-columns: 1fr; }
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="page">
        <h1>System Update</h1>
        <p class="lead">Manage stored versions or pull a release package directly from FTP/SFTP.</p>

        <div class="grid">
            <div class="card">
                <div class="section-title">
                    <div>
                        <strong>Available Versions</strong>
                        <div id="currentVersionLabel" class="helper"></div>
                    </div>
                </div>
                <div id="versionsContainer" class="version-list"></div>
            </div>

            <div class="card">
                <div class="section-title">
                    <strong>Fetch from FTP/SFTP</strong>
                </div>
                <div class="section-sub">Set connection + credentials, then provide the remote zip path to pull.</div>
                <div class="stack">
                    <div class="fieldset">
                        <div class="fieldset-title">Connection</div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="ftp_protocol">Protocol</label>
                                <select id="ftp_protocol">
                                    <option value="ftp" selected>FTP</option>
                                    <option value="sftp">SFTP</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="ftp_host">Host</label>
                                <input type="text" id="ftp_host" placeholder="files.example.com">
                            </div>
                            <div class="form-group">
                                <label for="ftp_port">Port</label>
                                <input type="number" id="ftp_port" placeholder="21 for FTP / 22 for SFTP">
                            </div>
                            <div class="form-group">
                                <label for="ftp_root">Root (optional)</label>
                                <input type="text" id="ftp_root" placeholder="/releases">
                            </div>
                            <div class="form-group">
                                <label for="ftp_timeout">Timeout (seconds)</label>
                                <input type="number" id="ftp_timeout" placeholder="30">
                            </div>
                            <div class="form-group">
                                <label for="ftp_passive">Passive (FTP)</label>
                                <select id="ftp_passive">
                                    <option value="true" selected>True</option>
                                    <option value="false">False</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="ftp_ssl">SSL (FTP)</label>
                                <select id="ftp_ssl">
                                    <option value="false" selected>False</option>
                                    <option value="true">True</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="fieldset">
                        <div class="fieldset-title">Credentials</div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="ftp_username">Username</label>
                                <input type="text" id="ftp_username" placeholder="deploy">
                            </div>
                            <div class="form-group">
                                <label for="ftp_password">Password (or leave blank if using key)</label>
                                <input type="password" id="ftp_password" placeholder="••••••••">
                            </div>
                            <div class="form-group">
                                <label for="ftp_private_key">Private Key (SFTP)</label>
                                <textarea id="ftp_private_key" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"></textarea>
                                <div class="helper">Optional, required if password not used.</div>
                            </div>
                            <div class="form-group">
                                <label for="ftp_passphrase">Key Passphrase (optional)</label>
                                <input type="password" id="ftp_passphrase" placeholder="Key passphrase">
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="ftp_remote_path">Remote ZIP Path</label>
                        <input type="text" id="ftp_remote_path" placeholder="/releases/2025.02.01.zip" />
                        <div class="helper">Example: /releases/app-2026.01.15.zip</div>
                    </div>
                    <button type="button" class="btn" id="fetchFtpBtn">Fetch Package</button>
                </div>

                <div id="result" class="result">
                    <div id="message"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        let versionsData = @json($versionsData ?? ['current_version' => null, 'versions' => []]);

        function renderVersions() {
            const container = document.getElementById('versionsContainer');
            const currentLabel = document.getElementById('currentVersionLabel');
            container.innerHTML = '';

            if (!versionsData.versions.length) {
                container.innerHTML = '<p>No stored versions yet.</p>';
                currentLabel.textContent = '';
                return;
            }

            currentLabel.textContent = versionsData.current_version
                ? `Current version: ${versionsData.current_version}`
                : 'No version currently active.';

            versionsData.versions.forEach(version => {
                const statusClass = ` ${version.status || 'pending'}`;
                const card = document.createElement('div');
                card.className = 'version-card' + (version.is_current ? ' current' : statusClass);
                card.innerHTML = `
                    <div>
                        <strong>${version.version}</strong>
                        <span class="status-pill ${version.status || 'pending'}">${(version.status || 'pending').toUpperCase()}</span>
                        <div class="version-meta">
                            Stored: ${version.stored_at}<br/>
                            Size: ${(version.size / (1024 * 1024)).toFixed(2)} MB<br/>
                            Source: ${version.source || 'upload'}
                        </div>
                    </div>
                    <div class="version-actions">
                        ${version.is_current ? '<span>Active</span>' : `<button type="button" data-version="${version.version}">Apply</button>`}
                    </div>
                `;

                if (!version.is_current) {
                    card.querySelector('button').addEventListener('click', () => applyVersion(version.version));
                }

                container.appendChild(card);
            });
        }

        async function refreshVersions() {
            try {
                const response = await fetch('/update/versions', {
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                if (!response.ok) throw new Error('Failed to load versions list');
                versionsData = await response.json();
                renderVersions();
            } catch (error) {
                console.error(error);
            }
        }

        async function applyVersion(version) {
            if (!confirm(`Apply version ${version}? This will overwrite current files.`)) return;

            const result = document.getElementById('result');
            const message = document.getElementById('message');
            result.className = 'result loading';
            result.style.display = 'block';
            message.textContent = `Applying version ${version}...`;

            try {
                const response = await fetch('/update/apply-version', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ version }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    result.className = 'result success';
                    message.textContent = data.success;
                    await refreshVersions();
                } else {
                    result.className = 'result error';
                    message.textContent = data.error || 'Failed to apply version.';
                }
            } catch (error) {
                result.className = 'result error';
                message.textContent = 'Network error: ' + error.message;
            }
        }

        renderVersions();

        document.getElementById('fetchFtpBtn').addEventListener('click', async () => {
            const payload = {
                remote_path: document.getElementById('ftp_remote_path').value.trim(),
                protocol: document.getElementById('ftp_protocol').value,
                host: document.getElementById('ftp_host').value.trim(),
                port: document.getElementById('ftp_port').value ? Number(document.getElementById('ftp_port').value) : undefined,
                root: document.getElementById('ftp_root').value.trim(),
                username: document.getElementById('ftp_username').value.trim(),
                password: document.getElementById('ftp_password').value,
                private_key: document.getElementById('ftp_private_key').value,
                passphrase: document.getElementById('ftp_passphrase').value,
                timeout: document.getElementById('ftp_timeout').value ? Number(document.getElementById('ftp_timeout').value) : undefined,
                passive: document.getElementById('ftp_passive').value === 'true',
                ssl: document.getElementById('ftp_ssl').value === 'true',
            };

            if (!payload.remote_path) {
                alert('Please provide the remote path to the ZIP file.');
                return;
            }
            if (!payload.host || !payload.username) {
                alert('Host and username are required.');
                return;
            }

            const btn = document.getElementById('fetchFtpBtn');
            btn.disabled = true;
            btn.textContent = 'Fetching...';

            const result = document.getElementById('result');
            const message = document.getElementById('message');
            result.style.display = 'block';

            try {
                const response = await fetch('/update/fetch-ftp', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    result.className = 'result success';
                    message.textContent = data.success;
                    await refreshVersions();
                } else {
                    result.className = 'result error';
                    message.textContent = data.error || 'Failed to fetch version.';
                }
            } catch (error) {
                result.className = 'result error';
                message.textContent = 'Network error: ' + error.message;
            } finally {
                btn.disabled = false;
                btn.textContent = 'Fetch Package';
            }
        });

    </script>
</body>
</html>
