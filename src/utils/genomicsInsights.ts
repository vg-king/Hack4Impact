export type InsightSeverity = 'low' | 'moderate' | 'high'
export type InsightSource = 'sequence' | 'dataset' | 'notes'

export interface GenomicInsight {
  id: string
  start: number
  end: number
  title: string
  explanation: string
  severity: InsightSeverity
  source: InsightSource
}

export interface GenomicsInputPayload {
  dnaSequence: string
  datasetText: string
  notesText: string
}

export interface GenomicsAnalysisResult {
  cleanedSequence: string
  insights: GenomicInsight[]
  summary: string
}

const MAX_INSIGHTS = 8

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

function cleanSequence(sequence: string): string {
  return sequence.toUpperCase().replace(/[^ACGTN]/g, '')
}

function addKeywordInsights(
  text: string,
  source: InsightSource,
  insights: GenomicInsight[],
  offset: number,
): void {
  const normalized = text.toLowerCase()
  const rules = [
    {
      terms: ['misfold', 'misfolding', 'protein folding'],
      title: 'Protein folding caution',
      explanation:
        'Report text references folding instability. Review for possible protein misfolding susceptibility markers.',
      severity: 'moderate' as const,
    },
    {
      terms: ['frameshift', 'deletion', 'insertion'],
      title: 'Potential structural variant signal',
      explanation:
        'Input mentions sequence structure disruption terms that can align with higher-impact mutations.',
      severity: 'high' as const,
    },
    {
      terms: ['metabolism', 'cyp', 'drug response', 'adverse'],
      title: 'Pharmacogenomic relevance',
      explanation:
        'Drug-response keywords detected. Consider pharmacogenomic interpretation for medication planning.',
      severity: 'moderate' as const,
    },
  ]

  rules.forEach((rule, idx) => {
    const found = rule.terms.some((term) => normalized.includes(term))
    if (!found) return

    const start = offset + idx * 16
    insights.push({
      id: `${source}-keyword-${idx}`,
      start,
      end: start + 10,
      title: rule.title,
      explanation: rule.explanation,
      severity: rule.severity,
      source,
    })
  })
}

export function analyzeGenomicsInput(payload: GenomicsInputPayload): GenomicsAnalysisResult {
  const cleanedSequence = cleanSequence(payload.dnaSequence)
  const insights: GenomicInsight[] = []

  if (cleanedSequence.length > 0) {
    const repeatPattern = /(CAG){4,}|(CGG){4,}|(GAA){4,}/g
    let repeatMatch = repeatPattern.exec(cleanedSequence)

    while (repeatMatch && insights.length < MAX_INSIGHTS) {
      const start = repeatMatch.index
      insights.push({
        id: `seq-repeat-${start}`,
        start,
        end: start + repeatMatch[0].length,
        title: 'Expanded repeat region',
        explanation:
          'Repeated nucleotide motif detected. Expanded repeats can correlate with instability in some genomic contexts.',
        severity: 'moderate',
        source: 'sequence',
      })
      repeatMatch = repeatPattern.exec(cleanedSequence)
    }

    for (let i = 0; i < cleanedSequence.length - 30 && insights.length < MAX_INSIGHTS; i += 20) {
      const window = cleanedSequence.slice(i, i + 30)
      const gcCount = window.split('').filter((base) => base === 'G' || base === 'C').length
      const gcRatio = gcCount / window.length

      if (gcRatio > 0.75) {
        insights.push({
          id: `seq-gc-${i}`,
          start: i,
          end: i + 30,
          title: 'High GC-density segment',
          explanation:
            'A GC-rich region was identified. High GC zones may affect transcription behavior and local stability.',
          severity: 'low',
          source: 'sequence',
        })
      }
    }
  }

  addKeywordInsights(payload.datasetText, 'dataset', insights, Math.floor(cleanedSequence.length * 0.15))
  addKeywordInsights(payload.notesText, 'notes', insights, Math.floor(cleanedSequence.length * 0.65))

  if (insights.length === 0) {
    insights.push({
      id: 'fallback-stable',
      start: 8,
      end: 22,
      title: 'No strong anomaly pattern found',
      explanation:
        'Current rule-based scan found no high-confidence anomaly. Additional genomic context may reveal deeper patterns.',
      severity: 'low',
      source: 'sequence',
    })
  }

  const boundedInsights = insights.slice(0, MAX_INSIGHTS).map((insight, idx) => ({
    ...insight,
    start: clamp(insight.start, 0, Math.max(cleanedSequence.length - 1, 40)),
    end: clamp(insight.end, 1, Math.max(cleanedSequence.length, 60)),
    id: `${insight.id}-${idx}`,
  }))

  const highCount = boundedInsights.filter((item) => item.severity === 'high').length
  const moderateCount = boundedInsights.filter((item) => item.severity === 'moderate').length

  const summary =
    boundedInsights.length > 0
      ? `${boundedInsights.length} regions flagged (${highCount} high, ${moderateCount} moderate).`
      : 'No regions flagged.'

  return {
    cleanedSequence,
    insights: boundedInsights,
    summary,
  }
}