import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const mockTodosResponse = {
  todos: [
    {
      id: 1,
      todo: "Do something nice for someone you care about",
      completed: false,
      userId: 152,
    },
    { id: 2, todo: "Memorize a poem", completed: true, userId: 13 },
  ],
  total: 2,
  skip: 0,
  limit: 30,
};

describe("Todo App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("fetches tasks once on initial render and displays them", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockTodosResponse,
    } as Response);

    render(<App />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://dummyjson.com/todos");

    expect(
      await screen.findByText("Do something nice for someone you care about"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Memorize a poem")).toBeInTheDocument();
  });

  it("loads tasks from localStorage and does not call API", async () => {
    const storedTasks = [
      {
        id: 1,
        todo: "Do something nice for someone you care about",
        completed: false,
        userId: 152,
      },
      { id: 2, todo: "Memorize a poem", completed: true, userId: 13 },
    ];

    localStorage.setItem("tasks", JSON.stringify(storedTasks));

    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(<App />);

    expect(
      await screen.findByText("Do something nice for someone you care about"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Memorize a poem")).toBeInTheDocument();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates task completion status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockTodosResponse,
    } as Response);

    render(<App />);

    const task = await screen.findByText(
      "Do something nice for someone you care about",
    );

    const completeButtons = await screen.findAllByRole("button", {
      name: /complete/i,
    });

    await userEvent.click(completeButtons[0]);

    await waitFor(() => {
      expect(task.closest("li")).toHaveStyle("text-decoration: line-through");
      expect(task.closest("li")).toHaveStyle("opacity: 0.7");
      expect(completeButtons[0]).toHaveTextContent(/undo/i);
    });
  });

  it("adds a new task", async () => {
    render(<App />);

    const input = await screen.findByPlaceholderText(/add a new task/i);
    const addButton = screen.getByRole("button", { name: /add/i });

    await userEvent.type(input, "Buy groceries");
    await userEvent.click(addButton);
    expect(await screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("deletes a task", async () => {
    render(<App />);

    expect(
      await screen.findByText("Do something nice for someone you care about"),
    ).toBeInTheDocument();

    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });

    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(
        screen.queryByText("Do something nice for someone you care about"),
      ).not.toBeInTheDocument();
    });
  });

  it("Does not allow adding empty tasks", async () => {
    render(<App />);
    const input = await screen.findByPlaceholderText(/add a new task/i);
    const addButton = screen.getByRole("button", { name: /add/i });

    await userEvent.type(input, "   ");
    expect(addButton).toBeDisabled();

    await userEvent.type(input, "something");
    expect(addButton).toBeEnabled();
  });
});
