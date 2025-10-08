import React from "react";

const ScheduleList = ({ className = "" }) => {
  const [schedules, setSchedules] = React.useState([
    //확인용 데이터 하드코딩
    {
      id: 1,
      title: "회의",
      startTime: "2025-07-21T10:00:00",
      endTime: "2025-07-21T11:00:00",
      category: "업무",
      place: "집",
    },
    {
      id: 2,
      title: "점심 약속",
      startTime: "2025-07-21T12:00:00",
      endTime: "2025-07-21T13:00:00",
      category: "사교",
      place: "블루샹하이",
    },
    {
      id: 3,
      title: "노트북 수리",
      startTime: "2025-07-21T15:00:00",
      endTime: "2025-07-21T16:00:00",
      category: "업무",
      place: "LG BEST care 서비스센터",
    },
    {
      id: 4,
      title: "노트북 수리",
      startTime: "2025-07-21T15:00:00",
      endTime: "2025-07-21T16:00:00",
      category: "업무",
      place: "LG BEST care 서비스센터",
    },
    {
      id: 5,
      title: "노트북 수리",
      startTime: "2025-07-21T15:00:00",
      endTime: "2025-07-21T16:00:00",
      category: "업무",
      place: "LG BEST care 서비스센터",
    },
    {
      id: 6,
      title: "노트북 수리",
      startTime: "2025-07-21T15:00:00",
      endTime: "2025-07-21T16:00:00",
      category: "업무",
      place: "LG BEST care 서비스센터",
    },
  ]);
  {
    /*여기에 들어있는 시간이랑 날짜 등도 활용가능해야됨 */
  }

  return (
    <div className={`p-2 overflow-y-auto ${className}`}>
      {schedules.map((schedule) => (
        <div key={schedule.id} className="p-3 bg-rose-400">
          {schedule.title} {schedule.place}
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;
