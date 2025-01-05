import type { YogaConfig, YogaResult } from "../generators/yoga.ts";
import { YogaImprover } from "../generators/yoga.ts";

export async function improveYogaSequence(
  config: YogaConfig,
  previousEvaluation: YogaResult["evaluation"]
): Promise<YogaResult> {
  const improver = new YogaImprover(config, previousEvaluation);
  return improver.improve();
} 