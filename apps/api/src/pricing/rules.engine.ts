import { isPlainObject } from "./rules.utils";

export type ConditionOperator = ">=" | "<=" | "=" | ">" | "<" | "in" | "contains";

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | string[] | number[];
}

export interface RuleGroup {
  logic: "AND" | "OR";
  conditions: Array<RuleCondition | RuleGroup>;
}

export interface RuleSet {
  conditions: RuleGroup;
  actions: Record<string, unknown>;
}

export function evaluateRuleGroup(group: RuleGroup, context: Record<string, unknown>): boolean {
  const results = group.conditions.map((entry) => {
    if (isPlainObject(entry) && "conditions" in entry) {
      return evaluateRuleGroup(entry as RuleGroup, context);
    }

    return evaluateCondition(entry as RuleCondition, context);
  });

  if (group.logic === "AND") {
    return results.every(Boolean);
  }

  return results.some(Boolean);
}

export function evaluateCondition(condition: RuleCondition, context: Record<string, unknown>): boolean {
  const actual = context[condition.field];
  const expected = condition.value;

  switch (condition.operator) {
    case ">=":
      return Number(actual) >= Number(expected);
    case "<=":
      return Number(actual) <= Number(expected);
    case ">":
      return Number(actual) > Number(expected);
    case "<":
      return Number(actual) < Number(expected);
    case "=":
      return actual === expected;
    case "in":
      return Array.isArray(expected) ? expected.includes(actual as never) : false;
    case "contains":
      return Array.isArray(actual) ? actual.includes(expected as never) : false;
    default:
      return false;
  }
}
