import { SettingsRepository } from "./settings.repository";
import { updateSettingsSchema } from "@stock-inventra/validation";

export class SettingsService {
  constructor(private repo: SettingsRepository) {}

  async getSettings() {
    return this.repo.getSettings();
  }

  async updateSettings(data: unknown) {
    const valid = updateSettingsSchema.parse(data);
    return this.repo.updateSettings(valid as any);
  }
}
