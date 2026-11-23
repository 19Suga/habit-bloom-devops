import { describe, expect, it } from 'vitest';
import { calculateStreaks, shiftDate } from '../../src/streaks.js';

describe('lógica de rachas', () => {
  it('devuelve cero cuando no existen registros', () => {
    expect(calculateStreaks([], '2026-11-22')).toEqual({ currentStreak: 0, bestStreak: 0 });
  });

  it('calcula una racha consecutiva que termina hoy', () => {
    expect(calculateStreaks(['2026-11-20', '2026-11-21', '2026-11-22'], '2026-11-22'))
      .toEqual({ currentStreak: 3, bestStreak: 3 });
  });

  it('mantiene la racha actual cuando el último registro fue ayer', () => {
    expect(calculateStreaks(['2026-11-20', '2026-11-21'], '2026-11-22'))
      .toEqual({ currentStreak: 2, bestStreak: 2 });
  });

  it('reinicia la racha actual después de un día perdido', () => {
    expect(calculateStreaks(['2026-11-17', '2026-11-18', '2026-11-19'], '2026-11-22'))
      .toEqual({ currentStreak: 0, bestStreak: 3 });
  });

  it('ignora fechas duplicadas al calcular la mejor racha', () => {
    expect(calculateStreaks(['2026-11-21', '2026-11-21', '2026-11-22'], '2026-11-22'))
      .toEqual({ currentStreak: 2, bestStreak: 2 });
  });

  it('desplaza fechas correctamente entre meses y años', () => {
    expect(shiftDate('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftDate('2026-02-28', 1)).toBe('2026-03-01');
  });
});
