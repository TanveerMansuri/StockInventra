import { AppSettings } from "@stock-inventra/types";

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  updateSettings(data: Partial<AppSettings>): Promise<AppSettings>;
}
