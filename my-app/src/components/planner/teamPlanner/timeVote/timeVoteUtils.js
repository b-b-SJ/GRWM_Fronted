// timeVoteUtils.js

/**
 * 0시부터 23시까지의 시간 슬롯 배열 생성
 */
export const getTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
  }
  return slots;
};

/**
 * 선택된 슬롯들을 API에 전송할 형식으로 변환
 * @param {string[]} selectedSlots - ['2025-01-15_09:00', '2025-01-15_10:00', ...]
 * @returns {AvailableDateTimeDto[]}
 */
export const convertSlotsToDto = (selectedSlots) => {
  // 날짜별로 그룹화
  const dateMap = {};

  selectedSlots.forEach((slotKey) => {
    const [date, time] = slotKey.split("_");
    if (!dateMap[date]) {
      dateMap[date] = [];
    }
    dateMap[date].push(time);
  });

  // 연속된 시간을 interval로 변환
  return Object.keys(dateMap).map((date) => {
    const times = dateMap[date].sort();
    const intervals = [];
    let startTime = null;

    times.forEach((time, index) => {
      if (!startTime) {
        startTime = time;
      }

      const nextTime = times[index + 1];
      const currentMinutes =
        parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
      const nextMinutes = nextTime
        ? parseInt(nextTime.split(":")[0]) * 60 +
          parseInt(nextTime.split(":")[1])
        : null;

      // 다음 시간이 없거나 연속되지 않으면 interval 종료
      if (!nextTime || nextMinutes - currentMinutes > 60) {
        const endHour = parseInt(time.split(":")[0]) + 1;
        const endTime = `${String(endHour).padStart(2, "0")}:00`;

        intervals.push({
          startTime: startTime,
          endTime: endTime,
        });
        startTime = null;
      }
    });

    return {
      date: date,
      intervals: intervals,
    };
  });
};

/**
 * 득표율에 따른 색상 클래스 반환
 * @param {number} percentage - 득표율 (0-100)
 * @returns {string} Tailwind CSS 클래스
 */
export const getColorByPercentage = (percentage) => {
  if (percentage === 0) return "bg-gray-100";
  if (percentage < 30) return "bg-green-200";
  if (percentage < 60) return "bg-green-400";
  if (percentage < 90) return "bg-green-600";
  return "bg-green-800 text-white";
};
