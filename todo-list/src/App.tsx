import { useEffect, useState } from "react";
import './App.css';
import { Todo } from "./Todo";
import { type ToDoListItem } from "./types";

function App() { 
  const [tasks, setTasks] = useState<ToDoListItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
        setLoading(false);
        return;
      }
      const InitialTasks = fetch("https://dummyjson.com/todos").then(res => res.json()).catch(err => {
        console.error("Error fetching initial tasks:", err);
      });
      InitialTasks.then(data => {
        if (data && data.todos) {
          setTasks(data.todos);
          setLoading(false);
        }
      });
    
    
  }, []);

  useEffect(() => {
    if (tasks?.length) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

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
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      <h1>Task List</h1>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          className="add-new-input"
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task"
        />
        <button className="add-btn" onClick={addTodo}>
          Add
        </button>
      </div>
      {loading && <p>Loading tasks...</p>}
      {!loading && tasks.length === 0 && <p>No tasks available.</p>}
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