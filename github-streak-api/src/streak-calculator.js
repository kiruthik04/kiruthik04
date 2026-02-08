function calculateStreak(user) {
    const calendar = user.contributionsCollection.contributionCalendar;
    const totalContributions = calendar.totalContributions;
    const weeks = calendar.weeks;

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakStart = null;
    let currentStreakEnd = null;
    let longestStreakStart = null;
    let longestStreakEnd = null;

    // Flatten weeks into a single array of days
    const days = [];
    weeks.forEach((week) => {
        week.contributionDays.forEach((day) => {
            days.push(day);
        });
    });

    // Calculate streaks
    let tempStreak = 0;
    let tempStreakStart = null;
    let tempStreakEnd = null;

    // We need to iterate and find streaks. 
    // IMPORTANT: The calendar might handle "today" differently depending on timezone if we just look at the last day.
    // But typically the last day in the list is today or close to it.

    // Sort days just in case, though they should be sorted
    days.sort((a, b) => new Date(a.date) - new Date(b.date));

    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < days.length; i++) {
        const day = days[i];

        if (day.contributionCount > 0) {
            if (tempStreak === 0) {
                tempStreakStart = day.date;
            }
            tempStreak++;
            tempStreakEnd = day.date;

            // Check if this is the longest streak so far
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
                longestStreakStart = tempStreakStart;
                longestStreakEnd = tempStreakEnd;
            }
        } else {
            // Reset temp streak
            tempStreak = 0;
            tempStreakStart = null;
            tempStreakEnd = null;
        }
    }

    // Calculate Current Streak specially
    // Current streak is defined as a streak that includes "today" OR "yesterday" (if today has no contributions yet).
    // Iterate backwards to find the current active streak.
    let activeStreak = 0;
    let activeStreakStart = null;
    let activeStreakEnd = null;

    // Check from the last day backwards
    // If the last day has contributions, potential current streak.
    // If the last day has NO contributions, check yesterday. If yesterday has contributions, potential current streak.
    // If neither, current streak consists of 0 days.

    // Find index of today or the last available day
    let lastDayIndex = days.length - 1;
    const lastDay = days[lastDayIndex];

    // Check if the list actually includes "today". Sometimes GitHub API returns until "Saturday" of the current week.
    // We'll trust the list end for now.

    let isStreakActive = false;

    // Check if we have contributions today
    if (lastDay.contributionCount > 0) {
        isStreakActive = true;
        activeStreakEnd = lastDay.date;
    } else {
        // Check yesterday
        const yesterdayIndex = lastDayIndex - 1;
        if (yesterdayIndex >= 0 && days[yesterdayIndex].contributionCount > 0) {
            isStreakActive = true;
            activeStreakEnd = days[yesterdayIndex].date;
            // Start counting from yesterday
            lastDayIndex = yesterdayIndex;
        }
    }

    if (isStreakActive) {
        for (let i = lastDayIndex; i >= 0; i--) {
            if (days[i].contributionCount > 0) {
                activeStreak++;
                activeStreakStart = days[i].date;
            } else {
                break;
            }
        }
    }

    // Format dates
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g., Feb 8
    };

    // Year for context if needed, but SVG example shows "Jun 24, 2025 - Feb 8"
    const formatDateWithYear = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }


    return {
        totalContributions,
        currentStreak: activeStreak,
        currentStreakRange: `${formatDateWithYear(activeStreakStart)} - ${formatDate(activeStreakEnd)}`, // Adding year to start for clarity
        longestStreak,
        longestStreakRange: `${formatDateWithYear(longestStreakStart)} - ${formatDate(longestStreakEnd)}`,
    };
}

module.exports = { calculateStreak };
