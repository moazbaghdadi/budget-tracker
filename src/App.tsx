import { Sidebar } from './components/Sidebar';
import { Dashboard } from './screens/Dashboard';
import { Transactions } from './screens/Transactions';
import { CategoriesScreen } from './screens/Categories';
import { useStore } from './lib/useStore';

export default function App() {
  const store = useStore();

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
        جاري تحميل البيانات…
      </div>
    );
  }

  function confirmDelete(id: string) {
    if (!window.confirm('هل تريد حذف هذه المعاملة؟')) return;
    store.deleteTx(id);
  }

  function confirmRemoveCategory(type: 'income' | 'expense', name: string) {
    if (!window.confirm(`هل تريد حذف الفئة "${name}"؟`)) return;
    store.removeCategory(type, name);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar screen={store.screen} setScreen={store.setScreen} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 36px' }}>
          {store.screen === 'dashboard' && (
            <Dashboard transactions={store.data.tx} setScreen={store.setScreen} />
          )}
          {store.screen === 'transactions' && (
            <Transactions
              transactions={store.data.tx}
              categories={store.data.cats}
              onAdd={store.addTx}
              onDelete={confirmDelete}
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
            <div
              style={{
                padding: 24,
                color: 'var(--text-muted)',
                fontSize: 16,
              }}
            >
              شاشة "السجل" قادمة في الخطوة التالية.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
