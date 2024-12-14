import { expect, test, describe } from "bun:test";
import { forge_init } from "..";

describe("hello", () => {
  test("returns greeting with name", () => {
    expect(forge_init()).toBe("This fn is called from forge_init");
  });
});
