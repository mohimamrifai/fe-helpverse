import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaCalendarAlt, FaChartBar, FaTable, FaFilter, FaBuilding, FaClipboardList } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ProtectedRoute } from "../components/protected-route";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

// Define types for the admin reports
interface ScheduleItem {
  id: string;
  event: {
    name: string;
    _id: string;
  };
  startTime: string;
  endTime: string;
  booked_by: {
    _id: string;
    username: string;
    fullName: string;
    organizerName: string;
  };
}

interface PastEvent {
  _id: string;
  name: string;
  date: string;
  time: string;
  organizer: {
    _id: string;
    username: string;
    fullName: string;
    organizerName: string;
  };
  totalSeats: number;
  availableSeats: number;
  occupancy: number;
  usageHours: number;
}

interface UtilizationData {
  date: string;
  total_hours_used: number;
  total_hours_available: number;
  utilization_percentage: number;
  events: string[];
}

function AdminReportContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"schedule" | "events" | "utilization">("schedule");
  const [dateRange, setDateRange] = useState<{from: string; to: string}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    to: new Date().toISOString().split("T")[0] // today
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [utilization, setUtilization] = useState<UtilizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Theme colors for consistent UI
  const THEME_COLORS = {
    primary: '#7571F9',
    secondary: '#FF7F8A',
    tertiary: '#45D9A1',
    quaternary: '#FFB366',
    background: '#F7F7FF',
    lightGray: '#F0F0F7',
    darkText: '#242D60',
    lightText: '#677489'
  };
  
  // Load schedule data
  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      const params = new URLSearchParams();
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
      
      const response = await fetch(`/api/admin/auditorium/schedule?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.message && data.message.includes("Insufficient data")) {
        setSchedule([]);
      } else {
        setSchedule(data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load schedule:', err);
      setError(err.message || 'Failed to load schedule data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load past events data
  const loadPastEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      const params = new URLSearchParams();
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
      
      const response = await fetch(`/api/admin/auditorium/events-held?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log the raw data for debugging
      console.log('Past events raw data:', data);
      
      // Inspect the first event in detail if available
      if (data.data && data.data.length > 0) {
        console.log('Sample event details:', {
          event: data.data[0],
          hasOccupancy: 'occupancy' in data.data[0],
          occupancyValue: data.data[0].occupancy,
          hasSeats: 'totalSeats' in data.data[0] && 'availableSeats' in data.data[0],
          totalSeats: data.data[0].totalSeats,
          availableSeats: data.data[0].availableSeats,
          filledSeats: data.data[0].totalSeats - data.data[0].availableSeats
        });
      }
      
      if (data.message && data.message.includes("Insufficient data")) {
        setPastEvents([]);
      } else {
        // Gunakan data API langsung tanpa memodifikasi
        setPastEvents(data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load past events:', err);
      setError(err.message || 'Failed to load events data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load utilization data
  const loadUtilization = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load event data first
      await loadPastEvents();
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      const params = new URLSearchParams();
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
      
      // Dapatkan data utilization
      const response = await fetch(`/api/admin/auditorium/utilization?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.message && data.message.includes("Insufficient data")) {
        setUtilization([]);
      } else {
        // Console log untuk debug
        console.log('Utilization data received:', data.data);
        
        // Dapatkan semua ID event unik dari utilization data
        const eventIds = new Set<string>();
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((item: UtilizationData) => {
            if (item.events && Array.isArray(item.events)) {
              item.events.forEach((eventId: string) => {
                if (typeof eventId === 'string') {
                  eventIds.add(eventId);
                }
              });
            }
          });
        }
        
        console.log('Unique event IDs in utilization:', Array.from(eventIds));
        console.log('Current pastEvents:', pastEvents.map(e => e._id));
        
        // Jika masih ada event IDs yang perlu dilengkapi, ambil dari API events
        if (eventIds.size > 0) {
          // Dapatkan event dari API events secara langsung
          try {
            const eventsEndpoint = `/api/events?ids=${Array.from(eventIds).join(',')}`;
            console.log('Fetching specific events from:', eventsEndpoint);
            
            const eventsResponse = await fetch(eventsEndpoint, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              console.log('Events data from API:', eventsData);
              
              if (eventsData.data && Array.isArray(eventsData.data) && eventsData.data.length > 0) {
                // Tambahkan event dari API ke pastEvents jika belum ada
                const existingIds = new Set(pastEvents.map(e => e._id));
                const newEvents = eventsData.data.filter((e: any) => !existingIds.has(e._id));
                
                if (newEvents.length > 0) {
                  console.log('Adding new events from API:', newEvents.length);
                  setPastEvents(prev => [...prev, ...newEvents]);
                }
              }
            }
          } catch (err) {
            console.error('Error fetching additional events:', err);
            // Tidak perlu menampilkan error ke user
          }
        }
        
        setUtilization(data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load utilization:', err);
      setError(err.message || 'Failed to load utilization data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "schedule") {
      loadSchedule();
    } else if (activeTab === "events") {
      loadPastEvents();
    } else if (activeTab === "utilization") {
      loadUtilization();
    }
  }, [activeTab, dateRange]);
  
  // Calculate average utilization
  const getAverageUtilization = () => {
    if (!utilization.length) return 0;
    const sum = utilization.reduce((acc, item) => acc + item.utilization_percentage, 0);
    return (sum / utilization.length).toFixed(1);
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate average occupancy
  const calculateAverageOccupancy = (events: PastEvent[]) => {
    if (!events || events.length === 0) return 0;
    
    // Log the events for debugging
    console.log('Calculating average from events:', events.map((e: PastEvent) => e.occupancy));
    
    // Sum up all occupancy values
    const total = events.reduce((sum: number, event: PastEvent) => {
      // Ensure we're using a number and not undefined/NaN
      const eventOccupancy = typeof event.occupancy === 'number' ? event.occupancy : 0;
      return sum + eventOccupancy;
    }, 0);
    
    // Calculate average and round to 1 decimal place
    const average = total / events.length;
    const roundedAverage = Math.round(average * 10) / 10;
    
    console.log(`Average occupancy calculation: ${total} / ${events.length} = ${roundedAverage}%`);
    
    return roundedAverage;
  };
  
  // Calculate average utilization
  const calculateAverageUtilization = (utilizationData: UtilizationData[]) => {
    if (!utilizationData || utilizationData.length === 0) return 0;
    
    // Sum up all utilization percentages
    const total = utilizationData.reduce((sum: number, item: UtilizationData) => {
      const utilPercentage = item.utilization_percentage || 0;
      return sum + utilPercentage;
    }, 0);
    
    // Calculate average and round to 1 decimal place
    const average = total / utilizationData.length;
    const roundedAverage = Math.round(average * 10) / 10;
    
    console.log(`Average utilization calculation: ${total} / ${utilizationData.length} = ${roundedAverage}%`);
    
    return roundedAverage;
  };
  
  // Fungsi untuk mendapatkan nama event berdasarkan ID
  const getEventNameById = (eventId: string): string => {
    // Jika eventId tidak valid, kembalikan nilai default
    if (!eventId) return 'Unknown Event';
    
    // Mencoba berbagai format ID untuk mencari event yang sesuai
    const event = pastEvents.find(e => {
      // Format standar: ID sama persis
      if (e._id === eventId) return true;
      
      // Format string: ID sama persis setelah dikonversi ke string
      if (e._id && e._id.toString() === eventId) return true;
      
      // Format alternatif: Jika memiliki id sebagai properti
      // @ts-ignore - properti id mungkin ada jika dari API berbeda
      if (e.id && (e.id === eventId || e.id.toString() === eventId)) return true;
      
      return false;
    });
    
    // Jika event ditemukan, kembalikan namanya
    if (event && event.name) {
      return event.name;
    }
    
    // Jika format event ID seperti ObjectId MongoDB (24 karakter hex)
    if (typeof eventId === 'string' && eventId.match(/^[0-9a-f]{24}$/i)) {
      // Return nama yang lebih user-friendly
      return `Acara #${eventId.substring(0, 6)}`;
    }
    
    // Jika format lain, kembalikan langsung
    return eventId;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-6 mt-20">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Auditorium Management</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor auditorium usage, events, and utilization</p>
          </div>
          
          {/* Date range selector */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'schedule' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <FaCalendarAlt className="mr-2" />
            Schedule
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('events')}
          >
            <FaClipboardList className="mr-2" />
            Past Events
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'utilization' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('utilization')}
          >
            <FaChartBar className="mr-2" />
            Utilization
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="w-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Tab content */}
        {!loading && !error && (
          <>
            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Upcoming Auditorium Schedule</h2>
                
                {schedule.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No scheduled events for the selected period</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {schedule.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.event?.name || "Unnamed Event"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.startTime).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                              {new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.booked_by?.organizerName || item.booked_by?.fullName || "Unknown Organizer"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Past Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: THEME_COLORS.primary }}>
                    <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
                    <p className="text-2xl font-bold">{pastEvents.length}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: THEME_COLORS.tertiary }}>
                    <h3 className="text-sm font-medium text-gray-500">Average Occupancy</h3>
                    <p className="text-2xl font-bold">
                      {pastEvents.length 
                        ? `${calculateAverageOccupancy(pastEvents)}%` 
                        : '0%'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: THEME_COLORS.quaternary }}>
                    <h3 className="text-sm font-medium text-gray-500">Total Hours Used</h3>
                    <p className="text-2xl font-bold">
                      {pastEvents.reduce((sum, event) => sum + event.usageHours, 0).toFixed(1)}
                    </p>
                  </div>
                </div>
                
                {/* Events Table */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-4">Events Held</h2>
                  
                  {pastEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FaClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No past events for the selected period</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pastEvents.map((event, index) => (
                            <tr key={event._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(event.date)} {event.time}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {event.organizer?.organizerName || event.organizer?.fullName || "Unknown Organizer"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className="h-2.5 rounded-full" 
                                      style={{ 
                                        width: `${event.occupancy}%`,
                                        backgroundColor: event.occupancy > 75 
                                          ? THEME_COLORS.tertiary 
                                          : event.occupancy > 50 
                                            ? THEME_COLORS.quaternary 
                                            : THEME_COLORS.secondary
                                      }}
                                    ></div>
                                  </div>
                                  <span>{event.occupancy.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{event.usageHours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Utilization Tab */}
            {activeTab === 'utilization' && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: THEME_COLORS.primary }}>
                    <h3 className="text-sm font-medium text-gray-500">Average Utilization</h3>
                    <p className="text-2xl font-bold">{calculateAverageUtilization(utilization)}%</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: THEME_COLORS.tertiary }}>
                    <h3 className="text-sm font-medium text-gray-500">Total Hours Available</h3>
                    <p className="text-2xl font-bold">
                      {utilization.reduce((sum, item) => sum + item.total_hours_available, 0)}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: THEME_COLORS.quaternary }}>
                    <h3 className="text-sm font-medium text-gray-500">Total Hours Used</h3>
                    <p className="text-2xl font-bold">
                      {utilization.reduce((sum, item) => sum + item.total_hours_used, 0)}
                    </p>
                  </div>
                </div>
                
                {/* Utilization Chart */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-4">Utilization Over Time</h2>
                  
                  {utilization.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FaChartBar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No utilization data for the selected period</p>
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={utilization}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f7" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: THEME_COLORS.lightText }} 
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            unit="%"
                            tick={{ fontSize: 12, fill: THEME_COLORS.lightText }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${value}%`, 'Utilization']}
                            labelFormatter={(label) => formatDate(label as string)}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="utilization_percentage" 
                            name="Utilization" 
                            stroke={THEME_COLORS.primary} 
                            strokeWidth={2}
                            dot={{ r: 4, fill: THEME_COLORS.primary, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: THEME_COLORS.primary, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                
                {/* Utilization Table */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-4">Utilization Details</h2>
                  
                  {utilization.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FaChartBar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No utilization data for the selected period</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Used</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Available</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {utilization.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.total_hours_used}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.total_hours_available}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${item.utilization_percentage}%`,
                                        backgroundColor: item.utilization_percentage > 75 
                                          ? THEME_COLORS.tertiary 
                                          : item.utilization_percentage > 50 
                                            ? THEME_COLORS.quaternary 
                                            : THEME_COLORS.secondary
                                      }}
                                    ></div>
                                  </div>
                                  <span>{item.utilization_percentage}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {item.events && item.events.length > 0 
                                  ? (
                                    <div className="space-y-1">
                                      {item.events.map((eventId, idx) => {
                                        const eventName = getEventNameById(eventId);
                                        const isOriginalId = eventName.startsWith('Acara #');
                                        
                                        return (
                                          <div 
                                            key={idx} 
                                            className={`text-xs px-2 py-1 rounded ${isOriginalId ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}
                                            title={eventId}
                                          >
                                            {eventName}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )
                                  : 'None'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminReportContent />
    </ProtectedRoute>
  );
} 