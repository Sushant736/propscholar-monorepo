"use client";

import { Button } from "@/components/ui/button";
import {
  Users,
  Database,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600'>Welcome to PropScholar Admin Panel</p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button variant='outline'>
            <Calendar className='h-4 w-4 mr-2' />
            Last 30 days
          </Button>
          <Button>
            <BarChart3 className='h-4 w-4 mr-2' />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Users</p>
              <p className='text-3xl font-bold text-gray-900'>2,847</p>
              <div className='flex items-center mt-2'>
                <ArrowUpRight className='h-4 w-4 text-green-500 mr-1' />
                <span className='text-sm text-green-600'>+12.5%</span>
                <span className='text-sm text-gray-500 ml-1'>
                  from last month
                </span>
              </div>
            </div>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <Users className='h-6 w-6 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Active Properties
              </p>
              <p className='text-3xl font-bold text-gray-900'>1,234</p>
              <div className='flex items-center mt-2'>
                <ArrowUpRight className='h-4 w-4 text-green-500 mr-1' />
                <span className='text-sm text-green-600'>+8.2%</span>
                <span className='text-sm text-gray-500 ml-1'>
                  from last month
                </span>
              </div>
            </div>
            <div className='p-3 bg-green-100 rounded-lg'>
              <Database className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Revenue</p>
              <p className='text-3xl font-bold text-gray-900'>$45,231</p>
              <div className='flex items-center mt-2'>
                <ArrowUpRight className='h-4 w-4 text-green-500 mr-1' />
                <span className='text-sm text-green-600'>+20.1%</span>
                <span className='text-sm text-gray-500 ml-1'>
                  from last month
                </span>
              </div>
            </div>
            <div className='p-3 bg-yellow-100 rounded-lg'>
              <TrendingUp className='h-6 w-6 text-yellow-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Active Sessions
              </p>
              <p className='text-3xl font-bold text-gray-900'>892</p>
              <div className='flex items-center mt-2'>
                <ArrowDownRight className='h-4 w-4 text-red-500 mr-1' />
                <span className='text-sm text-red-600'>-3.2%</span>
                <span className='text-sm text-gray-500 ml-1'>
                  from last month
                </span>
              </div>
            </div>
            <div className='p-3 bg-purple-100 rounded-lg'>
              <Activity className='h-6 w-6 text-purple-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* User Growth Chart */}
        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>User Growth</h3>
            <Button variant='outline' size='sm'>
              View Details
            </Button>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg flex items-center justify-center'>
            <div className='text-center'>
              <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-2' />
              <p className='text-gray-500'>Chart placeholder</p>
              <p className='text-sm text-gray-400'>
                Integration with chart library needed
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Recent Activity
            </h3>
            <Button variant='outline' size='sm'>
              View All
            </Button>
          </div>
          <div className='space-y-4'>
            {[
              {
                user: "John Doe",
                action: "Added new property",
                time: "2 minutes ago",
              },
              {
                user: "Jane Smith",
                action: "Updated profile",
                time: "5 minutes ago",
              },
              {
                user: "Bob Johnson",
                action: "Completed transaction",
                time: "10 minutes ago",
              },
              {
                user: "Alice Brown",
                action: "Joined platform",
                time: "15 minutes ago",
              },
              {
                user: "Charlie Wilson",
                action: "Added review",
                time: "20 minutes ago",
              },
            ].map((activity, index) => (
              <div key={index} className='flex items-center space-x-3'>
                <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                  <span className='text-xs font-medium text-gray-700'>
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>
                    {activity.user}
                  </p>
                  <p className='text-sm text-gray-500'>{activity.action}</p>
                </div>
                <span className='text-xs text-gray-400'>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white p-6 rounded-lg border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Button className='h-20 flex flex-col items-center justify-center space-y-2'>
            <Users className='h-6 w-6' />
            <span>Manage Users</span>
          </Button>
          <Button
            variant='outline'
            className='h-20 flex flex-col items-center justify-center space-y-2'>
            <Database className='h-6 w-6' />
            <span>View Database</span>
          </Button>
          <Button
            variant='outline'
            className='h-20 flex flex-col items-center justify-center space-y-2'>
            <BarChart3 className='h-6 w-6' />
            <span>Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
