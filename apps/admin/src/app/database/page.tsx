"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Download,
  Upload,
  Database,
  Table,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";

// Mock database tables
const mockTables = [
  {
    name: "users",
    records: 2847,
    size: "2.3 MB",
    lastModified: "2024-06-24",
    description: "User accounts and profiles",
  },
  {
    name: "properties",
    records: 1234,
    size: "15.7 MB",
    lastModified: "2024-06-24",
    description: "Property listings and details",
  },
  {
    name: "transactions",
    records: 892,
    size: "8.1 MB",
    lastModified: "2024-06-23",
    description: "Payment and transaction records",
  },
  {
    name: "reviews",
    records: 1567,
    size: "3.2 MB",
    lastModified: "2024-06-22",
    description: "User reviews and ratings",
  },
  {
    name: "bookings",
    records: 445,
    size: "1.8 MB",
    lastModified: "2024-06-21",
    description: "Property booking records",
  },
];

export default function DatabasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const filteredTables = mockTables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database</h1>
          <p className="text-gray-600">Manage database tables and data</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Table</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tables</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTables.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Table className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTables
                  .reduce((sum, table) => sum + table.records, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">31.1 MB</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Backup</p>
              <p className="text-2xl font-bold text-gray-900">2h ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table) => (
          <div
            key={table.name}
            className={`bg-white p-6 rounded-lg border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
              selectedTable === table.name ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedTable(table.name)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Table className="h-5 w-5 text-blue-600" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
              {table.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{table.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Records:</span>
                <span className="font-medium">
                  {table.records.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Size:</span>
                <span className="font-medium">{table.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Modified:</span>
                <span className="font-medium">{table.lastModified}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                View Data
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Edit Schema
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Table Details */}
      {selectedTable && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Table: {selectedTable}
            </h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Table details and schema information would be displayed here. This
              could include column definitions, indexes, constraints, and sample
              data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
