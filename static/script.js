const add_button = document.querySelector("#add-button");
const modal_add_task = document.querySelector("#task-modal");
const modal_task_description = document.querySelector("#task-description");
const taskList = document.querySelector("#task-list");
const newTaskForm = document.querySelector("#new-task-form");

const buttons_modal = document.querySelectorAll("#modal-cancel, #modal-add");

add_button.addEventListener("click", (event) => {
  modal_add_task.style.display = "flex";
});

buttons_modal.forEach((button) => {
  button.addEventListener("click", (event) => {
    const idButton = event.target.id;

    switch (idButton) {
      case "modal-cancel":
        modal_add_task.style.display = "none";
        modal_task_description.value = "";
        break;

      default:
        console.log("Ação não existe");
    }
  });
});

newTaskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const description = modal_task_description.value.trim();

  if (description === "") {
    alert("A descrição da tarefa não pode estar vazia.");
    return;
  }

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: description }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Falha ao adicionar a tarefa.");
    }

    modal_task_description.value = "";
    modal_add_task.style.display = "none";
    await fetchTasks();
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
  }
});

function createTaskElement(task) {
  const isCompleted = task.completed;
  const completedClass = isCompleted ? "completed" : "";
  const checkedAttr = isCompleted ? "checked" : "";

  const taskHTML = `
        <div class="task-item ${completedClass}" data-task-id="${task.id}">
            
            <label class="task-label">
                <input type="checkbox" name="task-${task.id}" ${checkedAttr} data-task-id="${task.id}" />
                <span>${task.description}</span>
            </label>
            
            <button class="delete-btn" data-task-id="${task.id}" title="Delete Task">
                &#128465;
            </button>
        </div>
    `;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = taskHTML.trim();

  return tempDiv.firstChild;
}

async function fetchTasks() {
  try {
    const response = await fetch("/api/tasks");

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    const tasks = await response.json();
    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();

  taskList.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
      const checkbox = event.target;
      const taskId = checkbox.dataset.taskId;
      const newStatus = checkbox.checked;

      const taskItemDiv = checkbox.closest(".task-item");
      if (newStatus) {
        taskItemDiv.classList.add("completed");
      } else {
        taskItemDiv.classList.remove("completed");
      }

      updateTaskStatus(taskId, newStatus);
    }
  });

  taskList.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target.classList.contains("delete-btn") ||
      target.closest(".delete-btn")
    ) {
      const deleteButton = target.closest(".delete-btn");
      const taskId = deleteButton.dataset.taskId;

      deleteTask(taskId);
    }
  });
});

async function updateTaskStatus(taskId, isCompleted) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: isCompleted }),
    });

    if (!response.ok) {
      await fetchTasks();
      throw new Error("Falha ao atualizar o status da tarefa.");
    }
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();

  taskList.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
      const checkbox = event.target;
      const taskId = checkbox.dataset.taskId;
      const newStatus = checkbox.checked;

      const taskItemDiv = checkbox.closest(".task-item");
      if (newStatus) {
        taskItemDiv.classList.add("completed");
      } else {
        taskItemDiv.classList.remove("completed");
      }

      updateTaskStatus(taskId, newStatus);
    }
  });
});

async function deleteTask(itemId) {
  const id = parseInt(itemId);

  if (isNaN(id)) {
    console.error("ID de tarefa inválido.");
    return;
  }

  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      fetchTasks();
    } else {
      console.error("Falha ao deletar a tarefa. Status:", response.status);
      alert("Error deleting task.");
    }
  } catch (error) {
    console.error("Network error during deletion:", error);
  }
}
