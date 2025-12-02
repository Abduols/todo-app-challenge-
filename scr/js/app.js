/** @format */

// ===== DOM ELEMENTS =====
const dom = {
	themeToggle: document.getElementById("theme-toggle"),
	themeIcon: document.querySelector(".theme-icon"),
	todoForm: document.getElementById("todo-form"),
	todoInput: document.getElementById("new-todo"),
	todoList: document.getElementById("todo-list"),
	itemsCount: document.getElementById("items-count"),
	activeCount: document.getElementById("active-count"),
	clearCompleted: document.getElementById("clear-completed"),
	filterButtons: document.querySelectorAll(".filter-btn"),
	mobileFilterButtons: document.querySelectorAll(".mobile-filters .filter-btn"),
};

// ===== STATE =====
let state = {
	todos: JSON.parse(localStorage.getItem("todos")) || [],
	currentFilter: "all",
	currentTheme: localStorage.getItem("theme") || "light",
};

if (state.todos.length === 0) {
	state.todos = [
		{
			id: 1,
			text: "Complete online JavaScript course",
			completed: true,
			createdAt: new Date().toISOString(),
		},
		{
			id: 2,
			text: "Jog around the park 3x",
			completed: false,
			createdAt: new Date().toISOString(),
		},
		{
			id: 3,
			text: "10 minutes meditation",
			completed: false,
			createdAt: new Date().toISOString(),
		},
	];
	saveTodos();
}

// ===== THEME MANAGEMENT =====
function initTheme() {
	// Set initial theme
	document.body.setAttribute("data-theme", state.currentTheme);
	updateThemeIcon();
}

function toggleTheme() {
	state.currentTheme = state.currentTheme === "light" ? "dark" : "light";
	document.body.setAttribute("data-theme", state.currentTheme);
	localStorage.setItem("theme", state.currentTheme);
	updateThemeIcon();
}

function updateThemeIcon() {
	const iconSrc =
		state.currentTheme === "light"
			? "scr/asset/icon/icon-sun.svg"
			: "scr/asset/icon/icon-moon.svg";
	const iconAlt = state.currentTheme === "light" ? "Sun icon" : "Moon icon";
	dom.themeIcon.src = iconSrc;
	dom.themeIcon.alt = iconAlt;
}

// ===== TODO FUNCTIONS =====
function addTodo(event) {
	event.preventDefault();
	const text = dom.todoInput.value.trim();

	if (!text) return;

	const newTodo = {
		id: Date.now(),
		text: text,
		completed: false,
		createdAt: new Date().toISOString(),
	};

	state.todos.unshift(newTodo);
	dom.todoInput.value = "";
	saveTodos();
	renderTodos();
}

function toggleTodo(id) {
	state.todos = state.todos.map((todo) =>
		todo.id === id ? { ...todo, completed: !todo.completed } : todo
	);
	saveTodos();
	renderTodos();
}

function deleteTodo(id) {
	state.todos = state.todos.filter((todo) => todo.id !== id);
	saveTodos();
	renderTodos();
}

function clearCompletedTodos() {
	state.todos = state.todos.filter((todo) => !todo.completed);
	saveTodos();
	renderTodos();
}

function setFilter(filter) {
	state.currentFilter = filter;

	// Update desktop filter buttons
	dom.filterButtons.forEach((btn) => {
		const isActive = btn.dataset.filter === filter;
		btn.classList.toggle("active", isActive);
		btn.setAttribute("aria-selected", isActive);
	});

	// Update mobile filter buttons
	dom.mobileFilterButtons.forEach((btn) => {
		const isActive = btn.dataset.filter === filter;
		btn.classList.toggle("active", isActive);
		btn.setAttribute("aria-selected", isActive);
	});

	renderTodos();
}

// ===== RENDER FUNCTIONS =====
function renderTodos() {
	const filteredTodos = getFilteredTodos();
	updateItemsCount();

	if (filteredTodos.length === 0) {
		renderEmptyState();
		return;
	}

	dom.todoList.innerHTML = filteredTodos
		.map(
			(todo) => `
		<li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
			<div class="todo-content" onclick="toggleTodo(${todo.id})">
				<div class="todo-check">
					<span class="check-circle ${todo.completed ? "checked" : ""}"></span>
				</div>
				<span class="todo-text">${escapeHtml(todo.text)}</span>
				<button class="todo-delete" onclick="event.stopPropagation(); deleteTodo(${
					todo.id
				})" 
				        aria-label="Delete todo">
					<img src="scr/asset/icon/icon-cross.svg" alt="Delete">
				</button>
			</div>
		</li>
	`
		)
		.join("");

	// Initialize drag and drop
	initDragAndDrop();
}

