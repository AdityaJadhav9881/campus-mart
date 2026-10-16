import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authLogin,
  authRegister,
  authSendOtp,
  authVerifyOtp,
} from "../api/client.js";

const STORAGE_KEY = "campusmart.auth.v1";
const SYNC_EVENT = "campusmart:auth-changed";

export const DEMO_STUDENT = {
  name: "Aditya Jadhav",
  email: "aditya.jadhav@campus.edu",
  password: "Campus@123",
};

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.token || !parsed.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(session) {
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode — session stays in memory only */
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
}

export function useAuth() {
  const [session, setSession] = useState(() => readStored());

  useEffect(() => {
    const onSync = () => setSession(readStored());
    window.addEventListener(SYNC_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  const startSession = useCallback((token, user) => {
    if (!token) return false;
    const next = {
      token,
      user: {
        name: user?.name || user?.email || "Student",
        email: user?.email || "",
        id: user?.id ?? null,
      },
    };
    writeStored(next);
    setSession(next);
    return true;
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      const { token, user } = await authLogin({ email, password });
      if (!startSession(token, user)) {
        throw new Error("Sign in succeeded but no session token was returned.");
      }
      return user;
    },
    [startSession]
  );

  const sendOtp = useCallback(async ({ email }) => authSendOtp({ email }), []);

  const verifyOtp = useCallback(
    async ({ email, otp, name, password }) => {
      const { token, user } = await authVerifyOtp({ email, otp, name, password });
      if (!startSession(token, user)) {
        throw new Error("Verification succeeded but no session token was returned.");
      }
      return user;
    },
    [startSession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const { token, user } = await authRegister({ name, email, password });
      if (!startSession(token, user)) {
        throw new Error("Sign up succeeded but no session token was returned.");
      }
      return user;
    },
    [startSession]
  );

  const signOut = useCallback(() => {
    writeStored(null);
    setSession(null);
  }, []);

  return useMemo(
    () => ({
      signedIn: Boolean(session?.token),
      token: session?.token ?? null,
      user: session?.user ?? null,
      signIn,
      sendOtp,
      verifyOtp,
      register,
      signOut,
    }),
    [session, signIn, sendOtp, verifyOtp, register, signOut]
  );
}
