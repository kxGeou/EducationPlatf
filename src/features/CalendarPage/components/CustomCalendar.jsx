import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomCalendar({ 
  events = [], 
  onEventClick,
  onDateClick,
  onTimeSlotClick,
  selectable = false,
  onSelect,
  initialDate = null
}) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [selectedRange, setSelectedRange] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  
  // Update currentDate when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(new Date(initialDate));
    }
  }, [initialDate]);

  // Get Monday of current week
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const monday = getMonday(currentDate);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    weekDays.push(day);
  }

  // Generate time slots (8:00 to 20:00, 30 min intervals)
  const timeSlots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push({
        hour,
        minute,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
    }
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get first day of month and all days in month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const monthDays = getMonthDays();
  
  // Get events for a specific date (for month view)
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = getDateString(date);
    return events.filter(event => {
      if (event.start) {
        const eventDate = event.start.split('T')[0];
        return eventDate === dateStr;
      }
      return false;
    });
  };

  const formatDateHeader = (date) => {
    const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('pl-PL', { month: 'short' });
    return `${dayName}, ${day} ${month}`;
  };

  const getDateString = (date) => {
    // Format date as YYYY-MM-DD in local timezone to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEventsForSlot = (date, timeSlot) => {
    const dateStr = getDateString(date);
    const slotTime = timeSlot.time;
    
    return events.filter(event => {
      if (event.start && event.end) {
        const eventDate = event.start.split('T')[0];
        const eventStart = event.start.split('T')[1]?.substring(0, 5);
        const eventEnd = event.end.split('T')[1]?.substring(0, 5);
        
        if (eventDate === dateStr) {
          // Check if this time slot is within the event
          // Convert times to minutes for easier comparison
          const slotMinutes = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);
          const eventStartMinutes = parseInt(eventStart.split(':')[0]) * 60 + parseInt(eventStart.split(':')[1]);
          const eventEndMinutes = parseInt(eventEnd.split(':')[0]) * 60 + parseInt(eventEnd.split(':')[1]);
          
          // Check if slot overlaps with event (slot starts before event ends and slot ends after event starts)
          // Since each slot is 30 minutes, slot ends at slotMinutes + 30
          return slotMinutes < eventEndMinutes && (slotMinutes + 30) > eventStartMinutes;
        }
      }
      return false;
    });
  };
  
  // Get events that should be rendered at this specific slot (events that start in this slot)
  const getEventsToRenderAtSlot = (date, timeSlot) => {
    const dateStr = getDateString(date);
    const slotTime = timeSlot.time;
    
    // Debug: log all events for this date
    const eventsForDate = events.filter(event => {
      if (!event.start) return false;
      const eventDate = event.start.split('T')[0];
      return eventDate === dateStr;
    });
    
    if (eventsForDate.length > 0 && slotTime === '08:00') {
      console.log('Events for date:', dateStr, eventsForDate.map(e => ({ 
        title: e.title, 
        start: e.start, 
        end: e.end,
        type: e.extendedProps?.type 
      })));
    }
    
    const filteredEvents = events.filter(event => {
      if (!event.start || !event.end) {
        return false;
      }
      
      // Extract date and time from event.start (format: YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm)
      const eventDate = event.start.split('T')[0];
      const eventTimePart = event.start.split('T')[1];
      if (!eventTimePart) {
        return false;
      }
      
      // Extract time (HH:mm) - handle both HH:mm:ss and HH:mm formats
      const eventStart = eventTimePart.substring(0, 5);
      
      // Compare dates (both should be in YYYY-MM-DD format)
      if (eventDate !== dateStr) {
        return false;
      }
      
      // Convert times to minutes for easier comparison
      const slotMinutes = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);
      const eventStartMinutes = parseInt(eventStart.split(':')[0]) * 60 + parseInt(eventStart.split(':')[1]);
      
      // Render event only at the slot where it starts (slot that contains the start time)
      // Check if event starts in this slot (slotMinutes <= eventStartMinutes < slotMinutes + 30)
      const matches = slotMinutes <= eventStartMinutes && eventStartMinutes < slotMinutes + 30;
      
      // Debug: log all comparisons for events on this date
      if (eventsForDate.length > 0 && slotTime === '08:00') {
        console.log('Time slot comparisons:', {
          dateStr,
          slotTime,
          slotMinutes,
          events: eventsForDate.map(e => {
            const eTime = e.start.split('T')[1]?.substring(0, 5);
            const eMinutes = parseInt(eTime.split(':')[0]) * 60 + parseInt(eTime.split(':')[1]);
            return {
              title: e.title,
              eventStart: eTime,
              eventStartMinutes: eMinutes,
              matches: slotMinutes <= eMinutes && eMinutes < slotMinutes + 30
            };
          })
        });
      }
      
      if (matches) {
        console.log('Event matches slot:', { 
          eventTitle: event.title, 
          eventStart, 
          slotTime, 
          eventDate, 
          dateStr,
          slotMinutes,
          eventStartMinutes
        });
      }
      
      return matches;
    });
    
    return filteredEvents;
  };

  const handleSlotMouseDown = (date, timeSlot, e) => {
    if (!selectable) return;
    e.preventDefault();
    setIsSelecting(true);
    const start = new Date(date);
    start.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    setSelectedRange({ start, end: null });
  };

  const handleSlotMouseEnter = (date, timeSlot) => {
    if (!isSelecting || !selectedRange) return;
    const end = new Date(date);
    end.setHours(timeSlot.hour, timeSlot.minute + 30, 0, 0);
    setSelectedRange({ ...selectedRange, end });
  };

  const handleSlotMouseUp = () => {
    if (isSelecting && selectedRange && selectedRange.end && onSelect) {
      onSelect({
        start: selectedRange.start,
        end: selectedRange.end
      });
    }
    setIsSelecting(false);
    setSelectedRange(null);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting) {
        handleSlotMouseUp();
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isSelecting, selectedRange]);

  const isSlotInSelectedRange = (date, timeSlot) => {
    if (!selectedRange || !selectedRange.end) return false;
    const slotTime = new Date(date);
    slotTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    return slotTime >= selectedRange.start && slotTime < selectedRange.end;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="w-full bg-white dark:bg-DarkblackBorder rounded shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-DarkblackText">
        <div className="flex items-center gap-2">
          <button
            onClick={viewMode === 'week' ? goToPreviousWeek : goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={viewMode === 'week' ? goToNextWeek : goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded transition"
          >
            dzisiaj
          </button>
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {viewMode === 'week' 
            ? `${weekDays[0].toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} - ${weekDays[6].toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
          }
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition ${
              viewMode === 'week'
                ? 'bg-primaryBlue dark:bg-primaryGreen text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText'
            }`}
          >
            Tydzień
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition ${
              viewMode === 'month'
                ? 'bg-primaryBlue dark:bg-primaryGreen text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText'
            }`}
          >
            Miesiąc
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        {viewMode === 'week' ? (
          <div className="min-w-full" style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)' }}>
          {/* Empty corner */}
          <div className="border-r border-b border-gray-200 dark:border-DarkblackText bg-gray-50 dark:bg-DarkblackText/50"></div>

          {/* Day headers */}
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`border-r border-b border-gray-200 dark:border-DarkblackText p-3 text-center font-semibold ${
                isToday(day)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 dark:bg-DarkblackText/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="text-sm">{formatDateHeader(day)}</div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((timeSlot, slotIdx) => (
            <div key={slotIdx} style={{ display: 'contents' }}>
              {/* Time label */}
              {slotIdx % 2 === 0 && (
                <div className="border-r border-b border-gray-200 dark:border-DarkblackText bg-gray-50 dark:bg-DarkblackText/50 p-2 text-xs text-gray-600 dark:text-gray-400 text-right pr-3">
                  {timeSlot.time}
                </div>
              )}
              {slotIdx % 2 !== 0 && (
                <div className="border-r border-b border-gray-200 dark:border-DarkblackText bg-gray-50 dark:bg-DarkblackText/50"></div>
              )}

              {/* Day cells */}
              {weekDays.map((day, dayIdx) => {
                const dateStr = getDateString(day);
                // Get events that should be rendered at this slot (events that start in this slot)
                // Check all slots, not just even ones, because events can start at :30 minutes
                const slotEvents = getEventsToRenderAtSlot(day, timeSlot);
                const isSelected = isSlotInSelectedRange(day, timeSlot);
                const isCurrentSlot = isToday(day) && timeSlot.time === new Date().toTimeString().substring(0, 5);

                return (
                  <div
                    key={`${dayIdx}-${slotIdx}`}
                    className={`border-r border-b border-gray-200 dark:border-DarkblackText relative ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : isCurrentSlot
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : 'bg-white dark:bg-DarkblackBorder hover:bg-gray-50 dark:hover:bg-DarkblackText/50'
                    } ${selectable ? 'cursor-pointer' : ''}`}
                    style={{ minHeight: '30px', position: 'relative' }}
                    onMouseDown={(e) => {
                      // Don't trigger if clicking on an event
                      if (e.target.closest('[data-event]')) {
                        return;
                      }
                      handleSlotMouseDown(day, timeSlot, e);
                    }}
                    onMouseEnter={() => handleSlotMouseEnter(day, timeSlot)}
                    onClick={(e) => {
                      // Don't trigger if clicking on an event
                      if (e.target.closest('[data-event]')) {
                        return;
                      }
                      if (onTimeSlotClick) {
                        onTimeSlotClick(day, timeSlot);
                      }
                    }}
                  >
                    {/* Events - render events that start in this slot */}
                    {slotEvents.length > 0 && (
                      <>
                        {slotEvents.map((event, eventIdx) => {
                          // Calculate height and position based on exact start/end times
                          const eventStart = event.start.split('T')[1]?.substring(0, 5);
                          const eventEnd = event.end.split('T')[1]?.substring(0, 5);
                          
                          // Convert to minutes
                          const eventStartMinutes = parseInt(eventStart.split(':')[0]) * 60 + parseInt(eventStart.split(':')[1]);
                          const eventEndMinutes = parseInt(eventEnd.split(':')[0]) * 60 + parseInt(eventEnd.split(':')[1]);
                          const slotMinutes = parseInt(timeSlot.time.split(':')[0]) * 60 + parseInt(timeSlot.time.split(':')[1]);
                          
                          // Calculate duration in minutes
                          const durationMinutes = eventEndMinutes - eventStartMinutes;
                          
                          // Calculate offset from slot start (in pixels, each minute = 1px since slot is 30px for 30 minutes)
                          const offsetFromSlotStart = (eventStartMinutes - slotMinutes) * (30 / 30); // 1px per minute
                          
                          // Calculate height in pixels (each minute = 1px)
                          const heightPx = Math.max(24, durationMinutes * (30 / 30)); // 1px per minute, min 24px

                          // Special handling for overlap events (green with user count)
                          const isOverlap = event.extendedProps?.type === 'overlap';
                          const userCount = isOverlap ? event.extendedProps?.overlap?.user_count : null;
                          const isWebinar = event.extendedProps?.isWebinar === true;

                          return (
                            <div
                              key={eventIdx}
                              data-event="true"
                              className={`rounded-sm px-2 py-1 text-xs font-medium text-white cursor-pointer overflow-hidden transition-all ${
                                isWebinar ? 'shadow-lg hover:shadow-xl animate-pulse' : ''
                              }`}
                              style={{
                                backgroundColor: event.backgroundColor || '#fbbf24',
                                borderColor: event.borderColor || '#f59e0b',
                                borderWidth: event.borderWidth || '1px',
                                borderStyle: 'solid',
                                height: `${heightPx}px`,
                                minHeight: '24px',
                                position: 'absolute',
                                top: `${2 + offsetFromSlotStart}px`,
                                left: '2px',
                                right: '2px',
                                zIndex: isWebinar ? 20 : 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isOverlap ? 'center' : 'flex-start',
                                boxShadow: isWebinar ? '0 4px 12px rgba(249, 115, 22, 0.4)' : 'none'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (onEventClick) {
                                  onEventClick(event);
                                }
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              {isOverlap && userCount ? (
                                <div className="text-center w-full">
                                  <div className="font-bold text-base">{userCount}</div>
                                  <div className="text-xs opacity-75">użytkowników</div>
                                </div>
                              ) : (
                                <div className="truncate w-full">{event.title}</div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        ) : (
          // Month view
          <div className="min-w-full">
            {/* Day names header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-DarkblackText">
              {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map((dayName, idx) => (
                <div
                  key={idx}
                  className="p-3 text-center font-semibold text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-DarkblackText/50 border-r border-gray-200 dark:border-DarkblackText last:border-r-0"
                >
                  {dayName}
                </div>
              ))}
            </div>
            
            {/* Calendar days grid */}
            <div className="grid grid-cols-7">
              {monthDays.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[100px] border-r border-b border-gray-200 dark:border-DarkblackText bg-gray-50 dark:bg-DarkblackText/20"
                    />
                  );
                }
                
                const dayEvents = getEventsForDate(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-r border-b border-gray-200 dark:border-DarkblackText p-2 ${
                      isCurrentDay
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-white dark:bg-DarkblackBorder'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, eventIdx) => {
                        const isOverlap = event.extendedProps?.type === 'overlap';
                        const userCount = isOverlap ? event.extendedProps?.overlap?.user_count : null;
                        const isWebinar = event.extendedProps?.isWebinar === true;
                        const startTime = event.start ? new Date(event.start).toTimeString().substring(0, 5) : '';
                        
                        return (
                          <div
                            key={eventIdx}
                            data-event="true"
                            className={`text-xs px-2 py-1 rounded-sm cursor-pointer truncate text-white ${
                              isWebinar ? 'shadow-md font-bold' : ''
                            }`}
                            style={{
                              backgroundColor: event.backgroundColor || '#fbbf24',
                              borderColor: event.borderColor || '#f59e0b',
                              borderWidth: event.borderWidth || '1px',
                              borderStyle: 'solid',
                              boxShadow: isWebinar ? '0 2px 8px rgba(249, 115, 22, 0.3)' : 'none'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (onEventClick) {
                                onEventClick(event);
                              }
                            }}
                            title={event.title}
                          >
                            {isOverlap && userCount ? (
                              <span>{userCount} użytkowników</span>
                            ) : (
                              <span>{startTime} {event.title}</span>
                            )}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                          +{dayEvents.length - 3} więcej
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

