import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { Trip, Activity } from '@/hooks/useTrips';

interface BudgetOverviewProps {
  trips: Trip[];
  activities: Activity[];
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ trips, activities }) => {
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.total_budget || 0), 0);
  const totalSpent = activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const stats = [
    {
      label: 'Total Budget',
      value: `$${totalBudget.toLocaleString()}`,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Spent',
      value: `$${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      label: 'Remaining',
      value: `$${remaining.toLocaleString()}`,
      icon: PiggyBank,
      color: remaining >= 0 ? 'text-palm' : 'text-destructive',
      bgColor: remaining >= 0 ? 'bg-palm/10' : 'bg-destructive/10',
    },
  ];

  return (
    <div className="card-travel p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Budget Overview</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-medium">{spentPercentage.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              spentPercentage > 100
                ? 'bg-destructive'
                : spentPercentage > 80
                ? 'bg-secondary'
                : 'bg-primary'
            }`}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={`font-bold text-lg ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetOverview;
