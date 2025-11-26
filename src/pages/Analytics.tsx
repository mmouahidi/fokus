import { useStore } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { Activity, CheckCircle, Flame, Tag, TrendingUp, Download } from 'lucide-react'

export default function Analytics() {
    const { items, captures, stats, getAllTags, exportData } = useStore()

    // Data for Items by Type
    const typeData = [
        { name: 'Video', value: items.filter(i => i.type === 'video').length, color: '#EF4444' },
        { name: 'Article', value: items.filter(i => i.type === 'article').length, color: '#3B82F6' },
        { name: 'Task', value: items.filter(i => i.type === 'task').length, color: '#10B981' },
        { name: 'Idea', value: items.filter(i => i.type === 'idea').length, color: '#F59E0B' },
    ].filter(d => d.value > 0)

    // Data for Kanban Distribution
    const kanbanData = [
        { name: 'Now', value: items.filter(i => i.kanbanColumn === 'now').length },
        { name: 'Soon', value: items.filter(i => i.kanbanColumn === 'soon').length },
        { name: 'Later', value: items.filter(i => i.kanbanColumn === 'later').length },
        { name: 'Someday', value: items.filter(i => i.kanbanColumn === 'someday').length },
    ]

    // Data for Items Over Time
    const itemsOverTimeData = Object.entries(stats.completionHistory || {})
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30) // Last 30 days

    // Success Rate
    const totalCaptures = captures.length
    const processedCaptures = captures.filter(c => c.processed).length
    const successRate = totalCaptures > 0 ? Math.round((processedCaptures / totalCaptures) * 100) : 0

    // Top Tags
    const topTags = getAllTags().slice(0, 5)

    const handleExport = () => {
        const data = exportData()
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fokus-analytics-export-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 pb-24">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
                    <p className="text-gray-400">Insights into your second brain activity.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    Export Data
                </button>
            </header>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={CheckCircle}
                    label="Completed"
                    value={stats.itemsCompleted}
                    color="text-emerald-400"
                />
                <StatCard
                    icon={Flame}
                    label="Streak"
                    value={`${stats.streak} days`}
                    color="text-orange-400"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Success Rate"
                    value={`${successRate}%`}
                    color="text-blue-400"
                />
                <StatCard
                    icon={Tag}
                    label="Total Tags"
                    value={getAllTags().length}
                    color="text-purple-400"
                />
            </div>

            {/* Items Over Time Chart */}
            <ChartCard title="Activity Over Time">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={itemsOverTimeData}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9CA3AF' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#8B5CF6"
                            fillOpacity={1}
                            fill="url(#colorCount)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                {itemsOverTimeData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                        Not enough data yet
                    </div>
                )}
            </ChartCard>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Content Distribution */}
                <ChartCard title="Content Distribution">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={typeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                        {typeData.map(type => (
                            <div key={type.name} className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                {type.name}
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Kanban Status */}
                <ChartCard title="Kanban Status">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={kanbanData}>
                            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Top Tags */}
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Tags</h3>
                <div className="flex flex-wrap gap-3">
                    {topTags.map(({ tag, count }) => (
                        <div key={tag} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 min-w-[150px]">
                            <span className="text-gray-300">#{tag}</span>
                            <span className="text-primary-400 font-bold">{count}</span>
                        </div>
                    ))}
                    {topTags.length === 0 && (
                        <p className="text-gray-500 italic">No tags found yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center"
        >
            <div className={`p-3 rounded-full bg-white/5 mb-3 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        </motion.div>
    )
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
            {children}
        </div>
    )
}
