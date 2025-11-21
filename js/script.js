
        // --- GLOBAL VARIABLES ---
        let userName = "Pengguna";
        let completedTasksCount = 0;
        let totalNotesCount = 0;
        let currentNoteImageDataUrl = null;
        let allItems = []; // Store all tasks and notes with creation date
        let allTasks = []; // Store all tasks for subject distribution
        let allNotes = []; // Store all notes for subject distribution

        // --- LOCAL STORAGE KEYS ---
        const LS_KEYS = {
            USER_NAME: 'smartstudent_userName',
            TASKS: 'smartstudent_tasks',
            NOTES: 'smartstudent_notes',
            ITEMS: 'smartstudent_items',
            AVATAR: 'smartstudent_avatar',
            THEME: 'smartstudent_theme',
            ACCENT_COLOR: 'smartstudent_accentColor',
            COMPLETED_TASKS_COUNT: 'smartstudent_completedTasksCount',
            TOTAL_NOTES_COUNT: 'smartstudent_totalNotesCount'
        };

        // --- DATA PERSISTENCE FUNCTIONS ---
        function saveToLocalStorage() {
            localStorage.setItem(LS_KEYS.USER_NAME, userName);
            localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(allTasks));
            localStorage.setItem(LS_KEYS.NOTES, JSON.stringify(allNotes));
            localStorage.setItem(LS_KEYS.ITEMS, JSON.stringify(allItems));
            localStorage.setItem(LS_KEYS.COMPLETED_TASKS_COUNT, completedTasksCount.toString());
            localStorage.setItem(LS_KEYS.TOTAL_NOTES_COUNT, totalNotesCount.toString());
        }

        function loadFromLocalStorage() {
            userName = localStorage.getItem(LS_KEYS.USER_NAME) || "Pengguna";
            allTasks = JSON.parse(localStorage.getItem(LS_KEYS.TASKS) || '[]');
            allNotes = JSON.parse(localStorage.getItem(LS_KEYS.NOTES) || '[]');
            allItems = JSON.parse(localStorage.getItem(LS_KEYS.ITEMS) || '[]');
            completedTasksCount = parseInt(localStorage.getItem(LS_KEYS.COMPLETED_TASKS_COUNT) || '0');
            totalNotesCount = parseInt(localStorage.getItem(LS_KEYS.TOTAL_NOTES_COUNT) || '0');

            document.getElementById('profile-name').textContent = userName;
            document.getElementById('profile-email').textContent = `${userName.toLowerCase().replace(/\s+/g, '.')}@school.edu`;
        }

        // --- LOGIN & LOGOUT FUNCTIONS ---
        function handleLogin() {
            const nameInput = document.getElementById('name-input');
            if (nameInput.value.trim() === "") {
                alert("Nama tidak boleh kosong!");
                return;
            }
            userName = nameInput.value.trim();
            saveToLocalStorage();
            
            document.getElementById('profile-name').textContent = userName;
            document.getElementById('profile-email').textContent = `${userName.toLowerCase().replace(/\s+/g, '.')}@school.edu`;
            
            document.getElementById('login-screen').classList.remove('active');
            showScreen('home-screen');
        }

        function logout() {
            if (confirm("Apakah Anda yakin ingin keluar? Data Anda akan tersimpan.")) {
                document.getElementById('login-screen').classList.add('active');
                document.getElementById('name-input').value = '';
                showScreen('login-screen');
            }
        }

        // --- SWITCH USER FUNCTION ---
        function switchUser() {
            if (confirm("Ganti pengguna? Ini akan membawa Anda ke layar login.")) {
                // Hapus nama pengguna dari localStorage untuk memaksa login ulang
                localStorage.removeItem(LS_KEYS.USER_NAME);
                // Hapus juga data profil yang terkait
                localStorage.removeItem(LS_KEYS.AVATAR);
                document.getElementById('profile-avatar').src = 'https://i.pravatar.cc/150?img=5';
                document.getElementById('profile-email').textContent = 'student@school.edu';
                
                // Tampilkan layar login
                document.getElementById('login-screen').classList.add('active');
                showScreen('login-screen');
            }
        }

        // --- SCREEN NAVIGATION ---
        const navMap = {
            'home-screen': 0,
            'tasks-screen': 1,
            'notes-screen': 2,
            'stats-screen': 3,
            'settings-screen': 4,
            'view-note-screen': 2 // Map to notes screen nav
        };

        function showScreen(screenId) {
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => screen.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
            
            if (screenId === 'home-screen') {
                updateGreeting();
            }
            
            if (screenId !== 'create-note-screen' && screenId !== 'view-note-screen') {
                clearImagePreview();
            }

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const activeNavIndex = navMap[screenId];
            if (activeNavIndex !== undefined && navItems[activeNavIndex]) {
                navItems[activeNavIndex].classList.add('active');
            }
        }

        // --- GREETING FUNCTION ---
        function updateGreeting() {
            const now = new Date();
            const hour = now.getHours();
            let timeOfDay = "Pagi";
            if (hour >= 12 && hour < 15) timeOfDay = "Siang";
            else if (hour >= 15 && hour < 18) timeOfDay = "Sore";
            else if (hour >= 18) timeOfDay = "Malam";
            
            const greetingElement = document.getElementById('greeting-text');
            if (greetingElement) {
                greetingElement.textContent = `Selamat ${timeOfDay}, ${userName}!`;
            }
        }

        // --- HOME SCREEN UPDATES ---
        function updateHomeTaskList() {
            const taskList = document.getElementById('task-list');
            const homeTaskList = document.getElementById('home-task-list');
            const tasks = Array.from(taskList.children);
            
            const activeTasks = tasks.filter(card => {
                const statusTag = card.querySelector('.status-tag');
                return statusTag.classList.contains('status-pending') || statusTag.classList.contains('status-overdue');
            });

            if (activeTasks.length > 0) {
                homeTaskList.innerHTML = activeTasks.slice(0, 2).map(card => {
                    const title = card.querySelector('h4').textContent;
                    const deadline = card.querySelector('p:nth-child(3)').textContent;
                    return `<p>• ${title} <span style="font-size: 0.8em; color: var(--dark-gray);">${deadline}</span></p>`;
                }).join('');
            } else {
                homeTaskList.innerHTML = '<p style="color: var(--dark-gray);">Belum ada tugas mendatang.</p>';
            }
        }

        function updateHomeNotesList() {
            const notesList = document.getElementById('notes-list');
            const homeNotesList = document.getElementById('home-notes-list');
            const notes = Array.from(notesList.children);

            if (notes.length > 0) {
                homeNotesList.innerHTML = notes.slice(0, 2).map(card => {
                    const title = card.querySelector('h4').textContent;
                    return `<p>• ${title}</p>`;
                }).join('');
            } else {
                homeNotesList.innerHTML = '<p style="color: var(--dark-gray);">Belum ada catatan.</p>';
            }
        }


        // --- STATISTICS FUNCTIONS ---
        function updateStatistics() {
            document.querySelector('#stats-completed-tasks h3').innerText = completedTasksCount;
            document.querySelector('#stats-total-notes h3').innerText = totalNotesCount;
            updateWeeklyActivityChart();
            updateSubjectDistributionChart();
            updateNotesDistributionChart();
            updateHomeTaskList();
            updateHomeNotesList();
            saveToLocalStorage();
        }

        function updateWeeklyActivityChart() {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
            startOfWeek.setHours(0, 0, 0, 0);

            const counts = [0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri

            allItems.forEach(item => {
                const itemDate = new Date(item.createdAt);
                if (itemDate >= startOfWeek && itemDate.getDay() >= 1 && itemDate.getDay() <= 5) {
                    counts[itemDate.getDay() - 1]++;
                }
            });

            const maxCount = Math.max(...counts, 1);

            const bars = document.querySelectorAll('#weekly-activity-chart .chart-bar');
            bars.forEach((bar, index) => {
                const height = (counts[index] / maxCount) * 100;
                bar.style.height = `${Math.max(height, 5)}%`;
            });
        }

        function updateSubjectDistributionChart() {
            const subjectCounts = {};
            allTasks.forEach(task => {
                subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
            });

            const totalTasks = allTasks.length;
            const distributionCard = document.getElementById('subject-distribution-card');

            if (totalTasks === 0) {
                distributionCard.innerHTML = '<h4>Distribusi Mata Pelajaran (Tugas)</h4><p style="color: var(--dark-gray);">Belum ada data tugas.</p>';
                return;
            }

            let distributionHTML = '<h4>Distribusi Mata Pelajaran (Tugas)</h4>';
            for (const subject in subjectCounts) {
                const percentage = ((subjectCounts[subject] / totalTasks) * 100).toFixed(0);
                const barLength = Math.round(percentage / 5);
                const bar = '█'.repeat(barLength);
                distributionHTML += `<p>${subject} <span style="color: var(--primary-blue);">${bar} ${percentage}%</span></p>`;
            }
            distributionCard.innerHTML = distributionHTML;
        }

        function updateNotesDistributionChart() {
            const subjectCounts = {};
            allNotes.forEach(note => {
                subjectCounts[note.subject] = (subjectCounts[note.subject] || 0) + 1;
            });

            const totalNotes = allNotes.length;
            const distributionCard = document.getElementById('notes-distribution-card');

            if (totalNotes === 0) {
                distributionCard.innerHTML = '<h4>Distribusi Catatan Materi</h4><p style="color: var(--dark-gray);">Belum ada data catatan.</p>';
                return;
            }

            let distributionHTML = '<h4>Distribusi Catatan Materi</h4>';
            for (const subject in subjectCounts) {
                const percentage = ((subjectCounts[subject] / totalNotes) * 100).toFixed(0);
                const barLength = Math.round(percentage / 5);
                const bar = '█'.repeat(barLength);
                distributionHTML += `<p>${subject} <span style="color: var(--primary-blue);">${bar} ${percentage}%</span></p>`;
            }
            distributionCard.innerHTML = distributionHTML;
        }

        // --- TASK STATUS FUNCTIONS ---
        function toggleTaskStatus(statusTagElement) {
            const card = statusTagElement.closest('.card');
            const deleteBtn = card.querySelector('.delete-btn');
            
            if (statusTagElement.classList.contains('status-pending')) {
                statusTagElement.className = 'status-tag status-completed';
                statusTagElement.textContent = 'Sudah Selesai';
                completedTasksCount++;
                if (!deleteBtn) {
                    card.insertAdjacentHTML('beforeend', '<button class="delete-btn" onclick="deleteTask(this)">🗑️ Hapus</button>');
                }
            } else if (statusTagElement.classList.contains('status-completed')) {
                statusTagElement.className = 'status-tag status-pending';
                statusTagElement.textContent = 'Belum Selesai';
                completedTasksCount--;
                if (deleteBtn) {
                    deleteBtn.remove();
                }
            }
            updateStatistics();
        }

        function checkOverdue(card) {
            const deadlineText = card.querySelector('.task-deadline').textContent.replace('Deadline: ', '');
            const deadline = new Date(deadlineText + "T23:59:59");
            const statusTag = card.querySelector('.status-tag');
            
            if (deadline < new Date() && !statusTag.classList.contains('status-completed')) {
                statusTag.className = 'status-tag status-overdue';
                statusTag.textContent = 'Terlambat';
                statusTag.onclick = null;
                statusTag.style.cursor = 'default';
            }
        }

        // --- DELETE TASK FUNCTION ---
        function deleteTask(element) {
            if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
                const card = element.closest('.card');
                const statusTag = card.querySelector('.status-tag');
                if (statusTag.classList.contains('status-completed')) {
                    completedTasksCount--;
                }
                card.remove();
                updateStatistics();
            }
        }
        
        // --- DELETE NOTE FUNCTION ---
        function deleteNote(element) {
            if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
                const card = element.closest('.card');
                card.remove();
                totalNotesCount--;
                updateStatistics();
            }
        }

        // --- ADD NEW TASK ---
        function addNewTask() {
            const title = document.getElementById('task-title').value;
            const subject = document.getElementById('task-subject').value;
            const deadline = document.getElementById('task-deadline').value;
            const status = document.getElementById('task-status').value;

            if (!title || !subject || !deadline) {
                alert("Judul, Mata Pelajaran, dan Deadline harus diisi!");
                return;
            }

            const taskList = document.getElementById('task-list');
            const newCard = document.createElement('div');
            newCard.className = 'card';
            
            const date = new Date(deadline);
            const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const statusText = status === 'active' ? 'Belum Selesai' : 'Sudah Selesai';
            const statusClass = status === 'active' ? 'status-pending' : 'status-completed';
            const deleteButton = status === 'completed' ? `<button class="delete-btn" onclick="deleteTask(this)">🗑️ Hapus</button>` : '';

            if (status === 'completed') {
                completedTasksCount++;
            }

            newCard.innerHTML = `
                <h4>${title}</h4>
                <p>Mata Pelajaran: ${subject}</p>
                <p class="task-deadline">Deadline: ${formattedDate}</p>
                <span class="status-tag ${statusClass}" onclick="toggleTaskStatus(this)">${statusText}</span>
                ${deleteButton}
            `;
            
            taskList.insertBefore(newCard, taskList.firstChild);
            checkOverdue(newCard);

            const taskData = { type: 'task', subject: subject, createdAt: new Date() };
            allItems.push(taskData);
            allTasks.push(taskData);
            
            // Clear form
            document.getElementById('task-title').value = '';
            document.getElementById('task-subject').value = '';
            document.getElementById('task-deadline').value = '';
            document.getElementById('task-status').value = 'active';
            
            updateStatistics();
            showScreen('tasks-screen');
        }

        // --- VIEW NOTE FUNCTION ---
        function viewNote(element) {
            const title = element.querySelector('h4').textContent;
            const subject = element.querySelector('p').textContent;
            const image = element.querySelector('img');
            const content = element.dataset.content || "Tidak ada isi catatan tersimpan.";
            
            document.getElementById('view-note-title').textContent = title;
            document.getElementById('view-note-subject').textContent = subject;
            document.getElementById('view-note-content').textContent = content;

            const viewImage = document.getElementById('view-note-image');
            if (image) {
                viewImage.src = image.src;
                viewImage.style.display = 'block';
            } else {
                viewImage.src = '';
                viewImage.style.display = 'none';
            }
            
            showScreen('view-note-screen');
        }

        // --- PHOTO HANDLING FOR NOTES ---
        function triggerCameraInput() {
            document.getElementById('camera-input').click();
        }

        function triggerGalleryInput() {
            document.getElementById('gallery-input').click();
        }

        function loadImage(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function() {
                currentNoteImageDataUrl = reader.result;
                const preview = document.getElementById('image-preview');
                preview.src = currentNoteImageDataUrl;
                preview.style.display = 'block';
            }

            if (file) {
                reader.readAsDataURL(file);
            }
        }

        function clearImagePreview() {
            currentNoteImageDataUrl = null;
            const preview = document.getElementById('image-preview');
            preview.src = '';
            preview.style.display = 'none';
            document.getElementById('camera-input').value = '';
            document.getElementById('gallery-input').value = '';
        }

        // --- ADD NEW NOTE ---
        function addNewNote() {
            const title = document.getElementById('note-title').value;
            const subject = document.getElementById('note-subject').value;
            const content = document.getElementById('note-content').value;

            if (!title || !subject) {
                alert("Judul dan Mata Pelajaran harus diisi!");
                return;
            }

            const notesList = document.getElementById('notes-list');
            const newCard = document.createElement('div');
            newCard.className = 'card clickable';
            newCard.dataset.content = content;
            
            const imageHtml = currentNoteImageDataUrl ? `<img src="${currentNoteImageDataUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">` : '';
            
            newCard.innerHTML = `
                <h4>${title}</h4>
                <p>Mata Pelajaran: ${subject}</p>
                ${imageHtml}
                <button class="delete-btn" onclick="event.stopPropagation(); deleteNote(this)">🗑️ Hapus</button>
            `;
            
            newCard.onclick = () => viewNote(newCard);
            
            notesList.insertBefore(newCard, notesList.firstChild);
            totalNotesCount++;

            allItems.push({ type: 'note', subject: subject, createdAt: new Date() });
            allNotes.push({ subject: subject });

            // Clear form and preview
            document.getElementById('note-title').value = '';
            document.getElementById('note-subject').value = '';
            document.getElementById('note-content').value = '';
            clearImagePreview();
            
            updateStatistics();
            showScreen('notes-screen');
        }

        // --- SETTINGS FUNCTIONS ---
        function toggleTheme() {
            const toggle = document.getElementById('theme-toggle');
            toggle.classList.toggle('active');
            const isDark = document.body.classList.toggle('dark-theme');
            localStorage.setItem(LS_KEYS.THEME, isDark ? 'dark' : 'light');
        }

        function setAccentColor(color) {
            document.documentElement.style.setProperty('--primary-blue', color);
            localStorage.setItem(LS_KEYS.ACCENT_COLOR, color);
        }

        function resetAllData() {
            if (confirm("Apakah Anda yakin ingin menghapus semua data tugas dan catatan? Tindakan ini tidak dapat dibatalkan.")) {
                document.getElementById('task-list').innerHTML = '';
                document.getElementById('notes-list').innerHTML = '';
                completedTasksCount = 0;
                totalNotesCount = 0;
                allItems = [];
                allTasks = [];
                allNotes = [];
                updateStatistics();
                // Clear all localStorage keys
                Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
                alert("Semua data telah direset.");
            }
        }
        
        // --- AVATAR FUNCTIONS ---
        function triggerAvatarInput() {
            document.getElementById('avatar-input').click();
        }

        function loadAvatar(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function() {
                const dataURL = reader.result;
                const avatar = document.getElementById('profile-avatar');
                avatar.src = dataURL;
                localStorage.setItem(LS_KEYS.AVATAR, dataURL);
            }

            if (file) {
                reader.readAsDataURL(file);
            }
        }

        // --- INITIALIZATION ---
        window.onload = () => {
            loadFromLocalStorage();

            const savedAvatar = localStorage.getItem(LS_KEYS.AVATAR);
            if (savedAvatar) {
                document.getElementById('profile-avatar').src = savedAvatar;
            }

            const savedTheme = localStorage.getItem(LS_KEYS.THEME);
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                document.getElementById('theme-toggle').classList.add('active');
            }

            const savedAccentColor = localStorage.getItem(LS_KEYS.ACCENT_COLOR);
            if (savedAccentColor) {
                setAccentColor(savedAccentColor);
                document.getElementById('accent-color-picker').value = savedAccentColor;
            }
            
            // If user is already logged in, show home screen
            if (localStorage.getItem(LS_KEYS.USER_NAME)) {
                document.getElementById('login-screen').classList.remove('active');
                showScreen('home-screen');
            }
            
            // Render existing tasks and notes
            renderTasks();
            renderNotes();
            updateStatistics();
        }

        function renderTasks() {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = ''; // Clear existing tasks
            
            allTasks.forEach(taskData => {
                const newCard = document.createElement('div');
                newCard.className = 'card';
                
                const date = new Date(taskData.createdAt);
                const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                
                const statusClass = 'status-pending'; // Default status
                const statusText = 'Belum Selesai';
                const deleteButton = ''; // No delete button by default

                newCard.innerHTML = `
                    <h4>${taskData.title || 'Tugas Tanpa Judul'}</h4>
                    <p>Mata Pelajaran: ${taskData.subject}</p>
                    <p class="task-deadline">Dibuat: ${formattedDate}</p>
                    <span class="status-tag ${statusClass}" onclick="toggleTaskStatus(this)">${statusText}</span>
                    ${deleteButton}
                `;
                
                taskList.appendChild(newCard);
                checkOverdue(newCard);
            });
        }

        function renderNotes() {
            const notesList = document.getElementById('notes-list');
            notesList.innerHTML = ''; // Clear existing notes
            
            allNotes.forEach(noteData => {
                const newCard = document.createElement('div');
                newCard.className = 'card clickable';
                newCard.dataset.content = noteData.content || '';
                
                const imageHtml = noteData.image ? `<img src="${noteData.image}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">` : '';
                
                newCard.innerHTML = `
                    <h4>${noteData.title || 'Catatan Tanpa Judul'}</h4>
                    <p>Mata Pelajaran: ${noteData.subject}</p>
                    ${imageHtml}
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteNote(this)">🗑️ Hapus</button>
                `;
                
                newCard.onclick = () => viewNote(newCard);
                
                notesList.appendChild(newCard);
            });
        }
    