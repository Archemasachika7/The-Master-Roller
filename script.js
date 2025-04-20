// Study Schedule Data
let studySchedule = {
  phases: [
    {
      name: "Phase 1: College Prep & Foundations (April 21-May 31)",
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              date: new Date().toISOString().split('T')[0], // Today's date
              tasks: [
                {
                  id: 1,
                  category: "Regular College",
                  time: "7:30-9:00 PM",
                  description: "Primary college subjects (CT1 focus)",
                  points: 10,
                  completed: false,
                  resources: []
                },
                {
                  id: 2,
                  category: "IIT Madras BS DS",
                  time: "9:00-10:00 PM",
                  description: "CT basics",
                  points: 8,
                  completed: false,
                  resources: []
                }
              ]
            },
            {
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
              tasks: [
                {
                  id: 3,
                  category: "Regular College",
                  time: "7:30-9:00 PM",
                  description: "Primary college subjects (CT1 focus)",
                  points: 10,
                  completed: false,
                  resources: []
                },
                {
                  id: 4,
                  category: "IIT Madras BS DS",
                  time: "9:00-10:00 PM",
                  description: "Python foundations",
                  points: 8,
                  completed: false,
                  resources: []
                },
                {
                  id: 5,
                  category: "Programming Goals",
                  time: "10:00-11:00 PM",
                  description: "Python basics practice",
                  points: 12,
                  completed: false,
                  resources: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Study Paths Configuration
const studyPaths = {
  default: {
    name: "Default Path",
    categories: [
      { name: "Regular College", color: "#7209b7" },
      { name: "IIT Madras BS DS", color: "#3a0ca3" },
      { name: "Programming Goals", color: "#4361ee" }
    ]
  },
  iitm: {
    name: "IIT Madras BS DS",
    categories: [
      { name: "Core Courses", color: "#3a0ca3" },
      { name: "Mathematics", color: "#4cc9f0" },
      { name: "Programming", color: "#4361ee" },
      { name: "Projects", color: "#7209b7" }
    ]
  },
  cp: {
    name: "Competitive Programming",
    categories: [
      { name: "Data Structures", color: "#4361ee" },
      { name: "Algorithms", color: "#3a0ca3" },
      { name: "Problem Solving", color: "#4cc9f0" },
      { name: "Contests", color: "#f72585" }
    ]
  },
  ju: {
    name: "JU College",
    categories: [
      { name: "Main Subjects", color: "#7209b7" },
      { name: "Labs", color: "#3a0ca3" },
      { name: "Assignments", color: "#4361ee" },
      { name: "Exams Prep", color: "#f72585" }
    ]
  }
};

// App Configuration
let config = {
  darkMode: false,
  themeColor: "#4361ee",
  reminders: true,
  reminderTime: "18:00"
};

// Current configuration
let currentStudyPath = 'default';
let customCategories = [...studyPaths.default.categories];

// Flatten the schedule data for easier access
let allDays = [];
function updateAllDays() {
  allDays = [];
  studySchedule.phases.forEach(phase => {
    phase.weeks.forEach(week => {
      week.days.forEach(day => {
        allDays.push(day);
      });
    });
  });
}
updateAllDays();

// Global variables
let totalPoints = 0;
let completedTasks = [];
const badges = [
  { points: 100, name: "Starter", icon: "⭐" },
  { points: 500, name: "Scholar", icon: "📚" },
  { points: 1000, name: "Master", icon: "🏆" },
  { points: 1500, name: "Legend", icon: "👑" }
];
let earnedBadges = [];
let streakDays = 0;
let lastStudyDate = null;

// DOM Elements
const calendarEl = document.getElementById('calendar');
const totalPointsEl = document.getElementById('total-points');
const badgesContainer = document.getElementById('badges-container');
const taskListEl = document.getElementById('task-list');
const dayDetailsEl = document.getElementById('day-details');
const taskModal = document.getElementById('task-modal');
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const quickAddBtn = document.getElementById('quick-add-btn');
const studyPathSelect = document.getElementById('study-path-select');
const categoryContainer = document.getElementById('category-container');
const addCategoryBtn = document.getElementById('add-category');
const saveSettingsBtn = document.getElementById('save-settings');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const completedTasksEl = document.getElementById('completed-tasks');
const studyHoursEl = document.getElementById('study-hours');
const streakDaysEl = document.getElementById('streak-days');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const themeColorInput = document.getElementById('theme-color');
const remindersToggle = document.getElementById('reminders-toggle');
const reminderTimeInput = document.getElementById('reminder-time');

// Initialize the calendar
let calendar;
function initializeCalendar() {
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: generateCalendarEvents(),
    dateClick: function(info) {
      showAddTaskForm(info.dateStr);
    },
    eventClick: function(info) {
      showDayDetails(info.event.startStr);
    },
    dayCellClassNames: function(arg) {
      const dateStr = arg.date.toISOString().split('T')[0];
      const day = allDays.find(d => d.date === dateStr);
      if (day && day.tasks.some(t => completedTasks.includes(t.id))) {
        return 'has-completed-tasks';
      }
    }
  });
  calendar.render();
}

// Generate calendar events based on current categories
function generateCalendarEvents() {
  return allDays.map(day => {
    const tasksByCategory = {};
    
    // Initialize counters for all categories
    customCategories.forEach(cat => {
      tasksByCategory[cat.name] = 0;
    });
    
    // Count tasks in each category
    day.tasks.forEach(task => {
      if (tasksByCategory[task.category] !== undefined) {
        tasksByCategory[task.category]++;
      }
    });
    
    // Create title parts for categories that have tasks
    const titleParts = [];
    customCategories.forEach(cat => {
      if (tasksByCategory[cat.name] > 0) {
        titleParts.push(`${tasksByCategory[cat.name]} ${cat.name.split(' ')[0]}`);
      }
    });
    
    // Find the first category with tasks for coloring
    const firstCategoryWithTasks = customCategories.find(cat => 
      day.tasks.some(t => t.category === cat.name)
    );
    
    return {
      title: titleParts.join(' • '),
      start: day.date,
      allDay: true,
      backgroundColor: firstCategoryWithTasks ? firstCategoryWithTasks.color : '',
      borderColor: firstCategoryWithTasks ? firstCategoryWithTasks.color : '',
      extendedProps: {
        dayData: day
      }
    };
  });
}

// Show day details
function showDayDetails(dateStr) {
  const day = allDays.find(d => d.date === dateStr);
  
  if (!day) {
    dayDetailsEl.querySelector('.day-title').textContent = "No tasks scheduled";
    dayDetailsEl.querySelector('.day-points').textContent = "+0 pts";
    taskListEl.innerHTML = '<li class="empty-state">No tasks scheduled for this day</li>';
    return;
  }
  
  // Calculate total possible points for the day
  const dayPoints = day.tasks.reduce((sum, task) => sum + task.points, 0);
  const completedDayPoints = day.tasks
    .filter(task => completedTasks.includes(task.id))
    .reduce((sum, task) => sum + task.points, 0);
  
  // Update day header
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dayDetailsEl.querySelector('.day-title').textContent = date.toLocaleDateString('en-US', options);
  dayDetailsEl.querySelector('.day-points').textContent = `+${completedDayPoints}/${dayPoints} pts`;
  
  // Render tasks
  taskListEl.innerHTML = '';
  day.tasks.forEach(task => {
    const isCompleted = completedTasks.includes(task.id);
    const category = customCategories.find(c => c.name === task.category);
    const categoryColor = category ? category.color : '#4361ee';
    
    const taskEl = document.createElement('li');
    taskEl.className = `task-item ${isCompleted ? 'completed' : ''}`;
    taskEl.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-task-id="${task.id}">
      <div class="task-content">
        <span class="task-category" style="background-color: ${categoryColor}22; color: ${categoryColor}">${task.category}</span>
        <div class="task-title">${task.description}</div>
        <div class="task-time">${task.time}</div>
      </div>
      <span class="task-points">+${task.points} pts</span>
    `;
    taskListEl.appendChild(taskEl);
    
    // Add event listener to checkbox
    const checkbox = taskEl.querySelector('.task-checkbox');
    checkbox.addEventListener('change', function() {
      toggleTaskCompletion(task.id, this.checked);
    });
    
    // Add click event to show task details
    taskEl.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        showTaskDetails(task);
      }
    });
  });
}

// Show task details in modal
function showTaskDetails(task) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  modalTitle.textContent = task.description;
  
  const category = customCategories.find(c => c.name === task.category);
  const categoryColor = category ? category.color : '#4361ee';
  
  let resourcesHTML = '';
  if (task.resources && task.resources.length > 0) {
    resourcesHTML = `
      <div class="form-group">
        <h4>Resources</h4>
        ${task.resources.map(res => 
          `<a href="${res.url}" target="_blank" class="resource-link">
            <i class="fas fa-external-link-alt"></i> ${res.name || res.url}
          </a>`
        ).join('')}
      </div>
    `;
  }
  
  modalBody.innerHTML = `
    <div class="form-group">
      <label>Category:</label>
      <span class="task-category" style="background-color: ${categoryColor}22; color: ${categoryColor}">
        ${task.category}
      </span>
    </div>
    <div class="form-group">
      <label>Time:</label>
      <p>${task.time}</p>
    </div>
    <div class="form-group">
      <label>Points:</label>
      <p>${task.points} pts</p>
    </div>
    ${resourcesHTML}
    <div class="form-group">
      <label>Add Resource:</label>
      <input type="text" id="resource-name" class="form-control" placeholder="Resource name (optional)">
      <input type="url" id="resource-url" class="form-control mt-2" placeholder="https://example.com" required>
      <button id="add-resource" class="btn btn-primary mt-2" data-task-id="${task.id}">
        <i class="fas fa-plus"></i> Add Resource
      </button>
    </div>
    <div class="form-group mt-4">
      <button id="delete-task" class="btn btn-danger" data-task-id="${task.id}">
        <i class="fas fa-trash"></i> Delete Task
      </button>
    </div>
  `;
  
  // Add event listener to add resource button
  document.getElementById('add-resource').addEventListener('click', function() {
    const resourceName = document.getElementById('resource-name').value;
    const resourceUrl = document.getElementById('resource-url').value;
    
    if (resourceUrl) {
      addResourceToTask(task.id, resourceName || resourceUrl, resourceUrl);
      showTaskDetails(task); // Refresh the view
    }
  });
  
  // Add event listener to delete task button
  document.getElementById('delete-task').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this task?')) {
      removeTask(task.id);
      taskModal.classList.remove('active');
    }
  });
  
  taskModal.classList.add('active');
}

// Add resource to task
function addResourceToTask(taskId, name, url) {
  for (const day of allDays) {
    for (const task of day.tasks) {
      if (task.id === taskId) {
        if (!task.resources) {
          task.resources = [];
        }
        task.resources.push({ name, url });
        saveData();
        return;
      }
    }
  }
}

// Add task to a specific day
function addTaskToDay(date, task) {
  let day = allDays.find(d => d.date === date);
  
  if (!day) {
    // Create new day if it doesn't exist
    day = {
      date: date,
      tasks: []
    };
    allDays.push(day);
    // Add to the appropriate phase/week (simplified for demo)
    studySchedule.phases[0].weeks[0].days.push(day);
  }
  
  task.id = generateTaskId();
  day.tasks.push(task);
  saveData();
  calendar.refetchEvents();
  showDayDetails(date);
}

// Generate unique task ID
function generateTaskId() {
  return Date.now();
}

// Remove task from day
function removeTask(taskId) {
  for (const day of allDays) {
    const taskIndex = day.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      day.tasks.splice(taskIndex, 1);
      
      // Remove day if it has no tasks left
      if (day.tasks.length === 0) {
        const dayIndex = allDays.findIndex(d => d.date === day.date);
        if (dayIndex > -1) {
          allDays.splice(dayIndex, 1);
        }
      }
      
      // Remove from completed tasks if it was there
      const completedIndex = completedTasks.indexOf(taskId);
      if (completedIndex > -1) {
        completedTasks.splice(completedIndex, 1);
        const task = findTaskById(taskId);
        if (task) totalPoints -= task.points;
        updatePointsDisplay();
      }
      
      saveData();
      calendar.refetchEvents();
      showDayDetails(day.date);
      return true;
    }
  }
  return false;
}

// Show add task form
function showAddTaskForm(dateStr) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  modalTitle.textContent = `Add Task for ${new Date(dateStr).toLocaleDateString()}`;
  
  let categoryOptions = '';
  customCategories.forEach(category => {
    categoryOptions += `<option value="${category.name}">${category.name}</option>`;
  });
  
  modalBody.innerHTML = `
    <div class="form-group">
      <label>Category:</label>
      <select id="task-category" class="form-control">
        ${categoryOptions}
      </select>
    </div>
    <div class="form-group">
      <label>Description:</label>
      <input type="text" id="task-description" class="form-control" placeholder="What to study?">
    </div>
    <div class="form-group">
      <label>Time:</label>
      <input type="text" id="task-time" class="form-control" placeholder="e.g. 7:00-9:00 PM">
    </div>
    <div class="form-group">
      <label>Points:</label>
      <input type="number" id="task-points" class="form-control" value="10" min="1">
    </div>
    <button id="save-task" class="btn btn-primary" data-date="${dateStr}">
      <i class="fas fa-save"></i> Save Task
    </button>
  `;
  
  document.getElementById('save-task').addEventListener('click', function() {
    const category = document.getElementById('task-category').value;
    const description = document.getElementById('task-description').value;
    const time = document.getElementById('task-time').value;
    const points = parseInt(document.getElementById('task-points').value);
    
    if (description && time) {
      addTaskToDay(dateStr, {
        category,
        time,
        description,
        points,
        completed: false,
        resources: []
      });
      taskModal.classList.remove('active');
    } else {
      alert('Please fill in all fields');
    }
  });
  
  taskModal.classList.add('active');
}

// Toggle task completion
function toggleTaskCompletion(taskId, isCompleted) {
  const task = findTaskById(taskId);
  if (!task) return;
  
  // Update streak if completing a task
  if (isCompleted && !completedTasks.includes(taskId)) {
    updateStreak();
  }
  
  if (isCompleted) {
    if (!completedTasks.includes(taskId)) {
      completedTasks.push(taskId);
      totalPoints += task.points;
    }
  } else {
    const index = completedTasks.indexOf(taskId);
    if (index > -1) {
      completedTasks.splice(index, 1);
      totalPoints -= task.points;
    }
  }
  
  updatePointsDisplay();
  checkForNewBadges();
  updateStats();
  saveData();
}

// Update study streak
function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (!lastStudyDate) {
    streakDays = 1;
  } else if (lastStudyDate === today) {
    // Already updated today
    return;
  } else if (lastStudyDate === yesterday) {
    streakDays++;
  } else {
    streakDays = 1;
  }
  
  lastStudyDate = today;
  streakDaysEl.textContent = streakDays;
}

// Find task by ID
function findTaskById(taskId) {
  for (const day of allDays) {
    for (const task of day.tasks) {
      if (task.id === taskId) {
        return task;
      }
    }
  }
  return null;
}

// Update points display
function updatePointsDisplay() {
  totalPointsEl.textContent = totalPoints;
  
  // Update progress to next badge
  const nextBadge = badges.find(b => !earnedBadges.some(eb => eb.points === b.points) && b.points > totalPoints);
  if (nextBadge) {
    const prevBadge = [...badges]
      .sort((a, b) => b.points - a.points)
      .find(b => b.points <= totalPoints);
    
    const prevPoints = prevBadge ? prevBadge.points : 0;
    const progress = ((totalPoints - prevPoints) / (nextBadge.points - prevPoints)) * 100;
    
    progressBar.style.width = `${Math.min(100, progress)}%`;
    progressText.textContent = `${Math.round(progress)}% to ${nextBadge.name} badge`;
  } else {
    progressBar.style.width = '100%';
    progressText.textContent = 'All badges earned!';
  }
}

// Update quick stats
function updateStats() {
  // Completed tasks
  completedTasksEl.textContent = completedTasks.length;
  
  // Study hours (simplified calculation)
  const totalHours = allDays.reduce((sum, day) => {
    return sum + day.tasks
      .filter(task => completedTasks.includes(task.id))
      .reduce((daySum, task) => {
        const timeMatch = task.time.match(/(\d+):(\d+)-(\d+):(\d+)/);
        if (timeMatch) {
          const startHour = parseInt(timeMatch[1]);
          const endHour = parseInt(timeMatch[3]);
          return daySum + (endHour - startHour);
        }
        return daySum + 1; // Default to 1 hour if can't parse
      }, 0);
  }, 0);
  
  studyHoursEl.textContent = totalHours;
}

// Check for new badges
function checkForNewBadges() {
  const newBadges = badges.filter(b => 
    totalPoints >= b.points && !earnedBadges.some(eb => eb.points === b.points)
  );
  
  if (newBadges.length > 0) {
    earnedBadges = [...earnedBadges, ...newBadges];
    renderBadges();
    
    // Show notification for new badges
    newBadges.forEach(badge => {
      showNotification(`Congratulations! You earned the ${badge.name} badge!`);
    });
  }
}

// Show notification
function showNotification(message) {
  if (!("Notification" in window)) {
    return;
  }
  
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }
}

// Render earned badges
function renderBadges() {
  badgesContainer.innerHTML = '';
  
  earnedBadges.forEach(badge => {
    const badgeEl = document.createElement('div');
    badgeEl.className = 'badge';
    badgeEl.title = badge.name;
    badgeEl.textContent = badge.icon;
    badgesContainer.appendChild(badgeEl);
  });
}

// Render category settings
function renderCategorySettings() {
  categoryContainer.innerHTML = '';
  
  customCategories.forEach((category, index) => {
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'category-input-group';
    categoryGroup.innerHTML = `
      <input type="text" class="form-control" value="${category.name}" data-index="${index}" data-field="name" placeholder="Category name">
      <input type="color" value="${category.color}" data-index="${index}" data-field="color">
      <button class="btn remove-category" data-index="${index}">×</button>
    `;
    categoryContainer.appendChild(categoryGroup);
  });
  
  // Add event listeners to category inputs
  document.querySelectorAll('.category-input-group input').forEach(input => {
    input.addEventListener('change', function() {
      const index = parseInt(this.dataset.index);
      const field = this.dataset.field;
      customCategories[index][field] = this.value;
    });
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-category').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      if (customCategories.length > 1) {
        customCategories.splice(index, 1);
        renderCategorySettings();
      } else {
        alert("You must have at least one category");
      }
    });
  });
}

// Initialize modals
function initializeModals() {
  // Task modal
  document.getElementById('modal-close').addEventListener('click', function() {
    taskModal.classList.remove('active');
  });
  
  // Settings modal
  document.getElementById('settings-close').addEventListener('click', function() {
    settingsModal.classList.remove('active');
  });
  
  // Close modals when clicking outside
  [taskModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Settings button
  settingsBtn.addEventListener('click', function() {
    settingsModal.classList.add('active');
  });
  
  // Quick add button
  quickAddBtn.addEventListener('click', function() {
    showAddTaskForm(new Date().toISOString().split('T')[0]);
  });
}

// Initialize settings
function initializeSettings() {
  // Add category button
  addCategoryBtn.addEventListener('click', function() {
    customCategories.push({
      name: `New Category ${customCategories.length + 1}`,
      color: '#4361ee'
    });
    renderCategorySettings();
  });
  
  // Study path select
  studyPathSelect.addEventListener('change', function() {
    if (this.value !== 'custom') {
      customCategories = [...studyPaths[this.value].categories];
      renderCategorySettings();
    }
  });
  
  // Dark mode toggle
  darkModeToggle.addEventListener('change', function() {
    config.darkMode = this.checked;
    document.body.classList.toggle('dark-mode', config.darkMode);
  });
  
  // Theme color picker
  themeColorInput.addEventListener('change', function() {
    config.themeColor = this.value;
    document.documentElement.style.setProperty('--primary', this.value);
    // Calculate secondary color (darker version)
    const secondaryColor = shadeColor(this.value, -20);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
  });
  
  // Reminders toggle
  remindersToggle.addEventListener('change', function() {
    config.reminders = this.checked;
  });
  
  // Reminder time
  reminderTimeInput.addEventListener('change', function() {
    config.reminderTime = this.value;
  });
  
  // Save settings
  saveSettingsBtn.addEventListener('click', function() {
    currentStudyPath = studyPathSelect.value;
    saveData();
    calendar.refetchEvents(); // Refresh calendar with new categories
    settingsModal.classList.remove('active');
    showDayDetails(calendar.getDate().toISOString().split('T')[0]); // Refresh current day view
  });
}

// Helper function to shade colors
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3), 16);
  let G = parseInt(color.substring(3,5), 16);
  let B = parseInt(color.substring(5,7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

// Save data to localStorage
function saveData() {
  const data = {
    totalPoints,
    completedTasks,
    earnedBadges,
    currentStudyPath,
    customCategories,
    studySchedule,
    config,
    streakDays,
    lastStudyDate
  };
  localStorage.setItem('studypathData', JSON.stringify(data));
}

// Load saved data from localStorage
function loadSavedData() {
  const savedData = localStorage.getItem('studypathData');
  if (savedData) {
    const data = JSON.parse(savedData);
    totalPoints = data.totalPoints || 0;
    completedTasks = data.completedTasks || [];
    earnedBadges = data.earnedBadges || [];
    currentStudyPath = data.currentStudyPath || 'default';
    customCategories = data.customCategories || [...studyPaths.default.categories];
    studySchedule = data.studySchedule || studySchedule;
    config = data.config || {
      darkMode: false,
      themeColor: "#4361ee",
      reminders: true,
      reminderTime: "18:00"
    };
    streakDays = data.streakDays || 0;
    lastStudyDate = data.lastStudyDate || null;
    
    // Apply config
    if (config.darkMode) {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }
    themeColorInput.value = config.themeColor;
    document.documentElement.style.setProperty('--primary', config.themeColor);
    const secondaryColor = shadeColor(config.themeColor, -20);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
    remindersToggle.checked = config.reminders;
    reminderTimeInput.value = config.reminderTime;
    
    updateAllDays();
    updatePointsDisplay();
    renderBadges();
    renderCategorySettings();
    studyPathSelect.value = currentStudyPath;
    updateStats();
    streakDaysEl.textContent = streakDays;
  }
}

// Request notification permission
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return;
  }
  
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeCalendar();
  initializeModals();
  initializeSettings();
  loadSavedData();
  requestNotificationPermission();
  
  // Show today's tasks by default
  const today = new Date().toISOString().split('T')[0];
  showDayDetails(today);
  
  // Check for daily reminder
  checkDailyReminder();
});

// Check for daily reminder
function checkDailyReminder() {
  if (!config.reminders) return;
  
  const now = new Date();
  const [hours, minutes] = config.reminderTime.split(':');
  const reminderTime = new Date();
  reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // If it's past reminder time today
  if (now > reminderTime) {
    // Check if we already showed the reminder today
    const lastReminderDate = localStorage.getItem('lastReminderDate');
    if (lastReminderDate !== now.toISOString().split('T')[0]) {
      showReminder();
      localStorage.setItem('lastReminderDate', now.toISOString().split('T')[0]);
    }
  } else {
    // Set timeout for reminder
    const timeout = reminderTime - now;
    setTimeout(showReminder, timeout);
  }
}

// Show daily reminder
function showReminder() {
  const today = new Date().toISOString().split('T')[0];
  const day = allDays.find(d => d.date === today);
  
  if (day && day.tasks.length > 0) {
    const incompleteTasks = day.tasks.filter(t => !completedTasks.includes(t.id));
    if (incompleteTasks.length > 0) {
      const message = `You have ${incompleteTasks.length} task(s) remaining for today!`;
      showNotification(message);
    }
  }
  
  // Schedule next reminder for tomorrow
  setTimeout(checkDailyReminder, 86400000); // 24 hours
}
