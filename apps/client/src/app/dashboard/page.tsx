"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Star,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-prop-scholar-electric-blue border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const stats = [
    {
      icon: DollarSign,
      title: "Total Profit",
      value: "$12,450",
      change: "+15.3%",
      color: "text-green-400",
    },
    {
      icon: TrendingUp,
      title: "Win Rate",
      value: "73.5%",
      change: "+2.1%",
      color: "text-prop-scholar-electric-blue",
    },
    {
      icon: Target,
      title: "Active Challenges",
      value: "3",
      change: "2 funded",
      color: "text-prop-scholar-amber-yellow",
    },
    {
      icon: Calendar,
      title: "Trading Days",
      value: "47",
      change: "This month",
      color: "text-purple-400",
    },
  ];

  const recentActivity = [
    {
      action: "Challenge Passed",
      platform: "FTMO",
      amount: "$100K",
      date: "2 hours ago",
      type: "success",
    },
    {
      action: "Trade Executed",
      platform: "MyForexFunds",
      amount: "+$1,247",
      date: "5 hours ago",
      type: "profit",
    },
    {
      action: "Challenge Started",
      platform: "The5ers",
      amount: "$50K",
      date: "1 day ago",
      type: "info",
    },
    {
      action: "Withdrawal",
      platform: "TopStep",
      amount: "$2,500",
      date: "2 days ago",
      type: "success",
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy'>
      <PropScholarNavbar />

      <div className='pt-24 pb-12 px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-prop-scholar-main-text mb-2'>
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className='text-prop-scholar-secondary-text text-lg'>
              Here&apos;s your trading performance overview
            </p>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {stats.map((stat, index) => (
              <div
                key={index}
                className='bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6 hover:border-prop-scholar-electric-blue/40 transition-all duration-300'>
                <div className='flex items-center justify-between mb-4'>
                  <div className={`p-3 rounded-xl bg-white/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.color}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className='text-2xl font-bold text-prop-scholar-main-text mb-1'>
                  {stat.value}
                </h3>
                <p className='text-prop-scholar-secondary-text text-sm'>
                  {stat.title}
                </p>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Recent Activity */}
            <div className='lg:col-span-2'>
              <div className='bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <BarChart3 className='h-6 w-6 text-prop-scholar-electric-blue' />
                  <h2 className='text-xl font-bold text-prop-scholar-main-text'>
                    Recent Activity
                  </h2>
                </div>

                <div className='space-y-4'>
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 bg-white/5 rounded-xl'>
                      <div className='flex items-center gap-4'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            activity.type === "success"
                              ? "bg-green-400"
                              : activity.type === "profit"
                                ? "bg-prop-scholar-amber-yellow"
                                : "bg-prop-scholar-electric-blue"
                          }`}
                        />
                        <div>
                          <p className='text-prop-scholar-main-text font-medium'>
                            {activity.action}
                          </p>
                          <p className='text-prop-scholar-secondary-text text-sm'>
                            {activity.platform} • {activity.date}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-bold ${
                          activity.type === "profit"
                            ? "text-green-400"
                            : "text-prop-scholar-main-text"
                        }`}>
                        {activity.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='space-y-6'>
              {/* Profile Card */}
              <div className='bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6'>
                <div className='text-center mb-6'>
                  <div className='bg-prop-scholar-electric-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-xl'>
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className='text-prop-scholar-main-text font-bold text-lg'>
                    {user.name}
                  </h3>
                  <p className='text-prop-scholar-secondary-text text-sm'>
                    {user.email}
                  </p>
                  <p className='text-prop-scholar-secondary-text text-sm'>
                    {user.phone}
                  </p>
                </div>

                <div className='flex items-center justify-center gap-1 mb-4'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className='h-4 w-4 text-prop-scholar-amber-yellow fill-current'
                    />
                  ))}
                  <span className='text-prop-scholar-secondary-text text-sm ml-2'>
                    Pro Trader
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
