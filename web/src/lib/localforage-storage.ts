import localforage from "localforage";
import type { StateStorage } from "zustand/middleware";

localforage.config({
    name: "infinite-canvas",
    storeName: "app_state",
});

export const localForageStorage: StateStorage = {
    getItem: async (name) => {
        if (typeof window === "undefined") return null;
        // 先读 localStorage（import-bridge 等场景写入，速度最快）
        const ls = window.localStorage.getItem(name);
        if (ls) return ls;
        // 再尝试 IndexedDB（主存储，异步较慢）
        try {
            const value = await localforage.getItem<string>(name);
            if (value) return value;
        } catch {}
        return null;
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
