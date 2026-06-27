import { Winner } from '../types/Winner';
import { WinnerCreatePayload } from '../types/WinnerCreatePayload';
import { WinnerUpdatePayload } from '../types/WinnerUpdatePayload';
import { WinnersQuery } from '../types/WinnersQuery';
import { PaginatedResult } from '../types/PaginatedResult';

const BASE_URL = 'http://127.0.0.1:3000';

export async function getWinners(query: WinnersQuery): Promise<PaginatedResult<Winner>> {
  const params = new URLSearchParams();
  if (query._page !== undefined) params.set('_page', String(query._page));
  if (query._limit !== undefined) params.set('_limit', String(query._limit));
  if (query._sort) params.set('_sort', query._sort);
  if (query._order) params.set('_order', query._order);
  const res = await fetch(`${BASE_URL}/winners?${params}`);
  const total = Number(res.headers.get('X-Total-Count') ?? 0);
  const data: Winner[] = await res.json();
  return { data, total };
}

export async function getWinner(id: number): Promise<Winner | null> {
  const res = await fetch(`${BASE_URL}/winners/${id}`);
  if (res.status === 404) return null;
  return res.json();
}

export async function createWinner(payload: WinnerCreatePayload): Promise<Winner> {
  const res = await fetch(`${BASE_URL}/winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateWinner(id: number, payload: WinnerUpdatePayload): Promise<Winner> {
  const res = await fetch(`${BASE_URL}/winners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteWinner(id: number): Promise<void> {
  await fetch(`${BASE_URL}/winners/${id}`, { method: 'DELETE' });
}
