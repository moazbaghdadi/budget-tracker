import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTxModal } from './AddTxModal';
import { LangProvider } from '../i18n/LangProvider';
import { messages, type Lang } from '../i18n/messages';
import type { Categories } from '../types';

const cats: Categories = {
  income: ['التبرعات', 'رسوم العضوية'],
  expense: ['الإيجار والمرافق'],
};

function renderModal(
  opts: { onAdd?: () => void; onClose?: () => void; lang?: Lang } = {},
) {
  const onAdd = opts.onAdd ?? vi.fn();
  const onClose = opts.onClose ?? vi.fn();
  render(
    <LangProvider initialLang={opts.lang ?? 'ar'}>
      <AddTxModal categories={cats} onAdd={onAdd} onClose={onClose} />
    </LangProvider>,
  );
  return { onAdd, onClose };
}

const ar = messages.ar;

describe('AddTxModal (Arabic default)', () => {
  it('shows category-required error when submitting without choosing a category', async () => {
    const user = userEvent.setup();
    const { onAdd, onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.save']) }));
    expect(await screen.findByRole('alert')).toHaveTextContent(ar['modal.error.pickCategory']);
    expect(onAdd).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows amount-required error when category is set but amount is missing', async () => {
    const user = userEvent.setup();
    const { onAdd } = renderModal();

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.save']) }));
    expect(await screen.findByRole('alert')).toHaveTextContent(ar['modal.error.amount']);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with the parsed payload and closes', async () => {
    const user = userEvent.setup();
    const { onAdd, onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.type(screen.getByLabelText(ar['modal.field.amountShort']), '125.5');
    await user.type(screen.getByLabelText(ar['modal.field.descriptionShort']), 'تبرع تجريبي');
    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.save']) }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        category: 'التبرعات',
        amount: 125.5,
        description: 'تبرع تجريبي',
        attachments: [],
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switching to expense type clears the previously selected income category', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.click(screen.getByRole('button', { name: new RegExp(`^${ar['tx.typeExpense']}$`) }));
    expect(screen.queryByRole('button', { name: 'التبرعات' })).toBeNull();
    expect(screen.getByRole('button', { name: 'الإيجار والمرافق' })).toBeInTheDocument();
  });

  it('clicking the overlay closes the modal', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AddTxModal (German)', () => {
  it('renders German labels when lang is set to de', () => {
    renderModal({ lang: 'de' });
    expect(screen.getByText(messages.de['modal.tx.title'])).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(messages.de['modal.save']) }),
    ).toBeInTheDocument();
  });
});
