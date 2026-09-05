import { describe, it, expect } from "vitest";
import { resolveMedicalRule, evaluateCriticalAlert, MEDICAL_RULES } from "@/lib/medicalRules";

describe("Medical DSL Rules Engine", () => {
  it("resolves exact and alias test names to canonical rules", () => {
    const hbRule = resolveMedicalRule("Hemoglobin");
    expect(hbRule).toBeDefined();
    expect(hbRule?.canonicalName).toBe("Hemoglobin");
    expect(hbRule?.policy).toBe("reference-range-only");

    const aliasRule = resolveMedicalRule("Blood Sugar (FBS)");
    expect(aliasRule).toBeDefined();
    expect(aliasRule?.canonicalName).toBe("Fasting Blood Glucose");
  });

  it("evaluates emergency critical thresholds", () => {
    // Hemoglobin critical low < 7.0
    const alertLow = evaluateCriticalAlert("Hemoglobin", 5.8);
    expect(alertLow.isCritical).toBe(true);
    expect(alertLow.alertMessage).toContain("CRITICAL ALERT");

    // Hemoglobin normal 13.5
    const alertNormal = evaluateCriticalAlert("Hemoglobin", 13.5);
    expect(alertNormal.isCritical).toBe(false);

    // Potassium critical high > 6.2
    const alertPotassium = evaluateCriticalAlert("Potassium", 6.8);
    expect(alertPotassium.isCritical).toBe(true);
  });

  it("enforces reference-range-only policy on major hematology panels", () => {
    expect(MEDICAL_RULES.hemoglobin.policy).toBe("reference-range-only");
    expect(MEDICAL_RULES.wbc.policy).toBe("reference-range-only");
    expect(MEDICAL_RULES.platelets.policy).toBe("reference-range-only");
  });
});
