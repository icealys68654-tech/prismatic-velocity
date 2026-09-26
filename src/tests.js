import { generateSourceWorld, elementColor, terrainHeightFromCell } from "./world-source.js";

export async function runReproducibilityTests() {
  const tests = [];

  // Test 1: Same seed produces identical grid
  const test1 = () => {
    const seed = 0x12345678;
    const w1 = generateSourceWorld({ seed, width: 64, height: 64 });
    const w2 = generateSourceWorld({ seed, width: 64, height: 64 });

    const grid1 = JSON.stringify(w1.grid);
    const grid2 = JSON.stringify(w2.grid);
    const passed = grid1 === grid2;

    return {
      name: "Same seed produces identical grid",
      passed,
      message: passed ? "✓ Determinism verified" : "✗ Grid mismatch",
    };
  };
  tests.push(test1());

  // Test 2: Different seed produces different grid
  const test2 = () => {
    const w1 = generateSourceWorld({ seed: 0x11111111, width: 64, height: 64 });
    const w2 = generateSourceWorld({ seed: 0x22222222, width: 64, height: 64 });

    const grid1 = JSON.stringify(w1.grid);
    const grid2 = JSON.stringify(w2.grid);
    const passed = grid1 !== grid2;

    return {
      name: "Different seed produces different grid",
      passed,
      message: passed ? "✓ Variance verified" : "✗ Grids are identical",
    };
  };
  tests.push(test2());

  // Test 3: Provenance metadata is present and valid
  const test3 = () => {
    const world = generateSourceWorld({ seed: 0xdeadbeef });
    const prov = world.provenance;
    const passed = prov.seed &&
                   prov.algorithm_version === "1" &&
                   prov.grid_resolution === "64x64" &&
                   prov.generator &&
                   prov.generated_at;

    return {
      name: "Provenance metadata is complete",
      passed,
      message: passed ? "✓ Metadata verified" : "✗ Missing provenance fields",
    };
  };
  tests.push(test3());

  // Test 4: Grid dimensions are correct
  const test4 = () => {
    const world = generateSourceWorld({ seed: 0x99999999, width: 64, height: 64 });
    const passed = world.grid.length === 64 &&
                   world.grid.every((row) => row.length === 64);

    return {
      name: "Grid dimensions are 64x64",
      passed,
      message: passed ? "✓ Dimensions correct" : "✗ Dimension mismatch",
    };
  };
  tests.push(test4());

  // Test 5: All cells have required properties
  const test5 = () => {
    const world = generateSourceWorld({ seed: 0xabcdef00 });
    const cellCheck = world.grid.every((row) =>
      row.every((cell) =>
        cell.x !== undefined &&
        cell.y !== undefined &&
        cell.element &&
        cell.elevation !== undefined &&
        cell.pressures &&
        cell.region !== undefined
      )
    );

    return {
      name: "All cells have required properties",
      passed: cellCheck,
      message: cellCheck ? "✓ Cell structure valid" : "✗ Cell structure invalid",
    };
  };
  tests.push(test5());

  // Test 6: Element values are valid
  const test6 = () => {
    const world = generateSourceWorld({ seed: 0x55555555 });
    const validElements = new Set(["water", "fire", "earth", "air"]);
    const elementCheck = world.grid.every((row) =>
      row.every((cell) => validElements.has(cell.element))
    );

    return {
      name: "All elements are valid (water/fire/earth/air)",
      passed: elementCheck,
      message: elementCheck ? "✓ Elements valid" : "✗ Invalid element found",
    };
  };
  tests.push(test6());

  // Test 7: Elevation is in valid range [0, 1]
  const test7 = () => {
    const world = generateSourceWorld({ seed: 0x77777777 });
    const elevationCheck = world.grid.every((row) =>
      row.every((cell) => cell.elevation >= 0 && cell.elevation <= 1)
    );

    return {
      name: "Elevation values are in range [0, 1]",
      passed: elevationCheck,
      message: elevationCheck ? "✓ Elevation range valid" : "✗ Out of range",
    };
  };
  tests.push(test7());

  // Test 8: Pressures sum to reasonable value (roughly 1.0-1.5)
  const test8 = () => {
    const world = generateSourceWorld({ seed: 0xcccccccc });
    const pressureCheck = world.grid.every((row) =>
      row.every((cell) => {
        const sum = cell.pressures.water + cell.pressures.fire + cell.pressures.earth + cell.pressures.air;
        return sum > 0.8 && sum < 2.0;
      })
    );

    return {
      name: "Elemental pressures are balanced",
      passed: pressureCheck,
      message: pressureCheck ? "✓ Pressures balanced" : "✗ Pressure imbalance",
    };
  };
  tests.push(test8());

  // Test 9: terrainHeightFromCell produces numeric output
  const test9 = () => {
    const world = generateSourceWorld({ seed: 0xeeeeeeee });
    const cell = world.grid[32][32];
    const height = terrainHeightFromCell(cell);
    const passed = typeof height === "number" && !isNaN(height);

    return {
      name: "terrainHeightFromCell produces valid height",
      passed,
      message: passed ? `✓ Height: ${height.toFixed(2)}` : "✗ Invalid height",
    };
  };
  tests.push(test9());

  // Test 10: elementColor produces valid hex color
  const test10 = () => {
    const colors = ["water", "fire", "earth", "air"].map((el) => elementColor(el));
    const passed = colors.every((c) => typeof c === "number" && c >= 0 && c <= 0xffffff);

    return {
      name: "elementColor produces valid hex colors",
      passed,
      message: passed ? `✓ Colors: ${colors.map((c) => `0x${c.toString(16)}`).join(", ")}` : "✗ Invalid color",
    };
  };
  tests.push(test10());

  return tests;
}

export function printTestResults(tests) {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Prismatic Velocity — Reproducibility Test Suite");
  console.log("═══════════════════════════════════════════════════════\n");

  tests.forEach((test, index) => {
    const icon = test.passed ? "✓" : "✗";
    const status = test.passed ? "PASS" : "FAIL";
    console.log(`[${index + 1}/${tests.length}] ${icon} ${test.name}`);
    console.log(`    ${test.message}\n`);
  });

  const passed = tests.filter((t) => t.passed).length;
  const total = tests.length;
  const allPassed = passed === total;

  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Result: ${passed}/${total} tests passed`);
  console.log(`  Status: ${allPassed ? "✓ GREEN" : "✗ RED"}`);
  console.log("═══════════════════════════════════════════════════════\n");

  return allPassed;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = await runReproducibilityTests();
  const allPassed = printTestResults(tests);
  process.exit(allPassed ? 0 : 1);
}
