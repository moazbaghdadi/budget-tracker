import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTxModal } from './AddTxModal';
import type { Categories } from '../types';

const cats: Categories = {
  income: ['التبرعات', 'رسوم العضوية'],
  expense: ['الإيجار والمرافق'],
};

describe('AddTxModal', () => {
  it('shows category-required error when submitting without choosing a category', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTxModal categories={cats} onAdd={onAdd} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /حفظ المعاملة/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('يرجى اختيار الفئة');
    expect(onAdd).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows amount-required error when category is set but amount is missing', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTxModal categories={cats} onAdd={onAdd} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.click(screen.getByRole('button', { name: /حفظ المعاملة/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('يرجى إدخال مبلغ صحيح');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with the parsed payload and closes', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTxModal categories={cats} onAdd={onAdd} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.type(screen.getByLabelText('المبلغ'), '125.5');
    await user.type(screen.getByLabelText('الوصف'), 'تبرع تجريبي');
    await user.click(screen.getByRole('button', { name: /حفظ المعاملة/ }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        category: 'التبرعات',
        amount: 125.5,
        description: 'تبرع تجريبي',
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switching to expense type clears the previously selected income category', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTxModal categories={cats} onAdd={onAdd} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.click(screen.getByRole('button', { name: /^مصروف$/ }));
    // Now the income category is no longer in the DOM; expense list is shown.
    expect(screen.queryByRole('button', { name: 'التبرعات' })).toBeNull();
    expect(screen.getByRole('button', { name: 'الإيجار والمرافق' })).toBeInTheDocument();
  });

  it('clicking the overlay closes the modal', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTxModal categories={cats} onAdd={onAdd} onClose={onClose} />);

    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
