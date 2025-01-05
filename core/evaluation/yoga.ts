import { DomainEvaluator, type DomainConfig, type DomainEvaluationResult } from "./domain.ts";
import { evaluators, type EvaluationReport } from "./template.ts";
import type { LLMResponse } from "../types.ts";

export class YogaEvaluator extends DomainEvaluator {
  constructor(template: string, config: DomainConfig) {
    super("Yoga", template, config);
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

    // Yoga-specific criteria
    this.addCriterion({
      name: "Sanskrit Names",
      description: "Checks for proper Sanskrit pose naming",
      weight: 2,
      evaluator: (content: string) => {
        const poses = content.match(/\([A-Z][a-z]+ [A-Z][a-z]+\)/g)?.length ?? 0;
        const totalPoses = content.match(/\*\s+[A-Z][a-z]+/g)?.length ?? 1;

        return {
          score: poses / totalPoses,
          details: [`${poses}/${totalPoses} poses have Sanskrit names`]
        };
      }
    });

    this.addCriterion({
      name: "Sequence Structure",
      description: "Evaluates sequence organization and flow",
      weight: 3,
      evaluator: (content: string) => {
        const sections = [
          "Opening",
          "Warm-Up",
          "Main Practice",
          "Cool Down",
          "Closing"
        ];

        const foundSections = sections.filter(section => 
          content.includes(section)
        );

        return {
          score: foundSections.length / sections.length,
          details: [`${foundSections.length}/${sections.length} sequence sections present`],
          matches: foundSections,
          missingElements: sections.filter(s => !foundSections.includes(s))
        };
      }
    });

    this.addCriterion({
      name: "Alignment Cues",
      description: "Checks for detailed alignment instructions",
      weight: 2,
      evaluator: (content: string) => {
        const alignmentSection = content.match(/ALIGNMENT CUES[^]*?(?=###)/i)?.[0] ?? "";
        const cues = alignmentSection.match(/^\* [^\n]+/gm)?.length ?? 0;
        const expectedCues = 10; // Minimum expected alignment cues

        return {
          score: Math.min(cues / expectedCues, 1),
          details: [`${cues} alignment cues provided (minimum ${expectedCues} expected)`]
        };
      }
    });

    this.addCriterion({
      name: "Safety Guidelines",
      description: "Evaluates presence of safety instructions",
      weight: 3,
      evaluator: (content: string) => {
        const safetyElements = [
          content.includes("contraindication"),
          content.includes("modification"),
          content.includes("prop"),
          content.includes("adjustment")
        ];

        const present = safetyElements.filter(Boolean).length;

        return {
          score: present / safetyElements.length,
          details: [`${present}/${safetyElements.length} safety elements present`]
        };
      }
    });
  }

  protected getDomainSpecificMetrics(report: EvaluationReport): Record<string, number | string> {
    const sanskritScore = report.criteriaScores["Sanskrit Names"]?.score ?? 0;
    const sequenceScore = report.criteriaScores["Sequence Structure"]?.score ?? 0;
    const alignmentScore = report.criteriaScores["Alignment Cues"]?.score ?? 0;
    const safetyScore = report.criteriaScores["Safety Guidelines"]?.score ?? 0;

    return {
      "Traditional Authenticity": `${(sanskritScore * 100).toFixed(1)}%`,
      "Sequence Quality": `${(sequenceScore * 100).toFixed(1)}%`,
      "Technical Precision": `${(alignmentScore * 100).toFixed(1)}%`,
      "Safety Index": `${(safetyScore * 100).toFixed(1)}%`,
      "Overall Practice Score": `${((sanskritScore + sequenceScore + alignmentScore + safetyScore) / 4 * 100).toFixed(1)}%`
    };
  }

  public evaluateYogaSequence(response: LLMResponse): DomainEvaluationResult {
    return this.evaluateContent(response);
  }
} 