import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTxModal } from './AddTxModal';
import { LangProvider } from '../i18n/LangProvider';
import { messages, type Lang } from '../i18n/messages';
import type { Categories, Transaction } from '../types';

const cats: Categories = {
  income: ['التبرعات', 'رسوم العضوية'],
  expense: ['الإيجار والمرافق'],
};

function renderModal(
  opts: {
    onSubmit?: () => void;
    onClose?: () => void;
    lang?: Lang;
    initialTx?: Transaction;
  } = {},
) {
  const onSubmit = opts.onSubmit ?? vi.fn();
  const onClose = opts.onClose ?? vi.fn();
  render(
    <LangProvider initialLang={opts.lang ?? 'ar'}>
      <AddTxModal
        categories={cats}
        onSubmit={onSubmit}
        onClose={onClose}
        initialTx={opts.initialTx}
      />
    </LangProvider>,
  );
  return { onSubmit, onClose };
}

const ar = messages.ar;

describe('AddTxModal (Arabic default)', () => {
  it('shows category-required error when submitting without choosing a category', async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.save']) }));
    expect(await screen.findByRole('alert')).toHaveTextContent(ar['modal.error.pickCategory']);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows amount-required error when category is set but amount is missing', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.save']) }));
    expect(await screen.findByRole('alert')).toHaveTextContent(ar['modal.error.amount']);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the parsed payload and closes', async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'التبرعات' }));
    await user.type(screen.getByLabelText(ar['modal.field.amountShort']), '125.5');
    await user.type(screen.getByLabelText(ar['modal.field.descriptionShort']), 'تبرع تجريبي');
    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.save']) }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
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

describe('AddTxModal (edit mode)', () => {
  const seedExpense: Transaction = {
    id: 'tx-edit',
    date: '2026-04-01',
    type: 'expense',
    category: 'الإيجار والمرافق',
    description: 'إيجار أبريل',
    amount: 350,
    attachments: [],
    bucket: 'bank',
  };

  it('pre-fills all fields from initialTx and renders the edit-mode title and button', () => {
    renderModal({ initialTx: seedExpense });

    expect(screen.getByText(ar['modal.tx.editTitle'])).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(ar['modal.editSave']) }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(ar['modal.field.amountShort'])).toHaveValue(350);
    expect(screen.getByLabelText(ar['modal.field.descriptionShort'])).toHaveValue('إيجار أبريل');
    expect(screen.getByLabelText(ar['modal.field.date'])).toHaveValue('2026-04-01');
  });

  it('emits the edited values via onSubmit and calls onClose', async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderModal({ initialTx: seedExpense });

    const amountInput = screen.getByLabelText(ar['modal.field.amountShort']);
    await user.clear(amountInput);
    await user.type(amountInput, '375');

    await user.click(screen.getByRole('button', { name: new RegExp(ar['modal.editSave']) }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        category: 'الإيجار والمرافق',
        amount: 375,
        description: 'إيجار أبريل',
        bucket: 'bank',
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switching type to transfer in edit mode shows the bucket-pair UI', async () => {
    const user = userEvent.setup();
    renderModal({ initialTx: seedExpense });

    await user.click(
      screen.getByRole('button', { name: new RegExp(`^${ar['tx.typeTransfer']}$`) }),
    );
    expect(screen.getByText(ar['modal.field.fromBucket'])).toBeInTheDocument();
    expect(screen.getByText(ar['modal.field.toBucket'])).toBeInTheDocument();
  });
});
