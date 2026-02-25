import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../components/ui/Input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards placeholder prop", () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });

  it("calls onChange when the user types", async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("reflects controlled value", () => {
    render(<Input value="controlled" readOnly />);
    expect(screen.getByRole("textbox")).toHaveValue("controlled");
  });

  it("applies extra className", () => {
    render(<Input className="w-60" />);
    expect(screen.getByRole("textbox").className).toMatch(/w-60/);
  });
});
