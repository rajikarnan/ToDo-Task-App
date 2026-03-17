import React from "react";
import { type ToDoListItem as TodoListItemType } from "./types";
import { FaTrash } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaRedo } from "react-icons/fa";

type Props = {
  item: TodoListItemType;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
};

export const Todo: React.FC<Props> = ({ item, onComplete, onDelete }) => {
  return (
    <li
      id="todo-item"
      aria-label="Todo item"
      aria-description={`Todo item ${item.todo} - ${item.completed ? "completed" : "not completed"}`}
      className={`todo-item ${item.completed ? "completed" : ""}`}
    >
      <span className="todo-text">{item.todo}</span>
      <div className="button-container">
        <button
          id="complete-btn"
          aria-label="Complete button"
          aria-description={`complete button - ${item.completed ? "undo" : "complete"}`}
          className="complete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onComplete(item.id);
          }}
        >
          {item.completed ? (
            <FaRedo aria-label="Undo" aria-description="Redo the Task" />
          ) : (
            <FaCheck
              aria-label="Complete"
              aria-description="Mark the task as complete"
            />
          )}
        </button>
        <button
          id="delete-btn"
          aria-label="Delete button"
          aria-description="Delete button"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          <FaTrash aria-label="Delete" aria-description="Delete the task" />
        </button>
      </div>
    </li>
  );
};
