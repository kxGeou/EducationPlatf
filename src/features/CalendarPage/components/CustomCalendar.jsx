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
    return date.toISOString().split('T')[0];
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
          // For the first slot of the event, we need to check if slotTime matches eventStart
          // For subsequent slots, we check if slotTime is between eventStart and eventEnd
          return slotTime >= eventStart && slotTime < eventEnd;
        }
      }
      return false;
    });
  };
  
  // Get events that start at this specific slot
  const getEventsStartingAtSlot = (date, timeSlot) => {
    const dateStr = getDateString(date);
    const slotTime = timeSlot.time;
    
    return events.filter(event => {
      if (event.start && event.end) {
        const eventDate = event.start.split('T')[0];
        const eventStart = event.start.split('T')[1]?.substring(0, 5);
        
        return eventDate === dateStr && eventStart === slotTime;
      }
      return false;
    });
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
                const slotEvents = slotIdx % 2 === 0 ? getEventsStartingAtSlot(day, timeSlot) : [];
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
                    {/* Events - only render on even slots (hourly) and only events that start here */}
                    {slotIdx % 2 === 0 && slotEvents.length > 0 && (
                      <>
                        {slotEvents.map((event, eventIdx) => {
                          // Calculate height (number of 30-min slots)
                          const startTime = new Date(event.start);
                          const endTime = new Date(event.end);
                          const durationMinutes = (endTime - startTime) / (1000 * 60);
                          const heightSlots = Math.max(1, durationMinutes / 30);
                          // Each slot is 30px, so height in pixels
                          const heightPx = heightSlots * 30;

                          // Special handling for overlap events (green with user count)
                          const isOverlap = event.extendedProps?.type === 'overlap';
                          const userCount = isOverlap ? event.extendedProps?.overlap?.user_count : null;

                          return (
                            <div
                              key={eventIdx}
                              data-event="true"
                              className="rounded-sm px-2 py-1 text-xs font-medium text-white cursor-pointer overflow-hidden"
                              style={{
                                backgroundColor: event.backgroundColor || '#fbbf24',
                                borderColor: event.borderColor || '#f59e0b',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                height: `${heightPx}px`,
                                minHeight: '24px',
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                right: '2px',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isOverlap ? 'center' : 'flex-start'
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
                        const startTime = event.start ? new Date(event.start).toTimeString().substring(0, 5) : '';
                        
                        return (
                          <div
                            key={eventIdx}
                            data-event="true"
                            className="text-xs px-2 py-1 rounded-sm cursor-pointer truncate text-white"
                            style={{
                              backgroundColor: event.backgroundColor || '#fbbf24',
                              borderColor: event.borderColor || '#f59e0b',
                              borderWidth: '1px',
                              borderStyle: 'solid'
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

