import { expect, test, describe } from "bun:test";
import { init_forge } from "..";

describe("hello", () => {
  test("returns greeting with name", () => {
    expect(init_forge()).toBe("This fn is called from forge_init");
  });
});
