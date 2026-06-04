// Mobile Menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuOpen = document.getElementById('menuOpen');
const menuClose = document.getElementById('menuClose');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuOpen.classList.toggle('hidden');
        menuClose.classList.toggle('hidden');
    });
}

document.querySelectorAll('.mobile-link').forEach(l => {
    l.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuOpen.classList.remove('hidden');
        menuClose.classList.add('hidden');
    });
});

// Particles
const canvas = document.getElementById('particles-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = '48, 15, 66';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 120) {
                    this.x -= dx * 0.015;
                    this.y -= dy * 0.015;
                }
            }
        }
        draw() {
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(Math.floor(window.innerWidth / 12), 80);
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 150) {
                    ctx.strokeStyle = `rgba(48, 15, 66, ${(1 - d / 150) * 0.25})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
}

// Scroll Animations
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('section-visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.section-hidden').forEach(s => observer.observe(s));

const staggerObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stagger-card').forEach((card, i) => {
                setTimeout(() => card.classList.add('visible'), i * 100);
            });
        }
    });
}, { threshold: 0.08 });
document.querySelectorAll('.grid').forEach(grid => { if (grid.querySelector('.stagger-card')) staggerObserver.observe(grid); });
document.querySelectorAll('.space-y-8').forEach(container => { if (container.querySelector('.stagger-card')) staggerObserver.observe(container); });

// Navbar scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('shadow-lg', window.scrollY > 50);
});

// Contact Form - AJAX submission to FormSubmit
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const statusDiv = document.getElementById('formMessage-status');

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        submitBtn.innerHTML = 'Sending... ⏳';
        submitBtn.disabled = true;
        statusDiv.style.display = 'none';

        try {
            const response = await fetch('https://formsubmit.co/ajax/fatimahnoman452@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                statusDiv.textContent = `Message Sent Successfully! ✅ Thank you for reaching out. I will get back to you soon.`;
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(48, 15, 66, 0.25)';
                statusDiv.style.border = '1px solid rgba(168, 85, 247, 0.4)';
                statusDiv.style.color = '#d8b4fe';
                this.reset();
            } else {
                throw new Error('FormSubmit error');
            }
        } catch (error) {
            statusDiv.textContent = 'Failed to send ❌ Please try again later.';
            statusDiv.style.display = 'block';
            statusDiv.style.background = 'rgba(180, 30, 30, 0.15)';
            statusDiv.style.border = '1px solid rgba(248, 113, 113, 0.4)';
            statusDiv.style.color = '#fca5a5';
        } finally {
            submitBtn.innerHTML = 'Send Message 🚀';
            submitBtn.disabled = false;
        }
    });
}

// Dynamic Live Demo Logic
let currentProject = '';
let gameSecretNumber = 0;
let gameAttempts = 0;
let hangmanWord = '';
let hangmanGuessed = [];
let hangmanMistakes = 0;

const projects = {
    'student_perf': { title: 'STUDENT_PERF_SYS.exe', placeholder: 'Enter marks (e.g. 85, 90, 75)' },
    'password_analyzer': { title: 'PASS_ANALYZER.exe', placeholder: 'Enter a password to test...' },
    'ai_guessing_game': { title: 'AI_GUESSING_GAME.exe', placeholder: 'Enter a number...' },
    'calculator': { title: 'OOP_CALC_SUITE.exe', placeholder: 'Enter expression (e.g. 5+5*2)' },
    'hangman': { title: 'SMART_HANGMAN.exe', placeholder: 'Guess a letter...' },
    'timer': { title: 'PRECISION_TIMER.exe', placeholder: 'Type start or stop...' },
    'library': { title: 'LIBRARY_ANALYTICS.exe', placeholder: 'Type a book name to add...' },
    'ai_employee': { title: 'AI_ORCHESTRATOR.exe', placeholder: 'Enter a task prompt...' }
};

window.openDemoModal = function(projectId) {
    currentProject = projectId;
    const project = projects[projectId];
    
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('gameInput').placeholder = project.placeholder;
    document.getElementById('gameInput').value = '';
    
    document.getElementById('gameModal').classList.add('active');
    initProject(projectId);
}

window.closeGameModal = function() {
    document.getElementById('gameModal').classList.remove('active');
}

function initProject(projectId) {
    const output = document.getElementById('terminalOutput');
    output.innerHTML = `<div class="text-accent-glow mb-2">System initialized. Module: ${projects[projectId].title} loaded.</div>`;
    
    if (projectId === 'ai_guessing_game') {
        gameSecretNumber = Math.floor(Math.random() * 100) + 1;
        gameAttempts = 0;
        output.innerHTML += '<div class="text-slate-300">I have picked a number between 1 and 100.</div><div class="text-slate-300">Can you guess what it is?</div>';
    } else if (projectId === 'student_perf') {
        output.innerHTML += '<div class="text-slate-300">Awaiting student marks array (comma separated)...</div>';
    } else if (projectId === 'password_analyzer') {
        output.innerHTML += '<div class="text-slate-300">Awaiting password input for entropy analysis...</div>';
    } else if (projectId === 'calculator') {
        output.innerHTML += '<div class="text-slate-300">Awaiting mathematical expression...</div>';
    } else if (projectId === 'hangman') {
        const words = ['PYTHON', 'AGENT', 'ASYNC', 'CLASSES'];
        hangmanWord = words[Math.floor(Math.random() * words.length)];
        hangmanGuessed = [];
        hangmanMistakes = 0;
        output.innerHTML += `<div class="text-slate-300">Guess the word: ${'_ '.repeat(hangmanWord.length)}</div>`;
    } else if (projectId === 'timer') {
        output.innerHTML += '<div class="text-slate-300">Timer ready. Type "start" to begin, "stop" to end.</div>';
    } else if (projectId === 'library') {
        output.innerHTML += '<div class="text-slate-300">Library DB connected. Type a book name to insert.</div>';
    } else if (projectId === 'ai_employee') {
        output.innerHTML += '<div class="text-slate-300">Multi-agent orchestrator online. Awaiting task prompt...</div>';
    }
    document.getElementById('gameInput').focus();
}

window.submitGuess = function(event) {
    if (event && event.type === 'keypress' && event.key !== 'Enter') return;
    
    const inputField = document.getElementById('gameInput');
    const output = document.getElementById('terminalOutput');
    
    if (!inputField || !output) return;
    
    const inputVal = inputField.value.trim();
    
    if (!inputVal) return;
    output.innerHTML += `<div class="text-slate-400 mt-2">> ${inputVal}</div>`;
    
    if (currentProject === 'ai_guessing_game') {
        const guess = parseInt(inputVal);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            output.innerHTML += `<div class="text-red-400 mt-1">Invalid input. Enter a number 1-100.</div>`;
        } else {
            gameAttempts++;
            if (guess === gameSecretNumber) {
                output.innerHTML += `<div class="text-green-400 mt-1">🎉 CORRECT in ${gameAttempts} attempts! Picking new number...</div>`;
                gameSecretNumber = Math.floor(Math.random() * 100) + 1;
                gameAttempts = 0;
            } else if (guess < gameSecretNumber) {
                output.innerHTML += `<div class="text-yellow-400 mt-1">Too low!</div>`;
            } else {
                output.innerHTML += `<div class="text-yellow-400 mt-1">Too high!</div>`;
            }
        }
    } else if (currentProject === 'student_perf') {
        const marks = inputVal.split(',').map(m => parseFloat(m.trim()));
        if(marks.some(isNaN)) {
             output.innerHTML += `<div class="text-red-400 mt-1">Invalid input. Use numbers separated by commas.</div>`;
        } else {
             const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
             const grade = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : 'F';
             output.innerHTML += `<div class="text-green-400 mt-1">Calculated Average: ${avg.toFixed(2)}</div>`;
             output.innerHTML += `<div class="text-yellow-400 mt-1">Final Grade: ${grade}</div>`;
        }
    } else if (currentProject === 'password_analyzer') {
        let strength = 0;
        if(inputVal.length > 8) strength++;
        if(/[A-Z]/.test(inputVal)) strength++;
        if(/[0-9]/.test(inputVal)) strength++;
        if(/[^A-Za-z0-9]/.test(inputVal)) strength++;
        
        const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
        output.innerHTML += `<div class="text-green-400 mt-1">Entropy Score: ${strength * 25} bits</div>`;
        output.innerHTML += `<div class="text-yellow-400 mt-1">Strength: ${labels[strength]}</div>`;
    } else if (currentProject === 'calculator') {
        try {
            const result = eval(inputVal.replace(/[^0-9+\-*/().]/g, ''));
            output.innerHTML += `<div class="text-green-400 mt-1">Result: ${result}</div>`;
        } catch(e) {
            output.innerHTML += `<div class="text-red-400 mt-1">Syntax Error in expression.</div>`;
        }
    } else if (currentProject === 'hangman') {
        const letter = inputVal.toUpperCase()[0];
        if(hangmanWord.includes(letter)) {
            hangmanGuessed.push(letter);
            let display = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
            output.innerHTML += `<div class="text-green-400 mt-1">Correct! ${display}</div>`;
            if(!display.includes('_')) output.innerHTML += `<div class="text-accent-glow mt-1">You won! Type a letter to start over.</div>`;
        } else {
            hangmanMistakes++;
            output.innerHTML += `<div class="text-red-400 mt-1">Wrong! Mistakes: ${hangmanMistakes}/6</div>`;
        }
    } else if (currentProject === 'timer') {
        if(inputVal.toLowerCase() === 'start') {
            window.timerStart = Date.now();
            output.innerHTML += `<div class="text-green-400 mt-1">Timer started...</div>`;
        } else if(inputVal.toLowerCase() === 'stop' && window.timerStart) {
            const elapsed = Date.now() - window.timerStart;
            output.innerHTML += `<div class="text-yellow-400 mt-1">Stopped. Elapsed time: ${elapsed}ms</div>`;
            window.timerStart = null;
        } else {
            output.innerHTML += `<div class="text-red-400 mt-1">Command not recognized.</div>`;
        }
    } else if (currentProject === 'library') {
        output.innerHTML += `<div class="text-green-400 mt-1">Executing INSERT INTO books (title) VALUES ('${inputVal}')</div>`;
        setTimeout(() => {
            output.innerHTML += `<div class="text-slate-300 mt-1">1 row(s) affected. Analytics updated.</div>`;
            output.scrollTop = output.scrollHeight;
        }, 500);
    } else if (currentProject === 'ai_employee') {
        output.innerHTML += `<div class="text-slate-300 mt-1">[Agent_Router]: Analyzing prompt complexity...</div>`;
        setTimeout(() => {
            output.innerHTML += `<div class="text-yellow-400 mt-1">[Agent_Coder]: Writing implementation logic...</div>`;
            output.scrollTop = output.scrollHeight;
            setTimeout(() => {
                output.innerHTML += `<div class="text-green-400 mt-1">[Agent_Reviewer]: Tests passed. Task Completed.</div>`;
                output.scrollTop = output.scrollHeight;
            }, 800);
        }, 600);
    }
    
    inputField.value = '';
    output.scrollTop = output.scrollHeight;
};

// Chatbot Logic
;(function() {
    const chatFab = document.getElementById('chat-fab');
    if (!chatFab) return;
    const chatWindow = document.getElementById('chat-window'), chatIcon = document.getElementById('chat-icon'), closeIcon = document.getElementById('close-icon'), chatForm = document.getElementById('chat-form'), chatInput = document.getElementById('chat-input'), chatMessages = document.getElementById('chat-messages'), resetChat = document.getElementById('reset-chat');
    
    // Match header colors to theme
    chatFab.style.backgroundColor = '#9333ea';
    const header = document.querySelector('#chat-window > div');
    if (header) header.style.backgroundColor = '#300F42';
    const submitBtn = document.querySelector('#chat-window button[type="submit"]');
    if (submitBtn) submitBtn.style.backgroundColor = '#9333ea';

    let messages = [{role: 'model', content: "Welcome to Fatimah Noman's AI Insights. How can I assist you with her professional profile today?", timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}];

    async function sendMessage(text) {
        if(!text.trim()) return;
        
        const ts = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messages.push({role: 'user', content: text, timestamp: ts});
        renderMessages();

        chatMessages.innerHTML += '<div id="typing" class="flex flex-col items-start"><div class="chat-bubble ai-msg"><div class="spinner"></div>AI is thinking...</div></div>';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res = await fetch('https://portfolio-90lvx2bhs-fatima-nomans-projects.vercel.app/api/chat', { 
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({messages})
            });
            const data = await res.json();
            messages.push({
                role: 'model', 
                content: data.content, 
                suggestions: data.suggestions,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
        } catch(e) {
            messages.push({role: 'model', content: "Sorry, I couldn't connect to the server.", timestamp: ts});
        }
        const typing = document.getElementById('typing');
        if (typing) typing.remove();
        renderMessages();
    }

    chatMessages.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggested-btn')) {
            sendMessage(e.target.textContent);
        }
    });

    function renderMessages() {
        chatMessages.innerHTML = messages.map(m => {
            let suggestions = "";
            if (m.suggestions && m.suggestions.length > 0) {
                suggestions = m.suggestions.map(q => `<button class="suggested-btn">${q}</button>`).join('');
            }

            return `
                <div class="flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}">
                    <div class="chat-bubble ${m.role === 'user' ? 'user-msg' : 'ai-msg'}">${(m.content || "").replace(/\n/g, '<br>')}</div>
                    ${suggestions ? `<div class="mt-2 ml-2">${suggestions}</div>` : ''}
                    <span class="text-[10px] text-gray-400 px-2 mt-1">${m.timestamp}</span>
                </div>
            `;
        }).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatFab.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        chatIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        renderMessages();
    });

    if (resetChat) {
        resetChat.addEventListener('click', () => {
            messages = [{role: 'model', content: "Welcome to Fatimah Noman's AI Insights. How can I assist you with her professional profile today?", timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}];
            renderMessages();
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            sendMessage(text);
            chatInput.value = '';
        });
    }
})();
