import localforage from "localforage";
import type { StateStorage } from "zustand/middleware";

localforage.config({
    name: "infinite-canvas",
    storeName: "app_state",
});

export const localForageStorage: StateStorage = {
    getItem: async (name) => {
        if (typeof window === "undefined") return null;
        // 先尝试 IndexedDB（主存储），加超时避免 localforage 初始化卡住
        try {
            const result = await Promise.race([
                localforage.getItem<string>(name),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
            ]);
            if (result) return result;
        } catch {}
        // 兜底读取 localStorage（import-bridge 等场景写入）
        return window.localStorage.getItem(name);
    },
    setItem: async (name, value) => {
        if (typeof window === "undefined") return;
        try {
            await localforage.setItem(name, value);
        } catch {
            window.localStorage.setItem(name, value);
        }
    },
    removeItem: async (name) => {
        if (typeof window === "undefined") return;
        try {
            await localforage.removeItem(name);
        } catch {
            window.localStorage.removeItem(name);
        }
    },
};
