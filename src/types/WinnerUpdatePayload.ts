import { Winner } from './Winner';

export type WinnerUpdatePayload = Pick<Winner, 'wins' | 'time'>;
