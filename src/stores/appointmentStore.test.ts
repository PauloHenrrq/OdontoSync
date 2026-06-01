import { describe, it, expect } from 'vitest';

// Lógica de carência e expiração de consultas (réplica exata das regras de negócio do Frontend)
const isAppointmentExpired = (dateStr: string, timeStr: string, now: Date): boolean => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const appointmentTime = new Date(year, month - 1, day, hours, minutes);
    const limitTime = new Date(appointmentTime.getTime() + 15 * 60 * 1000);
    return now > limitTime;
  } catch {
    return false;
  }
};

describe('Frontend Appointment Grace Period & Sorting Filter', () => {
  it('should NOT treat appointment as expired if within the 15-minute grace period', () => {
    // Consulta marcada para 14:00, e a hora atual é 14:10 (atraso de 10 minutos)
    const appointmentDate = '2026-06-01';
    const appointmentTime = '14:00';
    const now = new Date(2026, 5, 1, 14, 10); // Junho é índice 5 no construtor Date do JS

    const expired = isAppointmentExpired(appointmentDate, appointmentTime, now);
    expect(expired).toBe(false); // Falso = ainda está ativa nas "Próximas"
  });

  it('should treat appointment as expired if delay is strictly greater than 15 minutes', () => {
    // Consulta marcada para 14:00, e a hora atual é 14:16 (atraso de 16 minutos)
    const appointmentDate = '2026-06-01';
    const appointmentTime = '14:00';
    const now = new Date(2026, 5, 1, 14, 16);

    const expired = isAppointmentExpired(appointmentDate, appointmentTime, now);
    expect(expired).toBe(true); // Verdadeiro = move para "Histórico"
  });

  it('should sort future appointments in strict chronological order', () => {
    const mockAppointments = [
      { date: '2026-06-05', time: '10:00', userId: 'user-1' },
      { date: '2026-06-02', time: '14:00', userId: 'user-1' },
      { date: '2026-06-02', time: '09:00', userId: 'user-1' },
    ];

    // Lógica de ordenação idêntica à do store
    const sorted = [...mockAppointments].sort((a, b) => 
      a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

    expect(sorted[0].date).toBe('2026-06-02');
    expect(sorted[0].time).toBe('09:00');
    expect(sorted[1].date).toBe('2026-06-02');
    expect(sorted[1].time).toBe('14:00');
    expect(sorted[2].date).toBe('2026-06-05');
    expect(sorted[2].time).toBe('10:00');
  });
});
