import React, { useState } from "react";
import { Square, Check, EllipsisVertical, Plus } from "lucide-react";

const TodoList = ({ className = "" }) => {
  const [todos, setTodos] = useState([
    {
      id: 1,
      title: "이거 구현을 끝내기..",
      completed: false,
      createdDate: "2025-07-21",
      dueDate: "2025-08-11",
      category: "졸프",
      priority: "high",
    },
    {
      id: 2,
      title: "갱썬이랑 밥묵기",
      completed: false,
      createdDate: "2025-07-21",
      dueDate: "2025-07-21",
      category: "사교",
      priority: "mid",
    },
    {
      id: 3,
      title: "오늘은 일찍 자야지",
      completed: false,
      createdDate: "2025-07-21",
      dueDate: "2025-07-21",
      category: "건강",
      priority: "low",
    },
    {
      id: 4,
      title: "물 2L 마시기",
      completed: true,
      createdDate: "2025-07-21",
      dueDate: "2025-07-21",
      category: "건강",
      priority: "low",
    },
    {
      id: 5,
      title: "신사역에서 다인이랑 곱창에 소주 크으~~~~~~~~~~~",
      completed: false,
      createdDate: "2025-07-22",
      dueDate: "2025-07-23",
      category: "사교",
      priority: "mid",
    },
    {
      id: 6,
      title: "택배부치기",
      completed: false,
      createdDate: "2025-07-22",
      dueDate: "2025-07-23",
      category: "장사",
      priority: "mid",
    },
    {
      id: 7,
      title: "오픽 시험 again",
      completed: false,
      createdDate: "2025-07-26",
      dueDate: "2025-07-26",
      category: "공부",
      priority: "mid",
    },
  ]);
  const [todoActionMenuOpen, setTodoActionMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  //오늘 일에 대한 데이터가 넘치면 overflow-y?로 처리? 아니면 그냥 더보기?
  return (
    <div>
      {/*<h2 className="text-lg font-bold">Todo List </h2>*/}
      <div className={` overflow-y-auto ${className}`}>
        <ul className="">
          {todos.map((todo) => (
            <li
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              className="p-2 group text-md flex items-center hover:bg-gray-100"
              //할 일 사이 간격 조절을 좀 하고 시픔
            >
              <div className=" flex pr-2">
                {todo.completed ? (
                  //크기 안 맞는거 너무 열받음..........
                  <Check
                    size={14.5}
                    className="text-white bg-green-500 rounded-sm"
                  />
                ) : (
                  <Square size={16} className="" />
                )}
              </div>
              <span
                className={`truncate block max-w-full ${
                  todo.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {todo.title}
              </span>
              {/**케밥-> 아직 눌러도 뭐 안됨 */}
              <EllipsisVertical
                size={15}
                onClick
                className="flex-shrink-0 ml-auto hidden group-hover:block opacity-100" //shrink-0로 크기 고정
              />
            </li>
          ))}
        </ul>
      </div>
      <button className="text-sm font-normal justify-end">
        <Plus size={16} className="inline mr-1" />
        할일 추가하기
      </button>
      <div>{/* AddTodo 팝업 열어야됨 */}</div>
    </div>
  );
};

export default TodoList;
