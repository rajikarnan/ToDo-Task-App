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
  const renderApp = () => render(<App />);
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("fetches tasks once on initial render and displays them", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockTodosResponse,
    } as Response);

    renderApp();

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

    renderApp();

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

    renderApp();

    const task = await screen.findByText(
      "Do something nice for someone you care about",
    );

    const completeButtons = await screen.findAllByRole("button", {
      name: /complete/i,
    });

    await userEvent.click(completeButtons[0]);

    await waitFor(() => {
      expect(task.closest("li")).toHaveClass("completed");
    });
  });

  it("adds a new task", async () => {
    renderApp();

    const input = await screen.findByPlaceholderText(/add a new task/i);
    const addButton = screen.getByRole("button", { name: /add/i });

    await userEvent.type(input, "Buy groceries");
    await userEvent.click(addButton);
    expect(await screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("deletes a task", async () => {
    renderApp();

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
    renderApp();
    const input = await screen.findByPlaceholderText(/add a new task/i);
    const addButton = screen.getByRole("button", { name: /add/i });
    const user = userEvent.setup();

    await user.type(input, "   ");
    expect(addButton).toBeDisabled();

    await user.type(input, "something");
    expect(addButton).toBeEnabled();
  });

  it("Displays loading state correctly", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockTodosResponse,
    } as Response);
    renderApp();
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });
  });

  it("Displays error message on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
    } as Response);
    renderApp();
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });
});