function renderEmptyState() {
	let message, hint;

	switch (state.currentFilter) {
		case "active":
			message = "No active todos";
			hint = "All todos are completed";
			break;
		case "completed":
			message = "No completed todos";
			hint = "Complete some todos to see them here";
			break;
		default:
			message = "No todos yet";
			hint = "Add a todo to get started!";
	}

	dom.todoList.innerHTML = `
		<li class="empty-state">
			<p>${message}</p>
			<small>${hint}</small>
		</li>
	`;
}

function updateItemsCount() {
	const activeCount = state.todos.filter((todo) => !todo.completed).length;
	dom.activeCount.textContent = activeCount;

	// Update text with correct pluralization
	const itemsText = activeCount === 1 ? "item left" : "items left";
	dom.itemsCount.innerHTML = `<span id="active-count">${activeCount}</span> ${itemsText}`;
}

function getFilteredTodos() {
	switch (state.currentFilter) {
		case "active":
			return state.todos.filter((todo) => !todo.completed);
		case "completed":
			return state.todos.filter((todo) => todo.completed);
		default:
			return state.todos;
	}
}

// ===== HELPER FUNCTIONS =====
function saveTodos() {
	localStorage.setItem("todos", JSON.stringify(state.todos));
}

function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
	// Theme toggle
	dom.themeToggle.addEventListener("click", toggleTheme);

	// Todo form
	dom.todoForm.addEventListener("submit", addTodo);

	// Clear completed
	dom.clearCompleted.addEventListener("click", clearCompletedTodos);

	// Filter buttons
	dom.filterButtons.forEach((btn) => {
		btn.addEventListener("click", () => setFilter(btn.dataset.filter));
	});

	// Mobile filter buttons
	dom.mobileFilterButtons.forEach((btn) => {
		btn.addEventListener("click", () => setFilter(btn.dataset.filter));
	});

	// Add todo on Enter
	dom.todoInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			addTodo(e);
		}
	});
}

// ===== INITIALIZATION =====
function initApp() {
	initTheme();
	initEventListeners();
	renderTodos();
	console.log("Todo App initialized with design-perfect layout!");
}

// Start the app
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initApp);
} else {
	initApp();
}

// Make functions available globally
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// ===== DRAG AND DROP =====
let draggedItem = null;

function initDragAndDrop() {
	const todoItems = document.querySelectorAll(".todo-item");

	todoItems.forEach((item) => {
		item.setAttribute("draggable", "true");

		item.addEventListener("dragstart", handleDragStart);
		item.addEventListener("dragover", handleDragOver);
		item.addEventListener("dragenter", handleDragEnter);
		item.addEventListener("dragleave", handleDragLeave);
		item.addEventListener("drop", handleDrop);
		item.addEventListener("dragend", handleDragEnd);
	});
}

function handleDragStart(e) {
	draggedItem = this;
	this.classList.add("dragging");
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/html", this.innerHTML);
}

function handleDragOver(e) {
	e.preventDefault();
	return false;
}

function handleDragEnter(e) {
	e.preventDefault();
	this.classList.add("drag-over");
}

function handleDragLeave() {
	this.classList.remove("drag-over");
}

function handleDrop(e) {
	e.stopPropagation();
	e.preventDefault();

	if (draggedItem !== this) {
		// Get all todo items
		const items = Array.from(document.querySelectorAll(".todo-item"));
		const draggedIndex = items.indexOf(draggedItem);
		const dropIndex = items.indexOf(this);

		// Reorder in state
		const todoToMove = state.todos[draggedIndex];
		state.todos.splice(draggedIndex, 1);
		state.todos.splice(dropIndex, 0, todoToMove);

		// Save and re-render
		saveTodos();
		renderTodos();
	}

	return false;
}

function handleDragEnd() {
	this.classList.remove("dragging");
	document.querySelectorAll(".todo-item").forEach((item) => {
		item.classList.remove("drag-over");
	});
}

// Add CSS for drag and drop
const dragDropStyles = `
	.todo-item.dragging {
		opacity: 0.5;
		background-color: var(--todo-bg);
	}
	
	.todo-item.drag-over {
		border-top: 2px solid var(--bright-blue);
	}
	
	.todo-item {
		cursor: move;
		user-select: none;
	}
	
	.todo-item.dragging .todo-content {
		cursor: grabbing;
	}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = dragDropStyles;
document.head.appendChild(styleSheet);
