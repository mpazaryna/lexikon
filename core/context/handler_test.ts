import { assertEquals } from "jsr:@std/assert";
import { test } from "jsr:@std/testing";

test("simple test", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});
