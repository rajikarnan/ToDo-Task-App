import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const mockTodosResponse = {
  todos: [
{id: 1, todo: "Do something nice for someone you care about", completed: false, userId: 152} ,
{id: 2, todo: "Memorize a poem", completed: true, userId: 13}
  ],
  total: 2,
  skip: 0,
  limit: 30,
};

describe("Todo App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches tasks once on initial render and displays them", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockTodosResponse,
    } as Response);

    render(<App />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://dummyjson.com/todos");

    expect(await screen.findByText("Do something nice for someone you care about")).toBeInTheDocument();
    expect(await screen.findByText("Memorize a poem")).toBeInTheDocument();
  });

    it("Button updates after complete action", async () => {
      
        render(<App />);

    const completeButtons = await screen.findAllByRole("button", {  
            name: /complete/i,  
        });

        await userEvent.click(completeButtons[0]); 
        
        await waitFor(() => {
          
            expect(completeButtons[0]).toHaveTextContent(/undo/i);
        });

    });

  it("adds a new task", async () => {

    render(<App />);

    const input = await screen.findByPlaceholderText(/add a new task/i);
    const addButton = screen.getByRole("button", { name: /add/i });


    await userEvent.type(input, "Buy groceries");
    await userEvent.click(addButton);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("deletes a task", async () => {

    render(<App />);

    expect(await screen.findByText("Do something nice for someone you care about")).toBeInTheDocument();

    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });


    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Do something nice for someone you care about")).not.toBeInTheDocument();
    });

  });


});
