import { describe, expect, it } from "vitest";
import { LoginSchema, UserSchema } from "../features/auth/schemas";

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    expect(() => LoginSchema.parse({ email: "user@test.com", password: "secret" })).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => LoginSchema.parse({ email: "not-an-email", password: "secret" })).toThrow();
  });

  it("rejects password shorter than 4 chars", () => {
    expect(() => LoginSchema.parse({ email: "user@test.com", password: "abc" })).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => LoginSchema.parse({})).toThrow();
    expect(() => LoginSchema.parse({ email: "user@test.com" })).toThrow();
  });
});

describe("UserSchema", () => {
  const valid = { id: "u_1", name: "Alice", email: "alice@test.com" };

  it("accepts a valid user", () => {
    expect(() => UserSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => UserSchema.parse({ ...valid, email: "bad" })).toThrow();
  });

  it("rejects missing id", () => {
    expect(() => UserSchema.parse({ name: "Alice", email: "alice@test.com" })).toThrow();
  });
});
