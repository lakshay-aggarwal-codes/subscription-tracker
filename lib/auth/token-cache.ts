import * as SecureStore from "expo-secure-store";

type TokenCache = {
    getToken: (key: string) => Promise<string | null>;
    saveToken: (key: string, value: string) => Promise<void>;
    clearToken: (key: string) => Promise<void>;
};

export const tokenCache: TokenCache = {
    async getToken(key: string) {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.warn(`[auth] Failed to read token "${key}"`, error);
            return null;
        }
    },

    async saveToken(key: string, value: string) {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.warn(`[auth] Failed to save token "${key}"`, error);
        }
    },

    async clearToken(key: string) {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.warn(`[auth] Failed to clear token "${key}"`, error);
        }
    },
};