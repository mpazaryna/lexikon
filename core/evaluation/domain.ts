import type { LLMResponse } from "../types.ts";
import { TemplateEvaluator, type EvaluationReport } from "./template.ts";

export interface DomainConfig {
  name: string;
  description: string;
  templatePath: string;
  outputPath: string;
  evaluationPath: string;
}

export interface DomainEvaluationResult extends EvaluationReport {
  domain: string;
  recommendations: string[];
  domainSpecificMetrics?: Record<string, number | string>;
}

export abstract class DomainEvaluator extends TemplateEvaluator {
  protected domain: string;
  protected config: DomainConfig;

  constructor(domain: string, template: string, config: DomainConfig) {
    super(template);
    this.domain = domain;
    this.config = config;
  }

  abstract initializeDomainEvaluators(): void;

  protected formatEvaluationReport(report: EvaluationReport): DomainEvaluationResult {
    return {
      ...report,
      domain: this.domain,
      recommendations: this.generateRecommendations(report),
      domainSpecificMetrics: this.getDomainSpecificMetrics(report)
    };
  }

  protected generateRecommendations(report: EvaluationReport): string[] {
    const recommendations: string[] = [];
    Object.entries(report.criteriaScores).forEach(([criterion, result]) => {
      if (result.score < 0.7) {
        recommendations.push(
          `Improve ${criterion}: ${result.details.join(". ")}${
            result.missingElements ? 
            `. Missing: ${result.missingElements.join(", ")}` : 
            ""
          }`
        );
      }
    });
    return recommendations;
  }

  protected abstract getDomainSpecificMetrics(report: EvaluationReport): Record<string, number | string>;

  public evaluateContent(response: LLMResponse): DomainEvaluationResult {
    const baseReport = this.evaluate(response);
    return this.formatEvaluationReport(baseReport);
  }

  public generateEvaluationMarkdown(result: DomainEvaluationResult): string {
    return [
      `# ${this.domain} Evaluation Results - ${result.provider.toUpperCase()}`,
      "",
      `## Overall Score: ${(result.overallScore * 100).toFixed(1)}%`,
      "",
      "## Detailed Scores",
      ...Object.entries(result.criteriaScores).map(([criterion, score]) => [
        `### ${criterion}: ${(score.score * 100).toFixed(1)}%`,
        ...score.details.map(detail => `- ${detail}`),
        score.missingElements?.length ? `- Missing: ${score.missingElements.join(", ")}` : "",
        ""
      ]).flat(),
      "## Domain-Specific Metrics",
      ...Object.entries(result.domainSpecificMetrics ?? {}).map(([metric, value]) => 
        `- ${metric}: ${value}`
      ),
      "",
      "## Recommendations",
      ...result.recommendations.map(rec => `- ${rec}`),
      "",
      "## Generation Details",
      `- Domain: ${this.domain}`,
      `- Model: ${result.model}`,
      `- Provider: ${result.provider}`,
      `- Timestamp: ${new Date(result.timestamp).toISOString()}`
    ].join("\n");
  }
} 