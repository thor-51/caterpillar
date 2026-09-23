/**
 * CAT Legacy - Frontend API Service & Telemetry Connector
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Machine {
  machine_id: string;
  model: string;
  year: number;
  operating_hours: number;
  fuel_efficiency_factor: number;
  hydraulic_health_index: number;
}

export interface Operator {
  operator_id: string;
  name: string;
  experience_years: number;
  skill_level: 'experienced' | 'novice';
  preferred_task: string;
  consistency: number;
  reposition_efficiency: number;
  fuel_efficiency: number;
  safety_compliance: number;
}

export interface Technique {
  technique_id: string;
  title: string;
  author_operator_id: string;
  author_name: string;
  task_type: string;
  soil_condition: string;
  load_condition: string;
  primary_phase: string;
  baseline_cohort_duration: number;
  technique_duration: number;
  advantage_pct: number;
  consistency_score: number;
  cycle_sample_count: number;
  summary: string;
  cab_coaching_prompt: string;
  discovered_at?: string;
}

export interface TechniqueDetail {
  technique: Technique;
  evidence: {
    cycle_sample_count: number;
    sample_evidence: Array<{
      cycle_id: string;
      timestamp: string;
      cycle_time_seconds: number;
      fuel_used_l: number;
      target_phase_duration: number;
      phases: Record<string, number>;
    }>;
    cohort_baseline: number;
    expert_benchmark: number;
    efficiency_gain_pct: number;
    target_phase: string;
  };
}

export interface CoachingMatch {
  match_found: boolean;
  technique?: Technique;
  operator_deviation_detected: boolean;
  deviation_pct?: number;
  gentle_coaching_message?: string;
  mentor_story?: string;
}

export interface TransferSummary {
  headline: string;
  mentor: string;
  mentor_experience: string;
  student: string;
  student_experience: string;
  task: string;
  soil: string;
  pre_coaching_reposition_median: number;
  post_coaching_reposition_median: number;
  improvement_pct: number;
  expert_cycles_mined: number;
  coached_cycles: number;
  punchline: string;
}

export interface ShiftOperationalLog {
  timestamp: string;
  machine_id: string;
  operator_id: string;
  engine_hours: float;
  fuel_used_l: float;
  load_cycles: number;
  idling_time_min: number;
  seatbelt_status: string;
  safety_alert_triggered: string;
  is_excessive_idling: boolean;
  anomaly_notes?: string;
}

export interface ProximityHazard {
  hazard_id: string;
  target_type: string;
  distance_m: number;
  azimuth_deg: number;
  zone: 'RED' | 'YELLOW' | 'GREEN';
  action_required: string;
}

export interface IdlingMetrics {
  total_idling_minutes: number;
  excessive_idling_events: number;
  estimated_fuel_wasted_liters: number;
  dpf_regeneration_risk: string;
  idle_percentage_of_shift: number;
}

export interface SafetyOverview {
  total_events: number;
  critical_events: number;
  warning_events: number;
  compliance_rankings: Array<{
    operator_id: string;
    name: string;
    skill_level: string;
    safety_compliance: number;
    incident_count: number;
  }>;
  events: Array<{
    event_id: string;
    cycle_id?: string;
    machine_id: string;
    operator_id: string;
    timestamp: string;
    event_type: string;
    severity: string;
    duration_seconds: number;
    description: string;
  }>;
  official_shift_logs: ShiftOperationalLog[];
  proximity_hazards: ProximityHazard[];
  idling_metrics: IdlingMetrics;
}

export interface LiveTelemetry {
  timestamp: string;
  cycle_id: string;
  phase: string;
  engine_rpm: number;
  fuel_rate_l_hr: number;
  hydraulic_pressure_bar: number;
  bucket_load_pct: number;
  boom_angle_deg: number;
  arm_angle_deg: number;
  bucket_angle_deg: number;
  machine_speed_kmh: number;
  seatbelt_status: string;
}

export interface DailyTask {
  task_id: string;
  title: string;
  sector: string;
  machine_id: string;
  target_distance_m?: number;
  target_volume_m3?: number;
  soil_condition: string;
  load_condition: string;
  scheduled_start: string;
  estimated_duration_hours: number;
  status: string;
  priority: string;
  technique_recommended?: string;
}

export interface TaskEstimateRequest {
  task_type: string;
  soil_condition: string;
  load_condition: string;
  target_units: number;
  weather_condition: string;
  operator_profile: string;
}

export interface TaskEstimateResponse {
  baseline_hours: number;
  coached_hours: number;
  time_saved_hours: number;
  time_saved_pct: number;
  baseline_fuel_liters: number;
  coached_fuel_liters: number;
  fuel_saved_liters: number;
  recommended_technique: string;
  confidence_interval_95: string;
  cycle_count_estimate: number;
  environmental_modifier: number;
  historical_benchmark_cycles: number;
  rationale: string;
}

export interface TrainingModule {
  module_id: string;
  title: string;
  format: 'SIMULATION' | 'VIDEO_DRILL' | 'MENTOR_WORKSHOP';
  duration_min: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'MASTER';
  technique_id?: string;
  instructor_name: string;
  rating: number;
  enrolled_count: number;
  summary: string;
  objectives: string[];
}

export interface BookingResponse {
  booking_id: string;
  status: string;
  confirmation_message: string;
  scheduled_time: string;
  instructor: string;
}

export interface SimScoreResponse {
  score: number;
  grade: string;
  passed: bool;
  feedback: string;
  delta_vs_fernandes: string;
}

type float = number;
type bool = boolean;

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getTechniques(): Promise<Technique[]> {
    const res = await fetch(`${API_BASE}/api/techniques`);
    if (!res.ok) throw new Error('Failed to fetch techniques');
    return res.json();
  },

  async getTechniqueDetail(id: string): Promise<TechniqueDetail> {
    const res = await fetch(`${API_BASE}/api/techniques/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch technique detail for ${id}`);
    return res.json();
  },

  async getOperators(): Promise<Operator[]> {
    const res = await fetch(`${API_BASE}/api/operators`);
    if (!res.ok) throw new Error('Failed to fetch operators');
    return res.json();
  },

  async getMachines(): Promise<Machine[]> {
    const res = await fetch(`${API_BASE}/api/machines`);
    if (!res.ok) throw new Error('Failed to fetch machines');
    return res.json();
  },

  async getSafetyOverview(): Promise<SafetyOverview> {
    const res = await fetch(`${API_BASE}/api/safety`);
    if (!res.ok) throw new Error('Failed to fetch safety overview');
    return res.json();
  },

  async getDailyTasks(): Promise<DailyTask[]> {
    const res = await fetch(`${API_BASE}/api/tasks`);
    if (!res.ok) throw new Error('Failed to fetch daily tasks');
    return res.json();
  },

  async estimateTaskTime(payload: TaskEstimateRequest): Promise<TaskEstimateResponse> {
    const res = await fetch(`${API_BASE}/api/tasks/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to estimate task time');
    return res.json();
  },

  async getTrainingModules(): Promise<TrainingModule[]> {
    const res = await fetch(`${API_BASE}/api/training/modules`);
    if (!res.ok) throw new Error('Failed to fetch training modules');
    return res.json();
  },

  async bookInstructor(payload: {
    operator_id: string;
    instructor_id: string;
    date: string;
    time_slot: string;
    focus_technique: string;
  }): Promise<BookingResponse> {
    const res = await fetch(`${API_BASE}/api/training/book-instructor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to book instructor');
    return res.json();
  },

  async evaluateSimulation(payload: {
    operator_id: string;
    boom_angle_used: number;
    reposition_latency_s: number;
    track_speed_kmh: number;
  }): Promise<SimScoreResponse> {
    const res = await fetch(`${API_BASE}/api/training/evaluate-sim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to evaluate simulation drill');
    return res.json();
  },

  async matchCoaching(payload: {
    operator_id: string;
    task_type: string;
    soil_condition: string;
    load_condition: string;
  }): Promise<CoachingMatch> {
    const res = await fetch(`${API_BASE}/api/coaching/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to match coaching technique');
    return res.json();
  },

  async evaluateTransfer(studentId: string) {
    const res = await fetch(`${API_BASE}/api/coaching/evaluate-transfer/${studentId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to evaluate transfer session');
    return res.json();
  },

  async getTransferSummary(): Promise<TransferSummary> {
    const res = await fetch(`${API_BASE}/api/demo/transfer-summary`);
    if (!res.ok) throw new Error('Failed to fetch transfer summary');
    return res.json();
  },

  async resetDemo() {
    const res = await fetch(`${API_BASE}/api/demo/reset`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset demo state');
    return res.json();
  },

  getStreamUrl(mode: 'live' | 'coached' = 'live', speed: number = 2.0): string {
    return `${API_BASE}/api/demo/stream?mode=${mode}&speed_factor=${speed}`;
  }
};
