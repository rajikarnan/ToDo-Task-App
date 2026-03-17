import React from "react";
import { type ToDoListItem as TodoListItemType } from "./types";

type Props = {
  item: TodoListItemType;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
};

export const Todo: React.FC<Props> = ({ item, onComplete, onDelete }) => {
  return (
    <li
      aria-description={`Todo item ${item.completed ? "completed" : "not completed"}`}
      className={`todo-item ${item.completed ? "completed" : ""}`}
      onClick={() => onComplete(item.id)}
      style={{
        textDecoration: item.completed ? "line-through" : "none",
        opacity: item.completed ? 0.7 : 1,
      }}
    >
      <span className="todo-text">{item.todo}</span>
      <div className="button-container">
        <button
          aria-description={`complete button - ${item.completed ? "undo" : "complete"}`}
          className="complete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onComplete(item.id);
          }}
        >
          {item.completed ? "Undo" : "Complete"}
        </button>
        <button
          aria-description="Delete button"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
};
