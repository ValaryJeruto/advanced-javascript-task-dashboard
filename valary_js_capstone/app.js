const STORAGE_KEY = "advanced-js-capstone-tasks";

class TaskDashboard {
  constructor() {
    this.tasks = [];
    this.taskForm = document.getElementById("taskForm");
    this.taskContainer = document.getElementById("taskContainer");
    this.formMessage = document.getElementById("formMessage");
    this.template = document.getElementById("taskCardTemplate");

    this.fields = {
      taskId: document.getElementById("taskId"),
      title: document.getElementById("title"),
      category: document.getElementById("category"),
      priority: document.getElementById("priority"),
      dueDate: document.getElementById("dueDate"),
      description: document.getElementById("description"),
      searchInput: document.getElementById("searchInput"),
      statusFilter: document.getElementById("statusFilter"),
      sortBy: document.getElementById("sortBy")
    };

    this.statEls = {
      total: document.getElementById("totalTasks"),
      completed: document.getElementById("completedTasks"),
      open: document.getElementById("openTasks"),
      overdue: document.getElementById("overdueTasks")
    };

    this.bindEvents();
    this.loadTasks();
    this.render();
  }

  bindEvents() {
    this.taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.saveTask();
    });

    document.getElementById("resetBtn").addEventListener("click", () => this.resetForm());
    document.getElementById("clearCompletedBtn").addEventListener("click", () => this.clearCompleted());
    document.getElementById("loadDemoBtn").addEventListener("click", () => this.loadDemoData());
    document.getElementById("exportBtn").addEventListener("click", () => this.exportTasks());

    [this.fields.searchInput, this.fields.statusFilter, this.fields.sortBy].forEach((control) => {
      control.addEventListener("input", () => this.render());
      control.addEventListener("change", () => this.render());
    });
  }

  loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.tasks = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Could not parse saved tasks.", error);
      this.tasks = [];
    }
  }

  persistTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  saveTask() {
    const title = this.fields.title.value.trim();
    const description = this.fields.description.value.trim();
    const dueDate = this.fields.dueDate.value;

    if (!title) {
      this.setMessage("Please enter a task title before saving.", "error");
      this.fields.title.focus();
      return;
    }

    const existingId = this.fields.taskId.value;
    const taskPayload = {
      id: existingId || crypto.randomUUID(),
      title,
      category: this.fields.category.value,
      priority: this.fields.priority.value,
      dueDate,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (existingId) {
      const previousTask = this.tasks.find((task) => task.id === existingId);
      taskPayload.completed = previousTask?.completed ?? false;
      taskPayload.createdAt = previousTask?.createdAt ?? taskPayload.createdAt;
      this.tasks = this.tasks.map((task) => task.id === existingId ? taskPayload : task);
      this.setMessage("Task updated successfully.", "success");
    } else {
      this.tasks.unshift(taskPayload);
      this.setMessage("Task saved successfully.", "success");
    }

    this.persistTasks();
    this.resetForm(false);
    this.render();
  }

  resetForm(clearMessage = true) {
    this.taskForm.reset();
    this.fields.taskId.value = "";
    document.getElementById("saveBtn").textContent = "Save Task";
    if (clearMessage) {
      this.setMessage("");
    }
  }

  setMessage(message = "", type = "") {
    this.formMessage.textContent = message;
    this.formMessage.className = "form-message";
    if (type) {
      this.formMessage.classList.add(type);
    }
  }

  loadDemoData() {
    const demoTasks = [
      {
        id: crypto.randomUUID(),
        title: "Design onboarding wireframe",
        category: "Design",
        priority: "High",
        dueDate: this.offsetDate(2),
        description: "Create a clean onboarding layout for the capstone project and prepare review notes.",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Write JavaScript README",
        category: "Documentation",
        priority: "Medium",
        dueDate: this.offsetDate(4),
        description: "Document setup steps, project features, and troubleshooting guidance.",
        completed: false,
        createdAt: new Date(Date.now() - 3600_000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Test DOM interactions",
        category: "Testing",
        priority: "High",
        dueDate: this.offsetDate(-1),
        description: "Verify task creation, edit flow, delete flow, and localStorage persistence.",
        completed: false,
        createdAt: new Date(Date.now() - 7200_000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Research array methods",
        category: "Research",
        priority: "Low",
        dueDate: this.offsetDate(7),
        description: "Compare map, filter, reduce, and sort for the capstone reflection.",
        completed: true,
        createdAt: new Date(Date.now() - 10800_000).toISOString()
      }
    ];

    this.tasks = demoTasks;
    this.persistTasks();
    this.render();
    this.setMessage("Demo data loaded.", "success");
  }

  offsetDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  clearCompleted() {
    const hadCompleted = this.tasks.some((task) => task.completed);
    this.tasks = this.tasks.filter((task) => !task.completed);
    this.persistTasks();
    this.render();
    this.setMessage(hadCompleted ? "Completed tasks cleared." : "No completed tasks found.", hadCompleted ? "success" : "error");
  }

  exportTasks() {
    const blob = new Blob([JSON.stringify(this.tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "advanced-js-capstone-tasks.json";
    link.click();
    URL.revokeObjectURL(url);
    this.setMessage("Tasks exported as JSON.", "success");
  }

  toggleComplete(taskId) {
    this.tasks = this.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
    this.persistTasks();
    this.render();
  }

  startEdit(taskId) {
    const task = this.tasks.find((item) => item.id === taskId);
    if (!task) return;

    this.fields.taskId.value = task.id;
    this.fields.title.value = task.title;
    this.fields.category.value = task.category;
    this.fields.priority.value = task.priority;
    this.fields.dueDate.value = task.dueDate || "";
    this.fields.description.value = task.description;
    document.getElementById("saveBtn").textContent = "Update Task";
    this.setMessage("You are editing an existing task.", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.persistTasks();
    this.render();
  }

  isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }

  filteredTasks() {
    const searchTerm = this.fields.searchInput.value.trim().toLowerCase();
    const status = this.fields.statusFilter.value;
    const sortBy = this.fields.sortBy.value;

    let results = [...this.tasks].filter((task) => {
      const haystack = `${task.title} ${task.description} ${task.category}`.toLowerCase();
      const matchesSearch = !searchTerm || haystack.includes(searchTerm);

      const matchesStatus =
        status === "all" ||
        (status === "completed" && task.completed) ||
        (status === "open" && !task.completed) ||
        (status === "overdue" && this.isOverdue(task));

      return matchesSearch && matchesStatus;
    });

    const priorityRank = { High: 3, Medium: 2, Low: 1 };

    results.sort((a, b) => {
      switch (sortBy) {
        case "created-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "due-asc":
          return new Date(a.dueDate || "9999-12-31") - new Date(b.dueDate || "9999-12-31");
        case "priority-desc":
          return priorityRank[b.priority] - priorityRank[a.priority];
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "created-desc":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return results;
  }

  renderStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((task) => task.completed).length;
    const overdue = this.tasks.filter((task) => this.isOverdue(task)).length;
    const open = total - completed;

    this.statEls.total.textContent = total;
    this.statEls.completed.textContent = completed;
    this.statEls.open.textContent = open;
    this.statEls.overdue.textContent = overdue;
  }

  buildTaskCard(task) {
    const fragment = this.template.content.cloneNode(true);
    const card = fragment.querySelector(".task-card");
    const title = fragment.querySelector(".task-title");
    const meta = fragment.querySelector(".task-meta");
    const badge = fragment.querySelector(".badge");
    const description = fragment.querySelector(".task-description");
    const status = fragment.querySelector(".task-status");
    const toggleBtn = fragment.querySelector(".toggle-btn");
    const editBtn = fragment.querySelector(".edit-btn");
    const deleteBtn = fragment.querySelector(".delete-btn");

    title.textContent = task.title;
    meta.textContent = `${task.category} • Created ${new Date(task.createdAt).toLocaleString()}`;
    badge.textContent = task.priority;
    badge.classList.add(task.priority.toLowerCase());

    description.textContent = task.description || "No description provided.";

    if (task.completed) {
      card.classList.add("completed-card");
      status.textContent = "Status: Completed";
      toggleBtn.textContent = "Mark Open";
    } else if (this.isOverdue(task)) {
      status.innerHTML = `Status: <span class="overdue-label">Overdue</span>${task.dueDate ? ` • Due ${task.dueDate}` : ""}`;
      toggleBtn.textContent = "Mark Done";
    } else {
      status.textContent = `Status: Open${task.dueDate ? ` • Due ${task.dueDate}` : ""}`;
      toggleBtn.textContent = "Mark Done";
    }

    toggleBtn.addEventListener("click", () => this.toggleComplete(task.id));
    editBtn.addEventListener("click", () => this.startEdit(task.id));
    deleteBtn.addEventListener("click", () => this.deleteTask(task.id));

    return fragment;
  }

  render() {
    this.renderStats();
    const tasks = this.filteredTasks();
    this.taskContainer.innerHTML = "";

    if (!tasks.length) {
      this.taskContainer.innerHTML = `
        <div class="empty-state">
          <h3>No tasks found</h3>
          <p>Try adjusting your filters, loading demo data, or creating a new task.</p>
        </div>
      `;
      return;
    }

    tasks.forEach((task) => {
      this.taskContainer.appendChild(this.buildTaskCard(task));
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TaskDashboard();
});
