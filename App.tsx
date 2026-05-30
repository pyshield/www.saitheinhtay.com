import { useAppContext } from './context/AppContext';
import { useNavigation } from './hooks';
import { ROUTES } from './constants';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Crypto } from './views/Crypto';
import { Reports } from './views/Reports';
import { PortfolioView } from './views/portfolio';
import { Home } from './views/Home';
import { Blog } from './views/Blog';
import { Projects } from './views/Projects';
import { FinancialStatement } from './views/FinancialStatement';
import { Investments } from './views/Investments';
import { Planning } from './views/Planning';
import { Contact } from './views/Contact';

function App() {
  const { activeTab, setActiveTab } = useNavigation();
  const {
    darkMode,
    setDarkMode,
    transactions,
    addTransaction,
    deleteTransaction,
    wallets,
    addWallet,
    removeWallet,
    cryptoTxs,
    addCryptoTx,
    deleteCryptoTx,
    investments,
    addInvestment,
    deleteInvestment,
    updateInvestmentPrice,
    budgets,
    addBudget,
    deleteBudget,
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
  } = useAppContext();

  const renderContent = () => {
    switch (activeTab) {
      case ROUTES.HOME:
        return <Home onNavigate={setActiveTab} />;
      case ROUTES.BLOG:
        return <Blog />;
      case ROUTES.PROJECTS:
        return <Projects />;
      case ROUTES.CONTACT:
        return <Contact />;
      case ROUTES.DASHBOARD:
        return <Dashboard transactions={transactions} budgets={budgets} />;
      case ROUTES.PORTFOLIO:
        return <PortfolioView transactions={transactions} cryptoTransactions={cryptoTxs} investments={investments} />;
      case ROUTES.TRANSACTIONS:
        return (
          <Transactions 
            transactions={transactions} 
            onAdd={addTransaction} 
            onDelete={deleteTransaction} 
          />
        );
      case ROUTES.INVESTMENTS:
        return (
          <Investments
            investments={investments}
            onAdd={addInvestment}
            onDelete={deleteInvestment}
            onUpdatePrice={updateInvestmentPrice}
          />
        );
      case ROUTES.CRYPTO:
        return (
          <Crypto 
            wallets={wallets}
            transactions={cryptoTxs}
            onAddWallet={addWallet}
            onRemoveWallet={removeWallet}
            onAddTransaction={addCryptoTx}
            onDeleteTransaction={deleteCryptoTx}
          />
        );
      case ROUTES.REPORTS:
        return <Reports transactions={transactions} />;
      case ROUTES.STATEMENTS:
        return <FinancialStatement transactions={transactions} cryptoTransactions={cryptoTxs} />;
      case ROUTES.PLANNING:
        return (
          <Planning 
            budgets={budgets}
            goals={goals}
            transactions={transactions}
            onAddBudget={addBudget}
            onDeleteBudget={deleteBudget}
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            onUpdateGoal={updateGoal}
          />
        );
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;