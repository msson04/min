/* ====== 민석의 홈페이지 - JavaScript 기능 ====== */

// 비밀번호 설정
const CORRECT_PASSWORD = "minseok123";

// 로그인 상태 확인
function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    showMainApp();
  } else {
    showLoginScreen();
  }
}

// 로그인 처리
function login() {
  const password = document.getElementById('passwordInput').value;
  const errorDiv = document.getElementById('loginError');
  
  if (password === CORRECT_PASSWORD) {
    sessionStorage.setItem('isLoggedIn', 'true');
    showMainApp();
  } else {
    errorDiv.textContent = '비밀번호가 올바르지 않습니다.';
    errorDiv.style.display = 'block';
    document.getElementById('passwordInput').value = '';
  }
}

// 로그아웃 처리
function logout() {
  sessionStorage.removeItem('isLoggedIn');
  showLoginScreen();
}

// 로그인 화면 표시
function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('mainApp').classList.remove('active');
}

// 메인 앱 표시
function showMainApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainApp').classList.add('active');
  initializeApp();
}

// 데이터 저장소
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let events = JSON.parse(localStorage.getItem('events')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
let portfolio = JSON.parse(localStorage.getItem('portfolio')) || {
  name: '민석',
  title: '생산성 전문가',
  email: 'minseok@email.com',
  skills: 'JavaScript, HTML, CSS, React',
  bio: '효율적인 업무 처리와 체계적인 목표 관리를 통해 생산성을 극대화하는 것을 목표로 하고 있습니다.'
};

// 데이터 저장 함수
function saveData() {
  localStorage.setItem('todos', JSON.stringify(todos));
  localStorage.setItem('events', JSON.stringify(events));
  localStorage.setItem('notes', JSON.stringify(notes));
  localStorage.setItem('projects', JSON.stringify(projects));
  localStorage.setItem('blogs', JSON.stringify(blogs));
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

// 섹션 표시
function showSection(sectionName) {
  // 모든 섹션 숨기기
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active');
  });
  
  // 선택된 섹션 표시
  document.getElementById(sectionName).classList.add('active');
  
  // 네비게이션 버튼 활성화
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
  
  // 섹션별 데이터 렌더링
  if (sectionName === 'dashboard') {
    renderDashboard();
  } else if (sectionName === 'todo') {
    renderTodos();
  } else if (sectionName === 'calendar') {
    renderCalendar();
  } else if (sectionName === 'notes') {
    renderNotes();
  } else if (sectionName === 'projects') {
    renderProjects();
  } else if (sectionName === 'blog') {
    renderBlogs();
  } else if (sectionName === 'portfolio') {
    renderPortfolio();
  }
}

// 테마 토글
function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// 대시보드 렌더링
function renderDashboard() {
  document.getElementById('totalTodos').textContent = todos.length;
  document.getElementById('completedTodos').textContent = todos.filter(t => t.completed).length;
  document.getElementById('totalEvents').textContent = events.length;
  document.getElementById('totalNotes').textContent = notes.length;
  
  renderProductivityChart();
}

// 생산성 차트 렌더링
function renderProductivityChart() {
  const chart = document.getElementById('productivityChart');
  chart.innerHTML = '';
  
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const data = [5, 8, 6, 9, 7, 4, 6]; // 샘플 데이터
  
  days.forEach((day, index) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar-item';
    bar.style.height = `${data[index] * 20}px`;
    
    const label = document.createElement('div');
    label.className = 'chart-label';
    label.textContent = day;
    
    const value = document.createElement('div');
    value.className = 'chart-value';
    value.textContent = data[index];
    
    bar.appendChild(label);
    bar.appendChild(value);
    chart.appendChild(bar);
  });
}

// 할 일 폼 이벤트 리스너
function setupTodoForm() {
  const todoForm = document.getElementById('todoForm');
  if (todoForm) {
    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const todo = {
        id: Date.now(),
        text: document.getElementById('todoText').value,
        priority: document.getElementById('todoPriority').value,
        date: document.getElementById('todoDate').value,
        category: document.getElementById('todoCategory').value,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      todos.push(todo);
      
      // 마감일이 있으면 캘린더에도 이벤트 추가
      if (todo.date) {
        const event = {
          id: Date.now() + 1,
          title: `📋 ${todo.text}`,
          date: todo.date,
          category: todo.category,
          type: 'todo',
          todoId: todo.id
        };
        events.push(event);
      }
      
      saveData();
      this.reset();
      renderTodos();
      renderDashboard();
    });
  }
}

