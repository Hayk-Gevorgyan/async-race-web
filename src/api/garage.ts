import { Car }            from "../types/Car";
import { CarPayload }     from "../types/CarPayload";
import { PaginatedResult } from "../types/PaginatedResult";

const BASE_URL  = "http://127.0.0.1:3000";
export const PAGE_SIZE = 7;

export async function getCars(page: number): Promise<PaginatedResult<Car>> {
  const res = await fetch(`${BASE_URL}/garage?_page=${page}&_limit=${PAGE_SIZE}`);
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const data: Car[] = await res.json();
  return { data, total };
}

export async function createCar(payload: CarPayload): Promise<Car> {
  const res = await fetch(`${BASE_URL}/garage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCar(id: number, payload: CarPayload): Promise<Car> {
  const res = await fetch(`${BASE_URL}/garage/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteCar(id: number): Promise<void> {
  await fetch(`${BASE_URL}/garage/${id}`, { method: "DELETE" });
}
