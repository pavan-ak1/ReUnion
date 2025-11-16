"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringEvent, setRegisteringEvent] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    recordsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events", {
          params: {
            page: pagination.currentPage,
            limit: pagination.recordsPerPage
          }
        });
        setEvents(res.data.data || res.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch (err) {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [pagination.currentPage]);

  const handleRegister = async (eventId: number) => {
    setRegisteringEvent(eventId);
    try {
      await api.post("/student/events/register", { event_id: eventId });
      toast.success("Successfully registered for the event!");
      // Update the UI to show registration status
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.event_id === eventId 
            ? { ...event, isRegistered: true } 
            : event
        )
      );
    } catch (err: any) {
      // The API interceptor will handle 401 redirects
      if (err.status !== 401) {
        // Check if already registered error
        if (err.status === 409 || 
            err.message?.toLowerCase().includes('already registered') ||
            err.data?.message?.toLowerCase().includes('already registered')) {
          toast.info("You are already registered for this event!");
        } else {
          toast.error(err.message || err.data?.message || "Could not register for the event");
        }
      }
    } finally {
      setRegisteringEvent(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#3A29FF", "#6A5AE0", "#2563eb", "#c51616"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* === Header === */}
      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* === Main Content === */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
            Explore Events
          </h1>
          <p className="text-gray-400 text-lg">
            Stay updated and register for the latest events in your university.
          </p>

          <a
            href="/student/events/registered"
            className="mt-6 inline-block px-6 py-2 border border-white/20 rounded-md text-sm text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            View My Registered Events →
          </a>
        </div>

        {/* === Events List === */}
        {events.length > 0 ? (
          <div className="space-y-10">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const isEventEnded = eventDate < new Date();
              
              return (
              <div
                key={event.event_id}
                className="border-t border-white/10 pt-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {event.event_name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {event.location} •{" "}
                      {eventDate.toDateString()}
                      {isEventEnded && (
                        <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-md">
                          Event Ended
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRegister(event.event_id)}
                    disabled={registeringEvent === event.event_id || event.isRegistered || isEventEnded}
                    className={`mt-4 sm:mt-0 px-5 py-2 border rounded-md text-sm transition-all duration-200 ${
                      event.isRegistered 
                        ? 'border-green-500 text-green-500 cursor-default' 
                        : isEventEnded
                          ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                          : registeringEvent === event.event_id
                            ? 'border-gray-500 text-gray-500 cursor-wait'
                            : 'border-white/20 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {event.isRegistered 
                      ? 'Registered'
                      : isEventEnded
                        ? 'Event Ended'
                        : registeringEvent === event.event_id 
                          ? 'Registering...'
                        : 'Register'}
                  </button>
                </div>

                {event.description && (
                  <p className="text-gray-300 mt-4 leading-relaxed max-w-3xl">
                    {event.description}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            No upcoming events available.
          </p>
        )}

        {/* === Pagination Controls === */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                pagination.hasPrevPage
                  ? 'border border-white/20 text-white hover:bg-white hover:text-black'
                  : 'border border-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            
            <span className="text-gray-400 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                pagination.hasNextPage
                  ? 'border border-white/20 text-white hover:bg-white hover:text-black'
                  : 'border border-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
