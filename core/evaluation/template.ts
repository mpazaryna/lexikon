import type { LLMResponse } from "../types.ts";

export interface EvaluationCriteria {
  name: string;
  description: string;
  weight: number;
  evaluator: (content: string) => EvaluationResult;
}

export interface EvaluationResult {
  score: number; // 0-1 score
  details: string[];
  matches?: string[];
  missingElements?: string[];
}

export interface TemplateRequirement {
  type: "format" | "content" | "creative" | "structure";
  name: string;
  description: string;
  required: boolean;
  pattern?: RegExp;
}

export interface EvaluationReport {
  overallScore: number;
  criteriaScores: Record<string, EvaluationResult>;
  timestamp: number;
  model: string;
  provider: string;
}

export class TemplateEvaluator {
  private requirements: TemplateRequirement[];
  private criteria: EvaluationCriteria[];

  constructor(template: string) {
    this.requirements = [];
    this.criteria = [];
    this.parseRequirements(template);
  }

  private parseRequirements(template: string) {
    // Parse format requirements
    const formatReqs = template.match(/FORMATTING REQUIREMENTS:[^]*?(?=\n\n)/)?.[0];
    if (formatReqs) {
      this.addFormatRequirements(formatReqs);
    }

    // Parse creative requirements
    const creativeReqs = template.match(/CREATIVE.*?DIRECTIVES:[^]*?(?=\n\n)/)?.[0];
    if (creativeReqs) {
      this.addCreativeRequirements(creativeReqs);
    }

    // Parse structural requirements
    const structureReqs = template.match(/should include:[^]*?(?=\n\n)/)?.[0];
    if (structureReqs) {
      this.addStructuralRequirements(structureReqs);
    }
  }

  private addFormatRequirements(section: string) {
    const requirements = section.match(/- [^\n]+/g) ?? [];
    for (const req of requirements) {
      this.requirements.push({
        type: "format",
        name: req.replace(/^- /, ""),
        description: req,
        required: true
      });
    }
  }

  private addCreativeRequirements(section: string) {
    const requirements = section.match(/\* [^\n]+/g) ?? [];
    for (const req of requirements) {
      this.requirements.push({
        type: "creative",
        name: req.replace(/^\* /, ""),
        description: req,
        required: true
      });
    }
  }

  private addStructuralRequirements(section: string) {
    const requirements = section.match(/[0-9]+\. [^\n]+/g) ?? [];
    for (const req of requirements) {
      this.requirements.push({
        type: "structure",
        name: req.replace(/^[0-9]+\. /, ""),
        description: req,
        required: true
      });
    }
  }

  public evaluate(response: LLMResponse): EvaluationReport {
    const results: Record<string, EvaluationResult> = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const criterion of this.criteria) {
      const result = criterion.evaluator(response.content);
      results[criterion.name] = result;
      totalScore += result.score * criterion.weight;
      totalWeight += criterion.weight;
    }

    return {
      overallScore: totalScore / totalWeight,
      criteriaScores: results,
      timestamp: Date.now(),
      model: response.model ?? "unknown",
      provider: response.provider ?? "unknown"
    };
  }

  public addCriterion(criterion: EvaluationCriteria) {
    this.criteria.push(criterion);
  }
}

// Default evaluators for common criteria
export const evaluators = {
  formatCompliance: (content: string): EvaluationResult => {
    const blankLineAfterHeading = content.match(/^#.*\n\n/gm)?.length ?? 0;
    const totalHeadings = content.match(/^#/gm)?.length ?? 1;
    
    return {
      score: blankLineAfterHeading / totalHeadings,
      details: [`${blankLineAfterHeading}/${totalHeadings} headings have correct blank lines`]
    };
  },

  listFormatting: (content: string): EvaluationResult => {
    const correctLists = content.match(/^\* [^\n]+(?:\n(?!\n)[^\n]+)*/gm)?.length ?? 0;
    const totalLists = content.match(/^\*/gm)?.length ?? 1;

    return {
      score: correctLists / totalLists,
      details: [`${correctLists}/${totalLists} lists are correctly formatted`]
    };
  },

  sectionCompleteness: (content: string): EvaluationResult => {
    const requiredSections = [
      "Main Characters",
      "Act 1",
      "Act 2",
      "Act 3"
    ];

    const foundSections = requiredSections.filter(section => 
      content.includes(section)
    );

    return {
      score: foundSections.length / requiredSections.length,
      details: [`${foundSections.length}/${requiredSections.length} required sections present`],
      matches: foundSections,
      missingElements: requiredSections.filter(s => !foundSections.includes(s))
    };
  }
}; 