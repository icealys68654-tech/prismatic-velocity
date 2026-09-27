import { generateSourceWorld, elementColor, terrainHeightFromCell } from "./world-source.js";
import { buildWorldMesh } from "./world-mesh.js";
import { runPhase8And9Tests } from "./tests-phase8-9.js";
import { runPhase10Tests } from "./tests-phase10.js";
import { runPhase10AdapterTests } from "./tests-phase10-adapters.js";
import { runPhase11Tests } from "./tests-phase11.js";
import { runPhase11_2Tests } from "./tests-phase11-2.js";
import { buildPrismaticLightField, reactPrismaticLightField } from "./prismatic-light-field.js";

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
                   prov.algorithm_version === "3" &&
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

  // Test 8: Normalized elemental pressures sum to 1.0
  const test8 = () => {
    const world = generateSourceWorld({ seed: 0xcccccccc });
    const pressureCheck = world.grid.every((row) =>
      row.every((cell) => {
        const sum = cell.pressures.water + cell.pressures.fire + cell.pressures.earth + cell.pressures.air;
        return Math.abs(sum - 1) < 1e-9;
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


  // Test 11: Phase 6 mesh is deterministic and topologically complete
  const test11 = () => {
    const world = generateSourceWorld({ seed: 0x2468ace0, width: 64, height: 64 });
    const mesh1 = buildWorldMesh(world);
    const mesh2 = buildWorldMesh(world);
    const expectedVertices = 64 * 64;
    const expectedTriangles = (64 - 1) * (64 - 1) * 2;
    const passed = mesh1.vertex_count === expectedVertices &&
                   mesh1.triangle_count === expectedTriangles &&
                   mesh1.vertices.length === expectedVertices * 3 &&
                   mesh1.colors.length === expectedVertices * 3 &&
                   mesh1.indices.length === expectedTriangles * 3 &&
                   JSON.stringify(mesh1) === JSON.stringify(mesh2);

    return {
      name: "Phase 6 mesh is deterministic and complete",
      passed,
      message: passed
        ? `✓ Mesh: ${mesh1.vertex_count} vertices / ${mesh1.triangle_count} triangles`
        : "✗ Mesh topology or determinism mismatch",
    };
  };
  tests.push(test11());


  // Test 12: Phase 7 mesh preserves deterministic spatial continuity metadata
  const test12 = () => {
    const world = generateSourceWorld({ seed: 0x13579bdf, width: 64, height: 64 });
    const mesh1 = buildWorldMesh(world);
    const mesh2 = buildWorldMesh(world);
    const finite = mesh1.vertices.every((value) => Number.isFinite(value));
    const bounded = mesh1.vertices.every((value, i) => i % 3 !== 1 || value >= -52 && value <= 172);
    const passed = finite && bounded && mesh1.transition_count >= 0 &&
                   mesh1.transition_count <= (63 * 64) + (64 * 63) &&
                   JSON.stringify(mesh1) === JSON.stringify(mesh2);
    return {
      name: "Phase 7 mesh continuity is deterministic and bounded",
      passed,
      message: passed
        ? `✓ Continuity verified: ${mesh1.transition_count} elemental transitions`
        : "✗ Continuity or bounds mismatch",
    };
  };
  tests.push(test12());

  await runPhase8And9Tests();
  await runPhase10Tests();
  await runPhase10AdapterTests();
  await runPhase11Tests();
  await runPhase11_2Tests();

  const lightWorld = generateSourceWorld({ seed: 0x10203040, width: 64, height: 64 });
  const lightA = buildPrismaticLightField(lightWorld, { samples: 128, phase: 0.25 });
  const lightB = buildPrismaticLightField(lightWorld, { samples: 128, phase: 0.25 });
  const lightPassed = lightA.points.length === 128 &&
    lightA.source_seed === lightB.source_seed &&
    JSON.stringify(lightA) === JSON.stringify(lightB) &&
    lightA.points.every((point) =>
      point.color.every((value) => value >= 0 && value <= 1) &&
      point.intensity >= 0 && point.intensity <= 1
    );
  tests.push({
    name: "Phase 11.3 prismatic light field is deterministic and bounded",
    passed: lightPassed,
    message: lightPassed ? "✓ Light field verified" : "✗ Light field mismatch or out of bounds",
  });
  const reactiveA = reactPrismaticLightField(lightA, { frame: 8, route_index: 4, position: { x: 0, y: 0, z: 0 } });
  const reactiveB = reactPrismaticLightField(lightA, { frame: 8, route_index: 4, position: { x: 0, y: 0, z: 0 } });
  const reactivePassed = JSON.stringify(reactiveA) === JSON.stringify(reactiveB) &&
    reactiveA.runtime_frame === 8 && reactiveA.runtime_route_index === 4 &&
    reactiveA.points.every((point) => point.intensity >= 0 && point.intensity <= 1 && point.proximity >= 0 && point.proximity <= 1);
  tests.push({
    name: "Phase 11.4 light field reacts deterministically to runtime state",
    passed: reactivePassed,
    message: reactivePassed ? "✓ Runtime reactivity verified" : "✗ Runtime reactivity mismatch",
  });
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
