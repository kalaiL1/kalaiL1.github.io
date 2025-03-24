// Task class with completion status
class Task {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.id = Date.now(); // Add unique ID for task management
        this.completed = false; // Default status is pending
    }
}

// Retrieve tasks from local storage or initialize an empty array
const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Current filter state (global variable)
let currentFilter = 'all';

// Save tasks to local storage
const saveTasks = () => {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to local storage:', error);
        alert('Could not save tasks. Please try again.');
    }
};

// Add a new task
const addTask = () => {
    const taskName = document.getElementById('task name').value;
    const taskDescription = document.getElementById('Task description').value;
    if (taskName.trim() === '') {
        alert('Task name cannot be empty.');
        return;
    }
    const task = new Task(taskName, taskDescription);
    tasks.push(task);
    saveTasks();
    applyFilters();
    clearFields();
    alert('Task added successfully.');
};

// Toggle task completion status
const toggleTaskCompletion = (index) => {
    const task = tasks.find(t => t.id === index);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        applyFilters();
    }
};

// Edit an existing task
const editTask = () => {
    const selectedTasks = document.querySelectorAll('#taskList li.selected');
    if (selectedTasks.length !== 1) {
        alert('Please select exactly one task to edit.');
        return;
    }
    
    const selectedTask = selectedTasks[0];
    const taskId = selectedTask.dataset.id;
    const taskIndex = tasks.findIndex(t => t.id == taskId);
    
    if (taskIndex === -1) {
        alert('Task not found.');
        return;
    }
    
    const taskName = prompt("Edit Task Name:", tasks[taskIndex].name);
    const taskDescription = prompt("Edit Task Description:", tasks[taskIndex].description);
    
    if (taskName !== null && taskDescription !== null) {
        tasks[taskIndex].name = taskName;
        tasks[taskIndex].description = taskDescription;
        saveTasks();
        applyFilters();
        alert('Task edited successfully.');
    }
};

// Delete the selected task
const deleteTask = () => {
    const selectedTasks = document.querySelectorAll('#taskList li.selected');
    if (selectedTasks.length === 0) {
        alert('Please select a task to delete.');
        return;
    }
    
    if (confirm('Are you sure you want to delete the selected task(s)?')) {
        let deleted = false;
        selectedTasks.forEach(taskElement => {
            const taskId = taskElement.dataset.id;
            const taskIndex = tasks.findIndex(t => t.id == taskId);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                deleted = true;
            }
        });
        
        if (deleted) {
            saveTasks();
            applyFilters();
            alert('Task(s) deleted successfully.');
        }
    }
};

// Apply current filters (both search and status)
const applyFilters = () => {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    // First filter by status
    let filteredTasks = tasks;
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    }
    
    // Then filter by search term
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(searchTerm) || 
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    displayTasks(filteredTasks);
};

// Filter tasks by status
const filterTasksByStatus = (status) => {
    currentFilter = status;
    applyFilters();
};

// Search tasks by name or description
const searchTasks = () => {
    applyFilters();
};

// Update the displayTasks function to include icons
const displayTasks = (filteredTasks = tasks) => {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear the list before displaying tasks
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.innerHTML = '<i class="fas fa-info-circle"></i> No tasks found.';
        emptyMessage.className = 'empty-message';
        taskList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach((task) => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = task.id;
        
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <div class="task-header">
                    <h3>${task.completed ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-clock"></i>'} ${task.name}</h3>
                    <span class="task-status">${task.completed ? 
                        '<i class="fas fa-check"></i> Completed' : 
                        '<i class="fas fa-hourglass-half"></i> Pending'}</span>
                </div>
                <div class="task-body">
                    <p><i class="fas fa-file-alt"></i> ${task.description || 'No description provided.'}</p>
                </div>
            </div>
        `;
        
        // Add event listener to checkbox
        taskItem.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent triggering the li click event
            toggleTaskCompletion(task.id);
        });
        
        // Make tasks selectable
        taskItem.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                taskItem.classList.toggle('selected');
            }
        });
        
        taskList.appendChild(taskItem);
    });
};

// Clear input fields
const clearFields = () => {
    document.getElementById('task name').value = '';
    document.getElementById('Task description').value = '';
};

// Add event listeners when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Display tasks on page load
    displayTasks();
    
    // Add event listeners to buttons
    const addButton = document.querySelector('.buttons button:nth-child(1)');
    const deleteButton = document.querySelector('.buttons button:nth-child(2)');
    const editButton = document.querySelector('.buttons button:nth-child(3)');
    
    if (addButton) addButton.addEventListener('click', addTask);
    if (deleteButton) deleteButton.addEventListener('click', deleteTask);
    if (editButton) editButton.addEventListener('click', editTask);
    
    // Add event listener to search input
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.addEventListener('input', searchTasks);
    
    // Add event listeners to filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button styling
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter tasks based on button's data-status attribute
                filterTasksByStatus(button.dataset.status);
            });
        });
    } else {
        console.warn('Filter buttons not found. Make sure to add the HTML for filter buttons.');
    }
});