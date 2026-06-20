import { Winner }              from "../types/Winner";
import { WinnerCreatePayload } from "../types/WinnerCreatePayload";
import { WinnerUpdatePayload } from "../types/WinnerUpdatePayload";

const BASE_URL = "http://127.0.0.1:3000";

export async function getWinner(id: number): Promise<Winner | null> {
  const res = await fetch(`${BASE_URL}/winners/${id}`);
  if (res.status === 404) return null;
  return res.json();
}

export async function createWinner(payload: WinnerCreatePayload): Promise<Winner> {
  const res = await fetch(`${BASE_URL}/winners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateWinner(id: number, payload: WinnerUpdatePayload): Promise<Winner> {
  const res = await fetch(`${BASE_URL}/winners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
