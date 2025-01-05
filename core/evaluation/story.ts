import { DomainEvaluator, type DomainConfig, type DomainEvaluationResult } from "./domain.ts";
import { evaluators, type EvaluationReport } from "./template.ts";
import type { LLMResponse } from "../types.ts";

export class StoryEvaluator extends DomainEvaluator {
  constructor(template: string, config: DomainConfig) {
    super("Story", template, config);
    this.initializeDomainEvaluators();
  }

  initializeDomainEvaluators(): void {
    // Format criteria
    this.addCriterion({
      name: "Heading Format",
      description: "Checks for correct blank lines after headings",
      weight: 1,
      evaluator: evaluators.formatCompliance
    });

    this.addCriterion({
      name: "List Format",
      description: "Checks for correct list formatting",
      weight: 1,
      evaluator: evaluators.listFormatting
    });

    // Structure criteria
    this.addCriterion({
      name: "Required Sections",
      description: "Checks for presence of all required sections",
      weight: 2,
      evaluator: evaluators.sectionCompleteness
    });

    // Story-specific criteria
    this.addCriterion({
      name: "Character Development",
      description: "Evaluates character descriptions and arcs",
      weight: 3,
      evaluator: (content: string) => {
        const characterSection = content.match(/Main Characters[^]*?(?=##)/)?.[0] ?? "";
        const characters = characterSection.match(/\*\*[^*]+\*\*/g)?.length ?? 0;
        const characterDescriptions = characterSection.match(/\*\*[^*]+\*\* -[^\n]+/g)?.length ?? 0;

        return {
          score: characters > 0 ? characterDescriptions / characters : 0,
          details: [`${characterDescriptions}/${characters} characters have detailed descriptions`]
        };
      }
    });

    this.addCriterion({
      name: "Act Structure",
      description: "Checks for proper act structure with percentages",
      weight: 2,
      evaluator: (content: string) => {
        const acts = content.match(/## Act [123] - \d+%/g)?.length ?? 0;
        const expectedActs = 3;

        return {
          score: acts / expectedActs,
          details: [`${acts}/${expectedActs} acts properly structured with percentages`]
        };
      }
    });

    this.addCriterion({
      name: "Creative Elements",
      description: "Evaluates presence of creative and unique elements",
      weight: 2,
      evaluator: (content: string) => {
        const creativeElements = [
          content.includes("unique") || content.includes("unexpected"),
          content.includes("metaphor") || content.includes("symbol"),
          content.includes("surprising") || content.includes("twist"),
          content.includes("custom") || content.includes("specific detail")
        ];

        const present = creativeElements.filter(Boolean).length;

        return {
          score: present / creativeElements.length,
          details: [`${present}/${creativeElements.length} creative element types present`]
        };
      }
    });
  }

  protected getDomainSpecificMetrics(report: EvaluationReport): Record<string, number | string> {
    const characterScore = report.criteriaScores["Character Development"]?.score ?? 0;
    const actScore = report.criteriaScores["Act Structure"]?.score ?? 0;
    const creativeScore = report.criteriaScores["Creative Elements"]?.score ?? 0;

    return {
      "Character Quality": `${(characterScore * 100).toFixed(1)}%`,
      "Plot Structure": `${(actScore * 100).toFixed(1)}%`,
      "Creativity Index": `${(creativeScore * 100).toFixed(1)}%`,
      "Overall Narrative Score": `${((characterScore + actScore + creativeScore) / 3 * 100).toFixed(1)}%`
    };
  }

  public evaluateStory(response: LLMResponse): DomainEvaluationResult {
    return this.evaluateContent(response);
  }
} 