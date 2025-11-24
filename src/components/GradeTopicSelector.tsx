import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export interface CurriculumTopic {
  id: string;
  name: string;
  grade: string;
}

export const curriculumTopics: Record<string, CurriculumTopic[]> = {
  "6": [
    { id: "6-fractions", name: "Fractions & Decimals", grade: "6" },
    { id: "6-ratios", name: "Ratios & Proportions", grade: "6" },
    { id: "6-integers", name: "Integers & Operations", grade: "6" },
    { id: "6-geometry", name: "Area & Volume", grade: "6" },
  ],
  "7": [
    { id: "7-algebra", name: "Basic Algebra", grade: "7" },
    { id: "7-equations", name: "Linear Equations", grade: "7" },
    { id: "7-probability", name: "Probability & Statistics", grade: "7" },
    { id: "7-geometry", name: "Geometric Shapes", grade: "7" },
  ],
  "8": [
    { id: "8-functions", name: "Functions", grade: "8" },
    { id: "8-systems", name: "Systems of Equations", grade: "8" },
    { id: "8-pythagorean", name: "Pythagorean Theorem", grade: "8" },
    { id: "8-exponents", name: "Exponents & Radicals", grade: "8" },
  ],
  "9": [
    { id: "9-polynomials", name: "Polynomials", grade: "9" },
    { id: "9-quadratics", name: "Quadratic Equations", grade: "9" },
    { id: "9-transformations", name: "Transformations", grade: "9" },
    { id: "9-data", name: "Data Analysis", grade: "9" },
  ],
  "10": [
    { id: "10-trig", name: "Trigonometry Basics", grade: "10" },
    { id: "10-sequences", name: "Sequences & Series", grade: "10" },
    { id: "10-circles", name: "Circle Geometry", grade: "10" },
    { id: "10-rational", name: "Rational Expressions", grade: "10" },
  ],
  "11": [
    { id: "11-calculus-prep", name: "Pre-Calculus", grade: "11" },
    { id: "11-vectors", name: "Vectors", grade: "11" },
    { id: "11-trig-adv", name: "Advanced Trigonometry", grade: "11" },
    { id: "11-exponential", name: "Exponential Functions", grade: "11" },
  ],
  "12": [
    { id: "12-derivatives", name: "Derivatives", grade: "12" },
    { id: "12-integrals", name: "Integrals", grade: "12" },
    { id: "12-limits", name: "Limits", grade: "12" },
    { id: "12-applications", name: "Calculus Applications", grade: "12" },
  ],
};

interface GradeTopicSelectorProps {
  selectedGrade: string;
  selectedTopic: string;
  onGradeChange: (grade: string) => void;
  onTopicChange: (topic: string) => void;
}

export const GradeTopicSelector = ({
  selectedGrade,
  selectedTopic,
  onGradeChange,
  onTopicChange,
}: GradeTopicSelectorProps) => {
  const topics = curriculumTopics[selectedGrade] || [];

  return (
    <Card className="p-4 bg-accent/5 border-accent">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Grade Level</label>
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Grade 6</SelectItem>
              <SelectItem value="7">Grade 7</SelectItem>
              <SelectItem value="8">Grade 8</SelectItem>
              <SelectItem value="9">Grade 9</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="11">Grade 11</SelectItem>
              <SelectItem value="12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Curriculum Topic</label>
          <Select value={selectedTopic} onValueChange={onTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
