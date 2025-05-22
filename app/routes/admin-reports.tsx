import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaCalendarAlt, FaChartBar, FaTable, FaFilter, FaBuilding, FaClipboardList, FaDownload } from "react-icons/fa";
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
  const [downloading, setDownloading] = useState<boolean>(false);
  
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
  
  // Load schedule data - Hanya untuk event yang akan datang dan saat ini
  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      // Pertama, coba ambil data semua event dari endpoint admin untuk mendapatkan event yang akan datang
      try {
        const eventsResponse = await fetch('/api/admin/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          
          if (eventsData.data && Array.isArray(eventsData.data)) {
            // Filter untuk event yang AKAN DATANG atau SAAT INI berdasarkan tanggal
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const futureEvents = eventsData.data.filter((event: any) => {
              if (!event.date) return false;
              
              // Convert tanggal event ke objek Date
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              
              // Tanggal event harus sama dengan atau setelah hari ini
              return eventDate >= today;
            });
            
            console.log('Found future events:', futureEvents.length);
            
            // Konversi event ke format schedule item
            if (futureEvents.length > 0) {
              const scheduleItems = futureEvents.map((event: any, index: number) => {
                // Buat waktu mulai dan selesai
                const eventDate = new Date(event.date);
                
                // Waktu berdasarkan data event
                let startHour = 0;
                let startMinute = 0;
                let duration = 0;
                
                // Jika ada waktu pada event, gunakan itu
                if (event.time) {
                  const timeParts = event.time.split(':');
                  if (timeParts.length >= 2) {
                    startHour = parseInt(timeParts[0], 10);
                    startMinute = parseInt(timeParts[1], 10);
                  }
                }
                
                // Durasi acara berdasarkan data yang ada atau estimasi dari API
                if (event.duration) {
                  duration = event.duration;
                } else if (event.endTime && event.time) {
                  // Hitung durasi jika ada data waktu mulai dan selesai
                  const eventStart = new Date(eventDate);
                  eventStart.setHours(startHour, startMinute, 0, 0);
                  
                  const eventEnd = new Date(event.endTime);
                  
                  // Durasi dalam jam
                  duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
                } else {
                  // Jika tidak ada informasi durasi, coba ambil dari data terkait
                  duration = event.usageHours || 0;
                }
                
                // Jika masih belum ada durasi yang valid, biarkan API backend menentukan
                if (duration <= 0) {
                  duration = 0; // API akan menangani durasi default jika diperlukan
                }
                
                // Set waktu mulai
                const startTime = new Date(eventDate);
                startTime.setHours(startHour, startMinute, 0, 0);
                
                // Set waktu selesai berdasarkan durasi
                const endTime = new Date(startTime);
                if (duration > 0) {
                  endTime.setTime(startTime.getTime() + (duration * 60 * 60 * 1000));
                }
                
                return {
                  id: event._id || event.id || `${index}`,
                  event: {
                    name: event.name,
                    _id: event._id || event.id
                  },
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString(),
                  booked_by: event.createdBy || event.organizer || {
                    _id: event.organizerId || "",
                    username: event.organizerUsername || "",
                    fullName: event.organizerName || "",
                    organizerName: event.organizerName || ""
                  }
                };
              });
              
              // Filter schedule items berdasarkan rentang tanggal yang dipilih
              const fromDate = new Date(dateRange.from);
              const toDate = new Date(dateRange.to);
              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);
              
              const filteredSchedule = scheduleItems.filter((item: ScheduleItem) => {
                const itemDate = new Date(item.startTime);
                return itemDate >= fromDate && itemDate <= toDate;
              });
              
              console.log('Filtered future events in date range:', filteredSchedule.length);
              
              // Set schedule data
              setSchedule(filteredSchedule);
              return; // Keluar dari fungsi jika berhasil
            }
          }
        }
      } catch (err) {
        console.error('Error fetching from admin events for schedule:', err);
      }
      
      // Jika tidak berhasil dengan endpoint admin events, gunakan endpoint schedule
      const params = new URLSearchParams();
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
      
      const response = await fetch(`/api/admin/auditorium/schedule?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
        // Filter untuk memastikan hanya event future yang masuk ke schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const filteredSchedule = data.data ? data.data.filter((item: ScheduleItem) => {
          if (!item.startTime) return false;
          
          const itemDate = new Date(item.startTime);
          itemDate.setHours(0, 0, 0, 0);
          
          return itemDate >= today;
        }) : [];
        
        setSchedule(filteredSchedule || []);
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
      
      console.log('Loading past events with date range:', dateRange);
      
      // Pertama, coba load events dari endpoint admin events untuk mendapatkan semua event
      try {
        const eventsResponse = await fetch('/api/admin/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('Admin events data:', eventsData);
          
          if (eventsData.data && Array.isArray(eventsData.data) && eventsData.data.length > 0) {
            // Filter untuk event yang SUDAH LEWAT berdasarkan tanggal saat ini
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const validEvents = eventsData.data.filter((event: any) => {
              if (!event.date) return false;
              
              // Convert tanggal event ke objek Date
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              
              // Cek apakah event dalam rentang tanggal yang dipilih DAN sudah berlalu
              const fromDate = new Date(dateRange.from);
              const toDate = new Date(dateRange.to);
              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);
              
              const isInDateRange = eventDate >= fromDate && eventDate <= toDate;
              const isPastEvent = eventDate < today; // Event sudah lewat
              
              return isInDateRange && isPastEvent;
            });
            
            console.log('Valid PAST events in date range:', validEvents.length);
            
            // Siapkan data event dengan format PastEvent
            const formattedEvents = validEvents.map((event: any) => {
              // Hitung occupancy berdasarkan data yang tersedia
              let occupancy = 0;
              if (event.totalSeats && event.availableSeats) {
                occupancy = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;
              } else if (event.ticketsSold && event.totalSeats) {
                occupancy = (event.ticketsSold / event.totalSeats) * 100;
              }
              
              // Gunakan data durasi dari event jika tersedia
              const usageHours = event.usageHours || event.duration || 0;
              
              return {
                _id: event._id || event.id,
                name: event.name,
                date: event.date,
                time: event.time || "",
                organizer: event.createdBy || event.organizer || {
                  _id: event.organizerId || "",
                  username: event.organizerUsername || "",
                  fullName: event.organizerName || "",
                  organizerName: event.organizerName || ""
                },
                totalSeats: event.totalSeats || 0,
                availableSeats: event.availableSeats || 0,
                occupancy: occupancy,
                usageHours: usageHours
              };
            });
            
            setPastEvents(formattedEvents);
            return; // Keluar dari fungsi jika berhasil
          }
        }
      } catch (err) {
        console.error('Error fetching from admin events, falling back to events-held endpoint:', err);
        // Lanjutkan ke endpoint events-held jika terjadi error
      }
      
      // Jika tidak berhasil mendapatkan data dari endpoint admin events, gunakan endpoint events-held
      const response = await fetch(`/api/admin/auditorium/events-held?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
      console.log('Past events raw data from events-held:', data);
      
      if (data.message && data.message.includes("Insufficient data")) {
        setPastEvents([]);
      } else {
        // Filter events yang valid dengan kriteria yang lebih ketat - HANYA EVENT YANG SUDAH LEWAT
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const filteredEvents = data.data ? data.data.filter((event: PastEvent) => {
          // Verifikasi minimal memiliki data dasar yang valid
          const hasBasicData = event._id && event.name && event.date;
          
          // Convert tanggal event ke objek Date
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          
          // Tanggal event harus dalam rentang yang dipilih
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
          
          const isInDateRange = eventDate >= fromDate && eventDate <= toDate;
          const isPastEvent = eventDate < today; // Event sudah lewat
          
          return hasBasicData && isInDateRange && isPastEvent;
        }) : [];
        
        // Gunakan data asli tanpa memberikan nilai default
        const processedEvents = filteredEvents.map((event: PastEvent) => ({
          ...event,
          occupancy: typeof event.occupancy === 'number' ? event.occupancy : 0,
          usageHours: typeof event.usageHours === 'number' ? event.usageHours : 0
        }));
        
        setPastEvents(processedEvents);
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      const params = new URLSearchParams();
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
      
      console.log('Loading utilization data with date range:', dateRange);
      
      // Dapatkan data utilization
      const response = await fetch(`/api/admin/auditorium/utilization?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
        
        // Pertama, ambil semua event - baik yang akan datang maupun yang sudah lewat
        try {
          const eventsResponse = await fetch('/api/admin/events', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            
            if (eventsData.data && Array.isArray(eventsData.data) && eventsData.data.length > 0) {
              const allEvents = eventsData.data.filter((event: any) => {
                if (!event.date) return false;
                
                // Cek apakah event dalam rentang tanggal yang dipilih
                const eventDate = new Date(event.date);
                const fromDate = new Date(dateRange.from);
                const toDate = new Date(dateRange.to);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);
                
                return eventDate >= fromDate && eventDate <= toDate;
              });
              
              console.log('All events for utilization:', allEvents.length);
              
              // Buat map tanggal event untuk utilization
              const eventDateMap = new Map();
              
              allEvents.forEach((event: any) => {
                if (!event.date) return;
                
                // Format tanggal ke YYYY-MM-DD
                const date = new Date(event.date);
                const dateKey = date.toISOString().split('T')[0];
                
                if (!eventDateMap.has(dateKey)) {
                  eventDateMap.set(dateKey, []);
                }
                
                // Durasi dari data API - sesuai dokumentasi API, event memiliki durasi rata-rata 3 jam
                // jika tidak ada data eksplisit
                const eventDuration = event.usageHours > 0 ? event.usageHours : 
                                       event.duration > 0 ? event.duration : 3;
                
                eventDateMap.get(dateKey).push({
                  _id: event._id || event.id,
                  name: event.name,
                  duration: eventDuration
                });
              });
              
              // Log untuk debug
              console.log('Sample event data:', 
                Array.from(eventDateMap.entries())
                  .slice(0, 2)
                  .map(([date, events]) => ({
                    date,
                    eventCount: events.length,
                    totalDuration: events.reduce((sum: number, e: any) => sum + e.duration, 0)
                  }))
              );
              
              // Dapatkan semua tanggal dalam rentang yang dipilih
              const fromDate = new Date(dateRange.from);
              const toDate = new Date(dateRange.to);
              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);
              
              const allDatesInRange = new Set<string>();
              const currentDate = new Date(fromDate);
              
              // Iterasi semua tanggal dalam rentang
              while (currentDate <= toDate) {
                const dateKey = currentDate.toISOString().split('T')[0];
                allDatesInRange.add(dateKey);
                currentDate.setDate(currentDate.getDate() + 1);
              }
              
              // Filter utilization data untuk hanya menyertakan data yang valid
              const filteredUtilization = data.data ? data.data.filter((item: UtilizationData) => {
                // Pastikan data utilization valid
                const hasValidData = 
                  typeof item.total_hours_used === 'number' && 
                  typeof item.total_hours_available === 'number' && 
                  typeof item.utilization_percentage === 'number';
                
                return hasValidData;
              }) : [];
              
              // Buat Map untuk menyimpan utilization berdasarkan tanggal
              const utilizationByDate = new Map<string, UtilizationData>();
              
              // Tambahkan utilization data yang ada ke Map
              filteredUtilization.forEach((item: UtilizationData) => {
                const utilizationDate = new Date(item.date);
                const dateKey = utilizationDate.toISOString().split('T')[0];
                utilizationByDate.set(dateKey, item);
              });
              
              // Buat array hasil akhir dengan data yang diperkaya
              const enhancedUtilization: UtilizationData[] = [];
              
              // Iterasi setiap tanggal dalam rentang dan buat atau perbarui data utilization
              allDatesInRange.forEach((dateKey) => {
                const eventsForDate = eventDateMap.get(dateKey) || [];
                const existingUtilization = utilizationByDate.get(dateKey);
                
                if (existingUtilization) {
                  // Jika ada data utilization yang sudah ada, perbarui dengan event baru
                  const currentEventIds = new Set(existingUtilization.events || []);
                  const updatedEvents = [...currentEventIds];
                  
                  // Hitung total jam berdasarkan durasi aktual event
                  let additionalHours = 0;
                  
                  eventsForDate.forEach((event: any) => {
                    if (!currentEventIds.has(event._id)) {
                      updatedEvents.push(event._id);
                      
                      // Durasi event sudah pasti ada (default 3 jam dari langkah sebelumnya)
                      additionalHours += event.duration;
                    }
                  });
                  
                  // Hitung total jam yang digunakan
                  const totalHoursUsed = additionalHours > 0 ? 
                    Math.max(existingUtilization.total_hours_used, additionalHours) : 
                    existingUtilization.total_hours_used;
                  
                  // Hitung utilization percentage berdasarkan total jam
                  const utilizationPercentage = existingUtilization.total_hours_available > 0 ?
                    Math.min(Math.max((totalHoursUsed / existingUtilization.total_hours_available) * 100, existingUtilization.utilization_percentage), 100) :
                    existingUtilization.utilization_percentage;
                  
                  // Tambahkan item yang sudah diperbarui
                  enhancedUtilization.push({
                    ...existingUtilization,
                    events: updatedEvents,
                    total_hours_used: totalHoursUsed,
                    utilization_percentage: utilizationPercentage
                  });
                } else if (eventsForDate.length > 0) {
                  // Jika tidak ada data utilization tapi ada event, buat data baru
                  interface EventWithId {
                    _id: string;
                    name?: string;
                    duration: number;
                  }
                  
                  const eventIds = eventsForDate.map((event: EventWithId) => event._id);
                  
                  // Hitung total jam - durasi event sudah ada dari langkah sebelumnya (default 3 jam)
                  const totalHoursUsed = eventsForDate.reduce((sum: number, event: EventWithId) => 
                    sum + event.duration, 0);
                  
                  // Sesuai dokumentasi API, default jam tersedia per hari
                  const totalHoursAvailable = 16; // 8:00 - 00:00
                  const utilizationPercentage = (totalHoursUsed / totalHoursAvailable) * 100;
                  
                  // Buat date dari dateKey
                  const dateParts = dateKey.split('-');
                  const utilizationDate = new Date(
                    parseInt(dateParts[0]), 
                    parseInt(dateParts[1]) - 1, // Bulan dimulai dari 0
                    parseInt(dateParts[2])
                  );
                  
                  // Tambahkan data utilization baru
                  enhancedUtilization.push({
                    date: utilizationDate.toISOString(),
                    total_hours_used: totalHoursUsed,
                    total_hours_available: totalHoursAvailable,
                    utilization_percentage: utilizationPercentage,
                    events: eventIds
                  });
                }
              });
              
              // Urutkan utilization berdasarkan tanggal
              enhancedUtilization.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              });
              
              console.log('Enhanced utilization data with all events:', enhancedUtilization.length);
              setUtilization(enhancedUtilization);
              return;
            }
          }
        } catch (err) {
          console.error('Error enhancing utilization with events data:', err);
        }
        
        // Fallback ke data asli jika tidak bisa meningkatkan dengan event baru
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
  
  // Download report function
  const downloadReport = async () => {
    setDownloading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      // Menggunakan tipe 'all' sebagai default tanpa parameter rentang waktu
      let url = `/api/admin/auditorium/download-report?type=all`;
      
      // Menggunakan fetch untuk mendapatkan data sebagai blob
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Check untuk melihat apakah respons berisi JSON error atau file PDF
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.message && data.message.includes("Insufficient data")) {
          throw new Error('Insufficient data for the selected period.');
        }
      }
      
      // Download blob data sebagai file
      const blob = await response.blob();
      const filename = response.headers.get('content-disposition')?.split('filename=')[1] || `auditorium-report-all.pdf`;
      
      // Membuat URL untuk blob dan trigger download
      const url_download = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url_download;
      a.download = filename.replace(/"/g, '');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_download);
      
    } catch (err: any) {
      console.error('Failed to download report:', err);
      setError(err.message || 'Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-6 mt-20">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Auditorium Management</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor auditorium usage, events, and utilization</p>
          </div>
          
          <div className="flex items-center gap-2">
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
            
            {/* Download button */}
            <button
              onClick={downloadReport}
              disabled={downloading || loading}
              className="flex items-center bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Download Report
                </>
              )}
            </button>
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