function renderTodos() {
  const todoList = document.getElementById('todoList');
  if (!todoList) return;
  
  todoList.innerHTML = '';
  
  todos.forEach(todo => {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    
    todoItem.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
             onchange="toggleTodo(${todo.id})">
      <div class="todo-text ${todo.completed ? 'completed' : ''}">
        ${todo.text}
        ${todo.date ? `<br><small>📅 ${todo.date}</small>` : ''}
      </div>
      <span class="priority-badge priority-${todo.priority}">${getPriorityText(todo.priority)}</span>
      <button class="btn" onclick="deleteTodo(${todo.id})" style="background: var(--error); color: white; padding: 0.25rem 0.5rem;">삭제</button>
    `;
    
    todoList.appendChild(todoItem);
  });
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveData();
    renderTodos();
    renderDashboard();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  // 연결된 이벤트도 삭제
  events = events.filter(e => e.todoId !== id);
  saveData();
  renderTodos();
  renderDashboard();
}

function getPriorityText(priority) {
  const priorityMap = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  };
  return priorityMap[priority] || '보통';
}

// 캘린더 폼 이벤트 리스너
function setupEventForm() {
  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const event = {
        id: Date.now(),
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        category: document.getElementById('eventCategory').value,
        type: 'event',
        createdAt: new Date().toISOString()
      };
      
      events.push(event);
      saveData();
      this.reset();
      renderCalendar();
      renderDashboard();
    });
  }
}

function renderCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarTitle = document.getElementById('calendarTitle');
  
  if (!calendarGrid || !calendarTitle) return;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  calendarTitle.textContent = `${year}년 ${month + 1}월`;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  calendarGrid.innerHTML = '';
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (currentDate.getMonth() !== month) {
      dayElement.classList.add('other-month');
    }
    
    if (currentDate.toDateString() === now.toDateString()) {
      dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = currentDate.getDate();
    dayElement.appendChild(dayNumber);
    
    // 해당 날짜의 이벤트 표시
    const dateString = currentDate.toISOString().split('T')[0];
    const dayEvents = events.filter(e => e.date === dateString);
    
    if (dayEvents.length > 0) {
      const eventDot = document.createElement('div');
      eventDot.className = 'event-dot';
      dayElement.appendChild(eventDot);
      
      dayElement.title = dayEvents.map(e => e.title).join(', ');
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

// 노트 폼 이벤트 리스너
function setupNoteForm() {
  const noteForm = document.getElementById('noteForm');
  if (noteForm) {
    noteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const note = {
        id: Date.now(),
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value,
        category: document.getElementById('noteCategory').value,
        createdAt: new Date().toISOString()
      };
      
      notes.push(note);
      saveData();
      this.reset();
      renderNotes();
      renderDashboard();
    });
  }
}

function renderNotes() {
  const noteList = document.getElementById('noteList');
  if (!noteList) return;
  
  noteList.innerHTML = '';
  
  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = 'card';
    noteItem.style.marginBottom = '1rem';
    
    noteItem.innerHTML = `
      <h4>${note.title}</h4>
      <p>${note.content}</p>
      <small>카테고리: ${note.category} | 작성일: ${new Date(note.createdAt).toLocaleDateString()}</small>
      <br>
      <button class="btn" onclick="deleteNote(${note.id})" style="background: var(--error); color: white; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">삭제</button>
    `;
    
    noteList.appendChild(noteItem);
  });
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveData();
  renderNotes();
  renderDashboard();
}

// 노트 검색 이벤트 리스너
function setupNoteSearch() {
  const noteSearch = document.getElementById('noteSearch');
  if (noteSearch) {
    noteSearch.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.content.toLowerCase().includes(searchTerm)
      );
      
      const noteList = document.getElementById('noteList');
      noteList.innerHTML = '';
      
      filteredNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'card';
        noteItem.style.marginBottom = '1rem';
        
        noteItem.innerHTML = `
          <h4>${note.title}</h4>
          <p>${note.content}</p>
          <small>카테고리: ${note.category} | 작성일: ${new Date(note.createdAt).toLocaleDateString()}</small>
          <br>
          <button class="btn" onclick="deleteNote(${note.id})" style="background: var(--error); color: white; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">삭제</button>
        `;
        
        noteList.appendChild(noteItem);
      });
    });
  }
}

// 프로젝트 폼 이벤트 리스너
function setupProjectForm() {
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const project = {
        id: Date.now(),
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDesc').value,
        progress: parseInt(document.getElementById('projectProgress').value),
        createdAt: new Date().toISOString()
      };
      
      projects.push(project);
      saveData();
      this.reset();
      renderProjects();
    });
  }
}

function renderProjects() {
  const projectList = document.getElementById('projectList');
  if (!projectList) return;
  
  projectList.innerHTML = '';
  
  projects.forEach(project => {
    const projectItem = document.createElement('div');
    projectItem.className = 'card';
    projectItem.style.marginBottom = '1rem';
    
    projectItem.innerHTML = `
      <h4>${project.name}</h4>
      <p>${project.description}</p>
      <div style="margin: 1rem 0;">
        <label>진행률: ${project.progress}%</label>
        <div style="background: #e2e8f0; border-radius: 10px; height: 20px; margin-top: 0.5rem;">
          <div style="background: var(--accent); width: ${project.progress}%; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
        </div>
      </div>
      <small>시작일: ${new Date(project.createdAt).toLocaleDateString()}</small>
      <br>
      <button class="btn" onclick="deleteProject(${project.id})" style="background: var(--error); color: white; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">삭제</button>
    `;
    
    projectList.appendChild(projectItem);
  });
}

function deleteProject(id) {
  projects = projects.filter(p => p.id !== id);
  saveData();
  renderProjects();
}

// 블로그 폼 이벤트 리스너
function setupBlogForm() {
  const blogForm = document.getElementById('blogForm');
  if (blogForm) {
    blogForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const blog = {
        id: Date.now(),
        title: document.getElementById('blogTitle').value,
        content: document.getElementById('blogContent').value,
        createdAt: new Date().toISOString()
      };
      
      blogs.unshift(blog);
      saveData();
      this.reset();
      renderBlogs();
    });
  }
}

function renderBlogs() {
  const blogList = document.getElementById('blogList');
  if (!blogList) return;
  
  blogList.innerHTML = '';
  
  blogs.forEach(blog => {
    const blogItem = document.createElement('div');
    blogItem.className = 'card';
    blogItem.style.marginBottom = '1rem';
    
    blogItem.innerHTML = `
      <h4>${blog.title}</h4>
      <p>${blog.content}</p>
      <small>작성일: ${new Date(blog.createdAt).toLocaleDateString()}</small>
      <br>
      <button class="btn" onclick="deleteBlog(${blog.id})" style="background: var(--error); color: white; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">삭제</button>
    `;
    
    blogList.appendChild(blogItem);
  });
}

function deleteBlog(id) {
  blogs = blogs.filter(b => b.id !== id);
  saveData();
  renderBlogs();
}

// 포트폴리오 관련 함수들
function renderPortfolio() {
  const portfolioName = document.getElementById('portfolioName');
  const portfolioTitle = document.getElementById('portfolioTitle');
  const portfolioEmail = document.getElementById('portfolioEmail');
  const portfolioSkills = document.getElementById('portfolioSkills');
  const portfolioBio = document.getElementById('portfolioBio');
  
  if (portfolioName) portfolioName.value = portfolio.name;
  if (portfolioTitle) portfolioTitle.value = portfolio.title;
  if (portfolioEmail) portfolioEmail.value = portfolio.email;
  if (portfolioSkills) portfolioSkills.value = portfolio.skills;
  if (portfolioBio) portfolioBio.value = portfolio.bio;
}

function savePortfolio() {
  portfolio = {
    name: document.getElementById('portfolioName').value,
    title: document.getElementById('portfolioTitle').value,
    email: document.getElementById('portfolioEmail').value,
    skills: document.getElementById('portfolioSkills').value,
    bio: document.getElementById('portfolioBio').value
  };
  
  saveData();
  alert('포트폴리오가 저장되었습니다!');
}

// Excel 내보내기 함수들
function exportTodos() {
  const data = todos.map(todo => ({
    '할 일': todo.text,
    '우선순위': getPriorityText(todo.priority),
    '카테고리': todo.category,
    '마감일': todo.date || '',
    '완료 여부': todo.completed ? '완료' : '미완료',
    '작성일': new Date(todo.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, '할_일_목록');
}

function exportCalendar() {
  const data = events.map(event => ({
    '제목': event.title,
    '날짜': event.date,
    '시간': event.time || '',
    '카테고리': event.category,
    '유형': event.type === 'todo' ? '할 일' : '일정',
    '작성일': new Date(event.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, '캘린더_일정');
}

function exportNotes() {
  const data = notes.map(note => ({
    '제목': note.title,
    '내용': note.content,
    '카테고리': note.category,
    '작성일': new Date(note.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, '노트_목록');
}

function exportProjects() {
  const data = projects.map(project => ({
    '프로젝트명': project.name,
    '설명': project.description,
    '진행률': project.progress + '%',
    '시작일': new Date(project.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, '프로젝트_목록');
}

function exportBlog() {
  const data = blogs.map(blog => ({
    '제목': blog.title,
    '내용': blog.content,
    '작성일': new Date(blog.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, '일기_목록');
}

function exportToExcel(data, filename) {
  if (typeof XLSX === 'undefined') {
    alert('Excel 내보내기 기능을 사용하려면 인터넷 연결이 필요합니다.');
    return;
  }
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
}

// 앱 초기화
function initializeApp() {
  // 저장된 테마 적용
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
  }
  
  // 이벤트 리스너 설정
  setupTodoForm();
  setupEventForm();
  setupNoteForm();
  setupNoteSearch();
  setupProjectForm();
  setupBlogForm();
  
  // 엔터키로 로그인
  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }
  
  // 초기 데이터 렌더링
  renderDashboard();
  renderTodos();
  renderCalendar();
  renderNotes();
  renderProjects();
  renderBlogs();
  renderPortfolio();
}

// 페이지 로드 시 로그인 상태 확인
window.addEventListener('load', function() {
  checkLoginStatus();
});