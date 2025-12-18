// Utility functions for time preferences

/**
 * Format time range for display
 */
export const formatTimeRange = (startTime, endTime) => {
  const formatTime = (time) => {
    if (typeof time === 'string') {
      return time.substring(0, 5); // HH:MM
    }
    return time;
  };
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Group preferences by date
 */
export const groupPreferencesByDate = (preferences) => {
  const grouped = {};
  preferences.forEach((pref) => {
    if (!grouped[pref.date]) {
      grouped[pref.date] = [];
    }
    grouped[pref.date].push(pref);
  });
  return grouped;
};

/**
 * Filter preferences by label
 */
export const filterPreferencesByLabel = (preferences, labelId) => {
  if (!labelId) return preferences;
  return preferences.filter((pref) => pref.label_id === labelId);
};

/**
 * Calculate overlapping slots in JavaScript (alternative to SQL function)
 */
export const calculateOverlappingSlots = (preferences) => {
  const overlaps = [];
  const processed = new Set();

  for (let i = 0; i < preferences.length; i++) {
    for (let j = i + 1; j < preferences.length; j++) {
      const pref1 = preferences[i];
      const pref2 = preferences[j];

      // Skip if same user
      if (pref1.user_id === pref2.user_id) continue;

      // Skip if different dates
      if (pref1.date !== pref2.date) continue;

      // Check if time ranges overlap
      const start1 = pref1.start_time;
      const end1 = pref1.end_time;
      const start2 = pref2.start_time;
      const end2 = pref2.end_time;

      if (start1 < end2 && end1 > start2) {
        // Calculate overlap
        const overlapStart = start1 > start2 ? start1 : start2;
        const overlapEnd = end1 < end2 ? end1 : end2;

        const key = `${pref1.date}_${overlapStart}_${overlapEnd}`;
        if (!processed.has(key)) {
          processed.add(key);

          // Find all preferences that overlap with this time slot
          const overlappingPrefs = preferences.filter((p) => {
            if (p.date !== pref1.date) return false;
            if (p.user_id === pref1.user_id || p.user_id === pref2.user_id) return true;
            return p.start_time < overlapEnd && p.end_time > overlapStart;
          });

          overlaps.push({
            date: pref1.date,
            start_time: overlapStart,
            end_time: overlapEnd,
            user_count: new Set(overlappingPrefs.map((p) => p.user_id)).size,
            user_ids: [...new Set(overlappingPrefs.map((p) => p.user_id))],
            label_ids: [...new Set(overlappingPrefs.map((p) => p.label_id).filter(Boolean))]
          });
        }
      }
    }
  }

  return overlaps.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};









