import { EngineStartedResponse } from '../types/EngineStartedResponse';
import { EngineDriveResponse } from '../types/EngineDriveResponse';

const BASE_URL = 'http://127.0.0.1:3000';

export async function startEngine(id: number): Promise<EngineStartedResponse> {
  const res = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, { method: 'PATCH' });
  return res.json();
}

export async function driveEngine(id: number, signal: AbortSignal): Promise<EngineDriveResponse> {
  const res = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, { method: 'PATCH', signal });
  if (!res.ok) throw new Error('ENGINE_BROKEN');
  return res.json();
}

export async function stopEngine(id: number): Promise<void> {
  await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, { method: 'PATCH' });
}
