import { SettingsRepository } from "../../modules/settings/settings.repository";
import { AppSettings } from "@stock-inventra/types";
import { memoryDb } from "./db";

export class MemorySettingsRepository implements SettingsRepository {
  async getSettings(): Promise<AppSettings> {
    return memoryDb.settings;
  }

  async updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    const updated = {
      business: { ...memoryDb.settings.business, ...data.business },
      inventory: { ...memoryDb.settings.inventory, ...data.inventory },
      currency: { ...memoryDb.settings.currency, ...data.currency },
    };
    memoryDb.settings = updated as AppSettings;
    return memoryDb.settings;
  }
}
