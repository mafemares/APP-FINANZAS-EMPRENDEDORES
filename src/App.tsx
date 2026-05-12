import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  MinusCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon,
  Trash2,
  Moon,
  Sun,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  History,
  Settings,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Transaction, TransactionType, ExpenseCategory, FinancialSummary } from './types.ts';
import { cn, formatCurrency } from './lib/utils.ts';

type ViewType = 'dashboard' | 'history' | 'analytics' | 'suggestions' | 'settings';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finanzapro_transactions');
    try {
      return saved ? JSON.parse(saved).map((t: any) => ({ ...t, date: new Date(t.date) })) : [];
    } catch {
      return [];
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('finanzapro_theme') === 'dark';
  });
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState<ExpenseCategory>('Otros');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    localStorage.setItem('finanzapro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finanzapro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finanzapro_theme', 'light');
    }
  }, [darkMode]);

  const summary = useMemo(() => {
    if (transactions.length === 0) return null;
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const netResult = totalIncome - totalExpenses;
    
    let status: 'profit' | 'low-profit' | 'loss' = 'profit';
    if (netResult < 0) {
      status = 'loss';
    } else if (netResult < totalIncome * 0.1) {
      status = 'low-profit';
    }

    return { totalIncome, totalExpenses, netResult, status } as FinancialSummary;
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Por favor ingresa un valor válido.");
      return;
    }
    
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      description: description || (type === 'income' ? 'Ingreso General' : 'Gasto General'),
      category: type === 'expense' ? category : undefined,
      date: new Date(),
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setDescription('');
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const chartData = useMemo(() => {
    const categories: ExpenseCategory[] = ['Materiales', 'Transporte', 'Servicios', 'Marketing', 'Otros'];
    return categories.map(cat => ({
      name: cat,
      value: transactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((acc, t) => acc + t.amount, 0)
    })).filter(d => d.value > 0);
  }, [transactions]);

  const getRecommendation = () => {
    if (!summary) return null;
    if (summary.status === 'loss') {
      return {
        title: "¡Atención!",
        message: "Tus gastos son mayores que tus ingresos. Se recomienda reducir gastos innecesarios y analizar las categorías con mayores egresos inmediatamente.",
        variant: "error"
      };
    }
    if (summary.status === 'low-profit') {
      return {
        title: "Recomendación",
        message: "Tu margen de ganancia es bajo. Podrías aumentar tus ingresos implementando nuevas promociones o controlando mejor los gastos operativos.",
        variant: "warning"
      };
    }
    return {
      title: "Buen Trabajo",
      message: "¡Excelente trabajo! Tu negocio está generando ganancias positivas. Continúa administrando correctamente tus recursos para seguir creciendo.",
      variant: "success"
    };
  };

  const recommendation = getRecommendation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'suggestions', label: 'Sugerencias', icon: Sparkles },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu size={24} className="text-gray-600 dark:text-slate-300" />
            </button>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Wallet size={18} />
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 hidden sm:block">
              FinanzaPro
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Cambiar tema"
            >
              {darkMode ? <Sun className="text-amber-400" size={20} /> : <Moon className="text-slate-600" size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-50 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <Wallet size={24} />
                  </div>
                  <span className="font-display font-bold text-xl dark:text-white">FinanzaPro</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 flex-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ViewType);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold",
                      activeView === item.id 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                        : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <item.icon size={22} strokeWidth={activeView === item.id ? 2.5 : 2} />
                    {item.label}
                    {activeView === item.id && (
                      <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-6 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-4">Membresía</p>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-3xl text-white relative overflow-hidden group">
                   <div className="relative z-10">
                    <p className="font-bold text-sm mb-1">Plan Emprendedor</p>
                    <p className="text-slate-400 text-xs mb-4">Sube de nivel tus finanzas</p>
                    <button className="w-full py-2 bg-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors">
                      Upgrade PRO
                    </button>
                   </div>
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/30 transition-colors" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <section className="mb-8">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Tu aliado financiero</p>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Dashboard Principal</h2>
              </section>

              {/* Quick Transaction Card */}
              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                  <PlusCircle size={20} className="text-emerald-500" />
                  Nuevo Movimiento
                </h3>
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
                  <button 
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm",
                      type === 'income' ? "bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-slate-400"
                    )}
                  >
                    <PlusCircle size={18} />
                    Ingreso
                  </button>
                  <button 
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm",
                      type === 'expense' ? "bg-white dark:bg-slate-700 shadow-md text-brand-red" : "text-gray-500 dark:text-slate-400"
                    )}
                  >
                    <MinusCircle size={18} />
                    Gasto
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 ml-1">Valor</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        required
                        className="w-full pl-10 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-[1.25rem] focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all text-2xl font-display font-bold placeholder:text-gray-300 dark:placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  {type === 'expense' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 ml-1">Categoría</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-[1.25rem] focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all font-medium appearance-none"
                      >
                        <option value="Materiales">Materiales</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 ml-1">Descripción</label>
                    <input 
                      type="text" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej. Venta del día..."
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-[1.25rem] focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all font-medium"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-bold text-lg rounded-[1.25rem] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                  >
                    Agregar {type === 'income' ? 'Ingreso' : 'Gasto'}
                    <PlusCircle size={22} strokeWidth={2.5} />
                  </button>
                </form>
              </section>

              {/* Click to see summary toggle */}
              <div className="pt-4">
                <button 
                  onClick={() => setShowSummary(!showSummary)}
                  disabled={transactions.length === 0}
                  className={cn(
                    "w-full group py-6 px-8 rounded-[2rem] font-display font-bold text-xl flex items-center justify-between transition-all active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none",
                    showSummary ? "bg-emerald-600 text-white" : "bg-slate-900 dark:bg-slate-800 text-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl shadow-lg transition-colors",
                      showSummary ? "bg-white/20" : "bg-emerald-500 shadow-emerald-500/30"
                    )}>
                      <LayoutDashboard size={24} />
                    </div>
                    {showSummary ? 'Ocultar Resumen' : 'Ver Resumen Hoy'}
                  </div>
                  <ChevronRight size={28} className={cn("transition-transform", showSummary ? "rotate-90" : "group-hover:translate-x-1")} />
                </button>
              </div>

              {/* Dynamic Summary result */}
              <AnimatePresence>
                {showSummary && summary && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    id="summary-section"
                    className="space-y-6 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
                           <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Ingresos</p>
                           <p className="text-xl font-display font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(summary.totalIncome)}</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/50">
                           <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-1">Gastos</p>
                           <p className="text-xl font-display font-bold text-rose-900 dark:text-rose-100">{formatCurrency(summary.totalExpenses)}</p>
                        </div>
                    </div>
                    
                    <div className={cn(
                      "p-6 rounded-[2rem] border flex items-center justify-between",
                      summary.netResult >= 0 ? "bg-emerald-500 text-white border-emerald-600" : "bg-rose-500 text-white border-rose-600"
                    )}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Resultado Neto</p>
                        <p className="text-2xl font-display font-bold">{formatCurrency(summary.netResult)}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        {summary.netResult >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveView('suggestions')}
                      className="w-full py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-emerald-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        Ver recomendaciones de IA
                        <Sparkles size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="mb-8">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Transacciones</p>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Historial Financiero</h2>
              </section>

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                    <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Sin movimientos aún.</p>
                  </div>
                ) : (
                  transactions.map((t) => (
                    <motion.div 
                      key={t.id}
                      layout
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          t.type === 'income' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-rose-50 text-brand-red dark:bg-rose-950/40"
                        )}>
                          {t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-slate-100">{t.description}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <p className={cn(
                          "font-display font-bold text-lg",
                          t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-brand-red font-bold"
                        )}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </p>
                        <button onClick={() => removeTransaction(t.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="mb-8">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Visualización</p>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Análisis de Gastos</h2>
              </section>

              {chartData.length > 0 ? (
                <div className="space-y-8">
                   {/* Summary Bars */}
                   {summary && (
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                           <TrendingUp size={20} className="text-emerald-500" />
                           Resumen General
                        </h4>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <div className="flex justify-between text-sm font-bold">
                                 <span className="text-gray-500">Ingresos vs Gastos</span>
                                 <span className="dark:text-white">{Math.round((summary.totalExpenses / (summary.totalIncome || 1)) * 100)}% de gastos</span>
                              </div>
                              <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                 <div 
                                   className="h-full bg-emerald-500 transition-all duration-1000" 
                                   style={{ width: `${Math.min(100, (summary.totalIncome / (summary.totalIncome + summary.totalExpenses || 1)) * 100)}%` }} 
                                 />
                                 <div 
                                   className="h-full bg-rose-500 transition-all duration-1000" 
                                   style={{ width: `${Math.min(100, (summary.totalExpenses / (summary.totalIncome + summary.totalExpenses || 1)) * 100)}%` }} 
                                 />
                              </div>
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest pt-1">
                                 <span className="text-emerald-600">Ingresos</span>
                                 <span className="text-rose-600">Gastos</span>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
                    <h4 className="text-lg font-bold mb-8 dark:text-white flex items-center gap-2">
                       <PieChartIcon size={20} className="text-emerald-500" />
                       Distribución por Categoría
                    </h4>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'][index % 5]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {chartData.map((cat, i) => (
                       <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'][i % 5] }} />
                             <p className="font-bold dark:text-white">{cat.name}</p>
                          </div>
                          <p className="font-display font-bold text-gray-500">{formatCurrency(cat.value)}</p>
                       </div>
                     ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                   <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
                   <p className="text-gray-500">Agrega gastos para ver el análisis.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="mb-8">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">IA Inteligente</p>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Recomendaciones</h2>
              </section>

              {transactions.length > 0 ? (
                <div className="space-y-6">
                  {/* Dynamic Recommendation Card */}
                  {summary ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-8 rounded-[2.5rem] border shadow-lg relative overflow-hidden",
                        summary.status === 'loss' ? "bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50" :
                        summary.status === 'low-profit' ? "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50" :
                        "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50"
                      )}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "p-2 rounded-xl",
                            summary.status === 'loss' ? "bg-rose-500 text-white" :
                            summary.status === 'low-profit' ? "bg-amber-500 text-white" :
                            "bg-emerald-500 text-white"
                          )}>
                            <Sparkles size={20} />
                          </div>
                          <h3 className={cn(
                            "text-xl font-bold font-display",
                            summary.status === 'loss' ? "text-rose-900 dark:text-rose-100" :
                            summary.status === 'low-profit' ? "text-amber-900 dark:text-amber-100" :
                            "text-emerald-900 dark:text-emerald-100"
                          )}>
                            {recommendation?.title}
                          </h3>
                        </div>
                        <p className={cn(
                          "text-lg leading-relaxed mb-6",
                          summary.status === 'loss' ? "text-rose-800 dark:text-rose-200" :
                          summary.status === 'low-profit' ? "text-amber-800 dark:text-amber-200" :
                          "text-emerald-800 dark:text-emerald-200"
                        )}>
                          {recommendation?.message}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rendimiento</p>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {summary.status === 'loss' ? 'Crítico' : summary.status === 'low-profit' ? 'Bajo' : 'Óptimo'}
                            </p>
                          </div>
                          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Margen</p>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {summary.totalIncome > 0 ? `${Math.round((summary.netResult / summary.totalIncome) * 100)}%` : '0%'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Abstract shapes for background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] blur-3xl rounded-full -mr-16 -mt-16" />
                    </motion.div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] text-center border border-gray-100 dark:border-slate-800 shadow-xl">
                      <LayoutDashboard className="mx-auto text-gray-300 mb-4" size={48} />
                      <p className="text-gray-500 mb-6">Primero debes generar un resumen de tus finanzas en el dashboard.</p>
                      <button 
                        onClick={() => setActiveView('dashboard')}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                      >
                        Ir al Dashboard
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg px-2 dark:text-white">Tips para tu Negocio</h4>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 flex gap-4">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                             <p className="font-bold mb-1 dark:text-white">Crea un fondo de emergencia</p>
                             <p className="text-sm text-gray-500">Destina el 10% de tus ingresos netos a una reserva para imprevistos.</p>
                          </div>
                       </div>
                       <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 flex gap-4">
                          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                             <AlertCircle size={24} />
                          </div>
                          <div>
                             <p className="font-bold mb-1 dark:text-white">Revisa tus costos fijos</p>
                             <p className="text-sm text-gray-500">Analiza mensualmente qué servicios o suscripciones puedes optimizar.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">Registra algunos movimientos para recibir consejos.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="mb-8">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Preferencias</p>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Ajustes de la App</h2>
              </section>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                   <div>
                      <p className="font-bold dark:text-white">Modo Oscuro</p>
                      <p className="text-xs text-gray-400">Reduce el cansancio visual</p>
                   </div>
                   <button 
                     onClick={() => setDarkMode(!darkMode)}
                     className={cn(
                       "w-12 h-6 rounded-full transition-colors relative",
                       darkMode ? "bg-emerald-500" : "bg-gray-200"
                     )}
                   >
                     <motion.div 
                       animate={{ x: darkMode ? 26 : 2 }}
                       className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                     />
                   </button>
                </div>
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between opacity-50 cursor-not-allowed">
                   <div>
                      <p className="font-bold dark:text-white">Notificaciones</p>
                      <p className="text-xs text-gray-400">Recibe alertas de gastos</p>
                   </div>
                   <div className="w-12 h-6 bg-gray-200 rounded-full" />
                </div>
                <div className="p-8 flex items-center justify-between">
                   <button 
                     onClick={() => {
                        if(confirm('¿Seguro que quieres borrar todos los datos? Esta acción es irreversible.')) {
                           setTransactions([]);
                        }
                     }}
                     className="text-rose-500 font-bold text-sm flex items-center gap-2"
                   >
                      <Trash2 size={18} />
                      Borrar todos los datos
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Menu Button (Bottom) */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(true)}
          className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center border-4 border-white dark:border-slate-800"
        >
          <Menu size={32} />
        </motion.button>
      </div>
    </div>
  );
}
