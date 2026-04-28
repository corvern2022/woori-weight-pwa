"use client";

import { useEffect, useRef } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function usePush(userId: string | null) {
  const registered = useRef(false);

  useEffect(() => {
    if (!userId || registered.current) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        await fetch("/api/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON(), userId }),
        });

        registered.current = true;
      } catch (e) {
        console.warn("Push registration failed:", e);
      }
    }

    register();
  }, [userId]);
}

export async function sendPushToPartner(
  partnerUserId: string,
  title: string,
  body: string
) {
  try {
    await fetch("/api/push-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: partnerUserId, title, body }),
    });
  } catch {
    // silently fail
  }
}
