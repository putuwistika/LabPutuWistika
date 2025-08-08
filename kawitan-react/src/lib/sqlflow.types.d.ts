export interface SQLFlowLabel {
  content: string;
}

export interface SQLFlowColumn {
  id: string;
  label: SQLFlowLabel;
}

export interface SQLFlowTable {
  id: string;
  label: SQLFlowLabel;
  columns?: SQLFlowColumn[];
  x?: number;
  y?: number;
}

export interface SQLFlowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  control?: { x: number; y: number };
}

export interface SQLFlowGraph {
  elements: {
    tables: SQLFlowTable[];
    edges: SQLFlowEdge[];
  };
}

export interface SQLFlowLineage {
  elements: {
    tables: SQLFlowTable[];
    edges: SQLFlowEdge[];
  };
}

export interface SQLFlowSummary {
  schema: number;
  process: number;
  database: number;
  view: number;
  column: number;
  relationship: number;
  table: number;
  mostRelationTables: Array<{ database: string; table: string }>;
}

export interface SQLFlowReport {
  code: number;
  data: {
    mode: string;
    graph: SQLFlowGraph;
    sqlflow?: SQLFlowLineage;
    summary: SQLFlowSummary;
  };
  sessionId: string;
}

export interface SQLFlowIndex {
  files: string[];
}
