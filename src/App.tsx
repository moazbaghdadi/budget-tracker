import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { UndoRedoBar } from './components/UndoRedoBar';
import { UpdateModal } from './components/UpdateModal';
import { Dashboard } from './screens/Dashboard';
import { Transactions } from './screens/Transactions';
import { CategoriesScreen } from './screens/Categories';
import { HistoryScreen } from './screens/History';
import { ImportExportScreen } from './screens/ImportExport';
import { useStore } from './lib/useStore';
import { checkForUpdate, type AvailableUpdate } from './lib/updater';
import { useT } from './i18n/LangProvider';

export default function App() {
  const store = useStore();
  const { t, tp } = useT();
  const [pendingUpdate, setPendingUpdate] = useState<AvailableUpdate | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkForUpdate()
      .then((u) => {
        if (!cancelled && u) setPendingUpdate(u);
      })
      .catch((err) => console.warn('updater check failed', err));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!store.ready) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: 18,
          color: 'var(--text-muted)',
        }}
      >
        {t('app.loading')}
      </div>
    );
  }

  function confirmDelete(id: string) {
    if (!window.confirm(t('confirm.deleteTx'))) return;
    store.deleteTx(id);
  }

  function confirmRemoveCategory(type: 'income' | 'expense', name: string) {
    if (!window.confirm(tp('confirm.deleteCat', { name }))) return;
    store.removeCategory(type, name);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar screen={store.screen} setScreen={store.setScreen} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 36px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <UndoRedoBar
            canUndo={store.canUndo}
            canRedo={store.canRedo}
            undoLabel={store.undoLabel}
            redoLabel={store.redoLabel}
            onUndo={store.undo}
            onRedo={store.redo}
          />
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 36px' }}>
          {store.screen === 'dashboard' && (
            <Dashboard transactions={store.data.tx} setScreen={store.setScreen} />
          )}
          {store.screen === 'transactions' && (
            <Transactions
              transactions={store.data.tx}
              categories={store.data.cats}
              onAdd={store.addTx}
              onEdit={store.editTx}
              onDelete={confirmDelete}
              onAddAttachment={store.addAttachment}
              onRemoveAttachment={store.removeAttachment}
            />
          )}
          {store.screen === 'categories' && (
            <CategoriesScreen
              categories={store.data.cats}
              onAdd={store.addCategory}
              onRemove={confirmRemoveCategory}
            />
          )}
          {store.screen === 'history' && (
            <HistoryScreen history={store.history} onRestore={store.restoreSnapshot} />
          )}
          {store.screen === 'import-export' && (
            <ImportExportScreen data={store.data} onImport={store.importData} />
          )}
        </div>
      </main>
      {pendingUpdate && !updateDismissed && (
        <UpdateModal update={pendingUpdate} onDismiss={() => setUpdateDismissed(true)} />
      )}
    </div>
  );
}
