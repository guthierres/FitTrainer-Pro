import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Dumbbell, 
  BarChart3, 
  CreditCard, 
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Alunos', href: '/alunos', icon: Users },
    { name: 'Treinos', href: '/treinos', icon: Dumbbell },
    { name: 'Avaliações', href: '/avaliacoes', icon: BarChart3 },
    { name: 'Pagamentos', href: '/pagamentos', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 fixed left-0 top-0 z-40">
      <div className="flex items-center px-6 py-4 border-b border-slate-700">
        <Activity className="h-8 w-8 text-blue-400" />
        <span className="ml-3 text-xl font-bold">FitTrainer Pro</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}