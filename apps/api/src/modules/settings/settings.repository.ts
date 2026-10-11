import { AppSettings } from "@stock-inventra/types";

export interface SettingsRepository {
  getSettings(tx?: any): Promise<AppSettings>;
  updateSettings(data: Partial<AppSettings>, tx?: any): Promise<AppSettings>;
}
