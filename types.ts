export enum DayType {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND'
}

export interface TripLog {
  date: Date;
  startBattery: number;
  endBattery: number;
  tripName: string; // "To School" or "To Home"
  isLowBattery: boolean;
  dayType: DayType;
}

export interface SimulationResult {
  remainingTrips: number;
  lastSafeDate: Date | null;
  logs: TripLog[];
  isCritical: boolean;
}
