// timeVoteUtils.js

/**
 * 특정 시간 범위의 슬롯만 생성 (30분 단위)
 * @param {number} startHour - 시작 시간 (기본: 0)
 * @param {number} endHour - 종료 시간 (기본: 24)
 */
export const getTimeSlots = (startHour = 0, endHour = 24) => {
  const slots = [];
  // ✅ endHour를 포함하도록 수정 (< 대신 <=)
  for (let hour = startHour; hour <= endHour; hour++) {
    // 마지막 시간(endHour)일 때는 :00만 추가
    if (hour === endHour) {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
    } else {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
  }
  return slots;
};

/**
 * 선택된 슬롯들을 API에 전송할 형식으로 변환
 * @param {string[]} selectedSlots - ['2025-01-15_09:00', '2025-01-15_09:30', ...]
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
    //  시간 형식 정규화 (이미 초가 포함되어 있으면 제거)
    const normalizedTime = time.split(":").slice(0, 2).join(":"); // "09:00:00:00" → "09:00"
    dateMap[date].push(normalizedTime);
  });

  // 연속된 시간을 interval로 변환
  return Object.keys(dateMap).map((date) => {
    const times = dateMap[date].sort();
    const intervals = [];
    let startTime = null;

    times.forEach((time, index) => {
      if (!startTime) {
        startTime = time; // "09:00" (HH:mm 형식)
      }

      const nextTime = times[index + 1];

      // 현재 시간과 다음 시간의 차이 계산 (분 단위)
      const [currentHour, currentMinute] = time.split(":").map(Number);
      const currentMinutes = currentHour * 60 + currentMinute;

      const nextMinutes = nextTime
        ? (() => {
            const [nextHour, nextMinute] = nextTime.split(":").map(Number);
            return nextHour * 60 + nextMinute;
          })()
        : null;

      // 30분 단위로 연속성 체크
      if (!nextTime || nextMinutes - currentMinutes > 30) {
        // 종료 시간 계산 (+30분)
        const [hour, minute] = time.split(":").map(Number);
        const endTotalMinutes = hour * 60 + minute + 30;
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;

        //  HH:mm:ss 형식으로 변환
        const formattedStartTime = `${startTime}:00`;
        const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(
          endMinute
        ).padStart(2, "0")}:00`;

        intervals.push({
          startTime: formattedStartTime,
          endTime: formattedEndTime,
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
