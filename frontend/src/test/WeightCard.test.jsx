import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeightCard from '../components/WeightCard';

const renderWeightCard = (overrides = {}) => {
  const props = {
    currentWeight: 68.5,
    weightDiff: -1.5,
    weightProgress: 50,
    targetWeight: 65,
    isLoggedToday: false,
    onAddClick: vi.fn(),
    ...overrides,
  };
  return { ...render(<WeightCard {...props} />), props };
};

describe('WeightCard Component', () => {
  it('renders tanpa error', () => {
    renderWeightCard();
  });

  it('menampilkan judul Berat Badan', () => {
    renderWeightCard();
    expect(screen.getByText('Berat Badan')).toBeInTheDocument();
  });

  it('menampilkan berat badan saat ini', () => {
    renderWeightCard();
    expect(screen.getByText('68.5')).toBeInTheDocument();
  });

  it('menampilkan satuan kg', () => {
    renderWeightCard();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('menampilkan selisih berat badan negatif (turun)', () => {
    renderWeightCard({ weightDiff: -1.5 });
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
  });

  it('menampilkan selisih berat badan positif (naik)', () => {
    renderWeightCard({ weightDiff: 2.0 });
    expect(screen.getByText('+2.0 kg')).toBeInTheDocument();
  });

  it('menampilkan label vs sebelumnya', () => {
    renderWeightCard();
    expect(screen.getByText('vs sebelumnya')).toBeInTheDocument();
  });

  it('menampilkan target berat badan', () => {
    renderWeightCard();
    expect(screen.getByText('Target: 65 kg')).toBeInTheDocument();
  });

  it('menampilkan tombol tambah berat badan saat belum dicatat', () => {
    renderWeightCard({ isLoggedToday: false });
    expect(
      screen.getByRole('button', { name: /Tambah berat badan/i })
    ).toBeInTheDocument();
  });

  it('tombol tambah berat badan aktif saat belum dicatat hari ini', () => {
    renderWeightCard({ isLoggedToday: false });
    expect(
      screen.getByRole('button', { name: /Tambah berat badan/i })
    ).toBeEnabled();
  });

  it('memanggil onAddClick saat tombol tambah diklik', () => {
    const { props } = renderWeightCard({ isLoggedToday: false });
    fireEvent.click(screen.getByRole('button', { name: /Tambah berat badan/i }));
    expect(props.onAddClick).toHaveBeenCalledTimes(1);
  });

  it('menampilkan tombol terkunci saat sudah dicatat hari ini', () => {
    renderWeightCard({ isLoggedToday: true });
    expect(
      screen.getByRole('button', { name: /Berat badan hari ini sudah dicatat/i })
    ).toBeInTheDocument();
  });

  it('tombol terkunci disabled saat sudah dicatat hari ini', () => {
    renderWeightCard({ isLoggedToday: true });
    expect(
      screen.getByRole('button', { name: /Berat badan hari ini sudah dicatat/i })
    ).toBeDisabled();
  });

  it('tidak memanggil onAddClick saat tombol terkunci diklik', () => {
    const { props } = renderWeightCard({ isLoggedToday: true });
    fireEvent.click(
      screen.getByRole('button', { name: /Berat badan hari ini sudah dicatat/i })
    );
    expect(props.onAddClick).not.toHaveBeenCalled();
  });

  it('menampilkan label Sudah dicatat hari ini saat isLoggedToday true', () => {
    renderWeightCard({ isLoggedToday: true });
    expect(screen.getByText('Sudah dicatat hari ini')).toBeInTheDocument();
  });

  it('tidak menampilkan label Sudah dicatat hari ini saat isLoggedToday false', () => {
    renderWeightCard({ isLoggedToday: false });
    expect(screen.queryByText('Sudah dicatat hari ini')).not.toBeInTheDocument();
  });

  it('menampilkan progress bar', () => {
    renderWeightCard({ weightProgress: 60 });
    const progressBar = document.querySelector('[style*="width: 60%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('menampilkan berat badan dengan satu desimal', () => {
    renderWeightCard({ currentWeight: 70 });
    expect(screen.getByText('70.0')).toBeInTheDocument();
  });
});
