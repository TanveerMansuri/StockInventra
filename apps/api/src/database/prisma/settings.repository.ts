import { SettingsRepository } from "../../modules/settings/settings.repository";
import { AppSettings } from "@stock-inventra/types";
import { prisma } from "../prisma";

export class PrismaSettingsRepository implements SettingsRepository {
  private mapToSettings(data: any): AppSettings {
    return {
      business: {
        businessName: data.businessName,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        logo: data.logo,
      },
      inventory: {
        lowStockThreshold: data.lowStockThreshold,
        defaultMargin: data.defaultMargin.toNumber(),
        defaultDiscount: data.defaultDiscount.toNumber(),
      },
      currency: {
        currency: data.currency,
        taxRate: data.taxRate.toNumber(),
      },
    };
  }

  async getSettings(tx?: any): Promise<AppSettings> {
    const client = tx || prisma;
    let settings = await client.settings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await client.settings.create({
        data: {
          businessName: "Stock Inventra",
          email: "info@stockinventra.com",
        }
      });
    }
    return this.mapToSettings(settings);
  }

  async updateSettings(data: Partial<AppSettings>, tx?: any): Promise<AppSettings> {
    const client = tx || prisma;
    // ensure settings exists
    await this.getSettings(client);
    
    const updatePayload: any = {};
    if (data.business) {
      updatePayload.businessName = data.business.businessName;
      updatePayload.email = data.business.email;
      updatePayload.phone = data.business.phone;
      updatePayload.address = data.business.address;
      updatePayload.logo = data.business.logo;
    }
    if (data.inventory) {
      updatePayload.lowStockThreshold = data.inventory.lowStockThreshold;
      updatePayload.defaultMargin = data.inventory.defaultMargin;
      updatePayload.defaultDiscount = data.inventory.defaultDiscount;
    }
    if (data.currency) {
      updatePayload.currency = data.currency.currency;
      updatePayload.taxRate = data.currency.taxRate;
    }

    const updated = await client.settings.update({
      where: { id: "global" },
      data: updatePayload,
    });

    return this.mapToSettings(updated);
  }
}
