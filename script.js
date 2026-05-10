document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Loader & Initialization ---
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 1500);
    }, 2500);

    // --- 2. Custom Cursor ---
    const cursor = document.getElementById('custom-cursor');
    const cursorGlow = document.getElementById('cursor-glow');
    
    // Only enable custom cursor if not on mobile/touch
    if(window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Glow follows slightly delayed
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });

        const clickables = document.querySelectorAll('button, input, label, .task-cb, .task-item, .volume-slider');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }

    // --- 3. Clock, Date, Weather & Motivation ---
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const greetingEl = document.getElementById('greeting');
    const quoteEl = document.getElementById('quote-text');
    
    const quotes = [
        "The secret of your future is hidden in your daily routine.",
        "Focus is not saying yes to all important things, rather it is saying no to less important things.",
        "Your future is created by what you do today, not tomorrow.",
        "Discipline is choosing between what you want now and what you want most.",
        "Don't stop when you're tired. Stop when you're done.",
        "Success is the sum of small efforts, repeated day in and day out.",
        "Quiet the mind, and the soul will speak.",
        "Distractions destroy action. If it's not moving you towards your purpose, leave it alone."
    ];

    function updateTime() {
        const now = new Date();
        
        // Time
        let hours = now.getHours();
        let minutes = now.getMinutes();
        timeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
        
        // Greeting
        let greeting = "Good evening.";
        if (hours >= 5 && hours < 12) greeting = "Good morning.";
        else if (hours >= 12 && hours < 18) greeting = "Good afternoon.";
        greetingEl.textContent = greeting;
    }
    
    setInterval(updateTime, 1000);
    updateTime();

    quoteEl.textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;

    // --- 4. Rain Canvas Animation ---
    const canvas = document.getElementById('rain-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let rainDrops = [];
    let rainEnabled = true;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Drop {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height - height;
            this.length = Math.random() * 20 + 10;
            this.speed = Math.random() * 10 + 15;
            this.opacity = Math.random() * 0.3 + 0.1;
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.length * 0.2, this.y + this.length);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        update() {
            this.y += this.speed;
            this.x -= this.speed * 0.2;
            if (this.y > height) {
                this.y = -this.length;
                this.x = Math.random() * width;
            }
            this.draw();
        }
    }

    for (let i = 0; i < 120; i++) rainDrops.push(new Drop());

    function animateRain() {
        ctx.clearRect(0, 0, width, height);
        if (rainEnabled) {
            rainDrops.forEach(drop => drop.update());
        }
        requestAnimationFrame(animateRain);
    }
    animateRain();

    // --- 5. Pomodoro Timer ---
    const timerEl = document.getElementById('timer');
    const timerStatusEl = document.getElementById('timer-status');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const circle = document.querySelector('.progress-ring__circle');
    
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = 0;

    const MODES = {
        focus: { time: 25 * 60, label: "Focus Session", color: "#a78bfa" },
        shortBreak: { time: 5 * 60, label: "Short Break", color: "#60a5fa" },
        longBreak: { time: 15 * 60, label: "Long Break", color: "#34d399" }
    };

    let currentMode = 'focus';
    let timeLeft = MODES.focus.time;
    let timerInterval = null;
    let isRunning = false;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        timerEl.textContent = formatTime(timeLeft);
        const progress = timeLeft / MODES[currentMode].time;
        const offset = circumference - (progress * circumference);
        circle.style.strokeDashoffset = offset;
    }

    function setMode(mode) {
        if (isRunning) pauseTimer();
        currentMode = mode;
        timeLeft = MODES[mode].time;
        
        modeBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        circle.style.stroke = MODES[mode].color;
        timerStatusEl.textContent = `Ready to ${mode === 'focus' ? 'focus' : 'rest'}`;
        updateTimerDisplay();
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.innerHTML = '<i class="ri-pause-fill"></i> Pause';
        timerStatusEl.textContent = MODES[currentMode].label;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                completeSession();
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        startBtn.innerHTML = '<i class="ri-play-fill"></i> Resume';
        timerStatusEl.textContent = "Paused";
    }

    function resetTimer() {
        pauseTimer();
        setMode(currentMode);
        startBtn.innerHTML = '<i class="ri-play-fill"></i> Start';
    }

    function completeSession() {
        pauseTimer();
        
        if (currentMode === 'focus') {
            updateStreak();
            timerStatusEl.textContent = "Session Complete!";
            setTimeout(() => setMode('shortBreak'), 3000);
        } else {
            timerStatusEl.textContent = "Break Over!";
            setTimeout(() => setMode('focus'), 3000);
        }
    }

    startBtn.addEventListener('click', () => {
        if (isRunning) pauseTimer();
        else startTimer();
    });

    resetBtn.addEventListener('click', resetTimer);

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    updateTimerDisplay();

    // --- 6. Task Manager ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const taskProgressText = document.getElementById('task-progress');
    
    let tasks = JSON.parse(localStorage.getItem('sanctuary_tasks')) || [];

    function saveTasks() {
        localStorage.setItem('sanctuary_tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ id: Date.now(), text, completed: false });
            taskInput.value = '';
            saveTasks();
        }
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        let completedCount = 0;
        
        tasks.forEach(task => {
            if (task.completed) completedCount++;
            
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <input type="checkbox" class="task-cb" ${task.completed ? 'checked' : ''} onchange="window.toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <button class="icon-btn small delete-task" onclick="window.deleteTask(${task.id})"><i class="ri-delete-bin-line"></i></button>
            `;
            taskList.appendChild(li);
        });

        taskProgressText.textContent = `${completedCount}/${tasks.length}`;
    }

    window.toggleTask = toggleTask;
    window.deleteTask = deleteTask;

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    renderTasks();

    // --- 7. Study Streak System ---
    let stats = JSON.parse(localStorage.getItem('sanctuary_stats')) || {
        streak: 0,
        sessions: 0,
        hours: 0,
        lastDate: null
    };

    function updateStreakDisplay() {
        document.getElementById('streak-count').textContent = stats.streak;
        document.getElementById('total-sessions').textContent = stats.sessions;
        document.getElementById('total-hours').textContent = stats.hours.toFixed(1);
    }

    function updateStreak() {
        const today = new Date().toDateString();
        
        if (stats.lastDate !== today) {
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (stats.lastDate === yesterday.toDateString()) {
                stats.streak++;
            } else if (stats.lastDate !== null) {
                stats.streak = 1;
            } else {
                stats.streak = 1; 
            }
            stats.lastDate = today;
        }
        
        stats.sessions++;
        stats.hours += (25 / 60); 
        
        localStorage.setItem('sanctuary_stats', JSON.stringify(stats));
        updateStreakDisplay();
    }

    updateStreakDisplay();

    // --- 8. Ambient Sounds ---
    const sliders = document.querySelectorAll('.volume-slider');
    const muteBtn = document.getElementById('mute-all');
    let isMuted = false;

    sliders.forEach(slider => {
        const soundType = slider.dataset.sound;
        const audioEl = document.getElementById(`audio-${soundType}`);
        const icon = slider.parentElement.querySelector('i');
        
        audioEl.volume = slider.value / 100;
        
        slider.addEventListener('input', (e) => {
            const vol = e.target.value / 100;
            audioEl.volume = vol;
            if (vol > 0) {
                audioEl.play().catch(e => console.log("Autoplay prevented waiting for interaction"));
                icon.classList.add('active');
            } else {
                audioEl.pause();
                icon.classList.remove('active');
            }
            if(isMuted && vol > 0) toggleMute(); 
        });
    });

    function toggleMute() {
        isMuted = !isMuted;
        muteBtn.innerHTML = isMuted ? '<i class="ri-volume-up-line"></i>' : '<i class="ri-volume-mute-line"></i>';
        muteBtn.classList.toggle('active', isMuted);
        
        sliders.forEach(slider => {
            const soundType = slider.dataset.sound;
            const audioEl = document.getElementById(`audio-${soundType}`);
            audioEl.muted = isMuted;
        });
    }

    muteBtn.addEventListener('click', toggleMute);

    // --- 9. Environment Controls & Deep Focus ---
    const rainToggle = document.getElementById('btn-rain-toggle');
    const blurToggle = document.getElementById('btn-blur-toggle');
    const deepFocusCb = document.getElementById('deep-focus-cb');
    const bgImage = document.querySelector('.bg-image');
    
    rainToggle.addEventListener('click', () => {
        rainEnabled = !rainEnabled;
        rainToggle.classList.toggle('active', rainEnabled);
        canvas.style.opacity = rainEnabled ? '0.6' : '0';
    });

    blurToggle.addEventListener('click', () => {
        blurToggle.classList.toggle('active');
        bgImage.classList.toggle('clear');
    });

    deepFocusCb.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('deep-focus');
        } else {
            document.body.classList.remove('deep-focus');
        }
    });

    // Fullscreen toggle
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
});
