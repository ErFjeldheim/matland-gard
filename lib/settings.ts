import { prisma } from './prisma';

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
        });
        return setting ? setting.value : defaultValue;
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return defaultValue;
    }
}

export async function getNumberSetting(key: string, defaultValue: number = 0): Promise<number> {
    const value = await getSetting(key);
    return value ? parseFloat(value) : defaultValue;
}
