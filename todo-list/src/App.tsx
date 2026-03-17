import { useEffect, useState } from "react";
import "./App.css";
import { Todo } from "./Todo";
import { type ToDoListItem } from "./types";

const getStoredTodos = (): ToDoListItem[] | null => {
  const stored = localStorage.getItem("tasks");
  return stored ? JSON.parse(stored) : null;
};

function App() {
  const [tasks, setTasks] = useState<ToDoListItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const storedTasks = getStoredTodos();

    if (storedTasks != null) {
      setTasks(storedTasks);
      setLoading(false);
      setInitialDataLoaded(true);
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch("https://dummyjson.com/todos");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.todos);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
        setInitialDataLoaded(true);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!initialDataLoaded) {
      return;
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks, initialDataLoaded]);

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    const newTask: ToDoListItem = {
      id: Date.now(),
      todo: inputValue,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setInputValue("");
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="app">
      <h1>Task List</h1>
      <div className="input-container">
        <input
          aria-label="Add new task input"
          type="text"
          value={inputValue}
          className="add-new-input"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodo();
          }}
          placeholder="Add a new task"
        />
        <button
          id="add-btn"
          aria-label="Add task button"
          aria-description="Button to add a new task"
          disabled={!inputValue.trim()}
          className="add-btn"
          onClick={addTodo}
        >
          Add
        </button>
      </div>
      {loading && (
        <p
          className="loading"
          aria-description="Loading tasks..."
          aria-label="loading"
        >
          Loading tasks...
        </p>
      )}
      {!loading && !error && tasks.length === 0 && (
        <p
          className="no-tasks"
          aria-description="No tasks available"
          aria-label="no tasks"
        >
          No tasks available.
        </p>
      )}
      {error && (
        <p
          className="error"
          aria-description="Error message"
          aria-label="error"
        >
          {error}
        </p>
      )}
      <ul className="todo-list">
        {tasks.map((task) => (
          <Todo
            key={task.id}
            item={task}
            onComplete={toggleTask}
            onDelete={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
